var fs = require('fs');
var path = require('path');

module.exports = function (config) {

    function Page (title, css, js, verbose) {
        this.title = title;
        this.css = css || [];
        this.js = js || [];
        this.blocks = [];
        this.verbose = verbose;
    }

    Page.prototype.block = function(title, content) {
        content = content || '';
        this.blocks.push(
            config.fullPage ? '<div class="container">' : '',
                '<h3>' + title + '</h3>',
                content.toString ? content.toString() : content,
            config.fullPage ? '</div>' : ''
        );
    };

    Page.prototype.raw = function(html) {
        this.blocks.push(html);
    };

    Page.prototype.toString = function () {
        var markup = config.fullPage ? [
            '<!doctype html>',
            '<html>',
                '<head>',
                    '<meta charset="utf-8">',
                    '<title>' + this.title + '</title>'
        ] : [];

        this.includeCSS(markup);

        if (config.fullPage) {
            markup.push(
                '</head>',
                '<body>'
            );
        }

        markup = markup.concat(this.blocks);

        this.includeJS(markup);

        if (config.fullPage) {
            markup.push(
                '</body>',
            '</html>'
            );
        }

        return markup.join('');
    };

    Page.prototype.includeCSS = function (markup) {
        this.css.forEach(this.verbose ? function (path) {
            markup.push('<link rel="stylesheet" href="../static/' + path + '"/>');
        } : function (path) {
            markup.push('<style>' + includeFile(path) + '</style>');
        });
    };

    Page.prototype.includeJS = function (markup) {
        this.js.forEach(this.verbose ? function (path) {
            if (typeof path === 'string') {
                markup.push('<script charset="UTF-8" src="../static/' + path + '"></script>');
            } else if (path.content) {
                markup.push('<script charset="UTF-8">' + path.content.replace(/<\/script>/g, '') + '</script>');
            } else if (path.json) {
                var content = path.json.content || includeFile(path.json.file + '.json', 'assets');
                markup.push('<script charset="UTF-8">var ' + path.json.name + '=' + content + '</script>');
            }
        } : function (path) {
            var content;
            if (typeof path === 'string') {
                content = includeFile(path);
            } else if (path.content) {
                content = path;
            } else if (path.json) {
                content = path.json.content || includeFile(path.json.file + '.json', 'assets');
                content = 'var ' + path.json.name + '=' + content;
            }
            markup.push('<script charset="UTF-8">' + content.replace(/<\/script>/g, '') + '</script>');
        });
    };


    function includeFile (file, basePath) {
        basePath = '/../../' + (basePath || 'static') + '/';
        return fs.readFileSync(path.resolve(__dirname + basePath + file)).toString();
    }

    return Page;
};
