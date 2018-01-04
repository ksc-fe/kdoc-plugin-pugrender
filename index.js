const pug = require("pug");
const path = require("path");
const index = path.resolve(__dirname, "./index.pug");

function catalogsTree(catalogs) {
    let tree = [];

    while (catalogs.length) {
        const catalog = catalogs.shift();
        if (catalog.level === 1) {
            tree.push({
                title: catalog.text,
                path: `#${catalog.id}`,
                level: catalog.level,
                content: catalog.content,
                text: catalog.text,
                children: []
            });
        } else {
            let end = tree[tree.length - 1];
            if (!end) {
                end = {
                    children: []
                };
                tree.push(end);
            }
            let current = end;
            for (let index = 0; index < catalog.level - 2; index++) {
                current.children = current.children || [];
                let obj = current.children[current.children.length - 1];
                if (!obj) {
                    obj = {
                        children: []
                    };
                    current.children.push(obj);
                }
                current = obj;
            }
            current.children.push({
                title: catalog.text,
                path: `#${catalog.id}`,
                level: catalog.level,
                content: catalog.content,
                text: catalog.text,
                children: []
            });
        }
    }
    return tree;
}
function getSideBar(ctx) {
    const sideBars = {};
    ctx.fsEach(function(file) {
        file.extname = ".html";
        const md = file.md;
        const setting = md.setting;
        if (setting) {
            sideBars[setting.category] = sideBars[setting.category] || [];
            sideBars[setting.category].push({
                title: setting.title,
                path: file.relative,
                children: catalogsTree(md.catalogs)
            });
        }
    });
    console.dir(JSON.stringify(sideBars));
    return sideBars;
}

module.exports = async function(ctx) {
    ctx.hook.add("dist.before", function(files) {
        const hljsStyle = ctx.data.mdHljsStyle;
        const hljscss = "hljs.css";
        if (hljsStyle) {
            ctx.fsWrite(path.join(ctx.data.output, hljscss), hljsStyle);
        }
        const sides = getSideBar(ctx);
        ctx.fsEach(function(file) {
            const contents = pug.renderFile(
                index,
                Object.assign(
                    {
                        sides: sides,
                        hljscss: hljsStyle ? hljscss : ""
                    },
                    file.md
                )
            );
            file.contents = new Buffer(contents);
        });
    });
};
