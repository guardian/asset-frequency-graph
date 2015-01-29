var config = {
    basePath: '../frontend',
    staticFolder: 'static/src/javascripts',
    seeds: [
        'bootstraps/app.js',
        'bootstraps/commercial.js',
        'core.js'
    ],
    limit: 30,
    destination: 'tmp'
};

var Promise = require('es6-promise').Promise;
var files = require('./lib/files')(config);
var dependencies = require('./lib/dependencies')(config);
var git = require('./lib/git')(config);
var output = require('./lib/output')(config);
var analize = require('./lib/analize')(config);

Promise.all([
    files.findDependencies(dependencies.iterate),
    git.getAllMergedPullRequests()
])
.then(function (result) {
    var graph = result[0],
        merges = result[1],
        dependentMap = dependencies.reverseGraph(graph);

    return analize(dependentMap, merges, graph);
})
.then(function (total) {
    output.toHTML(total);
})
.catch(function (error) {
    console.trace(error);
});
