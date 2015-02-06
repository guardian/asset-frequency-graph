(function () {
    var packagesSize = computeSizeOfPackages(RAW_DATA);

    $('.cost-function').each(function (i, element) {
        element = $(element);
        var pack = element.data('pack'),
            data = RAW_DATA.history.packages[pack],
            startDate = new Date(),
            totalCost = 0,
            daysSinceLastChange = 0;

        startDate.setDate(startDate.getDate() - 15);
        iterateDays(startDate, function (runningDate) {
            if (data[runningDate] > 0) {
                daysSinceLastChange = 0;
            } else {
                daysSinceLastChange += 1;
            }
            totalCost += costFunction(daysSinceLastChange, packagesSize[pack]);
        });
        element.html(prettyBytes(totalCost));
    });

    function costFunction (daysSinceLastChange, packSize) {
        var usersWithCache = 0;
        for (var i = 0; i < daysSinceLastChange; i += 1) {
            usersWithCache += RAW_DISTRIBUTION.returningVisitors[i];
        }
        return (RAW_DISTRIBUTION.uniqueVisitors - usersWithCache) * packSize;
    }

    function computeSizeOfPackages (data) {
        var sizes = {};
        Object.keys(data.packages).forEach(function (pack) {
            sizes[pack] = 0;

            var files = filesInPackage(data.graph[pack]);
            files.forEach(function (file) {
                sizes[pack] += data.size[file];
            });
        });
        return sizes;
    }

    function filesInPackage (tree) {
        var allDependencies = [];
        iterate(tree.dependencies, function (file) {
            if (allDependencies.indexOf(file) === -1) {
                allDependencies.push(file);
            }
        });
        return allDependencies;
    }

    function iterate (dependencies, callback) {
        dependencies.forEach(function (dep) {
            callback(dep.path);

            if (dep.dependencies && dep.dependencies.length) {
                iterate(dep.dependencies, callback);
            }
        });
    }

    function iterateDays (startDate, action) {
        var runningDate = '',
            endDate = new Date(),
            oneDay = 24 * 60 * 60 * 1000;

        if (startDate instanceof Date) {
            startDate = +startDate;
        }

        for (var i = 0, length = endDate - startDate; i < length; i += oneDay) {
            runningDate = dateToString(new Date(startDate + i));
            action(runningDate);
        }
    }

    function dateToString (date) {
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join('-');
    }

    function pad (number) {
        return (number < 10 ? '0' : '') + number;
    }

    function prettyBytes (num) {
        var exponent;
        var unit;
        var neg = num < 0;
        var units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        if (neg) {
            num = -num;
        }

        if (num < 1) {
            return (neg ? '-' : '') + num + ' B';
        }

        exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
        num = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
        unit = units[exponent];

        return (neg ? '-' : '') + num + ' ' + unit;
    }
})();