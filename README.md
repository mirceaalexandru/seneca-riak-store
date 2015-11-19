![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] data storage plugin

# seneca-riak-store
[![Build Status][travis-badge]][travis-url]
[![Gitter][gitter-badge]][gitter-url]

[![js-standard-style][standard-badge]][standard-style]

seneca-riak is a [Riak][riak] database plugin for the [Seneca][seneca] MVP toolkit.

If you're using this module, and need help, you can:

- Post a [github issue][],
- Tweet to [@senecajs][],
- Ask on the [Gitter][gitter-url].

If you are new to Seneca in general, please take a look at [senecajs.org][]. We have everything from
tutorials to sample apps to help get you up and running quickly.

seneca-riak-store's source can be read in an annotated fashion by,

- Running `npm run annotate`
- The annotated source can be found locally at [./doc/riak-store.html]().

## Install
To install, simply use npm. Remember you will need to install [Seneca.js][]
separately.

```
npm install seneca
npm install seneca-riak-store
```

## Test
To run tests, simply use npm:

```
npm run test
```

## Quick Example
```js
var seneca = require('seneca')()
seneca.use('riak-store', {
  nodes: ["host1:port1", "host2:port2"]]
})

seneca.ready(function () {
  var apple = seneca.make$('fruit')
  apple.name  = 'Pink Lady'
  apple.price = 0.99
  apple.save$(function (err, apple) {
    console.log("apple.id = " + apple.id)
  })
})
```

## Usage
You don't use this module directly. It provides an underlying data storage engine for the Seneca entity API:

```js
var entity = seneca.make$('typename')
entity.someproperty = "something"
entity.anotherproperty = 100

entity.save$(function (err, entity) { ... })
entity.load$({id: ...}, function (err, entity) { ... })
entity.remove$({id: ...}, function (err, entity) { ... })
```

### Query Support
Due to Riak DB limitations some of the standard Seneca store operations are not available.

These are:
- `.list$({f1:v1, f2:v2, ...})` - list operation is not implemented it will throw error
- `.remove$({all$: true})` - DB engine allow delete only for specified ids so this function is not available in this store.


## Testing with Docker Compose

With docker-machine and docker-compose installed run the following commands:

```
docker-compose build
docker-compose up
```

### Native Driver
As with all seneca stores, you can access the native driver
using `entity.native$(function (err, connectionPool) {...})`.


## Contributing
We encourage participation. If you feel you can help in any way, be it with
examples, extra testing, or new features please get in touch.

## License
Copyright Mircea Alexandru 2015, Licensed under [MIT][].

[travis-badge]: https://travis-ci.org/mirceaalexandru/seneca-riak-store.svg
[travis-url]: https://travis-ci.org/mirceaalexandru/seneca-riak-store
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[standard-badge]: https://raw.githubusercontent.com/feross/standard/master/badge.png
[standard-style]: https://github.com/feross/standard

[MIT]: ./LICENSE
[riak]: http://basho.com/riak/
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/mirceaalexandru/seneca-riak-store/issues
[@senecajs]: http://twitter.com/senecajs


Acknowledgements
----------------

This project was sponsored by [nearForm](http://nearform.com).

