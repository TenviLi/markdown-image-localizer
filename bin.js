#!/usr/bin/env node

"use strict";

var program = require("commander");
const imgLoc = require("./index");

program
    .version("0.1.0")
    .option("-p, --path <dirArr...>", "指定一个或多个目录")
    .option("-c, --cover", "是否下载并覆盖已有图片");

program.parse(process.argv);

const dirArr = program.dirArr || [process.cwd()];

(async function() {
    for (const dir of dirArr) {
        const dirImgObjArr = await imgLoc.extractDir(dir);
        let current = 0;
        const total = dirImgObjArr.length;
        console.log(`${dir}\n检测到目录共有${total}个含图片markdown文档\n`);
        for (let dirImgObj of dirImgObjArr) {
            current++;
            console.log(`(${current}/${total}) 开始下载markdown图片 ${dirImgObj.path}`);
            const res = await imgLoc.downDir(dirImgObj, {
                onSuccess: function(index, filename) {
                    console.log(`    ${index}/${dirImgObj.image.length} 图片下载成功 ${filename}`);
                }
            });
            imgLoc.replaceDir(res);
            console.log(`(${current}/${total}) markdown图片下载成功\n`);
        }
    }
})();
