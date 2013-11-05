/*jslint node: true*/
/*jslint asi: true */
"use strict";

var _ = require('underscore')

module.exports.getBucketName = function (entity) {
  var canon = entity.canon$({object: true})

  return (canon.base ? canon.base + '_' : '') + canon.name
}

