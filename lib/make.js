var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    sections = require('./sections'),
    Handlebars = require('handlebars'),
    helpers = require('../templates/helpers'),
    mkdirp = Promise.promisify(require('mkdirp')),
    cpr = require('cpr'),
    rimraf = Promise.promisify(require('rimraf')),
    glob = Promise.promisify(require('glob'));

module.exports = exports = function(source, destination) {
    context = {};
    return sections(source)
        .then(function(sections) {

            logger.silly(util.inspect(sections, null, 3));

            //prepare the data for handlebars
            context.sections = sections

            //extract links for topics
            context.navigationLinks = _.map(context.sections, function(section) {
                var topics = null;
                if (!!section.topics && section.topics.length > 1) {
                    topics = _.map(section.topics, function(topic) {
                        return {
                            name: topic.name,
                            anchor: topic.name.replace(/[^a-z0-9\-\_]/gi, '_')
                        }
                    });
                }
                return {
                    name: section.name,
                    anchor: section.anchor,
                    topics: topics
                };
            });

            //extract languages
            context.languages = _.chain(context.sections)
                .pluck('topics')
                .reduce(function(a, b) {
                    return a.concat(b);
                }, [])
                .pluck('examples')
                .reduce(function(a, b) {
                    return a.concat(b);
                }, [])
                .map(function(example) {
                    return example.language;
                }).value();

            //language defaultify
            //for each section,
            _.each(context.sections, function(section) {
                //for each topic in that section,
                _.each(section.topics, function(topic) {
                    //pluck what languages exist
                    //diff with what languages there are
                    //for each missing language,
                    _.each(_.difference(context.languages, _.pluck(topic.examples, 'language')), function(missingLanguage) {
                        //add the missing language with some helpful text
                        topic.examples.push({
                            language: missingLanguage,
                            content: '<div>No example provided.</div>'
                        });
                    });

                });
            });

            //register the hbt helpers
            _.each(helpers, function(helper, ix) {
                logger.silly('registering ' + ix);
                helper();
            });
        })
        
        .then(function() {
            return fs.readFileAsync(path.resolve(__dirname, '..', 'templates', 'docs.hbt'));
        })
        .then(function(template) {
            //create the template
            var hbt = Handlebars.compile(template.toString());
            //run the template with the context data
            var output = hbt(context);
            context.output = output;
            //save the output to destination

        })
        .then(function(){
            return rimraf(path.resolve(destination));
        })
        .then(function(){
            //make the destination directory
            return mkdirp(path.resolve(destination, 'assets'));
        })
        .then(function(){
            //copy the assets to the destination directory
            return new Promise(function(resolve, reject){
                cpr(path.resolve(__dirname, '..','assets'), path.resolve(destination, 'assets'), function(err, files){
                    if(err)return reject(err);
                    resolve();
                });
            });
        })
        .then(function() {
            //write the output to the destination directory
            return fs.writeFileAsync(path.resolve(destination, 'docs.html'), context.output);
        })
        .then(function() {
            return context;
        });
};
