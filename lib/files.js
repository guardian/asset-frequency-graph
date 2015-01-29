var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Promise = require('es6-promise').Promise;
var logger = require('./logger');
var series = require('./series');
var stats = require('./stats');

module.exports = function (config) {
    var allJS = {};

    glob.sync(path.join(config.basePath, config.staticFolder) + '/**/*.js').forEach(function (file) {
        var normalized = file.substring(file.indexOf(config.staticFolder));
        allJS[normalized] = {};
    });

    return {
        isInteresting: function (files) {
            return files.some(function (file) {
                return !!allJS[file];
            });
        },

        isStaticFile: function (file) {
            return !!allJS[file];
        },

        findDependencies: function (executor) {
            var iterateOn = config.seeds.map(function (seed) {
                var seedPath = config.staticFolder + '/' + seed,
                    seedName = path.basename(seed, path.extname(seed));

                if (!allJS[seedPath]) {
                    throw new Error('Unable to find seed file ' +
                        seed + ' in path: ' + seedPath
                    );
                }

                return {
                    name: seedName,
                    path: seedPath
                };
            });

            return Promise.all(
                iterateOn.map(function (seed) {
                    logger('Finding dependencies of \'' + seed.name + '\'');
                    return executor(seed.name, seed.path);
                })
            ).then(function (graphs) {
                return iterateOn.reduce(function (wholeGraph, seed, index) {
                    wholeGraph[seed.name] = graphs[index];
                    return wholeGraph;
                }, {});
            });
        },

        getFilesStat: function () {
            return new Promise(function (resolve, reject) {
                logger('Get file stats');
                series.iterate(Object.keys(allJS), null, function (file, cb) {
                    fs.readFile(path.join(config.basePath, file), function (err, data) {
                        stats(file, data, function (result) {
                            allJS[file] = result;
                            cb();
                        });
                    });
                }, function () {
                    resolve(allJS);
                });
            });
        }
    };
};
