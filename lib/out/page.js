var fs = require('fs');
var path = require('path');

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
        '<div class="container">',
            '<h3>' + title + '</h3>',
            content.toString ? content.toString() : content,
        '</div>'
    );
};

Page.prototype.raw = function(html) {
    this.blocks.push(html);
};

Page.prototype.toString = function () {
    var markup = [
        '<!doctype html>',
        '<html>',
            '<head>',
                '<meta charset="utf-8">',
                '<title>' + this.title + '</title>'
    ];
    this.includeCSS(markup);
    markup.push(
            '</head>',
            '<body>'
    );

    markup = markup.concat(this.blocks);

    this.includeJS(markup);
    markup.push(
            '</body>',
        '</html>'
    );

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
        var content = path.content;
        if (typeof path === 'string') {
            markup.push('<script charset="UTF-8" src="../static/' + path + '"></script>');
        } else {
            markup.push('<script charset="UTF-8">' + content.replace(/<\/script>/g, '') + '</script>');
        }
    } : function (path) {
        var content = path.content;
        if (typeof path === 'string') {
            content = includeFile(path);
        }
        markup.push('<script charset="UTF-8">' + content.replace(/<\/script>/g, '') + '</script>');
    });
};


function includeFile (file) {
    return fs.readFileSync(path.resolve(__dirname + '/../../static/' + file)).toString();
}

module.exports = Page;