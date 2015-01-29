function Matrix () {
    this.names = [];
    this.rows = [];
}
Matrix.prototype.addAndGet = function (name) {
    var position = this.names.indexOf(name);
    if (position === -1) {
        this.names.push(name);
        position = this.names.length - 1;
        this.rows.push(new DependencyRow(position));
    }
    return this.rows[position];
};
Matrix.prototype.markDependencies = function (from, objectTo) {
    objectTo.forEach(function (to) {
        var dependant = this.addAndGet(to.name);
        from.mark(dependant);

        if (to.dependencies.length) {
            this.markDependencies(dependant, to.dependencies);
        }
    }, this);
};
Matrix.prototype.toChordData = function () {
    var length = this.names.length;
    return {
        packageNames: this.names.slice(0).map(function (file) {
            var shortName = file.indexOf('static/src/javascripts/');
            if (shortName === 0) {
                file = file.substring(23);
            }
            return file;
        }),
        matrix: this.rows.map(function (row) {
            return row.toArray(length);
        })
    };
};
Matrix.prototype.toForceData = function () {
    var links = [];
    this.rows.forEach(function (row, source) {
        Object.keys(row.dependsOn).forEach(function (target) {
            links.push({
                source: source,
                target: Number(target),
                value: 1
            });
        });
    });

    return {
        nodes: this.names.map(function (file) {
            var shortName = file.indexOf('static/src/javascripts/');
            if (shortName === 0) {
                file = file.substring(23);
            }
            return {
                name: file,
                group: ['app', 'commercial', 'core'].indexOf(file) === -1 ? 0 : 1
            };
        }),
        links: links
    };
};

function DependencyRow (position) {
    this.position = position;
    this.dependsOn = {};
}
DependencyRow.prototype.mark = function (row) {
    this.dependsOn[row.position] = true;
};
DependencyRow.prototype.toArray = function (length) {
    var array = [];
    for (var i = 0; i < length; i += 1) {
        if (this.dependsOn[i]) {
            array.push(1);
        } else {
            array.push(0);
        }
    }
    return array;
};

module.exports = Matrix;
