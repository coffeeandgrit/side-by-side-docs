var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    example = require('./example'),
    glob = Promise.promisify(require('glob'));


module.exports = exports = function(topicPath) {
    return glob(path.resolve(topicPath, 'examples', '*.md'))
        .then(function(examplePaths) {
            return Promise.all(_.map(examplePaths, function(examplePath) {
                return example(examplePath);
            }))
        })
};
