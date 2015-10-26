var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    section = require('./section'),
    glob = Promise.promisify(require('glob'));

module.exports = exports = function(directory) {
    return glob(path.join(path.resolve(directory, 'src'), '*'))
        .then(function(sectionPaths) {
            return Promise.all(_.map(sectionPaths, function(sectionPath) {
                return section(sectionPath)
                    .then(function(sectionInformation) {
                        return topics(sectionPath).then(function(topics){
                            sectionInformation.topics = topics;
                            return sectionInformation;
                        });
                    });
            }));
        });
};
