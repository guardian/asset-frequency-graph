var Promise = require('es6-promise').Promise;

exports.iterate = function (seedName, seed) {
    if (seedName === 'app') {
        return {
            'static/src/javascripts/projects/common/utils/config.js': {
                'static/src/javascripts/components/lodash-amd/collections/contains.js': {},
                'static/src/javascripts/components/lodash-amd/objects/assign.js': {},
                'static/src/javascripts/projects/common/utils/_.js': {},
                'static/src/javascripts/projects/common/utils/pad.js': {}
            },
            'static/src/javascripts/projects/common/utils/detect.js': {},
            'static/src/javascripts/projects/common/utils/mediator.js': {},
            'static/src/javascripts/projects/common/utils/user-timing.js': {},
            'static/src/javascripts/bootstraps/article.js': {},
            'static/src/javascripts/bootstraps/common.js': {},
            'static/src/javascripts/bootstraps/football.js': {},
            'static/src/javascripts/bootstraps/gallery.js': {},
            'static/src/javascripts/bootstraps/image-content.js': {},
            'static/src/javascripts/bootstraps/liveblog.js': {},
            'static/src/javascripts/bootstraps/media.js': {},
            'static/src/javascripts/bootstraps/profile.js': {},
            'static/src/javascripts/bootstraps/section.js': {},
            'static/src/javascripts/bootstraps/sport.js': {},
            'static/src/javascripts/bootstraps/tag.js': {}
        };
    } else if (seedName === 'commercial') {
        return {
            'static/src/javascripts/projects/common/utils/config.js': {
                'static/src/javascripts/components/lodash-amd/collections/contains.js': {},
                'static/src/javascripts/components/lodash-amd/objects/assign.js': {},
                'static/src/javascripts/projects/common/utils/_.js': {},
                'static/src/javascripts/projects/common/utils/pad.js': {}
            },
            'static/src/javascripts/projects/common/utils/mediator.js': {},
            'static/src/javascripts/projects/common/modules/commercial/article-aside-adverts.js': {},
            'static/src/javascripts/projects/common/modules/commercial/article-body-adverts.js': {},
            'static/src/javascripts/projects/common/modules/commercial/badges.js': {},
            'static/src/javascripts/projects/common/modules/commercial/dfp.js': {},
            'static/src/javascripts/projects/common/modules/commercial/front-commercial-components.js': {},
            'static/src/javascripts/projects/common/modules/commercial/slice-adverts.js': {},
            'static/src/javascripts/projects/common/modules/commercial/tags/container.js': {},
            'static/src/javascripts/projects/common/modules/user-prefs.js': {}
        };
    } else if (seedName === 'common') {
        return {
            'static/src/javascripts/projects/common/modules/analytics/clickstream.js': {},
            'static/src/javascripts/projects/common/modules/analytics/foresee-survey.js': {},
            'static/src/javascripts/projects/common/modules/analytics/livestats.js': {},
            'static/src/javascripts/projects/common/modules/analytics/omniture.js': {},
            'static/src/javascripts/projects/common/modules/analytics/register.js': {},
            'static/src/javascripts/projects/common/modules/analytics/scrollDepth.js': {},
            'static/src/javascripts/projects/common/modules/commercial/user-ad-targeting.js': {},
            'static/src/javascripts/projects/common/modules/crosswords/thumbnails.js': {},
            'static/src/javascripts/projects/common/modules/discussion/comment-count.js': {},
            'static/src/javascripts/projects/common/modules/discussion/loader.js': {},
            'static/src/javascripts/projects/common/modules/experiments/ab.js': {},
            'static/src/javascripts/projects/common/modules/identity/api.js': {},
            'static/src/javascripts/projects/common/modules/identity/autosignin.js': {},
            'static/src/javascripts/projects/common/modules/navigation/navigation.js': {},
            'static/src/javascripts/projects/common/modules/navigation/profile.js': {},
            'static/src/javascripts/projects/common/modules/navigation/search.js': {},
            'static/src/javascripts/projects/common/modules/onward/history.js': {},
            'static/src/javascripts/projects/common/modules/onward/more-tags.js': {},
            'static/src/javascripts/projects/common/modules/onward/onward-content.js': {},
            'static/src/javascripts/projects/common/modules/onward/popular.js': {},
            'static/src/javascripts/projects/common/modules/onward/related.js': {},
            'static/src/javascripts/projects/common/modules/onward/tonal.js': {},
            'static/src/javascripts/projects/common/modules/release-message.js': {},
            'static/src/javascripts/projects/common/modules/social/share-count.js': {},
            'static/src/javascripts/projects/common/modules/ui/dropdowns.js': {},
            'static/src/javascripts/projects/common/modules/ui/faux-block-link.js': {},
            'static/src/javascripts/projects/common/modules/ui/fonts.js': {},
            'static/src/javascripts/projects/common/modules/ui/message.js': {},
            'static/src/javascripts/projects/common/modules/ui/relativedates.js': {},
            'static/src/javascripts/projects/common/modules/ui/smartAppBanner.js': {},
            'static/src/javascripts/projects/common/modules/ui/tabs.js': {},
            'static/src/javascripts/projects/common/modules/ui/toggles.js': {},
            'static/src/javascripts/projects/common/modules/user-prefs.js': {},
            'static/src/javascripts/projects/common/modules/weather.js': {}
        };
    }
};

exports.reverseGraph = function (graph) {
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
}
