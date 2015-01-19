module.exports = function (config) {
    function toHTML (result) {
        var totalPR = result['Pull requests touching static'];

        var markup = [
            '<!doctype html>',
            '<html>',
                '<head>',
                    '<title>Recent changes</title>',
                    '<link rel="stylesheet" href="../static/bootstrap.min.css">',
                    '<link rel="stylesheet" href="../static/style.css">',
                '</head>',
                '<body>',
                    '<div class="container">',
                        '<h3>Dependency graph</h3>',
                        '<div id="chord"></div>',
                        '<div id="force"></div>',
                        '<h3>File changes over time</h3>',
                        '<p>Comparing ',
                            '<strong>' + totalPR + ' </strong>',
                                'merged pull requests, touching static assets, out of ',
                                result['Pull requests analyzed'] + ' total pull requests analyzed</p>',
                        '<table class="table table-bordered sortable">',
                            '<thead>',
                                '<tr>',
                                    '<th>File</th>',
                                    '<th>Packages</th>',
                                    '<th>Times changed</th>',
                                    '<th>Percentage</th>',
                                '</tr>',
                            '</thead>',
                            '<tbody>'
        ];

        Object.keys(result.files).sort().forEach(function (file) {
            var fileResult = result.files[file],
                percentage = fileResult.times / totalPR * 100;
            markup.push(
                                '<tr class="' + getFileClass(file, fileResult.packages, percentage) + '">',
                                    '<td>' + file + '</td>',
                                    '<td>' + packagesToHTML(fileResult.packages) + '</td>',
                                    '<td>' + fileResult.times + '</td>',
                                    '<td>' + percentage.toFixed(2) + '%</td>',
                                '</tr>'
            );
        });

        markup.push(
                            '</tbody>',
                        '</table>',
                        '<h3>Packages changes over time</h3>',
                        '<table class="table table-striped table-bordered sortable">',
                            '<thead>',
                                '<tr>',
                                    '<th>Package</th>',
                                    '<th>Times changed</th>',
                                    '<th>Percentage</th>',
                                '</tr>',
                            '</thead>',
                            '<tbody>'
        );
        Object.keys(result.packages).sort().forEach(function (pack) {
            var packResult = result.packages[pack];
            markup.push(
                                '<tr>',
                                    '<td>' + pack + '</td>',
                                    '<td>' + packResult.times + '</td>',
                                    '<td>' + (packResult.times / totalPR * 100).toFixed(2) + '%</td>',
                                '</tr>'
            );
        });

        markup.push(
                            '</tbody>',
                        '</table>',
                    '</div>',
                    '<script src="../static/sorttable.js"></script>',
                    '<script src="../static/d3.js" charset="UTF-8"></script>',
                    '<script src="../static/d3.dependencyWheel.js"></script>',
                    '<script>',
                        'var RAW_DATA = ' + JSON.stringify(result) + ';',
                    '</script>',
                    '<script src="../static/dependencyGraph.js"></script>',
                '</body>',
            '</html>'
        );

        require('fs').writeFileSync(config.destination + '/summary.html', markup.join(''));
    }

    return {
        toHTML: toHTML
    };
};

function packagesToHTML (list) {
    return list.slice(0).map(function (pack) {
        return '<span class="package ' + pack + '">' + pack + '</span>';
    }).join('');
}

function getFileClass (file, packages, percentage) {
    if (packages.length === 0) {
        return 'danger';
    }
}
