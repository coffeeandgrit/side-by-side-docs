var Handlebars = require('handlebars'),
    logger = require('winston'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_link', function(link) {
        logger.silly('link: ' + util.inspect(link));
        return new Handlebars.SafeString(link.name);
    });
};
