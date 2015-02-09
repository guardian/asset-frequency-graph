(function () {
    function Tree (element) {
        var tree = $(element),
            ast = window[tree.data('ast')],
            toggle = window[tree.data('toggle')];

        tree.html(generateList("", ast));
        tree.on("click", "li.expand", function (event) {
            handleClick(event, $(this), ast);
        });
        if (toggle) {
            tree.on('click', '.value.string', function (event) {
                toggleElement(event, $(this));
                toggle(generateExcludedList(tree, ast));
            });
        }
    }

    function generateList (path, ast) {
        var content = $("<ul>");
        for (var key in ast) {
            var fullPath = path ? path + "|" + key : key;
            if (jQuery.isArray(ast[key])) {
                content.append(generateRecurringNode(fullPath, key, ast[key]));
            } else if (jQuery.isPlainObject(ast[key])) {
                content.append(generateObjectNode(fullPath, key, ast[key]));
            } else {
                content.append(generatePlainNode(key, ast[key]));
            }
        }
        return content;
    }

    function expandableTemplate (model) {
        var tpl = "<li data-id='%id%' data-collapsed='%value%' class='expand closed'><i/><span class='key'>%key%:</span><div class='more'>%value%</div></li>";
        return tpl.replace(/%([a-z]+)%/g, function (wholeMatch, key) {
            return model[key];
        });
    }

    function generateObjectNode (path, key, ast) {
        var model = {
            id : path,
            key : key,
            value : "{}"
        };
        return $(expandableTemplate(model));
    }

    function generateRecurringNode (path, key, ast) {
        var model = {
            id : path,
            key : key,
            value : "[" + ast.length + "]"
        };
        return $(expandableTemplate(model));
    }

    function generatePlainNode (key, value) {
        var actualValue = (value && value.call) ? "function () {}" : JSON.stringify(value);
        return $("<li class='plain'><i/><span class='key'>" + key + ":</span><span class='value " + typeof value + "'>" + actualValue + "</span></li>");
    }

    function extractObject (id, ast) {
        var path = id.split("|");
        var container = ast;
        while (path.length > 0) {
            var token = path.shift();
            container = container[token];
        }
        return container;
    }

    function handleClick (event, element, ast) {
        var target = $(event.target);

        if (!target.is(".expand") && !target.parent().is(".expand")) {
            // Don't react on clicks inside .more
            event.stopPropagation();
            return;
        }

        if (element.hasClass("closed")) {
            var id = element.data("id");
            var object = extractObject(id, ast);
            var content = generateList(id, object);
            element.children(".more").html(content);
            element.removeClass("closed");
            event.stopPropagation();
        } else {
            element.children(".more").html(element.attr("data-collapsed"));
            element.addClass("closed");
            event.stopPropagation();
        }
    }

    function toggleElement (event, element) {
        element.toggleClass('strike');
    }

    function generateExcludedList (tree, ast) {
        var packages = {};
        Object.keys(ast).forEach(function (pack) {
            var container = tree.find('li[data-id=' + pack +']');
            packages[pack] = [];
            container.find('.strike').each(function (i, element) {
                packages[pack].push($(element).text().trim().replace(/(^")|("$)/g, ''));
            });
        });
        return packages;
    }

    $(function () {
        $('.json-tree').each(function (i, element) {
            new Tree(element);
        });
    });
})();