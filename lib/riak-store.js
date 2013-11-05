/*jslint node: true*/
/*jslint asi: true */
/* Copyright (c) 2013 Mircea Alexandru */
"use strict";

var _ = require('underscore');
var RiakClient = require('riak-js');
var uuid = require('node-uuid');

var util = require('./util')

var name = 'riak-store';

module.exports = function (seneca, opts, cb) {

  var desc;

  var dbinst = null
  var specifications = null


  function error(args, err, cb) {
    if (err) {
      seneca.log.debug('error: ' + err)
      return true
    }

    return false
  }

  function configure(spec, cb) {
    specifications = spec

    var server = spec.server
    var port = spec.port

    dbinst = RiakClient.getClient({server:server, port:port});
  }


  var store = {
    name: name,

    close: function (cb) {
    },

    save: function (args, cb) {
      var ent = _.clone(args.ent)
      ent.id = ent.id || uuid()

      var query = savestm(ent)

      dbinst.save(query.bucket, query.id, query.value, function (err) {
        if (!error(args, err, cb)) {
          ent.load$({id: query.id}, function(err, data){
            seneca.log(args.tag$, 'save', data)
            cb(null, data)
          })
        }
        else {
          seneca.fail({code: 'save', tag: args.tag$, store: store.name, query: query, error: err}, cb)
        }
      })
    },


    load: function (args, cb) {
      var qent = args.qent
      var q = args.q

      var query = selectstm(qent, q)

      dbinst.get(query.bucket, query.id, function(err, row, meta) {
        if (!error(args, err, cb)) {
          var ent = qent.make$(row)
          ent.id = query.id
          seneca.log(args.tag$, 'load', ent)
          cb(null, ent)
        } else {
          if (meta && 404 == meta.statusCode){
            return cb()
          }
          seneca.fail({code: 'load', tag: args.tag$, store: store.name, query: query, error: err}, cb)
        }
      })
    },


    list: function (args, cb) {
      seneca.fail({code: 'list', tag: args.tag$, error: 'not implemented'}, cb)
    },


    remove: function (args, cb) {
      var qent = args.qent
      var q = _.clone(args.q)

      if (q.all$) {
        seneca.fail({code: 'remove', tag: args.tag$, store: store.name, error: 'remove all not implemented'}, cb)
      } else {
        var query = selectstm(qent, q)
        dbinst.remove(query.bucket, query.id, function (err) {
          if (err){
            seneca.fail({code: 'remove', tag: args.tag$, store: store.name, query: query, error: err}, cb)
          } else {
            return cb(err)
          }
        })
      }
    },

    native: function (args, done) {
      done(null, dbinst)
    }
  }

  var savestm = function (ent) {
    var stm = {}

    stm.bucket = util.getBucketName(ent)
    stm.id = ent.id
    delete ent.id
    stm.value = {}

    var fields = ent.fields$()

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i]
      if (!(_.isUndefined(ent[field]) || _.isNull(ent[field]))) {
        stm.value[field] = ent[field]
      }
    }

    return stm
  }

  var selectstm = function (qent, q) {
    var stm = {}

    stm.bucket = util.getBucketName(qent)
    stm.id = q.id

    return stm
  }

  seneca.store.init(seneca, opts, store, function (err, tag, description) {
    if (err) return cb(err);

    desc = description

    configure(opts, function (err) {
      if (err) {
        return seneca.fail({code: 'entity/configure', store: store.name, error: err}, cb)
      }
      else cb(null, {name: store.name, tag: tag});
    })
  })
}

