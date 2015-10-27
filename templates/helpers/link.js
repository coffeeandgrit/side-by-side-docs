var Handlebars = require('handlebars'),
    logger = require('winston'),
    _ = require('lodash'),
    util = require('util'),
    cheerio = require('cheerio');

module.exports = exports = function() {
    Handlebars.registerHelper('documentation_link', function(link) {
        var div = cheerio.load('<div></div>');
        var a = cheerio.load('<a href="#'+link.anchor+'">'+link.name+'</a>');
        div('div').append(a.html());
        logger.silly('link %s has topics: %s', link.name, !!link.topics);
        if(!!link.topics){
            var ul = cheerio.load('<ul></ul>');
            _.each(link.topics, function(topic){
                var li = cheerio.load('<li></li>');
                var a = cheerio.load('<a href="#'+topic.anchor+'">'+topic.name+'</a>');
                li('li').append(a.html());
                ul('ul').append(li.html());
            });

            div('div').append(ul.html());
        }
        var list  = cheerio.load('<li></li>');
        list('li').append(div.html());

        return list.html();
    });
};
