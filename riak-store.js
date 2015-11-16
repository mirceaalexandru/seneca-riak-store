/* jslint node: true */
/* jslint asi: true */
/* Copyright (c) 2013 Mircea Alexandru */
"use strict";

var _ = require('lodash');
var Riak = require('basho-riak-client')
var KV = Riak.Commands.KV
var UUID = require('node-uuid');

var util = require('./lib/util')

var name = 'riak-store';
var ERARO = require('eraro')({package: name})

module.exports = function (opts) {
  var seneca = this
  var internals = {
    opts: opts
  }

  function configure (spec, done) {
    internals.dbinst = new Riak.Client(spec.nodes)
    done()
  }


  var store = {
    name: name,

    close: function (done) {
      seneca.log(name, 'instance closed')
      done()
    },

    save: function (args, done) {
      var ent = args.ent
      ent = ent.clone$(ent)

      if (!ent.id) {
        if (ent.id$) {
          ent.id = ent.id$
          delete ent.id$
        }
      }

//      if (!ent.id) {
//        ent.id = UUID()
//      }

      var query = savestm(ent)

      var storeValue = new KV.StoreValue.Builder()
        .withBucket(query.bucket)
        .withKey(query.id)
        .withContent(query.value)
        .withCallback(function (err, data) {
          if (err) {
            seneca.log.error({code: 'save', tag: args.tag$, store: store.name, query: query, error: err})
            return done(ERARO({code: 'save', tag: args.tag$, store: store.name, query: query, error: err}))
          }

          var id = ent.id || data.generatedKey

          ent.load$({id: id}, function (err, data) {
            seneca.log(args.tag$, 'save', data)
            done(null, data)
          })
        })
        .build()
      internals.dbinst.execute(storeValue)
    },


    load: function (args, done) {
      var qent = args.qent
      var q = args.q

      var query = selectstm(qent, q)

      var fetchValue = new KV.FetchValue.Builder()
        .withBucket(query.bucket)
        .withKey(query.id)
        .withCallback(function (err, data) {
          if (err) {
            seneca.log.error({code: 'load', tag: args.tag$, store: store.name, query: query, meta: meta, error: err})
            return done(ERARO({code: 'load', tag: args.tag$, store: store.name, query: query, meta: meta, error: err}))
          }

          var ent = qent.make$(row)
          ent.id = query.id
          seneca.log(args.tag$, 'load', ent)
          done(null, ent)
        })
        .build()
      internals.dbinst.execute(fetchValue)
    },


    list: function (args, done) {
      throw new ERARO({code: 'list', tag: args.tag$, error: 'not implemented'})
      done(new ERARO({code: 'list', tag: args.tag$, error: 'not implemented'}))
    },


    remove: function (args, done) {
      var qent = args.qent
      var q = _.clone(args.q)

      if (q.all$) {
        seneca.fail({code: 'remove', tag: args.tag$, store: store.name, error: 'remove all not implemented'}, done)
      }
      else {
        var query = selectstm(qent, q)


        var deleteValue = new KV.DeleteValue.Builder()
          .withBucket(query.bucket)
          .withKey(query.id)
          .withCallback(function (err, data) {
            if (err) {
              seneca.fail({code: 'remove', tag: args.tag$, store: store.name, query: query, error: err}, done)
            }
            else {
              return done(err)
            }
          })
          .build()
        internals.dbinst.execute(deleteValue)
      }
    },

    native: function (args, done) {
      done(null, internals.dbinst)
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

  var meta = seneca.store.init(seneca, opts, store)
  internals.desc = meta.desc

  seneca.add({init: store.name, tag: meta.tag}, function (args, done) {
    configure(internals.opts, done)
  })

  return { name: store.name, tag: meta.tag }
}

