(function (global) {
    var PACKAGES_SIZE,
        HISTORY,
        LIMIT_DAYS = RAW_DATA.config.costDays || 15;

    global.refreshCost = function (exclude) {
        PACKAGES_SIZE = computeSizeOfPackages(RAW_DATA, exclude);
        HISTORY = computeHistory(RAW_DATA, exclude);

        $('.cost-function').each(function (i, element) {
            computeCost(element, function (daysSinceLastChange, pack) {
                return gzipCostFunction(daysSinceLastChange, PACKAGES_SIZE[pack]);
            }, function (result) {
                return prettyBytes(result);
            });
        });

        $('.cache-hit').each(function (i, element) {
            computeCost(element, function (daysSinceLastChange, pack) {
                return cacheCostFunction(daysSinceLastChange);
            }, function (result) {
                return (result / LIMIT_DAYS * 100).toFixed(2) + '%';
            });
        });
    };
    global.refreshCost();

    function computeCost (element, fn, format) {
        element = $(element);
        var pack = element.data('pack'),
            cell = element.parents('td'),
            data = HISTORY[pack],
            startDate = new Date(),
            totalCost = 0,
            daysSinceLastChange = 0,
            previousValue = element.text(),
            newValue;

        startDate.setDate(startDate.getDate() - LIMIT_DAYS);
        iterateDays(startDate, function (runningDate) {
            totalCost += fn(daysSinceLastChange, pack);
            if (data[runningDate] > 0) {
                daysSinceLastChange = 0;
            } else {
                daysSinceLastChange += 1;
            }
        });
        newValue = '' + format(totalCost);
        element.html(newValue);

        if (previousValue && previousValue !== newValue) {
            cell.addClass('highlighted');
            setTimeout(function () {
                cell.removeClass('highlighted');
            }, 500);
        }
    }

    function gzipCostFunction (daysSinceLastChange, packSize) {
        return (RAW_DISTRIBUTION.uniqueVisitors - usersWithCache(daysSinceLastChange)) * packSize;
    }

    function cacheCostFunction (daysSinceLastChange) {
        return usersWithCache(daysSinceLastChange) / RAW_DISTRIBUTION.uniqueVisitors;
    }

    function usersWithCache (daysSinceLastChange) {
        var number = 0;
        for (var i = 0; i < daysSinceLastChange; i += 1) {
            number += RAW_DISTRIBUTION.returningVisitors[i];
        }
        return number;
    }

    function computeSizeOfPackages (data, exclude) {
        var sizes = {};
        Object.keys(data.packages).forEach(function (pack) {
            sizes[pack] = 0;

            var excludeInPackage = (exclude || {})[pack] || [],
                files = filesInPackage(data.graph[pack]);

            excludeInPackage = excludeInPackage.map(function (file) {
                return data.config.staticFolder + '/' + file;
            });

            files.forEach(function (file) {
                if (excludeInPackage.indexOf(file) === -1) {
                    sizes[pack] += data.size[file];
                }
            });
        });
        return sizes;
    }

    function computeHistory (data, exclude) {
        if (!exclude) {
            return data.history.packages;
        } else {
            var result = {};

            Object.keys(data.packages).forEach(function (pack) {
                var filteredFiles = {},
                    excludedFiles = exclude[pack] || [];

                excludedFiles = excludedFiles.map(function (file) {
                    return data.config.staticFolder + '/' + file;
                });

                data.graph[pack].dependencies.forEach(function (dep) {
                    if (excludedFiles.indexOf(dep.path) === -1) {
                        filteredFiles[dep.path] = true;
                        iterate(dep.dependencies, function (file) {
                            filteredFiles[file] = true;
                        });
                    }
                });

                result[pack] = {};
                data.packages[pack].merges.forEach(function (merge) {
                    var isInteresting = merge.files.some(function (file) {
                        return !!filteredFiles[file] || data.graph[pack].path === file;
                    });
                    if (isInteresting) {
                        if (!result[pack][merge.formatDate]) {
                            result[pack][merge.formatDate] = 0;
                        }
                        result[pack][merge.formatDate] += 1;
                    }
                });
            });

            return result;
        }
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
})(this);
