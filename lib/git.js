var git = require('git-promise');

module.exports = function (config) {
    var cwd = {
        cwd: config.basePath
    };

    return {
        getAllMergedPullRequests: function () {
            return git(
                'log --merges --format=oneline --grep \'Merge pull request\'',
                cwd,
                function (output) {
                    return output.split('\n').map(function (merge) {
                        var tokens = merge.split(' ');
                        return {
                            sha1: tokens.shift(),
                            message: tokens.join(' ')
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
