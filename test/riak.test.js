'use strict'

var seneca = require('seneca')
var Assert = require('chai').assert
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var suite = lab.suite
var test = lab.test

var si = seneca({log: 'print'})

var default_options = require('./default-options.json')
si.use(require('..'), default_options)

console.log('Using Riak configuration: ', default_options)

suite('basic test', function () {
  var scratch = {}

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

//  test('test update with merge$: true|false', function (done) {
//    var foo = si.make('foo')
//    foo.p1 = 'z1'
//    foo.p2 = 'z2'
//
//    foo.save$(function (err, foo1) {
//      Assert.isNull(err)
//      Assert.isNotNull(foo1.id)
//      Assert.equal(foo1.p1, 'z1')
//      Assert.equal(foo1.p2, 'z2')
//
//      foo1.p1 = 'z2'
//      delete foo1.p2
//
//      foo1.save$({ merge$: true }, function (err, foo1) {
//        Assert.isNull(err)
//        Assert.isNotNull(foo1.id)
//        Assert.equal(foo1.p1, 'z2')
//        Assert.equal(foo1.p2, 'z2')
//        Assert(!foo1.merge$)
//
//        foo1.p1 = 'z3'
//        delete foo1.p2
//        foo1.save$({ merge$: false }, function (err, foo1) {
//          Assert.isNull(err)
//          Assert.isNotNull(foo1.id)
//          Assert.equal(foo1.p1, 'z3')
//          Assert(!foo1.p2)
//          Assert(!foo1.merge$)
//          done()
//        })
//      })
//    })
//  })
})
