var git = require('git-promise');

module.exports = function (config) {
    var cwd = {
        cwd: config.basePath
    };

    return {
        getAllMergedPullRequests: function () {
            return git(
                'log --merges --format=format:\'%H%x00%cr%x00%cd%x00%ct%x00%s\' --grep \'Merge pull request\'',
                cwd,
                function (output) {
                    return output.split('\n').map(function (merge) {
                        var tokens = merge.split(String.fromCharCode(0));
                        return {
                            sha1: tokens[0],
                            relative: tokens[1],
                            prettyDate: tokens[2],
                            timestamp: tokens[3],
                            message: tokens[4]
                        };
                    }).filter(function (merge) {
                        return !!merge.sha1;
                    });
                }
            );
        },

        historyOfMerge: function (sha1) {
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
    };
};
