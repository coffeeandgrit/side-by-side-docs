var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    section = require('./section'),
    cheerio = require('cheerio'),
    marked = require('marked'),
    glob = Promise.promisify(require('glob'));

module.exports = exports = function(sectionPath) {
    //get the last part of the section 
    var basename = path.basename(sectionPath);

    //get the first order markdown files, if any
    var mdpath = path.resolve(sectionPath, '*.md');
    return glob(mdpath)
        .then(function(files) {
            return {
                basefiles:files,
                name: basename,
                basename: basename,
                anchor: basename.replace(/[^a-z0-9\-\_]/gi, '_'),
                mdpath: mdpath
            };
        })
        .then(function(p) {
            if (p.basefiles.length == 0) {
                //no base file found, skip the addition
                logger.info('no basefile found for %s', basename);
                return p;
            } else if (p.basefiles.length > 1) {
                //for now, simply use the first base file found
                logger.warn('more than one basefile found for %s (%s), using first', p.basename, sectionPath);
            }

            logger.silly('found file: %s', p.basefiles[0]);
            //read the basefile
            return fs.readFileAsync(p.basefiles[0])
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
                        logger.silly('\t\t new haeder for %s: %s', basename, p.name);
                    }

                    //track the rendered content
                    p.content = rendered;
                    return p;
                });
        })
};
