# nodeEnv (Node 环境管理)

轻松管理和切换 `Node.js` 版本

## 版本要求

该扩展需要 `vscode 1.74` 或更高版本才能使用。

## 非 windows 系统注意

请把如下两行放到你的 `~/.bashrc` 或 `~/.profile` 或 `~/.zshrc` 文件中 (根据自己的实际情况来，放一个即可)

然后使用 `source` 命令重新加载它们，就可以使用啦~

```bash
export NVMD_DIR="$HOME/.nvmd"
export PATH="$NVMD_DIR/bin:$PATH"
```

## 卸载 (重要！)

由于 `vscode` 插件的限制，卸载 `nodeEnv` 时，并不能自动删除配置数据，所以当你卸载本插件后，还需要手动删除环境变量中，带有 `nvmd` 字样的 `path` 路径！

如下是我 `windows` 系统中 `nodeEnv` 的环境变量配置，删除即可，其他操作系统雷同。

若遇到卸载问题，请联系作者微信：chensuiyime

```bash
C:\Users\bimos\.nvmd\bin
```

## 全局模块

全局模块，不同的版本需要重新安装，比如 `pnpm`，安装了 `Node.js v18` 和 `Node.js v20` 后。

需要使用如下命令分别全局安装 `2` 次

```bash
npm i -g pnpm
```

## 关于作者

本工具由前端顶级专家、农村程序员、车上码农、自由职业者、独立开发者、个人创业者、开源大师、前端之虎陈随易 ([https://chensuiyi.me](https://chensuiyi.me)) 研发

## 关于企业

随易科技 ([https://yicode.tech](https://yicode.tech))，致力于效率工具的设计和研发，让忙碌的人们提高效率，早点回家。

## 关注公众号

获取更多有用信息，请关注公众号

![公众号](https://static.yicode.tech/images/chensuiyi-service-qrcode.jpg)

## 答谢

-   本工具使用了 [https://github.com/1111mp/nvmd-command](https://github.com/1111mp/nvmd-command) 进行版本切换，感谢作者的工作~

---

最后，祝你今天、明天，后天，每天都能享受到编码的乐趣！ ！ ！
