'use strict'

var _ = require('lodash')
var Riak = require('basho-riak-client')
var KV = Riak.Commands.KV

var name = 'riak-store'
var ERARO = require('eraro')({package: name})

module.exports = function (opts) {
  var seneca = this
  var internals = {
    opts: opts
  }

  function configure (spec, done) {
    if (!spec || !spec.nodes || !_.isArray(spec.nodes)) {
      return done('Riak options incorrect. Should contain nodes array ["host1:port1", "host2:port2"]')
    }
    internals.dbinst = new Riak.Client(spec.nodes)
    done()
  }


  var store = {
    name: name,

    close: function (args, done) {
      seneca.log(name, 'instance closed')
      done && done()
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

          var id = query.id || data.generatedKey

          ent.load$({id: id}, function (err, data) {
            seneca.log(args.tag$, 'save', data)
            done(err, data)
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
        .withConvertValueToJs(true)
        .withCallback(function (err, data) {
          if (err) {
            seneca.log.error({code: 'load', tag: args.tag$, store: store.name, query: query, meta: meta, error: err})
            return done(ERARO({code: 'load', tag: args.tag$, store: store.name, query: query, meta: meta, error: err}))
          }

          if (data.isNotFound) {
            return done()
          }

          if (data.values && data.values.length > 0) {
            var row = data.values[0].getValue()
            var key = data.values[0].getKey().toString('utf8')
            row = qent.make$(row)
            row.id = key
            seneca.log(args.tag$, 'load', row)
            return done(null, row)
          }
          done()
        })
        .build()
      internals.dbinst.execute(fetchValue)
    },


    list: function (args, done) {
      throw new ERARO({code: 'list', tag: args.tag$, error: 'not implemented'})
    },


    remove: function (args, done) {
      var qent = args.qent
      var q = args.q

      if (q.all$) {
        return done(ERARO({code: 'remove', tag: args.tag$, store: store.name, error: 'remove all not implemented'}))
      }
      var query = selectstm(qent, q)

      var row
      if (q.load$) {
        store.load(args, function (err, db_ent) {
          if (err) {
            return done(ERARO({code: 'remove', tag: args.tag$, store: store.name, query: query, error: err}))
          }
          row = db_ent
          do_remove()
        })
      }
      else {
        do_remove()
      }

      function do_remove () {
        var deleteValue = new KV.DeleteValue.Builder()
          .withBucket(query.bucket)
          .withKey(query.id)
          .withCallback(function (err, data) {
            if (err) {
              return done(ERARO({code: 'remove', tag: args.tag$, store: store.name, query: query, error: err}))
            }
            return done(err, row)
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

    stm.bucket = getBucketName(ent)
    stm.id = ent.id
    delete ent.id

    stm.value = {}

    var fields = ent.fields$()

    for (var i in fields) {
      var field = fields[i]
      if (!(_.isUndefined(ent[field]) || _.isNull(ent[field]))) {
        stm.value[field] = ent[field]
      }
    }

    return stm
  }

  var selectstm = function (qent, q) {
    var stm = {}

    stm.bucket = getBucketName(qent)
    stm.id = q.id || qent.id

    return stm
  }

  var meta = seneca.store.init(seneca, opts, store)
  internals.desc = meta.desc

  seneca.add({init: store.name, tag: meta.tag}, function (args, done) {
    configure(internals.opts, done)
  })

  return { name: store.name, tag: meta.tag }
}

function getBucketName (entity) {
  var canon = entity.canon$({object: true})

  return (canon.base ? canon.base + '_' : '') + canon.name
}
