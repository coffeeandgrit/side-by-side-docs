var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    topic = require('./topic'),
    glob = Promise.promisify(require('glob'));


module.exports = exports = function(sectionPath) {
    return glob(path.resolve(sectionPath, '!(*.md)'))
        .then(function(topicPaths) {
            return Promise.all(_.map(topicPaths, function(topicPath) {
                return topic(topicPath)
                    .then(function(topicInformation) {
                        examples(topicPath)
                            .then(function(examples) {
                                topicInformation.examples = examples;
                                return topicInformation;
                            });
                    });
            }))
        })
};
