
module.exports = function (config) {
    var Promise   = require('es6-promise').Promise,
        madge     = require('madge'),
        path      = require('path'),
        frontend  = path.resolve(config.basePath),
        reqconfigPath = path.join(frontend, '/grunt-configs/requirejs.js'),
        reqconfig = require(reqconfigPath)(null, {});

    var cache = {};
    function getDependencies(seed) {
        var opts = {
            format: 'amd'
        };

        var tree = madge(seed, opts).tree;
        if (!cache[seed]) {
            cache[seed] = tree[path.basename(seed, '.js')];
        }
        return cache[seed];
    }

    function iterateThrough (shortName, fullPath, depth) {
        var baseName = config.basePath + '/' + fullPath,
            deps = getDependencies(baseName)
                .filter(keepNonEmpty)
                .map(recurse);

        return {
            path: fullPath,
            name: shortName,
            dependencies: deps
        };
    }

    function keepNonEmpty (module) {
        return !!module;
    }

    function recurse (module) {
        if (module.indexOf('lodash/') === 0) {
            return {
                path: resolveFileName(module),
                name: module,
                dependencies: []
            };
        }
        return iterateThrough(module, resolveFileName(module));
    }

    function resolveFileName (module) {
        var split = module.split('/'),
            resolve = reqconfig.options.paths[split[0]],
            fullPath = reqconfig.options.baseUrl + '/';

        if (resolve) {
            split.shift();
            fullPath += resolve + (split.length ? '/' + split.join('/') : '');
        } else {
            fullPath += module;
        }
        return fullPath + '.js';
    }

    function iterate(seedName, seed) {
        return iterateThrough(seedName, seed);
    }

    function eachDependency (object, executor) {
        object.dependencies.forEach(function (dependency) {
            if (!dependency.path) {
                return;
            }
            executor(dependency);
            if (dependency.dependencies.length) {
                eachDependency(dependency, executor);
            }
        });
    }


    function reverseGraph(graph) {
        var allFiles = {};
        Object.keys(graph).forEach(function (seed) {
            eachDependency(graph[seed], function (dependency) {
                if (!allFiles[dependency.path]) {
                    allFiles[dependency.path] = {
                        seeds: [],
                        name: dependency.name
                    };
                }
                pushUnique(allFiles[dependency.path].seeds, seed);
            });
        });
        return allFiles;
    }

    function pushUnique (array, item) {
        if (!~array.indexOf(item)) {
            array.push(item);
        }
    }

    return {
        iterate: iterate,
        reverseGraph: reverseGraph
    };
};