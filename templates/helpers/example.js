var Handlebars = require('handlebars'),
    logger = require('winston'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_example', function(example) {
        logger.silly('example: ' + util.inspect(example));

        var $ = cheerio.load('<div></div>');
        $('div').addClass(example.language);
        $('div').addClass('code');
        $('div').append(example.content);
        return $.html();
    });
};
