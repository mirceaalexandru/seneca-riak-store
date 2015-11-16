'use strict'

module.exports.getBucketName = function (entity) {
  var canon = entity.canon$({object: true})

  return (canon.base ? canon.base + '_' : '') + canon.name
}
