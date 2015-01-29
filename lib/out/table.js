var prettyBytes = require('pretty-bytes');

var filesColumns = [{
    label: 'File',
    value: function (file, fileResult, totalPR) {
        return file;
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
        return packName;
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
        totalPR: totalPR
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
        totalPR: totalPR
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



function packagesToHTML (list) {
    return list.slice(0).map(function (pack) {
        return '<span class="package ' + pack + '">' + pack + '</span>';
    }).join('');
}

function getFileClass (file, packages, totalPR) {
    if (packages.length === 0) {
        return 'danger';
    }
}



module.exports = {
    FilesTable: FilesTable,
    PackageTable: PackageTable
};
