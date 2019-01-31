const path = require("path");
const url = require("url");
const request = require("request-promise-native");
const imageType = require("image-type");
const shortid = require("shortid");
const fs = require("fs");

exports.equativePath = (filePath, relativePath = "") => {
    return path.resolve(filePath, "..", relativePath);
};
exports.checkRelative = link => require("is-relative-url")(link); //|| require("is-relative")(link);
exports.checkValid = link => require("valid-url").isUri(link) || require("valid-path")(link);
exports.downloader = async function(imgUrl, downloadPath, options = {}) {
    try {
        // 图片名处理
        const urlPathname = url.parse(imgUrl).pathname,
            hasExtName = path.extname(urlPathname);
        let basename = path.basename(urlPathname);
        // 是否覆盖同名图片（对无后缀图片暂时无解）
        if (!options.cover && hasExtName && fs.existsSync(path.join(downloadPath, basename)))
            return;

        const res = await request({
            method: "GET",
            uri: imgUrl,
            resolveWithFullResponse: true,
            encoding: null // 返回binary格式数据
        });

        if (res.body && (res.statusCode === 200 || res.statusCode === 201)) {
            // 如果url没有文件后缀名，则加上后缀
            if (!hasExtName) basename = basename + "." + imageType(res.body).ext;
            // 如果存在同名图片，则改名
            if (fs.existsSync(path.join(downloadPath, basename)))
                basename = shortid.generate() + "-" + basename;

            fs.writeFileSync(path.join(downloadPath, basename), res.body, "binary", err => {
                if (err) {
                    throw new Error(`图片写入失败. URL: ${imgUrl}`);
                }
                // if (typeof done === "function") {
                //     done(false, options.dest, res.body);
                // }
            });

            return basename;
        } else {
            if (!res.body) {
                throw new Error(`图片下载失败，empty body. URL: ${imgUrl}`);
            }
            throw new Error(`图片下载失败，${res.statusCode}. URL: ${imgUrl}`);
        }
    } catch (err) {
        console.error(err);
    }
};
