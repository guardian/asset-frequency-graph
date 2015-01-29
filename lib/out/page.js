var fs = require('fs');
var path = require('path');

function Page (title, css, js) {
    this.title = title;
    this.css = css || [];
    this.js = js || [];
    this.blocks = [];
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
    this.css.forEach(function (path) {
        markup.push('<style>' + includeFile(path) + '</style>');
    });
    markup.push(
            '</head>',
            '<body>'
    );

    markup = markup.concat(this.blocks);


    this.js.forEach(function (path) {
        var content = path.content;
        if (typeof path === 'string') {
            content = includeFile(path);
        }
        markup.push('<script charset="UTF-8">' + content.replace(/<\/script>/g, '') + '</script>');
    });

    markup.push(
            '</body>',
        '</html>'
    );

    return markup.join('');
};

function includeFile (file) {
    return fs.readFileSync(path.resolve(__dirname + '/../../static/' + file)).toString();
}

module.exports = Page;