var basePath = '../frontend';

var git = require('./lib/git')(basePath);
var series = require('./lib/series');
var output = require('./lib/output');

var total = {
    'Pull requests analyzed': 0,
    'Pull requests touching static': 0,
    merges: [],
    files: {},
    packages: {}
};
var filter = require('./lib/filter')(basePath);
var packages = {
    'static/src/javascripts/bootstraps/commercial.js': ['one'],
    'static/src/javascripts/bootstraps/common.js': ['one'],
    'static/src/javascripts/bootstraps/facia.js': ['one'],
    'static/src/javascripts/components/videojs-contrib-ads/videojs.ads.js': ['one', 'two'],
    'static/src/javascripts/components/videojs/video.js': ['one', 'two'],
    'static/src/javascripts/projects/common/modules/commercial/ads/sticky-mpu.js': ['one', 'two'],
    'static/src/javascripts/projects/common/modules/commercial/article-aside-adverts.js': ['one', 'three', 'two'],
    'static/src/javascripts/projects/common/modules/commercial/article-body-adverts.js': ['one', 'three', 'two'],
    'static/src/javascripts/projects/common/modules/commercial/badges.js': ['one', 'three', 'two'],
    'static/src/javascripts/projects/common/modules/commercial/build-page-targeting.js': ['one', 'three'],
    'static/src/javascripts/projects/common/modules/commercial/front-commercial-components.js': ['one', 'three'],
    'static/src/javascripts/projects/common/modules/commercial/slice-adverts.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/commercial/tags/container.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/commercial/user-ad-targeting.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/discussion/comment-count.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/experiments/ab.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/experiments/tests/join-us-navigation.js': ['two', 'three'],
    'static/src/javascripts/projects/common/modules/experiments/tests/weather-component.js': ['two'],
    'static/src/javascripts/projects/common/modules/onward/history.js': ['two'],
    'static/src/javascripts/projects/common/modules/preferences/main.js': ['two'],
    'static/src/javascripts/projects/common/modules/ui/selection-sharing.js': ['two'],
    'static/src/javascripts/projects/common/modules/video/supportedBrowsers.js': ['two'],
    'static/src/javascripts/projects/common/utils/detect.js': []
};

git.getAllMergedPullRequests().then(function (merges) {
    total['Pull requests merged'] = merges.length;

    series.iterate(merges, null, function (merge, cb) {
        if (!merge.sha1) {
            return cb();
        }

        git.historyOfMerge(merge.sha1).then(function (files) {
            total['Pull requests analyzed'] += 1;
            merge.files = files;
            merge.isStatic = filter.isInteresting(files);
            if (merge.isStatic) {
                total['Pull requests touching static'] += 1;

                var touchedPackages = {};
                merge.files.forEach(function (file) {
                    if (filter.isStaticFile(file)) {
                        if (!total.files[file]) {
                            total.files[file] = {
                                times: 0,
                                merges: [],
                                packages: packages[file] || []
                            };
                        }
                        total.files[file].times += 1;
                        total.files[file].merges.push(merge);

                        if (packages[file]) {
                            packages[file].forEach(function (pack) {
                                touchedPackages[pack] = true;
                            });
                        }
                    }
                });

                Object.keys(touchedPackages).forEach(function (pack) {
                    if (!total.packages[pack]) {
                        total.packages[pack] = {
                            times: 0,
                            merges: []
                        };
                    }
                    total.packages[pack].times += 1;
                    total.packages[pack].merges.push(merge);
                });
            }
            total.merges.push(merge);
            cb();
        });
    }, function () {
        console.log('END');
        output.toHTML(total);
    });
});
