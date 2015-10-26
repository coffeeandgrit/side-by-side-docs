var Handlebars = require('handlebars'),
    logger = require('winston'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_example', function(example) {
        logger.silly('example: ' + util.inspect(example));
        return example.content;
    });
};
