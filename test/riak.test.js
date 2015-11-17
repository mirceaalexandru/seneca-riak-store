'use strict'

var seneca = require('seneca')
var Assert = require('chai').assert
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var suite = lab.suite
var test = lab.test

var si = seneca({log: 'print'})

si.use(require('..'), {
  nodes: [
    '127.0.0.1:8087'
  ]
})

var scratch = {}

suite('basic test', function () {
  test('save 1 test', function (done) {
    var foo1 = si.make({name$: 'foo'})

    foo1.p1 = 'v1'

    foo1.save$(function (err, foo1) {
      Assert(!err)
      Assert.isNotNull(foo1.id)
      Assert.equal('v1', foo1.p1)
      scratch.foo1 = foo1
      done()
    })
  })

  test('update test', function (done) {
    scratch.foo1.p1 = 'v1x'
    scratch.foo1.p2 = 'v2'
    scratch.foo1.save$(function (err, foo1) {
      Assert(!err)
      Assert.isNotNull(foo1.id)
      Assert.equal('v1x', foo1.p1)
      Assert.equal('v2', foo1.p2)
      scratch.foo1 = foo1
      done()
    })
  })

  test('load test', function (done) {
    scratch.foo1.load$(scratch.foo1.id, function (err, foo1) {
      Assert(!err)
      Assert.isNotNull(foo1.id)
      Assert.equal('v1x', foo1.p1)
      Assert.equal('v2', foo1.p2)
      scratch.foo1 = foo1
      done()
    })
  })

  test('remove test', function (done) {
    scratch.foo1.remove$({id: scratch.foo1.id}, function (err, res) {
      Assert.isNull(err)

      scratch.foo1.load$(scratch.foo1.id, function (err, foo1) {
        Assert.isNull(err)
        Assert.isUndefined(foo1)
        done()
      })
    })
  })
})
