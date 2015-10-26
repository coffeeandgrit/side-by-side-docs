var Handlebars = require('handlebars'),
    $ = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_example', function(example) {
        return new Handlebars.SafeString('');
    });
};
