var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var Page = require('./out/page');
var tables = require('./out/table');

module.exports = function (config) {
    function toHTML (result) {
        var totalPR = result['Pull requests touching static'],
            title = 'Recent changes',
            css = [
                'bootstrap.min.css',
                'style.css'
            ],
            js = [
                'sorttable.js',
                'd3.js',
                'd3.dependencyWheel.js'
            ];

        if (config.verbose) {
            js.push(
                'jquery-2.1.3.min.js',
                {
                    content: 'var RAW_DATA = ' + JSON.stringify(result) + ';'
                },
                'jsonViewer.js'
            );
        } else {
            js.push(
                {
                    content: 'var RAW_DATA = {matrix: ' + JSON.stringify(result.matrix) + '}'
                },
                'jsonViewer.js'
            );
        }
        js.push('dependencyGraph.js');

        var page = new Page(title, css, js);
        page.block('Pull requests', [
            '<p>Comparing ',
                '<strong>' + totalPR + ' </strong>',
                    'merged pull requests, touching static assets, out of ',
                    result['Pull requests analyzed'] + ' total pull requests analyzed',
            '</p>'
        ].join(''));

        page.block('File changes over time', new tables.FilesTable(result, totalPR));
        page.block('Packages changes over time', new tables.PackageTable(result, totalPR));

        if (config.verbose) {
            page.block('Raw JSON data', '<pre><div id="json-tree"></div></pre>');
        }

        page.block('Dependency graph');
        page.raw('<div id="chord"></div>');

        mkdirp(path.dirname(config.destination), function (err) {
            if (err) console.error(err);
            else fs.writeFile(config.destination, page.toString());
        });
    }

    return {
        toHTML: toHTML
    };
};
