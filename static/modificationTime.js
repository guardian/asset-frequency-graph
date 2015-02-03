(function () {
    $('table.files').on('click', 'tr', function (event) {
        return handleClick(event, RAW_DATA.history.files);
    });
    $('table.packages').on('click', 'tr', function (event) {
        return handleClick(event, RAW_DATA.history.packages);
    });

    function handleClick (event, raw) {
        var tableRow = $(event.currentTarget),
            table = tableRow.parents('table'),
            rowCells = tableRow.find('td'),
            fileCell = $(rowCells[0]),
            file = fileCell.text().trim(),
            fileDetails = raw[file];

        if (!fileDetails) {
            var clear = [];
            table.find('tbody tr').each(function (i, row) {
                row = $(row);
                var related = row.data('related');
                if (related) {
                    clear.push(related);
                    row.removeData('related');
                }
            });
            clear.forEach(function (row) {
                row.remove();
            });
            return;
        }

        var relatedRow = tableRow.data('related');
        if (relatedRow) {
            relatedRow.toggle();
        } else {
            relatedRow = generateRelated(
                file,
                fileDetails,
                rowCells.length,
                Number(RAW_DATA['First Pull Request touching static'].timestamp) * 1000
            );
            tableRow.after(relatedRow.element);
            tableRow.data('related', relatedRow.element);
            relatedRow.callback();
        }
        return false;
    }

    function generateRelated(file, fileDetails, span, startFrom) {
        var row = $('<tr><td colspan="' + span + '"><div class="timechart" style="height: 400px"></div></td></tr>'),
            chartDiv = row.find('.timechart')[0];

        return {
            element: row,
            callback: function () {
                generateChart(chartDiv, file, convertData(fileDetails, startFrom));
            }
        };
    }

    function generateChart (chartDiv, file, fileDetails) {
        var chart = AmCharts.makeChart(chartDiv, {
            "type": "serial",
            "pathToImages": "http://www.amcharts.com/lib/3/images/",
            "dataDateFormat": "YYYY-MM-DD",
            "valueAxes": [{
                "id":"v1",
                "axisAlpha": 0,
                "position": "left"
            }],
            "graphs": [{
                "id": "g1",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "scrollbarHeight": 30
            },
            "chartCursor": {
                "cursorPosition": "mouse",
                "pan": true,
                 "valueLineEnabled":true,
                 "valueLineBalloonEnabled":true
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "dashLength": 1,
                "minorGridEnabled": true,
                "position": "top"
            },
            "dataProvider": fileDetails
        });

        chart.addListener("rendered", zoomChart);

        zoomChart();
        function zoomChart(){
            chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);
        }
    }

    function convertData (changes, startDate) {
        var results = [],
            runningDate = '',
            endDate = new Date(),
            oneDay = 24 * 60 * 60 * 1000;

        for (var i = 0, length = endDate - startDate; i < length; i += oneDay) {
            runningDate = dateToString(new Date(startDate + i));
            results.push({
                date: runningDate,
                value: changes[runningDate] || 0
            });
        }
        return results;
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
})();
