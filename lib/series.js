var async = require('async');
var ProgressBar = require('progress');

exports.iterate = function (array, limit, iteratee, callback) {
	var bar = new ProgressBar(':bar :percent :eta seconds left', {
		total: limit || array.length,
		width: 40
	});
	var counter = 0;

	async.mapSeries(array, function (element, cb) {
		counter += 1;

		if (limit && counter > limit) {
			setImmediate(cb);
            return;
		}

		bar.tick();
		setImmediate(function () {
			// console.log('iteration ' + counter + ' of ' + array.length);
			iteratee(element, cb);
		});
	}, callback);
};
