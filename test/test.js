const { imgLocalizer } = require("../lib");
const path = require("path");
// jest.mock("../lib");
// beforeEach(() => {
//     imgLocalizer.mockClear();
// });

it("是否正常初始化对象", () => {
    const imgLc = new imgLocalizer();
    // expect(imgLocalizer).toHaveBeenCalledTimes(1);
    expect(imgLc.get()).toStrictEqual([]);
});

it("是否正常检测出图片链接", () => {
    expect(imgLocalizer.find(`![](aaa.jpg) ccc ![](bbb.jpg)`)).toEqual(["aaa.jpg", "bbb.jpg"]);
});

it("是否正常列出markdown目录", async () => {
    // expect.assertions(1);
    await expect(imgLocalizer.listMdPath(path.resolve(__dirname, "../example"))).resolves.toEqual([
        path.resolve(__dirname, "../example/example.md")
    ]);
});

it("是否正常生成DirImgObj", async () => {
    const imgLc = new imgLocalizer();
    const extractDir = await imgLc.extractDir(path.resolve(__dirname, "../example"));
    expect(extractDir.get().pop()).toEqual({
        path: path.resolve(__dirname, "../example/example.md"),
        image: ["NlkpE6Qqz.jpg", "dCNYjmqCu.jpg", "JQbC4FyK9.jpg"]
    });
});
