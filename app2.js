var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    cheerio = require('cheerio'),
    marked = require('marked'),
    Prism = require('prismjs'),
    vm = require('vm'),
    glob = Promise.promisify(require('glob'));

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level: 'silly',
    colorize: true
});

glob(path.join(path.resolve(__dirname, 'src'), '*'))
    .then(function(sections) {
        var p = {};
        //for all of the sections found,
        return Promise.all(_.map(sections, function(section) {
                //get the last part of the section 
                var basename = path.basename(section);
                p[basename] = {};
                //todo: probably need to clean up the basename
                p[basename].name = basename;

                //get the first order markdown files, if any
                var mdpath = path.resolve(section, '*.md');
                return glob(mdpath)
                    .then(function(files) {
                        p[basename].basefiles = files;
                        return p;
                    })
                    .then(function() {
                        if (p[basename].basefiles.length == 0) {
                            //no base file found, skip the addition
                            logger.info('no basefile found for %s', basename);
                            return p;
                        } else if (p[basename].basefiles.length > 1) {
                            //for now, simply use the first base file found
                            logger.warn('more than one basefile found for %s (%s), using first', basename, section);
                        }

                        logger.silly('found file: %s', p[basename].basefiles[0]);
                        //read the basefile
                        return fs.readFileAsync(p[basename].basefiles[0])
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
                                    p[basename].name = $(':header')
                                        .first()
                                        .text();
                                    logger.silly('\t\t new haeder for %s: %s', basename, p[basename].name);
                                }

                                //track the rendered content
                                p[basename].content = rendered;
                                return p;
                            });
                    })
                    .then(function() {
                        //glob the topic directories
                        topic(directory);
                    });
            }))
            .then(function() {
                return p;
            });
    })
    .then(function(p) {
        console.log(util.inspect(p, null, 5));
        return p;
    })
    .then(function(p) {
        //reorganize data for template
        delete p.sections;

    });
