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

(new Promise(function(resolve) {
    resolve({});
}))
    .then(function(p) {
        //list the first-order directories for sections
        return glob(path.join(path.resolve(__dirname, 'src'), '*'))
            .then(function(sections) {
                p.sections = sections;
                return p;
            });
    })
    .then(function(p) {
        //for all of the sections found,
        return Promise.all(_.map(p.sections, function(section) {
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
                    return glob(path.resolve(section, '!(*.md)'))
                        .then(function(directories) {
                            p[basename].topics = {};
                            return Promise.all(_.map(directories, function(directory) {
                                var topicname = path.basename(directory);
                                p[basename].topics[topicname] = {};
                                p[basename].topics[topicname].name = topicname;
                                //glob the content files 
                                return glob(path.resolve(directory, '*.md'))
                                    .then(function(contentfiles) {
                                        p[basename].topics[topicname].files = contentfiles;
                                        if (contentfiles.length == 0) {
                                            logger.info('no content files found for topic %s', topicname);
                                            return p;
                                        } else if (contentfiles.length > 1) {
                                            logger.warn('more than one content file found for topic %s, using first', topicname);
                                        }

                                        fs.readFileAsync(p[basename].topics[topicname].files[0])
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
                                                    p[basename].topics[topicname].name = $(':header')
                                                        .first()
                                                        .text();
                                                    logger.silly('\t\t new haeder for %s: %s', topicname, p[basename].topics[topicname].name);
                                                }

                                                //track the rendered content
                                                p[basename].topics[topicname].content = rendered;
                                                return p;
                                            });
                                    })
                                    .then(function() {
                                        logger.silly('%s %s', basename, topicname);
                                        p[basename].topics[topicname].examples = {};
                                        //glob the examples directory
                                        logger.silly('looking at examples for %s', topicname);
                                        return glob(path.resolve(directory, 'examples', '*.md'))
                                            .then(function(examples) {
                                                p[basename].topics[topicname].examples.files = examples;
                                                return Promise.all(_.map(examples, function(example) {
                                                        return fs.readFileAsync(example)
                                                            .then(function(file) {
                                                                return file.toString();
                                                            })
                                                            .then(function(file) {
                                                                //render the file
                                                                var rendered = marked(file, {
                                                                    langPrefix: 'language-'
                                                                });
                                                                //load the rendered file into cheerio
                                                                var $ = cheerio.load(rendered);
                                                                //for each code fragment,
                                                                var language = path.basename(file, '.md');
                                                                $('code')
                                                                    .each(function() {
                                                                        var $this = $(this);
                                                                        var classname = $this.attr('class') || '';
                                                                        var targets = classname.split('language-');
                                                                        if (targets.length > 1) {
                                                                            logger.silly('lang: %s', targets[1]);
                                                                            language = targets[1];

                                                                            if (!Prism.languages[language]) {

                                                                                var path = require.resolve('prismjs/components/prism-' + language);
                                                                                var code = fs.readFileSync(path, 'utf8')
                                                                                    .toString();

                                                                                // make Prism and self object available in the plugins local scope
                                                                                vm.runInNewContext(code, {
                                                                                    self: {},
                                                                                    Prism: Prism
                                                                                });
                                                                            }

                                                                            var html = $this.html();
                                                                            logger.silly('prism has lang? ' + !!Prism.languages[language])
                                                                            var highlighted = Prism.highlight(html, Prism.languages[language]);
                                                                            $this.html(highlighted);
                                                                        }
                                                                    });
                                                                logger.silly('%s for %s example of %s done', basename, topicname, language);
                                                                p[basename].topics[topicname].examples[language] = $.html();
                                                            });
                                                    }))
                                                    .then(function() {
                                                    });
                                            });
                                    });
                            }));
                        });
                });
        })).then(function(){
            return p;
        });
    })
    .then(function(p) {
        console.log(util.inspect(p));
        return p;
    });
