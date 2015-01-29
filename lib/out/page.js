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
                '<title>' + this.title + '</title>'
    ];
    this.css.forEach(function (path) {
        markup.push('<link rel="stylesheet" href="' + path + '">');
    });
    markup.push(
            '</head>',
            '<body>'
    );

    markup = markup.concat(this.blocks);


    this.js.forEach(function (path) {
        if (typeof path === 'string') {
            markup.push('<script src="' + path + '" charset="UTF-8"></script>');
        } else {
            markup.push('<script>' + path.content + '</script>');
        }
    });

    markup.push(
            '</body>',
        '</html>'
    );

    return markup.join('');
};

module.exports = Page;