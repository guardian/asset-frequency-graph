module.exports = function (config, callback) {
    config = config || {
        basePath: '../frontend',
        staticFolder: 'static/src/javascripts',
        seeds: [
            'bootstraps/app.js',
            'bootstraps/commercial.js',
            'core.js'
        ],
        limit: 30,
        destination: 'tmp/summary.html',
        verbose: false
    };

    var Promise = require('es6-promise').Promise;
    var files = require('./lib/files')(config);
    var dependencies = require('./lib/dependencies')(config);
    var git = require('./lib/git')(config);
    var output = require('./lib/output')(config);
    var analize = require('./lib/analize')(config);

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

        return analize(dependentMap, merges, graph, matrix, stat);
    })
    .then(function (total) {
        output.toHTML(total);
        callback(total);
    })
    .catch(function (error) {
        console.trace(error);
    });
};

if (require.main === module) {
    module.exports();
}