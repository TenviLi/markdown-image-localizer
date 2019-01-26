# 🖼️img-localizer

[![npm](https://img.shields.io/npm/v/img-localizer/latest.svg)](https://www.npmjs.com/package/list-filepaths) [![node](https://img.shields.io/node/v/img-localizer.svg)](https://github.com/nodejs/node) [![build](https://img.shields.io/travis/gylidian/markdown-image-localizer.svg)](https://travis-ci.org/gylidian/markdown-image-localizer) [![coverage](https://img.shields.io/coveralls/gylidian/markdown-image-localizer.svg)](https://coveralls.io/github/gylidian/markdown-image-localizer) [![made with ♥](https://img.shields.io/badge/made%20with-%E2%9D%A4-%23ff69b4.svg)](https://github.com/gylidian/markdown-image-localizer)

> 🖼️Fastly list or localize the images in markdown

It has these features:

-   Find image links in markdown plain text.
-   List the pathnames of all markdown files in the directory.
-   Resolve image links in all markdown files.
-   Download all images and replace their links in the markdown source file.



## Getting Started

Install with [npm](https://www.npmjs.com/)

```bash
npm install --save img-localizer
```

or you prefer [yarn](https://yarnpkg.com)

```bash
yarn add img-localizer
```



## Usage

### On the server

```javascript
const { imgLoc, imgLocalizer } = require("img-localizer");
import { imgLoc, imgLocalizer } from "img-localizer";
```

Static methods

```javascript
// Find image links in markdown plain text.
imgLocalizer.find("# test\n![](http://image.png)");
// List the pathnames of all markdown files in the directory.
imgLocalizer.listMdPath("example/");
```

Main methods

```javascript
// Resolve image links in markdown files.
await imgLoc.extractDir("example/");
await imgLoc.extractDir("example/example.md");
// Download all images and replace links in markdown files.
await imgLoc.down();
```

### With the CLI

_Comming Soon_



## Example

example/example.md

```markdown
This is a markdown file. ![](http://aaa.jpg)
![](http://bbb.jpg) ![](whatthefuck)
```

your js

```javascript
console.log(imgLoc.extractDir);
(async () => {
    const extractDir = await imgLoc.extractDir(path.resolve(__dirname, "../example"));
    console.log(extractDir);
    const down = await imgLoc.down();
    console.log(down);
})();
```

output

```
{
    path: 'example/example.md',
    image: ['http://aaa.jpg','http://bbb.jpg','whatthefuck']
}
{
    path: 'example/example.md',
    image: ['NlkpE6Qqz.jpg','dCNYjmqCu.jpg'],
    error: ['whatthefuck']
}
```



## API

### new imgLocalizer()
Constructor

### imgLocalizer.extract(content, defaultPath) ⇒ `dirImgObj`
Parsing markdown text as `dirImgObj`

**Kind**: instance method of `imgLocalizer`

| Param       | Type                | Description                                     |
| ----------- | ------------------- | ----------------------------------------------- |
| content     | <code>string</code> | markdown plain text                             |
| defaultPath | <code>string</code> | A default image download path must be specified |

### async imgLocalizer.extractDir(path) ⇒ `dirImgObj`
Resolve image links in all markdown files in the path as `dirImgObj`

**Kind**: instance method of `imgLocalizer`

| Param | Type                | Description                       |
| ----- | ------------------- | --------------------------------- |
| path  | <code>string</code> | pathname containing markdown file |

### imgLocalizer.get() ⇒ `dirImgObj`
get the existing `dirImgObj`

**Kind**: instance method of `imgLocalizer`

### async imgLocalizer.down() ⇒ `dirImgObj`
Download all image links according to `dirImgObj` and replace them in the markdown source file

**Kind**: instance method of `imgLocalizer`

**Returns**: <code>dirImgObj</code> - Return an `dirImgObj` after completion

- key `image` means the image links successfully downloaded and

- key `error` means the image links unsuccessfully downloaded and replaced


### imgLocalizer.find(content) ⇒ `Array`
Find and return image links in markdown

**Kind**: **static** method of `imgLocalizer`


| Param   | Type                | Description         |
| ------- | ------------------- | ------------------- |
| content | <code>string</code> | markdown plain text |

### async imgLocalizer.listMdPath(path) ⇒ `Array`
List the pathnames of all markdown files in the directory

**Kind**: **static** method of `imgLocalizer`

**Returns**: <code>Array</code> - A One-Dimensional Array of Path Names


| Param | Type                | Description                       |
| ----- | ------------------- | --------------------------------- |
| path  | <code>string</code> | pathname containing markdown file |

### imgLocalizer.init(path) ⇒ `imgLocalizer`

Returns a new object of `imgLocalizer` class

In external references, without initialization can access the methods in this class



## Contribution [![help wanted](https://img.shields.io/badge/%F0%9F%86%98%20help-wanted-red.svg)](https://github.com/gylidian/markdown-image-localizer) [![PR welcome](https://camo.githubusercontent.com/a34cfbf37ba6848362bf2bee0f3915c2e38b1cc1/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f5052732d77656c636f6d652d627269676874677265656e2e7376673f7374796c653d666c61742d737175617265)](https://github.com/gylidian/markdown-image-localizer)

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/gylidian/markdown-image-localizer/issues/new).

My energy is too limited. If you can help me generously, I'll list your name in this project. ❤

### Todo

I spent a day writing this module, and there's a lot more to do. 😆

-   `cli`: use this module as a cli tool
-   `options`: What I need to do now is already written in the JSDoc of the code.
-   In the broswer: Use it in a browser environment
-   callbackFn: Add support for some WYSIWYG editors



## License

Copyright © 2018, [gylidian](https://github.com/gylidian). Released under the [MIT License](https://github.com/gylidian/markdown-image-localizer/blob/master/LICENSE).