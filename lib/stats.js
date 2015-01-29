var UglifyJS = require("uglify-js");
var gzipSize = require('gzip-size');

module.exports = function (file, data, cb) {
    var errorResult = {
        content: null,
        size: NaN,
        gzip: NaN
    };

    if (!data) {
        return cb(errorResult);
    }

    var minified = UglifyJS.minify(data.toString(), {
        fromString: true
    });

    gzipSize(minified.code, function (err, result) {
        if (err) {
            return cb(errorResult);
        }

        cb({
            content: minified.code,
            size: minified.code.length,
            gzip: result
        });
    });
};
