const fs = require("fs");
const path = require("path");
const shortid = require("shortid");
const imageType = require("image-type");
const imageDownload = require("image-download");
const listFilepaths = require("list-filepaths");

const mdimgrp = /!\[.*?\]\((.*?)\)/g,
    imgurlrp = /!\[.*?\]\((.*?)\)/;

class imgLocalizer {
    /**
     * constructor
     * @todo support for `timeout` and `maxRedirects`
     */
    constructor() {
        this.stack = [];
    }

    /**
     * Returns a new object of `imgLocalizer` class
     * @description In external references, without initialization can access the methods in this class
     */
    static init() {
        return new imgLocalizer();
    }

    /**
     * Find and return image links in markdown
     * @param {string} content markdown plain text
     * @todo `options` with the following parameters
     * - `options.filterate` Whether to filter out local image links
     * - `options.baseUrl` When relative paths are encountered, this url will be used to join
     * - `options.responsity` Special `options.baseUrl` for GitHub repositories such as `gylidian/string-once-split`.
     * As for the other git hosting platform warehouse can only use the `options.baseUrl`
     * @todo Let `content` support Buffer
     */
    static find(content) {
        if (typeof content !== "string") throw new TypeError("content passed is not a string!");

        let result = [],
            match;
        while ((match = mdimgrp.exec(content)) != null) {
            let link = imgurlrp.exec(match[0]);
            if (link) link = link[1];

            result.push(link);
        }

        return result;
    }

    /**
     * Parsing markdown text as `dirImgObj`
     * @param {string} content markdown plain text
     * @param {string} defaultPath A default image download path must be specified
     */
    async extract(content, defaultPath = path.resolve(__dirname + "assets")) {
        let urlObj = [];
        urlObj.push({
            path: defaultPath,
            image: imgLocalizer.find(content)
        });
        stack = urlObj;
        return this;
    }

    /**
     * List the pathnames of all markdown files in the directory
     * @param {string} path pathname containing markdown file
     * @returns {Array} A One-Dimensional Array of Path Names
     * @todo `options.depth` specifies the depth of the generated directory tree
     */
    static async listMdPath(path, options = {}) {
        options.filter = /.*\.md$/;
        const dirArr = await listFilepaths(path, options);
        return Promise.resolve(dirArr);
    }

    /**
     * Resolve image links in all markdown files in the path as `dirImgObj`
     * @param {string} path pathname containing markdown file
     */
    async extractDir(path) {
        // TODO: check is-path & check is-Stats-obj
        let urlObj = [];
        const dirArr = await imgLocalizer.listMdPath(path);

        for (const dir of dirArr) {
            const buffer = fs.readFileSync(dir);
            const markdown = buffer.toString();
            urlObj.push({
                path: dir,
                image: imgLocalizer.find(markdown) // TODO: check is-absolute/relative & join url & filter local-image
            });
        }

        this.stack = urlObj;
        return this;
    }

    /**
     * get the existing `dirImgObj`
     */
    get() {
        return this.stack ? this.stack : [];
    }

    /**
     * Download all image links according to `dirImgObj` and replace them in the markdown source file
     * @returns {dirImgObj} Return an `dirImgObj` after completion
     * - key `image` means the image links successfully downloaded and replaced
     * - key `error` means the image links unsuccessfully downloaded and replaced
     * @todo `options.location` supports for replacing the default baseUrl of the image with the specified URL
     * @todo To replace the picture link according to the markdown AST tree. Mainly to prevent the replacement of text with the same picture links
     * @todo Failure handling
     */
    async down() {
        const relative = "assets";

        for (const item of this.stack) {
            let markdown = fs.readFileSync(item.path).toString();
            const pathname = path.resolve(
                item.path.slice(0, item.path.lastIndexOf("\\") + 1),
                relative
            );
            if (!fs.existsSync(pathname)) fs.mkdirSync(pathname);
            let success = [],
                error = [];
            for (const url of item.image) {
                try {
                    const buffer = await imageDownload(url);
                    const type = imageType(buffer);

                    const filename = `${shortid.generate()}.${type.ext}`;
                    // TODO: check filename-valid
                    fs.writeFileSync(path.resolve(pathname, filename), buffer); // fs.createWriteStream

                    markdown = markdown.replace(url, `../${relative}/${filename})`);

                    success.push(filename);
                } catch (err) {
                    error.push(url);
                    console.log(err);
                }
            }
            if (success.length) {
                item.image = success;
                fs.writeFileSync(item.path, markdown);
            }
            if (error.length) item.error = error;
        }

        return this.get();
    }
}

exports.imgLocalizer = imgLocalizer;
exports.imgLoc = imgLocalizer.init();
