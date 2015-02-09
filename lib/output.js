module.exports = function (config) {
    var Page = require('./out/page')(config);
    var tables = require('./out/table')(config);

    function toHTML (result) {
        var totalPR = result['Pull requests touching static'],
            title = 'Recent changes',
            css = [
                'bootstrap.css',
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
                'modificationTime.js',
                {
                    json: {
                        name: 'RAW_DISTRIBUTION',
                        file: !config.distribution ? 'userDistribution' : null,
                        content: config.distribution ? JSON.stringify(config.distribution) : null
                    }
                }, {
                    json: {
                        name: 'RAW_DATA',
                        content: config.verbose ? JSON.stringify(result) : JSON.stringify(reduce(result))
                    }
                }, {
                    json: {
                        name: 'FIRST_LEVEL_PACKAGES',
                        content: JSON.stringify(firstLevelPackage(result.graph))
                    }
                },
                'dependencyGraph.js',
                'costFunction.js',
                'jsonViewer.js'
            ];

        var page = new Page(title, css, js, config.verbose);
        page.block('Pull requests', summary(totalPR, result['Pull requests analyzed']));
        page.block('Packages changes over time', new tables.PackageTable(result, totalPR));
        page.block('Customize packages', packagesTrees(result));
        page.block('File changes over time', new tables.FilesTable(result, totalPR));

        if (config.verbose) {
            page.block('Raw JSON data', '<pre><div class="json-tree" data-ast="RAW_DATA"></div></pre>');
        }

        page.block('Dependency graph');
        page.raw('<div id="chord"></div>');

        return page.toString();
    }

    function reduce (object) {
        var clone = {},
            ignore = ['files'];

        Object.keys(object).forEach(function (key) {
            if (ignore.indexOf(key) === -1) {
                clone[key] = object[key];
            }
        });
        return clone;
    }

    function summary (staticPR, totalPR) {
        return [
            '<p>Comparing ',
                '<strong>' + staticPR + ' </strong>',
                    'merged pull requests, touching static assets, out of ',
                    totalPR + ' total pull requests analyzed.',
            '</p>',
            '<p>Page generated on ' + (new Date()).toUTCString() + '.</p>'
        ].join('');
    }

    function firstLevelPackage (graph) {
        var packages = {};
        Object.keys(graph).forEach(function (pack) {
            packages[pack] = graph[pack].dependencies.map(function (dep) {
                var file = dep.path;
                if (file.indexOf(config.staticFolder) === 0) {
                    file = file.substring(config.staticFolder.length + 1);
                }
                return file;
            });
        });
        return packages;
    }

    function packagesTrees (result) {
        return [
            '<div class="json-tree" data-ast="FIRST_LEVEL_PACKAGES" data-toggle="refreshCost"></div>'
        ].join('');
    }

    return {
        toHTML: toHTML
    };
};
