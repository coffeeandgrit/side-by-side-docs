var Promise = require('bluebird'),
    vm = require('vm'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    example = require('./example'),
    cheerio = require('cheerio'),
    marked = require('marked'),
    Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities(),
    Prism = require('prismjs'),
    glob = Promise.promisify(require('glob'));


module.exports = exports = function(examplePath) {
    return fs.readFileAsync(examplePath)
        .then(function(file) {
            return file.toString();
        })
        .then(function(file) {
            //render the file
            var rendered = marked(file, {
                langPrefix: 'language-'
            });
            //load the rendered file into cheerio
            var $ = cheerio.load(rendered);
            //for each code fragment,
            var language = path.basename(file, '.md');
            $('code')
                .each(function() {
                    var $this = $(this);
                    var classname = $this.attr('class') || '';
                    var targets = classname.split('language-');
                    if (targets.length > 1) {
                        logger.silly('lang: %s', targets[1]);
                        language = targets[1];

                        if (!Prism.languages[language]) {

                            var path = require.resolve('prismjs/components/prism-' + language);
                            var code = fs.readFileSync(path, 'utf8')
                                .toString();

                            // make Prism and self object available in the plugins local scope
                            vm.runInNewContext(code, {
                                self: {},
                                Prism: Prism
                            });
                        }

                        var html = $this.html();
                        html = entities.decode(html);
                        logger.silly('prism has lang? ' + !!Prism.languages[language])
                        var highlighted = Prism.highlight(html, Prism.languages[language]);
                        $this.html(highlighted);
                    }
                });
            
            return{
                content: $.html(),
                language:language
            };
        });
};
