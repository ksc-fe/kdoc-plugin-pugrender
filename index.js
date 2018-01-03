const pug = require("pug");
const path = require("path");
const index = path.resolve(__dirname, "./index.pug");

module.exports = async function(ctx) {
    ctx.hook.add("dist.before", function(files) {
        const naves = [];
        const hljsStyle = ctx.data.mdHljsStyle;
        const hljscss = "hljs.css";
        if (hljsStyle) {
            ctx.fsWrite(path.join(ctx.data.output, hljscss), hljsStyle);
        }

        ctx.fsEach(function(file) {
            if (file.title) {
                naves.push({
                    titleText: file.title.text,
                    titleContent: file.title.content,
                    path: file.relative,
                    children: file.innerNav
                });
            }
        });
        ctx.fsEach(function(file) {
            const contents = pug.renderFile(
                index,
                Object.assign(
                    {
                        naves: naves,
                        source: "",
                        title: {},
                        innerNav: [],
                        contents: "",
                        codes: [],
                        hljscss: hljsStyle ? hljscss : ""
                    },
                    file.md
                )
            );
            file.extname = ".html";
            file.contents = new Buffer(contents);
        });
    });
};
