var Handlebars = require('handlebars'),
    logger = require('winston'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_language', function(language) {
        logger.silly('language: ' + util.inspect(language));
        var $ = cheerio.load('<a></a>');
        $('a').attr('class', 'selection');
        $('a').attr('href', '#');
        $('a').text(language);
        return $.html();
    });
};
