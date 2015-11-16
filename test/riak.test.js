'use strict'

var seneca = require('seneca')
var Async = require('async')
var Assert = require('chai').assert
var Lab = require('lab')
var _ = require('lodash')

var si = seneca({log: 'print'})

si.use(require('..'), {
  nodes: [
    '127.0.0.1:8098'
  ]
})


var scratch = {}

basictest()

function basictest () {
  /*

  var lab = Lab.script()
  var describe = lab.describe
  var it = lab.it

  describe('Extended tests', function () {
    it('Extended tests', function extended (done) {

      Async.series(
        {
          save1: function (cb) {
            console.log('Test', 'save1')

            var foo1 = si.make({name$: 'foo'})
            foo1.p1 = 'v1'

            foo1.save$(function (err, foo1) {
              console.log('!!!!!!!!!!', err, foo1)

              Assert(!err)
              Assert.isNotNull(foo1.id)
              Assert.equal('v1', foo1.p1)
              scratch.foo1 = foo1
              cb()
            })
          },

          save2: function (cb) {
            console.log('save2')

            scratch.foo1.p1 = 'v1x'
            scratch.foo1.p2 = 'v2'
            scratch.foo1.save$(verify(cb, function (foo1) {
              assert.isNotNull(foo1.id)
              assert.equal('v1x', foo1.p1)
              assert.equal('v2', foo1.p2)
              scratch.foo1 = foo1
            }))
          },

          load2: function (cb) {
            console.log('load2')

            scratch.foo1.load$(scratch.foo1.id, verify(cb, function (foo1) {
              assert.isNotNull(foo1.id)
              assert.equal('v1x', foo1.p1)
              assert.equal('v2', foo1.p2)
              scratch.foo1 = foo1
            }))
          },

          save3: function (cb) {
            console.log('save3')

            scratch.bar = si.make(bartemplate)
            var mark = scratch.bar.mark = Math.random()

            scratch.bar.save$(verify(cb, function (bar) {
              assert.isNotNull(bar.id)
              barverify(bar)
              assert.equal(mark, bar.mark)
              scratch.bar = bar
            }))
          },

          save4: function (cb) {
            console.log('save4')

            scratch.foo2 = si.make({name$: 'foo'})
            scratch.foo2.p2 = 'v2'

            scratch.foo2.save$(verify(cb, function (foo2) {
              assert.isNotNull(foo2.id)
              assert.equal('v2', foo2.p2)
              scratch.foo2 = foo2
            }))
          },

          remove1: function (cb) {
            console.log('remove1')

            var foo = si.make({name$: 'foo'})

            foo.remove$({id: scratch.foo1.id}, function (err, res) {
              assert.isNull(err)

              scratch.foo1.load$(scratch.foo1.id, verify(cb, function (foo1) {
                assert.isUndefined(foo1)
              }))
            })
          }
        },
        function (err, out) {
          done()
        })
    })
  })
  */
}
