# nodeEnv (Node 环境管理)

管理和切换 `Node.js` 版本，锁定项目的 `Node.js` 版本。

![picture 1](https://static.yicode.tech/images/202406/20240607140956.png)

[插件安装地址 https://marketplace.visualstudio.com/items?itemName=chensuiyi.node-env](https://marketplace.visualstudio.com/items?itemName=chensuiyi.node-env)

## 仓库地址

点个 `star` 吧~

gitee：[https://gitee.com/chenbimo/nodeEnv](https://gitee.com/chenbimo/nodeEnv)

github：[https://github.com/chenbimo/nodeEnv](https://github.com/chenbimo/nodeEnv)

## 版本要求

该扩展需要 `vscode 1.74` 或更高版本才能使用。

## nvm 相关问题

[https://github.com/nvm-sh/nvm](https://github.com/nvm-sh/nvm)

本插件与 `nvm` 不兼容，请根据自身情况使用。

## windows 系统

本插件启动时，会自动将路径 `$HOME/.nvmd` 设置为环境变量 `path` 的第一个值。

如果没有，请手动设置，不知道怎么设置，轻量联系作者微信 `chensuiyime`。

## 非 windows 系统

请把如下两行放到你的 `~/.bashrc` 或 `~/.profile` 或 `~/.zshrc` 文件中 (根据自己的实际情况来，放一个即可)。

然后使用 `source` 命令重新加载它们，就可以使用啦~

```bash
export NVMD_DIR="$HOME/.nvmd"
export PATH="$NVMD_DIR/bin:$PATH"
```

## 卸载 (重要！)

由于 `vscode` 插件的限制，卸载 `nodeEnv` 时，并不能自动删除配置数据，所以当你卸载本插件后，还需要手动删除环境变量中，带有 `nvmd` 字样的 `path` 路径！

如下是我 `windows` 系统中 `nodeEnv` 的环境变量配置，删除即可，其他操作系统雷同。

若遇到卸载问题，请联系作者微信：`chensuiyime`

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

本工具由前端顶级专家、农村程序员、车上码农、自由职业者、独立开发者、个人创业者、开源大师、前端之虎陈随易 ([https://chensuiyi.me](https://chensuiyi.me)) 研发。

## 赞赏

本插件永久开源免费，如果帮助到您，请不吝赞赏笔者，以提供更好的更新和维护。

![赞赏](https://static.yicode.tech/images/zan-shang.jpg)

## 答谢

-   本工具使用了 [https://github.com/1111mp/nvmd-command](https://github.com/1111mp/nvmd-command) 进行版本切换，感谢作者的工作~

---

最后，祝你今天、明天，后天，每天都能享受到编码的乐趣！ ！ ！
