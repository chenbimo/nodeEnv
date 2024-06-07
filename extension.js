// 核心集
import * as vscode from 'vscode';
import { join, dirname, basename, normalize } from 'node:path';
import { homedir } from 'node:os';
import { TextDecoder } from 'node:util';
import { createGunzip } from 'node:zlib';
import { platform, arch } from 'node:process';
import { exec, execSync } from 'node:child_process';
import { pipeline } from 'node:stream/promises';

// 外部集
import got from 'got';
import { parse as ini_parse, stringify as ini_stringify } from 'ini';
import AdmZip from 'adm-zip';
import { extract as untar } from 'tar-fs';
import {
    //
    pathExistsSync,
    ensureFileSync,
    ensureDirSync,
    writeJsonSync,
    readJSONSync,
    readdirSync,
    readFileSync,
    createWriteStream,
    emptyDirSync,
    moveSync,
    removeSync,
    statSync,
    symlinkSync,
    copyFileSync,
    outputFileSync,
    createReadStream,
    writeFileSync
} from 'fs-extra';

// 配置集 ============================================================
const HOME = homedir();
const NPMRC = join(HOME, '.npmrc');
const APPDIR = join(HOME, '.nvmd');
const BIN_DIR = join(APPDIR, 'bin');
const INSTALL_DIR = join(APPDIR, 'versions');
const TEMP_DIR = join(APPDIR, 'temp');
const DEFAULT_FILE = join(APPDIR, 'default');
const NODE_ENV_VERSION = join(APPDIR, 'nodeEnvVersion');
const VERSIONS_FILENAME = join(APPDIR, 'versions.json');
const SETTING_JSONFILE = join(APPDIR, 'setting.json');
const PROJECTS_JSONFILE = join(APPDIR, 'projects.json');
const MIRRATION_FILE = join(APPDIR, 'migration');
const NVMDRC_NAME = '.nvmdrc';

// 函数集 =============================================================

const utf8TextDecoder = new TextDecoder('utf8');
const hostPrefix = 'https://npmmirror.com/mirrors/node';
const SUPPORTED_UNIX = new Set(['linux', 'darwin', 'aix', 'sunos']);

// 获取所有npm配置信息
// utilGetConfigAll = async (x, y) => {
//     return new Promise((resolve, reject) => {
//         try {
//             let res = execaCommandSync('npm config list --json');
//             if (res.failed === false) {
//                 resolve(JSON.parse(res.stdout));
//             } else {
//                 reject(res);
//             }
//         } catch (err) {
//             reject(err);
//         }
//     });
// };

// 获取当前npmrc配置
const getNpmrcConfig = () => {
    ensureFileSync(NPMRC);
    const fileData = readFileSync(NPMRC, 'utf-8');
    const fileConfig = ini_parse(fileData);
    return fileConfig;
};

// 设置npmrc配置
const setNpmrcConfig = (key, value) => {
    ensureFileSync(NPMRC);
    const fileData = readFileSync(NPMRC, 'utf-8');
    const fileConfig = ini_parse(fileData);
    fileConfig[key] = value;
    writeFileSync(NPMRC, ini_stringify(fileConfig));
};

// 获取所有版本
const getAllVersions = async (isUpdateCache = false) => {
    const versionsFileStats = statSync(VERSIONS_FILENAME);
    if (isUpdateCache === true || versionsFileStats.size <= 100) {
        const result = await got(`${hostPrefix}/index.json`, {
            method: 'get'
        }).json();

        writeJsonSync(VERSIONS_FILENAME, result);
        return result.filter((item) => {
            const versionNumber = Number(item.version.split('.')?.[0]?.replace('v', ''));
            return versionNumber >= 8;
        });
    } else {
        const result = readJSONSync(VERSIONS_FILENAME);
        return result.filter((item) => {
            const versionNumber = Number(item.version.split('.')?.[0]?.replace('v', ''));
            return versionNumber >= 8;
        });
    }
};

// 获取已安装版本
const getInstalledVersions = () => {
    const files = readdirSync(INSTALL_DIR);
    return files.filter((version) => pathExistsSync(join(INSTALL_DIR, version, 'README.md'))).map((version) => `v${version}`);
};

// 获取当前版本
const getDefaultVersion = () => {
    const version = readFileSync(DEFAULT_FILE, { encoding: 'utf8' });
    if (version) {
        return `v${version}`;
    } else {
        return '';
    }
};

// 获取所有项目
const getProjectVersions = () => {
    if (readFileSync(PROJECTS_JSONFILE, { encoding: 'utf8' })) {
        return readJSONSync(PROJECTS_JSONFILE);
    } else {
        return [];
    }
};

// 属性所有数据
const sendVersionsData = async (options) => {
    const resultDefaultVersion = getDefaultVersion();
    const resultInstalledVersions = getInstalledVersions();
    const resultProjectVersions = getProjectVersions();
    const resultNpmrcConfig = getNpmrcConfig();
    const resultAllVersions = await getAllVersions(options?.isUpdateCache || false);
    globalWebview.postMessage({
        action: 'getVersions',
        fromAction: options?.fromAction || '',
        data: {
            defaultVersion: resultDefaultVersion,
            installedVersions: resultInstalledVersions,
            projectVersions: resultProjectVersions,
            allVersions: resultAllVersions,
            npmrcConfig: resultNpmrcConfig
        }
    });
};

// 返回下载版本
const getArch = () => {
    const PLATFORMS = {
        arm: 'armv7l',
        arm64: 'arm64',
        ia32: 'x64',
        ppc: 'ppc64le',
        ppc64: 'ppc64le',
        s390: 's390x',
        s390x: 's390x',
        x32: 'x86',
        x64: 'x64'
    };
    /* c8 ignore start */
    if (platform === 'aix') {
        return 'ppc64';
    }
    /* c8 ignore stop */

    return PLATFORMS[arch];
};

// 下载windows版本
const downloadWindowVersion = async (event) => {
    try {
        ensureDirSync(TEMP_DIR);
        emptyDirSync(TEMP_DIR);
        //
        const arch = getArch();
        const downloadFileName = `node-${event.data.version}-win-${arch}`;
        const downloadFileTemp = join(TEMP_DIR, 'node.zip');
        const downloadVersionDir = join(INSTALL_DIR, event.data.version.replace('v', ''));
        const downloadUrl = `${hostPrefix}/${event.data.version}/${downloadFileName}.zip`;

        const downloadStream = await got.stream(downloadUrl);
        const writeStream = createWriteStream(downloadFileTemp);
        downloadStream.pipe(writeStream);
        downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
            if (percent === 1 && total === 0) {
                percent = 0;
            }
            globalWebview.postMessage({
                action: 'installPercent',
                data: {
                    transferred: transferred,
                    total: total,
                    percent: (percent * 100).toFixed(1)
                }
            });
            // 如果下载完毕
            if (percent === 1) {
                try {
                    const amdZip = new AdmZip(downloadFileTemp);
                    amdZip.extractAllTo(TEMP_DIR, true);
                    ensureDirSync(downloadVersionDir);
                    moveSync(join(TEMP_DIR, downloadFileName), downloadVersionDir, { overwrite: true });
                    emptyDirSync(TEMP_DIR);
                } catch (err) {
                    console.log('🚀 ~ file: extension.js:151 ~ downloadStream.on ~ err:', err);
                } finally {
                    sendVersionsData({ fromAction: event.action });
                }
            }
        });
    } catch (err) {
        console.log('🚀 ~ file: extension.js:144 ~ downloadWindowVersion ~ err:', err);
    }
};

// 下载 unix 版本
// https://npmmirror.com/mirrors/node/v12.8.0/node-v12.8.0-linux-x64.tar.gz
const downloadUnixVersion = async (event) => {
    try {
        ensureDirSync(TEMP_DIR);
        emptyDirSync(TEMP_DIR);
        //
        const arch = getArch();
        const downloadFileName = `node-${event.data.version}-${platform}-${arch}`;
        const downloadFileTemp = join(TEMP_DIR, 'node.tar.gz');
        const downloadVersionDir = join(INSTALL_DIR, event.data.version.replace('v', ''));
        const downloadUrl = `${hostPrefix}/${event.data.version}/${downloadFileName}.tar.gz`;

        const downloadStream = await got.stream(downloadUrl);
        const writeStream = createWriteStream(downloadFileTemp);
        downloadStream.pipe(writeStream);
        downloadStream.on('downloadProgress', async ({ transferred, total, percent }) => {
            if (percent === 1 && total === 0) {
                percent = 0;
            }
            globalWebview.postMessage({
                action: 'installPercent',
                data: {
                    transferred: transferred,
                    total: total,
                    percent: (percent * 100).toFixed(1)
                }
            });
            // 如果下载完毕
            if (percent === 1) {
                try {
                    await pipeline(createReadStream(downloadFileTemp), createGunzip(), untar(TEMP_DIR));
                    ensureDirSync(downloadVersionDir);
                    moveSync(join(TEMP_DIR, downloadFileName), downloadVersionDir, { overwrite: true });
                    emptyDirSync(TEMP_DIR);
                } catch (err) {
                    console.log('🚀 ~ file: extension.js:151 ~ downloadStream.on ~ err:', err);
                } finally {
                    sendVersionsData({ fromAction: event.action });
                }
            }
        });
    } catch (err) {
        console.log('🚀 ~ file: extension.js:144 ~ downloadWindowVersion ~ err:', err);
    }
};

// 删除版本
const removeNodejsVersion = async (event) => {
    const versionDir = join(INSTALL_DIR, event.data.version.replace('v', ''));
    removeSync(versionDir);
    globalWebview.postMessage({
        action: 'removeVersion',
        data: {
            result: true
        }
    });
    sendVersionsData();
};

// 设置项目版本
const setProjectVersion = async (event) => {
    try {
        const projectPath = normalize(dirname(event.data.projectPath));
        const projectName = basename(projectPath);
        const nvmdrcPath = join(projectPath, '.nvmdrc');
        const projectVersion = event.data.projectVersion.replace('v', '');
        ensureFileSync(nvmdrcPath);
        writeFileSync(nvmdrcPath, projectVersion);
        let projectJson = [];
        const projectsData = readFileSync(PROJECTS_JSONFILE, { encoding: 'utf8' });
        if (projectsData) {
            projectJson = readJSONSync(PROJECTS_JSONFILE);
        }

        let isExistsProject = false;
        projectJson.forEach((item) => {
            const isSameProject = normalize(item.path) === projectPath;
            if (isSameProject) {
                isExistsProject = true;
                item.version = projectVersion;
                item.updateAt = new Date().toISOString();
            }
            return item;
        });
        if (isExistsProject === false) {
            projectJson.push({
                name: projectName,
                path: projectPath,
                version: projectVersion,
                active: true,
                createAt: new Date().toISOString(),
                updateAt: new Date().toISOString()
            });
        }
        writeJsonSync(PROJECTS_JSONFILE, projectJson);
        await sendVersionsData({ fromAction: event.action });
    } catch (err) {
        console.log('🚀 ~ file: extension.js:278 ~ setProjectVersion ~ err:', err);
    }
};

// 删除项目版本
const removeProjectVersion = async (event) => {
    try {
        const projectPath = normalize(event.data.path);
        let projectJson = [];
        const projectsData = readFileSync(PROJECTS_JSONFILE, { encoding: 'utf8' });
        if (projectsData) {
            projectJson = readJSONSync(PROJECTS_JSONFILE);
        }

        let isExistsProject = false;
        const projectJson2 = projectJson.filter((item) => {
            return normalize(item.path) !== projectPath;
        });
        writeJsonSync(PROJECTS_JSONFILE, projectJson2);
        await sendVersionsData({ fromAction: event.action });
    } catch (err) {
        console.log('🚀 ~ file: extension.js:278 ~ setProjectVersion ~ err:', err);
    }
};

// 变量集 ===========================================================

// 全局上下文
let globalContext = null;

// 全局webview
let globalWebview = null;

// 全局过滤
let globalFilter = {};

let fnMapWebViewInstance = null;
let fnMapWebViewProvider = null;

// 用户网页提供者
class NodeEnvWebViewProvider {
    constructor() {}

    async resolveWebviewView(panel, context, token) {
        panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(globalContext.extensionPath, 'dist'))],
            retainContextWhenHidden: false
        };

        // 插件接收消息
        panel.webview.onDidReceiveMessage(async (event) => {
            // 获取版本
            if (event.action === 'getVersions') {
                await sendVersionsData({ fromAction: event.action });
            }
            // 应用版本
            if (event.action === 'useVersion') {
                await execSync(`nvmd use ${event.data.version}`);
                await sendVersionsData({ fromAction: event.action });
            }
            // 安装版本
            if (event.action === 'installVersion') {
                await downloadWindowVersion(event);
            }

            // 删除版本
            if (event.action === 'removeVersion') {
                await removeNodejsVersion(event);
            }

            // 设置项目版本
            if (event.action === 'setProjectVersion') {
                await setProjectVersion(event);
            }

            // 删除项目版本
            if (event.action === 'removeProjectVersion') {
                await removeProjectVersion(event);
            }

            // 切换全局镜像
            if (event.action === 'changeRegistry') {
                await setNpmrcConfig('registry', event.data.registry);
                await sendVersionsData({ fromAction: event.action });
            }
        });

        const indexPath = vscode.Uri.joinPath(globalContext.extensionUri, 'dist', 'index.html');
        const indexBytes = await vscode.workspace.fs.readFile(indexPath);
        const indexData = utf8TextDecoder.decode(indexBytes);
        const indexHtml = indexData.replace(/(src|href)="(.+?)"/gi, (match, p1, p2) => {
            const _path = vscode.Uri.joinPath(globalContext.extensionUri, 'dist', p2);
            const _uri = panel.webview.asWebviewUri(_path);
            return `${p1}=${_uri}`;
        });

        panel.webview.html = indexHtml;
        globalWebview = panel.webview;
    }
}

// 功能函数区域 ----------------------------------------------------------------------

export async function activate(context) {
    globalContext = context;

    // 防止其他扩展运行此程序
    if (globalContext.extension.id !== 'chensuiyi.node-env') return;
    const extensionData = vscode.extensions.getExtension('chensuiyi.node-env');

    if (platform === 'win32') {
        // 设置环境变量
        if (process.env.PATH.indexOf('.nvmd') === -1) {
            exec(`setx -m PATH "${BIN_DIR};%PATH%"`, (err, stdout, stderr) => {
                if (err) {
                    vscode.window.showInformationMessage('设置环境变量错误');
                }

                if (stderr && stderr.trim()) {
                    vscode.window.showInformationMessage('设置环境变量失败');
                }
            });
        }
    }
    ensureDirSync(APPDIR);
    ensureDirSync(BIN_DIR);
    ensureDirSync(INSTALL_DIR);
    ensureDirSync(TEMP_DIR);
    ensureFileSync(DEFAULT_FILE);
    ensureFileSync(VERSIONS_FILENAME);
    ensureFileSync(SETTING_JSONFILE);
    ensureFileSync(PROJECTS_JSONFILE);
    ensureFileSync(MIRRATION_FILE);
    ensureFileSync(NODE_ENV_VERSION);

    if (!readFileSync(NODE_ENV_VERSION)) {
        outputFileSync(NODE_ENV_VERSION, extensionData.packageJSON.version);
    }

    // 版本是否相同
    const isSameVersion = readFileSync(NODE_ENV_VERSION, { encoding: 'utf8' }) !== extensionData.packageJSON.version;

    // 强制刷新版本列表
    const nodeEnv_forceRefreshVersions = vscode.commands.registerCommand('fnMap.forceRefreshVersions', () => {
        sendVersionsData({
            isUpdateCache: true,
            fromAction: 'forceRefreshVersions'
        });
    });
    globalContext.subscriptions.push(nodeEnv_forceRefreshVersions);

    // 清除配置数据
    const nodeEnv_clearConfigData = vscode.commands.registerCommand('fnMap.clearConfigData', () => {
        sendVersionsData({
            isUpdateCache: true,
            fromAction: 'clearConfigData'
        });
    });
    globalContext.subscriptions.push(nodeEnv_clearConfigData);

    const currentExtensionPath = extensionData.extensionPath;
    let isArchArm = false;
    if (arch.startsWith('arm')) {
        isArchArm = true;
    }

    if (platform === 'win32') {
        const nvmdExePath = join(currentExtensionPath, 'dist', 'bin', `win-${arch}-nvmd.exe`);
        const nvmdCmdPath = join(currentExtensionPath, 'dist', 'bin', `win-${arch}-nvmd.cmd`);

        [`nvmd`, 'corepack', 'node', 'npx', 'npm'].map((name) => {
            if (pathExistsSync(join(BIN_DIR, `${name}.exe`)) === false || isSameVersion === false) {
                copyFileSync(nvmdExePath, join(BIN_DIR, `${name}.exe`));
                copyFileSync(nvmdCmdPath, join(BIN_DIR, `${name}.cmd`));
            }
        });
    } else {
        let nvmdExePath = '';

        if (platform === 'darwin' && isArchArm === false) {
            nvmdExePath = join(currentExtensionPath, 'dist', 'bin', 'macos-x64-nvmd');
        } else {
            nvmdExePath = join(currentExtensionPath, 'dist', 'bin', 'macos-arm64-nvmd');
        }

        if (platform === 'linux' && isArchArm === false) {
            nvmdExePath = join(currentExtensionPath, 'dist', 'bin', 'linux-x64-nvmd');
        } else {
            nvmdExePath = join(currentExtensionPath, 'dist', 'bin', 'linux-arm64-nvmd');
        }

        if (pathExistsSync(`${APPDIR}/shell`)) {
            removeSync(`${APPDIR}/shell`);
        }

        if (pathExistsSync(`${APPDIR}/nvmd.sh`)) {
            removeSync(`${APPDIR}/nvmd.sh`);
        }
        ['nvmd', 'corepack', 'node', 'npx', 'npm'].map((name) => {
            if (pathExistsSync(join(BIN_DIR, `${name}`)) === false || isSameVersion === false) {
                copyFileSync(nvmdExePath, join(BIN_DIR, `${name}`));
            }
        });
    }

    // 注册用户中心视图
    fnMapWebViewInstance = new NodeEnvWebViewProvider();
    fnMapWebViewProvider = vscode.window.registerWebviewViewProvider('nodeEnvWebView', fnMapWebViewInstance);
}

export async function deactivate() {
    console.log('========卸载插件');
    globalWebview.postMessage({
        action: 'deactivate',
        data: {}
    });
}
