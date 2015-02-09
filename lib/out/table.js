var prettyBytes = require('pretty-bytes');

module.exports = function (config) {
    var filesColumns = [{
        label: 'File',
        value: function (file, fileResult, totalPR) {
            if (file.indexOf(config.staticFolder) === 0) {
                file = file.substring(config.staticFolder.length + 1);
            }
            return '<a href="#">' + file + '</a>';
        }
    }, {
        label: 'Packages',
        value: function (file, fileResult, totalPR) {
            return packagesToHTML(fileResult.packages);
        }
    }, {
        label: 'Times changed',
        value: function (file, fileResult, totalPR) {
            return fileResult.times;
        }
    }, {
        label: 'Percentage',
        value: function (file, fileResult, totalPR) {
            return (fileResult.times / totalPR * 100).toFixed(2) + '%';
        }
    }, {
        label: 'Created',
        value: function (file, fileResult, totalPR) {
            return fileResult.merges[fileResult.merges.length - 1].relative;
        }
    }, {
        label: 'Last modified',
        value: function (file, fileResult, totalPR) {
            return fileResult.merges[0].relative;
        }
    }, {
        label: 'Gzip',
        value: function (file, fileResult, totalPR) {
            return {
                text: prettyBytes(fileResult.gzip),
                meta: 'sorttable_customkey="' + fileResult.gzip + '"'
            };
        }
    }];

    var packagesColumn = [{
        label: 'Package',
        value: function (packName, packResult, totalPR) {
            return '<a href="#">' + packName + '</a>';
        }
    }, {
        label: 'Times changed',
        value: function (packName, packResult, totalPR) {
            return packResult.times;
        }
    }, {
        label: 'Percentage',
        value: function (packName, packResult, totalPR) {
            return (packResult.times / totalPR * 100).toFixed(2) + '%';
        }
    }, {
        label: 'Cost',
        value: function (packName, packResult, totalPR) {
            return {
                text: '<span class="cost-function" data-pack="' + packName + '"></span>',
                meta: 'class="highlight-change"'
            };
        }
    }, {
        label: 'Cache Hit',
        value: function (packName, packResult, totalPR) {
            return {
                text: '<span class="cache-hit" data-pack="' + packName + '"></span>',
                meta: 'class="highlight-change"'
            };
        }
    }];


    function Table (subclass, options) {
        this.subclass = subclass;
        this.options = options;
    }
    Table.prototype.toString = function () {
        var markup = [
            '<table class="table',
                this.options.bordered === false ? '' : ' table-bordered',
                this.options.striped === false ? '' : ' table-striped',
                this.options.sortable === false ? '' : ' sortable',
                this.options.cssClass ? ' ' + this.options.cssClass : '',
            '">',
                '<thead>',
                    this.subclass.head(),
                '</thead>',
                '<tbody>',
                    this.subclass.body(),
                '</tbody>',
            '</table>'
        ];
        return markup.join('');
    };
    Table.prototype.head = function (iterable) {
        return this.row(
            iterable.map(function (column) {
                return '<th>' + column.label + '</th>';
            }).join('')
        );
    };
    Table.prototype.body = function (iterateOnKeys, iterable, rowCssClass) {
        var iterateKeys = Object.keys(iterateOnKeys).sort(),
            markup = '';

        iterateKeys.forEach(function (key) {
            var value = iterateOnKeys[key];
            markup += this.row(
                iterable.map(function (column) {
                    var columnValue = column.value(key, value, this.options.totalPR);
                    if (typeof columnValue !== 'object') {
                        return '<td>' + columnValue + '</td>';
                    } else {
                        return '<td ' + columnValue.meta + '>' + columnValue.text + '</td>';
                    }
                }, this).join(''),
                rowCssClass ? rowCssClass(key, value, this.options.totalPR) : ''
            );
        }, this);
        return markup;
    };
    Table.prototype.row = function (text, cssClass) {
        return '<tr' + (cssClass ? ' class="' + cssClass + '"' : '') + '>' + text + '</tr>';
    };


    function FilesTable (data, totalPR)  {
        this.table = new Table(this, {
            striped: false,
            totalPR: totalPR,
            cssClass: 'files'
        });
        this.data = data;
    }
    FilesTable.prototype.head = function () {
        return this.table.head(filesColumns);
    };
    FilesTable.prototype.body = function () {
        return this.table.body(this.data.files, filesColumns, function (key, value, totalPR) {
            return getFileClass(key, value.packages);
        });
    };
    FilesTable.prototype.toString = function () {
        return this.table.toString();
    };


    function PackageTable (data, totalPR)  {
        this.table = new Table(this, {
            totalPR: totalPR,
            cssClass: 'packages'
        });
        this.data = data;
    }
    PackageTable.prototype.head = function () {
        return this.table.head(packagesColumn);
    };
    PackageTable.prototype.body = function () {
        return this.table.body(this.data.packages, packagesColumn);
    };
    PackageTable.prototype.toString = function () {
        return this.table.toString();
    };


    var cssKeyCounter = 0;
    var packagesCssKey = {};
    function packagesToHTML (list) {
        return list.slice(0).map(function (pack) {
            var cssClass = packagesCssKey[pack];
            if (!cssClass) {
                cssKeyCounter += 1;
                packagesCssKey[pack] = 'p' + cssKeyCounter;
                cssClass = packagesCssKey[pack];
            }
            return '<span class="package ' + cssClass + '">' + pack + '</span>';
        }).join('');
    }

    function getFileClass (file, packages, totalPR) {
        if (packages.length === 0) {
            return 'danger';
        }
    }

    return {
        FilesTable: FilesTable,
        PackageTable: PackageTable
    };
};
