seneca-riak
================

seneca-riak is a [Riak][riak] database plugin for the [Seneca][seneca] MVP toolkit.

Status: Under development

Usage:

    var seneca = require('seneca');
    var store = require('riak-store');

    var config = {}
    var storeopts = {
      server: '127.0.0.1',
      port: 8098
    };

    ...

    var si = seneca(config)
    si.use(store, storeopts)
    si.ready(function() {
      var product = si.make('product')
      ...
    })
    ...

[seneca]: http://senecajs.org/
[riak]: http://basho.com/riak/

