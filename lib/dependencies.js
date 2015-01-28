var Promise   = require('es6-promise').Promise,
    madge     = require('madge'),
    path      = require('path'),
    guardian  = path.resolve(__dirname, '../../frontend'),
    reqconfig = require(path.join(guardian, '/grunt-configs/requirejs'))(null, {});

module.exports = function(config) {

    function getDependencies(seed) {
        var opts = {
            format: 'amd'
        };

        return madge(seed, opts).tree;
    };

    function toObject(arr) {
        return obj = arr.reduce(function(o, v, i) {
          o[v + '.js'] = {};
          return o;
        }, {});
    };

    function iterateThrough (seed) {
        var result   = getDependencies(config.basePath + '/' + seed),
            postproc = [];

        postproc = result[Object.keys(result)[0]].map(function(item) {
            var paths = reqconfig.options.paths;

            for (var i in paths) {
                if (paths.hasOwnProperty(i) && item === i) {
                    return config.staticFolder + '/' + paths[i] + '.js';
                } 
            }

            var o = {};
            o[config.staticFolder + '/' + item + '.js'] = {};

            return o;
        });
        console.log(postproc);
    };

    function getSeedDeps(seedName, seed) {
        iterateThrough(seed);
        //return toObject(getDependencies(config.basePath + '/' + seed)[seedName]);
    };

    function reverseGraph(graph) {
        var allFiles = {};
        Object.keys(graph).forEach(function (seed) {
            iterate(graph[seed], function (file) {
                if (!allFiles[file]) {
                    allFiles[file] = [];
                }
                allFiles[file].push(seed);
            });
        });
        return allFiles;
    };

    function iterate (object, executor) {
        Object.keys(object).forEach(function (file) {
            executor(file);
            if (object[file]) {
                iterate(object[file], executor);
            }
        });
    };

    return {
        getSeedDeps: getSeedDeps,
        reverseGraph: reverseGraph,
        getSeedDeps: getSeedDeps
    }
};