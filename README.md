# 🖼️img-localizer

[![npm](https://camo.githubusercontent.com/3293f5e02ee95d37e743038ea07b736f933e2514/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f696d672d6c6f63616c697a65722f6c61746573742e737667)](https://www.npmjs.com/package/list-filepaths) [![node](https://camo.githubusercontent.com/ca197616e2e1bf47f949d7d20e036cb75ddad4f2/68747470733a2f2f696d672e736869656c64732e696f2f6e6f64652f762f696d672d6c6f63616c697a65722e737667)](https://github.com/nodejs/node) [![build](https://camo.githubusercontent.com/1f7e23b2375008d332dffb5b9434085ea696c0f9/68747470733a2f2f696d672e736869656c64732e696f2f7472617669732f67796c696469616e2f6d61726b646f776e2d696d6167652d6c6f63616c697a65722e737667)](https://travis-ci.org/gylidian/markdown-image-localizer) [![coverage](https://camo.githubusercontent.com/e271eb02ca5d8af425348612b6afcd0c411c24fe/68747470733a2f2f696d672e736869656c64732e696f2f636f766572616c6c732f67796c696469616e2f6d61726b646f776e2d696d6167652d6c6f63616c697a65722e737667)](https://coveralls.io/github/gylidian/markdown-image-localizer) [![made with ♥](https://camo.githubusercontent.com/0f3aacc88b167bf24bf58b5cd41a37f80f18e8b4/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6d616465253230776974682d2545322539442541342d2532336666363962342e737667)](https://github.com/gylidian/markdown-image-localizer)

> 🖼️Fastly list or localize the images in markdown

[![效果图](https://github.com/gylidian/markdown-image-localizer/blob/master/example/illustration.png)](https://github.com/gylidian/markdown-image-localizer)

It has these features:

- List the pathnames of all markdown files in the directory.
- Find image links in markdown plain text.
- Resolve image links in all markdown files.
- Download all images.
- Replace image links in the markdown source file

---

- [🖼️img-localizer](#%F0%9F%96%BC%EF%B8%8Fimg-localizer)
  - [Getting Started](#getting-started)
    - [In the Node.js environment](#in-the-nodejs-environment)
      - [Installation](#installation)
      - [Importing](#importing)
    - [With the CLI](#with-the-cli)
      - [Installation](#installation-1)
      - [Usage](#usage)
  - [Example](#example)
  - [API](#api)
    - [定义](#%E5%AE%9A%E4%B9%89)
      - [DirImgObj {}](#dirimgobj)
    - [方法](#%E6%96%B9%E6%B3%95)
      - [async imgLoc.dir(path[, options]) ⇒ `Array<string>`](#async-imglocdirpath-options-%E2%87%92-arraystring)
      - [imgLoc.extract(markdown[, options]) ⇒ `Array<string>`](#imglocextractmarkdown-options-%E2%87%92-arraystring)
      - [async imgLoc.extractDir(dir[, options]) ⇒ `Array<DirImgObj>`](#async-imglocextractdirdir-options-%E2%87%92-arraydirimgobj)
      - [async imgLoc.down(imgUrlArr, imgPath[, options]) ⇒ `object`](#async-imglocdownimgurlarr-imgpath-options-%E2%87%92-object)
      - [async imgLoc.downDir(obj[, options]) ⇒ `DirImgObj`](#async-imglocdowndirobj-options-%E2%87%92-dirimgobj)
      - [imgLoc.replace(markdown, replaceObj)](#imglocreplacemarkdown-replaceobj)
      - [imgLoc.replaceDir(obj) ⇒ `DirImgObj`](#imglocreplacedirobj-%E2%87%92-dirimgobj)
  - [CLI](#cli)
    - [详细用法](#%E8%AF%A6%E7%BB%86%E7%94%A8%E6%B3%95)
    - [流程](#%E6%B5%81%E7%A8%8B)
  - [效果](#%E6%95%88%E6%9E%9C)
  - [Contribution](#contribution)
  - [License](#license)

## Getting Started

### In the Node.js environment

#### Installation

Install with [npm](https://www.npmjs.com/)

```bash
npm install --save img-localizer
```

or you prefer [yarn](https://yarnpkg.com/)

```bash
yarn add img-localizer
```

#### Importing

```javascript
const imgLoc = require("img-localizer"); // CommonJS environment
import imgLoc from "img-localizer"; // ESM supporting environment
```

### With the CLI

#### Installation

```bash
npm i -g img-localizer
```

#### Usage

直接切换到含有markdown文档的目录中

执行 `imgloc` 命令即可

图片将会默认下载到该目录下的 `assets` 目录中

## Example

```javascript
const dir = path.resolve(__dirname, "../markdown文件夹");

// 解析出一个目录中所有文件对应的所有图片链接
const dirImgObjArr = await imgLoc.extractDir(dir);

let current = 0,
    total = dirImgObjArr.length;
  
for (let dirImgObj of dirImgObjArr) {
    current++;
    console.log(
        `(${current}/${total}) 开始下载markdown图片 ${dirImgObj.path}`
    );

    // 下载单个文件对应的所有图片链接
    const res = await imgLoc.downDir(dirImgObj, {
        onSuccess: function(index, filename) {
            console.log(`  ${index}/${dirImgObj.image.length} 图片下载成功 ${filename}`);
        }
    });

    // 替换单个markdown文件中的图片链接
    imgLoc.replaceDir(res);

    console.log(`(${current}/${total}) markdown图片下载成功\n`);
}
```

## API

### 定义

#### DirImgObj {}

| Name        | Type            | Description                        |
| :---------- | :-------------- | :--------------------------------- |
| path        | `string`        | markdown文件路径                   |
| image       | `Array<string>` | 所有图片链接                       |
| \[success\] | `object`        | 下载成功的图片链接与文件名的键值对 |
| \[error\]   | `Array<string>` | 下载失败的图片链接                 |

### 方法

> 针对 `markdown纯文本` 和 `markdown文件` 分别设计了相应的方法

#### async imgLoc.dir(path[, options]) ⇒ `Array<string>`

列出目录下所有markdown文件的路径

- path: `string`  路径（**绝对路径**）
- \[options\]: `object`  选项
  - \[options.depth\]: `number`  The maximum search depth of the directory tree.
  - \[options.reject\]: `RegExp|Function`  Similar to filter except matched paths are excluded from the result. Reject is used on each recursive call and, as such, is more efficient than filter as it will skip recursive calls on matching paths.
  - \[options.relative\]:  `boolean` Set to `true` to return a list of relative paths.

#### imgLoc.extract(markdown[, options]) ⇒ `Array<string>`

解析出markdown文本中的图片链接

剔除非法链接；列出远程链接或绝对路径；对于相对路径，则默认剔除本地已有的。

- markdown `string`  Markdown纯文本
- \[options\]: `object`  选项
  - \[options.reserveLocal\] `boolean`  是否列出已有的本地图片链接，默认为 `false`
  - \[options.imgPath\] `string`  额外提供一个路径供检测本地图片（**绝对路径**）

#### async imgLoc.extractDir(dir[, options]) ⇒ `Array<DirImgObj>`

解析出一个目录中所有文件对应的所有图片链接

- path: `string`  文件路径 或 文件夹路径（**绝对路径**）
- \[options\]: `object` 选项
  - \[options.imgPath\]: 额外提供一个路径供检测本地图片（**绝对路径or相对路径**），默认为 `assets`（当前目录下的assets文件夹）
  - 其他选项与 `imgLoc.dir()` 和 `imgLoc.resolve()` 的 `options` 保持一致

#### async imgLoc.down(imgUrlArr, imgPath[, options]) ⇒ `object`

根据一个图片链接数组来下载图片

- imgUrlArr: `Array<string>`  图片链接数组
- imgPath: `string`  图片下载路径（**绝对路径**）
- \[options\]: `object`  选项
  - \[options.cover\]: `boolean`  覆盖同名图片，默认为`false`
  - \[options.timeout\]: `Number`  下载延时，单位为毫秒
  - \[options.concurrency\]: `Number`  同时下载图片数目
  - \[options.baseUrl\]: `string`  When relative paths are encountered, this url will be used to join
  - \[options.responsity\]: `string`  Special `options.baseUrl` for GitHub repositories such as `gylidian/string-once-split`.
  - \[options.onSuccess\]:`Function`  图片下载成功回调函数
  - \[options.onFailure\]: `Function`  图片下载失败回调函数

下载成功的图片链接将会以 `原图片链接:下载图片文件名` 键值对 的形式 放入`success` 字段，下载失败的图片链接则会以数组的形式放入`error` 字段.

#### async imgLoc.downDir(obj[, options]) ⇒ `DirImgObj`

下载单个文件对应的所有图片链接

- imgUrlArr: `Array<string>`  图片链接数组
- imgPath: `string`  图片下载路径（**绝对路径**）
- \[options\]: `object`  选项
  - \[options.cover\]: `boolean`  覆盖同名图片，默认为`false`
  - \[options.timeout\]: `Number`  下载延时，单位为毫秒
  - \[options.concurrency\]: `Number`  同时下载图片数目
  - \[options.baseUrl\]: `string`  When relative paths are encountered, this url will be used to join
  - \[options.responsity\]: `string`  Special `options.baseUrl` for GitHub repositories such as `gylidian/string-once-split`.
  - \[options.onSuccess\]: `Function`  图片下载成功回调函数
  - \[options.onFailure\]: `Function`  图片下载失败回调函数

下载成功的图片链接将会以 `原图片链接:下载图片文件名`键值对的形式 放入`success`字段，下载失败的图片链接则会以数组的形式放入`error`字段

#### imgLoc.replace(markdown, replaceObj)

替换markdown中的图片链接

- markdown: `string`  
- replaceObj: `object`  替换用的键值对

#### imgLoc.replaceDir(obj) ⇒ `DirImgObj`

替换单个markdown文件中的图片链接

- obj: `DirImgObj`  

## CLI

### 详细用法

```bash
Usage: imgloc [options]

Options:
  -V, --version           output the version number
  -p, --path <dirArr...>  指定一个或多个目录
  -c, --cover             是否下载并覆盖已有图片
  -h, --help              output usage information
```

### 流程

1. `process.cwd()` 取得当前目录，如果指定了 `path` 则以之优先
2. 执行 `imgLoc.dir()` 列出路径
3. 执行 `imgLoc.resolveDir()` 解析出所有图片链接
4. 对每个md文件执行 `imgLoc.downDir()` 下载图片
5. 对每个md文件执行 `imgLoc.replaceDir()`替换图片链接

## 效果

> Plain text is not as an image link

NlkpE6Qqz.jpg

> **Relative addresses** cannot be downloaded, unless set `options.baseUrl` or `options.responsity`.
> By default, **existing local images** will not be listed, unless set `options.reserveLocal`.

`![img1](NlkpE6Qqz.jpg) ![img2](../asads.jpg) ![img3](/asas/231jpg) ![img4](./asd.jpg)`

> **Illegal links** will not be listed.

`![wtf](WhatTheFuck)`

> The suffix names of **Links without suffix names** will be judged by binary data after successful download.

`![no suffix](http://website/5964342179531145976)`

> By default, when download, **images with the same name** will not be overwritten, and downloaded image with the same name will be renamed, unless set `options.cover`.

`![same](http://website1/same.jpg) ![wd91fn-same](http://website2/same.jpg)`

> It is recommended that you write markdown with **normal and stable picture links**.

`![baidu_logo](https://www.baidu.com/img/baidu_jgylogo3.gif)`

> **The following crazy cases** should be avoided.
> These links will be relentlessly downloaded or replaced.

`![](image.jpg)`

\`\`\`markdown

`![](image.jpg)`

\`\`\`

## Contribution

[![help wanted](https://img.shields.io/badge/%F0%9F%86%98%20help-wanted-red.svg)](https://github.com/gylidian/markdown-image-localizer) [![PR welcome](https://camo.githubusercontent.com/a34cfbf37ba6848362bf2bee0f3915c2e38b1cc1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265)](https://github.com/gylidian/markdown-image-localizer)

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/gylidian/markdown-image-localizer/issues/new).

I'm [gylidian](https://github.com/gylidian), a student at school, and I love the front end.

I'm still a code babe. If you can generously pull request, I'll list your name here. ❤

If you are interested in this module, welcome to [follow my GitHub account](https://github.com/gylidian). It's really really important to me! Thank you!

## License

Copyright © 2019, [gylidian](https://github.com/gylidian). Released under the [MIT License](https://github.com/gylidian/markdown-image-localizer/blob/master/LICENSE).