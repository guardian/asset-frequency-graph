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
        this.css.forEach(this.verbose ? function (css) {
            markup.push('<link rel="stylesheet" href="' + path.resolve(__dirname + '/../../static/' + css) + '"/>');
        } : function (css) {
            markup.push('<style>' + includeFile(css) + '</style>');
        });
    };

    Page.prototype.includeJS = function (markup) {
        this.js.forEach(this.verbose ? function (js) {
            if (typeof js === 'string') {
                markup.push('<script charset="UTF-8" src="' + path.resolve(__dirname + '/../../static/' + js) + '"></script>');
            } else if (js.content) {
                markup.push('<script charset="UTF-8">' + js.content.replace(/<\/script>/g, '') + '</script>');
            } else if (js.json) {
                var content = js.json.content || includeFile(js.json.file + '.json', 'assets');
                markup.push('<script charset="UTF-8">var ' + js.json.name + '=' + content + '</script>');
            }
        } : function (js) {
            var content;
            if (typeof js === 'string') {
                content = includeFile(js);
            } else if (js.content) {
                content = js;
            } else if (js.json) {
                content = js.json.content || includeFile(js.json.file + '.json', 'assets');
                content = 'var ' + js.json.name + '=' + content;
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
