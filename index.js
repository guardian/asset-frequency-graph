module.exports = function (config, callback) {
    config = config || {
        basePath: '../frontend',
        staticFolder: 'static/src/javascripts',
        requireConfig: '/grunt-configs/requirejs.js',
        gruntJit: true,
        seeds: [
            'core.js'
        ],
        limit: 30,
        destination: 'tmp/summary.html',
        verbose: false,
        fromDisk: true,
        fullPage: true
    };

    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var path = require('path');
    var Promise = require('es6-promise').Promise;
    var files = require('./lib/files')(config);
    var dependencies = require('./lib/dependencies')(config);
    var git = require('./lib/git')(config);
    var output = require('./lib/output')(config);
    var analize = require('./lib/analize')(config);
    var logger = require('./lib/logger');

    Promise.all([
        files.findDependencies(dependencies.iterate),
        git.getAllMergedPullRequests(),
        files.getFilesStat()
    ])
    .then(function (result) {
        var graph  = result[0],
            merges = result[1],
            stat   = result[2],
            dependentMap = dependencies.reverseGraph(graph),
            matrix = dependencies.matrix(graph);

        return git.repositoryHistory(merges, function (merge, files) {
            analize.onMerge(dependentMap, stat, merge, files);
        }).then(function () {
            return analize.total(graph, matrix);
        });
    })
    .then(function (total) {
        var html = output.toHTML(total);
        mkdirp(path.dirname(config.destination), function (err) {
            if (err) {
                console.error(err);
                callback();
            } else {
                logger('Writing results to ' + config.destination);
                fs.writeFile(config.destination, output.toHTML(total), function (error) {
                    if (error) {
                        console.error(err);
                    }
                    callback(total);
                });
            }
        });
    })
    .catch(function (error) {
        console.trace(error);
        callback();
    });
};

if (require.main === module) {
    module.exports(null, function () {});
}