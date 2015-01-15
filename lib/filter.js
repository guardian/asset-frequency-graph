var fs = require('fs');
var path = require('path');
var glob = require('glob');

var staticFolder = 'static/src/javascripts';

module.exports = function (basePath) {
	var allJS = {};

	glob.sync(path.join(basePath, staticFolder) + '/**/*.js').forEach(function (file) {
		var normalized = file.substring(file.indexOf(staticFolder));
		allJS[normalized] = {
			content: ''
		};
	});

	return {
		isInteresting: function (files) {
			return files.some(function (file) {
				return !!allJS[file];
			});
		},

		isStaticFile: function (file) {
			return !!allJS[file];
		}
	};
};