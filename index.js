const fs = require("fs");
const path = require("path");
const listFilepaths = require("list-filepaths");
const pMap = require("p-map");
const util = require("./lib");
const sleep = require("sleep-promise");

class imgLocalizer {
  constructor() {}

  /**
   * @typedef {object} DirImgObj
   * @property {string} path markdown文件路径
   * @property {Array<string>} image 所有图片链接
   * @property {object} [success] 下载成功的图片链接与文件名的键值对
   * @property {Array<string>} [error] 下载失败的图片链接
   */

  /**
   * 列出目录下所有markdown文件路径
   * @param {string} path 路径
   * @param {object} [options] 选项
   * @param {number} [options.depth] The maximum search depth of the directory tree.
   * @param {RegExp|Function} [options.reject] Similar to filter except matched paths are excluded from the result. Reject is used on each recursive call and, as such, is more efficient than filter as it will skip recursive calls on matching paths.
   * @param {boolean} [options.relative] Set to `true` to return a list of relative paths.
   * @returns {Array<string>} 由markdown文件路径组成的数组
   */
  async dir(path, options = {}) {
    if (fs.statSync(path).isFile()) return [path];
    options.filter = /.*\.md$/;
    const dirArr = await listFilepaths(path, options);
    return dirArr;
  }

  /**
   * 解析出markdown文本中的图片链接，返回数组
   * @param {string} markdown Markdown纯文本
   * @param {object} [options] 选项
   * @param {boolean} [options.reserveLocal] 是否列出已有的本地图片链接，默认为 `false`
   * @param {string} [options.imgPath] 额外提供一个路径供检测本地图片（绝对路径）
   * @returns {Array<string>} 图片链接数组
   * @todo 按照AST语法树获取图片链接，防止某些弱智情形（可以做成选项）
   */
  extract(markdown, options = {}) {
    if (!options.reserveLocal && !options.imgPath)
      throw new Error("必须指定options.imgPath");
    const mdimgrp = /\!\[[\s\S]*\]\((.*?)\)/g,
      imgurlrp = /\!\[[\s\S]*\]\((.*?)\)/;
    let result = new Set(),
      match;
    while ((match = mdimgrp.exec(markdown)) != null) {
      let linkMatch;
      if ((linkMatch = imgurlrp.exec(match[0])) != null) {
        const link = linkMatch[1];

        // 剔除非法图片链接
        if (!util.checkValid(link)) continue;

        // 默认不保留本地已有图片
        if (!options.reserveLocal)
          if (
            util.checkRelative(link) &&
            fs.existsSync(path.resolve(options.imgPath, link))
          )
            continue;

        result.add(link);
      }
    }
    return Array.from(result);
  }

  /**
   * 解析出一个目录中所有文件对应的所有图片链接
   * @param {string} dir 文件路径或文件夹路径
   * @param {object} [options] 选项
   * @param {RegExp|Function} [options.depth] The maximum search depth of the directory tree.
   * @param {number} [options.reject] Similar to filter except matched paths are excluded from the result. Reject is used on each recursive call and, as such, is more efficient than filter as it will skip recursive calls on matching paths.
   * @param {boolean} [options.relative] Set to `true` to return a list of relative paths.
   * @param {boolean} [options.reserveLocal] 是否列出已有的本地图片链接，默认为 `false`
   * @param {string} [options.imgPath] 额外提供一个路径供检测本地图片（绝对路径or相对路径），默认为`assets`
   * @returns {Array<DirImgObj>} `DirImgObj`数组
   */
  async extractDir(dir, options = {}) {
    if (!options.reserveLocal) {
      if (options.imgPath) {
        if (util.checkRelative(options.imgPath))
          options.imgPath = util.equativePath(dir, options.imgPath);
      } else options.imgPath = util.equativePath(dir, "assets");
    }

    let result = [];
    const dirArr = await this.dir(dir, options);
    for (const dir of dirArr) {
      const markdown = fs.readFileSync(dir).toString();
      const imgUrlArr = this.extract(markdown, options);
      imgUrlArr &&
        result.push({
          path: dir,
          image: imgUrlArr
        });
    }
    return result;
  }

  /**
   * 根据一个图片链接数组来下载图片
   * @param {Array<string>} imgUrlArr 图片链接数组
   * @param {string} imgPath 图片下载路径（绝对路径）
   * @param {object} [options] 选项
   * @param {boolean} [options.cover] 覆盖同名图片，默认为`false`
   * @param {Number} [options.timeout] 下载延时，单位为毫秒
   * @param {Number} [options.concurrency] 同时下载图片数目
   * @param {string} [options.baseUrl] When relative paths are encountered, this url will be used to join
   * @param {string} [options.responsity] Special `options.baseUrl` for GitHub repositories such as `gylidian/string-once-split`.
   * @param {Function} [options.onSuccess] 图片下载成功回调函数
   * @param {Function} [options.onFailure] 图片下载失败回调函数
   */
  async down(imgUrlArr, imgPath, options) {
    options.timeout = options.timeout ? options.timeout : 0;
    options.concurrency = options.concurrency || 3;
    options.onSuccess =
      typeof options.onSuccess === "function"
        ? options.onSuccess
        : function() {};
    options.onFailure =
      typeof options.onFailure === "function"
        ? options.onFailure
        : function() {};
    if (options.responsity)
      options.baseUrl = `https://github.com/${options.responsity}/blob/master`;

    let success = {},
      error = [],
      current = 0;
    await pMap(
      imgUrlArr.filter(i => {
        if (util.checkRelative(i)) {
          if (options.baseUrl) return true;
          return false;
        }
        return true;
      }),
      async imgUrl => {
        try {
          let downloadUrl = util.checkRelative(imgUrl)
            ? path.join(baseUrl, imgUrl)
            : imgUrl;
          const filename = await util.downloader(downloadUrl, imgPath);
          if (options.timeout) await sleep(options.timeout);
          success[imgUrl] = `${options.imgPath}/${filename}`;
          options.onSuccess(++current, filename);
        } catch (e) {
          try {
            let downloadUrl = util.checkRelative(imgUrl)
              ? path.join(baseUrl, imgUrl)
              : imgUrl;
            const filename = await util.downloader(downloadUrl, imgPath);
            if (options.timeout) await sleep(options.timeout);
            success[imgUrl] = `${options.imgPath}/${filename}`;
            options.onSuccess(++current, filename);
          } catch (e) {
            error.push(imgUrl);
            console.error(e);
            options.onFailure(e);
          }
        }
      },
      { concurrency: options.concurrency }
    );
    return {
      success,
      error
    };
  }

  /**
   * 下载单个文件对应的所有图片链接
   * @param {DirImgObj} obj
   * @param {object} [options] 选项
   * @param {string} [options.imgPath] 图片下载位置 默认为 `assets`（绝对路径or相对路径）
   * @param {Number} [options.timeout] 下载延时
   * @param {Number} [options.concurrency] 同时下载图片数目
   * @param {string} [options.baseUrl] When relative paths are encountered, this url will be used to join
   * @param {string} [options.responsity] Special `options.baseUrl` for GitHub repositories such as `gylidian/string-once-split`.
   * @param {Function} [options.onSuccess] 图片下载成功回调函数
   * @param {Function} [options.onFailure] 图片下载失败回调函数
   * @returns {DirImgObj} 单个`DirImgObj`
   */
  async downDir(obj, options = {}) {
    let downloadPath = "";
    if (options.imgPath) {
      if (util.checkRelative(options.imgPath))
        downloadPath = util.equativePath(obj.path, options.imgPath);
      else downloadPath = imgPath;
    } else {
      options.imgPath = "assets";
      downloadPath = util.equativePath(obj.path, "assets");
    }
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

    const res = await this.down(obj.image, downloadPath, options);
    obj.success = res.success;
    obj.error = res.error;
    return obj;
  }

  /**
   * 替换markdown中的图片链接
   * @param {string} markdown
   * @param {object} replaceObj 替换用的键值对
   */
  replace(markdown = "", replaceObj = {}) {
    Object.entries(replaceObj).forEach(([imgUrl, replaceUrl]) => {
      markdown = markdown.replace(`](${imgUrl})`, `](${replaceUrl})`);
    });
    return markdown;
  }

  /**
   * 替换markdown文件中的图片链接
   * @param {DirImgObj} obj
   * @returns {DirImgObj} 单个`DirImgObj`
   */
  replaceDir(obj) {
    let markdown = fs.readFileSync(obj.path).toString();
    Object.entries(obj.success).forEach(([imgUrl, replaceUrl]) => {
      markdown = markdown.replace(`](${imgUrl})`, `](${replaceUrl})`);
      obj.image[obj.image.indexOf(imgUrl)] = replaceUrl;
    });
    fs.writeFileSync(obj.path, markdown);
    delete obj.success;
    return obj;
  }
}

module.exports = new imgLocalizer();
