<template>
    <div class="app">
        <a-config-provider size="small">
            <div class="app-header">
                <!-- 下载进度 -->
                <template v-if="$Data.downloadProgress.percent > 0">
                    <div class="progress">
                        <div class="percent">
                            <div class="bar" :style="{ width: $Data.downloadProgress.percent + '%' }"></div>
                        </div>
                        <div class="text">{{ $Data.downloadProgress.percent + '%' }}</div>
                    </div>
                    <div class="h-10px"></div>
                </template>

                <a-radio-group v-model="$Data.panelName">
                    <a-radio value="all">
                        <template #radio="{ checked }">
                            <a-tag :checked="checked" checkable>列表</a-tag>
                        </template>
                    </a-radio>
                    <a-radio value="installed">
                        <template #radio="{ checked }">
                            <a-tag :checked="checked" checkable>全局</a-tag>
                        </template>
                    </a-radio>
                    <a-radio value="project">
                        <template #radio="{ checked }">
                            <a-tag :checked="checked" checkable>项目</a-tag>
                        </template>
                    </a-radio>
                </a-radio-group>
                <div class="global-version">
                    <div class="label">系统版本</div>
                    <div class="value">{{ $Data.defaultVersion }}</div>
                </div>
                <a-select v-model="$Data.npmRegistry" :style="{ width: '100%' }" placeholder="选择仓库地址" @change="$Method.onChangeRegistry">
                    <a-option v-for="(item, index) in $Data.npmRegistrys" :key="index" :value="item.value">{{ item.name }}</a-option>
                </a-select>
                <div class="h-10px"></div>
                <template v-if="$Data.panelName === 'all'">
                    <a-select v-model="$Data.versionPrefix" :style="{ width: '100%' }" placeholder="选择大版本">
                        <a-option v-for="(name, index) in $Data.bigVersions" :key="index" :value="name">{{ name }}</a-option>
                    </a-select>
                </template>
                <template v-if="$Data.panelName === 'project'">
                    <a-button type="primary" size="mini" long @click="$Method.onAddProject">添加项目</a-button>
                </template>
            </div>
            <div class="app-bodyer">
                <template v-if="$Data.panelName === 'all'">
                    <div class="card" v-for="(item, index) in $Computed.currentVersions" :key="index">
                        <div class="line node">
                            <div class="label">Node版本</div>
                            <div class="value">{{ item.version }}</div>
                        </div>

                        <div class="line v8">
                            <div class="label">V8版本</div>
                            <div class="value mtk21">{{ item.v8 }}</div>
                        </div>
                        <div class="line npm">
                            <div class="label">Npm版本</div>
                            <div class="value mtk21">{{ item.npm }}</div>
                        </div>
                        <div class="line date">
                            <div class="label">发布日期</div>
                            <div class="value">{{ item.date }}</div>
                        </div>
                        <div class="line lts">
                            <div class="label">操作</div>
                            <div class="value">
                                <div class="action">
                                    <div class="btn install" v-if="item.installed === false" @click="$Method.onInstallVersion(item)">
                                        <template v-if="$Data.installingVersion === item.version && ($Data.downloadProgress.percent > 0 || $Data.isInstalling === true)">
                                            <icon-loading size="18px" />
                                        </template>
                                        <template v-else> 安装 </template>
                                    </div>
                                    <div class="btn use" v-if="item.installed === true && item.isDefaultVersion === false" @click="$Method.onUseVersion(item)">应用</div>
                                    <div class="btn remove" v-if="item.installed === true" @click="$Method.onRemoveVersion(item)">卸载</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-if="$Data.panelName === 'installed'">
                    <div class="card" v-for="(item, index) in $Data.installedVersions" :key="index">
                        <div class="line node">
                            <div class="label">Node版本</div>
                            <div class="value">{{ item.version }}</div>
                        </div>

                        <div class="line v8">
                            <div class="label">V8版本</div>
                            <div class="value mtk21">{{ item.v8 }}</div>
                        </div>
                        <div class="line npm">
                            <div class="label">Npm版本</div>
                            <div class="value mtk21">{{ item.npm }}</div>
                        </div>
                        <div class="line date">
                            <div class="label">发布日期</div>
                            <div class="value">{{ item.date }}</div>
                        </div>
                        <div class="line lts">
                            <div class="label">操作</div>
                            <div class="value">
                                <div class="action">
                                    <div class="btn use" v-if="item.isDefaultVersion === false" @click="$Method.onUseVersion(item)">应用</div>
                                    <div class="btn ing" v-if="item.isDefaultVersion === true">使用中</div>
                                    <div class="btn remove" @click="$Method.onRemoveVersion(item)">卸载</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="no-data" v-if="$Data.installedVersions.length <= 0">
                        <div class="icon">
                            <icon-info-circle style="font-size: 50px" />
                        </div>
                        <div class="text">暂未安装任何版本</div>
                    </div>
                </template>
                <template v-if="$Data.panelName === 'project'">
                    <div class="card" v-for="(item, index) in $Data.projectVersions" :key="index">
                        <div class="line npm">
                            <div class="label">名称</div>
                            <div class="value mtk21">{{ item.name }}</div>
                        </div>
                        <div class="line npm">
                            <div class="label">路径</div>
                            <div class="value mtk21">{{ item.path }}</div>
                        </div>
                        <div class="line npm">
                            <div class="label">版本</div>
                            <div class="value mtk21">{{ item.version }}</div>
                        </div>
                        <div class="line lts">
                            <div class="label">操作</div>
                            <div class="value">
                                <div class="action">
                                    <div class="btn remove" @click="$Method.onRemoveProject(item)">删除</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
            <a-modal v-model:visible="$Data.isShow.editProject" width="90vw" @ok="$Method.onConfirmProject" @cancel="handleCancel" :on-before-ok="$Method.onBeforeOkProject">
                <template #title>
                    {{ $Data.projectMode === 'add' ? '添加项目' : '更新项目' }}
                </template>
                <div class="edit-project-modal">
                    <div class="line">
                        <div class="input" :class="[$Data.projectMode]">{{ $Data.projectPath || '选择 package.json 文件' }}</div>
                        <input class="file" v-if="$Data.projectMode === 'add'" type="file" @change="$Method.onChoosePackage" />
                    </div>

                    <div class="line">
                        <a-select v-model="$Data.projectVersion" :style="{ width: '100%' }" placeholder="选择版本">
                            <a-option v-for="(item, index) in $Data.installedVersions" :key="index" :value="item.value">{{ item.version }}</a-option>
                        </a-select>
                    </div>
                </div>
            </a-modal>
        </a-config-provider>
    </div>
</template>
<script setup>
// 外部导入
// 内部导入

// 组件导入

// 选项集
defineOptions({
    name: 'index'
});

// 全局集
const vscode = acquireVsCodeApi();

// 引用
const $From = {};

// 数据集
const $Data = $ref({
    // 显示和隐藏
    isShow: {
        editProject: false
    },
    isLoading: true,
    // 面板名称
    panelName: 'all',
    // 选中的版本
    versionPrefix: '',
    // 默认版本
    defaultVersion: '',
    // 安装中的版本
    installingVersion: '',
    // 所有版本
    allVersions: {},
    // 大版本
    bigVersions: [],
    // 已安装版本
    installedVersions: [],
    // 项目版本
    projectVersions: [],
    // npm配置
    npmrcConfig: {},
    // 是否在安装中
    isInstalling: false,
    // 下载进度
    downloadProgress: {
        transferred: 0,
        total: 0,
        percent: 0
    },
    // 项目模式
    projectMode: 'add',
    // 项目地址
    projectPath: '',
    // 项目版本
    projectVersion: '',
    // 仓库地址
    npmRegistrys: [
        //
        {
            name: '官方镜像',
            value: 'https://registry.npmjs.org/'
        },
        {
            name: '淘宝镜像',
            value: 'https://registry.npmmirror.com/'
        }
    ],
    // 当前镜像
    npmRegistry: ''
});

// 计算集
const $Computed = $ref({
    currentVersions: computed(() => {
        return $Data.allVersions[$Data.versionPrefix];
    })
});

// 方法集
const $Method = {
    async initData() {
        // $Data.isLoading = true;
        vscode.postMessage({ action: 'getVersions', data: {} });
        window.addEventListener('message', async (event) => {
            const res = event.data;

            // 获取版本号
            if (res.action === 'getVersions') {
                let allVersions = {};
                let installedVersions = [];
                let bigVersions = [];

                res.data.allVersions.forEach((item, index) => {
                    item.installed = false;
                    item.isDefaultVersion = false;
                    if (item.version === res.data.defaultVersion) {
                        item.isDefaultVersion = true;
                    }
                    if (res.data.installedVersions.includes(item.version)) {
                        item.installed = true;
                        if (item.isDefaultVersion === false) {
                            installedVersions.push(item);
                        } else {
                            installedVersions.unshift(item);
                        }
                    }
                    const prefixVersion = item.version.split('.')?.[0];
                    if (prefixVersion) {
                        if (bigVersions.includes(prefixVersion) === false) {
                            bigVersions.push(prefixVersion);
                            if (index === 0 && $Data.isInstalling === false) {
                                $Data.versionPrefix = prefixVersion;
                            }
                        }

                        if (!allVersions[prefixVersion]) {
                            allVersions[prefixVersion] = [];
                        }
                        allVersions[prefixVersion].push(item);
                    }
                });
                $Data.bigVersions = bigVersions;
                $Data.allVersions = allVersions;
                $Data.installedVersions = installedVersions;
                $Data.projectVersions = res.data.projectVersions;
                $Data.defaultVersion = res.data.defaultVersion;
                $Data.npmrcConfig = res.data.npmrcConfig;
                $Data.npmRegistry = $Data.npmrcConfig?.registry || '';
            }

            // 安装百分比
            if (res.action === 'installPercent') {
                $Data.downloadProgress = res.data;
                if (Number(res.data.percent) >= 100) {
                    $Data.downloadProgress.percent = 0;
                    $Data.installingVersion = '';
                }
            }

            // 删除版本
            if (res.action === 'removeVersion') {
                Message.success('删除成功');
            }

            // 切换版本提示
            if (res.fromAction === 'useVersion') {
                Message.success('版本切换成功');
            }

            // 安装完毕后改变安装状态
            if (res.fromAction === 'installVersion') {
                $Data.isInstalling = false;
                $Data.downloadProgress.percent = 0;
                $Data.installingVersion = '';
            }

            // 强制刷新版本
            if (res.fromAction === 'forceRefreshVersions') {
                Message.success('版本列表刷新成功');
            }

            // 设置项目版本
            if (res.fromAction === 'setProjectVersion') {
                Message.success('项目版本设置成功');
            }

            // 设置项目版本
            if (res.fromAction === 'removeProjectVersion') {
                Message.success('删除项目版本成功');
            }

            // 切换全局镜像
            if (res.fromAction === 'changeRegistry') {
                Message.success('全局镜像切换成功');
            }
        });
    },
    // 安装版本
    onInstallVersion(item) {
        if ($Data.downloadProgress.percent > 0) {
            Message.warning('已有版本正在安装...');
            return;
        }
        if ($Data.isInstalling === true) {
            Message.warning('已有版本正在安装，请稍后...');
            return;
        }
        $Data.isInstalling = true;

        // 如果3秒后还没开始安装，则可以重新点击安装
        setTimeout(() => {
            if ($Data.downloadProgress === 0) {
                $Data.isInstalling = false;
                $Data.downloadProgress.percent = 0;
                $Data.installingVersion = '';
            }
        }, 3000);
        $Data.installingVersion = item.version;
        vscode.postMessage({ action: 'installVersion', data: { version: item.version } });
    },
    // 应用版本
    onUseVersion(item) {
        vscode.postMessage({ action: 'useVersion', data: { version: item.version } });
    },
    // 删除版本
    onRemoveVersion(item) {
        if (item.version === $Data.defaultVersion) {
            Message.warning('当前使用中的版本无法删除');
            return;
        }
        vscode.postMessage({ action: 'removeVersion', data: { version: item.version } });
    },
    // 添加项目
    onAddProject() {
        $Data.projectPath = '';
        $Data.projectVersion = '';
        $Data.isShow.editProject = true;
        $Data.projectMode = 'add';
    },
    // 更新项目
    onUpdateProject(item) {
        $Data.projectPath = item.path;
        $Data.projectVersion = 'v' + item.version;
        $Data.isShow.editProject = true;
        $Data.projectMode = 'update';
    },
    // 删除项目
    onRemoveProject(item) {
        vscode.postMessage({
            action: 'removeProjectVersion',
            data: {
                path: item.path
            }
        });
    },
    // 改变仓库
    onChangeRegistry(value) {
        vscode.postMessage({
            action: 'changeRegistry',
            data: {
                registry: value
            }
        });
    },
    onChoosePackage(ev) {
        $Data.projectPath = ev.target.files[0].path;
    },
    onBeforeOkProject() {
        if (!$Data.projectPath) {
            Message.warning('请选择项目的package.json文件');
            return false;
        }
        if (!$Data.projectPath.endsWith('package.json')) {
            Message.warning('请选择项目的package.json文件');
            return false;
        }

        if (!$Data.projectVersion) {
            Message.warning('请选择项目的Node.js版本');
            return false;
        }
        return true;
    },
    // 确认项目
    onConfirmProject() {
        vscode.postMessage({
            action: 'setProjectVersion',
            data: {
                projectPath: $Data.projectPath,
                projectVersion: $Data.projectVersion
            }
        });
    },
    onChangePanel(value) {
        $Data.panelName = value;
    },
    fnSetRef(name, el) {
        $From[name] = el;
    }
};

$Method.initData();
</script>

<style lang="scss">
@import '@/styles/global.scss';
.edit-project-modal {
    .line {
        position: relative;
        margin-top: 10px;
        .file {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 27px;
            opacity: 0;
            z-index: 2;
        }
        .input {
            height: 27px;
            z-index: 1;
            padding: 0 12px;
            font-size: 13px;
            line-height: 25px;
            border-radius: 2px;
            word-break: break-all;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            cursor: pointer;
            background-color: var(--vscode-editor-background) !important;
            color: var(--vscode-editor-foreground) !important;
            &.update {
                cursor: not-allowed;
            }
        }
    }
}
.app {
    position: fixed;
    top: 10px;
    right: 10px;
    bottom: 10px;
    left: 10px;
    font-family: 'Segoe WPC', 'Segoe UI', sans-serif !important;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    .weixin-qrcode {
        max-width: 90%;
        margin: 0 auto;
        margin-top: 10px;
    }
    .arco-spin-mask {
        background-color: rgba(0, 0, 0, 0.2);
    }
    .app-header {
        flex: 0 0 auto;
        .arco-select {
            border: 1px solid #444;
        }
        .arco-radio-group {
            display: flex;
            justify-content: space-between;
            .arco-radio {
                margin-right: 0;
                flex: 0 0 18%;
                padding-left: 0;
                .arco-tag {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    &.arco-tag-checked {
                        background-color: var(--vscode-toolbar-hoverBackground);
                    }
                }
            }
        }
        .global-version {
            margin-bottom: 10px;
            height: 26px;
            display: flex;
            align-items: center;
            margin-top: 10px;
            justify-content: space-between;
            border: 1px solid #444;
            border-radius: 13px;
            padding: 0 10px;
            background-color: var(--vscode-editor-background);
            .value {
                color: var(--vscode-textLink-foreground);
            }
        }
        .progress {
            height: 6px;
            display: flex;
            align-items: center;
            .percent {
                flex: 1 1 100%;
                .bar {
                    width: 0%;
                    height: 6px;
                    border-radius: 3px;
                    background-color: var(--custom-green);
                }
            }
            .text {
                flex: 0 0 auto;
                font-size: 12px;
                padding-left: 4px;
            }
        }
    }
    .app-bodyer {
        flex: 1 1 100%;
        overflow-y: auto;
        .card {
            border-bottom: 1px solid var(--vscode-editor-background);
            padding: 5px 0px;
            .line {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                .label {
                }
                .value {
                    color: #999;
                    .action {
                        display: flex;
                        .btn {
                            padding-left: 6px;
                            cursor: pointer;
                            &.install {
                                color: var(--custom-green);
                            }
                            &.remove {
                                color: var(--custom-red);
                            }
                            &.use {
                                color: var(--vscode-textLink-foreground);
                            }
                            &.ing {
                                color: var(--custom-green);
                            }
                        }
                    }
                }
                &.node {
                    .value {
                        color: var(--vscode-textLink-foreground);
                    }
                }
            }
        }
    }
}

.page-wrapper {
    min-height: 100vh;
    width: 100vw;
}
.loading-panel {
    display: flex;
    justify-content: center;
    padding-top: 50px;
    flex-direction: column;
    align-items: center;
}
</style>
