var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    glob = Promise.promisify(require('glob'));

module.exports = exports = function(topicPath) {
    var topicname = path.basename(topicPath);
    //glob the content files 
    return glob(path.resolve(topicPath, '*.md'))
        .then(function(contentfiles) {
            var p = {
                name: topicName,
                files: contentfiles
            };
            if (p.files.length == 0) {
                logger.info('no content files found for topic %s', topicname);
                return p;
            } else if (p.files.length > 1) {
                logger.warn('more than one content file found for topic %s, using first', topicname);
            }

            fs.readFileAsync(p.files[0])
                .then(function(file) {
                    file = file.toString();
                    //use marked to render
                    var rendered = marked(file);
                    //load the rendered file into cheerio
                    var $ = cheerio.load(rendered);
                    //check headers
                    if ($(':header')
                        .length > 0) {
                        //use cheerio to find the first h* header
                        //extract the header name
                        //set the name member to the extracted header
                        p.name = $(':header')
                            .first()
                            .text();
                        logger.silly('\t\t new haeder for %s: %s', topicname, p.name);
                    }

                    //track the rendered content
                    p.content = rendered;
                    return p;
                });
        });
};
