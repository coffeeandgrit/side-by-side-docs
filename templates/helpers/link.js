var Handlebars = require('handlebars');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_link', function(link) {
        return new Handlebars.SafeString('');
    });
};
