var Promise = require('bluebird'),
    _ = require('lodash'),
    path = require('path'),
    fs = Promise.promisifyAll(require('fs')),
    util = require('util'),
    logger = require('winston'),
    cheerio = require('cheerio'),
    marked = require('marked'),
    Prism = require('prismjs'),
    vm = require('vm'),
    make = require('./lib/make'),
    glob = Promise.promisify(require('glob'));

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level: 'silly',
    colorize: true
});

make(__dirname, path.resolve(__dirname, 'output', 'doc.html')).then(function(){
    logger.info('done');
});
