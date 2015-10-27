var Promise = require('bluebird'),
    logger = require('winston'),
    path = require('path'),
    make = require('./lib/make'),
    express = require("express"),
    util = require("util"),
    http = require("http");


module.exports = exports  = function(app, server) {
    var router = express.Router();
    return Promise.cast()
        .then(function(){
            return make(path.resolve(__dirname, 'src'), path.resolve(__dirname, 'output'));
        })
        .then(function() {
            router.use('/', express.static(path.resolve(__dirname, 'output')));
            return router;
        })
};

if (require.main === module) {
    require('cng-standalone')(require('./package.json'), module.exports);
}
