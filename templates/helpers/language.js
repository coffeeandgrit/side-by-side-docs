var Handlebars = require('handlebars'),
    logger = require('winston'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_language', function(language) {
        var $ = cheerio.load('<a onclick="return false;"></a>');
        $('a').attr('class', 'selection');
        $('a').attr('href', '#');
        $('a').text(language);
        return $.html();
    });
};
