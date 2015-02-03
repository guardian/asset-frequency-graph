var Page = require('./out/page');
var tables = require('./out/table');

module.exports = function (config) {
    function toHTML (result) {
        var totalPR = result['Pull requests touching static'],
            title = 'Recent changes',
            css = [
                'bootstrap.min.css',
                'style.css',
                'amstyle.css'
            ],
            js = [
                'jquery-2.1.3.min.js',
                'sorttable.js',
                'd3.js',
                'd3.dependencyWheel.js',
                'amcharts.js',
                'serial.js',
                'modificationTime.js'
            ];

        if (config.verbose) {
            js.push(
                {
                    content: 'var RAW_DATA = ' + JSON.stringify(result) + ';'
                },
                'jsonViewer.js'
            );
        } else {
            js.push(
                {
                    content: 'var RAW_DATA=' + JSON.stringify(reduce(result))
                }
            );
        }
        js.push('dependencyGraph.js');

        var page = new Page(title, css, js, config.verbose);
        page.block('Pull requests', [
            '<p>Comparing ',
                '<strong>' + totalPR + ' </strong>',
                    'merged pull requests, touching static assets, out of ',
                    result['Pull requests analyzed'] + ' total pull requests analyzed.',
            '</p>',
            '<p>Page generated on ' + (new Date()).toUTCString() + '.</p>'
        ].join(''));

        page.block('File changes over time', new tables.FilesTable(result, totalPR));
        page.block('Packages changes over time', new tables.PackageTable(result, totalPR));

        if (config.verbose) {
            page.block('Raw JSON data', '<pre><div id="json-tree"></div></pre>');
        }

        page.block('Dependency graph');
        page.raw('<div id="chord"></div>');

        return page.toString();
    }

    function reduce (object) {
        var clone = {},
            ignore = ['merges', 'files'];

        Object.keys(object).forEach(function (key) {
            if (ignore.indexOf(key) === -1) {
                clone[key] = object[key];
            }
        });
        return clone;
    }

    return {
        toHTML: toHTML
    };
};
