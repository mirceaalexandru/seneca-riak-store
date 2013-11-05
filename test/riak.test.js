/*jslint node: true*/
/*jslint asi: true */
/*global describe:true, it:true*/
"use strict";

var seneca= require('seneca')
var async = require('async')
var assert= require('chai').assert
var _     = require('underscore')
var eyes  = require('eyes')

var si = seneca({log:'print'});
si.use(require('..'), {
  server: "127.0.0.1",
  port:   "8098"
})

var testcount = 0
si.__testcount = 0

var verify = function(cb,tests){
  return function(error,out) {
    if( error ) return cb(error);
    tests(out)
    cb()
  }
}

var bartemplate = {
  name$:'bar',
  base$:'moon',
  zone$:'zen',

  str:'aaa',
  int:11,
  dec:33.33,
  bol:false,
  wen:new Date(2020,1,1),
  arr:[2,3],
  obj:{a:1,b:[2],c:{d:3}}
}

var barverify = function(bar) {
  assert.equal('aaa', bar.str)
  assert.equal(11,    bar.int)
  assert.equal(33.33, bar.dec)
  assert.equal(false, bar.bol)
  assert.equal(new Date(2020,1,1).toISOString(), _.isDate(bar.wen) ? bar.wen.toISOString() : bar.wen )
  assert.equal(''+[2,3],''+bar.arr)
  assert.equal(JSON.stringify({a:1,b:[2],c:{d:3}}),JSON.stringify(bar.obj))
}

var scratch = {}

describe('riak', function () {
  it('basic', function (done) {
    testcount++
    basictest(si, done)
  })

  it('close', function (done) {
    closetest(si, testcount, done)
  })
})

var basictest = function(si,done) {
  si.ready(function(){
    console.log('BASIC')
    assert.isNotNull(si)

    /* Set up a data set for testing the store.
     * //foo contains [{p1:'v1',p2:'v2'},{p2:'v2'}]
     * zen/moon/bar contains [{..bartemplate..}]
     */
    async.series(
      {
        save1: function(cb) {
          console.log('save1')

          var foo1 = si.make({name$:'foo'}) ///si.make('foo')
          foo1.p1 = 'v1'

          foo1.save$( verify(cb, function(foo1){
            assert.isNotNull(foo1.id)
            assert.equal('v1',foo1.p1)
            scratch.foo1 = foo1
          }))
        },

        save2: function(cb) {
          console.log('save2')

          scratch.foo1.p1 = 'v1x'
          scratch.foo1.p2 = 'v2'
          scratch.foo1.save$( verify(cb,function(foo1){
            assert.isNotNull(foo1.id)
            assert.equal('v1x',foo1.p1)
            assert.equal('v2',foo1.p2)
            scratch.foo1 = foo1
          }))
        },

        load2: function(cb) {
          console.log('load2')

          scratch.foo1.load$( scratch.foo1.id, verify(cb, function(foo1){
            assert.isNotNull(foo1.id)
            assert.equal('v1x',foo1.p1)
            assert.equal('v2',foo1.p2)
            scratch.foo1 = foo1
          }))
        },

        save3: function(cb) {
          console.log('save3')

          scratch.bar = si.make( bartemplate )
          var mark = scratch.bar.mark = Math.random()

          scratch.bar.save$( verify(cb, function(bar){
            assert.isNotNull(bar.id)
            barverify(bar)
            assert.equal( mark, bar.mark )
            scratch.bar = bar
          }))
        },

        save4: function(cb) {
          console.log('save4')

          scratch.foo2 = si.make({name$:'foo'})
          scratch.foo2.p2 = 'v2'

          scratch.foo2.save$( verify(cb, function(foo2){
            assert.isNotNull(foo2.id)
            assert.equal('v2',foo2.p2)
            scratch.foo2 = foo2
          }))
        },

        remove1: function(cb) {
          console.log('remove1')

          var foo = si.make({name$:'foo'})

          foo.remove$( {id: scratch.foo1.id}, function(err, res){
            assert.isNull(err)

            scratch.foo1.load$( scratch.foo1.id, verify(cb, function(foo1){
              assert.isUndefined(foo1)
            }))
          })
        }
      },
      function(err,out) {
        if( err ) {
          eyes.inspect( err )
        }
        si.__testcount++
        assert.isNull(err)
        done && done()
      })
  })
}

var closetest = function(si,testcount,done) {
  var RETRY_LIMIT = 10
  var retryCnt = 0

  function retry(){
    if( testcount <= si.__testcount || retryCnt > RETRY_LIMIT ) {
      console.log('CLOSE')
      si.close()
      done && done()
    }
    else {
      retryCnt++
      setTimeout(retry, 500);
    }
  }
  retry()
}


