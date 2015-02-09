var path = require('path');
var fs = require('fs');
var git = require('git-promise');
var mkdirp = require('mkdirp');
var series = require('./series');
var Promise = require('es6-promise').Promise;
var logger = require('./logger');
var moment = require('moment');

module.exports = function (config) {
    var cwd = {
        cwd: config.basePath
    },
    tmpFile = path.join(__dirname, '../tmp/git.json');

    function historyOfMerge (sha1) {
        return git(
            'diff --name-only ' + sha1 + ' ' + sha1 + '~1',
            cwd,
            function (output) {
                return output.split('\n').filter(function (line) {
                    return !!line;
                });
            }
        );
    }

    return {
        getAllMergedPullRequests: function () {
            // because some environment don't handle spaces very well, use multiple greps
            return git(
                'log --merges --format=format:"%H%x00%cr%x00%ct%x00%s"' +
                    ' --grep=Merge --grep=pull --grep=request --all-match --fixed-strings',
                cwd,
                function (output) {
                    return output.split('\n').map(function (merge) {
                        var tokens = merge.split(String.fromCharCode(0));
                        return {
                            sha1: tokens[0],
                            relative: tokens[1],
                            timestamp: tokens[2],
                            message: tokens[3],
                            formatDate: moment(Number(tokens[2]) * 1000).format('YYYY-MM-DD')
                        };
                    }).filter(function (merge) {
                        return !!merge.sha1;
                    });
                }
            );
        },

        repositoryHistory: function (merges, action) {
            return new Promise(function (resolve, reject) {
                var allHistory = {};

                if (config.fromDisk && fs.existsSync(tmpFile)) {
                    logger('Get repository history from cache');
                    allHistory = JSON.parse(fs.readFileSync(tmpFile).toString());
                    merges.forEach(function (merge) {
                        if (merge.sha1 && allHistory[merge.sha1]) {
                            action(merge, allHistory[merge.sha1]);
                        }
                    });
                    resolve();
                    return;
                }
                logger('Get repository history');

                series.iterate(merges, config.limit, function (merge, cb) {
                    if (!merge.sha1) {
                        return cb();
                    }

                    historyOfMerge(merge.sha1).then(function (files) {
                        allHistory[merge.sha1] = files;
                        action(merge, files);
                        cb();
                    }, function (error) {
                        reject(error);
                    });
                }, function () {
                    if (config.fromDisk) {
                        mkdirp.sync(path.dirname(tmpFile));
                        fs.writeFileSync(tmpFile, JSON.stringify(allHistory));
                    }
                    resolve();
                });
            });
        }
    };
};
