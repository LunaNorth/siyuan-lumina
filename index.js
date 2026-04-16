const { Plugin, showMessage, openTab, getFrontend, confirm } = require("siyuan");

const STORAGE_NAME = "shuoshuo-data";
const AVATAR_ASSISTANT_STORAGE_NAME = "shuoshuo-avatar-assistant";
const AVATAR_USER_STORAGE_NAME = "shuoshuo-avatar-user";
const NOTEBOOK_ID_STORAGE_NAME = "shuoshuo-notebook-id";
const AUTO_SYNC_STORAGE_NAME = "shuoshuo-auto-sync";
const VIEW_STYLE_STORAGE_NAME = "shuoshuo-view-style";
const FLOMO_CONFIG_STORAGE_NAME = "shuoshuo-flomo-config";
const FLOMO_SYNC_TIME_STORAGE_NAME = "shuoshuo-flomo-sync-time";
const FLOMO_SYNC_TARGET_STORAGE_NAME = "shuoshuo-flomo-sync-target";
const FLOMO_SYNC_DOC_ID_STORAGE_NAME = "shuoshuo-flomo-sync-doc-id";
const REVIEW_CONFIG_STORAGE_NAME = "shuoshuo-review-config";
const TAG_ICONS_STORAGE_NAME = "shuoshuo-tag-icons";
const TAG_PINNED_STORAGE_NAME = "shuoshuo-tag-pinned";
const THEME_MODE_STORAGE_NAME = "shuoshuo-theme-mode"; // 主题模式存储
const MORANDI_COLOR_STORAGE_NAME = "shuoshuo-morandi-color"; // 莫兰迪配色存储
const TAB_TYPE = "shuoshuo-tab";

// 莫兰迪配色方案
const MORANDI_COLORS = [
    // 浅色系列
    { key: 'dusty-pink', name: '灰粉', color: '#D4A5A5', bg: '#FAF6F6' },
    { key: 'sage-green', name: '鼠尾草绿', color: '#9CAF88', bg: '#F7F8F5' },
    { key: 'muted-blue', name: '雾霾蓝', color: '#8FA1B3', bg: '#F5F7F9' },
    { key: 'warm-beige', name: '燕麦色', color: '#C4B7A6', bg: '#FAF8F5' },
    { key: 'dusty-purple', name: '香芋紫', color: '#A898B5', bg: '#F7F5F9' },
    { key: 'terracotta', name: '赤陶色', color: '#C78D7B', bg: '#FAF6F4' },
    // 中度系列
    { key: 'olive-green', name: '橄榄绿', color: '#A3A380', bg: '#F8F8F4' },
    { key: 'slate-blue', name: '灰蓝色', color: '#7D8A9E', bg: '#F5F6F8' },
    { key: 'mauve', name: '藕荷色', color: '#B8A1A8', bg: '#F8F5F6' },
    { key: 'warm-gray', name: '暖灰色', color: '#A8A39D', bg: '#F8F7F6' },
    // 深色系列
    { key: 'deep-bean', name: '深豆沙', color: '#A67B7B', bg: '#FAF5F5' },
    { key: 'dark-moss', name: '暗苔绿', color: '#7A8471', bg: '#F5F6F3' },
    { key: 'caramel', name: '焦糖棕', color: '#A67C52', bg: '#FAF6F0' },
    { key: 'dusk-purple', name: '暮山紫', color: '#8B7B8B', bg: '#F7F4F7' },
    { key: 'deep-sea', name: '深海蓝', color: '#5E738B', bg: '#F2F5F8' },
    { key: 'tobacco', name: '烟草褐', color: '#8B7355', bg: '#F7F4EF' },
    { key: 'stone', name: '岩灰', color: '#7D7D7D', bg: '#F5F5F5' },
    { key: 'withered-rose', name: '枯玫瑰', color: '#9E7A7A', bg: '#F8F2F2' },
    { key: 'navy-gray', name: '藏青灰', color: '#5D6D7E', bg: '#F0F3F5' },
    { key: 'rust-red', name: '铁锈红', color: '#9C6B6B', bg: '#F8F2F2' },
    { key: 'sandalwood', name: '檀木棕', color: '#8B6F5C', bg: '#F7F3EF' },
    { key: 'slate-green', name: '青石灰', color: '#7D8B8B', bg: '#F2F4F4' },
    { key: 'deep-wisteria', name: '藤萝紫', color: '#6B5B6B', bg: '#F4F1F4' }
];

// 回顾配置默认值
const DEFAULT_REVIEW_CONFIG = {
    contentScope: 'all', // all, include_tags, exclude_tags, no_tags
    contentScopeTags: [], // 用于 include_tags 或 exclude_tags
    timeRange: '6_months', // all, 1_year, 6_months, 3_months, 1_month
    dailyCount: 8 // 4, 8, 12, 16, 20, 24
};

// 主题配置：original (原主题-硬编码绿色), siyuan (适配思源主题)
const DEFAULT_THEME_MODE = 'original';

// Flomo API 配置
const FLOMO_API_BASE = "https://flomoapp.com/api/v1";
const FLOMO_SECRET = "dbbc3dd73364b4084c3a69346e0ce2b2";
const FLOMO_API_KEY = "flomo_web";
const FLOMO_APP_VERSION = "2.0";

const DEFAULT_NOTEBOOK_ID = "";

// SVG 图标
const ICONS = {
    shuoshuo: `<symbol id="iconShuoshuo" viewBox="0 0 1024 1024"><path d="M896 128H128c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64zM128 192h768v640H128V192z"/><path d="M256 384h512v64H256zM256 512h512v64H256zM256 640h320v64H256z"/><circle cx="768" cy="672" r="48"/></symbol>`,
    grid: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
    starOutline: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    random: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    setting: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    sync: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    hash: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
    font: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
    at: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    moreH: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`
};

module.exports = class ShuoshuoPlugin extends Plugin {
    onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        this.addIcons(ICONS.shuoshuo);

        this.shuoshuos = [];
        this.assistantAvatarUrl = null;
        this.userAvatarUrl = null;
        this.notebookId = DEFAULT_NOTEBOOK_ID;
        this.autoSync = false;
        this.viewStyle = 'list'; // 'list' 平铺, 'card' 卡片
        this.flomoConfig = { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '' };
        this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG };
        this.selectedDate = null;
        this.selectedTag = null;
        this.tagIcons = {}; // 标签图标映射 {tagName: emoji/icon}
        this.pinnedTags = []; // 置顶标签列表
        this.themeMode = DEFAULT_THEME_MODE; // 主题模式：original 或 siyuan 或 morandi
        this.morandiColor = MORANDI_COLORS[0].key; // 默认第一个莫兰迪配色
        this.loadShuoshuos();
        this.loadAvatars();
        this.loadNotebookId();
        this.loadAutoSync();
        this.loadViewStyle();
        this.loadFlomoConfig();
        this.loadReviewConfig();
        this.loadTagIcons();
        this.loadPinnedTags();
        this.loadThemeMode();
        this.loadMorandiColor();

        const plugin = this;

        this.addTab({
            type: TAB_TYPE,
            init() {
                this.plugin = plugin;
                this.container = this.element;
                plugin.render(this.element);
            },
            destroy() {
                console.log("Shuoshuo tab destroyed");
            }
        });

        this.addCommand({
            langKey: "openShuoshuo",
            hotkey: "⌥⌘S",
            callback: () => {
                this.openShuoshuoTab();
            }
        });

        console.log("Shuoshuo plugin loaded");
    }

    onLayoutReady() {
        this.addTopBar({
            icon: "iconEdit",
            title: "轻语",
            position: "right",
            callback: () => {
                this.openShuoshuoTab();
            }
        });
    }

    onunload() {
        console.log("Shuoshuo plugin unloaded");
    }

    openShuoshuoTab() {
        openTab({
            app: this.app,
            custom: {
                icon: "iconEdit",
                title: "轻语",
                data: {},
                id: this.name + TAB_TYPE
            }
        });
    }

    render(container) {
        if (container) {
            this.container = container;
        }
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="north-shuoshuo-container">
                <!-- 最左侧导航栏（微信风格 - 保持不变）-->
                <div class="north-shuoshuo-sidebar">
                    <div class="north-shuoshuo-avatar" id="shuoshuo-avatar-sidebar" title="点击更换头像">
                        ${this.userAvatarUrl ? `<img src="${this.userAvatarUrl}" alt="头像">` : '<svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'}
                    </div>
                    
                    <div class="north-shuoshuo-nav-icons">
                        <button class="north-shuoshuo-nav-item active" data-view="notes" title="说说">
                            <img src="/plugins/${this.name}/icons/消息.svg" class="north-shuoshuo-nav-icon" />
                        </button>
                        <button class="north-shuoshuo-nav-item" data-view="stats" title="统计">
                            <img src="/plugins/${this.name}/icons/统计.svg" class="north-shuoshuo-nav-icon" />
                        </button>
                    </div>
                    
                    <div class="north-shuoshuo-nav-bottom">
                        <button class="north-shuoshuo-nav-item" data-view="settings" title="设置">
                             <img src="/plugins/${this.name}/icons/设置.svg" class="north-shuoshuo-nav-icon" />
                        </button>
                    </div>
                </div>

                <!-- 右侧 Flomo 风格区域（侧边栏 + 卡片列表合并）-->
                <div class="north-shuoshuo-flomo-area">
                    <!-- Flomo 侧边栏 -->
                    <div class="north-shuoshuo-flomo-sidebar">
                        <div class="north-shuoshuo-stats">
                            <div class="north-shuoshuo-stat-item">
                                <div class="north-shuoshuo-stat-number" id="shuoshuo-count">${this.shuoshuos.length}</div>
                                <div class="north-shuoshuo-stat-label">笔记</div>
                            </div>
                            <div class="north-shuoshuo-stat-item">
                                <div class="north-shuoshuo-stat-number" id="shuoshuo-tag-count">0</div>
                                <div class="north-shuoshuo-stat-label">标签</div>
                            </div>
                            <div class="north-shuoshuo-stat-item">
                                <div class="north-shuoshuo-stat-number">1</div>
                                <div class="north-shuoshuo-stat-label">天</div>
                            </div>
                        </div>

                        <div class="north-shuoshuo-heatmap-container">
                            <div class="north-shuoshuo-heatmap">
                                ${this.generateHeatmap()}
                            </div>
                            <div class="north-shuoshuo-months">
                                ${this.generateHeatmapMonths()}
                            </div>
                        </div>

                        <div class="north-shuoshuo-menu-list">
                            <div class="north-shuoshuo-menu-item active" data-view="notes">
                                <span class="north-shuoshuo-menu-icon">${ICONS.grid}</span>
                                <span class="north-shuoshuo-menu-text">全部笔记</span>
                            </div>
                            <div class="north-shuoshuo-menu-item" data-view="review">
                                <span class="north-shuoshuo-menu-icon">${ICONS.star}</span>
                                <span class="north-shuoshuo-menu-text">每日回顾</span>
                            </div>
                            <div class="north-shuoshuo-menu-item" data-view="random">
                                <span class="north-shuoshuo-menu-icon">${ICONS.random}</span>
                                <span class="north-shuoshuo-menu-text">随机漫步</span>
                            </div>
                        </div>

                        <div class="north-shuoshuo-tags-section">
                            <div class="north-shuoshuo-section-title">全部标签</div>
                            <div class="north-shuoshuo-tags-list">
                                <div class="north-shuoshuo-tag-empty">暂无标签</div>
                            </div>
                        </div>
                    </div>

                    <!-- 卡片列表 -->
                    <div class="north-shuoshuo-main">
                        <div class="north-shuoshuo-input-area">
                            <div class="north-shuoshuo-input-box" id="shuoshuo-input-box">
                                <div class="north-shuoshuo-input-wrapper">
                                    <textarea class="north-shuoshuo-input-field" id="shuoshuo-input" placeholder="现在的想法是..." rows="3"></textarea>
                                </div>
                                <div class="north-shuoshuo-input-toolbar">
                                    <div class="north-shuoshuo-toolbar-left">
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-tag" title="标签">#</span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-image" title="图片">${ICONS.image}</span>
                                        <span class="north-shuoshuo-toolbar-divider"></span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-ul" title="无序列表">
                                            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                                        </span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-ol" title="有序列表">
                                            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M2 6h2v2H2V6zm4 0h14v2H6V6zM2 11h2v2H2v-2zm4 0h14v2H6v-2zM2 16h2v2H2v-2zm4 0h14v2H6v-2z"/></svg>
                                        </span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-at" title="快速引用">${ICONS.at}</span>
                                    </div>
                                    <button class="north-shuoshuo-send-btn" id="shuoshuo-send">${ICONS.send}</button>
                                </div>
                            </div>
                        </div>

                        <div class="north-shuoshuo-notes-list" id="shuoshuo-notes-list"></div>
                    </div>
                </div>

                <!-- 设置视图（和说说视图同级）- Obsidian 风格两栏布局 -->
                <div class="north-shuoshuo-settings-area" id="shuoshuo-settings-area" style="display: none;">
                    <!-- 左侧：设置分类菜单 -->
                    <div class="north-shuoshuo-settings-nav">
                        <div class="north-shuoshuo-settings-nav-header">设置</div>
                        <div class="north-shuoshuo-settings-nav-item active" data-setting="view">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                            </svg>
                            <span>说说视图</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="flomo">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            <span>Flomo 同步</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="sync">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                            </svg>
                            <span>同步设置</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="data">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
                            </svg>
                            <span>数据管理</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="review">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                            </svg>
                            <span>回顾设置</span>
                        </div>
                    </div>

                    <!-- 右侧：具体设置内容 -->
                    <div class="north-shuoshuo-content-area">
                        <!-- 说说视图设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-view">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">展示样式</div>
                                        <div class="north-shuoshuo-section-desc">选择笔记列表的展示方式</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row">
                                    <label class="north-shuoshuo-form-label">布局模式</label>
                                    <div class="north-shuoshuo-radio-group">
                                        <label class="north-shuoshuo-radio-item" data-value="list">
                                            <div class="north-shuoshuo-radio-preview list-preview">
                                                <div class="preview-line"></div>
                                                <div class="preview-line"></div>
                                                <div class="preview-line"></div>
                                            </div>
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">平铺布局</div>
                                                <div class="north-shuoshuo-radio-desc">传统列表，简洁清晰</div>
                                            </div>
                                            <input type="radio" name="view-style" value="list" ${this.viewStyle === 'list' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item" data-value="card">
                                            <div class="north-shuoshuo-radio-preview card-preview">
                                                <div class="preview-card-row">
                                                    <div class="preview-card"></div>
                                                    <div class="preview-card"></div>
                                                    <div class="preview-card"></div>
                                                </div>
                                                <div class="preview-card-row">
                                                    <div class="preview-card" style="height: 60%;"></div>
                                                    <div class="preview-card" style="height: 80%;"></div>
                                                    <div class="preview-card" style="height: 50%;"></div>
                                                </div>
                                                <div class="preview-card-row">
                                                    <div class="preview-card" style="height: 70%;"></div>
                                                    <div class="preview-card" style="height: 60%;"></div>
                                                    <div class="preview-card" style="height: 90%;"></div>
                                                </div>
                                            </div>
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">卡片布局</div>
                                                <div class="north-shuoshuo-radio-desc">三列瀑布流，直观美观</div>
                                            </div>
                                            <input type="radio" name="view-style" value="card" ${this.viewStyle === 'card' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <!-- 主题模式设置 -->
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">主题模式</div>
                                        <div class="north-shuoshuo-section-desc">选择使用哪种主题样式</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-radio-group" id="theme-mode-grid">
                                        <label class="north-shuoshuo-radio-item ${this.themeMode === 'original' ? 'selected' : ''}" data-mode="original">
                                            <div class="north-shuoshuo-radio-preview original-theme-preview"></div>
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">原主题</div>
                                                <div class="north-shuoshuo-radio-desc">经典绿色配色，怀旧专属</div>
                                            </div>
                                            <input type="radio" name="theme-mode" value="original" ${this.themeMode === 'original' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.themeMode === 'siyuan' ? 'selected' : ''}" data-mode="siyuan">
                                            <div class="north-shuoshuo-radio-preview siyuan-theme-preview"></div>
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">适配主题</div>
                                                <div class="north-shuoshuo-radio-desc">自动适配思源主题颜色</div>
                                            </div>
                                            <input type="radio" name="theme-mode" value="siyuan" ${this.themeMode === 'siyuan' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.themeMode === 'morandi' ? 'selected' : ''}" data-mode="morandi">
                                            <div class="north-shuoshuo-radio-preview morandi-theme-preview"></div>
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">莫兰迪主题</div>
                                                <div class="north-shuoshuo-radio-desc">低饱和度柔和配色，优雅舒适</div>
                                            </div>
                                            <input type="radio" name="theme-mode" value="morandi" ${this.themeMode === 'morandi' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                    </div>
                                    <div class="north-shuoshuo-form-hint" id="theme-mode-hint-original" style="display: ${this.themeMode === 'original' ? 'flex' : 'none'};">
                                        <span>💡</span> 经典绿色主题，熟悉的配方
                                    </div>
                                    <div class="north-shuoshuo-form-hint" id="theme-mode-hint-siyuan" style="display: ${this.themeMode === 'siyuan' ? 'flex' : 'none'};">
                                        <span>💡</span> 选择「适配主题」后，插件将自动跟随思源笔记的亮/暗主题
                                    </div>
                                    <div class="north-shuoshuo-form-hint" id="theme-mode-hint-morandi" style="display: ${this.themeMode === 'morandi' ? 'flex' : 'none'};">
                                        <span>💡</span> 莫兰迪色系，温和不刺眼
                                    </div>
                                </div>

                                <!-- 莫兰迪配色选择 -->
                                <div class="north-shuoshuo-form-row" id="morandi-color-row" style="display: ${this.themeMode === 'morandi' ? 'block' : 'none'};">
                                    <label class="north-shuoshuo-form-label">选择配色</label>
                                    <div class="north-shuoshuo-morandi-grid">
                                        ${MORANDI_COLORS.map(c => `
                                            <div class="north-shuoshuo-morandi-option ${this.morandiColor === c.key ? 'selected' : ''}" data-color="${c.key}" title="${c.name}">
                                                <div class="north-shuoshuo-morandi-color" style="background-color: ${c.color};"></div>
                                                <div class="north-shuoshuo-morandi-name">${c.name}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 同步设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-sync" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">选择日记笔记本</div>
                                        <div class="north-shuoshuo-section-desc">用于将说说同步到思源笔记的日记中</div>
                                    </div>
                                    <span class="north-shuoshuo-badge north-shuoshuo-badge-success" id="settings-connection-status">已配置</span>
                                </div>
                                
                                <div class="north-shuoshuo-form-row">
                                    <label class="north-shuoshuo-form-label">笔记本</label>
                                    <div class="north-shuoshuo-input-group">
                                        <div class="north-shuoshuo-select-wrapper">
                                            <select id="settings-notebook-select" class="north-shuoshuo-select-field">
                                                <option value="">请选择笔记本...</option>
                                            </select>
                                            <span class="north-shuoshuo-select-arrow">▼</span>
                                        </div>
                                        <button class="north-shuoshuo-btn-icon" id="settings-refresh-notebooks" title="刷新列表">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M23 4v6h-6M1 20v-6h6"/>
                                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="north-shuoshuo-form-hint">
                                        <span>💡</span> 选择用于存储日记的笔记本
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>自动同步</h4>
                                        <p>发布说说时自动同步到日记</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.autoSync ? 'on' : ''}" id="settings-auto-sync-switch"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Flomo 同步设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-flomo" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">Flomo 账号</div>
                                        <div class="north-shuoshuo-section-desc">登录 flomo 账号以同步笔记</div>
                                    </div>
                                    <span class="north-shuoshuo-badge" id="flomo-connection-status">未登录</span>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">邮箱 / 手机号</label>
                                    <input type="text" id="flomo-username" class="north-shuoshuo-input-field" placeholder="请输入 flomo 登录邮箱或手机号">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 12px;">
                                    <label class="north-shuoshuo-form-label">密码</label>
                                    <input type="password" id="flomo-password" class="north-shuoshuo-input-field" placeholder="请输入 flomo 密码">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="flomo-login-btn">登录</button>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary" id="flomo-logout-btn" style="display: none;">退出登录</button>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card" id="flomo-sync-card" style="opacity: 0.5; pointer-events: none;">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">同步设置</div>
                                        <div class="north-shuoshuo-section-desc">配置同步方式和目标位置</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 12px;">
                                    <label class="north-shuoshuo-form-label">同步到</label>
                                    <div class="north-shuoshuo-radio-group horizontal">
                                        <label class="north-shuoshuo-radio-item flomo-target" data-value="dailynote">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">每日笔记</div>
                                                <div class="north-shuoshuo-radio-desc">按日期同步到对应日记</div>
                                            </div>
                                            <input type="radio" name="flomo-target" value="dailynote" checked>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item flomo-target" data-value="singledoc">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">指定文档</div>
                                                <div class="north-shuoshuo-radio-desc">同步到一个固定文档</div>
                                            </div>
                                            <input type="radio" name="flomo-target" value="singledoc">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item flomo-target" data-value="shuoshuo">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">说说视图</div>
                                                <div class="north-shuoshuo-radio-desc">同步到说说列表中展示</div>
                                            </div>
                                            <input type="radio" name="flomo-target" value="shuoshuo">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="flomo-notebook-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">选择笔记本</label>
                                    <div class="north-shuoshuo-input-group">
                                        <div class="north-shuoshuo-select-wrapper">
                                            <select id="flomo-notebook-select" class="north-shuoshuo-select-field">
                                                <option value="">请选择笔记本...</option>
                                            </select>
                                            <span class="north-shuoshuo-select-arrow">▼</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="flomo-doc-row" style="margin-bottom: 10px; display: none;">
                                    <label class="north-shuoshuo-form-label">目标文档 ID</label>
                                    <div class="north-shuoshuo-input-group">
                                        <input type="text" id="flomo-target-doc-id" class="north-shuoshuo-input-field" placeholder="请输入文档块 ID，如：20200812220555-lj3enxa" value="">
                                    </div>
                                    <div class="north-shuoshuo-form-hint" style="margin-top: 6px; font-size: 12px; color: #888;">
                                        提示：右键点击文档，选择"复制文档块 ID"
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">上次同步时间</label>
                                    <div class="north-shuoshuo-readonly-field" id="flomo-last-sync">从未同步</div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #555;">
                                        <input type="checkbox" id="flomo-full-sync" style="width: 16px; height: 16px; cursor: pointer;">
                                        <span>全量同步（重新同步所有笔记，包括本地已删除的）</span>
                                    </label>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="flomo-sync-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
                                            <path d="M23 4v6h-6M1 20v-6h6"/>
                                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                        </svg>
                                        开始同步
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 数据管理 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-data" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>导出数据</h4>
                                        <p>导出所有说说数据到本地 JSON 文件</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary north-shuoshuo-btn-small" id="settings-export">导出</button>
                                </div>
                                
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>清空数据</h4>
                                        <p>清空后数据不可恢复，请谨慎操作</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-danger north-shuoshuo-btn-small" id="settings-clear">清空</button>
                                </div>
                            </div>
                        </div>

                        <!-- 回顾设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-review" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">内容范围</div>
                                        <div class="north-shuoshuo-section-desc">选择每日回顾的内容范围</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-radio-group vertical" id="review-content-scope-group">
                                        <label class="north-shuoshuo-radio-item ${this.reviewConfig.contentScope === 'all' ? 'selected' : ''}" data-value="all">
                                            <input type="radio" name="review-content-scope" value="all" ${this.reviewConfig.contentScope === 'all' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">全部内容</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.reviewConfig.contentScope === 'include_tags' ? 'selected' : ''}" data-value="include_tags">
                                            <input type="radio" name="review-content-scope" value="include_tags" ${this.reviewConfig.contentScope === 'include_tags' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">包含指定标签</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.reviewConfig.contentScope === 'exclude_tags' ? 'selected' : ''}" data-value="exclude_tags">
                                            <input type="radio" name="review-content-scope" value="exclude_tags" ${this.reviewConfig.contentScope === 'exclude_tags' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">排除指定标签</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.reviewConfig.contentScope === 'no_tags' ? 'selected' : ''}" data-value="no_tags">
                                            <input type="radio" name="review-content-scope" value="no_tags" ${this.reviewConfig.contentScope === 'no_tags' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">无标签</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row" id="review-tags-row" style="display: ${this.reviewConfig.contentScope === 'include_tags' || this.reviewConfig.contentScope === 'exclude_tags' ? 'block' : 'none'};">
                                    <label class="north-shuoshuo-form-label">选择标签</label>
                                    <div class="north-shuoshuo-review-tags-select" id="review-tags-select">
                                        ${this.extractAllTags().map(tag => `
                                            <label class="north-shuoshuo-review-tag-checkbox ${this.reviewConfig.contentScopeTags.includes(tag) ? 'selected' : ''}">
                                                <input type="checkbox" value="${tag}" ${this.reviewConfig.contentScopeTags.includes(tag) ? 'checked' : ''}>
                                                <span>${tag}</span>
                                            </label>
                                        `).join('') || '<div class="north-shuoshuo-form-hint">暂无标签</div>'}
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">时间范围</div>
                                        <div class="north-shuoshuo-section-desc">选择回顾笔记的时间范围</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-select-wrapper">
                                        <select id="review-time-range" class="north-shuoshuo-select-field">
                                            <option value="all" ${this.reviewConfig.timeRange === 'all' ? 'selected' : ''}>全部时间</option>
                                            <option value="1_year" ${this.reviewConfig.timeRange === '1_year' ? 'selected' : ''}>1年内</option>
                                            <option value="6_months" ${this.reviewConfig.timeRange === '6_months' ? 'selected' : ''}>6个月内</option>
                                            <option value="3_months" ${this.reviewConfig.timeRange === '3_months' ? 'selected' : ''}>3个月内</option>
                                            <option value="1_month" ${this.reviewConfig.timeRange === '1_month' ? 'selected' : ''}>1个月内</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">回顾数量</div>
                                        <div class="north-shuoshuo-section-desc">每天回顾的笔记数量</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-select-wrapper">
                                        <select id="review-daily-count" class="north-shuoshuo-select-field">
                                            <option value="4" ${this.reviewConfig.dailyCount === 4 ? 'selected' : ''}>4条/天</option>
                                            <option value="8" ${this.reviewConfig.dailyCount === 8 ? 'selected' : ''}>8条/天</option>
                                            <option value="12" ${this.reviewConfig.dailyCount === 12 ? 'selected' : ''}>12条/天</option>
                                            <option value="16" ${this.reviewConfig.dailyCount === 16 ? 'selected' : ''}>16条/天</option>
                                            <option value="20" ${this.reviewConfig.dailyCount === 20 ? 'selected' : ''}>20条/天</option>
                                            <option value="24" ${this.reviewConfig.dailyCount === 24 ? 'selected' : ''}>24条/天</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 底部操作 -->
                        <div class="north-shuoshuo-actions">
                            <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary" id="settings-cancel">取消</button>
                            <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="settings-save">保存设置</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderNotes();
        this.renderTags();
        // 应用主题模式（默认为原主题）
        setTimeout(() => this.applyThemeMode(), 0);
        this.bindEvents();
    }

    // 生成热力?
    generateHeatmap() {
        const today = new Date();
        const cells = [];
        
        // 生成最?4天（12周）的数据，按周排列??2列）
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 12; col++) {
                const dayIndex = col * 7 + row;
                const date = new Date(today);
                date.setDate(date.getDate() - (83 - dayIndex));
                
                const count = this.getNoteCountByDate(date);
                const dateStr = this.formatDateKey(date);
                
                // 根据数量确定等级
                let level = 0;
                if (count >= 1) level = 1;
                if (count >= 3) level = 2;
                if (count >= 5) level = 3;
                if (count >= 8) level = 4;
                
                const tooltip = count > 0 
                    ? `${count}条 ${date.getMonth() + 1}月${date.getDate()}日`
                    : `${date.getMonth() + 1}月${date.getDate()}日`;
                
                cells.push(`<div class="north-shuoshuo-heatmap-cell level-${level}" data-date="${dateStr}" data-tooltip="${tooltip}"></div>`);
            }
        }
        
        return cells.join('');
    }

    // 格式化日期键
    formatDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 获取某一天的笔记数量
    getNoteCountByDate(date) {
        const dateStr = this.formatDateKey(date);
        return this.shuoshuos.filter(s => {
            const noteDate = new Date(s.created);
            return this.formatDateKey(noteDate) === dateStr;
        }).length;
    }

    // 生成热力图月份标?
    generateHeatmapMonths() {
        const today = new Date();
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        // 获取最近3个月（包括本月）
        const months = [];
        for (let i = 2; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            months.push(date.getMonth());
        }
        
        // 将3个月份均匀分布在12列中，标签显示在两列之间
        // 二月：第2列和第3列之间（grid-column: 2 / 4，跨2列居中）
        // 三月：第6列和第7列之间（grid-column: 6 / 8，跨2列居中）
        // 四月：第10列和第11列之间（grid-column: 10 / 12，跨2列居中）
        const spans = [
            { start: 2, end: 4 },    // 二月跨第2、3列
            { start: 6, end: 8 },    // 三月跨第6、7列
            { start: 10, end: 12 }   // 四月跨第10、11列
        ];
        
        let html = '';
        for (let i = 0; i < months.length; i++) {
            html += `<span style="grid-column: ${spans[i].start} / ${spans[i].end}; text-align: center;">${monthNames[months[i]]}</span>`;
        }
        
        return html;
    }

    // 渲染笔记列表
    renderNotes() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 显示输入区域，移除回顾模式
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'block';
        listEl.classList.remove('review-mode');

        // 根据选中日期或标签筛?
        let filtered = this.shuoshuos;
        if (this.selectedDate) {
            filtered = filtered.filter(s => {
                const noteDate = new Date(s.created);
                return this.formatDateKey(noteDate) === this.selectedDate;
            });
        }
        if (this.selectedTag) {
            // 支持父级标签筛选：如果笔记标签?selectedTag 开头或等于 selectedTag，则匹配
            filtered = filtered.filter(s => {
                if (!s.tags) return false;
                return s.tags.some(tag => tag === this.selectedTag || tag.startsWith(this.selectedTag + '/'));
            });
        }

        // 排序：置顶的在前，然后按时间倒序
        const sorted = [...filtered].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });

        if (sorted.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-note-card" style="text-align: center; color: #999; padding: 40px;">
                    还没有笔记，在上方输入框写下第一条想法吧~
                </div>
            `;
            return;
        }

        // 根据视图样式选择渲染方式
        if (this.viewStyle === 'card') {
            // 瀑布流布局：将笔记分配到三列
            listEl.innerHTML = this.renderMasonryNotes(sorted);
        } else {
            // 平铺布局
            listEl.innerHTML = sorted.map(item => this.renderNoteCard(item)).join('');
        }

        // 更新统计
        const countEl = this.container.querySelector('#shuoshuo-count');
        if (countEl) {
            countEl.textContent = this.shuoshuos.length;
        }

        // 应用视图样式（异步，但不阻塞）
        this.applyViewStyle();
    }

    // 渲染单个笔记卡片
    renderNoteCard(item) {
        const dateStr = this.formatDate(item.created);
        const pinnedIcon = item.pinned ? `<span class="north-shuoshuo-note-pinned">${ICONS.star}</span>` : '';
        const memoRelations = this.renderMemoRelations(item.content);
        return `
            <div class="north-shuoshuo-note-card ${item.pinned ? 'pinned' : ''}" data-id="${item.id}">
                <div class="north-shuoshuo-note-header">
                    <span class="north-shuoshuo-note-date">${dateStr}</span>
                    <div class="north-shuoshuo-note-actions">
                        ${pinnedIcon}
                        <span class="north-shuoshuo-note-menu" data-id="${item.id}">${ICONS.moreH}</span>
                    </div>
                </div>
                ${this.renderNoteContent(item.content)}
                ${memoRelations}
            </div>
        `;
    }

    // 提取 MEMO 引用
    extractMemoRefs(content) {
        if (!content) return [];
        const refs = [];
        const regex = /\[MEMO:([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            refs.push(match[1]);
        }
        return [...new Set(refs)];
    }

    // 渲染 MEMO 关联提示
    renderMemoRelations(content) {
        const noteIds = this.extractMemoRefs(content);
        if (noteIds.length === 0) return '';
        
        const isComment = /^关联自：\[MEMO:[^\]]+\]/.test(content || '');
        
        return `
            <div class="north-shuoshuo-memo-relations">
                ${noteIds.map(id => {
                    const note = this.shuoshuos.find(s => s.id === id);
                    if (!note) return '';
                    const dateStr = this.formatDate(note.created).split(' ')[0]; // 只取日期部分
                    
                    let infoText = '';
                    if (isComment) {
                        // 批注：显示"关联自：被引用原文预览"
                        let sourcePreview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
                        sourcePreview = sourcePreview.split('\n')[0];
                        sourcePreview = sourcePreview.substring(0, 80) + (sourcePreview.length > 80 ? '...' : '');
                        infoText = `关联自：${this.escapeHtml(sourcePreview)}`;
                    } else {
                        let preview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
                        preview = preview.split('\n')[0];
                        preview = preview.substring(0, 80) + (preview.length > 80 ? '...' : '');
                        infoText = this.escapeHtml(preview);
                    }
                    
                    return `
                        <div class="north-shuoshuo-memo-relation-item" data-id="${id}">
                            <span class="north-shuoshuo-memo-relation-icon"></span>
                            <span class="north-shuoshuo-memo-relation-info">${dateStr}: ${infoText}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 渲染瀑布流布局（三列）
    renderMasonryNotes(sorted) {
        // 创建三列
        const columns = [[], [], []];
        
        // 将笔记分配到三列（简单轮询分配，确保每列数量均衡）
        sorted.forEach((item, index) => {
            const columnIndex = index % 3;
            columns[columnIndex].push(item);
        });
        
        // 渲染三列
        return `
            <div class="north-shuoshuo-masonry-column" data-column="0">
                ${columns[0].map(item => this.renderNoteCard(item)).join('')}
            </div>
            <div class="north-shuoshuo-masonry-column" data-column="1">
                ${columns[1].map(item => this.renderNoteCard(item)).join('')}
            </div>
            <div class="north-shuoshuo-masonry-column" data-column="2">
                ${columns[2].map(item => this.renderNoteCard(item)).join('')}
            </div>
        `;
    }

    // 渲染每日回顾视图
    renderReview() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 隐藏输入区域，但保持侧边栏可见
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        
        // 添加特殊类名用于样式控制
        listEl.classList.add('review-mode');

        // 获取回顾笔记
        const reviewNotes = this.getReviewNotes();
        
        // 获取当前回顾配置描述
        const { contentScope, timeRange, dailyCount } = this.reviewConfig;
        
        const contentScopeMap = {
            'all': '全部内容',
            'include_tags': '包含指定标签',
            'exclude_tags': '排除指定标签',
            'no_tags': '无标签'
        };
        
        const timeRangeMap = {
            'all': '全部时间',
            '1_year': '1年内',
            '6_months': '6个月内',
            '3_months': '3个月内',
            '1_month': '1个月内'
        };

        const configDesc = `${contentScopeMap[contentScope]} · ${timeRangeMap[timeRange]} · ${dailyCount}条/天`;

        if (reviewNotes.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-review-page">
                    <div class="north-shuoshuo-review-card-wrapper">
                        <div class="north-shuoshuo-review-card">
                            <div class="north-shuoshuo-empty-state" style="padding: 80px 20px; text-align: center;">
                                <div class="north-shuoshuo-empty-icon" style="font-size: 48px; margin-bottom: 16px;">📭</div>
                                <div class="north-shuoshuo-empty-text" style="font-size: 16px; color: #666; margin-bottom: 8px;">暂无符合条件的笔记</div>
                                <div class="north-shuoshuo-empty-hint" style="font-size: 13px; color: #999;">试着在设置中调整回顾规则或添加更多笔记吧</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        // 存储回顾笔记和当前索引
        this.currentReviewNotes = reviewNotes;
        this.currentReviewIndex = 0;

        // 渲染单条卡片
        this.renderReviewCard(listEl, configDesc);
    }

    // 渲染单条回顾卡片
    renderReviewCard(listEl, configDesc) {
        const note = this.currentReviewNotes[this.currentReviewIndex];
        const dateStr = this.formatDate(note.created);
        const total = this.currentReviewNotes.length;
        const current = this.currentReviewIndex + 1;

        listEl.innerHTML = `
            <div class="north-shuoshuo-review-page">
                <div class="north-shuoshuo-review-card-wrapper">
                    <div class="north-shuoshuo-review-card">
                        <div class="north-shuoshuo-review-card-header">
                            <span class="north-shuoshuo-review-card-date">${dateStr}</span>
                            <span class="north-shuoshuo-review-card-menu" data-id="${note.id}">•••</span>
                        </div>
                        <div class="north-shuoshuo-review-card-content">
                            ${this.renderNoteContent(note.content)}
                        </div>
                        <div class="north-shuoshuo-review-card-footer">
                            <div class="north-shuoshuo-review-card-actions">
                                <button class="north-shuoshuo-review-card-btn" id="review-edit-btn" title="编辑" data-id="${note.id}">
                                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                </button>
                            </div>
                            <div class="north-shuoshuo-review-pagination">
                                <span class="north-shuoshuo-review-page-btn ${this.currentReviewIndex === 0 ? 'disabled' : ''}" id="review-prev-btn">&lt;</span>
                                <span>${current}/${total}</span>
                                <span class="north-shuoshuo-review-page-btn ${this.currentReviewIndex === total - 1 ? 'disabled' : ''}" id="review-next-btn">&gt;</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 绑定翻页事件
        const prevBtn = listEl.querySelector('#review-prev-btn');
        const nextBtn = listEl.querySelector('#review-next-btn');

        if (prevBtn && this.currentReviewIndex > 0) {
            prevBtn.addEventListener('click', () => {
                this.currentReviewIndex--;
                this.renderReviewCard(listEl, configDesc);
            });
        }

        if (nextBtn && this.currentReviewIndex < total - 1) {
            nextBtn.addEventListener('click', () => {
                this.currentReviewIndex++;
                this.renderReviewCard(listEl, configDesc);
            });
        }

        // 绑定菜单事件
        const menuBtn = listEl.querySelector('.north-shuoshuo-review-card-menu');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                this.showNoteMenu(note.id, menuBtn);
            });
        }

        // 绑定编辑按钮
        const editBtn = listEl.querySelector('#review-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editNote(note.id);
            });
        }
    }

    // 绑定回顾设置按钮事件


    // 渲染随机漫步视图
    renderRandom() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 隐藏输入区域
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        listEl.classList.remove('review-mode');

        if (this.shuoshuos.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-random-section">
                    <div class="north-shuoshuo-random-title">随机漫步</div>
                    <div class="north-shuoshuo-empty-icon">🎲</div>
                    <div class="north-shuoshuo-empty-text">还没有笔记</div>
                    <div class="north-shuoshuo-empty-hint">添加一些笔记后，来这里发现惊喜</div>
                </div>
            `;
            return;
        }

        // 随机选择一条笔记
        const randomIndex = Math.floor(Math.random() * this.shuoshuos.length);
        const randomNote = this.shuoshuos[randomIndex];

        listEl.innerHTML = `
            <div class="north-shuoshuo-random-section">
                <div class="north-shuoshuo-random-title">随机漫步</div>
                <div class="north-shuoshuo-random-hint">发现过去的灵感</div>
                ${this.renderNoteCard(randomNote)}
                <button class="north-shuoshuo-btn north-shuoshuo-btn-primary north-shuoshuo-random-btn">🎲 再来一条</button>
            </div>
        `;

        // 绑定再来一条按钮
        const randomBtn = listEl.querySelector('.north-shuoshuo-random-btn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.renderRandom();
            });
        }
    }

    // 渲染统计视图
    renderStats(selectedYear = null) {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 隐藏输入区域
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        listEl.classList.remove('review-mode');

        // 获取年份列表（从最早记录到当前年）
        const currentYear = new Date().getFullYear();
        const year = selectedYear || currentYear;
        let minYear = currentYear;
        if (this.shuoshuos.length > 0) {
            const oldestNote = this.shuoshuos.reduce((min, note) => note.created < min.created ? note : min, this.shuoshuos[0]);
            minYear = new Date(oldestNote.created).getFullYear();
        }
        
        const years = [];
        for (let y = currentYear; y >= minYear; y--) {
            years.push(y);
        }
        
        // 计算统计数据（按年份）
        const stats = this.calculateStats(year);

        listEl.innerHTML = `
            <div class="north-shuoshuo-stats-page">
                <div class="north-shuoshuo-stats-container">
                    <!-- 头部 -->
                    <div class="north-shuoshuo-stats-header">
                        <h1>记录统计</h1>
                        <div class="north-shuoshuo-year-selector">
                            <select id="stats-year-select">
                                ${years.map(y => `<option value="${y}" ${y === year ? 'selected' : ''}>${y}年</option>`).join('')}
                            </select>
                            <span class="north-shuoshuo-select-arrow">▼</span>
                        </div>
                    </div>

                    <!-- 统计数据 -->
                    <div class="north-shuoshuo-stats-grid">
                        <div class="north-shuoshuo-stat-card">
                            <div class="north-shuoshuo-stat-number">${stats.totalNotes}</div>
                            <div class="north-shuoshuo-stat-label">记录</div>
                        </div>
                        <div class="north-shuoshuo-stat-card">
                            <div class="north-shuoshuo-stat-number">${stats.totalWords.toLocaleString()}</div>
                            <div class="north-shuoshuo-stat-label">字数</div>
                        </div>
                        <div class="north-shuoshuo-stat-card">
                            <div class="north-shuoshuo-stat-number">${stats.maxNotesPerDay}</div>
                            <div class="north-shuoshuo-stat-label">单日最多数</div>
                        </div>
                        <div class="north-shuoshuo-stat-card">
                            <div class="north-shuoshuo-stat-number">${stats.maxWordsPerDay.toLocaleString()}</div>
                            <div class="north-shuoshuo-stat-label">单日最多字数</div>
                        </div>
                        <div class="north-shuoshuo-stat-card">
                            <div class="north-shuoshuo-stat-number">${stats.activeDays}</div>
                            <div class="north-shuoshuo-stat-label">坚持记录天数</div>
                        </div>
                    </div>

                    <!-- 热力图 -->
                    <div class="north-shuoshuo-heatmap-section">
                        <div class="north-shuoshuo-heatmap-header">${year}年 共 ${stats.totalNotes} 条记录</div>
                        <div class="north-shuoshuo-heatmap-large">
                            ${this.generateLargeHeatmap(year)}
                        </div>
                    </div>

                    <!-- 字数分布直接展示 -->
                    <div class="north-shuoshuo-word-distribution-section">
                        ${this.generateWordDistributionContent()}
                    </div>
                </div>
            </div>
        `;

        // 绑定年份选择器事件
        const yearSelect = listEl.querySelector('#stats-year-select');
        if (yearSelect) {
            yearSelect.addEventListener('change', (e) => {
                this.renderStats(parseInt(e.target.value));
            });
        }
    }

    // 显示功能详情视图
    showFeatureView(feature) {
        const titles = {
            'tag-tree': '标签树',
            'tag-matrix': '标签矩阵',
            'word-distribution': '字数分布',
            'time-distribution': '时间分布'
        };
        
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'north-shuoshuo-feature-modal';
        
        let content = '';
        switch(feature) {
            case 'tag-tree':
                content = this.generateTagTreeContent();
                break;
            case 'tag-matrix':
                content = this.generateTagMatrixContent();
                break;
            case 'word-distribution':
                content = this.generateWordDistributionContent();
                break;
            case 'time-distribution':
                content = this.generateTimeDistributionContent();
                break;
        }
        
        modal.innerHTML = `
            <div class="north-shuoshuo-modal-overlay"></div>
            <div class="north-shuoshuo-modal-content feature-modal-content">
                <div class="north-shuoshuo-modal-header">
                    <div class="north-shuoshuo-modal-title">${titles[feature]}</div>
                    <div class="north-shuoshuo-modal-close">×</div>
                </div>
                <div class="north-shuoshuo-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭事件
        modal.querySelector('.north-shuoshuo-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        modal.querySelector('.north-shuoshuo-modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    // 获取 Emoji 配置
    async fetchEmojiConf() {
        try {
            const response = await fetch('/api/system/getEmojiConf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const result = await response.json();
            if (result.code === 0 && result.data) {
                return result.data;
            }
        } catch (e) {
            console.error('获取 Emoji 配置失败:', e);
        }
        return null;
    }

    // 将十六进制代码转换为 Emoji 字符
    convertHexToEmoji(unicode) {
        if (!unicode || typeof unicode !== 'string') return unicode;
        
        // 如果是图片路径，直接返回
        if (unicode.match(/\.(png|gif|jpg|jpeg|webp)$/i)) {
            return unicode;
        }
        
        // 如果看起来已经是 emoji 字符（包含非十六进制字符且不是分隔符），直接返回
        const hexPattern = /^[\da-fA-F\s_\-U\+]+$/;
        if (!hexPattern.test(unicode)) {
            return unicode;
        }
        
        try {
            // 清理字符串
            let clean = unicode
                .replace(/U\+/gi, ' ')     // 移除 U+ 前缀，转为空格
                .replace(/-/g, ' ')        // 连字符转空格
                .replace(/_/g, ' ')        // 下划线转空格
                .replace(/\+/g, ' ')       // 加号转空格
                .trim();
            
            // 分割成多个码点
            const codes = clean.split(/\s+/).filter(c => c.length > 0);
            
            if (codes.length === 0) return unicode;
            
            // 转换每个码点
            const codePoints = [];
            for (const code of codes) {
                // 只处理有效的十六进制字符串
                if (!/^[\da-fA-F]+$/.test(code)) continue;
                
                const num = parseInt(code, 16);
                // 检查是否是有效的 Unicode 码点（排除代理对区域）
                if (num >= 0 && num <= 0x10FFFF && !(num >= 0xD800 && num <= 0xDFFF)) {
                    codePoints.push(num);
                }
            }
            
            if (codePoints.length === 0) return unicode;
            
            return String.fromCodePoint(...codePoints);
        } catch (e) {
            console.warn('转换 emoji 失败:', unicode, e);
            return unicode;
        }
    }

    // 显示图标选择器
    async showIconPicker(tagName, currentIcon, callback) {
        // 预设颜色列表
        const presetColors = ['#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e91e63', '#ff5722', '#795548'];
        
        // 解析当前图标配置
        let currentContent = '';
        let currentColor = '#2ecc71';
        if (currentIcon && currentIcon.startsWith('icon:')) {
            const parts = currentIcon.substring(5).split(':');
            currentContent = decodeURIComponent(parts[0] || '');
            currentColor = parts[1] || '#2ecc71';
        }
        
        const modal = document.createElement('div');
        modal.className = 'north-shuoshuo-icon-picker-modal';
        
        let colorsHtml = presetColors.map(color => `
            <span class="north-shuoshuo-color-option ${color === currentColor ? 'selected' : ''}" 
                  data-color="${color}" 
                  style="background-color: ${color}"></span>
        `).join('');
        
        // 获取 Emoji 配置
        const emojiConf = await this.fetchEmojiConf();
        
        // 构建 Emoji 面板 HTML
        let emojiPanelHtml = '';
        if (emojiConf && emojiConf.length > 0) {
            // 有 API 数据，按分组渲染
            emojiPanelHtml = emojiConf.map(group => {
                const groupId = group.id || '';
                const groupTitle = group.title_zh_cn || group.title || groupId;
                const items = group.items || [];
                
                if (items.length === 0) return '';
                
                let groupHtml = `<div class="north-shuoshuo-emoji-group" data-group="${groupId}">`;
                groupHtml += `<div class="north-shuoshuo-emoji-group-title">${groupTitle}</div>`;
                groupHtml += '<div class="north-shuoshuo-emoji-group-items">';
                
                items.forEach(item => {
                    const unicode = item.unicode || '';
                    const desc = item.description_zh_cn || item.description || '';
                    const keywords = item.keywords || '';
                    
                    // 调试：检查看起来无效的 unicode 值
                    if (unicode && !unicode.match(/^[\da-fA-F\s_\-U\+]+$/)) {
                        console.warn('Emoji 包含非十六进制字符:', unicode, '描述:', desc);
                    }
                    
                    // 自定义 emoji 是图片路径，内置 emoji 是 unicode 十六进制代码
                    const isCustomEmoji = /\.(png|gif|jpg|jpeg|webp)$/i.test(unicode);
                    
                    if (isCustomEmoji) {
                        // 自定义 emoji 图片
                        groupHtml += `<span class="north-shuoshuo-emoji-option" 
                            data-emoji="${unicode}" 
                            data-type="custom"
                            data-desc="${this.escapeHtml(desc)}"
                            title="${this.escapeHtml(desc)}">
                            <img src="/emojis/${encodeURIComponent(unicode)}" alt="${this.escapeHtml(desc)}" loading="lazy">
                        </span>`;
                    } else {
                        // 内置 emoji：将十六进制代码转换为 Unicode 字符
                        let emojiChar = this.convertHexToEmoji(unicode);
                        
                        // 如果转换失败（还是原始值且看起来像十六进制），显示为图片
                        if (emojiChar === unicode && /^[\da-fA-F]+$/.test(unicode)) {
                            // 尝试使用思源的表情图片 API
                            groupHtml += `<span class="north-shuoshuo-emoji-option" 
                                data-emoji="${unicode}" 
                                data-type="builtin"
                                data-keywords="${this.escapeHtml(keywords)}"
                                title="${this.escapeHtml(desc)}">
                                <img src="/emojis/${encodeURIComponent(unicode)}.png" 
                                    alt="${this.escapeHtml(desc)}" 
                                    loading="lazy"
                                    onerror="this.style.display='none'; this.parentElement.textContent='&#x${unicode};';">
                            </span>`;
                        } else {
                            groupHtml += `<span class="north-shuoshuo-emoji-option" 
                                data-emoji="${emojiChar}" 
                                data-type="builtin"
                                data-keywords="${this.escapeHtml(keywords)}"
                                title="${this.escapeHtml(desc)}">${emojiChar}</span>`;
                        }
                    }
                });
                
                groupHtml += '</div></div>';
                return groupHtml;
            }).join('');
        } else {
            // 备用：使用硬编码的简单 emoji 列表
            const fallbackEmojis = ['😀', '😂', '😊', '😎', '😍', '🥰', '😘', '🤔', '❤️', '💜', '💛', '💙', '⭐', '✨', '💡', '🔥', '🌙', '☀️', '📅', '📝', '📚', '🏷️'];
            emojiPanelHtml = `<div class="north-shuoshuo-emoji-group"><div class="north-shuoshuo-emoji-group-items">` +
                fallbackEmojis.map(emoji => `<span class="north-shuoshuo-emoji-option" data-emoji="${emoji}">${emoji}</span>`).join('') +
                `</div></div>`;
        }
        
        // 移除了自定义图标选项
        
        modal.innerHTML = `
            <div class="north-shuoshuo-modal-overlay"></div>
            <div class="north-shuoshuo-icon-picker-content">
                <div class="north-shuoshuo-icon-picker-header">
                    <div class="north-shuoshuo-icon-picker-title">设置 "${tagName}" 的图标</div>
                    <div class="north-shuoshuo-modal-close">×</div>
                </div>
                <div class="north-shuoshuo-icon-picker-body">
                    <div class="north-shuoshuo-icon-preview-section">
                        <img class="north-shuoshuo-icon-preview" src="/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(currentColor)}&content=${encodeURIComponent(currentContent || tagName.substring(0, 2))}" alt="icon">
                    </div>
                    
                    <!-- 标签页 -->
                    <div class="north-shuoshuo-icon-tabs">
                        <div class="north-shuoshuo-icon-tab active" data-tab="emoji">Emoji</div>
                        <div class="north-shuoshuo-icon-tab" data-tab="text">文字</div>
                    </div>
                    
                    <!-- Emoji 面板 -->
                    <div class="north-shuoshuo-icon-panel active" data-panel="emoji">
                        <div class="north-shuoshuo-emoji-search">
                            <input type="text" class="north-shuoshuo-emoji-search-input" placeholder="搜索表情...">
                        </div>
                        <div class="north-shuoshuo-emoji-container">${emojiPanelHtml}</div>
                    </div>
                    
                    <!-- 文字面板 -->
                    <div class="north-shuoshuo-icon-panel" data-panel="text">
                        <div class="north-shuoshuo-icon-input-section">
                            <input type="text" class="north-shuoshuo-icon-text-input" placeholder="输入图标文字（最多2个字）" maxlength="2" value="${currentContent}">
                        </div>
                        <div class="north-shuoshuo-icon-color-section">
                            <label>选择颜色</label>
                            <div class="north-shuoshuo-color-grid">${colorsHtml}</div>
                        </div>
                    </div>
                    
                    <div class="north-shuoshuo-icon-actions">
                        <button class="north-shuoshuo-icon-reset">重置为 #</button>
                        <button class="north-shuoshuo-icon-confirm">确定</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const previewImg = modal.querySelector('.north-shuoshuo-icon-preview');
        const textInput = modal.querySelector('.north-shuoshuo-icon-text-input');
        const colorOptions = modal.querySelectorAll('.north-shuoshuo-color-option');
        let selectedColor = currentColor;
        let selectedIcon = null; // 用于存储选中的图标配置
        
        // 更新预览
        const updatePreview = (content, isEmoji = false) => {
            if (isEmoji) {
                // Emoji 直接显示
                previewImg.src = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(selectedColor)}&content=${encodeURIComponent(content)}`;
            } else if (content) {
                previewImg.src = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(selectedColor)}&content=${encodeURIComponent(content)}`;
            } else {
                previewImg.src = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(selectedColor)}&content=${encodeURIComponent(tagName.substring(0, 2))}`;
            }
        };
        
        // 主标签页切换（Emoji/自定义/文字）
        const tabs = modal.querySelectorAll('.north-shuoshuo-icon-tab');
        const panels = modal.querySelectorAll('.north-shuoshuo-icon-panel');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                modal.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
            });
        });
        
        // Emoji 选择
        const emojiOptions = modal.querySelectorAll('.north-shuoshuo-emoji-option');
        emojiOptions.forEach(option => {
            option.addEventListener('click', () => {
                emojiOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const emoji = option.dataset.emoji;
                const type = option.dataset.type;
                
                if (type === 'custom') {
                    // 自定义 emoji 图片，保存为图片路径
                    selectedIcon = { type: 'customEmoji', content: emoji };
                    // 预览显示自定义 emoji
                    previewImg.src = `/emojis/${emoji}`;
                } else {
                    // 内置 emoji 字符
                    selectedIcon = { type: 'emoji', content: emoji };
                    updatePreview(emoji, true);
                }
            });
        });
        
        // Emoji 搜索功能
        const emojiSearchInput = modal.querySelector('.north-shuoshuo-emoji-search-input');
        if (emojiSearchInput) {
            emojiSearchInput.addEventListener('input', (e) => {
                const keyword = e.target.value.trim().toLowerCase();
                const groups = modal.querySelectorAll('.north-shuoshuo-emoji-group');
                
                if (!keyword) {
                    // 清空搜索，显示所有分组
                    groups.forEach(group => {
                        group.style.display = 'block';
                        const items = group.querySelectorAll('.north-shuoshuo-emoji-option');
                        items.forEach(item => item.style.display = 'flex');
                    });
                    return;
                }
                
                // 按关键词过滤
                groups.forEach(group => {
                    const items = group.querySelectorAll('.north-shuoshuo-emoji-option');
                    let hasVisible = false;
                    
                    items.forEach(item => {
                        const emoji = item.dataset.emoji || '';
                        const desc = item.dataset.desc || '';
                        const keywords = item.dataset.keywords || '';
                        
                        if (emoji.toLowerCase().includes(keyword) || 
                            desc.toLowerCase().includes(keyword) || 
                            keywords.toLowerCase().includes(keyword)) {
                            item.style.display = 'flex';
                            hasVisible = true;
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    // 如果没有匹配项，隐藏整个分组
                    group.style.display = hasVisible ? 'block' : 'none';
                });
            });
        }
        
        // 移除了自定义图标选择事件绑定
        
        // 文字输入事件
        textInput.addEventListener('input', () => {
            const text = textInput.value.trim();
            if (text) {
                selectedIcon = { type: 'text', content: text, color: selectedColor };
                updatePreview(text);
            }
        });
        
        // 颜色选择（仅对文字有效）
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedColor = option.dataset.color;
                if (selectedIcon?.type === 'text' || textInput.value.trim()) {
                    updatePreview(textInput.value.trim() || tagName.substring(0, 2));
                }
            });
        });
        
        // 确定按钮
        const confirmBtn = modal.querySelector('.north-shuoshuo-icon-confirm');
        confirmBtn.addEventListener('click', () => {
            if (selectedIcon) {
                if (selectedIcon.type === 'dynamic') {
                    // 动态图标：type:动态类型
                    callback(`icon:dynamic:${selectedIcon.iconType}`);
                } else if (selectedIcon.type === 'customEmoji') {
                    // 自定义 emoji：保存为 customEmoji:路径
                    callback(`icon:customEmoji:${encodeURIComponent(selectedIcon.content)}`);
                } else if (selectedIcon.type === 'emoji') {
                    // Emoji：直接保存 emoji 字符
                    callback(`icon:${encodeURIComponent(selectedIcon.content)}:${selectedColor}`);
                } else {
                    // 文字图标
                    callback(`icon:${encodeURIComponent(selectedIcon.content)}:${selectedColor}`);
                }
            } else {
                // 使用文字输入的内容
                const text = textInput.value.trim();
                if (text) {
                    callback(`icon:${encodeURIComponent(text)}:${selectedColor}`);
                } else {
                    callback('');
                }
            }
            modal.remove();
        });
        
        // 重置按钮
        const resetBtn = modal.querySelector('.north-shuoshuo-icon-reset');
        resetBtn.addEventListener('click', () => {
            callback('');
            modal.remove();
        });
        
        // 回车确认
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
        
        // 关闭弹窗
        modal.querySelector('.north-shuoshuo-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        modal.querySelector('.north-shuoshuo-modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    // 生成标签树内容
    generateTagTreeContent() {
        const allTags = this.extractAllTags();
        if (allTags.length === 0) {
            return '<div class="north-shuoshuo-empty-hint">暂无标签数据</div>';
        }
        
        // 构建标签树结构
        const tagTree = {};
        allTags.forEach(tag => {
            const parts = tag.split('/');
            let current = tagTree;
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = { children: {}, count: 0, fullPath: parts.slice(0, index + 1).join('/') };
                }
                current[part].count++;
                current = current[part].children;
            });
        });
        
        // 递归生成HTML
        const generateTreeHTML = (node, level = 0) => {
            let html = '<ul class="north-shuoshuo-tag-tree">';
            Object.entries(node).forEach(([name, data]) => {
                const hasChildren = Object.keys(data.children).length > 0;
                const indent = level * 20;
                html += `
                    <li class="north-shuoshuo-tag-tree-item" style="padding-left: ${indent}px;">
                        <span class="north-shuoshuo-tag-tree-name">#${name}</span>
                        <span class="north-shuoshuo-tag-tree-count">${data.count}</span>
                    </li>
                `;
                if (hasChildren) {
                    html += generateTreeHTML(data.children, level + 1);
                }
            });
            html += '</ul>';
            return html;
        };
        
        return generateTreeHTML(tagTree);
    }

    // 生成标签矩阵内容
    generateTagMatrixContent() {
        const allTags = this.extractAllTags();
        if (allTags.length === 0) {
            return '<div class="north-shuoshuo-empty-hint">暂无标签数据</div>';
        }
        
        // 计算标签共现矩阵（简化版）
        const tagCounts = {};
        this.shuoshuos.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => {
                    if (!tagCounts[tag]) tagCounts[tag] = 0;
                    tagCounts[tag]++;
                });
            }
        });
        
        // 按使用频率排序
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
        
        let html = '<div class="north-shuoshuo-tag-matrix">';
        sortedTags.forEach(([tag, count]) => {
            const size = Math.min(100, 20 + count * 5);
            html += `
                <div class="north-shuoshuo-tag-matrix-item" style="font-size: ${size}%;">
                    <span class="north-shuoshuo-tag-matrix-name">#${tag}</span>
                    <span class="north-shuoshuo-tag-matrix-count">${count}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 生成字数分布内容
    generateWordDistributionContent() {
        const distribution = { '0-50': 0, '51-100': 0, '101-200': 0, '201-500': 0, '500+': 0 };
        this.shuoshuos.forEach(note => {
            const len = note.content ? note.content.length : 0;
            if (len <= 50) distribution['0-50']++;
            else if (len <= 100) distribution['51-100']++;
            else if (len <= 200) distribution['101-200']++;
            else if (len <= 500) distribution['201-500']++;
            else distribution['500+']++;
        });
        
        const maxCount = Math.max(...Object.values(distribution));
        
        let html = `
            <div class="north-shuoshuo-distribution-section">
                <div class="north-shuoshuo-distribution-header">字数分布</div>
                <div class="north-shuoshuo-word-distribution">
        `;
        Object.entries(distribution).forEach(([range, count]) => {
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
            html += `
                <div class="north-shuoshuo-word-bar">
                    <span class="north-shuoshuo-word-label">${range} 字</span>
                    <div class="north-shuoshuo-word-bar-bg">
                        <div class="north-shuoshuo-word-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="north-shuoshuo-word-count">${count} 条</span>
                </div>
            `;
        });
        html += '</div></div>';
        return html;
    }

    // 生成时间分布内容
    generateTimeDistributionContent() {
        const hourlyDistribution = new Array(24).fill(0);
        this.shuoshuos.forEach(note => {
            const hour = new Date(note.created).getHours();
            hourlyDistribution[hour]++;
        });
        
        const maxCount = Math.max(...hourlyDistribution);
        
        let html = '<div class="north-shuoshuo-time-distribution">';
        hourlyDistribution.forEach((count, hour) => {
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
            html += `
                <div class="north-shuoshuo-time-bar">
                    <span class="north-shuoshuo-time-label">${timeLabel}</span>
                    <div class="north-shuoshuo-time-bar-bg">
                        <div class="north-shuoshuo-time-bar-fill" style="height: ${percentage}%"></div>
                    </div>
                    <span class="north-shuoshuo-time-count">${count}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    // 计算统计数据
    calculateStats(year = null) {
        let notes = this.shuoshuos;
        
        // 按年份筛选
        if (year) {
            notes = notes.filter(note => new Date(note.created).getFullYear() === year);
        }
        
        const totalNotes = notes.length;
        
        // 计算总字数
        let totalWords = 0;
        notes.forEach(note => {
            totalWords += note.content ? note.content.length : 0;
        });

        // 按日期分组统计
        const dateMap = new Map();
        notes.forEach(note => {
            const date = this.formatDateKey(new Date(note.created));
            if (!dateMap.has(date)) {
                dateMap.set(date, { count: 0, words: 0 });
            }
            const data = dateMap.get(date);
            data.count++;
            data.words += note.content ? note.content.length : 0;
        });

        // 计算单日最大
        let maxNotesPerDay = 0;
        let maxWordsPerDay = 0;
        dateMap.forEach(data => {
            if (data.count > maxNotesPerDay) maxNotesPerDay = data.count;
            if (data.words > maxWordsPerDay) maxWordsPerDay = data.words;
        });

        // 活跃天数
        const activeDays = dateMap.size;

        return {
            totalNotes,
            totalWords,
            maxNotesPerDay,
            maxWordsPerDay,
            activeDays
        };
    }

    // 生成大型热力图
    generateLargeHeatmap(year = null) {
        const today = new Date();
        const days = 7;
        
        // 确定要显示的年份范围
        let startDate, endDate;
        if (year) {
            // 特定年份：从该年1月1日到12月31日
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31);
            // 调整到周日开始
            startDate.setDate(startDate.getDate() - startDate.getDay());
        } else {
            // 默认：最近一年
            const oneYearAgo = new Date(today);
            oneYearAgo.setDate(today.getDate() - 364);
            startDate = new Date(oneYearAgo);
            startDate.setDate(oneYearAgo.getDate() - oneYearAgo.getDay());
            endDate = today;
        }
        
        // 计算需要多少周
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const weeks = Math.ceil((daysDiff + startDate.getDay()) / 7);
        
        let html = '';
        
        // 记录每个月份的起始周（只记录目标年份的月份）
        const monthPositions = [];
        const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        let currentMonth = -1;
        const targetYear = year || today.getFullYear();
        
        for (let week = 0; week < weeks; week++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + week * 7);
            
            // 只记录目标年份的月份，跳过前一年或后一年的月份
            if (date.getFullYear() !== targetYear) {
                continue;
            }
            
            const month = date.getMonth();
            
            if (month !== currentMonth) {
                currentMonth = month;
                monthPositions.push({ month: months[month], week: week });
            }
        }

        // 热力图格子（先生成）
        for (let day = 0; day < days; day++) {
            html += '<div class="north-shuoshuo-heatmap-row">';
            
            // 格子
            html += '<div class="north-shuoshuo-heatmap-cells">';
            for (let week = 0; week < weeks; week++) {
                const dayIndex = week * 7 + day;
                const date = new Date(startDate);
                date.setDate(date.getDate() + dayIndex);
                
                // 只显示范围内的日期
                if (date <= endDate && date >= new Date(year || today.getFullYear(), 0, 1)) {
                    const count = this.getNoteCountByDate(date);
                    let level = 0;
                    if (count >= 1) level = 1;
                    if (count >= 3) level = 2;
                    if (count >= 5) level = 3;
                    if (count >= 8) level = 4;
                    
                    const dateStr = this.formatDateKey(date);
                    html += `<div class="north-shuoshuo-heatmap-cell-large level-${level}" data-date="${dateStr}" title="${dateStr}: ${count}条"></div>`;
                } else {
                    html += `<div class="north-shuoshuo-heatmap-cell-large level-empty"></div>`;
                }
            }
            html += '</div>';
            
            // 星期标签（在右侧）- 只显示一、三、五
            const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
            const showLabels = ['一', '三', '五'];
            const labelText = showLabels.includes(dayLabels[day]) ? dayLabels[day] : '';
            html += `<span class="north-shuoshuo-heatmap-daylabel">${labelText}</span>`;
            
            html += '</div>';
        }
        
        // 月份标签（在下方）
        html += '<div class="north-shuoshuo-heatmap-months">';
        
        // 找到目标年份第一周的索引
        let firstTargetWeek = 0;
        for (let week = 0; week < weeks; week++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + week * 7);
            if (date.getFullYear() === targetYear) {
                firstTargetWeek = week;
                break;
            }
        }
        
        // 计算每个月份占据的周数
        monthPositions.forEach((mp, index) => {
            const nextWeek = index < monthPositions.length - 1 ? monthPositions[index + 1].week : weeks;
            // 相对于目标年份开始位置的周数
            const relativeStartWeek = mp.week - firstTargetWeek;
            const relativeNextWeek = nextWeek - firstTargetWeek;
            const flexValue = Math.max(1, relativeNextWeek - relativeStartWeek);
            html += `<span class="north-shuoshuo-heatmap-month" style="flex: ${flexValue};">${mp.month}</span>`;
        });
        html += '</div>';

        return html;
    }

    bindEvents() {
        const input = this.container.querySelector('#shuoshuo-input');
        const inputBox = this.container.querySelector('#shuoshuo-input-box');
        const sendBtn = this.container.querySelector('#shuoshuo-send');

        // 输入框聚焦效?
        if (input && inputBox) {
            input.addEventListener('focus', () => {
                inputBox.classList.add('focused');
            });
            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    inputBox.classList.remove('focused');
                }
            });
        }

        // 输入监听，控制发送按钮，并自动转换列表符?
        if (input && sendBtn) {
            const autoResize = () => {
                input.style.height = 'auto';
                input.style.height = Math.max(60, input.scrollHeight) + 'px';
            };
            input.addEventListener('input', () => {
                if (input.value.trim().length > 0) {
                    sendBtn.classList.add('active');
                } else {
                    sendBtn.classList.remove('active');
                }
                
                // 自动将行首的 - / * 转换为 •
                const cursorPos = input.selectionStart;
                const value = input.value;
                const beforeCursor = value.substring(0, cursorPos);
                const afterCursor = value.substring(cursorPos);
                
                // 检查是否在行首输入 - 或 *
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];
                
                if (currentLine === '- ' || currentLine === '* ') {
                    lines[lines.length - 1] = '• ';
                    input.value = lines.join('\n') + afterCursor;
                    // 保持光标位置
                    input.setSelectionRange(cursorPos, cursorPos);
                }
                
                requestAnimationFrame(autoResize);
                
                // 处理 @ 快速引用
                this.handleMentionInput(input);
            });

            // Enter 换行，支持列表自动延?
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                    const cursorPos = input.selectionStart;
                    const value = input.value;
                    const beforeCursor = value.substring(0, cursorPos);
                    const afterCursor = value.substring(cursorPos);
                    
                    // 获取当前行
                    const lines = beforeCursor.split('\n');
                    const currentLine = lines[lines.length - 1];
                    
                    // 检查是否是无序列表
                    const unorderedMatch = currentLine.match(/^(•\s|-\s|\*\s)(.*)$/);
                    // 检查是否是有序列表
                    const orderedMatch = currentLine.match(/^(\d+)\.\s(.*)$/);
                    
                    if (unorderedMatch) {
                        // 如果当前行只有列表符号（空内容），取消列?
                        if (!unorderedMatch[2].trim()) {
                            e.preventDefault();
                            lines[lines.length - 1] = '';
                            input.value = lines.join('\n') + '\n' + afterCursor;
                            const newPos = lines.join('\n').length + 1;
                            input.setSelectionRange(newPos, newPos);
                            return;
                        }
                        
                        // 自动延续无序列表
                        e.preventDefault();
                        const newLine = '\n• ';
                        input.value = beforeCursor + newLine + afterCursor;
                        input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                        return;
                    }
                    
                    if (orderedMatch) {
                        // 如果当前行只有序号（空内容），取消列?
                        if (!orderedMatch[2].trim()) {
                            e.preventDefault();
                            lines[lines.length - 1] = '';
                            input.value = lines.join('\n') + '\n' + afterCursor;
                            const newPos = lines.join('\n').length + 1;
                            input.setSelectionRange(newPos, newPos);
                            return;
                        }
                        
                        // 自动延续有序列表，序?1
                        e.preventDefault();
                        const nextNum = parseInt(orderedMatch[1]) + 1;
                        const newLine = '\n' + nextNum + '. ';
                        input.value = beforeCursor + newLine + afterCursor;
                        input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                        return;
                    }
                }
                
                // Ctrl+Enter ?Cmd+Enter 发布
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // 发送按?
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // 笔记卡片菜单
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (listEl) {
            listEl.addEventListener('click', (e) => {
                const menuEl = e.target.closest('.north-shuoshuo-note-menu');
                if (menuEl) {
                    e.stopPropagation();
                    const id = menuEl.dataset.id;
                    if (id) {
                        this.showNoteMenu(id, menuEl);
                    }
                    return;
                }
                
                // 处理 MEMO 引用点击
                const memoRef = e.target.closest('.north-shuoshuo-memo-ref');
                if (memoRef) {
                    e.stopPropagation();
                    const id = memoRef.dataset.id;
                    if (id) {
                        this.showMemoDetail(id);
                    }
                    return;
                }
                
                // 处理底部关联提示点击
                const memoRelation = e.target.closest('.north-shuoshuo-memo-relation-item, .north-shuoshuo-memo-relation-ref');
                if (memoRelation) {
                    e.stopPropagation();
                    const id = memoRelation.dataset.id;
                    if (id) {
                        this.showMemoDetail(id);
                    }
                }
            });
        }

        // 头像上传
        const avatarEl = this.container.querySelector('#shuoshuo-avatar-sidebar');
        if (avatarEl) {
            avatarEl.addEventListener('click', () => {
                this.uploadAvatar('user');
            });
        }

        // 左侧边栏导航切换视图
        const navItems = this.container.querySelectorAll('.north-shuoshuo-sidebar .north-shuoshuo-nav-item[data-view]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchMainView(view, item);
            });
        });

        // 工具栏按?
        this.bindToolbarEvents();

        // Flomo 侧边栏菜单点击
        const menuItems = this.container.querySelectorAll('.north-shuoshuo-menu-list .north-shuoshuo-menu-item[data-view]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                
                // 更新菜单选中状态
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // 清除热力图选中
                this.selectedDate = null;
                this.container.querySelectorAll('.north-shuoshuo-heatmap-cell').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // 清除标签选中
                this.selectedTag = null;
                this.container.querySelectorAll('.north-shuoshuo-tag-tree-item').forEach(t => {
                    t.classList.remove('selected');
                });
                
                // 切换视图
                if (view === 'notes') {
                    this.switchMainView('notes', null);
                } else if (view === 'review') {
                    this.switchMainView('review', null);
                } else if (view === 'random') {
                    this.switchMainView('random', null);
                }
            });
        });

        // 标签点击筛选和展开/折叠
        const tagsListEl = this.container.querySelector('.north-shuoshuo-tags-list');
        if (tagsListEl) {
            tagsListEl.addEventListener('click', (e) => {
                // 处理展开/折叠按钮点击
                const toggleBtn = e.target.closest('.north-shuoshuo-tag-toggle');
                if (toggleBtn) {
                    e.stopPropagation();
                    const targetId = toggleBtn.dataset.target;
                    const childrenEl = document.getElementById(targetId);
                    if (childrenEl) {
                        const isExpanded = childrenEl.style.display !== 'none';
                        childrenEl.style.display = isExpanded ? 'none' : 'block';
                        toggleBtn.textContent = isExpanded ? '▸' : '▾';
                    }
                    return;
                }

                // 处理标签菜单按钮点击
                const menuBtn = e.target.closest('.north-shuoshuo-tag-menu-btn');
                if (menuBtn) {
                    e.stopPropagation();
                    const tagName = menuBtn.dataset.tag;
                    this.showTagMenu(tagName, menuBtn);
                    return;
                }

                // 左侧图标和名称区域不再直接触发编辑，仅通过菜单操作
                const tagIconWrapper = e.target.closest('.north-shuoshuo-tag-icon-wrapper');
                if (tagIconWrapper) {
                    // 不再拦截图标点击，允许事件冒泡到标签项进行筛选
                }
                
                // 处理标签点击（不包括菜单和展开按钮区域）
                const tagItem = e.target.closest('.north-shuoshuo-tag-tree-item');
                if (tagItem && !e.target.closest('.north-shuoshuo-tag-toggle') && !e.target.closest('.north-shuoshuo-tag-menu-btn')) {
                    const tag = tagItem.dataset.tag;
                    if (tag) {
                        // 切换选中状态
                        const wasSelected = tagItem.classList.contains('selected');
                        
                        // 清除所有选中
                        tagsListEl.querySelectorAll('.north-shuoshuo-tag-tree-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        
                        if (wasSelected) {
                            // 取消筛选
                            this.selectedTag = null;
                            this.renderNotes();
                        } else {
                            // 选中并筛选
                            tagItem.classList.add('selected');
                            this.selectedTag = tag;
                            this.renderNotes();
                        }
                    }
                }
            });
        }

        // 热力图交互（点击筛?+ tooltip?
        const heatmapEl = this.container.querySelector('.north-shuoshuo-heatmap');
        if (heatmapEl) {
            // 点击筛?
            heatmapEl.addEventListener('click', (e) => {
                const cell = e.target.closest('.north-shuoshuo-heatmap-cell');
                if (cell) {
                    const dateStr = cell.dataset.date;
                    if (dateStr) {
                        const wasSelected = cell.classList.contains('selected');
                        heatmapEl.querySelectorAll('.north-shuoshuo-heatmap-cell').forEach(c => {
                            c.classList.remove('selected');
                        });
                        
                        if (wasSelected) {
                            this.selectedDate = null;
                            this.renderNotes();
                        } else {
                            cell.classList.add('selected');
                            this.selectedDate = dateStr;
                            this.renderNotes();
                        }
                    }
                }
            });

            // Tooltip 显示
            heatmapEl.addEventListener('mouseover', (e) => {
                const cell = e.target.closest('.north-shuoshuo-heatmap-cell');
                if (cell) {
                    const tooltip = cell.dataset.tooltip;
                    if (tooltip) {
                        // 移除?tooltip
                        const oldTooltip = document.querySelector('.north-shuoshuo-global-tooltip');
                        if (oldTooltip) oldTooltip.remove();
                        
                        // 创建?tooltip
                        const tooltipEl = document.createElement('div');
                        tooltipEl.className = 'north-shuoshuo-global-tooltip';
                        tooltipEl.textContent = tooltip;
                        tooltipEl.style.cssText = `
                            position: fixed;
                            background: rgba(0, 0, 0, 0.85);
                            color: #fff;
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-size: 12px;
                            z-index: 99999;
                            pointer-events: none;
                            white-space: nowrap;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        `;
                        document.body.appendChild(tooltipEl);
                        
                        const rect = cell.getBoundingClientRect();
                        tooltipEl.style.left = `${rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2}px`;
                        tooltipEl.style.top = `${rect.top - tooltipEl.offsetHeight - 6}px`;
                    }
                }
            });

            heatmapEl.addEventListener('mouseout', (e) => {
                const tooltip = document.querySelector('.north-shuoshuo-global-tooltip');
                if (tooltip) tooltip.remove();
            });
        }
    }

    sendMessage() {
        const input = this.container.querySelector('#shuoshuo-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        this.addShuoshuo(text);

        input.value = '';
        input.style.height = 'auto';
        const sendBtn = this.container.querySelector('#shuoshuo-send');
        if (sendBtn) sendBtn.classList.remove('active');
        const inputBox = this.container.querySelector('#shuoshuo-input-box');
        if (inputBox) inputBox.classList.remove('focused');
    }

    async addShuoshuo(content) {
        // 将粘贴的 lumina MEMO 链接转换为内部引用格式
        content = content.replace(/lumina:\/\/memo\/([a-zA-Z0-9]+)/g, '[MEMO:$1]');
        
        const tags = this.extractTags(content);
        
        const shuoshuo = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            content: content,
            tags: tags,
            pinned: false,
            created: Date.now(),
            updated: Date.now()
        };

        this.shuoshuos.push(shuoshuo);
        await this.saveShuoshuos();

        // 只有开启自动同步时才插入日?
        if (this.autoSync) {
            await this.appendToDailyNote(content, shuoshuo.created);
        }

        this.renderNotes();
        this.renderTags(); // 更新标签列表

        setTimeout(() => {
            showMessage("已记录");
        }, 300);
    }

    // 提取标签（支持多级标?#??孙）
    extractTags(content) {
        const tagRegex = /#([^\s\d][^\s]*(?:\/[^\s]+)*)/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            tags.push(match[1]); // 不包?# 符号
        }
        return [...new Set(tags)]; // 去重
    }

    // 绑定工具栏事?
    bindToolbarEvents() {
        const input = this.container.querySelector('#shuoshuo-input');
        if (!input) return;

        // 标签按钮
        const tagBtn = this.container.querySelector('#toolbar-tag');
        if (tagBtn) {
            tagBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTagPicker(input);
            });
        }

        // 图片按钮
        const imageBtn = this.container.querySelector('#toolbar-image');
        if (imageBtn) {
            imageBtn.addEventListener('click', () => {
                this.insertImage(input);
            });
        }

        // 无序列表按钮
        const ulBtn = this.container.querySelector('#toolbar-ul');
        if (ulBtn) {
            ulBtn.addEventListener('click', () => {
                this.insertText(input, '• ', '');
                input.focus();
            });
        }

        // 有序列表按钮
        const olBtn = this.container.querySelector('#toolbar-ol');
        if (olBtn) {
            olBtn.addEventListener('click', () => {
                // 获取当前行号或默?
                const lines = input.value.substring(0, input.selectionStart).split('\n');
                const currentLine = lines[lines.length - 1];
                const match = currentLine.match(/^(\d+)\.\s/);
                const num = match ? parseInt(match[1]) + 1 : 1;
                this.insertText(input, `${num}. `, '');
                input.focus();
            });
        }

        // @ 快速引用按钮
        const atBtn = this.container.querySelector('#toolbar-at');
        if (atBtn) {
            atBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMentionPicker(input);
            });
        }

    }

    // 在光标位置插入文?
    insertText(input, before, after) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        const selected = text.substring(start, end);
        
        input.value = text.substring(0, start) + before + selected + after + text.substring(end);
        
        const newPos = start + before.length + selected.length;
        input.setSelectionRange(newPos, newPos);
        
        // 触发 input 事件更新发送按钮状?
        input.dispatchEvent(new Event('input'));
    }

    // 处理 @ 快速引用输入
    handleMentionInput(input) {
        const existingPicker = document.querySelector('.north-shuoshuo-mention-picker');
        if (!existingPicker) {
            // 检查是否刚刚输入了 @
            const cursorPos = input.selectionStart;
            const value = input.value;
            const beforeCursor = value.substring(0, cursorPos);
            const currentLine = beforeCursor.split('\n').pop();
            
            // 如果当前行包含 @ 且在光标前
            const atIndex = currentLine.lastIndexOf('@');
            if (atIndex >= 0) {
                const afterAt = currentLine.substring(atIndex + 1);
                // @ 后不能有空格断开（允许多关键词空格分隔，但不能有第二个 @ 或换行）
                if (!afterAt.includes('@')) {
                    const lineStartPos = cursorPos - currentLine.length;
                    const triggerPos = lineStartPos + atIndex;
                    this.showMentionPicker(input, triggerPos);
                }
            }
            return;
        }
        
        // 更新已有选择器的过滤条件
        const triggerPos = parseInt(existingPicker.dataset.triggerPos, 10);
        const cursorPos = input.selectionStart;
        const value = input.value;
        
        // 如果光标移到了 @ 前面，关闭选择器
        if (cursorPos <= triggerPos) {
            existingPicker.remove();
            return;
        }
        
        // 检查 @ 是否还存在
        if (value.substring(triggerPos, triggerPos + 1) !== '@') {
            existingPicker.remove();
            return;
        }
        
        const searchText = value.substring(triggerPos + 1, cursorPos);
        const listEl = existingPicker.querySelector('.north-shuoshuo-mention-picker-list');
        if (listEl) {
            this.filterMentionPicker(listEl, searchText, input);
        }
    }

    // 显示 @ 快速引用选择器
    showMentionPicker(input, triggerPos = null) {
        // 移除已存在的
        const existingPicker = document.querySelector('.north-shuoshuo-mention-picker');
        if (existingPicker) {
            existingPicker.remove();
        }
        
        if (triggerPos === null) {
            triggerPos = input.selectionStart;
            // 按钮触发时，如果光标前不是 @，插入一个
            const value = input.value;
            if (value.substring(triggerPos - 1, triggerPos) !== '@') {
                // 手动插入 @，不触发 input 事件，避免 handleMentionInput 重复创建 picker
                const start = input.selectionStart;
                const text = input.value;
                input.value = text.substring(0, start) + '@' + text.substring(start);
                input.setSelectionRange(start + 1, start + 1);
            }
        }
        
        const picker = document.createElement('div');
        picker.className = 'north-shuoshuo-mention-picker';
        picker.dataset.triggerPos = triggerPos;
        picker.innerHTML = `
            <div class="north-shuoshuo-mention-picker-list"></div>
        `;
        
        // 定位到输入框下方
        const inputBox = this.container.querySelector('#shuoshuo-input-box');
        if (inputBox) {
            const rect = inputBox.getBoundingClientRect();
            picker.style.position = 'fixed';
            picker.style.left = `${rect.left + 20}px`;
            picker.style.top = `${rect.bottom + 8}px`;
            picker.style.zIndex = '99999';
        }
        
        document.body.appendChild(picker);
        
        const listEl = picker.querySelector('.north-shuoshuo-mention-picker-list');
        const searchText = input.value.substring(triggerPos + 1, input.selectionStart);
        this.filterMentionPicker(listEl, searchText, input);
        
        // 点击外部关闭
        const closeOnClickOutside = (e) => {
            if (!picker.contains(e.target) && !e.target.closest('#toolbar-at')) {
                picker.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeOnClickOutside);
        }, 0);
    }

    // 过滤并渲染 @ 引用列表
    filterMentionPicker(listEl, value, input) {
        const keywords = value.trim().toLowerCase().split(/\s+/).filter(k => k);
        
        // 按时间倒序获取笔记
        let notes = [...this.shuoshuos].sort((a, b) => b.created - a.created);
        
        if (keywords.length > 0) {
            notes = notes.filter(note => {
                const content = (note.content || '').toLowerCase();
                return keywords.every(k => content.includes(k));
            });
        }
        
        // 最多显示 20 条
        notes = notes.slice(0, 20);
        
        if (notes.length === 0) {
            listEl.innerHTML = '<div class="north-shuoshuo-mention-picker-empty">未找到相关 MEMO</div>';
            return;
        }
        
        const highlightText = (text, keywords) => {
            if (!keywords.length) return this.escapeHtml(text);
            let html = this.escapeHtml(text);
            keywords.forEach(k => {
                const regex = new RegExp(`(${this.escapeRegExp(k)})`, 'gi');
                html = html.replace(regex, '<mark class="north-shuoshuo-mention-highlight">$1</mark>');
            });
            return html;
        };
        
        listEl.innerHTML = notes.map(note => {
            const dateStr = this.formatDate(note.created);
            const preview = (note.content || '').split('\n')[0].substring(0, 80);
            const displayPreview = preview + ((note.content || '').split('\n')[0].length > 80 ? '...' : '');
            const highlightedPreview = highlightText(displayPreview, keywords);
            
            return `
                <div class="north-shuoshuo-mention-picker-item" data-id="${note.id}">
                    <div class="north-shuoshuo-mention-picker-date">${dateStr}</div>
                    <div class="north-shuoshuo-mention-picker-preview">${highlightedPreview}</div>
                </div>
            `;
        }).join('');
        
        // 绑定点击事件
        listEl.querySelectorAll('.north-shuoshuo-mention-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = item.dataset.id;
                const picker = document.querySelector('.north-shuoshuo-mention-picker');
                const tp = picker ? parseInt(picker.dataset.triggerPos, 10) : null;
                this.insertMention(input, noteId, tp);
                picker?.remove();
            });
        });
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 插入 MEMO 引用
    insertMention(input, noteId, triggerPos) {
        input.focus(); // 确保获取到正确的光标位置
        const cursorPos = input.selectionStart;
        const value = input.value;
        
        if (triggerPos !== null && triggerPos >= 0 && value.substring(triggerPos, triggerPos + 1) === '@') {
            const before = value.substring(0, triggerPos);
            const after = value.substring(cursorPos);
            const insertText = `[MEMO:${noteId}]`;
            input.value = before + insertText + after;
            const newPos = triggerPos + insertText.length;
            input.setSelectionRange(newPos, newPos);
        } else {
            this.insertText(input, `[MEMO:${noteId}]`, '');
        }
        
        input.focus();
        input.dispatchEvent(new Event('input'));
    }

    // 显示 MEMO 详情
    showMemoDetail(noteId) {
        const note = this.shuoshuos.find(s => s.id === noteId);
        if (!note) return;
        
        // 查找链接至此的 MEMO（按时间倒序，最新的在前）
        const linkingNotes = this.shuoshuos
            .filter(s => s.id !== noteId && s.content && s.content.includes(`[MEMO:${noteId}]`))
            .sort((a, b) => (b.created || 0) - (a.created || 0));
        
        const overlay = document.createElement('div');
        overlay.className = 'north-shuoshuo-memo-detail-modal';
        
        overlay.innerHTML = `
            <div class="north-shuoshuo-modal-overlay"></div>
            <div class="north-shuoshuo-modal-content">
                <div class="north-shuoshuo-modal-header">
                    <div class="north-shuoshuo-modal-title">详情</div>
                    <div class="north-shuoshuo-modal-actions">
                        <button class="north-shuoshuo-memo-detail-save" style="display:none;">保存</button>
                        <div class="north-shuoshuo-modal-close">×</div>
                    </div>
                </div>
                <div class="north-shuoshuo-modal-body">
                    <div class="north-shuoshuo-memo-detail-header">
                        <div class="north-shuoshuo-memo-detail-date">${this.formatDate(note.created)}</div>
                    </div>
                    <div class="north-shuoshuo-memo-detail-content">${this.renderNoteContent(note.content)}</div>
                    <textarea class="north-shuoshuo-memo-detail-textarea" style="display:none;">${this.escapeHtml(note.content)}</textarea>
                    ${linkingNotes.length > 0 ? `
                    <div class="north-shuoshuo-memo-detail-links">
                        <div class="north-shuoshuo-memo-detail-links-title">${linkingNotes.length} 条链接至此的 MEMO</div>
                        <div class="north-shuoshuo-memo-detail-links-list">
                            ${linkingNotes.map(linkNote => {
                                let preview = (linkNote.content || '')
                                    .replace(new RegExp(`\\[MEMO:${noteId}\\]`, 'g'), '')
                                    .replace(/^关联自：/, '')
                                    .trim();
                                preview = preview.split('\n')[0];
                                preview = preview.substring(0, 120) + (preview.length > 120 ? '...' : '');
                                preview = this.escapeHtml(preview).replace(/\s+/g, ' ').trim();
                                return `
                                    <div class="north-shuoshuo-memo-detail-link-item" data-id="${linkNote.id}">
                                        <div class="north-shuoshuo-memo-detail-link-date">${this.formatDate(linkNote.created)}</div>
                                        <div class="north-shuoshuo-memo-detail-link-preview">${preview}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const contentEl = overlay.querySelector('.north-shuoshuo-memo-detail-content');
        const textarea = overlay.querySelector('.north-shuoshuo-memo-detail-textarea');
        const saveBtn = overlay.querySelector('.north-shuoshuo-memo-detail-save');
        
        // 自动调整高度
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
        };
        textarea.addEventListener('input', autoResize);
        
        // 双击进入编辑
        contentEl.addEventListener('dblclick', () => {
            contentEl.style.display = 'none';
            textarea.style.display = 'block';
            saveBtn.style.display = 'inline-block';
            requestAnimationFrame(() => {
                autoResize();
                textarea.focus();
            });
        });
        
        overlay.querySelector('.north-shuoshuo-modal-close').addEventListener('click', () => {
            overlay.remove();
        });
        overlay.querySelector('.north-shuoshuo-modal-overlay').addEventListener('click', () => {
            overlay.remove();
        });
        
        // 点击关联 MEMO 跳转到原位置
        overlay.querySelectorAll('.north-shuoshuo-memo-detail-link-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                overlay.remove();
                setTimeout(() => {
                    const card = this.container.querySelector(`.north-shuoshuo-note-card[data-id="${id}"]`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.classList.add('north-shuoshuo-note-highlight');
                        setTimeout(() => card.classList.remove('north-shuoshuo-note-highlight'), 1500);
                    }
                }, 100);
            });
        });
        
        // 保存编辑
        saveBtn.addEventListener('click', async () => {
            const newContent = textarea.value.trim();
            if (newContent === note.content) {
                contentEl.style.display = 'block';
                textarea.style.display = 'none';
                saveBtn.style.display = 'none';
                return;
            }
            
            note.content = newContent;
            note.tags = this.extractTags(newContent);
            await this.saveShuoshuos();
            this.renderNotes();
            this.renderTags();
            
            // 更新详情弹窗中的原文展示
            contentEl.innerHTML = this.renderNoteContent(newContent);
            contentEl.style.display = 'block';
            textarea.style.display = 'none';
            saveBtn.style.display = 'none';
            showMessage('保存成功');
        });
    }

    // 显示标签选择器
    showTagPicker(input) {
        // 移除已存在的标签选择器
        const existingPicker = document.querySelector('.north-shuoshuo-tag-picker');
        if (existingPicker) {
            existingPicker.remove();
            return;
        }

        // 获取所有标签
        const allTags = this.extractAllTags();
        
        // 创建标签选择器
        const picker = document.createElement('div');
        picker.className = 'north-shuoshuo-tag-picker';
        picker.innerHTML = `
            <div class="north-shuoshuo-tag-picker-input-wrapper">
                <span class="north-shuoshuo-tag-picker-prefix">#</span>
                <input type="text" class="north-shuoshuo-tag-picker-input" placeholder="选择或创建标签..." autocomplete="off">
            </div>
            <div class="north-shuoshuo-tag-picker-list">
                ${allTags.length > 0 ? allTags.map(tag => `
                    <div class="north-shuoshuo-tag-picker-item" data-tag="${tag}">
                        <span class="north-shuoshuo-tag-picker-item-name">${tag}</span>
                    </div>
                `).join('') : '<div class="north-shuoshuo-tag-picker-empty">输入创建新标签</div>'}
            </div>
        `;

        // 定位到输入框下方
        const inputBox = this.container.querySelector('#shuoshuo-input-box');
        if (inputBox) {
            const rect = inputBox.getBoundingClientRect();
            picker.style.position = 'fixed';
            picker.style.left = `${rect.left + 20}px`;
            picker.style.top = `${rect.bottom + 8}px`;
            picker.style.zIndex = '99999';
        }

        document.body.appendChild(picker);

        // 获取元素引用
        const pickerInput = picker.querySelector('.north-shuoshuo-tag-picker-input');
        const pickerList = picker.querySelector('.north-shuoshuo-tag-picker-list');
        
        // 聚焦输入框
        pickerInput.focus();

        // 输入事件处理
        pickerInput.addEventListener('input', () => {
            const value = pickerInput.value.trim();
            this.filterTagPicker(pickerList, allTags, value);
        });

        // 键盘事件处理
        pickerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = pickerInput.value.trim();
                if (value) {
                    this.insertTag(input, value);
                    picker.remove();
                }
            } else if (e.key === 'Escape') {
                picker.remove();
            }
        });

        // 点击标签项
        pickerList.addEventListener('click', (e) => {
            const item = e.target.closest('.north-shuoshuo-tag-picker-item');
            if (item) {
                const tag = item.dataset.tag;
                this.insertTag(input, tag);
                picker.remove();
            }
        });

        // 点击外部关闭
        const closeOnClickOutside = (e) => {
            if (!picker.contains(e.target) && e.target.id !== 'toolbar-tag') {
                picker.remove();
                document.removeEventListener('click', closeOnClickOutside);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeOnClickOutside);
        }, 0);
    }

    // 提取所有标签
    extractAllTags() {
        const tagSet = new Set();
        this.shuoshuos.forEach(s => {
            if (s.tags && s.tags.length > 0) {
                s.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }

    // 过滤标签列表
    filterTagPicker(listEl, allTags, value) {
        if (!value) {
            listEl.innerHTML = allTags.length > 0 ? allTags.map(tag => `
                <div class="north-shuoshuo-tag-picker-item" data-tag="${tag}">
                    <span class="north-shuoshuo-tag-picker-item-name">${tag}</span>
                </div>
            `).join('') : '<div class="north-shuoshuo-tag-picker-empty">输入创建新标签</div>';
            return;
        }

        const filtered = allTags.filter(tag => tag.toLowerCase().includes(value.toLowerCase()));
        
        // 如果没有匹配的现有标签，显示创建新标签选项
        const isNewTag = !allTags.some(tag => tag.toLowerCase() === value.toLowerCase());
        
        let html = '';
        if (isNewTag) {
            html += `
                <div class="north-shuoshuo-tag-picker-item north-shuoshuo-tag-picker-create" data-tag="${value}">
                    <span class="north-shuoshuo-tag-picker-create-hint">创建标签</span>
                    <span class="north-shuoshuo-tag-picker-item-name">#${value}</span>
                </div>
            `;
        }
        
        html += filtered.map(tag => `
            <div class="north-shuoshuo-tag-picker-item" data-tag="${tag}">
                <span class="north-shuoshuo-tag-picker-item-name">${tag}</span>
            </div>
        `).join('');
        
        if (!html) {
            html = '<div class="north-shuoshuo-tag-picker-empty">输入创建新标签</div>';
        }
        
        listEl.innerHTML = html;
    }

    // 插入标签到输入框
    insertTag(input, tag) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        
        // 检查光标前是否已经有 #
        const beforeCursor = text.substring(0, start);
        const afterCursor = text.substring(end);
        
        // 如果在行首或空格后，添加 #
        const needsHash = beforeCursor.length === 0 || beforeCursor.endsWith(' ') || beforeCursor.endsWith('\n');
        const tagText = needsHash ? `#${tag} ` : `${tag} `;
        
        input.value = beforeCursor + tagText + afterCursor;
        
        const newPos = start + tagText.length;
        input.setSelectionRange(newPos, newPos);
        input.focus();
        
        // 触发 input 事件更新发送按钮状态
        input.dispatchEvent(new Event('input'));
    }

    // 插入图片
    insertImage(input) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (!file) {
                document.body.removeChild(fileInput);
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showMessage("请选择图片文件");
                document.body.removeChild(fileInput);
                return;
            }
            
            try {
                showMessage("正在上传...");
                const formData = new FormData();
                formData.append('assetsDirPath', '/assets/');
                formData.append('file[]', file);
                
                const response = await fetch('/api/asset/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.code === 0) {
                    const succMap = result.data.succMap;
                    const originalName = file.name;
                    const newPath = succMap[originalName];
                    if (newPath) {
                        // 插入 Markdown 图片语法（去除开头的 /?
                        const imgPath = newPath.startsWith('/') ? newPath.substring(1) : newPath;
                        this.insertText(input, `![图片](${imgPath})`, '');
                        input.focus();
                        showMessage("图片插入成功");
                    }
                } else {
                    showMessage('上传失败：' + (result.msg || '未知错误'));
                }
            } catch (e) {
                console.error(e);
                showMessage('上传失败：' + e.message);
            } finally {
                if (fileInput.parentNode) {
                    document.body.removeChild(fileInput);
                }
            }
        };
        
        fileInput.click();
    }

    // 渲染标签列表（支持层级显示）
    renderTags() {
        // 获取所有标签及数量
        const tagCounts = {};
        this.shuoshuos.forEach(item => {
            const tags = item.tags || this.extractTags(item.content);
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // 构建标签?
        const tagTree = this.buildTagTree(tagCounts);
        
        // 更新侧边栏标签列?
        const tagsContainer = this.container?.querySelector('.north-shuoshuo-tags-list');
        if (tagsContainer) {
            if (Object.keys(tagCounts).length === 0) {
                tagsContainer.innerHTML = '<div class="north-shuoshuo-tag-empty">暂无标签</div>';
            } else {
                tagsContainer.innerHTML = this.renderTagTree(tagTree, 0);
            }
        }
        
        // 更新标签数量统计（只统计一级标签）
        const tagCountEl = this.container?.querySelector('#shuoshuo-tag-count');
        if (tagCountEl) {
            const rootTags = Object.keys(tagTree).length;
            tagCountEl.textContent = rootTags;
        }
    }

    // 构建标签?
    buildTagTree(tagCounts) {
        const tree = {};
        
        Object.entries(tagCounts).forEach(([tag, count]) => {
            const parts = tag.split('/');
            let current = tree;
            
            parts.forEach((part, index) => {
                if (!current[part]) {
                    current[part] = {
                        count: index === parts.length - 1 ? count : 0,
                        children: {},
                        fullPath: parts.slice(0, index + 1).join('/')
                    };
                }
                // 如果是中间节点，累加计数
                if (index < parts.length - 1) {
                    current[part].count += count;
                }
                current = current[part].children;
            });
        });
        
        return tree;
    }

    // 渲染标签树
    renderTagTree(tree, level, parentPath = '') {
        let entries = Object.entries(tree);
        if (entries.length === 0) return '';

        // 置顶标签排在前面
        entries.sort((a, b) => {
            const aPinned = this.pinnedTags.includes(a[1].fullPath);
            const bPinned = this.pinnedTags.includes(b[1].fullPath);
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return b[1].count - a[1].count;
        });
        
        return entries.map(([name, data]) => {
            const hasChildren = Object.keys(data.children).length > 0;
            const fullPath = data.fullPath;
            const isPinned = this.pinnedTags.includes(fullPath);
            // 获取标签图标配置
            const iconConfig = this.tagIcons[fullPath] || '';
            let iconHtml = '';
            
            if (iconConfig && iconConfig.startsWith('icon:')) {
                const parts = iconConfig.substring(5).split(':');
                const type = parts[0];
                
                if (type === 'dynamic') {
                    // 动态图标（日期相关）
                    const dynamicType = parts[1] || '1';
                    iconHtml = `<img class="north-shuoshuo-tag-dynamic-icon" src="/api/icon/getDynamicIcon?type=${dynamicType}&color=%232ecc71" alt="icon">`;
                } else if (type === 'customEmoji') {
                    // 自定义 emoji 图片
                    const emojiPath = decodeURIComponent(parts[1] || '');
                    iconHtml = `<img class="north-shuoshuo-tag-dynamic-icon" src="/emojis/${emojiPath}" alt="emoji">`;
                } else {
                    // Emoji 或文字图标
                    let content = decodeURIComponent(parts[0] || '');
                    const color = parts[1] || '#2ecc71';
                    
                    // 尝试转换十六进制代码为 emoji
                    content = this.convertHexToEmoji(content);
                    
                    // 检测是否是 emoji
                    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
                    if (isEmoji) {
                        iconHtml = `<span class="north-shuoshuo-tag-emoji">${content}</span>`;
                    } else {
                        iconHtml = `<img class="north-shuoshuo-tag-dynamic-icon" src="/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(color)}&content=${encodeURIComponent(content)}" alt="${content}">`;
                    }
                }
            } else {
                // 默认 # 号
                iconHtml = `<span class="north-shuoshuo-tag-icon-default">#</span>`;
            }
            
            const itemId = 'tag-' + Math.random().toString(36).substr(2, 9);
            
            // 构建左侧内容 - 使用占位符让所有标签左对齐
            const toggleBtn = hasChildren 
                ? `<span class="north-shuoshuo-tag-toggle" data-target="${itemId}">▸</span>`
                : `<span class="north-shuoshuo-tag-toggle-placeholder"></span>`;
            const leftContent = `${toggleBtn}<span class="north-shuoshuo-tag-icon-wrapper" data-tag="${fullPath}">${iconHtml}</span><span class="north-shuoshuo-tag-name">${name}</span>`;
            
            let html = `
                <div class="north-shuoshuo-tag-tree-item ${level > 0 ? 'child' : ''} ${isPinned ? 'pinned' : ''}" data-level="${level}" data-tag="${fullPath}">
                    <div class="north-shuoshuo-tag-item-content">
                        <div class="north-shuoshuo-tag-text-part">${leftContent}</div>
                        <div class="north-shuoshuo-tag-meta">
                            <span class="north-shuoshuo-tag-count">${data.count}</span>
                            <span class="north-shuoshuo-tag-menu-btn" data-tag="${fullPath}">•••</span>
                        </div>
                    </div>
                    ${hasChildren ? `
                        <div class="north-shuoshuo-tag-children" id="${itemId}" style="display: none;">
                            ${this.renderTagTree(data.children, level + 1, data.fullPath)}
                        </div>
                    ` : ''}
                </div>
            `;
            
            return html;
        }).join('');
    }

    async appendToDailyNote(content, timestamp) {
        if (!this.notebookId) return;

        try {
            const timeStr = this.formatTimeForDiary(timestamp);
            
            // 提取标签并重新组织格?
            const tags = this.extractTags(content);
            let diaryContent;
            
            if (tags.length > 0) {
                // 有标签时：时?标签：纯内容（去掉标签）
                let pureContent = content;
                tags.forEach(tag => {
                    pureContent = pureContent.replace(new RegExp(`#${tag}\\s*`, 'g'), '');
                });
                pureContent = pureContent.trim();
                
                const tagStr = tags.join(' ');
                diaryContent = `${timeStr} ${tagStr}：${pureContent}`;
            } else {
                // 无标签时：时间：内容
                diaryContent = `${timeStr}：${content}`;
            }

            // 清理可能的零宽字符和特殊空格
            diaryContent = diaryContent
                .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '') // 移除零宽字符
                .replace(/\s+/g, ' ') // 将多个空格合并为单个
                .trim();
            
            // 末尾加空格，帮助其他插件识别
            diaryContent = diaryContent + ' ';

            const response = await fetch('/api/block/appendDailyNoteBlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notebook: this.notebookId,
                    dataType: 'markdown',
                    data: `${diaryContent}`
                })
            });

            const result = await response.json();
            if (result.code !== 0) {
                console.log("插入日记失败:", result.msg);
            }
        } catch (e) {
            console.error("插入日记失败", e);
        }
    }

    formatTimeForDiary(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // 渲染笔记内容（支持九宫格图片布局?
    renderNoteContent(content) {
        const { text, images } = this.extractContentAndImages(content);
        
        let html = '<div class="north-shuoshuo-note-content">';
        
        // 渲染文字内容
        if (text.trim()) {
            html += this.formatContent(text);
        }
        
        html += '</div>';
        
        // 渲染图片九宫?
        if (images.length > 0) {
            html += this.renderImageGrid(images);
        }
        
        return html;
    }

    // 提取内容和图?
    extractContentAndImages(content) {
        const images = [];
        let text = content;
        
        // 提取 Markdown 图片
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            images.push({ alt, url });
            return '';
        });
        
        // 清理多余的空?
        text = text.replace(/\n{3,}/g, '\n\n').trim();
        
        return { text, images };
    }

    // 渲染九宫格图?
    renderImageGrid(images) {
        const count = images.length;
        if (count === 0) return '';
        
        // 单张图片：保持原样大显示
        if (count === 1) {
            return `
                <div class="north-shuoshuo-image-grid single">
                    <img src="${images[0].url}" alt="${this.escapeHtml(images[0].alt)}" class="north-shuoshuo-grid-img" loading="lazy">
                </div>
            `;
        }
        
        // 多张图片：九宫格布局
        let gridClass = 'multi';
        if (count === 2) gridClass += ' grid-2';
        else if (count === 4) gridClass += ' grid-4';
        
        let html = `<div class="north-shuoshuo-image-grid ${gridClass}">`;
        
        images.slice(0, 9).forEach((img, index) => {
            html += `
                <div class="north-shuoshuo-image-item">
                    <img src="${img.url}" alt="${this.escapeHtml(img.alt)}" loading="lazy">
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    formatContent(content) {
        // 先处?Markdown 图片（在转义 HTML 之前，因?URL 可能包含特殊字符?
        let html = content;
        
        // 提取并临时替换图片标?
        const images = [];
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
            images.push({ alt, url });
            return `{{IMAGE${images.length - 1}}}`;
        });
        
        // 转义 HTML
        html = this.escapeHtml(html);
        
        // 处理其他 Markdown 语法
        html = this.renderMarkdown(html);
        
        // 处理换行
        html = html.replace(/\n/g, '<br>');
        
        // ?#标签?转换为标签样?
        // ?#标签?转换为标签样式（支持多级标签 #??孙）
        html = html.replace(/#([^\s\d][^\s]*(?:\/[^\s]+)*)/g, '<span class="north-shuoshuo-tag">#$1</span>');
        
        // 移除批注的"关联自"头部，不在正文显示
        html = html.replace(/^关联自：\[MEMO:[^\]]+\](?:<br>)+/, '');
        
        // 移除正文中的 lumina MEMO 链接，统一在底部显示
        html = html.replace(/lumina:\/\/memo\/[a-zA-Z0-9]+/g, '');
        
        // 移除正文中的 MEMO 引用，统一在底部显示
        html = html.replace(/\[MEMO:[^\]]+\]/g, '');
        
        // 清理可能因移除引用产生的多余空行
        html = html.replace(/(<br>){3,}/g, '<br><br>');
        
        // 还原图片标签（这里保留单张图片的处理，用于兼容纯图片内容?
        images.forEach((img, index) => {
            html = html.replace(
                `{{IMAGE${index}}}`,
                `<img src="${img.url}" alt="${this.escapeHtml(img.alt)}" class="north-shuoshuo-markdown-img" loading="lazy">`
            );
        });
        
        return html;
    }

    // 渲染 Markdown
    renderMarkdown(text) {
        // 代码?```code```
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 行内代码 `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 粗体 **text** ?__text__
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        
        // 斜体 *text* ?_text_
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // 删除?~~text~~
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
        
        // 链接 [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 图片 ![alt](url)
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="north-shuoshuo-markdown-img">');
        
        // 标题 ### text
        text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // 处理列表（在 split('\n') 之前处理?
        // 无序列表
        text = text.replace(/^[-*•] (.+)$/gim, '• $1');
        // 有序列表保持原样，由 HTML 渲染
        
        // 引用 > text
        text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // 分割?--- ?*** ?___
        text = text.replace(/^(---|\*\*\*|___)\s*$/gim, '<hr>');
        
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示笔记菜单
    showNoteMenu(id, triggerEl) {
        // 移除已存在的菜单
        const existingMenu = document.querySelector('.north-shuoshuo-note-menu-dropdown');
        if (existingMenu) {
            existingMenu.remove();
        }

        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        const menu = document.createElement('div');
        menu.className = 'north-shuoshuo-note-menu-dropdown';
        menu.innerHTML = `
            <div class="north-shuoshuo-menu-item" data-action="pin">
                <span class="north-shuoshuo-menu-icon">${item.pinned ? ICONS.star : ICONS.starOutline}</span>
                <span class="north-shuoshuo-menu-text">${item.pinned ? '取消置顶' : '置顶'}</span>
            </div>
            <div class="north-shuoshuo-menu-item" data-action="edit">
                <span class="north-shuoshuo-menu-icon">${ICONS.edit}</span>
                <span class="north-shuoshuo-menu-text">编辑</span>
            </div>
            <div class="north-shuoshuo-menu-divider"></div>
            <div class="north-shuoshuo-menu-item" data-action="comment">
                <span class="north-shuoshuo-menu-icon">${ICONS.comment}</span>
                <span class="north-shuoshuo-menu-text">批注</span>
            </div>
            <div class="north-shuoshuo-menu-item" data-action="sync">
                <span class="north-shuoshuo-menu-icon">${ICONS.sync}</span>
                <span class="north-shuoshuo-menu-text">插入今日日记</span>
            </div>
            <div class="north-shuoshuo-menu-divider"></div>
            <div class="north-shuoshuo-menu-item danger" data-action="delete">
                <span class="north-shuoshuo-menu-icon">${ICONS.delete}</span>
                <span class="north-shuoshuo-menu-text">删除</span>
            </div>
        `;

        document.body.appendChild(menu);

        // 定位菜单
        const rect = triggerEl.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${rect.left - 120}px`;
        menu.style.zIndex = '99999';

        // 绑定事件
        menu.addEventListener('click', async (e) => {
            const menuItem = e.target.closest('.north-shuoshuo-menu-item');
            if (!menuItem) return;

            const action = menuItem.dataset.action;
            menu.remove();

            switch (action) {
                case 'pin':
                    await this.togglePin(id);
                    break;
                case 'edit':
                    this.editNote(id);
                    break;
                case 'comment':
                    this.commentOnNote(id);
                    break;
                case 'sync':
                    await this.syncToDailyNote(id);
                    break;
                case 'delete':
                    this.deleteShuoshuo(id);
                    break;
            }
        });

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    // 置顶/取消置顶
    async togglePin(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (item) {
            item.pinned = !item.pinned;
            await this.saveShuoshuos();
            this.renderNotes();
            showMessage(item.pinned ? "已置顶" : "已取消置顶");
        }
    }

    // 编辑笔记（内联编辑）
    editNote(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        const card = this.container.querySelector(`.north-shuoshuo-note-card[data-id="${id}"]`);
        const reviewCard = !card ? this.container.querySelector('.north-shuoshuo-review-card') : null;
        const targetCard = card || reviewCard;

        if (!targetCard) {
            this.editNoteModal(id);
            return;
        }

        const contentEl = card
            ? targetCard.querySelector('.north-shuoshuo-note-content')
            : targetCard.querySelector('.north-shuoshuo-review-card-content');
        const relationsEl = card ? targetCard.querySelector('.north-shuoshuo-memo-relations') : null;

        if (!contentEl || targetCard.querySelector('.north-shuoshuo-inline-edit')) return;

        const editBox = document.createElement('div');
        editBox.className = 'north-shuoshuo-input-box north-shuoshuo-inline-edit';
        editBox.innerHTML = `
            <div class="north-shuoshuo-input-wrapper">
                <textarea class="north-shuoshuo-input-field north-shuoshuo-inline-edit-field" rows="3">${this.escapeHtml(item.content)}</textarea>
            </div>
            <div class="north-shuoshuo-input-toolbar">
                <div class="north-shuoshuo-toolbar-left">
                    <span class="north-shuoshuo-toolbar-icon" data-action="tag" title="标签">#</span>
                    <span class="north-shuoshuo-toolbar-icon" data-action="image" title="图片">${ICONS.image}</span>
                    <span class="north-shuoshuo-toolbar-divider"></span>
                    <span class="north-shuoshuo-toolbar-icon" data-action="ul" title="无序列表">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                    </span>
                    <span class="north-shuoshuo-toolbar-icon" data-action="ol" title="有序列表">
                        <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M2 6h2v2H2V6zm4 0h14v2H6V6zM2 11h2v2H2v-2zm4 0h14v2H6v-2zM2 16h2v2H2v-2zm4 0h14v2H6v-2z"/></svg>
                    </span>
                    <span class="north-shuoshuo-toolbar-icon" data-action="at" title="快速引用">${ICONS.at}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <button class="north-shuoshuo-inline-edit-cancel">取消</button>
                    <button class="north-shuoshuo-send-btn north-shuoshuo-inline-save active">${ICONS.send}</button>
                </div>
            </div>
        `;

        contentEl.style.display = 'none';
        if (relationsEl) relationsEl.style.display = 'none';

        if (relationsEl) {
            targetCard.insertBefore(editBox, relationsEl);
        } else if (contentEl.nextSibling) {
            targetCard.insertBefore(editBox, contentEl.nextSibling);
        } else {
            targetCard.appendChild(editBox);
        }

        const textarea = editBox.querySelector('.north-shuoshuo-inline-edit-field');
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
        };

        // 输入监听（列表自动转换、@ mention）
        textarea.addEventListener('input', () => {
            const cursorPos = textarea.selectionStart;
            const value = textarea.value;
            const beforeCursor = value.substring(0, cursorPos);
            const lines = beforeCursor.split('\n');
            const currentLine = lines[lines.length - 1];
            if (currentLine === '- ' || currentLine === '* ') {
                lines[lines.length - 1] = '• ';
                const afterCursor = value.substring(cursorPos);
                textarea.value = lines.join('\n') + afterCursor;
                textarea.setSelectionRange(cursorPos, cursorPos);
            }
            requestAnimationFrame(autoResize);
            this.handleMentionInput(textarea);
        });

        // Enter / Ctrl+Enter
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                const cursorPos = textarea.selectionStart;
                const value = textarea.value;
                const beforeCursor = value.substring(0, cursorPos);
                const afterCursor = value.substring(cursorPos);
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];
                const unorderedMatch = currentLine.match(/^(•\s|-\s|\*\s)(.*)$/);
                const orderedMatch = currentLine.match(/^(\d+)\.\s(.*)$/);
                if (unorderedMatch) {
                    if (!unorderedMatch[2].trim()) {
                        e.preventDefault();
                        lines.pop();
                        textarea.value = lines.join('\n') + '\n' + afterCursor;
                        textarea.setSelectionRange(lines.join('\n').length + 1, lines.join('\n').length + 1);
                        requestAnimationFrame(autoResize);
                        return;
                    }
                    e.preventDefault();
                    const newLine = '\n• ';
                    textarea.value = beforeCursor + newLine + afterCursor;
                    textarea.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                    requestAnimationFrame(autoResize);
                    return;
                }
                if (orderedMatch) {
                    if (!orderedMatch[2].trim()) {
                        e.preventDefault();
                        lines.pop();
                        textarea.value = lines.join('\n') + '\n' + afterCursor;
                        textarea.setSelectionRange(lines.join('\n').length + 1, lines.join('\n').length + 1);
                        requestAnimationFrame(autoResize);
                        return;
                    }
                    e.preventDefault();
                    const nextNum = parseInt(orderedMatch[1]) + 1;
                    const newLine = '\n' + nextNum + '. ';
                    textarea.value = beforeCursor + newLine + afterCursor;
                    textarea.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                    requestAnimationFrame(autoResize);
                    return;
                }
            }
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                saveBtn.click();
            }
        });

        requestAnimationFrame(() => {
            autoResize();
            textarea.focus();
        });

        const restore = () => {
            editBox.remove();
            contentEl.style.display = '';
            if (relationsEl) relationsEl.style.display = '';
        };

        // 取消
        editBox.querySelector('.north-shuoshuo-inline-edit-cancel').addEventListener('click', restore);

        // 工具栏
        editBox.querySelector('[data-action="tag"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTagPicker(textarea);
        });
        editBox.querySelector('[data-action="image"]').addEventListener('click', () => {
            this.insertImage(textarea);
        });
        editBox.querySelector('[data-action="ul"]').addEventListener('click', () => {
            this.insertText(textarea, '• ', '');
            textarea.focus();
        });
        editBox.querySelector('[data-action="ol"]').addEventListener('click', () => {
            const lines = textarea.value.substring(0, textarea.selectionStart).split('\n');
            const currentLine = lines[lines.length - 1];
            const match = currentLine.match(/^(\d+)\.\s/);
            const num = match ? parseInt(match[1]) + 1 : 1;
            this.insertText(textarea, `${num}. `, '');
            textarea.focus();
        });
        editBox.querySelector('[data-action="at"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMentionPicker(textarea);
        });

        // 保存
        const saveBtn = editBox.querySelector('.north-shuoshuo-inline-save');
        saveBtn.addEventListener('click', async () => {
            const newContent = textarea.value.trim();
            if (!newContent) {
                showMessage("内容不能为空");
                return;
            }
            if (newContent === item.content) {
                restore();
                return;
            }

            item.content = newContent;
            item.tags = this.extractTags(newContent);
            item.updated = Date.now();
            await this.saveShuoshuos();
            this.renderNotes();
            this.renderTags();
            if (reviewCard) {
                this.renderReview();
            }
            showMessage("已保存");
        });
    }

    // 编辑笔记兜底弹窗
    editNoteModal(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #fff;
            padding: 24px;
            border-radius: 12px;
            width: 500px;
            max-width: 90%;
            max-height: 80vh;
            overflow: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;

        dialog.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #333;">编辑笔记</div>
            <textarea id="edit-content" style="
                width: 100%;
                min-height: 120px;
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                resize: vertical;
                outline: none;
                box-sizing: border-box;
                margin-bottom: 16px;
            ">${this.escapeHtml(item.content)}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="edit-cancel" style="
                    padding: 8px 16px;
                    border: 1px solid #e0e0e0;
                    background: #fff;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</button>
                <button id="edit-save" style="
                    padding: 8px 16px;
                    border: none;
                    background: #2ecc71;
                    color: #fff;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                ">保存</button>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const textarea = dialog.querySelector('#edit-content');
        textarea.focus();

        dialog.querySelector('#edit-cancel').addEventListener('click', () => {
            overlay.remove();
        });

        dialog.querySelector('#edit-save').addEventListener('click', async () => {
            const newContent = textarea.value.trim();
            if (!newContent) {
                showMessage("内容不能为空");
                return;
            }

            item.content = newContent;
            item.tags = this.extractTags(newContent);
            item.updated = Date.now();
            await this.saveShuoshuos();
            this.renderNotes();
            this.renderTags();
            overlay.remove();
            showMessage("已保存");
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    // 批注 MEMO
    commentOnNote(id) {
        const input = this.container.querySelector('#shuoshuo-input');
        if (!input) return;
        
        const note = this.shuoshuos.find(s => s.id === id);
        if (!note) return;
        
        // 提取被引用笔记的内容预览（第一行，去除引用标记）
        let preview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
        preview = preview.split('\n')[0];
        preview = preview.substring(0, 60) + (preview.length > 60 ? '...' : '');
        
        // 滚动到输入区域
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 插入 MEMO 引用到输入框顶部，格式为：关联自：内容预览
        const currentValue = input.value.trim();
        const insertText = `关联自：${preview}`;
        if (currentValue) {
            input.value = insertText + '\n' + currentValue;
            input.setSelectionRange(insertText.length + 1, insertText.length + 1);
        } else {
            input.value = insertText + '\n';
            input.setSelectionRange(insertText.length + 1, insertText.length + 1);
        }
        
        input.focus();
        
        // 高亮输入框
        const inputBox = this.container.querySelector('#shuoshuo-input-box');
        if (inputBox) {
            inputBox.classList.add('focused');
        }
        
        // 触发 input 事件更新发送按钮状态
        input.dispatchEvent(new Event('input'));
    }

    // 复制 MEMO 链接
    copyMemoLink(id) {
        const url = `lumina://memo/${id}`;
        
        // 复制到剪贴板
        const doCopy = () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    showMessage("链接已复制");
                }).catch(() => {
                    this.fallbackCopyText(url);
                });
            } else {
                this.fallbackCopyText(url);
            }
        };
        
        // 自动插入到输入框
        const input = this.container.querySelector('#shuoshuo-input');
        if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const currentValue = input.value.trim();
            if (currentValue) {
                const lines = currentValue.split('\n');
                const firstLine = lines[0];
                // 如果第一行已经是 lumina 链接或关联自开头，直接替换第一行
                if (firstLine.startsWith('lumina://') || firstLine.startsWith('关联自：')) {
                    lines[0] = url;
                    input.value = lines.join('\n');
                } else {
                    input.value = url + '\n' + currentValue;
                }
            } else {
                input.value = url;
            }
            input.setSelectionRange(url.length, url.length);
            input.focus();
            
            const inputBox = this.container.querySelector('#shuoshuo-input-box');
            if (inputBox) {
                inputBox.classList.add('focused');
            }
            input.dispatchEvent(new Event('input'));
        }
        
        doCopy();
    }

    fallbackCopyText(text) {
        const input = document.createElement('input');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try {
            document.execCommand('copy');
            showMessage("链接已复制");
        } catch (e) {
            showMessage("复制失败");
        }
        document.body.removeChild(input);
    }

    // 同步到今日日?
    async syncToDailyNote(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        if (!this.notebookId) {
            showMessage("请先设置日记笔记本ID");
            return;
        }

        await this.appendToDailyNote(item.content, item.created);
        showMessage("已插入今日日记");
    }

    deleteShuoshuo(id) {
        confirm("⚠️ 确认删除", "确定要删除这条笔记吗？", async () => {
            this.shuoshuos = this.shuoshuos.filter(s => s.id !== id);
            await this.saveShuoshuos();
            this.renderNotes();
            this.renderTags(); // 更新标签列表
            showMessage("笔记已删除");
        });
    }

    uploadAvatar(role) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';

        fileInput.onchange = async () => {
            const file = fileInput.files[0];
            if (!file) {
                if (fileInput.parentNode) document.body.removeChild(fileInput);
                return;
            }

            if (!file.type.startsWith('image/')) {
                showMessage("请选择图片文件");
                if (fileInput.parentNode) document.body.removeChild(fileInput);
                return;
            }

            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);

            try {
                showMessage("正在上传...");
                const response = await fetch('/api/asset/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.code === 0) {
                    const succMap = result.data.succMap;
                    const originalName = file.name;
                    const newPath = succMap[originalName];
                    if (newPath) {
                        const fullPath = '/' + newPath;
                        if (role === 'assistant') {
                            this.assistantAvatarUrl = fullPath;
                            await this.saveData(AVATAR_ASSISTANT_STORAGE_NAME, this.assistantAvatarUrl);
                        } else {
                            this.userAvatarUrl = fullPath;
                            await this.saveData(AVATAR_USER_STORAGE_NAME, this.userAvatarUrl);
                        }
                        this.render(this.container);
                        showMessage('头像上传成功');
                    }
                } else {
                    showMessage('上传失败：' + (result.msg || '未知错误'));
                }
            } catch (e) {
                console.error(e);
                showMessage('上传失败：' + e.message);
            } finally {
                if (fileInput.parentNode) {
                    document.body.removeChild(fileInput);
                }
            }
        };

        document.body.appendChild(fileInput);
        fileInput.click();
    }

    // 切换主视图（说说视图 vs 设置视图）
    switchMainView(view, navItem) {
        const flomoArea = this.container.querySelector('.north-shuoshuo-flomo-area');
        const settingsArea = this.container.querySelector('#shuoshuo-settings-area');

        // 更新左侧边栏选中状?
        this.container.querySelectorAll('.north-shuoshuo-sidebar .north-shuoshuo-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        if (navItem) {
            navItem.classList.add('active');
        }

        this.currentMainView = view;

        switch (view) {
            case 'notes':
                // 显示说说视图
                if (flomoArea) flomoArea.style.display = 'flex';
                if (settingsArea) settingsArea.style.display = 'none';
                this.renderNotes();
                break;
            case 'review':
                // 显示每日回顾视图
                if (flomoArea) flomoArea.style.display = 'flex';
                if (settingsArea) settingsArea.style.display = 'none';
                this.renderReview();
                break;
            case 'random':
                // 显示随机漫步视图
                if (flomoArea) flomoArea.style.display = 'flex';
                if (settingsArea) settingsArea.style.display = 'none';
                this.renderRandom();
                break;
            case 'stats':
                // 显示统计视图
                if (flomoArea) flomoArea.style.display = 'flex';
                if (settingsArea) settingsArea.style.display = 'none';
                this.renderStats();
                break;
            case 'settings':
                // 显示设置视图
                if (flomoArea) flomoArea.style.display = 'none';
                if (settingsArea) settingsArea.style.display = 'flex';
                this.bindSettingsEvents();
                break;
        }
    }

    // 加载笔记本列?
    async loadNotebooks() {
        const select = this.container?.querySelector('#settings-notebook-select');
        if (!select) return;

        try {
            const response = await fetch('/api/notebook/lsNotebooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const result = await response.json();
            
            if (result.code === 0 && result.data?.notebooks) {
                const notebooks = result.data.notebooks.filter(nb => !nb.closed);
                
                // 保存笔记本信息用于显?
                this.notebooksList = notebooks;
                
                // 重建选项
                let html = '<option value="">请选择笔记?..</option>';
                notebooks.forEach(nb => {
                    const icon = nb.icon ? String.fromCodePoint(parseInt(nb.icon, 16)) : '📒';
                    const selected = nb.id === this.notebookId ? 'selected' : '';
                    html += `<option value="${nb.id}" ${selected}>${icon} ${nb.name}</option>`;
                });
                select.innerHTML = html;
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
            showMessage('加载笔记本列表失败');
        }
    }

    // 绑定设置页面事件
    bindSettingsEvents() {
        // 加载笔记本列表
        this.loadNotebooks();

        // 初始化开关状态 - 关键：根据当前 autoSync 值设置 UI
        const autoSyncSwitch = this.container.querySelector('#settings-auto-sync-switch');
        if (autoSyncSwitch) {
            // 先移除可能存在的 on 类，然后根据状态添加
            autoSyncSwitch.classList.remove('on');
            // 使用严格布尔值判断
            if (this.autoSync === true) {
                autoSyncSwitch.classList.add('on');
            }
            
            // 绑定点击事件（使用 once 选项防止重复绑定）
            autoSyncSwitch.replaceWith(autoSyncSwitch.cloneNode(true));
            const newAutoSyncSwitch = this.container.querySelector('#settings-auto-sync-switch');
            newAutoSyncSwitch.addEventListener('click', () => {
                newAutoSyncSwitch.classList.toggle('on');
            });
        }

        // 设置分类切换
        const categoryItems = this.container.querySelectorAll('.north-shuoshuo-settings-nav-item');
        
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                const setting = item.dataset.setting;
                
                // 更新导航选中状态
                categoryItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // 显示对应设置组
                this.container.querySelectorAll('.north-shuoshuo-settings-section').forEach(group => {
                    group.style.display = 'none';
                });
                
                const targetGroup = this.container.querySelector(`#setting-group-${setting}`);
                if (targetGroup) targetGroup.style.display = 'block';
            });
        });

        // 更新连接状态显示
        const statusBadge = this.container.querySelector('#settings-connection-status');
        if (statusBadge) {
            if (this.notebookId) {
                statusBadge.textContent = '已配置';
                statusBadge.className = 'north-shuoshuo-badge north-shuoshuo-badge-success';
            } else {
                statusBadge.textContent = '未配置';
                statusBadge.className = 'north-shuoshuo-badge';
                statusBadge.style.background = '#f5f5f5';
                statusBadge.style.color = '#888';
            }
        }

        // 刷新笔记本列表
        const refreshBtn = this.container.querySelector('#settings-refresh-notebooks');
        if (refreshBtn) {
            refreshBtn.onclick = () => {
                showMessage('正在加载笔记本列表...');
                this.loadNotebooks();
            };
        }

        // 视图样式单选框
        const radioItems = this.container.querySelectorAll('#setting-group-view .north-shuoshuo-radio-item');
        radioItems.forEach(item => {
            item.addEventListener('click', async () => {
                const value = item.dataset.value;
                // 更新选中状态
                radioItems.forEach(r => r.classList.remove('selected'));
                item.classList.add('selected');
                // 更新 radio 输入
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                // 实时更新视图样式
                this.viewStyle = value;
                await this.saveData(VIEW_STYLE_STORAGE_NAME, this.viewStyle);
                this.applyViewStyle();
            });
        });

        // 初始化选中状态
        const currentStyle = this.viewStyle || 'list';
        radioItems.forEach(item => {
            if (item.dataset.value === currentStyle) {
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            } else {
                item.classList.remove('selected');
            }
        });

        // 绑定主题模式选择事件
        const themeModeItems = this.container.querySelectorAll('#theme-mode-grid .north-shuoshuo-radio-item');
        const morandiColorRow = this.container.querySelector('#morandi-color-row');
        
        themeModeItems.forEach(item => {
            item.addEventListener('click', async () => {
                const mode = item.dataset.mode;
                this.themeMode = mode;
                
                // 更新选中状态
                themeModeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // 更新 radio 输入
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 显示/隐藏提示和莫兰迪配色选择
                this.container.querySelectorAll('[id^="theme-mode-hint-"]').forEach(hint => {
                    hint.style.display = 'none';
                });
                const activeHint = this.container.querySelector(`#theme-mode-hint-${mode}`);
                if (activeHint) activeHint.style.display = 'flex';
                
                if (morandiColorRow) {
                    morandiColorRow.style.display = mode === 'morandi' ? 'block' : 'none';
                }
                
                // 应用主题模式
                this.applyThemeMode();
                
                // 保存设置
                await this.saveThemeMode();
            });
        });
        
        // 绑定莫兰迪配色选择
        const morandiOptions = this.container.querySelectorAll('.north-shuoshuo-morandi-option');
        morandiOptions.forEach(option => {
            option.addEventListener('click', async () => {
                const colorKey = option.dataset.color;
                this.morandiColor = colorKey;
                
                morandiOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                this.applyThemeMode();
                await this.saveMorandiColor();
            });
        });

        const saveBtn = this.container.querySelector('#settings-save');
        const cancelBtn = this.container.querySelector('#settings-cancel');
        const exportBtn = this.container.querySelector('#settings-export');
        const clearBtn = this.container.querySelector('#settings-clear');

        if (saveBtn) {
            saveBtn.onclick = async () => {
                const notebookId = this.container.querySelector('#settings-notebook-select')?.value || '';
                const autoSyncSwitchEl = this.container.querySelector('#settings-auto-sync-switch');
                // 明确转换为布尔值
                const autoSync = autoSyncSwitchEl?.classList.contains('on') ? true : false;
                // 获取选中的视图样式
                const selectedRadio = this.container.querySelector('input[name="view-style"]:checked');
                this.viewStyle = selectedRadio?.value || 'list';

                this.notebookId = notebookId;
                this.autoSync = autoSync;

                await this.saveData(NOTEBOOK_ID_STORAGE_NAME, this.notebookId);
                await this.saveData(AUTO_SYNC_STORAGE_NAME, this.autoSync);
                await this.saveData(VIEW_STYLE_STORAGE_NAME, this.viewStyle);

                // 保存回顾设置
                const reviewScope = this.container.querySelector('input[name="review-content-scope"]:checked')?.value || 'all';
                const reviewTags = Array.from(this.container.querySelectorAll('#review-tags-select input:checked')).map(cb => cb.value);
                const reviewTimeRange = this.container.querySelector('#review-time-range')?.value || '6_months';
                const reviewDailyCount = parseInt(this.container.querySelector('#review-daily-count')?.value || '8');

                this.reviewConfig = {
                    contentScope: reviewScope,
                    contentScopeTags: reviewTags,
                    timeRange: reviewTimeRange,
                    dailyCount: reviewDailyCount
                };
                await this.saveReviewConfig();

                // 保存主题模式
                await this.saveThemeMode();
                await this.saveMorandiColor();

                showMessage('设置已保存');
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => {
                // 返回说说视图
                this.switchMainView('notes', this.container.querySelector('.north-shuoshuo-sidebar .north-shuoshuo-nav-item[data-view="notes"]'));
            };
        }

        if (exportBtn) {
            exportBtn.onclick = () => {
                const data = JSON.stringify(this.shuoshuos, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `shuoshuo-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showMessage('数据已导出');
            };
        }

        if (clearBtn) {
            clearBtn.onclick = async () => {
                confirm('⚠️ 确认删除', '确定要清空所有数据吗？此操作不可恢复！', async () => {
                    this.shuoshuos = [];
                    await this.saveData(STORAGE_NAME, this.shuoshuos);
                    this.renderNotes();
                    showMessage('数据已清空');
                });
            };
        }

        // ==================== 回顾设置事件绑定 ====================
        this.bindReviewSettingsEvents();

        // ==================== Flomo 同步事件绑定 ====================
        this.bindFlomoEvents();
    }

    // 绑定回顾设置事件
    bindReviewSettingsEvents() {
        // 内容范围单选
        const scopeItems = this.container.querySelectorAll('#review-content-scope-group .north-shuoshuo-radio-item');
        
        scopeItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 更新选中样式
                scopeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // 显示/隐藏标签选择
                const tagsRow = this.container.querySelector('#review-tags-row');
                if (tagsRow) {
                    tagsRow.style.display = (value === 'include_tags' || value === 'exclude_tags') ? 'block' : 'none';
                }
            });
        });

        // 标签复选框
        const tagCheckboxes = this.container.querySelectorAll('#review-tags-select input[type="checkbox"]');
        tagCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                checkbox.closest('.north-shuoshuo-review-tag-checkbox').classList.toggle('selected', checkbox.checked);
            });
        });
    }

    // 绑定 Flomo 相关事件
    bindFlomoEvents() {
        // 初始化 Flomo 登录状态
        this.updateFlomoUI();

        // 加载笔记本列表到 flomo 选择器
        this.loadFlomoNotebooks();

        // Flomo 登录按钮
        const flomoLoginBtn = this.container.querySelector('#flomo-login-btn');
        const flomoLogoutBtn = this.container.querySelector('#flomo-logout-btn');
        const flomoUsername = this.container.querySelector('#flomo-username');
        const flomoPassword = this.container.querySelector('#flomo-password');

        if (flomoLoginBtn) {
            flomoLoginBtn.onclick = async () => {
                const username = flomoUsername?.value?.trim();
                const password = flomoPassword?.value?.trim();
                
                if (!username || !password) {
                    showMessage('请输入邮箱/手机号和密码');
                    return;
                }
                
                flomoLoginBtn.textContent = '登录中...';
                flomoLoginBtn.disabled = true;
                
                const result = await this.flomoLogin(username, password);
                
                flomoLoginBtn.textContent = '登录';
                flomoLoginBtn.disabled = false;
                
                if (result.success) {
                    showMessage('登录成功');
                    this.updateFlomoUI();
                } else {
                    showMessage(result.message);
                }
            };
        }

        if (flomoLogoutBtn) {
            flomoLogoutBtn.onclick = async () => {
                this.flomoConfig = { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '' };
                await this.saveFlomoConfig();
                if (flomoUsername) flomoUsername.value = '';
                if (flomoPassword) flomoPassword.value = '';
                this.updateFlomoUI();
                showMessage('已退出登录');
            };
        }

        // Flomo 同步按钮
        const flomoSyncBtn = this.container.querySelector('#flomo-sync-btn');
        if (flomoSyncBtn) {
            flomoSyncBtn.onclick = async () => {
                // 保存当前选择的同步目标
                const targetRadio = this.container.querySelector('input[name="flomo-target"]:checked');
                this.flomoConfig.syncTarget = targetRadio?.value || 'dailynote';
                
                // 保存输入的目标文档 ID
                const targetDocIdInput = this.container.querySelector('#flomo-target-doc-id');
                if (targetDocIdInput) {
                    this.flomoConfig.syncDocId = targetDocIdInput.value.trim();
                }
                
                await this.saveFlomoConfig();
                
                // 检查是否选择了全量同步
                const fullSyncCheckbox = this.container.querySelector('#flomo-full-sync');
                const isFullSync = fullSyncCheckbox?.checked || false;
                
                await this.flomoSync(isFullSync);
                
                // 取消勾选全量同步
                if (fullSyncCheckbox) fullSyncCheckbox.checked = false;
                
                this.updateFlomoUI();
            };
        }

        // Flomo 目标选择
        const flomoTargetItems = this.container.querySelectorAll('.flomo-target');
        const flomoNotebookRow = this.container.querySelector('#flomo-notebook-row');
        const flomoDocRow = this.container.querySelector('#flomo-doc-row');
        
        flomoTargetItems.forEach(item => {
            item.addEventListener('click', () => {
                flomoTargetItems.forEach(r => r.classList.remove('selected'));
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 根据选择显示/隐藏选择器
                const value = item.dataset.value;
                if (flomoNotebookRow) {
                    flomoNotebookRow.style.display = value === 'shuoshuo' ? 'none' : 'block';
                }
                if (flomoDocRow) {
                    flomoDocRow.style.display = value === 'singledoc' ? 'block' : 'none';
                }
            });
        });
        
        // 初始化选择器显示状态
        const initialTarget = this.container.querySelector('input[name="flomo-target"]:checked');
        if (initialTarget) {
            const initialValue = initialTarget.value;
            if (flomoNotebookRow) {
                flomoNotebookRow.style.display = initialValue === 'shuoshuo' ? 'none' : 'block';
            }
            if (flomoDocRow) {
                flomoDocRow.style.display = initialValue === 'singledoc' ? 'block' : 'none';
            }
        }
        
        // 加载保存的目标文档 ID
        const targetDocIdInput = this.container.querySelector('#flomo-target-doc-id');
        if (targetDocIdInput && this.flomoConfig.syncDocId) {
            targetDocIdInput.value = this.flomoConfig.syncDocId;
        }
        
        // 初始化设置导航选中状态
        const currentSetting = 'view'; // 默认选中说说视图
        const navItems = this.container.querySelectorAll('.north-shuoshuo-settings-nav-item');
        navItems.forEach(item => {
            if (item.dataset.setting === currentSetting) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // 更新 Flomo UI 状态
    updateFlomoUI() {
        const statusBadge = this.container.querySelector('#flomo-connection-status');
        const usernameInput = this.container.querySelector('#flomo-username');
        const passwordInput = this.container.querySelector('#flomo-password');
        const loginBtn = this.container.querySelector('#flomo-login-btn');
        const logoutBtn = this.container.querySelector('#flomo-logout-btn');
        const syncCard = this.container.querySelector('#flomo-sync-card');
        const lastSyncEl = this.container.querySelector('#flomo-last-sync');
        const flomoNotebookRow = this.container.querySelector('#flomo-notebook-row');
        const flomoDocRow = this.container.querySelector('#flomo-doc-row');

        const isLoggedIn = !!this.flomoConfig.accessToken;
        
        // 更新选择器显示状态
        const targetRadio = this.container?.querySelector('input[name="flomo-target"]:checked');
        const syncTarget = targetRadio?.value || this.flomoConfig.syncTarget || 'dailynote';
        
        if (flomoNotebookRow) {
            flomoNotebookRow.style.display = syncTarget === 'shuoshuo' ? 'none' : 'block';
        }
        if (flomoDocRow) {
            flomoDocRow.style.display = syncTarget === 'singledoc' ? 'block' : 'none';
        }
        
        // 恢复保存的目标文档 ID
        const targetDocIdInput = this.container.querySelector('#flomo-target-doc-id');
        if (targetDocIdInput && this.flomoConfig.syncDocId) {
            targetDocIdInput.value = this.flomoConfig.syncDocId;
        }

        if (statusBadge) {
            if (isLoggedIn) {
                statusBadge.textContent = '已登录';
                statusBadge.className = 'north-shuoshuo-badge north-shuoshuo-badge-success';
            } else {
                statusBadge.textContent = '未登录';
                statusBadge.className = 'north-shuoshuo-badge';
                statusBadge.style.background = '#f5f5f5';
                statusBadge.style.color = '#888';
            }
        }

        if (isLoggedIn) {
            if (usernameInput) {
                usernameInput.value = this.flomoConfig.username;
                usernameInput.disabled = true;
                usernameInput.classList.add('readonly-field');
            }
            if (passwordInput) {
                passwordInput.value = '********';
                passwordInput.disabled = true;
                passwordInput.classList.add('readonly-field');
            }
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (syncCard) {
                syncCard.style.opacity = '1';
                syncCard.style.pointerEvents = 'auto';
            }
        } else {
            if (usernameInput) usernameInput.disabled = false;
            if (passwordInput) passwordInput.disabled = false;
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (syncCard) {
                syncCard.style.opacity = '0.5';
                syncCard.style.pointerEvents = 'none';
            }
        }

        if (lastSyncEl) {
            if (this.flomoConfig.lastSyncTime) {
                lastSyncEl.textContent = this.flomoConfig.lastSyncTime;
            } else {
                lastSyncEl.textContent = '从未同步';
            }
        }
        
        // 初始化同步目标单选框
        const savedSyncTarget = this.flomoConfig.syncTarget || 'dailynote';
        const targetRadios = this.container.querySelectorAll('input[name="flomo-target"]');
        targetRadios.forEach(radio => {
            if (radio.value === savedSyncTarget) {
                radio.checked = true;
                radio.closest('.flomo-target')?.classList.add('selected');
            } else {
                radio.checked = false;
                radio.closest('.flomo-target')?.classList.remove('selected');
            }
        });
        
        // 根据初始目标设置笔记本选择器显示状态
        if (flomoNotebookRow) {
            flomoNotebookRow.style.display = syncTarget === 'shuoshuo' ? 'none' : 'block';
        }
    }

    // 加载笔记本列表到 Flomo 选择器
    async loadFlomoNotebooks() {
        const select = this.container?.querySelector('#flomo-notebook-select');
        if (!select) return;

        try {
            const response = await fetch('/api/notebook/lsNotebooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const result = await response.json();
            
            if (result.code === 0 && result.data?.notebooks) {
                const notebooks = result.data.notebooks.filter(nb => !nb.closed);
                
                let html = '<option value="">请选择笔记本...</option>';
                notebooks.forEach(nb => {
                    const icon = nb.icon ? String.fromCodePoint(parseInt(nb.icon, 16)) : '📒';
                    html += `<option value="${nb.id}">${icon} ${nb.name}</option>`;
                });
                select.innerHTML = html;
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
        }
    }

    // 渲染每日回顾
    renderReviewNotes() {
        const listEl = this.container?.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 获取今天的笔?
        const today = new Date();
        const todayKey = this.formatDateKey(today);

        // 获取历史同期（往前推1年?年?年）
        const historyYears = [1, 2, 3];
        const historyNotes = [];

        historyYears.forEach(yearOffset => {
            const historyDate = new Date(today);
            historyDate.setFullYear(historyDate.getFullYear() - yearOffset);
            const historyKey = this.formatDateKey(historyDate);

            const notes = this.shuoshuos.filter(s => {
                const noteDate = new Date(s.created);
                return this.formatDateKey(noteDate) === historyKey;
            });

            if (notes.length > 0) {
                historyNotes.push({
                    year: historyDate.getFullYear(),
                    notes: notes
                });
            }
        });

        if (historyNotes.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-empty-state">
                    <div class="north-shuoshuo-empty-icon">📅</div>
                    <div class="north-shuoshuo-empty-text">历史上的今天没有记录</div>
                    <div class="north-shuoshuo-empty-hint">继续记录，未来的你会感谢现在坚持的自己</div>
                </div>
            `;
            return;
        }

        listEl.innerHTML = historyNotes.map(({ year, notes }) => `
            <div class="north-shuoshuo-review-section">
                <div class="north-shuoshuo-review-year">${year}年的今天</div>
                ${notes.map(item => `
                    <div class="north-shuoshuo-note-card ${item.pinned ? 'pinned' : ''}" data-id="${item.id}">
                        <div class="north-shuoshuo-note-header">
                            <span class="north-shuoshuo-note-date">${this.formatDate(item.created)}</span>
                        </div>
                        <div class="north-shuoshuo-note-content">${this.formatContent(item.content)}</div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    // 渲染随机漫步
    renderRandomNote() {
        const listEl = this.container?.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        if (this.shuoshuos.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-empty-state">
                    <div class="north-shuoshuo-empty-icon">🎲</div>
                    <div class="north-shuoshuo-empty-text">还没有笔记</div>
                    <div class="north-shuoshuo-empty-hint">记录下第一条想法，开始你的记录之旅</div>
                </div>
            `;
            return;
        }

        // 随机选择一条笔?
        const randomIndex = Math.floor(Math.random() * this.shuoshuos.length);
        const item = this.shuoshuos[randomIndex];

        listEl.innerHTML = `
            <div class="north-shuoshuo-random-section">
                <div class="north-shuoshuo-random-title">🎲 随机漫步</div>
                <div class="north-shuoshuo-note-card ${item.pinned ? 'pinned' : ''}" data-id="${item.id}">
                    <div class="north-shuoshuo-note-header">
                        <span class="north-shuoshuo-note-date">${this.formatDate(item.created)}</span>
                    </div>
                    <div class="north-shuoshuo-note-content">${this.formatContent(item.content)}</div>
                </div>
                <button class="north-shuoshuo-random-btn" id="shuoshuo-random-again">再来一条</button>
            </div>
        `;

        const againBtn = this.container.querySelector('#shuoshuo-random-again');
        if (againBtn) {
            againBtn.onclick = () => this.renderRandomNote();
        }
    }

    async loadShuoshuos() {
        try {
            const data = await this.loadData(STORAGE_NAME);
            this.shuoshuos = data || [];
        } catch (e) {
            console.log("加载笔记失败", e);
            this.shuoshuos = [];
        }
    }

    async loadAvatars() {
        try {
            const assistantData = await this.loadData(AVATAR_ASSISTANT_STORAGE_NAME);
            const userData = await this.loadData(AVATAR_USER_STORAGE_NAME);
            this.assistantAvatarUrl = assistantData || null;
            this.userAvatarUrl = userData || null;
        } catch (e) {
            console.log("加载头像失败", e);
            this.assistantAvatarUrl = null;
            this.userAvatarUrl = null;
        }
    }

    async loadNotebookId() {
        try {
            const data = await this.loadData(NOTEBOOK_ID_STORAGE_NAME);
            this.notebookId = data || DEFAULT_NOTEBOOK_ID;
        } catch (e) {
            console.log("加载笔记本ID失败", e);
            this.notebookId = DEFAULT_NOTEBOOK_ID;
        }
    }

    async loadAutoSync() {
        try {
            const data = await this.loadData(AUTO_SYNC_STORAGE_NAME);
            // 严格转换为布尔值，防止字符串 "false" 被当作 true
            this.autoSync = data === true || data === 'true' || data === 1;
        } catch (e) {
            console.log("加载自动同步设置失败", e);
            this.autoSync = false;
        }
    }

    async loadViewStyle() {
        try {
            const data = await this.loadData(VIEW_STYLE_STORAGE_NAME);
            this.viewStyle = data === 'card' ? 'card' : 'list';
        } catch (e) {
            console.log("加载视图样式设置失败", e);
            this.viewStyle = 'list';
        }
    }

    // 应用视图样式到笔记列表
    async applyViewStyle() {
        const listEl = this.container?.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;
        
        // 确保 viewStyle 已加载
        if (!this.viewStyle) {
            await this.loadViewStyle();
        }
        
        if (this.viewStyle === 'card') {
            listEl.classList.add('card-layout');
            listEl.classList.remove('list-layout');
        } else {
            listEl.classList.add('list-layout');
            listEl.classList.remove('card-layout');
            // 平铺布局时，如果内部是瀑布流结构，需要重新渲染
            if (listEl.querySelector('.north-shuoshuo-masonry-column')) {
                this.renderNotes();
                return;
            }
        }
    }

    async saveShuoshuos() {
        try {
            await this.saveData(STORAGE_NAME, this.shuoshuos);
        } catch (e) {
            console.log("保存笔记失败", e);
            showMessage("保存失败: " + e.message);
        }
    }

    // ==================== Flomo 同步功能 ====================

    async loadFlomoConfig() {
        try {
            const data = await this.loadData(FLOMO_CONFIG_STORAGE_NAME);
            this.flomoConfig = data || { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '' };
        } catch (e) {
            console.log("加载 flomo 配置失败", e);
            this.flomoConfig = { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '' };
        }
    }

    async saveFlomoConfig() {
        try {
            await this.saveData(FLOMO_CONFIG_STORAGE_NAME, this.flomoConfig);
        } catch (e) {
            console.log("保存 flomo 配置失败", e);
        }
    }

    // 加载回顾配置
    async loadReviewConfig() {
        try {
            const data = await this.loadData(REVIEW_CONFIG_STORAGE_NAME);
            if (data) {
                this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG, ...data };
            } else {
                this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG };
            }
        } catch (e) {
            console.log("加载回顾配置失败", e);
            this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG };
        }
    }

    // 保存回顾配置
    async saveReviewConfig() {
        try {
            await this.saveData(REVIEW_CONFIG_STORAGE_NAME, this.reviewConfig);
        } catch (e) {
            console.log("保存回顾配置失败", e);
        }
    }

    // 加载标签图标
    async loadTagIcons() {
        try {
            const data = await this.loadData(TAG_ICONS_STORAGE_NAME);
            this.tagIcons = data || {};
        } catch (e) {
            console.log("加载标签图标失败", e);
            this.tagIcons = {};
        }
    }

    // 保存标签图标
    async saveTagIcons() {
        try {
            await this.saveData(TAG_ICONS_STORAGE_NAME, this.tagIcons);
        } catch (e) {
            console.log("保存标签图标失败", e);
        }
    }

    // 设置标签图标
    async setTagIcon(tagName, icon) {
        if (icon && icon.trim()) {
            this.tagIcons[tagName] = icon.trim();
        } else {
            delete this.tagIcons[tagName];
        }
        await this.saveTagIcons();
        this.renderTags(); // 刷新标签列表
    }

    // 加载置顶标签
    async loadPinnedTags() {
        try {
            const data = await this.loadData(TAG_PINNED_STORAGE_NAME);
            this.pinnedTags = Array.isArray(data) ? data : [];
        } catch (e) {
            console.log("加载置顶标签失败", e);
            this.pinnedTags = [];
        }
    }

    // 保存置顶标签
    async savePinnedTags() {
        try {
            await this.saveData(TAG_PINNED_STORAGE_NAME, this.pinnedTags);
        } catch (e) {
            console.log("保存置顶标签失败", e);
        }
    }

    // 切换置顶状态
    async togglePinnedTag(tagName) {
        const index = this.pinnedTags.indexOf(tagName);
        if (index > -1) {
            this.pinnedTags.splice(index, 1);
        } else {
            this.pinnedTags.push(tagName);
        }
        await this.savePinnedTags();
        this.renderTags();
    }

    // 显示标签菜单
    showTagMenu(tagName, anchorEl) {
        // 关闭已有菜单
        this.closeAllTagMenus();

        const isPinned = this.pinnedTags.includes(tagName);
        const menu = document.createElement('div');
        menu.className = 'north-shuoshuo-tag-menu-dropdown';
        menu.innerHTML = `
            <div class="north-shuoshuo-tag-menu-item" data-action="pin">
                <span class="north-shuoshuo-tag-menu-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z"/></svg>
                </span>
                <span class="north-shuoshuo-tag-menu-text">${isPinned ? '取消置顶' : '置顶'}</span>
            </div>
            <div class="north-shuoshuo-tag-menu-item" data-action="rename">
                <span class="north-shuoshuo-tag-menu-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </span>
                <span class="north-shuoshuo-tag-menu-text">编辑名称/图标</span>
            </div>
            <div class="north-shuoshuo-tag-menu-item north-shuoshuo-tag-menu-item-danger" data-action="delete">
                <span class="north-shuoshuo-tag-menu-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </span>
                <span class="north-shuoshuo-tag-menu-text">删除标签</span>
                <span class="north-shuoshuo-tag-menu-arrow">›</span>
            </div>
        `;

        document.body.appendChild(menu);
        this._activeTagMenu = menu;

        // 定位
        const rect = anchorEl.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 4}px`;
        menu.style.left = `${Math.min(rect.left, window.innerWidth - 180)}px`;
        menu.style.zIndex = '10001';

        // 点击菜单项
        menu.querySelectorAll('.north-shuoshuo-tag-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                if (action === 'pin') {
                    this.togglePinnedTag(tagName);
                    menu.remove();
                } else if (action === 'rename') {
                    menu.remove();
                    this.showTagRenameDialog(tagName);
                } else if (action === 'delete') {
                    this.showTagDeleteSubmenu(tagName, item, menu);
                }
            });
        });

        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!menu.contains(e.target) && !anchorEl.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    // 关闭所有标签菜单
    closeAllTagMenus() {
        if (this._activeTagMenu) {
            this._activeTagMenu.remove();
            this._activeTagMenu = null;
        }
        const oldSub = document.querySelector('.north-shuoshuo-tag-submenu');
        if (oldSub) oldSub.remove();
    }

    // 显示删除子菜单
    showTagDeleteSubmenu(tagName, anchorItem, parentMenu) {
        const oldSub = document.querySelector('.north-shuoshuo-tag-submenu');
        if (oldSub) oldSub.remove();

        const subMenu = document.createElement('div');
        subMenu.className = 'north-shuoshuo-tag-submenu';
        subMenu.innerHTML = `
            <div class="north-shuoshuo-tag-submenu-item" data-action="delete-tag-only">仅删除标签</div>
            <div class="north-shuoshuo-tag-submenu-item north-shuoshuo-tag-submenu-item-danger" data-action="delete-tag-and-notes">删除标签和笔记</div>
        `;

        document.body.appendChild(subMenu);

        const rect = anchorItem.getBoundingClientRect();
        subMenu.style.position = 'fixed';
        subMenu.style.top = `${rect.top}px`;
        subMenu.style.left = `${rect.right + 4}px`;
        subMenu.style.zIndex = '10002';

        subMenu.querySelectorAll('.north-shuoshuo-tag-submenu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                if (action === 'delete-tag-only') {
                    this.deleteTagOnly(tagName);
                } else if (action === 'delete-tag-and-notes') {
                    this.deleteTagAndNotes(tagName);
                }
                subMenu.remove();
                parentMenu.remove();
            });
        });

        setTimeout(() => {
            const closeHandler = (e) => {
                if (!subMenu.contains(e.target) && !anchorItem.contains(e.target)) {
                    subMenu.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    // 显示重命名弹窗
    showTagRenameDialog(tagName) {
        const currentIcon = this.tagIcons[tagName] || '';
        let previewSrc = '';
        let currentColor = '#2ecc71';
        let currentContent = '';

        // 解析当前图标
        if (currentIcon && currentIcon.startsWith('icon:')) {
            const parts = currentIcon.substring(5).split(':');
            if (parts[0] === 'dynamic') {
                previewSrc = `/api/icon/getDynamicIcon?type=${parts[1] || '1'}&color=%232ecc71`;
            } else if (parts[0] === 'customEmoji') {
                previewSrc = `/emojis/${decodeURIComponent(parts[1] || '')}`;
            } else {
                currentContent = decodeURIComponent(parts[0] || '');
                currentColor = parts[1] || '#2ecc71';
                currentContent = this.convertHexToEmoji(currentContent);
                const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(currentContent);
                if (isEmoji) {
                    previewSrc = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(currentColor)}&content=${encodeURIComponent(currentContent)}`;
                } else {
                    previewSrc = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(currentColor)}&content=${encodeURIComponent(currentContent)}`;
                }
            }
        } else {
            previewSrc = `/api/icon/getDynamicIcon?type=8&color=%232ecc71&content=${encodeURIComponent(tagName.substring(0, 2))}`;
        }

        const modal = document.createElement('div');
        modal.className = 'north-shuoshuo-tag-rename-modal';
        modal.innerHTML = `
            <div class="north-shuoshuo-modal-overlay"></div>
            <div class="north-shuoshuo-tag-rename-content">
                <div class="north-shuoshuo-tag-rename-row">
                    <div class="north-shuoshuo-tag-rename-icon" data-tag="${tagName}">
                        <img src="${previewSrc}" alt="icon">
                    </div>
                    <input type="text" class="north-shuoshuo-tag-rename-input" value="${tagName}" placeholder="标签名称">
                    <button class="north-shuoshuo-tag-rename-save">保存</button>
                </div>
                <div class="north-shuoshuo-tag-rename-hint">使用 标签/次级标签 格式创建多级标签</div>
            </div>
        `;

        document.body.appendChild(modal);

        const input = modal.querySelector('.north-shuoshuo-tag-rename-input');
        const saveBtn = modal.querySelector('.north-shuoshuo-tag-rename-save');
        const iconBox = modal.querySelector('.north-shuoshuo-tag-rename-icon');

        // 点击图标切换图标
        iconBox.addEventListener('click', () => {
            this.showIconPicker(tagName, currentIcon, (newIcon) => {
                this.setTagIcon(tagName, newIcon);
                // 更新预览
                if (newIcon && newIcon.startsWith('icon:')) {
                    const p = newIcon.substring(5).split(':');
                    if (p[0] === 'dynamic') {
                        iconBox.querySelector('img').src = `/api/icon/getDynamicIcon?type=${p[1] || '1'}&color=%232ecc71`;
                    } else if (p[0] === 'customEmoji') {
                        iconBox.querySelector('img').src = `/emojis/${decodeURIComponent(p[1] || '')}`;
                    } else {
                        const c = this.convertHexToEmoji(decodeURIComponent(p[0] || ''));
                        const col = p[1] || '#2ecc71';
                        iconBox.querySelector('img').src = `/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(col)}&content=${encodeURIComponent(c)}`;
                    }
                } else {
                    iconBox.querySelector('img').src = `/api/icon/getDynamicIcon?type=8&color=%232ecc71&content=${encodeURIComponent(tagName.substring(0, 2))}`;
                }
            });
        });

        const doSave = () => {
            const newName = input.value.trim();
            if (newName && newName !== tagName) {
                this.renameTag(tagName, newName);
            }
            modal.remove();
        };

        saveBtn.addEventListener('click', doSave);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSave();
        });
        input.focus();
        input.select();

        modal.querySelector('.north-shuoshuo-modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
    }

    // 重命名标签
    async renameTag(oldName, newName) {
        // 更新所有笔记中的标签
        this.shuoshuos.forEach(note => {
            if (note.tags) {
                note.tags = note.tags.map(tag => {
                    if (tag === oldName) return newName;
                    if (tag.startsWith(oldName + '/')) {
                        return newName + tag.substring(oldName.length);
                    }
                    return tag;
                });
            }
            // 同时替换内容中的标签文本
            if (note.content) {
                note.content = note.content.replace(
                    new RegExp('#' + this.escapeRegExp(oldName) + '(?![\\w/])', 'g'),
                    '#' + newName
                );
            }
        });

        // 迁移图标配置
        if (this.tagIcons[oldName]) {
            this.tagIcons[newName] = this.tagIcons[oldName];
            delete this.tagIcons[oldName];
        }
        // 迁移子标签的图标配置
        Object.keys(this.tagIcons).forEach(key => {
            if (key.startsWith(oldName + '/')) {
                const newKey = newName + key.substring(oldName.length);
                this.tagIcons[newKey] = this.tagIcons[key];
                delete this.tagIcons[key];
            }
        });

        // 迁移置顶状态
        const pinIndex = this.pinnedTags.indexOf(oldName);
        if (pinIndex > -1) {
            this.pinnedTags[pinIndex] = newName;
        }
        // 迁移子标签置顶状态
        this.pinnedTags = this.pinnedTags.map(tag => {
            if (tag === oldName) return newName;
            if (tag.startsWith(oldName + '/')) {
                return newName + tag.substring(oldName.length);
            }
            return tag;
        });

        await this.saveData(STORAGE_NAME, this.shuoshuos);
        await this.saveTagIcons();
        await this.savePinnedTags();

        if (this.selectedTag === oldName) {
            this.selectedTag = newName;
        }

        this.renderTags();
        this.renderNotes();
        showMessage(`标签已重命名为 "${newName}"`);
    }

    // 仅删除标签
    async deleteTagOnly(tagName) {
        // 从所有笔记内容中移除该标签
        this.shuoshuos.forEach(note => {
            if (note.tags) {
                note.tags = note.tags.filter(t => t !== tagName && !t.startsWith(tagName + '/'));
            }
            if (note.content) {
                note.content = note.content.replace(
                    new RegExp('#' + this.escapeRegExp(tagName) + '(?![\\w/])', 'g'),
                    ''
                ).replace(/\s+/g, ' ').trim();
            }
        });

        // 清理图标和置顶
        delete this.tagIcons[tagName];
        Object.keys(this.tagIcons).forEach(key => {
            if (key.startsWith(tagName + '/')) delete this.tagIcons[key];
        });
        this.pinnedTags = this.pinnedTags.filter(t => t !== tagName && !t.startsWith(tagName + '/'));

        if (this.selectedTag === tagName || (this.selectedTag && this.selectedTag.startsWith(tagName + '/'))) {
            this.selectedTag = null;
        }

        await this.saveData(STORAGE_NAME, this.shuoshuos);
        await this.saveTagIcons();
        await this.savePinnedTags();
        this.renderTags();
        this.renderNotes();
        showMessage('标签已删除');
    }

    // 删除标签和关联笔记
    async deleteTagAndNotes(tagName) {
        // 过滤掉包含该标签的笔记
        this.shuoshuos = this.shuoshuos.filter(note => {
            const tags = note.tags || this.extractTags(note.content);
            return !tags.some(t => t === tagName || t.startsWith(tagName + '/'));
        });

        // 清理图标和置顶
        delete this.tagIcons[tagName];
        Object.keys(this.tagIcons).forEach(key => {
            if (key.startsWith(tagName + '/')) delete this.tagIcons[key];
        });
        this.pinnedTags = this.pinnedTags.filter(t => t !== tagName && !t.startsWith(tagName + '/'));

        if (this.selectedTag === tagName || (this.selectedTag && this.selectedTag.startsWith(tagName + '/'))) {
            this.selectedTag = null;
        }

        await this.saveData(STORAGE_NAME, this.shuoshuos);
        await this.saveTagIcons();
        await this.savePinnedTags();
        this.renderTags();
        this.renderNotes();
        showMessage('标签和关联笔记已删除');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 加载主题模式
    async loadThemeMode() {
        try {
            const data = await this.loadData(THEME_MODE_STORAGE_NAME);
            this.themeMode = data || DEFAULT_THEME_MODE;
        } catch (e) {
            console.log("加载主题模式失败", e);
            this.themeMode = DEFAULT_THEME_MODE;
        }
    }

    // 保存主题模式
    async saveThemeMode() {
        try {
            await this.saveData(THEME_MODE_STORAGE_NAME, this.themeMode);
        } catch (e) {
            console.log("保存主题模式失败", e);
        }
    }

    // 加载莫兰迪配色
    async loadMorandiColor() {
        try {
            const data = await this.loadData(MORANDI_COLOR_STORAGE_NAME);
            const validKeys = MORANDI_COLORS.map(c => c.key);
            this.morandiColor = validKeys.includes(data) ? data : MORANDI_COLORS[0].key;
        } catch (e) {
            console.log("加载莫兰迪配色失败", e);
            this.morandiColor = MORANDI_COLORS[0].key;
        }
    }

    // 保存莫兰迪配色
    async saveMorandiColor() {
        try {
            await this.saveData(MORANDI_COLOR_STORAGE_NAME, this.morandiColor);
        } catch (e) {
            console.log("保存莫兰迪配色失败", e);
        }
    }

    // 应用主题模式
    applyThemeMode() {
        const container = this.container?.querySelector('.north-shuoshuo-container');
        if (!container) return;
        
        // 移除所有主题类
        container.classList.remove('theme-original', 'theme-siyuan', 'theme-morandi');
        MORANDI_COLORS.forEach(c => {
            container.classList.remove(`morandi-${c.key}`);
        });
        
        // 添加当前主题模式类
        const themeToApply = this.themeMode || 'original';
        container.classList.add(`theme-${themeToApply}`);
        
        // 如果是莫兰迪主题，添加具体配色类
        if (themeToApply === 'morandi' && this.morandiColor) {
            container.classList.add(`morandi-${this.morandiColor}`);
        }
    }

    // 根据回顾配置获取回顾笔记
    getReviewNotes() {
        const { contentScope, contentScopeTags, timeRange, dailyCount } = this.reviewConfig;
        
        let filtered = [...this.shuoshuos];
        
        // 1. 按时间范围筛选
        if (timeRange !== 'all') {
            const now = Date.now();
            let timeLimit;
            switch (timeRange) {
                case '1_year':
                    timeLimit = now - 365 * 24 * 60 * 60 * 1000;
                    break;
                case '6_months':
                    timeLimit = now - 180 * 24 * 60 * 60 * 1000;
                    break;
                case '3_months':
                    timeLimit = now - 90 * 24 * 60 * 60 * 1000;
                    break;
                case '1_month':
                    timeLimit = now - 30 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    timeLimit = 0;
            }
            filtered = filtered.filter(s => s.created >= timeLimit);
        }
        
        // 2. 按内容范围筛选
        if (contentScope === 'no_tags') {
            // 无标签
            filtered = filtered.filter(s => !s.tags || s.tags.length === 0);
        } else if (contentScope === 'include_tags' && contentScopeTags.length > 0) {
            // 包含指定标签（只要包含其中一个就算）
            filtered = filtered.filter(s => {
                if (!s.tags || s.tags.length === 0) return false;
                return contentScopeTags.some(tag => s.tags.includes(tag));
            });
        } else if (contentScope === 'exclude_tags' && contentScopeTags.length > 0) {
            // 排除指定标签
            filtered = filtered.filter(s => {
                if (!s.tags || s.tags.length === 0) return true;
                return !contentScopeTags.some(tag => s.tags.includes(tag));
            });
        }
        // contentScope === 'all' 不筛选
        
        // 3. 随机打乱
        filtered = filtered.sort(() => Math.random() - 0.5);
        
        // 4. 限制数量
        return filtered.slice(0, dailyCount);
    }

    // MD5 加密（浏览器可用版本）
    md5(string) {
        // 基于 spark-md5 的简化实现
        const rotateLeft = (lValue, iShiftBits) => (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        const addUnsigned = (lX, lY) => {
            let lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) {
                if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
            return (lResult ^ lX8 ^ lY8);
        };
        const f = (x, y, z) => (x & y) | ((~x) & z);
        const g = (x, y, z) => (x & z) | (y & (~z));
        const h = (x, y, z) => (x ^ y ^ z);
        const i = (x, y, z) => (y ^ (x | (~z)));
        const ff = (a, b, c, d, x, s, ac) => {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        const gg = (a, b, c, d, x, s, ac) => {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        const hh = (a, b, c, d, x, s, ac) => {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        const ii = (a, b, c, d, x, s, ac) => {
            a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        };
        const convertToWordArray = (string) => {
            let lWordCount;
            const lMessageLength = string.length;
            const lNumberOfWords_temp1 = lMessageLength + 8;
            const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            const lWordArray = new Array(lNumberOfWords - 1);
            let lBytePosition = 0;
            let lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        };
        const wordToHex = (lValue) => {
            let wordToHexValue = '', wordToHexValue_temp = '', lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexValue_temp = '0' + lByte.toString(16);
                wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
            }
            return wordToHexValue;
        };
        let x = [];
        let k, AA, BB, CC, DD, a, b, c, d;
        const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        string = unescape(encodeURIComponent(string));
        x = convertToWordArray(string);
        a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a; BB = b; CC = c; DD = d;
            a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }
        return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
    }

    // 创建 Flomo API 签名
    createFlomoSign(param) {
        // 1. 按键名排序
        const sortParam = {};
        Object.keys(param).sort().forEach(key => {
            sortParam[key] = param[key];
        });

        // 2. 拼接参数字符串
        let paramString = '';
        for (let key in sortParam) {
            let value = sortParam[key];
            if (value === undefined || value === null || value === '') continue;
            
            if (Array.isArray(value)) {
                value.sort();
                value.forEach(item => {
                    paramString += key + '[]=' + item + '&';
                });
            } else {
                paramString += key + '=' + value + '&';
            }
        }
        paramString = paramString.substring(0, paramString.length - 1);
        
        // 3. MD5 加密（参数 + SECRET）
        return this.md5(paramString + FLOMO_SECRET);
    }

    // Flomo 登录
    async flomoLogin(username, password) {
        try {
            const timestamp = Math.floor(Date.now() / 1000).toString();
            
            const params = {
                api_key: FLOMO_API_KEY,
                app_version: FLOMO_APP_VERSION,
                email: username,
                password: password,
                timestamp: timestamp,
                webp: "1"
            };
            
            params.sign = this.createFlomoSign(params);
            
            const response = await fetch(`${FLOMO_API_BASE}/user/login_by_email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: JSON.stringify(params)
            });
            
            const data = await response.json();
            
            if (data.code === 0 && data.data && data.data.access_token) {
                this.flomoConfig.username = username;
                this.flomoConfig.password = password;
                this.flomoConfig.accessToken = data.data.access_token;
                await this.saveFlomoConfig();
                return { success: true, message: '登录成功' };
            } else {
                return { success: false, message: data.message || '登录失败' };
            }
        } catch (e) {
            console.error('Flomo 登录失败:', e);
            return { success: false, message: '登录失败: ' + e.message };
        }
    }

    // 获取 Flomo 笔记
    // isFullSync: 是否全量同步（从头开始同步所有笔记）
    async flomoSync(isFullSync = false) {
        if (!this.flomoConfig.accessToken) {
            showMessage('请先登录 Flomo');
            return;
        }
        
        try {
            if (isFullSync) {
                showMessage('正在进行全量同步，这可能需要一些时间...');
            } else {
                showMessage('正在同步 Flomo 笔记...');
            }
            
            const allMemos = [];
            // 全量同步时，从头开始（使用很早的时间）
            let lastSyncTime = isFullSync ? '2020-01-01 00:00:00' : (this.flomoConfig.lastSyncTime || '2020-01-01 00:00:00');
            const limit = 200;
            let latestSlug = "";
            
            while (true) {
                const timestamp = Math.floor(Date.now() / 1000).toString();
                const latestTimestamp = Math.floor(new Date(lastSyncTime).getTime() / 1000).toString();
                
                const params = {
                    api_key: FLOMO_API_KEY,
                    app_version: FLOMO_APP_VERSION,
                    latest_slug: latestSlug,
                    latest_updated_at: latestTimestamp,
                    limit: limit.toString(),
                    timestamp: timestamp,
                    tz: "8:0",
                    webp: "1"
                };
                
                params.sign = this.createFlomoSign(params);
                
                const url = new URL(`${FLOMO_API_BASE}/memo/updated`);
                url.search = new URLSearchParams(params).toString();
                
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.flomoConfig.accessToken}`,
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                const data = await response.json();
                
                if (data.code !== 0) {
                    showMessage('同步失败: ' + (data.message || '未知错误'));
                    return;
                }
                
                const records = data.data || [];
                
                // 过滤已删除的记录
                const validRecords = records.filter(record => !record.deleted_at);
                allMemos.push(...validRecords);
                
                // 分页处理
                if (records.length < limit) break;
                
                const lastRecord = records[records.length - 1];
                lastSyncTime = lastRecord.updated_at;
                latestSlug = lastRecord.slug;
            }
            
            if (allMemos.length === 0) {
                showMessage('没有新的笔记需要同步');
                return;
            }
            
            // 处理并保存到思源笔记
            await this.saveFlomoMemosToSiyuan(allMemos, isFullSync);
            
            // 更新最后同步时间（全量同步后也更新为当前时间）
            this.flomoConfig.lastSyncTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
            await this.saveFlomoConfig();
            
            const syncTypeText = isFullSync ? '全量同步' : '同步';
            showMessage(`成功${syncTypeText} ${allMemos.length} 条笔记`);
            
        } catch (e) {
            console.error('Flomo 同步失败:', e);
            showMessage('同步失败: ' + e.message);
        }
    }

    // 下载远程图片并上传到本地 assets
    async downloadRemoteImage(imageUrl, fileName) {
        try {
            console.log(`开始下载图片: ${imageUrl}`);
            
            // 下载远程图片
            const response = await fetch(imageUrl);
            if (!response.ok) {
                console.error(`下载图片失败: ${imageUrl}, 状态: ${response.status}`);
                return null;
            }
            
            const blob = await response.blob();
            console.log(`图片下载成功, 大小: ${blob.size}, 类型: ${blob.type}`);
            
            // 生成文件名（使用时间戳和随机数避免冲突）
            const timestamp = new Date().getTime();
            const random = Math.floor(Math.random() * 10000);
            const ext = (fileName && fileName.includes('.')) ? fileName.split('.').pop() : 'png';
            const newFileName = `flomo_${timestamp}_${random}.${ext}`;
            console.log(`生成文件名: ${newFileName}`);
            
            // 创建 File 对象
            const file = new File([blob], newFileName, { type: blob.type });
            
            // 上传到思源 assets
            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);
            
            const uploadResponse = await fetch('/api/asset/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await uploadResponse.json();
            if (result.code === 0) {
                const succMap = result.data.succMap;
                const newPath = succMap[newFileName];
                if (newPath) {
                    // 返回本地路径（去除开头的 /）
                    return newPath.startsWith('/') ? newPath.substring(1) : newPath;
                }
            }
            
            console.error('上传图片失败:', result.msg);
            return null;
        } catch (e) {
            console.error('下载或上传图片失败:', e);
            return null;
        }
    }

    // 将 Flomo 笔记保存到思源
    // isFullSync: 是否全量同步
    async saveFlomoMemosToSiyuan(memos, isFullSync = false) {
        // 获取同步目标设置
        const targetRadio = this.container?.querySelector('input[name="flomo-target"]:checked');
        const syncTarget = targetRadio?.value || 'dailynote';
        
        if (syncTarget === 'shuoshuo') {
            // 同步到说说视图
            await this.saveFlomoMemosToShuoshuo(memos, isFullSync);
        } else if (syncTarget === 'singledoc') {
            // 同步到指定文档
            await this.saveFlomoMemosToSingleDoc(memos);
        } else {
            // 同步到每日笔记
            await this.saveFlomoMemosToDailyNote(memos, isFullSync);
        }
    }

    // 保存 Flomo 笔记到说说视图
    // isFullSync: 是否全量同步（会重新添加已删除的笔记）
    async saveFlomoMemosToShuoshuo(memos, isFullSync = false) {
        let addedCount = 0;
        let updatedCount = 0;
        
        for (const memo of memos) {
            // 转换 HTML 为纯文本/Markdown
            let content = memo.content
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                .replace(/<[^>]+>/g, ''); // 移除剩余标签
            
            // 处理图片 - 下载远程图片并替换为本地路径
            if (memo.files && memo.files.length > 0) {
                for (const file of memo.files) {
                    const fileUrl = file.url || '';
                    const fileName = file.file_name || 'image.png';
                    
                    // 检查是否是远程图片（以 http:// 或 https:// 开头）
                    const isRemoteUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
                    
                    if (isRemoteUrl) {
                        // 下载并转换为本地图片
                        showMessage(`正在下载图片: ${fileName}...`);
                        const localPath = await this.downloadRemoteImage(fileUrl, fileName);
                        if (localPath) {
                            content += `\n![${fileName}](${localPath})`;
                        } else {
                            // 下载失败，保留原 URL
                            content += `\n![${fileName}](${fileUrl})`;
                        }
                    } else {
                        // 已经是本地图片或相对路径，直接使用
                        content += `\n![${fileName}](${fileUrl})`;
                    }
                }
            }
            
            // 提取 flomo 标签并转换为 #标签 格式
            const flomoTags = memo.tags || [];
            
            // 过滤掉内容中已存在的标签，避免重复
            const contentTrimmed = content.trim();
            
            // 先从内容中提取所有已有的标签
            const existingTags = new Set();
            const tagRegex = /#([^\s\d][^\s]*(?:\/[^\s]+)*)/g;
            let match;
            while ((match = tagRegex.exec(contentTrimmed)) !== null) {
                existingTags.add(match[1]); // 存储标签名（不含#）
            }
            
            // 过滤掉已存在的标签
            const uniqueTags = flomoTags.filter(tag => {
                return !existingTags.has(tag);
            });
            
            const tagStr = uniqueTags.length > 0 ? ' ' + uniqueTags.map(t => `#${t}`).join(' ') : '';
            
            // 创建说说对象
            const shuoshuo = {
                id: `flomo_${memo.slug}`, // 使用 flomo slug 作为唯一标识
                content: contentTrimmed + tagStr,
                tags: flomoTags, // 仍然保存所有标签用于筛选
                pinned: false,
                created: new Date(memo.created_at).getTime(),
                updated: new Date(memo.updated_at).getTime(),
                source: 'flomo' // 标记来源
            };
            
            // 检查是否已存在（避免重复）
            const existingIndex = this.shuoshuos.findIndex(s => s.id === shuoshuo.id);
            if (existingIndex === -1) {
                this.shuoshuos.push(shuoshuo);
                addedCount++;
            } else {
                // 更新已有笔记
                this.shuoshuos[existingIndex] = shuoshuo;
                updatedCount++;
            }
        }
        
        // 保存到存储
        await this.saveShuoshuos();
        
        // 刷新说说视图
        this.renderNotes();
        this.renderTags();
        
        const syncTypeText = isFullSync ? '全量同步' : '同步';
        if (addedCount > 0 && updatedCount > 0) {
            showMessage(`${syncTypeText}完成：新增 ${addedCount} 条，更新 ${updatedCount} 条`);
        } else if (addedCount > 0) {
            showMessage(`成功添加 ${addedCount} 条笔记到说说视图`);
        } else if (updatedCount > 0) {
            showMessage(`成功更新 ${updatedCount} 条笔记`);
        } else {
            showMessage(`${syncTypeText}完成：没有变化的笔记`);
        }
    }

    // 获取每日笔记文档 ID
    async getDailyNoteDocId(date) {
        try {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hPath = `${year}/${month}/${day}`;
            
            const response = await fetch('/api/filetree/getIDsByHPath', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notebook: this.notebookId,
                    path: hPath
                })
            });
            
            const result = await response.json();
            if (result.code === 0 && result.data && result.data.length > 0) {
                return result.data[0];
            }
            return null;
        } catch (e) {
            console.error('获取每日笔记 ID 失败:', e);
            return null;
        }
    }

    // 将网络图片转换为本地资源
    async convertNetImagesToLocal(docId) {
        try {
            console.log(`开始转换文档 ${docId} 中的网络图片...`);
            
            const response = await fetch('/api/format/netImg2LocalAssets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: docId
                })
            });
            
            const result = await response.json();
            if (result.code === 0) {
                console.log(`文档 ${docId} 图片转换成功`);
                return true;
            } else {
                console.error('图片转换失败:', result.msg);
                return false;
            }
        } catch (e) {
            console.error('图片转换请求失败:', e);
            return false;
        }
    }

    // 保存 Flomo 笔记到每日笔记
    // 保存 Flomo 笔记到每日笔记
    // isFullSync: 是否全量同步
    async saveFlomoMemosToDailyNote(memos, isFullSync = false) {
        // 按日期分组
        const memosByDate = {};
        
        memos.forEach(memo => {
            const date = memo.created_at.split(' ')[0];
            if (!memosByDate[date]) {
                memosByDate[date] = [];
            }
            memosByDate[date].push(memo);
        });
        
        // 处理每一天的笔记
        for (const [date, dayMemos] of Object.entries(memosByDate)) {
            let content = '';
            
            for (const memo of dayMemos) {
                // 转换 HTML 为 Markdown（简化处理）
                let memoContent = memo.content
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                    .replace(/<[^>]+>/g, ''); // 移除剩余标签
                
                // 处理图片 - 直接使用远程 URL，后续统一转换
                if (memo.files && memo.files.length > 0) {
                    memo.files.forEach(file => {
                        memoContent += `\n![${file.file_name}](${file.url})`;
                    });
                }
                
                content += `- ${memoContent.trim()}\n`;
            }
            
            // 保存到每日笔记
            await this.appendToDailyNote(content, new Date(date).getTime());
            
            // 获取每日笔记文档 ID 并转换图片
            const dateObj = new Date(date);
            showMessage(`正在转换 ${date} 的图片...`);
            const docId = await this.getDailyNoteDocId(dateObj);
            if (docId) {
                await this.convertNetImagesToLocal(docId);
            }
        }
    }

    // 保存 Flomo 笔记到指定文档
    async saveFlomoMemosToSingleDoc(memos) {
        const targetDocIdInput = this.container?.querySelector('#flomo-target-doc-id');
        const inputDocId = targetDocIdInput?.value?.trim();
        
        // 优先使用输入框的值，否则使用保存的文档 ID
        const docId = inputDocId || this.flomoConfig.syncDocId;
        
        if (!docId) {
            showMessage('请输入目标文档 ID');
            return;
        }
        
        console.log('准备同步到文档:', docId);
        
        // 按日期分组，准备文档内容
        const memosByDate = {};
        memos.forEach(memo => {
            const date = memo.created_at.split(' ')[0];
            if (!memosByDate[date]) {
                memosByDate[date] = [];
            }
            memosByDate[date].push(memo);
        });
        
        // 生成内容
        let allContent = '';
        const sortedDates = Object.keys(memosByDate).sort();
        
        for (const date of sortedDates) {
            const dayMemos = memosByDate[date];
            allContent += `\n## ${date}\n\n`;
            
            for (const memo of dayMemos) {
                // 转换 HTML 为 Markdown
                let memoContent = memo.content
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                    .replace(/<[^>]+>/g, '');
                
                // 处理图片 - 下载远程图片并替换为本地路径
                if (memo.files && memo.files.length > 0) {
                    for (const file of memo.files) {
                        const fileUrl = file.url || '';
                        const fileName = file.file_name || 'image.png';
                        
                        // 检查是否是远程图片
                        const isRemoteUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://');
                        
                        if (isRemoteUrl) {
                            // 下载并转换为本地图片
                            showMessage(`正在下载图片: ${fileName}...`);
                            const localPath = await this.downloadRemoteImage(fileUrl, fileName);
                            if (localPath) {
                                memoContent += `\n![${fileName}](${localPath})`;
                            } else {
                                memoContent += `\n![${fileName}](${fileUrl})`;
                            }
                        } else {
                            // 已经是本地图片，直接使用
                            memoContent += `\n![${fileName}](${fileUrl})`;
                        }
                    }
                }
                
                // 添加标签
                if (memo.tags && memo.tags.length > 0) {
                    const tagStr = memo.tags.map(t => `#${t}`).join(' ');
                    memoContent += `\n${tagStr}`;
                }
                
                allContent += `- ${memoContent.trim()}\n\n`;
            }
        }
        
        // 追加到指定文档
        try {
            showMessage('正在保存到指定文档...');
            const response = await fetch('/api/block/appendBlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    dataType: 'markdown',
                    data: allContent,
                    parentID: docId
                })
            });
            
            const result = await response.json();
            if (result.code === 0) {
                showMessage(`成功追加 ${memos.length} 条笔记到指定文档`);
            } else {
                showMessage('保存失败：' + (result.msg || '未知错误'));
            }
        } catch (e) {
            console.error('保存到指定文档失败:', e);
            showMessage('保存失败：' + e.message);
        }
    }

    uninstall() {
        this.removeData(STORAGE_NAME).catch(e => {
            showMessage(`uninstall [${this.name}] remove data [${STORAGE_NAME}] fail: ${e.msg}`);
        });
        this.removeData(AVATAR_ASSISTANT_STORAGE_NAME).catch(e => {
            showMessage(`uninstall [${this.name}] remove data [${AVATAR_ASSISTANT_STORAGE_NAME}] fail: ${e.msg}`);
        });
        this.removeData(AVATAR_USER_STORAGE_NAME).catch(e => {
            showMessage(`uninstall [${this.name}] remove data [${AVATAR_USER_STORAGE_NAME}] fail: ${e.msg}`);
        });
        this.removeData(NOTEBOOK_ID_STORAGE_NAME).catch(e => {
            showMessage(`uninstall [${this.name}] remove data [${NOTEBOOK_ID_STORAGE_NAME}] fail: ${e.msg}`);
        });
    }
}
