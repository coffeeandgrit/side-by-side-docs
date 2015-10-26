var Handlebars = require('handlebars'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_language', function(language) {
        var $ = cheerio.load('<a></a>');
        $('a').attr('class', 'selection');
        $('a').attr('href', '#');
        $('a').text(language);
        return $.html();
    });
};
