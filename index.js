const { Plugin, showMessage, openTab, openMobileFileById, getFrontend, confirm } = require("siyuan");

const STORAGE_NAME = "shuoshuo-data";
const CONFIG_STORAGE_NAME = "shuoshuo-config";
const MOMENTS_STORAGE_NAME = "lumina-moments-data";
const MOMENTS_CONFIG_NAME = "lumina-moments-config";
const BOOKS_STORAGE_NAME = "lumina-bookshelf-data";
const TAB_TYPE = "shuoshuo-tab";

// 数据备份键名（防止主存储损坏/丢失时无法恢复）
const STORAGE_BACKUP_NAME = "shuoshuo-data-backup";
const CONFIG_BACKUP_NAME = "shuoshuo-config-backup";
const MOMENTS_BACKUP_NAME = "lumina-moments-backup";
const BOOKS_BACKUP_NAME = "lumina-bookshelf-backup";

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
    dailyCount: 8, // 4, 8, 12, 16, 20, 24
    weightedReview: false // 加权回顾：越久没翻过的越优先
};

// 主题配置：original (原主题-硬编码绿色), siyuan (适配思源主题)
const DEFAULT_THEME_MODE = 'original';

// 字体大小配置
const DEFAULT_FONT_SIZE_CONFIG = { mode: 'default', customSize: 14.5 };

// 图书视图字体大小配置
const DEFAULT_BOOKSHELF_FONT_CONFIG = {
    title: 14,
    highlight: 13,
    thought: 13
};

// 图书视图同步配置
const DEFAULT_BOOKSHELF_SYNC_CONFIG = {
    syncNotebookId: '',
    syncMode: 'dailynote',
    syncDocId: ''
};

// 长笔记自动折叠配置（0 = 永不折叠）
const DEFAULT_AUTO_COLLAPSE_LINES = 0;

// 默认图书数据（首次使用为空，通过导入添加）
function getDefaultBooks() {
    return [];
}

// Flomo API 配置
const FLOMO_API_BASE = "https://flomoapp.com/api/v1";
const FLOMO_SECRET = "dbbc3dd73364b4084c3a69346e0ce2b2";
const FLOMO_API_KEY = "flomo_web";
const FLOMO_APP_VERSION = "2.0";


// 标签颜色池（10种）
const TAG_COLORS = [
    { bg: '#E3F2FD', color: '#1976D2', border: '#BBDEFB' },  // 蓝
    { bg: '#F3E5F5', color: '#7B1FA2', border: '#E1BEE7' },  // 紫
    { bg: '#E8F5E9', color: '#388E3C', border: '#C8E6C9' },  // 绿
    { bg: '#FFF3E0', color: '#F57C00', border: '#FFE0B2' },  // 橙
    { bg: '#FCE4EC', color: '#C2185B', border: '#F8BBD9' },  // 粉
    { bg: '#E0F7FA', color: '#0097A7', border: '#B2EBF2' },  // 青
    { bg: '#F9FBE7', color: '#AFB42B', border: '#E6EE9C' },  // 黄绿
    { bg: '#EFEBE9', color: '#5D4037', border: '#D7CCC8' },  // 棕
    { bg: '#E8EAF6', color: '#303F9F', border: '#C5CAE9' },  // 靛蓝
    { bg: '#FBE9E7', color: '#D84315', border: '#FFCCBC' },  // 深橙
];

// 类型颜色池（10种）
const TYPE_COLORS = [
    { bg: '#E3F2FD', color: '#1565C0' },  // 蓝
    { bg: '#F3E5F5', color: '#6A1B9A' },  // 紫
    { bg: '#E8F5E9', color: '#2E7D32' },  // 绿
    { bg: '#FFF3E0', color: '#EF6C00' },  // 橙
    { bg: '#FCE4EC', color: '#AD1457' },  // 粉
    { bg: '#E0F7FA', color: '#00838F' },  // 青
    { bg: '#F9FBE7', color: '#9E9D24' },  // 黄绿
    { bg: '#EFEBE9', color: '#4E342E' },  // 棕
    { bg: '#E8EAF6', color: '#283593' },  // 靛蓝
    { bg: '#FBE9E7', color: '#BF360C' },  // 深橙
];

// Writeathon API 配置
const WRITEATHON_API_BASE = "https://api.writeathon.cn";

const DEFAULT_NOTEBOOK_ID = "";

// SVG 图标
const ICONS = {
    shuoshuo: `<symbol id="iconShuoshuo" viewBox="0 0 1024 1024"><path d="M896 128H128c-35.3 0-64 28.7-64 64v640c0 35.3 28.7 64 64 64h768c35.3 0 64-28.7 64-64V192c0-35.3-28.7-64-64-64zM128 192h768v640H128V192z"/><path d="M256 384h512v64H256zM256 512h512v64H256zM256 640h320v64H256z"/><circle cx="768" cy="672" r="48"/></symbol>`,
    lightWord: `<symbol id="iconLightWord" viewBox="0 0 1024 1024"><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="4" stroke-width="64" d="M33.248 887.349h225.296l591.398-591.398c28.828-28.828 46.659-68.657 46.659-112.646 0-87.983-71.325-159.306-159.306-159.306-43.992 0-83.819 17.833-112.646 46.659l-591.398 591.398v225.296"/><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="4" stroke-width="64" d="M568.318 126.981l225.296 225.296"/><path fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round" stroke-miterlimit="4" stroke-width="64" d="M878.102 662.060l-112.646 168.971h225.296l-112.646 168.971"/></symbol>`,
    grid: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
    starOutline: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>`,
    random: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>`,
    setting: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    more: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    jump: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.75h7.2l4.8 4.8v11.7H6z"/><path d="M13 4v5h5"/><path d="M10 15h5"/><path d="M13 12l3 3-3 3"/></svg>`,
    sync: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>`,
    send: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    hash: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
    font: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
    at: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10h5v-2h-5c-4.34 0-8-3.66-8-8s3.66-8 8-8 8 3.66 8 8v1.43c0 .79-.71 1.57-1.5 1.57s-1.5-.78-1.5-1.57V12c0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5c1.38 0 2.64-.56 3.54-1.47.65.89 1.77 1.47 2.96 1.47 1.97 0 3.5-1.6 3.5-3.57V12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    moreH: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M8 4h8"/><path d="M9 4v6l-2 4"/><path d="M15 4v6l2 4"/><path d="M7 14h10"/></svg>`,
    pinOutline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M8 4h8"/><path d="M9 4v6l-2 4"/><path d="M15 4v6l2 4"/><path d="M7 14h10"/></svg>`,
    comment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M8 11h.01"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`
};

// ============ 轻语速记独立窗口管理类 ============
class QuickWindow {
    static instance = null;
    static creatingPromise = null;
    static windowIds = new Set();
    static LOCK_KEY = '__lumina_quick_lock__';
    static WINDOW_ID_KEY = '__lumina_quick_window_id__';

    static getInstance(plugin) {
        if (!QuickWindow.instance) {
            QuickWindow.instance = new QuickWindow(plugin);
        }
        return QuickWindow.instance;
    }

    // 创建后去重：扫描所有 Electron 窗口，关闭除第一个外的所有轻语速记窗口
    // 这是最后一道防线，不管前面多少层锁都失效，它也能把重复窗口关掉
    static deduplicateWindows() {
        setTimeout(() => {
            try {
                const { BrowserWindow } = require('@electron/remote');
                const all = BrowserWindow.getAllWindows();
                const targets = [];
                for (const w of all) {
                    try {
                        if (w.getTitle && w.getTitle() === '__lumina_quick__') {
                            targets.push(w);
                        }
                    } catch (e) {}
                }
                // 保留第一个，关闭其余所有重复窗口
                for (let i = 1; i < targets.length; i++) {
                    try {
                        if (!targets[i].isDestroyed()) {
                            targets[i].close();
                        }
                    } catch (e) {}
                }
                // 把存活窗口的 ID 写回 localStorage
                if (targets.length > 0 && targets[0] && !targets[0].isDestroyed()) {
                    localStorage.setItem(QuickWindow.WINDOW_ID_KEY, String(targets[0].id));
                } else {
                    localStorage.removeItem(QuickWindow.WINDOW_ID_KEY);
                }
            } catch (e) {
                console.error('轻语速记去重失败', e);
            }
        }, 50);
    }

    // localStorage 锁：尝试获取锁，带验证（防止竞态覆盖）
    static acquireLock() {
        const now = Date.now();
        const myId = Math.random().toString(36).slice(2) + '_' + now;
        const existing = localStorage.getItem(QuickWindow.LOCK_KEY);

        if (existing) {
            const [, time] = existing.split(':');
            if (now - parseInt(time) < 2000) {
                return { acquired: false, myId };
            }
        }

        localStorage.setItem(QuickWindow.LOCK_KEY, `${myId}:${now}`);

        // 验证：立即读回，确认没有被其他上下文覆盖
        const check = localStorage.getItem(QuickWindow.LOCK_KEY);
        if (check === `${myId}:${now}`) {
            return { acquired: true, myId };
        }
        return { acquired: false, myId };
    }

    static releaseLock() {
        localStorage.removeItem(QuickWindow.LOCK_KEY);
    }

    // 查找当前是否已有轻语速记窗口存在
    static findExistingWindow() {
        try {
            // 先检查 localStorage 中保存的窗口 ID
            const savedId = localStorage.getItem(QuickWindow.WINDOW_ID_KEY);
            if (savedId) {
                const { BrowserWindow } = require('@electron/remote');
                const w = BrowserWindow.fromId(parseInt(savedId));
                if (w && !w.isDestroyed()) {
                    return w;
                }
            }

            // 再检查静态集合
            const { BrowserWindow } = require('@electron/remote');
            for (const id of QuickWindow.windowIds) {
                const w = BrowserWindow.fromId(id);
                if (w && !w.isDestroyed()) {
                    return w;
                }
            }

            // 兜底：遍历所有窗口按标题匹配
            const all = BrowserWindow.getAllWindows();
            for (const w of all) {
                try {
                    if (w.getTitle && w.getTitle() === '__lumina_quick__') {
                        return w;
                    }
                } catch (e) {}
            }
        } catch (e) {
            console.error('查找轻语速记窗口失败', e);
        }
        return null;
    }

    constructor(plugin) {
        this.plugin = plugin;
        this.win = null;
        this.isCreating = false;
        this._isSaving = false;
        this.lastCreateTime = 0;
    }

    isOpen() {
        return !!(this.win && !this.win.isDestroyed() && this.win.isVisible());
    }

    async createWindow() {
        // 1) 时间锁：800ms 内快速拒绝
        const now = Date.now();
        if (now - this.lastCreateTime < 800) {
            return;
        }
        this.lastCreateTime = now;

        // 2) 内存级并发标志
        if (this.isCreating) {
            return;
        }

        // 3) localStorage 跨上下文锁
        const lock = QuickWindow.acquireLock();
        if (!lock.acquired) {
            // 被锁住了，尝试聚焦已有窗口
            const existing = QuickWindow.findExistingWindow();
            if (existing) {
                existing.focus();
            }
            return;
        }

        try {
            // 4) Promise 锁：如果另一个创建正在进行，等待它完成
            if (QuickWindow.creatingPromise) {
                try {
                    await QuickWindow.creatingPromise;
                } catch (e) {}
                const existing = QuickWindow.findExistingWindow();
                if (existing) {
                    existing.focus();
                    return;
                }
                return;
            }

            // 5) 再次确认没有已存在的窗口
            const existing = QuickWindow.findExistingWindow();
            if (existing) {
                this.win = existing;
                existing.focus();
                return;
            }

            // 6) 真正创建窗口
            QuickWindow.creatingPromise = this._doCreateWindow();
            await QuickWindow.creatingPromise;
        } finally {
            QuickWindow.creatingPromise = null;
            // 延迟释放锁，给创建后去重留出时间
            setTimeout(() => QuickWindow.releaseLock(), 300);
        }
    }

    async _doCreateWindow() {
        this.isCreating = true;
        try {
            const { BrowserWindow } = require('@electron/remote');

            // 获取锁之后再检查一次
            const doubleCheck = QuickWindow.findExistingWindow();
            if (doubleCheck) {
                this.win = doubleCheck;
                doubleCheck.focus();
                return;
            }

            this.win = new BrowserWindow({
                width: 520,
                height: 400,
                frame: false,
                alwaysOnTop: true,
                skipTaskbar: false,
                resizable: true,
                transparent: true,
                title: '__lumina_quick__',
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                    sandbox: false,
                },
                show: false,
            });

            // 立即保存窗口 ID 到 localStorage
            QuickWindow.windowIds.add(this.win.id);
            localStorage.setItem(QuickWindow.WINDOW_ID_KEY, String(this.win.id));

            const html = this.plugin.getQuickWindowHTML();
            await this.win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

            this.win.show();
            this.win.focus();

            // 启动创建后去重（最后一道防线）
            QuickWindow.deduplicateWindows();

            this.win.on('closed', () => {
                localStorage.removeItem(QuickWindow.WINDOW_ID_KEY);
                QuickWindow.windowIds.delete(this.win.id);
                this.win = null;
                QuickWindow.instance = null;
            });
        } catch (e) {
            console.error('创建轻语速记窗口失败', e);
            this.plugin.openQuickOverlay();
        } finally {
            this.isCreating = false;
        }
    }

    async saveAndClose() {
        if (!this.win || this.win.isDestroyed()) {
            this.win = null;
            QuickWindow.instance = null;
            return;
        }
        // 防重入：如果正在保存中，直接关闭窗口
        if (this._isSaving) {
            this.close();
            return;
        }
        this._isSaving = true;
        try {
            const content = await this.win.webContents.executeJavaScript('document.getElementById("editor")?.value || ""');
            const trimmed = (content || '').trim();
            if (trimmed) {
                await this.plugin.addQuickNote(trimmed);
            }
        } catch (e) {
            console.error('保存轻语速记内容失败', e);
        } finally {
            this._isSaving = false;
            this.close();
        }
    }

    close() {
        if (this.win && !this.win.isDestroyed()) {
            localStorage.removeItem(QuickWindow.WINDOW_ID_KEY);
            QuickWindow.windowIds.delete(this.win.id);
            this.win.close();
        }
    }
}

module.exports = class ShuoshuoPlugin extends Plugin {
    onload() {
        const frontEnd = getFrontend();
        this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        this.addIcons(ICONS.shuoshuo);
        this.addIcons(ICONS.lightWord);

        this.shuoshuos = [];
        this.assistantAvatarUrl = null;
        this.userAvatarUrl = null;
        this.notebookId = DEFAULT_NOTEBOOK_ID;
        this.autoSync = false;
        this.syncMode = 'dailynote'; // 'dailynote' 每日笔记, 'doc' 指定文档
        this.syncDocId = ''; // 指定文档ID（syncMode为doc时使用）
        this.dailyNotePathTemplate = ''; // daily note 路径模板（留空则使用笔记本默认配置）
        this.dailyNoteIconType = ''; // daily note 动态图标类型（留空则不设置图标）
        this.dailyNoteIconColorWeekday = ''; // 工作日图标颜色
        this.dailyNoteIconColorWeekend = ''; // 周末图标颜色
        this.viewStyle = 'list'; // 'list' 平铺, 'card' 卡片
        this.flomoConfig = { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '' };
        this.writeathonConfig = { token: '', userId: '', spaceId: '', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '' };
        this.memosConfig = { host: '', token: '', version: 'v2', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '' };
        this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG };
        this.reviewHistory = {}; // {noteId: timestamp} 记录每条笔记上次回顾时间
        this.selectedDate = null;
        this.selectedTag = null;
        this.filterQuery = null; // 检索式筛选：no-tag, has-image, has-link
        this.queryVisibility = { lifelog: false, 'no-tag': true, 'has-image': true, 'has-link': true, 'has-comment': false }; // 检索式可见性配置
        this.tagIcons = {}; // 标签图标映射 {tagName: emoji/icon}
        this.pinnedTags = []; // 置顶标签列表
        this.themeMode = DEFAULT_THEME_MODE; // 主题模式：original 或 siyuan 或 morandi
        this.morandiColor = MORANDI_COLORS[0].key; // 默认第一个莫兰迪配色
        this.fontSizeConfig = { ...DEFAULT_FONT_SIZE_CONFIG }; // 字体大小配置
        this.enterToSubmit = false; // 输入框回车直接提交
        this.showSidebarDock = false; // 是否显示侧边栏 Dock（默认不显示）
        this.showLifeLogRecords = false; // 是否显示读取到的 LifeLog 记录（默认不显示）
        this.compactMode = false; // 紧凑模式（默认关闭）
        this.bookshelfFontConfig = { ...DEFAULT_BOOKSHELF_FONT_CONFIG }; // 图书视图字体大小配置
        this.bookshelfSyncConfig = { ...DEFAULT_BOOKSHELF_SYNC_CONFIG }; // 图书视图同步配置
        this.autoCollapseLines = DEFAULT_AUTO_COLLAPSE_LINES; // 长笔记自动折叠行数
        this._refreshTimer = null; // 防抖刷新定时器
        this._boundBlockIdsCache = new Set(); // 已绑定块ID的缓存（用于快速查找）
        this._saveLocks = new Map(); // save/load 并发锁
        this._wsBroadcast = null;
        this._wsBroadcastReconnectTimer = null;
        this._wsBroadcastReconnectRetries = 0;
        this._wsBroadcastDestroyed = false;
        this.moments = []; // 朋友圈数据
        this.momentsConfig = { nickname: '', signature: '', avatar: null, cover: null, syncToSiyuan: false, syncNotebookId: '', syncMode: 'dailynote', syncDocId: '', dailyNotePathTemplate: '', fontSize: { mode: 'default', customSize: 14.5 } };
        this.books = []; // 图书书架数据
        this.bookshelfFilters = { type: 'all', sync: 'synced', status: 'read+reading', sort: 'time' };
        this.bookshelfSearch = '';
        this.bookshelfGroupByYear = true;
        this.bookshelfCurrentView = 'list';
        this.loadShuoshuos();
        this.loadConfig();
        // 异步加载朋友圈数据，确保切换时更丝滑
        this.loadMoments();
        // 异步加载图书数据
        this.loadBooks();

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
            langText: "打开轻语",
            hotkey: "⌥⌘S",
            callback: () => {
                this.openShuoshuoTab();
            }
        });

        // 全局快捷键唤起轻语速记窗口（toggle：第一次唤起，第二次保存并退出）
        // 注意：只注册 globalCallback，不注册 callback。
        // 若同时注册 callback + globalCallback，当与其他插件冲突时，
        // 思源笔记的事件系统可能同时触发两者，导致窗口被创建两次。
        const quickWindowCallback = () => {
            try {
                if (this.isMobile) {
                    showMessage('移动端不支持轻语速记窗口');
                    return;
                }
                const qw = QuickWindow.getInstance(this);
                // 如果窗口已打开，则保存内容并关闭（toggle 逻辑）
                if (qw.isOpen()) {
                    qw.saveAndClose();
                    return;
                }
                // 如果正在创建中，忽略重复触发
                if (qw.isCreating) {
                    return;
                }
                qw.createWindow();
            } catch (e) {
                console.error('打开轻语速记窗口失败', e);
            }
        };
        this.addCommand({
            langKey: "openQuickWindow",
            langText: "打开轻语速记窗口",
            hotkey: "⌥⌘U",
            // 只保留全局回调，避免与编辑器内 callback 重复触发
            globalCallback: quickWindowCallback
        });

        // 注册 IPC 监听器（只在思源主桌面窗口注册，避免独立窗口实例覆盖主界面的监听）
        if (frontEnd === "desktop") {
            try {
                const { ipcMain } = require('@electron/remote');
                const apiBaseUrl = window.location.origin;

                // 必须先清除所有旧 listener，再赋值 this._ipcSaveHandler
                // 否则 removeListener 可能因引用不对而失效，导致重复注册
                try { ipcMain.removeAllListeners('lumina-quick-save'); } catch (e) {}
                this._ipcSaveHandler = (event, data) => {
                    this.addQuickNote(data.content);
                };
                ipcMain.on('lumina-quick-save', this._ipcSaveHandler);

                this._ipcUploadHandler = async (event, data) => {
                    try {
                        const base64Response = await fetch(data.base64);
                        const blob = await base64Response.blob();
                        const file = new File([blob], data.name, { type: blob.type });
                        const formData = new FormData();
                        formData.append('assetsDirPath', '/assets/');
                        formData.append('file[]', file);
                        
                        const token = window.siyuan?.config?.api?.token || '';
                        const headers = {};
                        if (token) {
                            headers['Authorization'] = `Token ${token}`;
                        }
                        
                        const response = await fetch(apiBaseUrl + '/api/asset/upload', { method: 'POST', body: formData, headers });
                        const result = await response.json();
                        if (result.code === 0 && result.data.succMap && Object.keys(result.data.succMap).length > 0) {
                            return { success: true, url: Object.values(result.data.succMap)[0] };
                        }
                        return { success: false, error: result.msg || '上传失败' };
                    } catch (e) {
                        return { success: false, error: e.message };
                    }
                };
                try { ipcMain.removeHandler('lumina-quick-upload'); } catch (e) {}
                ipcMain.handle('lumina-quick-upload', this._ipcUploadHandler);

                this._ipcTagsHandler = (event) => {
                    return this.extractAllTags();
                };
                try { ipcMain.removeHandler('lumina-quick-tags'); } catch (e) {}
                ipcMain.handle('lumina-quick-tags', this._ipcTagsHandler);
            } catch (e) {
                console.log('注册 IPC 监听器失败', e);
            }
        }

        // ===== 思源 transaction 事件：实时同步块内容到属性 =====
        // 思源每次编辑操作都会触发 transaction 自定义事件
        // 注意：doOperations 中的 updateBlock 操作的 data 字段已经包含了最新 kramdown 内容，
        // 可以直接使用，无需再调用 getBlockKramdown API，减少一次网络往返
        this._transactionHandler = (e) => {
            try {
                const doOperations = e?.detail?.doOperations;
                if (!doOperations || !Array.isArray(doOperations)) return;
                
                // 收集所有需要同步的绑定块ID（使用Set去重）
                const blocksToSync = new Set();
                // 收集可能需要异步查询的块ID
                const needQueryIds = [];
                // 收集从事件中直接获取到的 kramdown 内容（key: blockId, value: kramdown）
                const eventKramdowns = {};
                
                for (const op of doOperations) {
                    if (!op.id) continue;
                    
                    // 处理多种操作类型：update、insert、delete、move等
                    const syncActions = ['update', 'insert', 'delete', 'move', 'append', 'prepend'];
                    if (!syncActions.includes(op.action)) continue;
                    
                    // 如果操作是 updateBlock 且包含 data（kramdown 内容），保存下来
                    if (op.action === 'update' && op.data && typeof op.data === 'string') {
                        eventKramdowns[op.id] = op.data;
                    }
                    
                    // 情况1：直接操作的是绑定的块
                    if (this._isBoundBlockId(op.id)) {
                        blocksToSync.add(op.id);
                        continue;
                    }
                    
                    // 情况2：操作的是绑定块的子元素（如列表项）
                    // 检查 parentId 是否是绑定的块
                    if (op.parentId && this._isBoundBlockId(op.parentId)) {
                        // 从子操作的 data 中提取 kramdown 存入父块
                        if (op.action === 'update' && op.data && typeof op.data === 'string') {
                            eventKramdowns[op.parentId] = op.data;
                        }
                        blocksToSync.add(op.parentId);
                        continue;
                    }
                    
                    // 情况2b：parentId 不是绑定块，但可能是列表容器，需要进一步检查祖父块
                    if (op.parentId) {
                        needQueryIds.push(op.parentId);
                    }
                    
                    // 情况3：检查 previousId 或 nextId
                    if (op.previousId) needQueryIds.push(op.previousId);
                    if (op.nextId) needQueryIds.push(op.nextId);
                }
                
                // 先同步已确认的绑定块（传入事件中提取的 kramdown 以跳过 API 调用）
                blocksToSync.forEach(blockId => {
                    this._debouncedSyncBoundAttr(blockId, eventKramdowns[blockId]);
                });
                
                // 异步查询其他可能的绑定块（处理列表项插入等情况）
                if (needQueryIds.length > 0) {
                    this._checkAndSyncBoundParents(needQueryIds);
                }
            } catch (e) {}
        };
        // 使用 document 和 window 同时监听，因为不同版本思源可能使用不同方式
        document.addEventListener('transaction', this._transactionHandler);
        window.addEventListener('transaction', this._transactionHandler);
        // console.log('[轻语] transaction 事件监听器已注册');

        // 备用：MutationObserver 监听编辑器 DOM 变化
        this._startMutationObserver();

        // ws-main 事件作为补充
        this._wsHandler = (event) => {
            try {
                const data = (event?.detail?.cmd !== undefined) ? event.detail : event;
                if (!data?.cmd) return;
                if (data.cmd === 'saved' || data.cmd === 'setblockattrs') {
                    this._handleBlockChange(data);
                }
            } catch (e) {}
        };
        this.eventBus.on('ws-main', this._wsHandler);

        // 直连思源 WebSocket 广播频道，获取丝滑的实时更新
        this._connectBroadcastWebSocket();

        console.log("Shuoshuo plugin loaded");
    }

    // ============ 数据保护：并发锁 + 备份恢复 ============
    async _withSaveLock(key, fn) {
        while (this._saveLocks.has(key)) {
            try { await this._saveLocks.get(key); } catch (e) {}
        }
        let resolve;
        const promise = new Promise(r => { resolve = r; });
        this._saveLocks.set(key, promise);
        try {
            return await fn();
        } finally {
            this._saveLocks.delete(key);
            resolve();
        }
    }

    async _backupData(key, backupKey) {
        try {
            const existing = await this.loadData(key);
            const hasData = Array.isArray(existing)
                ? existing.length > 0
                : (existing && Object.keys(existing).length > 0);
            if (hasData) {
                await this.saveData(backupKey, existing);
            }
        } catch (e) {
            // 忽略备份失败
        }
    }

    async _restoreFromBackup(key, backupKey) {
        try {
            const backup = await this.loadData(backupKey);
            const hasData = Array.isArray(backup)
                ? backup.length > 0
                : (backup && Object.keys(backup).length > 0);
            if (hasData) {
                await this.saveData(key, backup);
                return backup;
            }
        } catch (e) {
            // 忽略恢复失败
        }
        return null;
    }

    onLayoutReady() {
        const plugin = this;
        if (this.isMobile) {
            this.addDock({
                config: {
                    position: "LeftBottom",
                    icon: "iconLightWord",
                    title: "轻语",
                },
                type: "lumina_dock",
                init() {
                    this.element.innerHTML = `<div class="fn__flex-1 fn__flex-column" style="overflow:hidden;height:100%;"></div>`;
                    plugin.render(this.element.querySelector('div'));
                }
            });
            this.ensureMobileTopBarEntry();
            this._luminaMobileTopBarTimer = setTimeout(() => {
                this.ensureMobileTopBarEntry();
            }, 1000);
        } else {
            if (this.showSidebarDock) {
                this.addDock({
                    config: {
                        position: "RightBottom",
                        size: { width: 400, height: 0 },
                        icon: "iconLightWord",
                        title: "轻语",
                        hotkey: "⌥⌘D",
                    },
                    data: {},
                    type: "lumina_desktop_dock",
                    init: (dock) => {
                        const wrapper = document.createElement('div');
                        wrapper.className = 'fn__flex-1 fn__flex-column north-shuoshuo-dock-view';
                        wrapper.style.cssText = 'overflow:hidden;height:100%;';
                        dock.element.appendChild(wrapper);
                        this.render(wrapper);
                    },
                    show: () => {
                        this.loadShuoshuos();
                    },
                    destroy: () => {}
                });
            }

            this._luminaTopBarElement = this.addTopBar({
                icon: "iconLightWord",
                title: "轻语",
                position: "right",
                callback: () => {
                    this.openShuoshuoTab();
                }
            });
        }

        // 布局就绪后，异步刷新绑定的思源块数据
        setTimeout(() => {
            this.refreshBoundBlocks();
        }, 1000);

        // 在 onLayoutReady 中也触发一次数据加载（补充保障）
        // 主要数据刷新机制在 switchMainView 视图切换时已实现
    }

    ensureMobileTopBarEntry() {
        if (!this.isMobile || typeof this.addTopBar !== "function") return false;
        if (this._luminaTopBarElement instanceof HTMLElement && document.body?.contains(this._luminaTopBarElement)) {
            this.bindTopBarClickCapture(this._luminaTopBarElement);
            this.bindMobileTopBarDocumentCapture();
            return true;
        }

        const existing = this.deduplicateTopBarEntries();
        if (existing) {
            this._luminaTopBarElement = existing;
            this.bindTopBarClickCapture(existing);
            this.bindMobileTopBarDocumentCapture();
            return true;
        }

        try {
            this._luminaTopBarElement = this.addTopBar({
                icon: "iconLightWord",
                title: "轻语",
                position: "right",
                callback: () => {
                    this.openShuoshuoTab();
                }
            }) || null;
            this.bindTopBarClickCapture(this._luminaTopBarElement);
            this.bindMobileTopBarDocumentCapture();
            setTimeout(() => {
                const entry = this.deduplicateTopBarEntries();
                if (entry) this.bindTopBarClickCapture(entry);
                this.bindMobileTopBarDocumentCapture();
            }, 0);
            return this._luminaTopBarElement instanceof HTMLElement;
        } catch (e) {
            this._luminaTopBarElement = null;
            return false;
        }
    }

    getTopBarLookupSelector() {
        return '[aria-label="轻语"], [title="轻语"], [aria-label="Lumina"], [title="Lumina"]';
    }

    isManagedTopBarEntry(el) {
        if (!(el instanceof Element)) return false;
        if (this._luminaTopBarElement instanceof Element && el === this._luminaTopBarElement) return true;
        const label = String(el.getAttribute?.('aria-label') || el.getAttribute?.('title') || '').trim();
        if (label !== '轻语' && label !== 'Lumina') return false;
        if (el.closest?.('.layout-tab-bar, .layout-tab-bar__item, .layout-tab-container, .north-shuoshuo-container')) return false;
        if (el.closest?.('#toolbar, .toolbar, .toolbar__item, .topbar, .b3-menu, .b3-menu__item')) return true;
        const owner = el.closest?.('[id], [class]') || el;
        const ownerId = String(owner?.id || '').trim();
        const ownerCls = String(owner?.className?.baseVal || owner?.className || '').trim();
        return /(toolbar|topbar|menu)/i.test(`${ownerId} ${ownerCls}`);
    }

    getTopBarEntries() {
        try {
            const seen = new Set();
            const entries = [];
            if (this._luminaTopBarElement instanceof Element && document.body?.contains(this._luminaTopBarElement)) {
                entries.push(this._luminaTopBarElement);
                seen.add(this._luminaTopBarElement);
            }
            document.querySelectorAll(this.getTopBarLookupSelector()).forEach((el) => {
                if (!(el instanceof Element) || seen.has(el) || !this.isManagedTopBarEntry(el)) return;
                seen.add(el);
                entries.push(el);
            });
            return entries;
        } catch (e) {
            return [];
        }
    }

    deduplicateTopBarEntries() {
        const entries = this.getTopBarEntries();
        if (!entries.length) return null;
        const keeper = (this._luminaTopBarElement instanceof Element && entries.includes(this._luminaTopBarElement))
            ? this._luminaTopBarElement
            : entries[0];
        entries.forEach((el) => {
            if (!(el instanceof Element) || el === keeper) return;
            try { el.remove(); } catch (e) {}
        });
        return keeper;
    }

    bindTopBarClickCapture(topBarEl) {
        if (!(topBarEl instanceof Element)) return;
        if (this._luminaTopBarElement instanceof Element && this._luminaTopBarElement !== topBarEl && this._luminaTopBarClickCaptureHandler) {
            try { this._luminaTopBarElement.removeEventListener('click', this._luminaTopBarClickCaptureHandler, true); } catch (e) {}
        }
        this._luminaTopBarElement = topBarEl;
        if (!this._luminaTopBarClickCaptureHandler) {
            this._luminaTopBarClickCaptureHandler = (e) => {
                if (this._luminaTopBarClickInFlight) return;
                this._luminaTopBarClickInFlight = true;
                try {
                    e.preventDefault?.();
                    e.stopImmediatePropagation?.();
                    e.stopPropagation?.();
                    this.openShuoshuoTab();
                } finally {
                    setTimeout(() => {
                        this._luminaTopBarClickInFlight = false;
                    }, 0);
                }
            };
        }
        try { topBarEl.addEventListener('click', this._luminaTopBarClickCaptureHandler, true); } catch (e) {}
    }

    findMobileTopBarTriggerFromEventTarget(target) {
        let el = target instanceof Element ? target : null;
        let depth = 0;
        while (el && depth < 8) {
            if (el.closest?.('.north-shuoshuo-container')) return null;
            if (this._luminaTopBarElement instanceof Element && (this._luminaTopBarElement === el || this._luminaTopBarElement.contains?.(el))) {
                return this._luminaTopBarElement;
            }
            if (this.isManagedTopBarEntry(el)) return el;

            const menuItem = el.closest?.('.b3-menu__item');
            if (menuItem instanceof Element && !menuItem.closest?.('.north-shuoshuo-container')) {
                const commonMenu = menuItem.closest?.('#commonMenu.b3-menu');
                const commonMenuName = commonMenu instanceof Element ? String(commonMenu.getAttribute('data-name') || '') : '';
                if (commonMenu instanceof Element && commonMenuName !== 'topBarPlugin') return null;
                const label = String(
                    menuItem.getAttribute?.('aria-label') ||
                    menuItem.getAttribute?.('title') ||
                    menuItem.textContent ||
                    ''
                ).replace(/\s+/g, '').trim();
                if (label === '轻语' || label === 'Lumina') return menuItem;
            }

            el = el.parentElement;
            depth += 1;
        }
        try {
            const targetEl = target instanceof Element ? target : null;
            if (!targetEl) return null;
            return this.getTopBarEntries().find((entry) => entry instanceof Element && (entry === targetEl || entry.contains?.(targetEl))) || null;
        } catch (e) {}
        return null;
    }

    bindMobileTopBarDocumentCapture() {
        if (!this.isMobile) return;
        if (this._luminaTopBarDocumentCaptureHandler) return;
        this._luminaTopBarDocumentCaptureHandler = (e) => {
            if (this._luminaTopBarClickInFlight) return;
            const trigger = this.findMobileTopBarTriggerFromEventTarget(e?.target);
            if (!trigger) return;
            this._luminaTopBarClickInFlight = true;
            try {
                e.preventDefault?.();
                e.stopImmediatePropagation?.();
                e.stopPropagation?.();
                this.openShuoshuoTab();
            } finally {
                setTimeout(() => {
                    this._luminaTopBarClickInFlight = false;
                }, 0);
            }
        };
        try { document.addEventListener('click', this._luminaTopBarDocumentCaptureHandler, true); } catch (e) {}
    }

    removeTopBarEntry() {
        try {
            if (this._luminaTopBarElement instanceof Element && this._luminaTopBarClickCaptureHandler) {
                this._luminaTopBarElement.removeEventListener('click', this._luminaTopBarClickCaptureHandler, true);
            }
        } catch (e) {}
        try {
            if (this._luminaTopBarDocumentCaptureHandler) {
                document.removeEventListener('click', this._luminaTopBarDocumentCaptureHandler, true);
            }
        } catch (e) {}
        try {
            const entries = this.getTopBarEntries();
            entries.forEach((el) => {
                try {
                    const idx = Array.isArray(this.topBarIcons) ? this.topBarIcons.indexOf(el) : -1;
                    if (idx >= 0) this.topBarIcons.splice(idx, 1);
                    el.remove();
                } catch (e) {}
            });
        } catch (e) {}
        this._luminaTopBarElement = null;
        this._luminaTopBarClickCaptureHandler = null;
        this._luminaTopBarDocumentCaptureHandler = null;
    }

    onunload() {
        if (this._luminaMobileTopBarTimer) {
            clearTimeout(this._luminaMobileTopBarTimer);
            this._luminaMobileTopBarTimer = null;
        }
        this.removeTopBarEntry();

        // 关闭轻语速记独立窗口
        QuickWindow.getInstance(this).close();

        // 移除 IPC 监听器
        try {
            const { ipcMain } = require('@electron/remote');
            if (this._ipcSaveHandler) ipcMain.removeListener('lumina-quick-save', this._ipcSaveHandler);
            if (this._ipcUploadHandler) ipcMain.removeHandler('lumina-quick-upload');
            if (this._ipcTagsHandler) ipcMain.removeHandler('lumina-quick-tags');
        } catch (e) {
            // 忽略
        }

        // 移除 transaction 事件监听
        if (this._transactionHandler) {
            try { window.removeEventListener('transaction', this._transactionHandler); } catch (e) {}
            this._transactionHandler = null;
        }

        // 移除 ws-main 事件监听
        if (this._wsHandler) {
            try { this.eventBus.off('ws-main', this._wsHandler); } catch (e) {}
            this._wsHandler = null;
        }

        // 断开 WebSocket 广播连接
        this._disconnectBroadcastWebSocket();

        // 清理 per-block 防抖定时器
        if (this._refreshBlockTimers) {
            Object.values(this._refreshBlockTimers).forEach(t => clearTimeout(t));
            this._refreshBlockTimers = null;
        }

        // 断开 MutationObserver
        if (this._protyleObserver) {
            try { this._protyleObserver.disconnect(); } catch (e) {}
            this._protyleObserver = null;
        }
        if (this._toolbarObserver) {
            try { this._toolbarObserver.disconnect(); } catch (e) {}
            this._toolbarObserver = null;
        }
        if (this._shuoshuoToolbarObserver) {
            try { this._shuoshuoToolbarObserver.disconnect(); } catch (e) {}
            this._shuoshuoToolbarObserver = null;
        }

        // 清理移动端抽屉遮罩层
        document.querySelectorAll('.north-shuoshuo-drawer-overlay').forEach(el => el.remove());
        this.closeMobileShuoshuoDock();

        // 清除所有防抖定时器
        if (this._refreshTimer) {
            clearTimeout(this._refreshTimer);
            this._refreshTimer = null;
        }
        if (this._syncAttrTimer) {
            for (const key of Object.keys(this._syncAttrTimer)) {
                clearTimeout(this._syncAttrTimer[key]);
            }
            this._syncAttrTimer = null;
        }

        console.log("Shuoshuo plugin unloaded");
    }

    openShuoshuoTab() {
        if (this.isMobile) {
            this.openMobileShuoshuoDock();
            setTimeout(() => {
                this.loadShuoshuos();
            }, 500);
            return;
        }
        openTab({
            app: this.app,
            custom: {
                icon: "iconLightWord",
                title: "轻语",
                data: {},
                id: this.name + TAB_TYPE
            }
        });
        // 打开说说标签时，异步加载思源最新数据
        setTimeout(() => {
            this.loadShuoshuos();
        }, 500);
    }

    openMobileShuoshuoDock() {
        if (!this.isMobile) return false;
        try {
            this.captureSiyuanMobileDockState();
            let shell = document.querySelector('.north-shuoshuo-mobile-shell');
            if (!(shell instanceof HTMLElement)) {
                shell = document.createElement('div');
                shell.className = 'north-shuoshuo-mobile-shell';
                shell.style.cssText = 'position:fixed;inset:0;z-index:60000;display:flex;flex-direction:column;background:var(--b3-theme-background,#fff);color:var(--b3-theme-on-background,#202124);';
                shell.innerHTML = `
                    <div class="north-shuoshuo-mobile-shell__bar" style="height:44px;display:flex;align-items:center;gap:8px;padding:0 8px;border-bottom:1px solid var(--b3-theme-surface-lighter,#e5e5e5);flex:0 0 auto;background:var(--b3-theme-background,#fff);">
                        <button class="north-shuoshuo-mobile-shell__back" type="button" aria-label="返回" style="width:40px;height:40px;border:0;background:transparent;color:inherit;display:flex;align-items:center;justify-content:center;padding:0;">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                        </button>
                        <div class="north-shuoshuo-mobile-shell__title" style="font-size:16px;font-weight:600;line-height:1;">轻语</div>
                        <div class="north-shuoshuo-mobile-shell__spacer" style="flex:1;"></div>
                    </div>
                    <div class="north-shuoshuo-mobile-shell__body" style="flex:1;min-height:0;overflow:hidden;"></div>
                `;
                document.body.appendChild(shell);
                shell.querySelector('.north-shuoshuo-mobile-shell__back')?.addEventListener('click', () => {
                    this.closeMobileShuoshuoDock();
                });
            }
            const body = shell.querySelector('.north-shuoshuo-mobile-shell__body');
            if (!(body instanceof HTMLElement)) return false;
            shell.classList.add('show');
            document.body.classList.add('north-shuoshuo-mobile-shell-open');
            this.render(body);
            return true;
        } catch (e) {
            console.error("打开轻语移动端面板失败", e);
            return false;
        }
    }

    closeMobileShuoshuoDock() {
        try {
            const shell = document.querySelector('.north-shuoshuo-mobile-shell');
            if (shell instanceof HTMLElement) {
                shell.classList.remove('show');
                shell.remove();
            }
            document.body.classList.remove('north-shuoshuo-mobile-shell-open');
            if (this._toolbarObserver) {
                this._toolbarObserver.disconnect();
                this._toolbarObserver = null;
            }
            if (this._shuoshuoToolbarObserver) {
                this._shuoshuoToolbarObserver.disconnect();
                this._shuoshuoToolbarObserver = null;
            }
            document.querySelectorAll('#sidebar>.toolbar').forEach(el => {
                el.style.removeProperty('display');
            });
            this.restoreSiyuanMobileDockState();
            this.container = null;
        } catch (e) {}
    }

    isInMobileShell() {
        return !!(this.container instanceof Element && this.container.closest?.('.north-shuoshuo-mobile-shell'));
    }

    prepareNativeDialogAboveMobileShell() {
        if (!this.isMobile) return () => {};
        try {
            document.body.classList.add('north-shuoshuo-native-dialog-open');
            return () => {
                try { document.body.classList.remove('north-shuoshuo-native-dialog-open'); } catch (e) {}
            };
        } catch (e) {
            return () => {};
        }
    }

    confirmAboveMobileShell(title, message, onConfirm, onCancel, isDelete) {
        const restore = this.prepareNativeDialogAboveMobileShell();
        const done = (callback) => async (dialog) => {
            try {
                if (callback) await callback(dialog);
            } finally {
                restore();
            }
        };
        return confirm(title, message, done(onConfirm), done(onCancel), isDelete);
    }

    captureSiyuanMobileDockState() {
        if (!this.isMobile || this._luminaMobileDockState) return;
        try {
            const sidebar = document.getElementById("sidebar");
            const toolbarIcons = Array.from(sidebar?.querySelectorAll(".toolbar--border .toolbar__icon") || []);
            const panels = Array.from(sidebar?.lastElementChild?.children || []);
            const pluginPanel = sidebar?.lastElementChild?.querySelector('[data-type="sidebar-plugin"]');
            const ignoreEmptyPluginPanel = this.isEmptySiyuanMobilePluginPanel(pluginPanel);
            this._luminaMobileDockState = {
                activeTypes: toolbarIcons
                    .filter((el) => el.classList.contains("toolbar__icon--active"))
                    .map((el) => el.querySelector("svg")?.getAttribute("data-type") || "")
                    .filter((type) => !(ignoreEmptyPluginPanel && type === "sidebar-plugin-tab"))
                    .filter(Boolean),
                panelStates: panels.map((el) => ({
                    type: el.getAttribute("data-type") || "",
                    hidden: ignoreEmptyPluginPanel && el.getAttribute("data-type") === "sidebar-plugin"
                        ? true
                        : el.classList.contains("fn__none"),
                })),
            };
        } catch (e) {
            this._luminaMobileDockState = null;
        }
    }

    restoreSiyuanMobileDockState() {
        if (!this.isMobile) return;
        try {
            const state = this._luminaMobileDockState;
            this._luminaMobileDockState = null;
            if (!state) {
                this.closeEmptySiyuanMobilePluginPanel();
                return;
            }
            const sidebar = document.getElementById("sidebar");
            const toolbar = sidebar?.querySelector(".toolbar--border");
            const panelsRoot = sidebar?.lastElementChild;
            toolbar?.querySelectorAll(".toolbar__icon").forEach((el) => {
                const type = el.querySelector("svg")?.getAttribute("data-type") || "";
                if (state.activeTypes.includes(type)) {
                    el.classList.add("toolbar__icon--active");
                } else {
                    el.classList.remove("toolbar__icon--active");
                }
            });
            state.panelStates.forEach((item) => {
                if (!item.type) return;
                const panel = panelsRoot?.querySelector(`[data-type="${item.type}"]`);
                if (!(panel instanceof Element)) return;
                if (item.hidden) {
                    panel.classList.add("fn__none");
                } else {
                    panel.classList.remove("fn__none");
                }
            });
            this.closeEmptySiyuanMobilePluginPanel();
            const visiblePanels = panelsRoot ? Array.from(panelsRoot.children).filter((el) => !el.classList.contains("fn__none")) : [];
            if (!visiblePanels.length) {
                this.closeEmptySiyuanMobilePluginPanel();
            }
        } catch (e) {}
    }

    isEmptySiyuanMobilePluginPanel(pluginPanel) {
        return pluginPanel instanceof HTMLElement
            && !!pluginPanel.querySelector('.b3-list--empty')
            && !pluginPanel.querySelector('.north-shuoshuo-container')
            && !pluginPanel.querySelector('#tomato-reminder-dock-content');
    }

    closeEmptySiyuanMobilePluginPanel() {
        if (!this.isMobile) return;
        try {
            const sidebar = document.getElementById("sidebar");
            const toolbar = sidebar?.querySelector(".toolbar--border");
            const panelsRoot = sidebar?.lastElementChild;
            const pluginTab = toolbar?.querySelector('svg[data-type="sidebar-plugin-tab"]')?.closest(".toolbar__icon");
            const pluginPanel = panelsRoot?.querySelector('[data-type="sidebar-plugin"]');
            const isEmptyPluginPanel = this.isEmptySiyuanMobilePluginPanel(pluginPanel);

            if (isEmptyPluginPanel) {
                if (pluginTab instanceof Element) pluginTab.classList.remove("toolbar__icon--active");
                pluginPanel.classList.add("fn__none");
            }
        } catch (e) {}
    }

    // 打开轻语速记浮层（复用说说输入框功能）
    openQuickOverlay() {
        const existing = document.querySelector('.north-shuoshuo-quick-overlay');
        if (existing) {
            const input = existing.querySelector('#quick-overlay-input');
            const text = input?.value?.trim();
            if (text) {
                this.addQuickNote(text);
            }
            existing.remove();
            return;
        }

        const overlay = document.createElement('div');
        const themeClass = `theme-${this.themeMode || 'original'}`;
        const morandiClass = this.themeMode === 'morandi' && this.morandiColor ? ` morandi-${this.morandiColor}` : '';
        overlay.className = `north-shuoshuo-quick-overlay ${themeClass}${morandiClass}`;
        overlay.innerHTML = `
            <div class="north-shuoshuo-quick-overlay-content" id="quick-overlay-panel">
                <div class="quick-overlay-header" id="quick-overlay-header">轻语速记</div>
                <div class="quick-overlay-body">
                    <textarea id="quick-overlay-input" placeholder="记录此刻的想法..."></textarea>
                </div>
                <div class="quick-overlay-toolbar">
                    <div class="quick-overlay-toolbar-left">
                        <span class="quick-overlay-toolbar-icon" data-action="tag" title="标签">#</span>
                        <span class="quick-overlay-toolbar-icon" data-action="image" title="图片">${ICONS.image}</span>
                        <span class="quick-overlay-toolbar-icon" data-action="task" title="任务列表">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="10.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="16.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 6h12v1.5H9zm0 6h12v1.5H9zm0 6h12v1.5H9z"/></svg>
                        </span>
                        <span class="quick-overlay-toolbar-icon" data-action="ul" title="无序列表">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                        </span>
                        <span class="quick-overlay-toolbar-icon" data-action="ol" title="有序列表">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6h2v2H2V6zm4 0h14v2H6V6zM2 11h2v2H2v-2zm4 0h14v2H6v-2zM2 16h2v2H2v-2zm4 0h14v2H6v-2z"/></svg>
                        </span>
                        <span class="quick-overlay-toolbar-icon" data-action="mention" title="引用笔记">${ICONS.at}</span>
                    </div>
                    <div class="quick-overlay-toolbar-right">
                        <button class="quick-overlay-btn" id="quick-overlay-close">关闭</button>
                        <button class="quick-overlay-btn primary" id="quick-overlay-save">保存</button>
                    </div>
                </div>
            </div>
        `;


        document.body.appendChild(overlay);

        const input = overlay.querySelector('#quick-overlay-input');
        const panel = overlay.querySelector('#quick-overlay-panel');
        const header = overlay.querySelector('#quick-overlay-header');

        // 拖动功能
        let isDragging = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        // 初始化位置（去掉 transform，改用 left/top）
        const initLeft = Math.max(20, (window.innerWidth - 520) / 2);
        const initTop = Math.max(20, (window.innerHeight - 360) / 2);
        panel.style.left = initLeft + 'px';
        panel.style.top = initTop + 'px';
        panel.style.transform = 'none';

        const onMouseMove = (e) => {
            if (!isDragging) return;
            panel.style.left = (e.clientX - dragOffsetX) + 'px';
            panel.style.top = (e.clientY - dragOffsetY) + 'px';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move';
            }
        };

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffsetX = e.clientX - panel.offsetLeft;
            dragOffsetY = e.clientY - panel.offsetTop;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // 清理函数
        const cleanup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            overlay.remove();
        };

        // 输入监听
        input.addEventListener('input', () => {
            this.handleMentionInput(input);
        });
        
        // 粘贴图片
        input.addEventListener('paste', (e) => {
            this.handlePasteImage(e, input);
        });

        // 键盘事件
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.enterToSubmit && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                doSave();
                return;
            }

            if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                const cursorPos = input.selectionStart;
                const value = input.value;
                const beforeCursor = value.substring(0, cursorPos);
                const afterCursor = value.substring(cursorPos);
                const lines = beforeCursor.split('\n');
                const currentLine = lines[lines.length - 1];

                const unorderedMatch = currentLine.match(/^(•\s|-\s(?!\[)|\*\s)(.*)$/);
                const taskMatch = currentLine.match(/^(- \[[ x]\]\s?)(.*)$/);
                const orderedMatch = currentLine.match(/^(\d+)\.\s(.*)$/);

                if (taskMatch) {
                    if (!taskMatch[2].trim()) {
                        e.preventDefault();
                        lines[lines.length - 1] = '';
                        input.value = lines.join('\n') + '\n' + afterCursor;
                        const newPos = lines.join('\n').length + 1;
                        input.setSelectionRange(newPos, newPos);
                        return;
                    }
                    e.preventDefault();
                    const newLine = '\n' + taskMatch[1];
                    input.value = beforeCursor + newLine + afterCursor;
                    input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                    return;
                }

                if (unorderedMatch) {
                    if (!unorderedMatch[2].trim()) {
                        e.preventDefault();
                        lines[lines.length - 1] = '';
                        input.value = lines.join('\n') + '\n' + afterCursor;
                        const newPos = lines.join('\n').length + 1;
                        input.setSelectionRange(newPos, newPos);
                        return;
                    }
                    e.preventDefault();
                    const newLine = '\n' + unorderedMatch[1];
                    input.value = beforeCursor + newLine + afterCursor;
                    input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                    return;
                }

                if (orderedMatch) {
                    if (!orderedMatch[2].trim()) {
                        e.preventDefault();
                        lines[lines.length - 1] = '';
                        input.value = lines.join('\n') + '\n' + afterCursor;
                        const newPos = lines.join('\n').length + 1;
                        input.setSelectionRange(newPos, newPos);
                        return;
                    }
                    e.preventDefault();
                    const nextNum = parseInt(orderedMatch[1]) + 1;
                    const newLine = '\n' + nextNum + '. ';
                    input.value = beforeCursor + newLine + afterCursor;
                    input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                    return;
                }
            }

            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                doSave();
            }
        });

        // 工具栏事件
        overlay.querySelector('[data-action="tag"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTagPicker(input);
        });
        overlay.querySelector('[data-action="image"]').addEventListener('click', () => {
            this.insertImage(input);
        });
        overlay.querySelector('[data-action="task"]').addEventListener('click', () => {
            this.insertText(input, '- [ ] ', '');
            input.focus();
        });
        overlay.querySelector('[data-action="ul"]').addEventListener('click', () => {
            this.insertText(input, '- ', '');
            input.focus();
        });
        overlay.querySelector('[data-action="ol"]').addEventListener('click', () => {
            const lines = input.value.substring(0, input.selectionStart).split('\n');
            const currentLine = lines[lines.length - 1];
            const match = currentLine.match(/^(\d+)\.\s/);
            const num = match ? parseInt(match[1]) + 1 : 1;
            this.insertText(input, num + '. ', '');
            input.focus();
        });
        overlay.querySelector('[data-action="mention"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMentionPicker(input);
        });

        // 保存
        const doSave = async () => {
            const text = input.value.trim();
            if (!text) return;
            const processed = text.replace(/lumina:\/\/memo\/([a-zA-Z0-9]+)/g, '[MEMO:$1]');
            const tags = this.extractTags(processed);
            const shuoshuo = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                content: processed,
                tags: tags,
                pinned: false,
                created: Date.now(),
                updated: Date.now()
            };
            this.shuoshuos.unshift(shuoshuo);
            await this.saveShuoshuos();
            if (this.autoSync) {
                await this.appendToDailyNote(processed, shuoshuo.created);
            }
            this.refreshMountedShuoshuoViews();
            showMessage('已保存到轻语');
            // 保存后清空输入框并聚焦，窗口保持打开
            input.value = '';
            input.focus();
        };
        overlay.querySelector('#quick-overlay-save').addEventListener('click', doSave);

        // 关闭按钮
        overlay.querySelector('#quick-overlay-close').addEventListener('click', cleanup);

        input.focus();
    }

    // 打开/聚焦轻语速记窗口
    openQuickWindow() {
        if (this.isMobile) {
            showMessage('移动端不支持轻语速记窗口');
            return;
        }
        QuickWindow.getInstance(this).createWindow();
    }

    // 构建轻语速记窗口的 HTML
    getQuickWindowHTML() {
        const notesJson = JSON.stringify(this.shuoshuos.map(n => ({
            id: n.id,
            content: (n.content || '').split('\n')[0].substring(0, 60),
            created: n.created
        })));
        const tagsJson = JSON.stringify(this.extractAllTags());

        // 根据插件主题模式计算颜色变量
        const themeMode = this.themeMode || 'original';
        const morandiColor = this.morandiColor;
        let primaryColor, bgColor, textColor, borderColor, placeholderColor;
        let toolBtnText, toolBtnHover, btnCloseText, btnCloseHover;
        let pickerBg, pickerBorder, pickerText, pickerHover, pickerPlaceholder;

        if (themeMode === 'original') {
            primaryColor = '#00B96B';
            bgColor = '#FFFFFF';
            textColor = '#262626';
            borderColor = '#F0F0F0';
            placeholderColor = '#BFBFBF';
            toolBtnText = '#8C8C8C';
            toolBtnHover = '#F5F5F5';
            btnCloseText = '#8C8C8C';
            btnCloseHover = '#F5F5F5';
            pickerBg = '#fff';
            pickerBorder = '#e8e8e8';
            pickerText = '#555';
            pickerHover = '#f5f5f5';
            pickerPlaceholder = '#999';
        } else if (themeMode === 'siyuan') {
            const computed = window.getComputedStyle(document.documentElement);
            primaryColor = computed.getPropertyValue('--b3-theme-primary').trim() || '#00B96B';
            bgColor = computed.getPropertyValue('--b3-theme-background').trim() || '#FFFFFF';
            textColor = computed.getPropertyValue('--b3-theme-on-background').trim() || '#262626';
            borderColor = computed.getPropertyValue('--b3-border-color').trim() || '#F0F0F0';
            placeholderColor = computed.getPropertyValue('--b3-theme-on-surface-light').trim() || '#BFBFBF';
            toolBtnText = computed.getPropertyValue('--b3-theme-on-surface-light').trim() || '#8C8C8C';
            toolBtnHover = computed.getPropertyValue('--b3-list-hover').trim() || '#F5F5F5';
            btnCloseText = computed.getPropertyValue('--b3-theme-on-surface-light').trim() || '#8C8C8C';
            btnCloseHover = computed.getPropertyValue('--b3-list-hover').trim() || '#F5F5F5';
            pickerBg = computed.getPropertyValue('--b3-theme-surface').trim() || '#fff';
            pickerBorder = computed.getPropertyValue('--b3-border-color').trim() || '#e8e8e8';
            pickerText = computed.getPropertyValue('--b3-theme-on-surface').trim() || '#555';
            pickerHover = computed.getPropertyValue('--b3-list-hover').trim() || '#f5f5f5';
            pickerPlaceholder = computed.getPropertyValue('--b3-theme-on-surface-light').trim() || '#999';
        } else if (themeMode === 'morandi') {
            const color = MORANDI_COLORS.find(c => c.key === morandiColor) || MORANDI_COLORS[0];
            primaryColor = color.color;
            bgColor = color.bg;
            textColor = '#262626';
            borderColor = '#F0F0F0';
            placeholderColor = '#BFBFBF';
            toolBtnText = '#8C8C8C';
            toolBtnHover = '#F5F5F5';
            btnCloseText = '#8C8C8C';
            btnCloseHover = '#F5F5F5';
            pickerBg = '#fff';
            pickerBorder = '#e8e8e8';
            pickerText = '#555';
            pickerHover = '#f5f5f5';
            pickerPlaceholder = '#999';
        }

        // 字体大小
        let fontSize;
        switch (this.fontSizeConfig.mode) {
            case 'siyuan':
                fontSize = 'var(--b3-font-size-editor)';
                break;
            case 'custom':
                fontSize = `${this.fontSizeConfig.customSize || 14.5}px`;
                break;
            default:
                fontSize = '14.5px';
        }

        const baseUrl = window.location.origin;
        const token = window.siyuan?.config?.api?.token || '';

        return `<!DOCTYPE html>
<html data-theme="${themeMode}">
<head>
<meta charset="UTF-8">
<style>
:root {
    --primary-color: ${primaryColor};
    --card-bg: ${bgColor};
    --card-text: ${textColor};
    --card-border: ${borderColor};
    --placeholder-color: ${placeholderColor};
    --tool-btn-text: ${toolBtnText};
    --tool-btn-hover: ${toolBtnHover};
    --btn-close-text: ${btnCloseText};
    --btn-close-hover: ${btnCloseHover};
    --picker-bg: ${pickerBg};
    --picker-border: ${pickerBorder};
    --picker-text: ${pickerText};
    --picker-hover: ${pickerHover};
    --picker-placeholder: ${pickerPlaceholder};
    --font-size: ${fontSize};
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: transparent;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}
.quick-note-card {
    width: 100%;
    height: 100%;
    background: var(--card-bg);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
}
.card-header {
    padding: 24px 28px 0 28px;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
    gap: 12px;
}
.header-icon {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
}
.header-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--card-text);
    letter-spacing: -0.2px;
}
.card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px 28px 0 28px;
    min-height: 0;
}
.editor-area {
    flex: 1;
    width: 100%;
    min-height: 0;
    border: none;
    padding: 16px 4px;
    font-size: var(--font-size);
    line-height: 1.8;
    color: var(--card-text);
    background: transparent;
    resize: none;
    outline: none;
    transition: all 0.2s ease;
    font-family: inherit;
}
.editor-area::placeholder {
    color: var(--placeholder-color);
    font-size: var(--font-size);
}
.divider {
    height: 1px;
    background: var(--card-border);
    margin: 0 28px;
}
.card-footer {
    padding: 12px 28px 16px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.toolbar {
    display: flex;
    gap: 4px;
}
.tool-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tool-btn-text);
    font-size: 15px;
    transition: all 0.2s ease;
    position: relative;
}
.tool-btn:hover {
    background: var(--tool-btn-hover);
    color: var(--card-text);
}
.tool-btn:active {
    transform: scale(0.95);
}
.tool-btn .tooltip {
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    background: var(--tooltip-bg);
    color: white;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
    font-weight: 500;
}
.tool-btn:hover .tooltip {
    opacity: 1;
    visibility: visible;
}
.action-btns {
    display: flex;
    gap: 8px;
}
.btn {
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-close {
    background: transparent;
    color: var(--btn-close-text);
}
.btn-close:hover {
    background: var(--btn-close-hover);
    color: var(--card-text);
}
.btn-save {
    background: var(--primary-color);
    color: white;
}
.btn-save:hover {
    opacity: 0.9;
}
.btn-save:active {
    transform: scale(0.98);
}
/* 保留的 tag-picker 和 mention-picker 样式 */
.tag-picker {
    position: fixed;
    background: var(--picker-bg);
    border: 1px solid var(--picker-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    max-height: 240px;
    overflow-y: auto;
    z-index: 99999;
    width: 260px;
    padding: 8px 0;
}
.tag-picker-input-wrapper {
    display: flex;
    align-items: center;
    padding: 0 12px 6px;
    border-bottom: 1px solid var(--picker-border);
    margin-bottom: 4px;
}
.tag-picker-prefix {
    color: var(--picker-placeholder);
    font-size: 14px;
    margin-right: 4px;
}
.tag-picker-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13px;
    padding: 4px 0;
    color: var(--picker-text);
    background: transparent;
    font-family: inherit;
}
.tag-picker-item {
    padding: 7px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--picker-text);
}
.tag-picker-item:hover, .tag-picker-item.selected {
    background: var(--picker-hover);
}
.tag-picker-create {
    border-top: 1px dashed var(--picker-border);
    margin-top: 2px;
    padding-top: 7px;
}
.tag-picker-create-hint {
    font-size: 11px;
    color: var(--picker-placeholder);
    margin-right: 6px;
}
.tag-picker-empty {
    padding: 12px;
    font-size: 13px;
    color: var(--picker-placeholder);
    text-align: center;
}
.mention-picker {
    position: fixed;
    background: var(--picker-bg);
    border: 1px solid var(--picker-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    max-height: 240px;
    overflow-y: auto;
    z-index: 99999;
    width: 280px;
}
.mention-search {
    padding: 8px 12px;
    border-bottom: 1px solid var(--picker-border);
    font-size: 12px;
    color: var(--picker-placeholder);
    background: transparent;
}
.mention-item {
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--picker-text);
    border-bottom: 1px solid var(--picker-border);
}
.mention-item:hover, .mention-item.selected {
    background: var(--picker-hover);
}
.mention-item:last-child {
    border-bottom: none;
}
.mention-item.hidden {
    display: none;
}
.mention-date {
    font-size: 11px;
    color: var(--picker-placeholder);
    margin-bottom: 2px;
}
</style>
</head>
<body>
<div class="quick-note-card">
    <div class="card-header">
        <div class="header-icon">✎</div>
        <div class="header-title">轻语速记</div>
    </div>
    <div class="card-body">
        <textarea class="editor-area" id="editor" placeholder="记录此刻的想法..." spellcheck="false"></textarea>
    </div>
    <div class="divider"></div>
    <div class="card-footer">
        <div class="toolbar">
            <button class="tool-btn" id="btn-tag">
                <span style="font-weight:600;">#</span>
                <span class="tooltip">标签</span>
            </button>
            <button class="tool-btn" id="btn-image">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span class="tooltip">图片</span>
            </button>
            <button class="tool-btn" id="btn-task">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="4" height="4" rx="1"/>
                    <rect x="3" y="11" width="4" height="4" rx="1"/>
                    <rect x="3" y="17" width="4" height="4" rx="1"/>
                    <line x1="10" y1="7" x2="21" y2="7"/>
                    <line x1="10" y1="13" x2="21" y2="13"/>
                    <line x1="10" y1="19" x2="21" y2="19"/>
                </svg>
                <span class="tooltip">任务列表</span>
            </button>
            <button class="tool-btn" id="btn-ul">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="10" y1="6" x2="21" y2="6"/>
                    <line x1="10" y1="12" x2="21" y2="12"/>
                    <line x1="10" y1="18" x2="21" y2="18"/>
                    <line x1="4" y1="6" x2="4" y2="6.01"/>
                    <line x1="4" y1="12" x2="4" y2="12.01"/>
                    <line x1="4" y1="18" x2="4" y2="18.01"/>
                </svg>
                <span class="tooltip">无序列表</span>
            </button>
            <button class="tool-btn" id="btn-ol">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span class="tooltip">有序列表</span>
            </button>
            <button class="tool-btn" id="btn-at">
                <span style="font-weight:600;">@</span>
                <span class="tooltip">提及</span>
            </button>
        </div>
        <div class="action-btns">
            <button class="btn btn-close" id="btn-close">取消</button>
            <button class="btn btn-save" id="btn-save">保存</button>
        </div>
    </div>
</div>

<script>
const { ipcRenderer } = require('electron');
const BASE_URL = '${baseUrl}';
const SIYUAN_TOKEN = '${token}';
const ENTER_TO_SUBMIT = ${this.enterToSubmit ? 'true' : 'false'};
const editor = document.getElementById('editor');
editor.focus();

const NOTES = ${notesJson};
let ALL_TAGS = ${tagsJson};
let tagPicker = null;
let mentionPicker = null;

// 异步刷新标签列表（获取最新数据）
ipcRenderer.invoke('lumina-quick-tags').then(tags => {
    if (tags && tags.length > 0) {
        ALL_TAGS = tags;
    }
}).catch(() => {});

function insertTextAtCursor(before, after) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selected = text.substring(start, end);
    editor.value = text.substring(0, start) + before + selected + after + text.substring(end);
    const newPos = start + before.length + selected.length;
    editor.setSelectionRange(newPos, newPos);
    editor.focus();
}

function insertText(text) {
    insertTextAtCursor(text, '');
}

// 标签选择器
document.getElementById('btn-tag').addEventListener('click', (e) => {
    e.stopPropagation();
    showTagPicker();
});

function showTagPicker() {
    if (tagPicker) { tagPicker.remove(); tagPicker = null; return; }
    tagPicker = document.createElement('div');
    tagPicker.className = 'tag-picker';
    const rect = document.getElementById('btn-tag').getBoundingClientRect();
    tagPicker.style.left = rect.left + 'px';
    // 先隐藏并插入文档以测量实际高度，再向上定位（工具栏在窗口底部，向下会被截断）
    tagPicker.style.visibility = 'hidden';

    tagPicker.innerHTML = \`
        <div class="tag-picker-input-wrapper">
            <span class="tag-picker-prefix">#</span>
            <input type="text" class="tag-picker-input" placeholder="选择或创建标签..." autocomplete="off">
        </div>
        <div class="tag-picker-list"></div>
    \`;
    document.body.appendChild(tagPicker);

    const pickerInput = tagPicker.querySelector('.tag-picker-input');
    const pickerList = tagPicker.querySelector('.tag-picker-list');

    function renderList(value) {
        const v = (value || '').trim().toLowerCase();
        let html = '';
        const filtered = v ? ALL_TAGS.filter(t => t.toLowerCase().includes(v)) : ALL_TAGS;
        const isNew = v && !ALL_TAGS.some(t => t.toLowerCase() === v);
        if (isNew) {
            html += \`<div class="tag-picker-item tag-picker-create" data-tag="\${v}"><span class="tag-picker-create-hint">创建标签</span><span class="tag-picker-item-name">#\${v}</span></div>\`;
        }
        html += filtered.map(tag => \`<div class="tag-picker-item" data-tag="\${tag}"><span class="tag-picker-item-name">\${tag}</span></div>\`).join('');
        if (!html) html = '<div class="tag-picker-empty">输入创建新标签</div>';
        pickerList.innerHTML = html;
    }

    // 先渲染列表内容，再测量实际高度并定位
    renderList();
    const height = tagPicker.offsetHeight;
    tagPicker.style.top = (rect.top - height - 6) + 'px';
    tagPicker.style.visibility = 'visible';
    pickerInput.focus();

    pickerInput.addEventListener('input', () => renderList(pickerInput.value));
    pickerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const v = pickerInput.value.trim();
            if (v) { insertTag(v); tagPicker.remove(); tagPicker = null; }
        } else if (e.key === 'Escape') {
            tagPicker.remove(); tagPicker = null;
        }
    });

    pickerList.addEventListener('click', (ev) => {
        const item = ev.target.closest('.tag-picker-item');
        if (item) { insertTag(item.dataset.tag); tagPicker.remove(); tagPicker = null; }
    });

    setTimeout(() => {
        document.addEventListener('click', function closeOnClick(ev) {
            if (!tagPicker) return;
            if (!tagPicker.contains(ev.target) && !ev.target.closest('#btn-tag')) {
                tagPicker.remove(); tagPicker = null;
                document.removeEventListener('click', closeOnClick);
            }
        });
    }, 0);
}

function insertTag(tag) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const needsHash = before.length === 0 || before.endsWith(' ') || before.endsWith('\\n');
    const tagText = needsHash ? '#' + tag + ' ' : tag + ' ';
    editor.value = before + tagText + after;
    editor.setSelectionRange(start + tagText.length, start + tagText.length);
    editor.focus();
}

// 图片上传
document.getElementById('btn-image').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (!file) { document.body.removeChild(fileInput); return; }
        if (!file.type.startsWith('image/')) { alert('请选择图片文件'); document.body.removeChild(fileInput); return; }
        try {
            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);
            const headers = {};
            if (SIYUAN_TOKEN) {
                headers['Authorization'] = 'Token ' + SIYUAN_TOKEN;
            }
            const response = await fetch(BASE_URL + '/api/asset/upload', { method: 'POST', body: formData, headers });
            const result = await response.json();
            if (result.code === 0) {
                const succMap = result.data.succMap;
                const newPath = succMap[file.name];
                if (newPath) {
                    const imgPath = newPath.startsWith('/') ? newPath.substring(1) : newPath;
                    insertTextAtCursor(\`![图片](\${imgPath})\`, '');
                    editor.focus();
                }
            } else {
                alert('上传失败：' + (result.msg || '未知错误'));
            }
        } catch (err) {
            alert('上传失败：' + err.message);
        } finally {
            if (fileInput.parentNode) document.body.removeChild(fileInput);
        }
    };
    fileInput.click();
});

// 任务列表
document.getElementById('btn-task').addEventListener('click', () => {
    insertTextAtCursor('- [ ] ', '');
    editor.focus();
});

// 无序列表
document.getElementById('btn-ul').addEventListener('click', () => {
    insertTextAtCursor('- ', '');
    editor.focus();
});

// 有序列表
document.getElementById('btn-ol').addEventListener('click', () => {
    const lines = editor.value.substring(0, editor.selectionStart).split('\\n');
    const currentLine = lines[lines.length - 1];
    const match = currentLine.match(/^(\\d+)\\.\\s/);
    const num = match ? parseInt(match[1]) + 1 : 1;
    insertTextAtCursor(num + '. ', '');
    editor.focus();
});

// @ 引用
document.getElementById('btn-at').addEventListener('click', (e) => {
    e.stopPropagation();
    showMentionPicker();
});

function showMentionPicker(triggerPos) {
    if (mentionPicker) { mentionPicker.remove(); mentionPicker = null; }
    const pos = triggerPos !== undefined ? triggerPos : editor.selectionStart;
    let atPos = pos;
    if (triggerPos === undefined) {
        const value = editor.value;
        if (value.substring(pos - 1, pos) !== '@') {
            editor.value = value.substring(0, pos) + '@' + value.substring(pos);
            editor.setSelectionRange(pos + 1, pos + 1);
            atPos = pos;
        } else {
            atPos = pos - 1;
        }
    }
    mentionPicker = document.createElement('div');
    mentionPicker.className = 'mention-picker';
    const rect = document.getElementById('btn-at').getBoundingClientRect();
    mentionPicker.style.left = rect.left + 'px';
    mentionPicker.style.top = (rect.top - Math.min(NOTES.length * 40 + 10, 200)) + 'px';
    mentionPicker.dataset.triggerPos = atPos;

    if (NOTES.length === 0) {
        mentionPicker.innerHTML = '<div class="mention-item">暂无笔记</div>';
    } else {
        mentionPicker.innerHTML = '<div class="mention-search">输入搜索笔记...</div>' + NOTES.map(n => {
            const date = new Date(n.created).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return '<div class="mention-item" data-id="' + n.id + '"><div class="mention-date">' + date + '</div><div>' + (n.content || '无内容') + '</div></div>';
        }).join('');
    }
    document.body.appendChild(mentionPicker);

    mentionPicker.querySelectorAll('.mention-item[data-id]').forEach(item => {
        item.addEventListener('click', () => {
            const savedCursorPos = editor.selectionStart;
            editor.focus();
            const memoText = '[MEMO:' + item.dataset.id + ']';
            const value = editor.value;
            const tp = parseInt(mentionPicker.dataset.triggerPos, 10);
            const before = value.substring(0, tp);
            // 点击 picker 时 editor 可能已失焦，selectionStart 不可靠；
            // 若保存的光标位置有效则用它，否则只替换 @ 本身
            const cursorPos = (savedCursorPos > tp) ? savedCursorPos : tp + 1;
            const after = value.substring(cursorPos);
            editor.value = before + memoText + after;
            editor.setSelectionRange(tp + memoText.length, tp + memoText.length);
            mentionPicker.remove(); mentionPicker = null;
            editor.focus();
        });
    });
}

function filterMentionPicker(searchText) {
    if (!mentionPicker) return;
    const items = mentionPicker.querySelectorAll('.mention-item[data-id]');
    const st = searchText.toLowerCase();
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.classList.toggle('hidden', !text.includes(st));
    });
}

// 点击外部关闭 picker
document.addEventListener('click', (e) => {
    if (tagPicker && !tagPicker.contains(e.target) && !e.target.closest('#btn-tag')) {
        tagPicker.remove(); tagPicker = null;
    }
    if (mentionPicker && !mentionPicker.contains(e.target) && !e.target.closest('#btn-at')) {
        mentionPicker.remove(); mentionPicker = null;
    }
});

// 输入事件：处理 @ 引用
editor.addEventListener('input', () => {
    // 处理 @ 快速引用
    handleMentionInput();
});

function handleMentionInput() {
    const existing = document.querySelector('.mention-picker');
    if (!existing) {
        const cursorPos = editor.selectionStart;
        const value = editor.value;
        const beforeCursor = value.substring(0, cursorPos);
        const currentLine = beforeCursor.split('\\n').pop();
        const atIndex = currentLine.lastIndexOf('@');
        if (atIndex >= 0) {
            const afterAt = currentLine.substring(atIndex + 1);
            if (!afterAt.includes('@')) {
                const lineStartPos = cursorPos - currentLine.length;
                showMentionPicker(lineStartPos + atIndex);
            }
        }
        return;
    }
    const triggerPos = parseInt(existing.dataset.triggerPos, 10);
    const cursorPos = editor.selectionStart;
    const value = editor.value;
    if (cursorPos <= triggerPos) { existing.remove(); mentionPicker = null; return; }
    if (value.substring(triggerPos, triggerPos + 1) !== '@') { existing.remove(); mentionPicker = null; return; }
    const searchText = value.substring(triggerPos + 1, cursorPos);
    filterMentionPicker(searchText);
}

// 粘贴图片
editor.addEventListener('paste', async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
            const file = items[i].getAsFile();
            if (file) imageFiles.push(file);
        }
    }
    if (imageFiles.length === 0) return;
    e.preventDefault();
    for (const file of imageFiles) {
        try {
            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);
            const headers = {};
            if (SIYUAN_TOKEN) {
                headers['Authorization'] = 'Token ' + SIYUAN_TOKEN;
            }
            const response = await fetch(BASE_URL + '/api/asset/upload', { method: 'POST', body: formData, headers });
            const result = await response.json();
            if (result.code === 0) {
                const succMap = result.data.succMap;
                const newPath = succMap[file.name];
                if (newPath) {
                    const imgPath = newPath.startsWith('/') ? newPath.substring(1) : newPath;
                    insertTextAtCursor('![图片](' + imgPath + ')', '');
                }
            }
        } catch (err) {}
    }
    editor.focus();
});

// 键盘事件
editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && ENTER_TO_SUBMIT && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        save();
        return;
    }

    if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
        const cursorPos = editor.selectionStart;
        const value = editor.value;
        const beforeCursor = value.substring(0, cursorPos);
        const afterCursor = value.substring(cursorPos);
        const lines = beforeCursor.split('\\n');
        const currentLine = lines[lines.length - 1];

        const unorderedMatch = currentLine.match(/^(•\\s|-\\s(?!\\[)|\\*\\s)(.*)$/);
        const taskMatch = currentLine.match(/^(- \\[[ x]\\]\\s?)(.*)$/);
        const orderedMatch = currentLine.match(/^(\\d+)\\.\\s(.*)$/);

        if (taskMatch) {
            if (!taskMatch[2].trim()) {
                e.preventDefault();
                lines[lines.length - 1] = '';
                editor.value = lines.join('\\n') + '\\n' + afterCursor;
                const newPos = lines.join('\\n').length + 1;
                editor.setSelectionRange(newPos, newPos);
                return;
            }
            e.preventDefault();
            const newLine = '\\n' + taskMatch[1];
            editor.value = beforeCursor + newLine + afterCursor;
            editor.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
            return;
        }

        if (unorderedMatch) {
            if (!unorderedMatch[2].trim()) {
                e.preventDefault();
                lines[lines.length - 1] = '';
                editor.value = lines.join('\\n') + '\\n' + afterCursor;
                const newPos = lines.join('\\n').length + 1;
                editor.setSelectionRange(newPos, newPos);
                return;
            }
            e.preventDefault();
            const newLine = '\\n' + unorderedMatch[1];
            editor.value = beforeCursor + newLine + afterCursor;
            editor.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
            return;
        }

        if (orderedMatch) {
            if (!orderedMatch[2].trim()) {
                e.preventDefault();
                lines[lines.length - 1] = '';
                editor.value = lines.join('\\n') + '\\n' + afterCursor;
                const newPos = lines.join('\\n').length + 1;
                editor.setSelectionRange(newPos, newPos);
                return;
            }
            e.preventDefault();
            const nextNum = parseInt(orderedMatch[1]) + 1;
            const newLine = '\\n' + nextNum + '. ';
            editor.value = beforeCursor + newLine + afterCursor;
            editor.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
            return;
        }
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        save();
    }
    if (e.key === 'Escape') {
        const text = editor.value.trim();
        if (text) {
            ipcRenderer.send('lumina-quick-save', { content: text });
        }
        window.close();
    }
});

// 关闭（有内容则先保存再关闭）
document.getElementById('btn-close').addEventListener('click', () => {
    const text = editor.value.trim();
    if (text) {
        ipcRenderer.send('lumina-quick-save', { content: text });
    }
    window.close();
});

// 保存（带锁防止重复触发）
let isSaving = false;
function save() {
    if (isSaving) return;
    const text = editor.value.trim();
    if (!text) return;
    isSaving = true;
    ipcRenderer.send('lumina-quick-save', { content: text });
    // 保存后清空输入框并聚焦，窗口保持打开以便连续记录
    editor.value = '';
    editor.focus();
    // 100ms 后解锁，允许连续记录
    setTimeout(() => { isSaving = false; }, 100);
}
document.getElementById('btn-save').addEventListener('click', save);

// 接收主窗口的关闭指令（有内容则先保存再关闭）
ipcRenderer.on('lumina-close', () => {
    const text = editor.value.trim();
    if (text) {
        ipcRenderer.send('lumina-quick-save', { content: text });
    }
    window.close();
});
<\/script>
</body>
</html>`;
    }

    // 轻语速记保存到说说列表
    async addQuickNote(content) {
        if (!content || !content.trim()) return;

        const trimmed = content.trim();
        const processed = trimmed.replace(/lumina:\/\/memo\/([a-zA-Z0-9]+)/g, '[MEMO:$1]');

        // 防重复：如果内容与上次保存的内容相同，且时间在 1.5 秒内，则跳过
        const now = Date.now();
        if (this._lastSavedNote &&
            this._lastSavedNote.content === processed &&
            (now - this._lastSavedNote.time) < 1500) {
            // console.log('[轻语] 检测到重复保存，已跳过');
            return;
        }
        this._lastSavedNote = { content: processed, time: now };

        const tags = this.extractTags(processed);

        const shuoshuo = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            content: processed,
            tags: tags,
            pinned: false,
            created: now,
            updated: now
        };

        this.shuoshuos.unshift(shuoshuo);
        await this.saveShuoshuos();

        if (this.autoSync) {
            const blockId = await this.appendToDailyNote(processed, shuoshuo.created);
            if (blockId) {
                shuoshuo.boundBlockId = blockId;
                await this.saveShuoshuos();
            }
        }

        this.refreshMountedShuoshuoViews();

        showMessage('已保存到轻语');
    }

    render(container) {
        if (container) {
            this.container = container;
            this.registerLuminaContainer(container);
        }
        if (!this.container) return;

        this.container.innerHTML = `
            <svg style="position:absolute;width:0;height:0;overflow:hidden;" aria-hidden="true">
                <symbol id="lumina-icon-ref" viewBox="0 0 32 32">
                    <path d="M2.545 28.491q-1.055 0-1.8-0.745t-0.745-1.8 0.745-1.8 1.8-0.745q0.182 0 0.364 0.018t0.473 0.091l7.273-7.273q-0.073-0.291-0.091-0.473t-0.018-0.364q0-1.055 0.745-1.8t1.8-0.745 1.8 0.745 0.745 1.8q0 0.073-0.109 0.836l4 4q0.291-0.073 0.473-0.091t0.364-0.018 0.364 0.018 0.473 0.091l5.818-5.818q-0.073-0.291-0.091-0.473t-0.018-0.364q0-1.055 0.745-1.8t1.8-0.745 1.8 0.745 0.745 1.8-0.745 1.8-1.8 0.745q-0.182 0-0.364-0.018t-0.473-0.091l-5.818 5.818q0.073 0.291 0.091 0.473t0.018 0.364q0 1.055-0.745 1.8t-1.8 0.745-1.8-0.745-0.745-1.8q0-0.182 0.018-0.364t0.091-0.473l-4-4q-0.291 0.073-0.473 0.091t-0.364 0.018q-0.073 0-0.836-0.109l-7.273 7.273q0.073 0.291 0.091 0.473t0.018 0.364q0 1.055-0.745 1.8t-1.8 0.745zM4.364 12.418l-0.727-1.6-1.6-0.727 1.6-0.727 0.727-1.6 0.727 1.6 1.6 0.727-1.6 0.727zM20.363 10.564l-1.127-2.4-2.4-1.127 2.4-1.127 1.127-2.4 1.127 2.4 2.4 1.127-2.4 1.127z"></path>
                </symbol>
            </svg>
            <div class="north-shuoshuo-container">
                <!-- 最左侧导航栏（微信风格 - 保持不变）-->
                <div class="north-shuoshuo-sidebar">
                    <div class="north-shuoshuo-avatar" id="shuoshuo-avatar-sidebar" title="点击更换头像">
                        ${this.userAvatarUrl ? `<img src="${this.userAvatarUrl}" alt="头像">` : '<svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'}
                    </div>
                    
                    <div class="north-shuoshuo-nav-icons">
                        <button class="north-shuoshuo-nav-item active" data-view="notes" title="说说">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        </button>
                        <button class="north-shuoshuo-nav-item" data-view="table" title="表格">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3V3zm2 2v5h14V5H5zm14 7H5v5h14v-5zM5 10h4v2H5v-2zm6 0h4v2h-4v-2z"/></svg>
                        </button>
                        <button class="north-shuoshuo-nav-item" data-view="stats" title="统计">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M341.333333 938.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V405.333333a42.666667 42.666667 0 0 1 42.666667-42.666666h213.333333V128a42.666667 42.666667 0 0 1 42.666667-42.666667h256a42.666667 42.666667 0 0 1 42.666667 42.666667v405.333333h213.333333a42.666667 42.666667 0 0 1 42.56 39.466667L938.666667 576v320a42.666667 42.666667 0 0 1-39.466667 42.56L896 938.666667H341.333333z m0-512H149.333333v448h192V426.666667z m533.333334 170.666666h-192v277.333334h192V597.333333zM618.666667 149.333333H405.333333v725.333334h213.333334V149.333333z"/></svg>
                        </button>
                        <button class="north-shuoshuo-nav-item" data-view="moments" title="朋友圈">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        </button>
                        <button class="north-shuoshuo-nav-item" data-view="bookshelf" title="图书">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H8c-.55 0-1-.45-1-1V6h10v13z"/></svg>
                        </button>
                    </div>
                    
                    <div class="north-shuoshuo-nav-bottom">
                        <button class="north-shuoshuo-nav-item" data-view="settings" title="设置">
                            <svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- 右侧 Flomo 风格区域（侧边栏 + 卡片列表合并）-->
                <div class="north-shuoshuo-flomo-area">
                    <!-- Flomo 侧边栏 -->
                    <div class="north-shuoshuo-flomo-sidebar">
                        <!-- 搜索栏 -->
                        <div class="north-shuoshuo-search-bar" id="shuoshuo-search-bar">
                            <div class="north-shuoshuo-search-input-wrapper">
                                <input type="text" class="north-shuoshuo-search-input" id="shuoshuo-search-input" placeholder="搜索说说..." autocomplete="off">
                                <button class="north-shuoshuo-search-clear" id="shuoshuo-search-clear" style="display:none;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <button class="north-shuoshuo-filter-btn" id="shuoshuo-filter-btn" title="按日期筛选">
                                <svg class="north-shuoshuo-nav-icon" viewBox="0 0 1024 1024" fill="currentColor"><path d="M898.5 876.51H133.09V196.93H898.5z m-685.41-80H818.5V276.93H213.09z"/><path d="M305.67 143h80v187h-80zM636.44 143h80v187h-80zM295.06 657.98h78.61v80h-78.61zM295.06 532.98h78.61v80h-78.61zM479.06 532.98h78.61v80h-78.61zM661.06 532.98h78.61v80h-78.61zM173.69 393h675.76v80H173.69zM479.12 657.98h78.61v80h-78.61zM661.4 657.98h78.61v80H661.4z"/></svg>
                            </button>

                            <!-- 轻语日历弹层（复用朋友圈日历结构） -->
                            <div class="lumina-moments-calendar-modal" id="shuoshuo-calendar-modal">
                                <div class="lumina-moments-calendar-overlay" id="shuoshuo-calendar-overlay"></div>
                                <div class="lumina-moments-calendar-content">
                                    <div class="lumina-moments-calendar-header">
                                        <div class="lumina-moments-calendar-title">
                                            <span>轻语日历</span>
                                            <select class="lumina-moments-calendar-year" id="shuoshuo-calendar-year"></select>
                                            <!-- 移动端月份选择 -->
                                            <select class="mobile-calendar-month" id="mobile-calendar-month">
                                                <option value="0">1月</option>
                                                <option value="1">2月</option>
                                                <option value="2">3月</option>
                                                <option value="3">4月</option>
                                                <option value="4">5月</option>
                                                <option value="5">6月</option>
                                                <option value="6">7月</option>
                                                <option value="7">8月</option>
                                                <option value="8">9月</option>
                                                <option value="9">10月</option>
                                                <option value="10">11月</option>
                                                <option value="11">12月</option>
                                            </select>
                                        </div>
                                        <div class="lumina-moments-calendar-close" id="shuoshuo-calendar-close">×</div>
                                    </div>
                                    <div class="lumina-moments-calendar-body" id="shuoshuo-calendar-body"></div>
                                </div>
                            </div>

                        </div>

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
                                <div class="north-shuoshuo-stat-number" id="shuoshuo-day-count">0</div>
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
                            <div class="north-shuoshuo-menu-item" data-view="week">
                                <span class="north-shuoshuo-menu-icon"><svg class="north-shuoshuo-nav-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></span>
                                <span class="north-shuoshuo-menu-text">本周记录</span>
                            </div>
                            <div class="north-shuoshuo-menu-item" data-view="random">
                                <span class="north-shuoshuo-menu-icon">${ICONS.random}</span>
                                <span class="north-shuoshuo-menu-text">随机漫步</span>
                            </div>
                        </div>

                        ${(this.queryVisibility?.lifelog || this.queryVisibility?.['no-tag'] !== false || this.queryVisibility?.['has-image'] !== false || this.queryVisibility?.['has-link'] !== false || this.queryVisibility?.['has-comment']) ? `
                        <div class="north-shuoshuo-query-section">
                            <div class="north-shuoshuo-section-title">检索式</div>
                            <div class="north-shuoshuo-query-list">
                                ${this.queryVisibility?.['lifelog'] ? `<div class="north-shuoshuo-query-item" data-query="lifelog">
                                    <span class="north-shuoshuo-query-icon">
                                        <svg class="icon"><use xlink:href="#iconSparkles"></use></svg>
                                    </span>
                                    <span class="north-shuoshuo-query-text">LifeLog</span>
                                    <span class="north-shuoshuo-query-count" data-query-count="lifelog">0</span>
                                </div>` : ''}
                                ${this.queryVisibility?.['no-tag'] !== false ? `<div class="north-shuoshuo-query-item" data-query="no-tag">
                                    <span class="north-shuoshuo-query-icon">
                                        <svg class="icon"><use xlink:href="#iconTags"></use></svg>
                                    </span>
                                    <span class="north-shuoshuo-query-text">无标签</span>
                                    <span class="north-shuoshuo-query-count" data-query-count="no-tag">0</span>
                                </div>` : ''}
                                ${this.queryVisibility?.['has-image'] !== false ? `<div class="north-shuoshuo-query-item" data-query="has-image">
                                    <span class="north-shuoshuo-query-icon">
                                        <svg class="icon"><use xlink:href="#iconImage"></use></svg>
                                    </span>
                                    <span class="north-shuoshuo-query-text">有图片</span>
                                    <span class="north-shuoshuo-query-count" data-query-count="has-image">0</span>
                                </div>` : ''}
                                ${this.queryVisibility?.['has-link'] !== false ? `<div class="north-shuoshuo-query-item" data-query="has-link">
                                    <span class="north-shuoshuo-query-icon">
                                        <svg class="icon"><use xlink:href="#iconLink"></use></svg>
                                    </span>
                                    <span class="north-shuoshuo-query-text">有链接</span>
                                    <span class="north-shuoshuo-query-count" data-query-count="has-link">0</span>
                                </div>` : ''}
                                ${this.queryVisibility?.['has-comment'] ? `<div class="north-shuoshuo-query-item" data-query="has-comment">
                                    <span class="north-shuoshuo-query-icon">
                                        <svg class="icon"><use xlink:href="#iconRef"></use></svg>
                                    </span>
                                    <span class="north-shuoshuo-query-text">已批注</span>
                                    <span class="north-shuoshuo-query-count" data-query-count="has-comment">0</span>
                                </div>` : ''}
                            </div>
                        </div>
                        ` : ''}

                        <div class="north-shuoshuo-tags-section">
                            <div class="north-shuoshuo-section-title">全部标签</div>
                            <div class="north-shuoshuo-tags-list">
                                <div class="north-shuoshuo-tag-empty">暂无标签</div>
                            </div>
                        </div>

                    </div>

                    <!-- 卡片列表 -->
                    <div class="north-shuoshuo-main">
                        <div class="north-shuoshuo-mobile-header">
                            <button class="mobile-header-menu" id="shuoshuo-mobile-menu" title="菜单">
                                <svg class="icon"><use xlink:href="#iconMenu"></use></svg>
                            </button>
                            <div class="mobile-header-title">轻语</div>
                            <div class="mobile-header-actions">
                                <button class="mobile-header-search" id="shuoshuo-mobile-search" title="搜索">
                                    <svg class="icon"><use xlink:href="#iconSearch"></use></svg>
                                </button>
                                <button class="mobile-header-add" id="shuoshuo-mobile-add" title="写说说">
                                    <svg class="icon"><use xlink:href="#iconAdd"></use></svg>
                                </button>
                            </div>
                        </div>
                        <div class="north-shuoshuo-mobile-search-bar" id="shuoshuo-mobile-search-bar">
                            <div class="mobile-search-input-wrapper">
                                <svg class="icon mobile-search-icon"><use xlink:href="#iconSearch"></use></svg>
                                <input type="text" class="mobile-search-input" id="shuoshuo-mobile-search-input" placeholder="搜索说说...">
                            </div>
                            <button class="mobile-search-close" id="shuoshuo-mobile-search-close">取消</button>
                        </div>
                        <div class="north-shuoshuo-input-area" id="shuoshuo-input-area">
                            <div class="north-shuoshuo-input-box" id="shuoshuo-input-box">
                                <div class="north-shuoshuo-input-wrapper">
                                    <textarea class="north-shuoshuo-input-field" id="shuoshuo-input" placeholder="现在的想法是..." rows="3" enterkeyhint="${this.enterToSubmit ? 'done' : 'enter'}"></textarea>
                                </div>
                                <div class="north-shuoshuo-input-toolbar">
                                    <div class="north-shuoshuo-toolbar-left">
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-tag" title="标签">#</span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-image" title="图片">${ICONS.image}</span>
                                        <span class="north-shuoshuo-toolbar-icon" id="toolbar-task" title="任务列表">
                                            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><rect x="3" y="4.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="10.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="16.5" width="3.5" height="3.5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 6h12v1.5H9zm0 6h12v1.5H9zm0 6h12v1.5H9z"/></svg>
                                        </span>
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
                        <div class="north-shuoshuo-mobile-tabbar">
                            <button class="mobile-tab-item active" data-view="notes">
                                <svg class="icon"><use xlink:href="#iconSparkles"></use></svg>
                                <span>说说</span>
                            </button>
                            <button class="mobile-tab-item" data-view="stats">
                                <svg class="icon"><use xlink:href="#iconImgDown"></use></svg>
                                <span>统计</span>
                            </button>
                            <button class="mobile-tab-item" data-view="moments">
                                <svg class="icon"><use xlink:href="#iconCamera"></use></svg>
                                <span>朋友圈</span>
                            </button>
                        </div>
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
                        <div class="north-shuoshuo-settings-nav-item" data-setting="writeathon">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            <span>写拉松同步</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="memos">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            </svg>
                            <span>Memos 同步</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="sync">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                            </svg>
                            <span>说说同步设置</span>
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
                        <div class="north-shuoshuo-settings-nav-item" data-setting="moments">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            <span>朋友圈设置</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="bookshelf">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                            </svg>
                            <span>图书视图设置</span>
                        </div>
                        <div class="north-shuoshuo-settings-nav-item" data-setting="theme">
                            <svg class="north-shuoshuo-settings-nav-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                            </svg>
                            <span>主题设置</span>
                        </div>
                    </div>

                    <!-- 右侧：具体设置内容 -->
                    <div class="north-shuoshuo-content-area">
                        <!-- 说说视图设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-view">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">展示样式</div>
                                        <div class="north-shuoshuo-section-desc">选择笔记列表的展示方式</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 160px;">
                                        <select id="view-style-select" class="north-shuoshuo-select-field">
                                            <option value="list" ${this.viewStyle === 'list' ? 'selected' : ''}>平铺布局</option>
                                            <option value="card" ${this.viewStyle === 'card' ? 'selected' : ''}>卡片布局</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>紧凑模式</h4>
                                        <p>开启后，说说视图中的笔记间距更紧凑，类似memos的布局</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.compactMode ? 'on' : ''}" id="settings-compact-mode-switch"></div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>回车直接提交</h4>
                                        <p>开启后，在主输入框按 Enter 直接发布；Shift+Enter 仍然换行。</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.enterToSubmit ? 'on' : ''}" id="settings-enter-submit-switch"></div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>显示侧边栏</h4>
                                        <p>开启后，在思源笔记右侧 Dock 栏显示轻语侧边栏。</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.showSidebarDock ? 'on' : ''}" id="settings-show-sidebar-dock-switch"></div>
                                </div>
                            </div>

                            <!-- 显示 LifeLog 记录 -->
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>显示 LifeLog 记录</h4>
                                        <p>开启后，在说说视图中显示本年度从思源笔记读取到的 LifeLog 记录。</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.showLifeLogRecords ? 'on' : ''}" id="settings-show-lifelog-records-switch"></div>
                                </div>
                            </div>

                            <!-- 字体大小设置 -->
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">字体大小</div>
                                        <div class="north-shuoshuo-section-desc">调整说说内容的字体大小</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-radio-group vertical" id="font-size-mode-group">
                                        <label class="north-shuoshuo-radio-item ${this.fontSizeConfig.mode === 'default' ? 'selected' : ''}" data-mode="default">
                                            <input type="radio" name="font-size-mode" value="default" ${this.fontSizeConfig.mode === 'default' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">默认（14.5px）</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.fontSizeConfig.mode === 'siyuan' ? 'selected' : ''}" data-mode="siyuan">
                                            <input type="radio" name="font-size-mode" value="siyuan" ${this.fontSizeConfig.mode === 'siyuan' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">跟随思源编辑器</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.fontSizeConfig.mode === 'custom' ? 'selected' : ''}" data-mode="custom">
                                            <input type="radio" name="font-size-mode" value="custom" ${this.fontSizeConfig.mode === 'custom' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">自定义</span>
                                        </label>
                                    </div>
                                    <div class="north-shuoshuo-form-row" id="font-size-custom-row" style="display: ${this.fontSizeConfig.mode === 'custom' ? 'flex' : 'none'}; align-items: center; gap: 8px; margin-top: 8px;">
                                        <input type="number" id="font-size-custom-input" style="width: 80px; height: 32px; padding: 0 10px; border: 1px solid var(--b3-border-color); border-radius: 4px; font-size: 14px; background: var(--b3-theme-surface); color: var(--b3-theme-on-background); outline: none;" min="10" max="24" step="0.5" value="${this.fontSizeConfig.customSize || 14.5}">
                                        <span style="color: var(--b3-theme-on-surface-light); font-size: 13px;">px</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">检索式显示</div>
                                        <div class="north-shuoshuo-section-desc">自定义说说视图中要显示的检索式</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-checkbox-group" id="query-visibility-group">
                                        <label class="north-shuoshuo-checkbox-item">
                                            <input type="checkbox" name="query-visibility" value="lifelog" ${this.queryVisibility?.lifelog ? 'checked' : ''}>
                                            <span class="north-shuoshuo-checkbox-check"></span>
                                            <span class="north-shuoshuo-checkbox-label">LifeLog</span>
                                        </label>
                                        <label class="north-shuoshuo-checkbox-item">
                                            <input type="checkbox" name="query-visibility" value="no-tag" ${this.queryVisibility?.['no-tag'] !== false ? 'checked' : ''}>
                                            <span class="north-shuoshuo-checkbox-check"></span>
                                            <span class="north-shuoshuo-checkbox-label">无标签</span>
                                        </label>
                                        <label class="north-shuoshuo-checkbox-item">
                                            <input type="checkbox" name="query-visibility" value="has-image" ${this.queryVisibility?.['has-image'] !== false ? 'checked' : ''}>
                                            <span class="north-shuoshuo-checkbox-check"></span>
                                            <span class="north-shuoshuo-checkbox-label">有图片</span>
                                        </label>
                                        <label class="north-shuoshuo-checkbox-item">
                                            <input type="checkbox" name="query-visibility" value="has-link" ${this.queryVisibility?.['has-link'] !== false ? 'checked' : ''}>
                                            <span class="north-shuoshuo-checkbox-check"></span>
                                            <span class="north-shuoshuo-checkbox-label">有链接</span>
                                        </label>
                                        <label class="north-shuoshuo-checkbox-item">
                                            <input type="checkbox" name="query-visibility" value="has-comment" ${this.queryVisibility?.['has-comment'] ? 'checked' : ''}>
                                            <span class="north-shuoshuo-checkbox-check"></span>
                                            <span class="north-shuoshuo-checkbox-label">已批注</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">长笔记自动折叠</div>
                                        <div class="north-shuoshuo-section-desc">超过设定行数的笔记会自动折叠，底部显示展开按钮。图片始终完整显示，只折叠文字部分。</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 140px;">
                                        <select id="auto-collapse-lines" class="north-shuoshuo-select-field">
                                            <option value="0" ${this.autoCollapseLines === 0 ? 'selected' : ''}>永不折叠</option>
                                            <option value="4" ${this.autoCollapseLines === 4 ? 'selected' : ''}>4 行</option>
                                            <option value="6" ${this.autoCollapseLines === 6 ? 'selected' : ''}>6 行</option>
                                            <option value="8" ${this.autoCollapseLines === 8 ? 'selected' : ''}>8 行（推荐）</option>
                                            <option value="12" ${this.autoCollapseLines === 12 ? 'selected' : ''}>12 行</option>
                                            <option value="20" ${this.autoCollapseLines === 20 ? 'selected' : ''}>20 行</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 自定义签名设置 -->
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">自定义签名</div>
                                        <div class="north-shuoshuo-section-desc">显示在本周记录和每日回顾统计头部的个性签名</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-input-group" style="width: 100%;">
                                        <input type="text" id="custom-signature-input" class="north-shuoshuo-input-field" placeholder="请输入自定义签名" value="${this.customSignature || '遇事不决，可问春风'}">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 同步设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-sync" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">选择日记笔记本</div>
                                        <div class="north-shuoshuo-section-desc">用于将说说同步到思源笔记的日记中</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 180px;">
                                        <select id="settings-notebook-select" class="north-shuoshuo-select-field">
                                            <option value="">请选择笔记本...</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">同步模式</div>
                                        <div class="north-shuoshuo-section-desc">选择说说同步到思源笔记的方式</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 140px;">
                                        <select id="sync-mode-select" class="north-shuoshuo-select-field">
                                            <option value="dailynote" ${this.syncMode === 'dailynote' ? 'selected' : ''}>每日笔记</option>
                                            <option value="doc" ${this.syncMode === 'doc' ? 'selected' : ''}>指定文档</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row" id="sync-doc-id-row" style="display: ${this.syncMode === 'doc' ? 'block' : 'none'}; margin-top: 12px;">
                                    <label class="north-shuoshuo-form-label">文档 ID</label>
                                    <div class="north-shuoshuo-input-group" style="width: 100%;">
                                        <input type="text" id="settings-sync-doc-id" class="north-shuoshuo-input-field" placeholder="请输入思源文档块 ID" value="${this.syncDocId || ''}">
                                    </div>
                                    <div class="north-shuoshuo-form-hint">
                                        <span>💡</span> 打开目标文档，右键文档标题 → 复制文档块 ID
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>自动同步</h4>
                                        <p>发布说说时自动同步</p>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.autoSync ? 'on' : ''}" id="settings-auto-sync-switch"></div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">daily note 路径模板</div>
                                        <div class="north-shuoshuo-section-desc">自定义日记的存放路径，留空则使用思源笔记中笔记本的日记模板也就是这里(笔记本设置 —> 新建日记那里)。同时也可使用日期格式模板变量。</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <textarea id="settings-daily-note-path-template" class="north-shuoshuo-input-field" rows="2" style="resize: vertical; width: 100%; font-family: monospace; font-size: 13px;" placeholder='例如 /daily note/{YYYY}/{MM}/{YYYY}-{MM}-{DD}'>${this.dailyNotePathTemplate || ''}</textarea>
                                    <div class="north-shuoshuo-form-hint" style="display: block; line-height: 1.8;">
                                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap;">
                                            <span>💡</span> 常用示例（点击即可填入）：
                                            <button type="button" class="daily-note-vars-btn" id="dailyNoteVarsBtn">📋 模板变量</button>
                                        </div>
                                        <div class="daily-note-examples-row">
                                            <span class="daily-note-example" data-template='/daily note/{YYYY}/第{WeekOfYear}周/{YYYY}-{MM}-{DD}'>按年周</span>
                                            <span class="daily-note-example" data-template='/daily note/{YYYY}/第{WeekOfYear}周/{YYYY}-{MM}-{DD}-周{WeekdayCN}'>按年周星期</span>
                                            <span class="daily-note-example" data-template='/daily note/{YYYY}/{MM}/第{WeekOfYear}周/{YYYY}-{MM}-{DD}'>按月周</span>
                                            <span class="daily-note-example" data-template='/daily note/{YYYY}/{MM}月/第{WeekOfYear}周/{YYYY}-{MM}-{DD}-{WeekdayCNFull}'>按年月周日</span>
                                        </div>
                                    </div>
                                    <!-- 日记动态图标设置 -->
                                    <div class="north-shuoshuo-form-row" style="margin-top: 16px;">
                                        <div class="north-shuoshuo-section-header" style="margin-bottom: 10px;">
                                            <div>
                                                <div class="north-shuoshuo-section-title" style="font-size: 14px;">日记动态图标</div>
                                                <div class="north-shuoshuo-section-desc">选择日记文档的动态图标样式，留空则不设置图标</div>
                                            </div>
                                        </div>
                                        <div class="daily-note-icon-options" id="dailyNoteIconOptions">
                                            ${['', '1', '2', '3', '4', '5', '6'].map((type, idx) => {
                                                const labels = ['不设置', '年月日星期', '年月日', '年月', '年', '周数', '星期'];
                                                const isActive = (this.dailyNoteIconType || '') === type;
                                                const today = new Date();
                                                const dateStr = today.toISOString().split('T')[0];
                                                const previewUrl = type ? `/api/icon/getDynamicIcon?type=${type}&date=${dateStr}` : '';
                                                return `
                                                    <div class="daily-note-icon-option ${isActive ? 'active' : ''}" data-icon-type="${type}">
                                                        <div class="daily-note-icon-preview">
                                                            ${previewUrl ? `<img src="${previewUrl}" alt="">` : '<span class="daily-note-icon-none">—</span>'}
                                                        </div>
                                                        <span class="daily-note-icon-label">${labels[idx]}</span>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                        <!-- 图标颜色设置 -->
                                        <div class="daily-note-icon-colors" id="dailyNoteIconColors" style="display: ${this.dailyNoteIconType ? 'flex' : 'none'};">
                                            ${[
                                                { key: 'weekday', label: '工作日', value: this.dailyNoteIconColorWeekday || '' },
                                                { key: 'weekend', label: '周末', value: this.dailyNoteIconColorWeekend || '' }
                                            ].map(group => {
                                                const presetColors = ['#d23f31', '#3b82f6', '#f59e0b', '#22c55e', '#a855f7', '#ec4899', '#6b7280'];
                                                return `
                                                    <div class="daily-note-icon-color-group">
                                                        <span class="daily-note-icon-color-label">${group.label}</span>
                                                        <div class="daily-note-icon-color-presets">
                                                            ${presetColors.map(c => `
                                                                <span class="daily-note-icon-color-dot ${group.value === c ? 'active' : ''}" data-color-group="${group.key}" data-color="${c}" style="background-color: ${c};"></span>
                                                            `).join('')}
                                                        </div>
                                                        <div class="daily-note-icon-color-custom">
                                                            <span>#</span>
                                                            <input type="text" class="daily-note-icon-color-input" data-color-group="${group.key}" value="${group.value ? group.value.replace(/^#/, '') : ''}" placeholder="自定义" maxlength="6">
                                                        </div>
                                                    </div>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>

                                    <!-- 模板变量弹窗 -->
                                    <div class="daily-note-vars-popup" id="dailyNoteVarsPopup">
                                        <div class="daily-note-vars-overlay" id="dailyNoteVarsOverlay"></div>
                                        <div class="daily-note-vars-content">
                                            <div class="daily-note-vars-header">
                                                <span class="daily-note-vars-title">📋 模板变量</span>
                                                <span class="daily-note-vars-close" id="dailyNoteVarsClose">×</span>
                                            </div>
                                            <!-- 弹窗内实时预览条 -->
                                            <div class="daily-note-vars-preview-bar">
                                                <input type="text" class="daily-note-vars-preview-input" id="dailyNoteVarsPreviewInput" placeholder="点击变量组合模板...">
                                                <button type="button" class="daily-note-vars-preview-copy" id="dailyNoteVarsPreviewCopy">📋 复制</button>
                                            </div>
                                            <!-- 弹窗内文档树预览 -->
                                            <div class="daily-note-vars-tree-wrap" id="dailyNoteVarsTreeWrap"></div>
                                            <div class="daily-note-vars-body">
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">日期</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="{YYYY}">{YYYY} <small>年</small></span>
                                                        <span class="daily-note-var-tag" data-var="{YY}">{YY} <small>年简写</small></span>
                                                        <span class="daily-note-var-tag" data-var="{MM}">{MM} <small>月</small></span>
                                                        <span class="daily-note-var-tag" data-var="{M}">{M} <small>月</small></span>
                                                        <span class="daily-note-var-tag" data-var="{DD}">{DD} <small>日</small></span>
                                                        <span class="daily-note-var-tag" data-var="{D}">{D} <small>日</small></span>
                                                    </div>
                                                </div>
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">时间</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="{hh}">{hh} <small>时</small></span>
                                                        <span class="daily-note-var-tag" data-var="{h}">{h} <small>时</small></span>
                                                        <span class="daily-note-var-tag" data-var="{mm}">{mm} <small>分</small></span>
                                                        <span class="daily-note-var-tag" data-var="{m}">{m} <small>分</small></span>
                                                        <span class="daily-note-var-tag" data-var="{ss}">{ss} <small>秒</small></span>
                                                        <span class="daily-note-var-tag" data-var="{s}">{s} <small>秒</small></span>
                                                    </div>
                                                </div>
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">星期</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="{Weekday}">{Weekday} <small>数字</small></span>
                                                        <span class="daily-note-var-tag" data-var="{WeekdayCN}">{WeekdayCN} <small>简写</small></span>
                                                        <span class="daily-note-var-tag" data-var="{WeekdayCNFull}">{WeekdayCNFull} <small>完整</small></span>
                                                        <span class="daily-note-var-tag" data-var="{WeekdayCN2}">{WeekdayCN2} <small>周几</small></span>
                                                        <span class="daily-note-var-tag" data-var="{WeekdayEN}">{WeekdayEN} <small>英文缩写</small></span>
                                                    </div>
                                                </div>
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">季节</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="{Season}">{Season} <small>春夏秋冬</small></span>
                                                        <span class="daily-note-var-tag" data-var="{SeasonEN}">{SeasonEN} <small>英文</small></span>
                                                    </div>
                                                </div>
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">周数</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="{WeekOfYear}">{WeekOfYear} <small>年内第几周</small></span>
                                                        <span class="daily-note-var-tag" data-var="{ISOWeek}">{ISOWeek} <small>ISO周数</small></span>
                                                        <span class="daily-note-var-tag" data-var="{ISOYear}">{ISOYear} <small>ISO年份</small></span>
                                                    </div>
                                                </div>
                                                <div class="daily-note-vars-section">
                                                    <div class="daily-note-vars-section-title">快捷示例</div>
                                                    <div class="daily-note-vars-grid">
                                                        <span class="daily-note-var-tag" data-var="/daily note/{YYYY}/{MM}/{YYYY}-{MM}-{DD}">/按年月日</span>
                                                        <span class="daily-note-var-tag" data-var="/daily note/{YYYY}/{MM}/{YYYY}-{MM}-{DD} {WeekdayCNFull}">/按年月日+星期</span>
                                                        <span class="daily-note-var-tag" data-var="/daily note/{YYYY}/第{WeekOfYear}周/{YYYY}-{MM}-{DD}">/按年周</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="daily-note-vars-footer">
                                                <span>点击变量即可插入到模板中</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">手动同步</div>
                                        <div class="north-shuoshuo-section-desc">将现有说说批量同步到思源笔记</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: var(--b3-theme-on-surface);">
                                        <input type="checkbox" id="settings-full-sync" style="width: 16px; height: 16px; cursor: pointer;">
                                        <span>全量同步（包括已同步过的笔记）</span>
                                    </label>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="settings-start-sync" style="width: 100%;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97-.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                                        </svg>
                                        开始同步
                                    </button>
                                </div>
                                <div class="north-shuoshuo-form-hint">
                                    <span>💡</span> 增量同步仅同步未绑定的笔记；全量同步会重新同步所有笔记（可能产生重复内容）
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

                        <!-- 写拉松同步设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-writeathon" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">写拉松账号</div>
                                        <div class="north-shuoshuo-section-desc">配置写拉松集成 Token 以同步卡片</div>
                                    </div>
                                    <span class="north-shuoshuo-badge" id="writeathon-connection-status">未配置</span>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">集成 Token</label>
                                    <input type="text" id="writeathon-token" class="north-shuoshuo-input-field" placeholder="请输入写拉松集成 Token">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">用户 ID</label>
                                    <input type="text" id="writeathon-userid" class="north-shuoshuo-input-field" placeholder="请输入用户 ID（在写拉松设置→集成中获取）">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="writeathon-verify-btn">验证并保存</button>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary" id="writeathon-clear-btn" style="display: none;">清除配置</button>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card" id="writeathon-sync-card" style="opacity: 0.5; pointer-events: none;">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">同步设置</div>
                                        <div class="north-shuoshuo-section-desc">配置同步方式和目标位置</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 12px;">
                                    <label class="north-shuoshuo-form-label">同步到</label>
                                    <div class="north-shuoshuo-radio-group horizontal">
                                        <label class="north-shuoshuo-radio-item writeathon-target" data-value="dailynote">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">每日笔记</div>
                                                <div class="north-shuoshuo-radio-desc">按日期同步到对应日记</div>
                                            </div>
                                            <input type="radio" name="writeathon-target" value="dailynote">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item writeathon-target" data-value="singledoc">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">指定文档</div>
                                                <div class="north-shuoshuo-radio-desc">同步到一个固定文档</div>
                                            </div>
                                            <input type="radio" name="writeathon-target" value="singledoc">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item writeathon-target" data-value="shuoshuo">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">说说视图</div>
                                                <div class="north-shuoshuo-radio-desc">同步到说说列表中展示</div>
                                            </div>
                                            <input type="radio" name="writeathon-target" value="shuoshuo" checked>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="writeathon-notebook-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">选择笔记本</label>
                                    <div class="north-shuoshuo-input-group">
                                        <div class="north-shuoshuo-select-wrapper">
                                            <select id="writeathon-notebook-select" class="north-shuoshuo-select-field">
                                                <option value="">请选择笔记本...</option>
                                            </select>
                                            <span class="north-shuoshuo-select-arrow">▼</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="writeathon-doc-row" style="margin-bottom: 10px; display: none;">
                                    <label class="north-shuoshuo-form-label">目标文档 ID</label>
                                    <div class="north-shuoshuo-input-group">
                                        <input type="text" id="writeathon-target-doc-id" class="north-shuoshuo-input-field" placeholder="请输入文档块 ID，如：20200812220555-lj3enxa" value="">
                                    </div>
                                    <div class="north-shuoshuo-form-hint" style="margin-top: 6px; font-size: 12px; color: #888;">
                                        提示：右键点击文档，选择"复制文档块 ID"
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">上次同步时间</label>
                                    <div class="north-shuoshuo-readonly-field" id="writeathon-last-sync">从未同步</div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #555;">
                                        <input type="checkbox" id="writeathon-full-sync" style="width: 16px; height: 16px; cursor: pointer;">
                                        <span>全量同步（重新同步所有笔记，包括本地已删除的）</span>
                                    </label>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="writeathon-sync-btn">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
                                            <path d="M23 4v6h-6M1 20v-6h6"/>
                                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                        </svg>
                                        开始同步
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Memos 同步设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-memos" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">Memos 账号</div>
                                        <div class="north-shuoshuo-section-desc">配置 Memos 服务器地址和 Access Token 以同步</div>
                                    </div>
                                    <span class="north-shuoshuo-badge" id="memos-connection-status">未配置</span>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">服务器地址</label>
                                    <input type="text" id="memos-host" class="north-shuoshuo-input-field" placeholder="如：https://memos.example.com">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">Access Token</label>
                                    <input type="password" id="memos-token" class="north-shuoshuo-input-field" placeholder="请输入 Memos Access Token">
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="memos-verify-btn">验证并保存</button>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary" id="memos-clear-btn" style="display: none;">清除配置</button>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card" id="memos-sync-card" style="opacity: 0.5; pointer-events: none;">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">同步设置</div>
                                        <div class="north-shuoshuo-section-desc">配置同步方式和版本</div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 12px;">
                                    <label class="north-shuoshuo-form-label">同步到</label>
                                    <div class="north-shuoshuo-radio-group horizontal">
                                        <label class="north-shuoshuo-radio-item memos-target" data-value="dailynote">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">每日笔记</div>
                                                <div class="north-shuoshuo-radio-desc">按日期同步到对应日记</div>
                                            </div>
                                            <input type="radio" name="memos-target" value="dailynote">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item memos-target" data-value="singledoc">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">指定文档</div>
                                                <div class="north-shuoshuo-radio-desc">同步到一个固定文档</div>
                                            </div>
                                            <input type="radio" name="memos-target" value="singledoc">
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item memos-target" data-value="shuoshuo">
                                            <div class="north-shuoshuo-radio-info">
                                                <div class="north-shuoshuo-radio-name">说说视图</div>
                                                <div class="north-shuoshuo-radio-desc">同步到说说列表中展示</div>
                                            </div>
                                            <input type="radio" name="memos-target" value="shuoshuo" checked>
                                            <span class="north-shuoshuo-radio-check"></span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="memos-notebook-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">选择笔记本</label>
                                    <div class="north-shuoshuo-input-group">
                                        <div class="north-shuoshuo-select-wrapper">
                                            <select id="memos-notebook-select" class="north-shuoshuo-select-field">
                                                <option value="">请选择笔记本...</option>
                                            </select>
                                            <span class="north-shuoshuo-select-arrow">▼</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" id="memos-doc-row" style="margin-bottom: 10px; display: none;">
                                    <label class="north-shuoshuo-form-label">目标文档 ID</label>
                                    <div class="north-shuoshuo-input-group">
                                        <input type="text" id="memos-target-doc-id" class="north-shuoshuo-input-field" placeholder="请输入文档块 ID，如：20200812220555-lj3enxa" value="">
                                    </div>
                                    <div class="north-shuoshuo-form-hint" style="margin-top: 6px; font-size: 12px; color: #888;">
                                        提示：右键点击文档，选择"复制文档块 ID"
                                    </div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-form-label">上次同步时间</label>
                                    <div class="north-shuoshuo-readonly-field" id="memos-last-sync">从未同步</div>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 10px;">
                                    <label class="north-shuoshuo-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px; color: #555;">
                                        <input type="checkbox" id="memos-full-sync" style="width: 16px; height: 16px; cursor: pointer;">
                                        <span>全量同步（重新同步所有笔记，包括本地已删除的）</span>
                                    </label>
                                </div>
                                
                                <div class="north-shuoshuo-form-row" style="margin-bottom: 0;">
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="memos-sync-btn">
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
                                        <h4>说说数据 (JSON)</h4>
                                        <p>将所有说说笔记导出为 JSON 格式</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary north-shuoshuo-btn-small" id="settings-export-shuoshuo-json">导出</button>
                                </div>
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>说说数据 (MD)</h4>
                                        <p>将所有说说笔记导出为 Markdown 格式</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary north-shuoshuo-btn-small" id="settings-export-shuoshuo-md">导出</button>
                                </div>
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>朋友圈数据 (JSON)</h4>
                                        <p>将所有朋友圈动态导出为 JSON 格式</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary north-shuoshuo-btn-small" id="settings-export-moments-json">导出</button>
                                </div>
                                <div class="north-shuoshuo-toggle-row">
                                    <div class="north-shuoshuo-toggle-info">
                                        <h4>朋友圈数据 (MD)</h4>
                                        <p>将所有朋友圈动态导出为 Markdown 格式</p>
                                    </div>
                                    <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary north-shuoshuo-btn-small" id="settings-export-moments-md">导出</button>
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

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">加权回顾</div>
                                        <div class="north-shuoshuo-section-desc">开启后，越久没翻过的笔记越优先展示</div>
                                    </div>
                                    <div class="north-shuoshuo-switch ${this.reviewConfig.weightedReview ? 'on' : ''}" id="weighted-review-toggle"></div>
                                </div>
                            </div>                                               
                    </div>
                        <!-- 朋友圈设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-moments" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">个人信息</div>
                                        <div class="north-shuoshuo-section-desc">设置朋友圈中展示的昵称和签名</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <label class="north-shuoshuo-form-label">昵称</label>
                                    <input type="text" class="north-shuoshuo-input-field" id="moments-nickname-input" placeholder="输入昵称..." value="${this.momentsConfig?.nickname || '月亮'}">
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <label class="north-shuoshuo-form-label">个性签名</label>
                                    <input type="text" class="north-shuoshuo-input-field" id="moments-signature-input" placeholder="输入个性签名..." value="${this.momentsConfig?.signature || '言念君子 温其如玉'}">
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">选择日记笔记本</div>
                                        <div class="north-shuoshuo-section-desc">用于将说说同步到思源笔记的日记中</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 180px;">
                                        <select id="moments-notebook-select" class="north-shuoshuo-select-field">
                                            <option value="">请选择笔记本...</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header" style="align-items: center; gap: 16px; margin-bottom: 0;">
                                    <div style="flex: 1; min-width: 0;">
                                        <div class="north-shuoshuo-section-title">同步模式</div>
                                        <div class="north-shuoshuo-section-desc">选择说说同步到思源笔记的方式</div>
                                    </div>
                                    <div class="north-shuoshuo-select-wrapper" style="flex: 0 0 140px;">
                                        <select id="moments-sync-mode-select" class="north-shuoshuo-select-field">
                                            <option value="dailynote" ${this.momentsConfig?.syncMode === 'dailynote' ? 'selected' : ''}>每日笔记</option>
                                            <option value="doc" ${this.momentsConfig?.syncMode === 'doc' ? 'selected' : ''}>指定文档</option>
                                        </select>
                                        <span class="north-shuoshuo-select-arrow">▼</span>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row" id="moments-sync-doc-id-row" style="display: ${this.momentsConfig?.syncMode === 'doc' ? 'block' : 'none'}; margin-top: 12px;">
                                    <label class="north-shuoshuo-form-label">文档 ID</label>
                                    <div class="north-shuoshuo-input-group" style="width: 100%;">
                                        <input type="text" id="moments-sync-doc-id" class="north-shuoshuo-input-field" placeholder="请输入思源文档块 ID" value="${this.momentsConfig?.syncDocId || ''}">
                                    </div>
                                    <div class="north-shuoshuo-form-hint">
                                        <span>💡</span> 打开目标文档，右键文档标题 → 复制文档块 ID
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">字体大小</div>
                                        <div class="north-shuoshuo-section-desc">调整朋友圈内容的字体大小（仅移动端生效）</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-radio-group vertical" id="moments-font-size-mode-group">
                                        <label class="north-shuoshuo-radio-item ${this.momentsConfig?.fontSize?.mode === 'default' ? 'selected' : ''}" data-mode="default">
                                            <input type="radio" name="moments-font-size-mode" value="default" ${this.momentsConfig?.fontSize?.mode === 'default' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">默认（14.5px）</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.momentsConfig?.fontSize?.mode === 'siyuan' ? 'selected' : ''}" data-mode="siyuan">
                                            <input type="radio" name="moments-font-size-mode" value="siyuan" ${this.momentsConfig?.fontSize?.mode === 'siyuan' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">跟随思源编辑器</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.momentsConfig?.fontSize?.mode === 'custom' ? 'selected' : ''}" data-mode="custom">
                                            <input type="radio" name="moments-font-size-mode" value="custom" ${this.momentsConfig?.fontSize?.mode === 'custom' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">自定义</span>
                                        </label>
                                    </div>
                                    <div class="north-shuoshuo-form-row" id="moments-font-size-custom-row" style="display: ${this.momentsConfig?.fontSize?.mode === 'custom' ? 'flex' : 'none'}; align-items: center; gap: 8px; margin-top: 8px;">
                                        <input type="number" id="moments-font-size-custom-input" style="width: 80px; height: 32px; padding: 0 10px; border: 1px solid var(--b3-border-color); border-radius: 4px; font-size: 14px; background: var(--b3-theme-surface); color: var(--b3-theme-on-background); outline: none;" min="10" max="24" step="0.5" value="${this.momentsConfig?.fontSize?.customSize || 14.5}">
                                        <span style="color: var(--b3-theme-on-surface-light); font-size: 13px;">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 图书视图设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-bookshelf" style="display: none;">
                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">字体大小</div>
                                        <div class="north-shuoshuo-section-desc">自定义图书笔记中各元素的字体大小</div>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
                                    <div class="north-shuoshuo-form-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0; flex: 1; min-width: 160px;">
                                        <label class="north-shuoshuo-form-label" style="display: inline; margin-bottom: 0; white-space: nowrap;">笔记标题</label>
                                        <input type="number" id="bookshelf-font-title" min="10" max="24" step="1" value="${this.bookshelfFontConfig?.title || 14}" style="width: 60px; height: 32px; padding: 0 8px; border: 1px solid var(--b3-border-color); border-radius: 4px; font-size: 14px; background: var(--b3-theme-surface); color: var(--b3-theme-on-background); outline: none; text-align: center;">
                                        <span style="font-size: 13px; color: var(--b3-theme-on-surface-light);">px</span>
                                    </div>
                                    <div class="north-shuoshuo-form-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0; flex: 1; min-width: 160px;">
                                        <label class="north-shuoshuo-form-label" style="display: inline; margin-bottom: 0; white-space: nowrap;">划线内容</label>
                                        <input type="number" id="bookshelf-font-highlight" min="10" max="24" step="1" value="${this.bookshelfFontConfig?.highlight || 13}" style="width: 60px; height: 32px; padding: 0 8px; border: 1px solid var(--b3-border-color); border-radius: 4px; font-size: 14px; background: var(--b3-theme-surface); color: var(--b3-theme-on-background); outline: none; text-align: center;">
                                        <span style="font-size: 13px; color: var(--b3-theme-on-surface-light);">px</span>
                                    </div>
                                    <div class="north-shuoshuo-form-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 0; flex: 1; min-width: 160px;">
                                        <label class="north-shuoshuo-form-label" style="display: inline; margin-bottom: 0; white-space: nowrap;">想法内容</label>
                                        <input type="number" id="bookshelf-font-thought" min="10" max="24" step="1" value="${this.bookshelfFontConfig?.thought || 13}" style="width: 60px; height: 32px; padding: 0 8px; border: 1px solid var(--b3-border-color); border-radius: 4px; font-size: 14px; background: var(--b3-theme-surface); color: var(--b3-theme-on-background); outline: none; text-align: center;">
                                        <span style="font-size: 13px; color: var(--b3-theme-on-surface-light);">px</span>
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">选择日记笔记本</div>
                                        <div class="north-shuoshuo-section-desc">用于将图书笔记同步到思源笔记的日记中</div>
                                    </div>
                                    <span class="north-shuoshuo-badge ${this.bookshelfSyncConfig?.syncNotebookId ? 'north-shuoshuo-badge-success' : ''}" id="bookshelf-sync-status">${this.bookshelfSyncConfig?.syncNotebookId ? '已配置' : '未配置'}</span>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <label class="north-shuoshuo-form-label">笔记本</label>
                                    <div class="north-shuoshuo-input-group">
                                        <div class="north-shuoshuo-select-wrapper">
                                            <select id="bookshelf-notebook-select" class="north-shuoshuo-select-field">
                                                <option value="">请选择笔记本...</option>
                                            </select>
                                            <span class="north-shuoshuo-select-arrow">▼</span>
                                        </div>
                                        <button class="north-shuoshuo-btn-icon" id="bookshelf-refresh-notebooks" title="刷新列表">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M23 4v6h-6M1 20v-6h6"/>
                                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <div class="north-shuoshuo-form-hint">
                                        <span>💡</span> 选择用于存储图书笔记的笔记本
                                    </div>
                                </div>
                            </div>

                            <div class="north-shuoshuo-section-card">
                                <div class="north-shuoshuo-section-header">
                                    <div>
                                        <div class="north-shuoshuo-section-title">同步模式</div>
                                        <div class="north-shuoshuo-section-desc">选择图书笔记同步到思源笔记的方式</div>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row">
                                    <div class="north-shuoshuo-radio-group vertical" id="bookshelf-sync-mode-group">
                                        <label class="north-shuoshuo-radio-item ${this.bookshelfSyncConfig?.syncMode === 'dailynote' ? 'selected' : ''}" data-mode="dailynote">
                                            <input type="radio" name="bookshelf-sync-mode" value="dailynote" ${this.bookshelfSyncConfig?.syncMode === 'dailynote' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">同步到每日笔记</span>
                                        </label>
                                        <label class="north-shuoshuo-radio-item ${this.bookshelfSyncConfig?.syncMode === 'doc' ? 'selected' : ''}" data-mode="doc">
                                            <input type="radio" name="bookshelf-sync-mode" value="doc" ${this.bookshelfSyncConfig?.syncMode === 'doc' ? 'checked' : ''}>
                                            <span class="north-shuoshuo-radio-check"></span>
                                            <span class="north-shuoshuo-radio-label">同步到指定文档</span>
                                        </label>
                                    </div>
                                </div>
                                <div class="north-shuoshuo-form-row" id="bookshelf-sync-doc-id-row" style="display: ${this.bookshelfSyncConfig?.syncMode === 'doc' ? 'block' : 'none'};">
                                    <label class="north-shuoshuo-form-label">文档 ID</label>
                                    <div class="north-shuoshuo-input-group" style="width: 100%;">
                                        <input type="text" id="bookshelf-sync-doc-id" class="north-shuoshuo-input-field" placeholder="请输入思源文档块 ID" value="${this.bookshelfSyncConfig?.syncDocId || ''}">
                                    </div>
                                    <div class="north-shuoshuo-form-hint">
                                        <span>💡</span> 打开目标文档，右键文档标题 → 复制文档块 ID
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 主题设置 -->
                        <div class="north-shuoshuo-settings-section" id="setting-group-theme" style="display: none;">
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

                        <!-- 底部操作 -->
                        <div class="north-shuoshuo-actions">
                            <button class="north-shuoshuo-btn north-shuoshuo-btn-secondary" id="settings-cancel">取消</button>
                            <button class="north-shuoshuo-btn north-shuoshuo-btn-primary" id="settings-save">保存设置</button>
                        </div>

                        
                </div>
            </div>
        `;

        // 标记当前视图为 notes（供 _syncBoundBlockAttr 等函数检测）
        this.currentMainView = 'notes';
        // 先从思源加载最新绑定数据，再渲染
        this.loadShuoshuos().then(() => {
            this.renderNotes();
        });
        // 应用主题模式（默认为原主题）
        setTimeout(() => {
            this.applyThemeMode();
            this.applyFontSizeConfig();
        }, 0);
        this.bindEvents();
        this.syncEnterKeyHint();
        // 初始化视图状态（确保移动端说说视图的顶部栏等逻辑正确执行）
        this.switchMainView('notes', null);
    }

    registerLuminaContainer(container) {
        if (!(container instanceof HTMLElement)) return;
        if (!this._luminaContainers) this._luminaContainers = new Set();
        this._luminaContainers.add(container);
    }

    getMountedLuminaContainers() {
        if (!this._luminaContainers) this._luminaContainers = new Set();
        for (const el of Array.from(this._luminaContainers)) {
            if (!(el instanceof HTMLElement) || !document.body.contains(el)) {
                this._luminaContainers.delete(el);
            }
        }
        return Array.from(this._luminaContainers);
    }

    getContainerMainView(container) {
        // Dock 侧边栏始终只显示笔记列表视图，不参与视图切换
        if (container?.closest?.('.north-shuoshuo-dock-view')) {
            return 'notes';
        }
        const menuActive = container?.querySelector?.('.north-shuoshuo-menu-list .north-shuoshuo-menu-item.active[data-view]')?.dataset?.view;
        if (menuActive) return menuActive;
        const sidebarActive = container?.querySelector?.('.north-shuoshuo-sidebar .north-shuoshuo-nav-item.active[data-view]')?.dataset?.view;
        if (sidebarActive) return sidebarActive;
        const mobileActive = container?.querySelector?.('.north-shuoshuo-mobile-tabbar .mobile-tab-item.active[data-view]')?.dataset?.view;
        return mobileActive || 'notes';
    }

    refreshCurrentViewForContainer(container) {
        if (!(container instanceof HTMLElement) || !document.body.contains(container)) return;
        const previousContainer = this.container;
        const previousView = this.currentMainView;
        try {
            this.container = container;
            this.currentMainView = this.getContainerMainView(container);
            switch (this.currentMainView) {
                case 'table':
                    this.renderTable();
                    this.renderTags();
                    break;
                case 'stats':
                    this.renderStats();
                    this.renderTags();
                    break;
                case 'review':
                    this.renderReview();
                    this.renderTags();
                    break;
                case 'random':
                    this.renderRandom();
                    this.renderTags();
                    break;
                case 'moments':
                case 'bookshelf':
                case 'settings':
                    break;
                case 'week':
                case 'notes':
                default:
                    this._scheduleRender(this.currentMainView);
                    break;
            }
        } finally {
            this.container = previousContainer;
            this.currentMainView = previousView;
        }
    }

    refreshMountedShuoshuoViews() {
        const containers = this.getMountedLuminaContainers();
        if (!containers.length && this.container) containers.push(this.container);
        containers.forEach(container => this.refreshCurrentViewForContainer(container));
    }

    syncEnterKeyHint() {
        const hint = this.enterToSubmit ? 'done' : 'enter';
        this.getMountedLuminaContainers().forEach(container => {
            const input = container.querySelector?.('#shuoshuo-input');
            if (input instanceof HTMLElement) {
                input.setAttribute('enterkeyhint', hint);
            }
        });
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
                if (count >= 1) level = 2;
                if (count >= 3) level = 3;
                if (count >= 5) level = 4;
                
                const tooltip = count > 0 
                    ? `${count}条 ${date.getMonth() + 1}月${date.getDate()}日`
                    : `${date.getMonth() + 1}月${date.getDate()}日`;
                
                cells.push(`<div class="north-shuoshuo-heatmap-cell level-${level}" data-date="${dateStr}" data-lumina-tip="${tooltip}"></div>`);
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

    _scheduleRender(view) {
        requestAnimationFrame(() => {
            const targetView = view || this.currentMainView;
            if (targetView === 'notes' || targetView === 'week') {
                this.renderNotes();
                this.renderTags();
            }
        });
    }

    // 渲染笔记列表
    async renderNotes() {
        if (this._renderingNotes) return;
        this._renderingNotes = true;
        try {
            const listEl = this.container.querySelector('#shuoshuo-notes-list');
            if (!listEl) return;
        
        // 更新检索式数量
        this.updateQueryCounts();

        // 显示输入区域和侧边栏，移除回顾模式和表格布局
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'block';
        const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        if (sidebar) sidebar.style.display = '';
        listEl.classList.remove('review-mode', 'table-layout');

        this.syncEnterKeyHint();
        this._rebuildQuerySections();

        // 根据选中日期、标签或搜索关键词筛选
        let filtered = this.shuoshuos;

        // 本周筛选（本周记录视图）
        if (this.currentMainView === 'week') {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=周日, 1=周一, ..., 6=周六
            const weekStart = new Date(now);
            // 回退到本周一（周日则回退到上周一）
            weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7); // 下周一 00:00
            filtered = filtered.filter(s => {
                const noteDate = new Date(s.created);
                return noteDate >= weekStart && noteDate < weekEnd;
            });
        }

        // 日期筛选
        if (this.selectedDate) {
            filtered = filtered.filter(s => {
                const noteDate = new Date(s.created);
                return this.formatDateKey(noteDate) === this.selectedDate;
            });
        }

        // 标签筛选
        if (this.selectedTag) {
            filtered = filtered.filter(s => {
                if (!s.tags) return false;
                return s.tags.some(tag => tag === this.selectedTag || tag.startsWith(this.selectedTag + '/'));
            });
        }

        // 检索式筛选
        if (this.filterQuery) {
            filtered = filtered.filter(s => {
                const content = s.content || '';
                const tags = this.extractTags(content);
                if (this.filterQuery === 'no-tag') {
                    return tags.length === 0;
                }
                if (this.filterQuery === 'has-image') {
                    return content.includes('![') || /\[.*?\]\(.*?\.(png|jpg|jpeg|gif|webp|svg)\)/i.test(content);
                }
                if (this.filterQuery === 'has-link') {
                    return /https?:\/\//.test(content) || /\[.*?\]\(https?:\/\/.*?\)/.test(content);
                }
                if (this.filterQuery === 'lifelog') {
                    return !!this.extractType(content) || !!s._isLifeLog;
                }
                if (this.filterQuery === 'has-comment') {
                    return content.includes('[MEMO:') || /^关联自：/.test(content);
                }
                return true;
            });
        }

        // 搜索关键词筛选（内容、标签、日期）
        const searchInput = this.container.querySelector('#shuoshuo-search-input');
        const searchText = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (searchText) {
            filtered = filtered.filter(s => {
                const contentMatch = (s.content || '').toLowerCase().includes(searchText);
                const tagMatch = s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchText));
                const dateMatch = this.formatDate(s.created).toLowerCase().includes(searchText);
                return contentMatch || tagMatch || dateMatch;
            });
        }

        // 排序：置顶的在前，然后按时间倒序
        const sorted = [...filtered].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return b.created - a.created;
        });

        if (sorted.length === 0) {
            let emptyMsg;
            if (searchText) {
                emptyMsg = '没有找到匹配的说说';
            } else if (this.currentMainView === 'week') {
                emptyMsg = '本周还没有记录，快去写下第一条想法吧~';
            } else {
                emptyMsg = '还没有笔记，在上方输入框写下第一条想法吧~';
            }
            listEl.innerHTML = `
                <div class="north-shuoshuo-note-card" style="text-align: center; color: #999; padding: 40px;">
                    ${emptyMsg}
                </div>
            `;
            return;
        }

        // 根据视图样式选择渲染方式
        if (this.viewStyle === 'card') {
            // 瀑布流布局：将笔记分配到三列
            listEl.innerHTML = this.renderMasonryNotes(sorted);
        } else {
            // 平铺布局：按日期分组
            const groups = this.groupNotesByDate(sorted);
            let html = '';

            // 本周记录视图显示统计头部
            if (this.currentMainView === 'week') {
                html += `
                    <div class="north-shuoshuo-week-header-bar">
                        <div class="north-shuoshuo-week-header-left">
                            <svg class="icon" style="width:14px;height:14px;"><use xlink:href="#iconCalendar"></use></svg>
                            <span>本周 · 共 ${sorted.length} 条</span>
                        </div>
                        <div class="north-shuoshuo-week-header-center">
                            <span class="north-shuoshuo-week-signature">${this.customSignature || '遇事不决，可问春风'}</span>
                        </div>
                        <div class="north-shuoshuo-week-header-right"></div>
                    </div>
                `;
            }

            for (const [dateKey, notes] of groups) {
                const groupTitle = this.getDateGroupTitle(dateKey);
                html += `<div class="north-shuoshuo-date-group">${groupTitle}</div>`;
                html += notes.map(item => this.renderNoteCard(item)).join('');
            }
            listEl.innerHTML = html;
        }

        // 更新统计
        const countEl = this.container.querySelector('#shuoshuo-count');
        if (countEl) {
            countEl.textContent = this.shuoshuos.length;
        }

        // 绑定块引用点击事件
        this.bindBlockRefEvents();

        // 应用长笔记自动折叠
        requestAnimationFrame(() => this.applyAutoCollapse());

        // 为 LifeLog 标签应用动态颜色
        this.applyLifeLogTagColors();

        // 应用视图样式（异步，但不阻塞）
        this.applyViewStyle();

        // 应用紧凑模式
        this.applyCompactMode();

        // 更新热力图
        const heatmapEl = this.container.querySelector('.north-shuoshuo-heatmap');
        if (heatmapEl) {
            heatmapEl.innerHTML = this.generateHeatmap();
            // 恢复选中状态
            if (this.selectedDate) {
                const selectedCell = heatmapEl.querySelector(`[data-date="${this.selectedDate}"]`);
                if (selectedCell) {
                    selectedCell.classList.add('selected');
                }
            }
        }
        const monthsEl = this.container.querySelector('.north-shuoshuo-months');
        if (monthsEl) {
            monthsEl.innerHTML = this.generateHeatmapMonths();
        }

        this.renderTags();
        } catch (e) {
            // 渲染异常忽略
        } finally {
            this._renderingNotes = false;
        }
    }

    // 绑定块引用点击事件
    bindBlockRefEvents() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        listEl.querySelectorAll('.north-shuoshuo-block-ref').forEach(ref => {
            ref.addEventListener('click', (e) => {
                e.stopPropagation();
                const blockId = ref.dataset.blockId;
                if (blockId) {
                    this.openSiyuanBlockAndCloseMobileShell(blockId);
                }
            });
        });
    }

    // 应用长笔记自动折叠
    applyAutoCollapse() {
        if (!this.container) return;
        const lines = this.autoCollapseLines || 0;
        if (lines <= 0) return;
        // 只在说说视图（平铺/卡片/本周）中应用
        if (this.currentMainView !== 'notes' && this.currentMainView !== 'week') return;

        const noteContents = this.container.querySelectorAll('.north-shuoshuo-note-content');
        const lineHeight = 29; // 14.5px * line-height: 2
        const maxHeight = lines * lineHeight;

        noteContents.forEach(el => {
            // 跳过已处理的
            if (el.dataset.collapseProcessed === 'true') return;
            el.dataset.collapseProcessed = 'true';

            if (el.scrollHeight > maxHeight) {
                el.classList.add('collapsed');
                el.style.setProperty('--collapse-max-height', maxHeight + 'px');

                const btn = document.createElement('div');
                btn.className = 'north-shuoshuo-expand-btn';
                btn.innerHTML = '<span>全文</span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = el.classList.contains('expanded');
                    if (isExpanded) {
                        el.classList.remove('expanded');
                        el.classList.add('collapsed');
                        btn.innerHTML = '<span>全文</span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
                    } else {
                        el.classList.remove('collapsed');
                        el.classList.add('expanded');
                        btn.innerHTML = '<span>收起</span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"/></svg>';
                    }
                });

                // 插入到 note-content 之后
                el.after(btn);
            }
        });
    }

    // 打开思源笔记块
    async openSiyuanBlock(blockId) {
        const id = String(blockId || '').trim();
        if (!id) return false;

        const action = ['cb-get-hl', 'cb-get-context'];
        try {
            if (this.isMobile && typeof openMobileFileById === 'function') {
                openMobileFileById(this.app, id, action);
                return true;
            }
        } catch (e) {}

        try {
            if (typeof openTab === 'function') {
                await openTab({
                    app: this.app,
                    doc: { id, action }
                });
                return true;
            }
        } catch (e) {}

        try {
            const tempSpan = document.createElement('span');
            tempSpan.setAttribute('data-type', 'block-ref');
            tempSpan.setAttribute('data-id', id);
            tempSpan.style.position = 'fixed';
            tempSpan.style.top = '-9999px';
            tempSpan.style.left = '-9999px';
            tempSpan.style.opacity = '0';
            tempSpan.style.pointerEvents = 'none';
            document.body.appendChild(tempSpan);
            const opts = { view: window, bubbles: true, cancelable: true, buttons: 1 };
            tempSpan.dispatchEvent(new MouseEvent('mousedown', opts));
            tempSpan.dispatchEvent(new MouseEvent('mouseup', opts));
            tempSpan.dispatchEvent(new MouseEvent('click', opts));
            setTimeout(() => {
                try { tempSpan.remove(); } catch (e) {}
            }, 100);
            return true;
        } catch (e) {}

        try {
            window.open(`siyuan://blocks/${id}`, '_blank');
            return true;
        } catch (e) {}

        // 块ID格式：文档ID-块ID，如 20260428082606-xi2w9cv
        const docId = id.split('-')[0];
        try {
            const response = await fetch('/api/filetree/getDoc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: docId })
            });
            const data = await response.json();
            if (data.code !== 0 || !data.data) throw new Error(data.msg || '获取文档失败');
            await fetch('/api/filetree/openDoc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notebook: data.data.box,
                    path: data.data.path
                })
            });
            return true;
        } catch (err) {
            console.error('打开文档请求失败:', err);
            showMessage('跳转失败：未能打开对应文档');
            return false;
        }
    }

    async openSiyuanBlockAndCloseMobileShell(blockId) {
        const opened = await this.openSiyuanBlock(blockId);
        if (opened && this.isInMobileShell()) {
            this.closeMobileShuoshuoDock();
        }
        return opened;
    }

    // 渲染单个笔记卡片
    renderNoteCard(item) {
        const dateStr = this.formatDate(item.created);
        const pinnedIcon = item.pinned && !item._isLifeLog ? `<span class="north-shuoshuo-note-pinned">${ICONS.pin}</span>` : '';
        const memoRelations = this.renderMemoRelations(item.content);
        const isLifeLog = item._isLifeLog;
        // LifeLog 类型标签：优先用 _lifeLogType（来自 queryLifeLogRecords），为空时从 content 回退提取
        const lifeLogType = item._lifeLogType || this.extractType(item.content) || '';
        const lifeLogTypeBadge = isLifeLog && lifeLogType ? `<span class="north-shuoshuo-lifelog-type-badge" data-lifelog-type="${this.escapeHtml(lifeLogType)}">${this.escapeHtml(lifeLogType)}</span>` : '';
        return `
            <div class="north-shuoshuo-note-card ${item.pinned ? 'pinned' : ''} ${isLifeLog ? 'lifelog-record' : ''}" data-id="${item.id}">
                ${lifeLogTypeBadge}
                <div class="north-shuoshuo-note-header">
                    <span class="north-shuoshuo-note-date">${dateStr}</span>
                    <div class="north-shuoshuo-note-actions">
                        ${pinnedIcon}
                        ${!isLifeLog ? `<span class="north-shuoshuo-note-menu" data-id="${item.id}">${ICONS.moreH}</span>` : ''}
                    </div>
                </div>
                ${this.renderNoteContent(item.content)}
                ${memoRelations}
            </div>
        `;
    }

    // 获取 LifeLog 类型颜色：优先读取 LifeLog 插件 CSS 定义的 --en-lifelog-border-color，未定义时用哈希算法兜底
    getLifeLogTypeColor(type) {
        if (!type) return '';
        // 创建临时 NodeParagraph 元素匹配 LifeLog 插件的 CSS 规则
        const temp = document.createElement('div');
        temp.setAttribute('data-type', 'NodeParagraph');
        temp.setAttribute('custom-lifelog-type', type);
        temp.style.display = 'none';
        document.body.appendChild(temp);
        const styles = getComputedStyle(temp);
        let color = styles.getPropertyValue('--en-lifelog-border-color').trim();
        document.body.removeChild(temp);
        // 如果 CSS 没定义，用哈希算法生成稳定颜色
        if (!color) {
            let hash = 0;
            for (let i = 0; i < type.length; i++) {
                hash = type.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            color = `hsl(${hue}, 70%, 55%)`;
        }
        return color;
    }

    // 渲染完成后为 LifeLog 标签应用动态颜色
    applyLifeLogTagColors() {
        if (!this.container) return;
        const badges = this.container.querySelectorAll('.north-shuoshuo-lifelog-type-badge');
        badges.forEach(badge => {
            const type = badge.getAttribute('data-lifelog-type');
            if (!type) return;
            const color = this.getLifeLogTypeColor(type);
            if (color) {
                badge.style.backgroundColor = color;
            }
        });
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
        const isComment = noteIds.length > 0 || /^关联自：/.test(content || '');

        if (noteIds.length === 0 && !isComment) return '';

        // 处理旧格式批注（没有 [MEMO:id]）
        let oldFormatSource = '';
        if (/^关联自：/.test(content || '') && noteIds.length === 0) {
            const firstLine = (content || '').split('\n')[0];
            const match = firstLine.match(/^关联自：(.+)$/);
            if (match) {
                oldFormatSource = `
                    <div class="north-shuoshuo-memo-relation-item">
                        <svg class="icon"><use xlink:href="#lumina-icon-ref"></use></svg>
                        <span class="north-shuoshuo-memo-relation-info">${this.escapeHtml(match[1].trim())}</span>
                    </div>
                `;
            }
        }

        return `
            <div class="north-shuoshuo-memo-relations ${isComment ? 'comment-source' : ''}">
                ${noteIds.map(id => {
                    const note = this.shuoshuos.find(s => s.id === id);
                    if (!note) return '';
                    const dateStr = this.formatDate(note.created).split(' ')[0]; // 只取日期部分

                    let infoText = '';
                    if (isComment) {
                        // 批注：显示被引用原文预览
                        let sourcePreview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
                        sourcePreview = sourcePreview.split('\n')[0];
                        // 将块引用 ((id 'title')) 转换为只显示 title
                        sourcePreview = sourcePreview.replace(/\(\(\s*[\w-]+\s+'([^']+)'\s*\)\)/g, '$1');
                        sourcePreview = sourcePreview.replace(/#[^\s\d][^\s]*(?:\/[^\s]+)*/g, '').trim().replace(/\s+/g, ' ');
                        sourcePreview = sourcePreview.substring(0, 80) + (sourcePreview.length > 80 ? '...' : '');
                        sourcePreview = sourcePreview.replace(/^关联自：/, '');
                        infoText = this.escapeHtml(sourcePreview);
                    } else {
                        let preview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
                        preview = preview.split('\n')[0];
                        // 将块引用 ((id 'title')) 转换为只显示 title
                        preview = preview.replace(/\(\(\s*[\w-]+\s+'([^']+)'\s*\)\)/g, '$1');
                        preview = preview.substring(0, 80) + (preview.length > 80 ? '...' : '');
                        infoText = this.escapeHtml(preview);
                    }

                    return `
                        <div class="north-shuoshuo-memo-relation-item" data-id="${id}">
                            <span class="north-shuoshuo-memo-relation-icon">${isComment ? '<svg class="icon"><use xlink:href="#lumina-icon-ref"></use></svg>' : ''}</span>
                            <span class="north-shuoshuo-memo-relation-info">${dateStr}: ${infoText}</span>
                        </div>
                    `;
                }).join('')}
                ${oldFormatSource}
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

        // 显示输入区域和侧边栏（类似本周记录）
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'block';
        const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        if (sidebar) sidebar.style.display = '';

        // 移除笔记布局相关类名
        listEl.classList.remove('review-mode');

        // 如果没有笔记，显示空状态
        if (this.shuoshuos.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-review-empty">
                    <div class="north-shuoshuo-review-empty-icon">🕰️</div>
                    <div class="north-shuoshuo-review-empty-title">还没有笔记</div>
                    <div class="north-shuoshuo-review-empty-hint">在上方输入框写下第一条想法吧</div>
                </div>
            `;
            return;
        }

        // 初始显示提示界面，点击按钮后才展示笔记
        const dailyCount = this.reviewConfig?.dailyCount || 8;
        listEl.innerHTML = `
            <div class="north-shuoshuo-review-welcome">
                <div class="north-shuoshuo-review-welcome-icon">🕰️</div>
                <div class="north-shuoshuo-review-welcome-title">往期的回顾</div>
                <div class="north-shuoshuo-review-welcome-hint">要不要看看随机的 ${dailyCount} 条笔记？</div>
                <button class="north-shuoshuo-review-start-btn" id="shuoshuo-review-start">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h3v3h-3zM8 3h3v3H8zM5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8zM12 12v4"/></svg>
                    随机 ${dailyCount} 条
                </button>
            </div>
        `;

        // 绑定开始回顾按钮事件
        const startBtn = listEl.querySelector('#shuoshuo-review-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.renderReviewNotes();
            });
        }
    }

    // 渲染回顾笔记列表（点击按钮后显示）
    renderReviewNotes() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 获取回顾笔记
        const reviewNotes = this.getReviewNotes();
        const totalCount = reviewNotes.length;
        const dailyCount = this.reviewConfig?.dailyCount || 8;

        // 加权回顾模式下，记录本次回顾的笔记时间
        if (this.reviewConfig?.weightedReview && reviewNotes.length > 0) {
            const now = Date.now();
            reviewNotes.forEach(note => {
                this.reviewHistory[note.id] = now;
            });
            this.saveConfig();
        }

        // 如果没有笔记，显示对应提示
        if (totalCount === 0) {
            if (this.shuoshuos.length === 0) {
                listEl.innerHTML = `
                    <div class="north-shuoshuo-review-empty">
                        <div class="north-shuoshuo-review-empty-icon">🕰️</div>
                        <div class="north-shuoshuo-review-empty-title">还没有笔记</div>
                        <div class="north-shuoshuo-review-empty-hint">在上方输入框写下第一条想法吧</div>
                    </div>
                `;
            } else {
                listEl.innerHTML = `
                    <div class="north-shuoshuo-review-empty">
                        <div class="north-shuoshuo-review-empty-icon">🕰️</div>
                        <div class="north-shuoshuo-review-empty-title">没有命中的笔记</div>
                        <div class="north-shuoshuo-review-empty-hint">当前回顾筛选条件没有命中任何笔记，去设置中调整回顾规则吧</div>
                        <button class="north-shuoshuo-review-action-btn" id="shuoshuo-review-back" style="margin-top: 16px; padding: 6px 16px; font-size: 13px;">
                            回到回顾首页
                        </button>
                    </div>
                `;
                const backBtn = listEl.querySelector('#shuoshuo-review-back');
                if (backBtn) {
                    backBtn.addEventListener('click', () => {
                        this.renderReview();
                    });
                }
            }
            return;
        }

        // 按日期分组显示
        const groups = this.groupNotesByDate(reviewNotes);
        let notesHtml = '';
        for (const [dateKey, notes] of groups) {
            const groupTitle = this.getDateGroupTitle(dateKey);
            notesHtml += `<div class="north-shuoshuo-date-group">${groupTitle}</div>`;
            notesHtml += notes.map(item => this.renderNoteCard(item)).join('');
        }

        listEl.innerHTML = `
            <div class="north-shuoshuo-review-header-bar">
                <div class="north-shuoshuo-review-header-left">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h3v3h-3zM8 3h3v3H8zM5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8zM12 12v4"/></svg>
                    <span>随机 ${dailyCount} 条 · 共 ${totalCount} 条</span>
                </div>
                <div class="north-shuoshuo-review-header-center">
                    <span class="north-shuoshuo-review-signature">${this.customSignature || '遇事不决，可问春风'}</span>
                </div>
                <div class="north-shuoshuo-review-header-actions">
                    <button class="north-shuoshuo-review-action-btn" id="shuoshuo-review-refresh">
                        <svg class="icon" style="width:14px;height:14px;"><use xlink:href="#iconRefresh"></use></svg>
                        换一批
                    </button>
                    <button class="north-shuoshuo-review-action-btn" id="shuoshuo-review-back">
                        <svg class="icon" style="width:14px;height:14px;"><use xlink:href="#iconLanguage"></use></svg>
                        回到回顾首页
                    </button>
                </div>
            </div>
            ${notesHtml}
        `;

        // 绑定笔记卡片事件
        listEl.querySelectorAll('.north-shuoshuo-note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.north-shuoshuo-note-menu')) return;
                const id = card.dataset.id;
                this.showMemoDetail(id);
            });
        });

        listEl.querySelectorAll('.north-shuoshuo-note-card .north-shuoshuo-note-menu').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.showNoteMenu(id, btn);
            });
        });

        // 绑定换一批按钮
        const refreshBtn = listEl.querySelector('#shuoshuo-review-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderReviewNotes();
            });
        }

        // 绑定返回按钮
        const backBtn = listEl.querySelector('#shuoshuo-review-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.renderReview();
            });
        }

        this.bindBlockRefEvents();
    }

    // 绑定回顾设置按钮事件


    // 渲染随机漫步视图
    renderRandom() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 隐藏输入区域，恢复侧边栏显示
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        if (sidebar) sidebar.style.display = '';
        listEl.classList.remove('review-mode', 'card-layout', 'list-layout', 'table-layout');

        if (this.shuoshuos.length === 0) {
            listEl.innerHTML = `
                <div class="north-shuoshuo-random-bg">
                    <div class="north-shuoshuo-random-empty">
                        <div class="north-shuoshuo-random-empty-icon">🎲</div>
                        <div class="north-shuoshuo-random-empty-text">还没有笔记</div>
                        <div class="north-shuoshuo-random-empty-hint">添加一些笔记后，来这里发现惊喜</div>
                    </div>
                </div>
            `;
            return;
        }

        const total = this.shuoshuos.length;

        listEl.innerHTML = `
            <div class="north-shuoshuo-random-bg">
                <div class="north-shuoshuo-review-card" id="memoCard" data-id="">
                    <div class="north-shuoshuo-review-header">
                        <div class="north-shuoshuo-header-left">
                            <svg class="north-shuoshuo-icon-wander" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span class="north-shuoshuo-review-title">随机漫步</span>
                        </div>
                        <div class="north-shuoshuo-review-header-right">
                            <span class="north-shuoshuo-review-date" id="memoDate"></span>
                            <div class="north-shuoshuo-random-actions">
                                <span class="north-shuoshuo-random-action-btn" data-action="edit" title="编辑">${ICONS.edit}</span>
                                <span class="north-shuoshuo-random-action-btn" data-action="comment" title="批注">${ICONS.comment}</span>
                            </div>
                        </div>
                    </div>
                    <div class="north-shuoshuo-review-body">
                        <div class="north-shuoshuo-review-content" id="memoContent"></div>
                    </div>
                    <div class="north-shuoshuo-random-relations" id="memoRelations"></div>
                    <div class="north-shuoshuo-review-footer">
                        <span class="north-shuoshuo-review-tag" id="memoTag"></span>
                        <span class="north-shuoshuo-page-indicator">
                            <span class="north-shuoshuo-page-current" id="memoPageCurrent"></span>
                            <span style="margin: 0 3px; opacity: 0.5;">/</span>
                            <span id="memoPageTotal"></span>
                        </span>
                    </div>
                    <div class="north-shuoshuo-random-comment-box" id="memoCommentBox" style="display:none;">
                        <div class="north-shuoshuo-random-comment-input-wrap">
                            <textarea class="north-shuoshuo-random-comment-field" id="memoCommentInput" placeholder="写下批注..." rows="2"></textarea>
                        </div>
                        <div class="north-shuoshuo-random-comment-toolbar">
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
                                <button class="north-shuoshuo-inline-edit-cancel" id="memoCommentCancel">取消</button>
                                <button class="north-shuoshuo-send-btn north-shuoshuo-inline-save active" id="memoCommentSave">${ICONS.send}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="north-shuoshuo-keyboard-hint">
                    <span>快捷键</span>
                    <kbd class="north-shuoshuo-kbd">Space</kbd>
                    <span>换一条</span>
                </div>
            </div>
        `;

        const memoCard = listEl.querySelector('#memoCard');
        const memoDate = listEl.querySelector('#memoDate');
        const memoContent = listEl.querySelector('#memoContent');
        const memoTag = listEl.querySelector('#memoTag');
        const memoPageCurrent = listEl.querySelector('#memoPageCurrent');
        const memoPageTotal = listEl.querySelector('#memoPageTotal');

        // Fisher-Yates 洗牌：确保每条都被"漫步"到，不重复，全部走完再重新洗牌
        let shuffled = [];
        let index = 0;

        const shuffle = (array) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        const renderNote = (note, currentNum) => {
            memoCard.dataset.id = note.id;
            memoDate.textContent = this.formatDate(note.created);
            memoContent.innerHTML = this.renderNoteContent(note.content, { hideTags: true });
            // 绑定块引用点击事件
            memoContent.querySelectorAll('.north-shuoshuo-block-ref').forEach(ref => {
                ref.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const blockId = ref.dataset.blockId;
                    if (blockId) {
                        this.openSiyuanBlockAndCloseMobileShell(blockId);
                    }
                });
            });
            // 渲染关联关系
            const relationsContainer = memoCard.querySelector('#memoRelations');
            if (relationsContainer) {
                relationsContainer.innerHTML = this.renderMemoRelations(note.content);
            }
            const tags = note.tags || [];
            if (tags.length > 0) {
                memoTag.innerHTML = `${this.escapeHtml(tags[0])}`;
                memoTag.style.display = 'inline-flex';
            } else {
                memoTag.innerHTML = '';
                memoTag.style.display = 'none';
            }
            memoPageCurrent.textContent = currentNum;
            memoPageTotal.textContent = total;
            // 切换笔记时隐藏批注框
            const commentBox = memoCard.querySelector('#memoCommentBox');
            const commentInput = memoCard.querySelector('#memoCommentInput');
            if (commentBox) commentBox.style.display = 'none';
            if (commentInput) {
                commentInput.value = '';
                commentInput.style.height = 'auto';
            }
        };

        const init = () => {
            shuffled = shuffle(this.shuoshuos);
            index = 0;
            renderNote(shuffled[index], index + 1);
        };

        const next = () => {
            index++;
            if (index >= shuffled.length) {
                shuffled = shuffle(this.shuoshuos);
                index = 0;
            }

            // 动画：仅内容区淡出，更新后再淡入，卡片容器保持不动避免闪动
            memoContent.style.transition = 'opacity 0.2s ease';
            memoContent.style.opacity = '0';

            setTimeout(() => {
                renderNote(shuffled[index], index + 1);
                memoContent.style.opacity = '1';
            }, 200);
        };

        // 初始化
        init();

        // 编辑按钮
        memoCard.querySelector('.north-shuoshuo-random-actions [data-action="edit"]').addEventListener('click', () => {
            const id = memoCard.dataset.id;
            if (id) this.editNote(id);
        });

        // 批注按钮
        memoCard.querySelector('.north-shuoshuo-random-actions [data-action="comment"]').addEventListener('click', () => {
            const commentBox = memoCard.querySelector('#memoCommentBox');
            const commentInput = memoCard.querySelector('#memoCommentInput');
            if (commentBox.style.display === 'none') {
                commentBox.style.display = 'block';
                commentInput.focus();
            } else {
                commentBox.style.display = 'none';
            }
        });

        // 批注输入框
        const commentInput = memoCard.querySelector('#memoCommentInput');
        commentInput.addEventListener('input', () => {
            commentInput.style.height = 'auto';
            commentInput.style.height = Math.max(60, commentInput.scrollHeight) + 'px';
            this.handleMentionInput(commentInput);
        });
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                memoCard.querySelector('#memoCommentSave').click();
            }
        });

        // 批注工具栏
        memoCard.querySelector('#memoCommentBox [data-action="tag"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showTagPicker(commentInput);
        });
        memoCard.querySelector('#memoCommentBox [data-action="image"]').addEventListener('click', () => {
            this.insertImage(commentInput);
        });
        memoCard.querySelector('#memoCommentBox [data-action="ul"]').addEventListener('click', () => {
            this.insertText(commentInput, '- ', '');
            commentInput.focus();
        });
        memoCard.querySelector('#memoCommentBox [data-action="ol"]').addEventListener('click', () => {
            const lines = commentInput.value.substring(0, commentInput.selectionStart).split('\n');
            const currentLine = lines[lines.length - 1];
            const match = currentLine.match(/^(\d+)\.\s/);
            const num = match ? parseInt(match[1]) + 1 : 1;
            this.insertText(commentInput, num + '. ', '');
            commentInput.focus();
        });
        memoCard.querySelector('#memoCommentBox [data-action="at"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.showMentionPicker(commentInput);
        });

        // 批注取消
        memoCard.querySelector('#memoCommentCancel').addEventListener('click', () => {
            const commentBox = memoCard.querySelector('#memoCommentBox');
            commentBox.style.display = 'none';
            commentInput.value = '';
            commentInput.style.height = 'auto';
        });

        // 批注保存
        memoCard.querySelector('#memoCommentSave').addEventListener('click', async () => {
            const id = memoCard.dataset.id;
            const text = commentInput.value.trim();
            if (!text || !id) return;

            const note = this.shuoshuos.find(s => s.id === id);
            if (!note) return;

            let preview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
            preview = preview.split('\n')[0];
            preview = preview.replace(/#[^\s\d][^\s]*(?:\/[^\s]+)*/g, '').trim().replace(/\s+/g, ' ');
            preview = preview.substring(0, 60) + (preview.length > 60 ? '...' : '');

            const fullContent = `${preview} [MEMO:${id}]\n${text}`;
            const tags = this.extractTags(fullContent);
            const shuoshuo = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                content: fullContent,
                tags: tags,
                pinned: false,
                created: Date.now(),
                updated: Date.now()
            };
            this.shuoshuos.unshift(shuoshuo);
            await this.saveShuoshuos();

            const commentBox = memoCard.querySelector('#memoCommentBox');
            commentBox.style.display = 'none';
            commentInput.value = '';
            commentInput.style.height = 'auto';
            showMessage('批注已保存');
        });

        // 键盘事件
        if (this._randomKeyHandler) {
            document.removeEventListener('keydown', this._randomKeyHandler);
        }
        this._randomKeyHandler = (e) => {
            if (this.currentMainView !== 'random') return;
            if (e.code === 'Space') {
                e.preventDefault();
                next();
            }
        };
        document.addEventListener('keydown', this._randomKeyHandler);
    }

    // 渲染表格视图
    renderTable() {
        if (this._renderingTable) return;
        this._renderingTable = true;
        try {
            const listEl = this.container.querySelector('#shuoshuo-notes-list');
            if (!listEl) return;

        // 隐藏输入区域，同时隐藏中间侧边栏（表格视图只展示表格）
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        listEl.classList.remove('review-mode', 'card-layout', 'list-layout');
        listEl.classList.add('table-layout');

        // 初始化表格排序状态
        if (!this.tableSort) {
            this.tableSort = { field: 'created', order: 'desc' };
        }

        // 初始化表格搜索文本
        if (typeof this.tableSearchText === 'undefined') {
            this.tableSearchText = '';
        }

        // 获取筛选条件
        const tableFilterDate = this.tableFilterDate || '';
        const tableFilterTag = this.tableFilterTag || '';
        const tableFilterType = this.tableFilterType || '';

        // 筛选数据
        let filtered = this.shuoshuos;

        // 表格视图不显示 LifeLog 记录（只读，避免误删除）
        filtered = filtered.filter(s => !s._isLifeLog);

        // 日期筛选
        if (this.selectedDate) {
            filtered = filtered.filter(s => {
                const noteDate = new Date(s.created);
                return this.formatDateKey(noteDate) === this.selectedDate;
            });
        }

        // 表格内置日期筛选
        if (tableFilterDate) {
            filtered = filtered.filter(s => {
                const noteDate = new Date(s.created);
                return this.formatDateKey(noteDate) === tableFilterDate;
            });
        }

        // 标签筛选
        if (this.selectedTag) {
            filtered = filtered.filter(s => {
                if (!s.tags) return false;
                return s.tags.some(tag => tag === this.selectedTag || tag.startsWith(this.selectedTag + '/'));
            });
        }

        // 表格内置标签筛选
        if (tableFilterTag) {
            filtered = filtered.filter(s => {
                if (!s.tags) return false;
                return s.tags.some(tag => tag === tableFilterTag || tag.startsWith(tableFilterTag + '/'));
            });
        }

        // 类型筛选
        if (tableFilterType) {
            filtered = filtered.filter(s => {
                const typeStr = this.extractType(s.content);
                return typeStr === tableFilterType;
            });
        }

        // 搜索关键词筛选（表格视图专用搜索）
        const tableSearchText = (this.tableSearchText || '').trim().toLowerCase();
        if (tableSearchText) {
            filtered = filtered.filter(s => {
                const contentMatch = (s.content || '').toLowerCase().includes(tableSearchText);
                const tagMatch = s.tags && s.tags.some(tag => tag.toLowerCase().includes(tableSearchText));
                const dateMatch = this.formatDate(s.created).toLowerCase().includes(tableSearchText);
                return contentMatch || tagMatch || dateMatch;
            });
        }

        // 排序：置顶的在前，再按选中时间字段排序
        const sorted = [...filtered].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            const sortField = this.tableSort.field;
            const aVal = a[sortField] || 0;
            const bVal = b[sortField] || 0;
            return this.tableSort.order === 'asc' ? aVal - bVal : bVal - aVal;
        });

        // 获取所有标签和类型用于筛选下拉
        const allTags = this.extractAllTags();
        const allTypes = [...new Set(this.shuoshuos.map(s => this.extractType(s.content)).filter(Boolean))].sort();

        // 生成筛选栏 HTML（紧凑型，用于顶部工具栏）
        const filterBarHtml = `
            <div class="north-shuoshuo-table-filter-bar compact">
                <div class="north-shuoshuo-table-filter-group">
                    <label class="north-shuoshuo-table-filter-label">日期</label>
                    <input type="date" class="north-shuoshuo-table-filter-input" id="table-filter-date" 
                        value="${tableFilterDate}" placeholder="选择日期">
                    ${tableFilterDate ? `<button class="north-shuoshuo-table-filter-clear" data-filter="date" title="清除日期筛选">×</button>` : ''}
                </div>
                <div class="north-shuoshuo-table-filter-group">
                    <label class="north-shuoshuo-table-filter-label">标签</label>
                    <select class="north-shuoshuo-table-filter-select" id="table-filter-tag">
                        <option value="">全部标签</option>
                        ${allTags.map(tag => `<option value="${tag}" ${tableFilterTag === tag ? 'selected' : ''}>${this.escapeHtml(tag)}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
        const resetBtnHtml = (tableFilterDate || tableFilterTag || tableFilterType) ? `
            <button class="north-shuoshuo-table-filter-reset" id="table-filter-reset">重置</button>
        ` : '';

        // 渲染表格内容的预览（使用完整的 Markdown 渲染，取首行预览）
        const renderTableContentPreview = (content) => {
            if (!content) return '';
            // 使用 renderNoteContent 进行完整渲染，但只取纯文本预览
            const rendered = this.renderNoteContent(content, { hideTags: true });
            // 提取纯文本
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rendered;
            let text = tempDiv.textContent || tempDiv.innerText || '';
            text = text.replace(/\s+/g, ' ').trim();
            // 截断到合理长度
            if (text.length > 120) {
                text = text.substring(0, 120) + '...';
            }
            // 使用行内 Markdown 渲染截断后的文本
            return this.renderInline(this.escapeHtml(text));
        };

        const formatTableDate = (timestamp) => {
            const date = new Date(timestamp);
            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const d = date.getDate();
            const h = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${d} ${h}:${min}`;
        };

        // 生成排序箭头 HTML
        const sortArrow = (field) => {
            if (this.tableSort.field !== field) {
                return `<span class="north-shuoshuo-sort-icon">&#9650;&#9660;</span>`;
            }
            return this.tableSort.order === 'asc'
                ? `<span class="north-shuoshuo-sort-icon active">&#9650;</span>`
                : `<span class="north-shuoshuo-sort-icon active">&#9660;</span>`;
        };

        const selectedCount = sorted.length;

        const rowsHtml = sorted.map((item) => {
            const contentPreview = renderTableContentPreview(item.content);
            const typeStr = this.extractType(item.content);
            const typeStyle = typeStr ? this.getTypeColorStyle(typeStr) : '';
            const tagsHtml = (item.tags || []).map(tag => {
                const style = this.getTagColorStyle(tag);
                return `<span class="north-shuoshuo-table-tag-pill" style="${style}">${this.escapeHtml(tag)}</span>`;
            }).join(' ');
            const createdStr = formatTableDate(item.created);
            const updatedStr = formatTableDate(item.updated);
            return `
                <tr class="north-shuoshuo-table-row" data-id="${item.id}">
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-checkbox-cell">
                        <input type="checkbox" class="north-shuoshuo-table-checkbox" data-id="${item.id}">
                    </td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-content-cell" title="${this.escapeHtml((item.content || '').replace(/"/g, '&quot;').substring(0, 200))}">
                        <span class="north-shuoshuo-table-content-text">${contentPreview}</span>
                    </td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-tags-cell">${tagsHtml}</td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-type-cell">
                        ${typeStr ? `<span class="north-shuoshuo-table-type" style="${typeStyle}">${this.escapeHtml(typeStr)}</span>` : ''}
                    </td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-time-cell">${createdStr}</td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-time-cell">${updatedStr}</td>
                    <td class="north-shuoshuo-table-cell north-shuoshuo-table-actions-cell">
                        <div class="north-shuoshuo-table-row-actions">
                            <button class="north-shuoshuo-table-action-btn north-shuoshuo-table-view-btn" data-id="${item.id}" title="查看详情">
                                <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                            </button>
                            <button class="north-shuoshuo-table-action-btn north-shuoshuo-table-delete-btn" data-id="${item.id}" title="删除">
                                <svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // 顶部工具栏HTML（包含搜索、筛选、全选、删除）
        const topToolbarHtml = `
            <div class="north-shuoshuo-table-top-toolbar" id="table-top-toolbar">
                <div class="north-shuoshuo-table-top-left">
                    <div class="north-shuoshuo-table-search-box">
                        <svg class="north-shuoshuo-table-search-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                        <input type="text" class="north-shuoshuo-table-search-input" id="table-search-input"
                            placeholder="搜索内容、标签..." value="${this.tableSearchText || ''}">
                        ${this.tableSearchText ? `<button class="north-shuoshuo-table-search-clear" id="table-search-clear" title="清除搜索">×</button>` : ''}
                    </div>
                </div>
                <div class="north-shuoshuo-table-top-center">
                    ${filterBarHtml}
                </div>
                <div class="north-shuoshuo-table-top-right">
                    <div class="north-shuoshuo-table-select-all-wrapper">
                        <input type="checkbox" class="north-shuoshuo-table-header-checkbox" id="table-select-all">
                        <span class="north-shuoshuo-table-toolbar-label">全选</span>
                    </div>
                    <span class="north-shuoshuo-table-toolbar-count" id="table-selected-count" style="display:none;"></span>
                    <button class="north-shuoshuo-table-batch-delete" id="table-batch-delete" style="display:none;" title="删除选中项">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        <span>删除</span>
                    </button>
                    ${resetBtnHtml}
                </div>
            </div>
        `;

        listEl.innerHTML = `
            <div class="north-shuoshuo-table-wrapper">
                ${topToolbarHtml}
                <div class="north-shuoshuo-table-container">
                    <table class="north-shuoshuo-table">
                        <thead class="north-shuoshuo-table-head">
                            <tr>
                                <th class="north-shuoshuo-table-header-cell north-shuoshuo-table-checkbox-cell"></th>
                                <th class="north-shuoshuo-table-header-cell">内容</th>
                                <th class="north-shuoshuo-table-header-cell">标签</th>
                                <th class="north-shuoshuo-table-header-cell">类型</th>
                                <th class="north-shuoshuo-table-header-cell north-shuoshuo-table-sortable" data-sort="created">
                                    创建时间 ${sortArrow('created')}
                                </th>
                                <th class="north-shuoshuo-table-header-cell north-shuoshuo-table-sortable" data-sort="updated">
                                    更新时间 ${sortArrow('updated')}
                                </th>
                                <th class="north-shuoshuo-table-header-cell north-shuoshuo-table-actions-header">操作</th>
                            </tr>
                        </thead>
                        <tbody class="north-shuoshuo-table-body">
                            ${rowsHtml || `
                                <tr>
                                    <td colspan="7" class="north-shuoshuo-table-empty">
                                        ${tableSearchText ? '没有找到匹配的笔记' : '还没有笔记，在说说视图中写下第一条想法吧~'}
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                <div class="north-shuoshuo-table-footer">
                    共 ${selectedCount} 条笔记
                </div>
            </div>
        `;

        // 绑定筛选事件
        const dateFilterInput = listEl.querySelector('#table-filter-date');
        if (dateFilterInput) {
            dateFilterInput.addEventListener('change', (e) => {
                this.tableFilterDate = e.target.value;
                this.renderTable();
            });
        }

        const tagFilterSelect = listEl.querySelector('#table-filter-tag');
        if (tagFilterSelect) {
            tagFilterSelect.addEventListener('change', (e) => {
                this.tableFilterTag = e.target.value;
                this.renderTable();
            });
        }

        const typeFilterSelect = listEl.querySelector('#table-filter-type');
        if (typeFilterSelect) {
            typeFilterSelect.addEventListener('change', (e) => {
                this.tableFilterType = e.target.value;
                this.renderTable();
            });
        }

        // 绑定清除筛选按钮
        listEl.querySelectorAll('.north-shuoshuo-table-filter-clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.currentTarget.dataset.filter;
                if (filterType === 'date') this.tableFilterDate = '';
                this.renderTable();
            });
        });

        // 绑定重置筛选按钮
        const resetBtn = listEl.querySelector('#table-filter-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.tableFilterDate = '';
                this.tableFilterTag = '';
                this.tableFilterType = '';
                this.tableSearchText = '';
                this.renderTable();
            });
        }

        // 绑定搜索框事件
        const searchInput = listEl.querySelector('#table-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.tableSearchText = e.target.value;
                // 使用防抖，延迟渲染
                clearTimeout(this._searchTimeout);
                this._searchTimeout = setTimeout(() => {
                    this.renderTable();
                }, 300);
            });

            // 支持回车键搜索
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    clearTimeout(this._searchTimeout);
                    this.renderTable();
                }
            });
        }

        // 绑定清除搜索按钮
        const searchClearBtn = listEl.querySelector('#table-search-clear');
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                this.tableSearchText = '';
                this.renderTable();
            });
        }

        // 绑定全选复选框事件
        const selectAllCheckbox = listEl.querySelector('#table-select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = listEl.querySelectorAll('.north-shuoshuo-table-checkbox');
                checkboxes.forEach(cb => {
                    cb.checked = e.target.checked;
                });
                this.updateTableToolbar();
            });
        }

        // 绑定单个复选框事件
        listEl.querySelectorAll('.north-shuoshuo-table-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                this.updateTableToolbar();
            });
        });

        // 绑定排序事件
        listEl.querySelectorAll('.north-shuoshuo-table-sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.tableSort.field === field) {
                    this.tableSort.order = this.tableSort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    this.tableSort.field = field;
                    this.tableSort.order = 'desc';
                }
                this.renderTable();
            });
        });

        // 绑定批量删除事件
        const batchDeleteBtn = listEl.querySelector('#table-batch-delete');
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                if (this._deletingInProgress) return;
                const checkedIds = [...listEl.querySelectorAll('.north-shuoshuo-table-checkbox:checked')]
                    .map(cb => cb.dataset.id)
                    .filter(id => id);
                if (checkedIds.length === 0) return;

                // 构建确认消息
                let confirmTitle = '⚠️ 确认删除';
                let confirmMsg = '';
                if (checkedIds.length === 1) {
                    // 单条删除时显示内容预览
                    const note = this.shuoshuos.find(s => s.id === checkedIds[0]);
                    let contentPreview = '';
                    if (note) {
                        if (note.content && typeof note.content === 'string') {
                            contentPreview = note.content.substring(0, 50);
                            if (note.content.length > 50) contentPreview += '...';
                        } else {
                            contentPreview = '（空内容）';
                        }
                    } else {
                        contentPreview = '（笔记未找到）';
                    }
                    confirmMsg = `确定要删除这条笔记吗？\n\n${contentPreview}\n\n此操作不可恢复。`;
                } else {
                    confirmMsg = `确定要删除选中的 ${checkedIds.length} 条笔记吗？此操作不可恢复。`;
                }

                // 使用思源笔记的 confirm 函数格式：confirm(title, message, callback)
                this.confirmAboveMobileShell(confirmTitle, confirmMsg, async () => {
                    this._deletingInProgress = true;
                    try {
                        const idsToDelete = new Set(checkedIds.map(id => String(id)));
                        const notesToDelete = this.shuoshuos.filter(s => idsToDelete.has(String(s.id)));
                        this.shuoshuos = this.shuoshuos.filter(s => !idsToDelete.has(String(s.id)));
                        await this.saveShuoshuos();
                        for (const note of notesToDelete) {
                            if (note.boundBlockId) {
                                await this.deleteSiyuanBlock(note.boundBlockId);
                            }
                        }
                        this.refreshMountedShuoshuoViews();
                        showMessage(`已删除 ${checkedIds.length} 条笔记`);
                    } finally {
                        this._deletingInProgress = false;
                    }
                });
            });
        }

        // 绑定单条删除事件
        listEl.querySelectorAll('.north-shuoshuo-table-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this._deletingInProgress) return;
                const id = btn.dataset.id;
                if (!id) {
                    showMessage('删除失败：笔记ID不存在');
                    return;
                }
                const note = this.shuoshuos.find(s => String(s.id) === String(id));
                // 获取笔记内容预览，处理各种空值情况
                let contentPreview = '';
                if (note) {
                    if (note.content && typeof note.content === 'string') {
                        contentPreview = note.content.substring(0, 50);
                        if (note.content.length > 50) contentPreview += '...';
                    } else {
                        contentPreview = '（空内容）';
                    }
                } else {
                    contentPreview = '（笔记未找到）';
                }
                // 使用思源笔记的 confirm 函数格式：confirm(title, message, callback)
                this.confirmAboveMobileShell('⚠️ 确认删除', `确定要删除这条笔记吗？\n\n${contentPreview}\n\n此操作不可恢复。`, async () => {
                    this._deletingInProgress = true;
                    try {
                        const noteNow = this.shuoshuos.find(s => String(s.id) === String(id));
                        if (!noteNow) {
                            showMessage('该笔记已被删除');
                            return;
                        }
                        this.shuoshuos = this.shuoshuos.filter(s => String(s.id) !== String(id));
                        await this.saveShuoshuos();
                        if (noteNow.boundBlockId) {
                            await this.deleteSiyuanBlock(noteNow.boundBlockId);
                        }
                        this.refreshMountedShuoshuoViews();
                        showMessage('已删除 1 条笔记');
                    } finally {
                        this._deletingInProgress = false;
                    }
                });
            });
        });

        // 绑定查看详情事件
        listEl.querySelectorAll('.north-shuoshuo-table-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) this.showMemoDetail(id);
            });
        });

        // 绑定行点击事件（点击内容查看详情）
        listEl.querySelectorAll('.north-shuoshuo-table-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.north-shuoshuo-table-checkbox') || 
                    e.target.closest('.north-shuoshuo-table-row-actions') ||
                    e.target.closest('.north-shuoshuo-table-action-btn')) return;
                const id = row.dataset.id;
                if (id) this.showMemoDetail(id);
            });
        });
        } catch (e) {
            // 渲染异常忽略
        } finally {
            this._renderingTable = false;
        }
    }
    // 更新表格工具栏状态（批量删除按钮显示/隐藏）
    updateTableToolbar() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;
        const checkedBoxes = listEl.querySelectorAll('.north-shuoshuo-table-checkbox:checked');
        const batchDeleteBtn = listEl.querySelector('#table-batch-delete');
        const countLabel = listEl.querySelector('#table-selected-count');
        if (batchDeleteBtn) {
            batchDeleteBtn.style.display = checkedBoxes.length > 0 ? 'flex' : 'none';
        }
        if (countLabel) {
            countLabel.textContent = checkedBoxes.length > 0 ? `已选 ${checkedBoxes.length} 项` : '';
            countLabel.style.display = checkedBoxes.length > 0 ? 'inline' : 'none';
        }
    }

// 渲染统计视图
    renderStats(selectedYear = null) {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;

        // 隐藏输入区域，同时隐藏中间侧边栏（统计视图独占主区域）
        const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
        if (inputArea) inputArea.style.display = 'none';
        const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        if (sidebar) sidebar.style.display = 'none';
        listEl.classList.remove('review-mode', 'card-layout', 'list-layout', 'table-layout');

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
        const heatmap = this.generateLargeHeatmap(year);

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

                    <!-- 贡献图 -->
                    <div class="north-shuoshuo-contribution-section">
                        <div class="north-shuoshuo-contribution-body">
                            <div class="north-shuoshuo-contribution-weekdays">
                                <span></span><span>周一</span><span></span><span>周三</span><span></span><span>周五</span><span></span>
                            </div>
                            <div class="north-shuoshuo-contribution-main">
                                <div class="north-shuoshuo-contribution-columns">
                                    ${heatmap.columns}
                                </div>
                                <div class="north-shuoshuo-contribution-months">
                                    ${heatmap.months}
                                </div>
                            </div>
                        </div>
                        <div class="north-shuoshuo-contribution-legend">
                            <span class="legend-label">Less</span>
                            <div class="legend-box level-1"></div>
                            <div class="legend-box level-2"></div>
                            <div class="legend-box level-3"></div>
                            <div class="legend-box level-4"></div>
                            <span class="legend-label">More</span>
                        </div>
                    </div>

                    <!-- 月度分布 -->
                    <div class="north-shuoshuo-monthly-distribution-section">
                        ${this.generateMonthlyDistributionContent(year)}
                    </div>

                    <!-- 最常用标签 Top 10 -->
                    <div class="north-shuoshuo-word-distribution-section">
                        ${this.generateTopTagsContent()}
                    </div>

                    <!-- 标签云 -->
                    <div class="north-shuoshuo-tag-cloud-section">
                        ${this.generateTagCloudContent()}
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

    // ============ 朋友圈视图 ============
    renderMoments() {
        const container = this.container;
        if (!container) return;
        // 直接渲染视图（数据已在 onload 中预加载）
        this._doRenderMoments();
        // 后台刷新数据
        this.loadMoments().then(() => {
            if (this.currentMainView !== 'moments') return;
            this._doRenderMoments();
        });
    }

    _doRenderMoments() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;
        listEl.classList.remove('review-mode', 'card-layout', 'list-layout', 'table-layout');

        const cfg = this.momentsConfig || {};
        const nickname = cfg.nickname || '月亮';
        const signature = cfg.signature || '言念君子 温其如玉';
        const avatar = this.userAvatarUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect width='70' height='70' fill='%234CAF50'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='28' font-family='Arial'%3E我%3C/text%3E%3C/svg%3E`;
        const cover = cfg.cover || null;

        // 构建朋友圈列表HTML
        let momentsHtml = this.moments.map(m => this._renderMomentItem(m, avatar, nickname)).join('');
        if (!momentsHtml) {
            momentsHtml = `<div style="padding:40px;text-align:center;color:#999;font-size:14px;">暂无朋友圈，点击右上角相机发表吧~</div>`;
        }

        // 计算移动端朋友圈字体大小
        let momentsFontSizeStyle = '';
        if (this.isMobile) {
            const fontSizeCfg = this.momentsConfig?.fontSize || { mode: 'default', customSize: 14.5 };
            let momentsFontSize;
            switch (fontSizeCfg.mode) {
                case 'siyuan':
                    momentsFontSize = 'var(--b3-font-size-editor)';
                    break;
                case 'custom':
                    momentsFontSize = `${fontSizeCfg.customSize || 14.5}px`;
                    break;
                default:
                    momentsFontSize = '14.5px';
            }
            momentsFontSizeStyle = `style="--moments-mobile-font-size: ${momentsFontSize};"`;
        }

        listEl.style.padding = '0';
        listEl.innerHTML = `
            <div class="lumina-moments-container" ${momentsFontSizeStyle}>
                <div class="lumina-moments-main" id="momentsMainPage">
                    <div class="lumina-moments-nav" id="momentsNavBar">
                        <div class="lumina-moments-nav-left"></div>
                        <div class="lumina-moments-nav-actions">
                            <div class="lumina-moments-camera-btn" id="momentsCameraBtn" title="发表">
                                <div class="lumina-moments-camera-icon"></div>
                            </div>
                            <div class="lumina-moments-calendar-btn" id="momentsCalendarBtn" title="日历">
                                <div class="lumina-moments-calendar-icon"></div>
                            </div>
                        </div>
                    </div>
                    <div class="lumina-moments-cover" id="momentsCoverSection">
                        ${cover ? `<img class="lumina-moments-cover-img" src="${cover}" alt="cover">` : `<svg class="lumina-moments-cover-img" viewBox="0 0 375 320" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="momentsCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a2980"/><stop offset="50%" style="stop-color:#26d0ce"/><stop offset="100%" style="stop-color:#1a2980"/></linearGradient><pattern id="momentsPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(#momentsCoverGrad)"/><rect width="100%" height="100%" fill="url(#momentsPattern)"/><circle cx="300" cy="80" r="60" fill="rgba(255,255,255,0.05)"/><circle cx="80" cy="200" r="40" fill="rgba(255,255,255,0.03)"/></svg>`}
                        <div class="lumina-moments-cover-user">
                            <span class="lumina-moments-cover-name">${nickname}</span>
                            <img class="lumina-moments-cover-avatar" id="momentsCoverAvatar" src="${avatar}" alt="avatar">
                        </div>
                        <input type="file" id="momentsCoverInput" class="lumina-moments-file-input" accept="image/*">
                    </div>
                    <div class="lumina-moments-signature">
                        <div class="lumina-moments-signature-text">${signature}</div>
                    </div>
                    <div class="lumina-moments-list" id="momentsList">${momentsHtml}</div>
                    <div class="lumina-moments-bottom-space"></div>
                </div>

                <!-- 发表页面 -->
                <div class="lumina-moments-publish" id="momentsPublishPage">
                    <div class="lumina-moments-publish-nav">
                        <div class="lumina-moments-publish-back" id="momentsPublishBack"></div>
                        <div class="lumina-moments-publish-title">发表</div>
                        <button class="lumina-moments-publish-submit" id="momentsPublishSubmit">发表</button>
                    </div>
                    <div class="lumina-moments-publish-content">
                        <textarea class="lumina-moments-publish-textarea" id="momentsPublishText" placeholder="这一刻的想法..."></textarea>
                        <div class="lumina-moments-publish-images" id="momentsPublishImages">
                            <div class="lumina-moments-publish-add" id="momentsPublishAdd"></div>
                        </div>
                        <div class="lumina-moments-publish-section" id="momentsPublishFileSection">
                            <div class="lumina-moments-publish-toggle" id="momentsPublishFileToggle">
                                <div style="width:20px;height:20px;border:1.5px solid #576B95;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#576B95;font-weight:bold;">📎</div>
                                <span>添加文件</span>
                            </div>
                            <div class="lumina-moments-publish-file-preview" id="momentsPublishFilePreview">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="width:40px;height:40px;background-color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;">📄</div>
                                    <div style="flex:1;min-width:0;">
                                        <div id="momentsPublishFileName" style="font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></div>
                                        <div id="momentsPublishFileSize" style="font-size:12px;color:#999;margin-top:2px;"></div>
                                    </div>
                                    <div id="momentsPublishFileDelete" style="width:18px;height:18px;background-color:#FA5151;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
                                        <div style="position:absolute;width:10px;height:1.5px;background-color:#fff;transform:rotate(45deg);"></div>
                                        <div style="position:absolute;width:10px;height:1.5px;background-color:#fff;transform:rotate(-45deg);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="lumina-moments-publish-section">
                            <div class="lumina-moments-publish-toggle" id="momentsPublishLinkToggle">
                                <div class="lumina-moments-publish-link-icon">🔗</div>
                                <span>添加链接</span>
                            </div>
                            <div class="lumina-moments-publish-link-form" id="momentsPublishLinkForm">
                                <input type="text" class="lumina-moments-publish-link-input" id="momentsPublishLinkTitle" placeholder="链接标题">
                                <input type="text" class="lumina-moments-publish-link-input" id="momentsPublishLinkUrl" placeholder="链接地址 (https://...)">
                            </div>
                        </div>
                    </div>
                    <input type="file" id="momentsPublishImageInput" class="lumina-moments-file-input" accept="image/*" multiple>
                    <input type="file" id="momentsPublishFileInput" class="lumina-moments-file-input">
                </div>

                <!-- 编辑页面 -->
                <div class="lumina-moments-edit" id="momentsEditPage">
                    <div class="lumina-moments-edit-nav">
                        <div class="lumina-moments-edit-back" id="momentsEditBack"></div>
                        <div class="lumina-moments-edit-title">修改</div>
                        <button class="lumina-moments-edit-save" id="momentsEditSave">保存</button>
                    </div>
                    <div class="lumina-moments-edit-content">
                        <textarea class="lumina-moments-edit-textarea" id="momentsEditText" placeholder="这一刻的想法..."></textarea>
                        <div class="lumina-moments-edit-images" id="momentsEditImages">
                            <div class="lumina-moments-edit-add" id="momentsEditAdd"></div>
                        </div>
                        <div class="lumina-moments-edit-section" id="momentsEditFileSection">
                            <div class="lumina-moments-edit-toggle" id="momentsEditFileToggle">
                                <div style="width:20px;height:20px;border:1.5px solid #576B95;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#576B95;font-weight:bold;">📎</div>
                                <span>添加文件</span>
                            </div>
                            <div class="lumina-moments-edit-file-preview" id="momentsEditFilePreview">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <div style="width:40px;height:40px;background-color:#fff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;">📄</div>
                                    <div style="flex:1;min-width:0;">
                                        <div id="momentsEditFileName" style="font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></div>
                                        <div id="momentsEditFileSize" style="font-size:12px;color:#999;margin-top:2px;"></div>
                                    </div>
                                    <div id="momentsEditFileDelete" style="width:18px;height:18px;background-color:#FA5151;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
                                        <div style="position:absolute;width:10px;height:1.5px;background-color:#fff;transform:rotate(45deg);"></div>
                                        <div style="position:absolute;width:10px;height:1.5px;background-color:#fff;transform:rotate(-45deg);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="lumina-moments-edit-section">
                            <div class="lumina-moments-edit-toggle" id="momentsEditLinkToggle">
                                <div class="lumina-moments-publish-link-icon">🔗</div>
                                <span>添加链接</span>
                            </div>
                            <div class="lumina-moments-edit-link-form" id="momentsEditLinkForm">
                                <input type="text" class="lumina-moments-edit-link-input" id="momentsEditLinkTitle" placeholder="链接标题">
                                <input type="text" class="lumina-moments-edit-link-input" id="momentsEditLinkUrl" placeholder="链接地址 (https://...)">
                            </div>
                        </div>
                    </div>
                    <input type="file" id="momentsEditImageInput" class="lumina-moments-file-input" accept="image/*" multiple>
                    <input type="file" id="momentsEditFileInput" class="lumina-moments-file-input">
                </div>

                <!-- 日历弹窗 -->
                <div class="lumina-moments-calendar-modal" id="momentsCalendarModal">
                    <div class="lumina-moments-calendar-overlay" id="momentsCalendarOverlay"></div>
                    <div class="lumina-moments-calendar-content">
                        <div class="lumina-moments-calendar-header">
                            <div class="lumina-moments-calendar-title">
                                <span>朋友圈日历</span>
                                <select class="lumina-moments-calendar-year" id="momentsCalendarYear"></select>
                            </div>
                            <div class="lumina-moments-calendar-close" id="momentsCalendarClose">×</div>
                        </div>
                        <div class="lumina-moments-calendar-body" id="momentsCalendarBody"></div>
                    </div>
                </div>
            </div>
        `;

        this._bindMomentsEvents(avatar, nickname, listEl);
    }

    _renderMomentItem(m, avatar, nickname) {
        const dateStr = this.formatMomentDate(m.created);

        let mediaHtml = '';
        if (m.images && m.images.length > 0) {
            let gridClass = 'single';
            if (m.images.length === 2) gridClass = 'double';
            else if (m.images.length === 3) gridClass = 'triple';
            else if (m.images.length === 4) gridClass = 'four';
            else if (m.images.length >= 5 && m.images.length <= 6) gridClass = 'six';
            else if (m.images.length >= 7) gridClass = 'nine';
            const imgsHtml = m.images.map(src => `<img class="lumina-moments-grid-img" src="${src}" alt="photo" loading="lazy">`).join('');
            mediaHtml += `<div class="lumina-moments-media"><div class="lumina-moments-image-grid ${gridClass}">${imgsHtml}</div></div>`;
        }
        if (m.file) {
            mediaHtml += `<div class="lumina-moments-link-card">
                <div style="width:40px;height:40px;background-color:#e0e0e0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-right:8px;flex-shrink:0;">📄</div>
                <div style="flex:1;min-width:0;"><div class="lumina-moments-link-title">${m.file.name}</div><div style="font-size:11px;color:#999;margin-top:2px;">${m.file.size}</div></div>
            </div>`;
        }
        if (m.link && m.link.title) {
            mediaHtml += `<div class="lumina-moments-link-card">
                <img class="lumina-moments-link-thumb" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23ecf0f1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237f8c8d' font-size='10'%3E📄%3C/text%3E%3C/svg%3E" alt="thumb">
                <div class="lumina-moments-link-info"><div class="lumina-moments-link-title">${m.link.title}</div></div>
            </div>`;
        }

        const dateKey = this.formatDateKey(new Date(m.created));
        return `
            <div class="lumina-moments-item" data-mid="${m.id}" data-date="${dateKey}">
                <img class="lumina-moments-item-avatar" src="${avatar}" alt="avatar">
                <div class="lumina-moments-item-content">
                    <div class="lumina-moments-item-name">${nickname}</div>
                    <div class="lumina-moments-item-text">${m.text || ''}</div>
                    ${mediaHtml}
                    <div class="lumina-moments-item-meta">
                        <span class="lumina-moments-item-date">${dateStr}</span>
                        <div class="lumina-moments-item-actions">
                            <div class="lumina-moments-more-btn" data-mid="${m.id}"></div>
                            <div class="lumina-moments-action-popup" data-mid="${m.id}">
                                <div class="lumina-moments-action-popup-btn delete-btn" data-mid="${m.id}"><span class="icon">🗑️</span>删除</div>
                                <div class="lumina-moments-action-popup-btn edit-btn" data-mid="${m.id}"><span class="icon">✏️</span>修改</div>
                                <div class="lumina-moments-action-popup-btn sync-btn" data-mid="${m.id}"><span class="icon">🔄</span>同步</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _bindMomentsEvents(avatar, nickname, scrollContainer) {
        const container = this.container.querySelector('.lumina-moments-container');
        if (!container) return;

        // 导航栏滚动效果
        const navBar = container.querySelector('#momentsNavBar');
        if (scrollContainer && navBar) {
            scrollContainer.addEventListener('scroll', () => {
                if (scrollContainer.scrollTop > 200) {
                    navBar.classList.add('scrolled');
                } else {
                    navBar.classList.remove('scrolled');
                }
            }, { passive: true });
        }

        // 图片双击查看
        let viewer = container.querySelector('.lumina-moments-image-viewer');
        if (!viewer) {
            viewer = document.createElement('div');
            viewer.className = 'lumina-moments-image-viewer';
            const viewerImg = document.createElement('img');
            viewerImg.alt = 'preview';
            viewer.appendChild(viewerImg);
            container.appendChild(viewer);
            viewer.addEventListener('click', () => viewer.classList.remove('active'));
        }
        container.addEventListener('click', (e) => {
            const img = e.target.closest('.lumina-moments-grid-img');
            if (img) {
                const viewerImg = viewer.querySelector('img');
                viewerImg.src = img.src;
                viewer.classList.add('active');
            }
        });

        // 背景图上传
        const coverSection = container.querySelector('#momentsCoverSection');
        const coverInput = container.querySelector('#momentsCoverInput');
        const coverAvatar = container.querySelector('#momentsCoverAvatar');
        if (coverSection && coverInput) {
            coverSection.addEventListener('click', (e) => {
                if (e.target === coverAvatar || e.target.closest('#momentsCoverAvatar')) return;
                coverInput.click();
            });
            coverInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    const base64Data = await new Promise(resolve => {
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    const img = document.createElement('img');
                    img.src = base64Data;
                    img.className = 'lumina-moments-cover-img';
                    const oldSvg = coverSection.querySelector('svg.lumina-moments-cover-img');
                    const oldImg = coverSection.querySelector('img.lumina-moments-cover-img');
                    if (oldSvg) coverSection.replaceChild(img, oldSvg);
                    else if (oldImg) coverSection.replaceChild(img, oldImg);
                    else coverSection.insertBefore(img, coverSection.firstChild);
                    const fileName = this._generateImageFileName(base64Data);
                    const assetUrl = await this.uploadBase64ToAssets(base64Data, fileName);
                    if (assetUrl) {
                        this.momentsConfig.cover = assetUrl;
                    } else {
                        this.momentsConfig.cover = base64Data;
                    }
                    await this.saveMoments();
                }
                coverInput.value = '';
            });
        }

        // more按钮 & 弹出菜单
        container.addEventListener('click', (e) => {
            const moreBtn = e.target.closest('.lumina-moments-more-btn');
            if (moreBtn) {
                e.stopPropagation();
                const mid = moreBtn.dataset.mid;
                const popup = container.querySelector(`.lumina-moments-action-popup[data-mid="${mid}"]`);
                const isActive = popup?.classList.contains('active');
                container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
                if (!isActive && popup) {
                    popup.classList.add('active');
                }
                return;
            }

            // 删除
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                e.stopPropagation();
                const mid = deleteBtn.dataset.mid;
                // 关闭弹出菜单
                container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
                this.confirmAboveMobileShell('⚠️ 确认删除', '确定要删除这条朋友圈吗？此操作不可恢复。', async () => {
                    this.moments = this.moments.filter(x => x.id !== mid);
                    await this.saveMoments();
                    this._doRenderMoments();
                });
                return;
            }

            // 编辑
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                e.stopPropagation();
                container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
                this._openMomentEdit(editBtn.dataset.mid);
                return;
            }

            // 同步到思源笔记
            const syncBtn = e.target.closest('.sync-btn');
            if (syncBtn) {
                e.stopPropagation();
                container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
                const mid = syncBtn.dataset.mid;
                this.syncMomentToSiyuan(mid);
                return;
            }

            // 点击空白关闭popup
            container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
        });

        // 日历弹窗
        const calendarBtn = container.querySelector('#momentsCalendarBtn');
        const calendarModal = container.querySelector('#momentsCalendarModal');
        const calendarOverlay = container.querySelector('#momentsCalendarOverlay');
        const calendarClose = container.querySelector('#momentsCalendarClose');
        const calendarBody = container.querySelector('#momentsCalendarBody');
        const calendarYear = container.querySelector('#momentsCalendarYear');

        const renderCalendarBody = (year) => {
            if (!calendarBody) return;
            const heatmap = this.generateMomentsCalendar(year);
            calendarBody.innerHTML = `
                <div class="lumina-moments-calendar-grid">
                    <div class="lumina-moments-calendar-columns">${heatmap.columns}</div>
                    <div class="lumina-moments-calendar-months">${heatmap.months}</div>
                </div>
            `;
        };

        const initCalendarYearOptions = () => {
            if (!calendarYear) return;
            const years = new Set();
            this.moments.forEach(m => years.add(new Date(m.created).getFullYear()));
            const currentYear = new Date().getFullYear();
            years.add(currentYear);
            const sortedYears = Array.from(years).sort((a, b) => b - a);
            calendarYear.innerHTML = sortedYears.map(y => `<option value="${y}">${y}年</option>`).join('');
            calendarYear.value = currentYear;
        };

        if (calendarBtn && calendarModal && calendarBody) {
            calendarBtn.addEventListener('click', () => {
                initCalendarYearOptions();
                renderCalendarBody(calendarYear?.value ? parseInt(calendarYear.value) : new Date().getFullYear());
                calendarModal.classList.add('active');
            });
        }

        if (calendarYear) {
            calendarYear.addEventListener('change', () => {
                renderCalendarBody(parseInt(calendarYear.value));
            });
        }

        if (calendarOverlay) {
            calendarOverlay.addEventListener('click', () => {
                calendarModal?.classList.remove('active');
            });
        }

        if (calendarClose) {
            calendarClose.addEventListener('click', () => {
                calendarModal?.classList.remove('active');
            });
        }

        // 日历弹窗拖动
        const calendarContent = container.querySelector('.lumina-moments-calendar-content');
        const calendarHeader = container.querySelector('.lumina-moments-calendar-header');
        if (calendarHeader && calendarContent) {
            calendarHeader.addEventListener('mousedown', (e) => {
                if (e.target.closest('.lumina-moments-calendar-close') || e.target.closest('#momentsCalendarYear')) return;
                const rect = calendarContent.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                calendarContent.style.position = 'fixed';
                calendarContent.style.top = rect.top + 'px';
                calendarContent.style.left = rect.left + 'px';
                calendarContent.style.transform = 'none';
                calendarContent.style.margin = '0';
                const onMouseMove = (ev) => {
                    calendarContent.style.top = (ev.clientY - offsetY) + 'px';
                    calendarContent.style.left = (ev.clientX - offsetX) + 'px';
                };
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        }

        // 点击日历格子跳转到对应日期
        if (calendarBody) {
            calendarBody.addEventListener('click', (e) => {
                const cell = e.target.closest('.lumina-moments-calendar-cell[data-date]');
                if (!cell) return;
                const date = cell.dataset.date;
                calendarModal?.classList.remove('active');
                const targetItem = container.querySelector(`.lumina-moments-item[data-date="${date}"]`);
                if (targetItem) {
                    targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetItem.classList.add('lumina-moments-item-highlight');
                    setTimeout(() => targetItem.classList.remove('lumina-moments-item-highlight'), 2000);
                }
            });
        }

        // 发表页面
        const cameraBtn = container.querySelector('#momentsCameraBtn');
        const publishPage = container.querySelector('#momentsPublishPage');
        const publishBack = container.querySelector('#momentsPublishBack');
        const publishSubmit = container.querySelector('#momentsPublishSubmit');
        const publishText = container.querySelector('#momentsPublishText');
        const publishImages = container.querySelector('#momentsPublishImages');
        const publishAddBtn = container.querySelector('#momentsPublishAdd');
        const publishImageInput = container.querySelector('#momentsPublishImageInput');
        const publishFileInput = container.querySelector('#momentsPublishFileInput');
        const publishFileToggle = container.querySelector('#momentsPublishFileToggle');
        const publishFilePreview = container.querySelector('#momentsPublishFilePreview');
        const publishFileDelete = container.querySelector('#momentsPublishFileDelete');
        const publishLinkToggle = container.querySelector('#momentsPublishLinkToggle');
        const publishLinkForm = container.querySelector('#momentsPublishLinkForm');

        let pubImages = [];
        let pubFile = null;

        const mainPage = container.querySelector('#momentsMainPage');
        if (cameraBtn && publishPage) {
            cameraBtn.addEventListener('click', () => {
                if (scrollContainer) scrollContainer.scrollTop = 0;
                if (mainPage) mainPage.style.visibility = 'hidden';
                publishPage.classList.add('active');
                publishText.value = '';
                pubImages = [];
                pubFile = null;
                publishLinkForm.classList.remove('active');
                publishFilePreview.classList.remove('active');
                this._renderPublishImages(pubImages, publishImages);
                publishText.focus();
            });
        }
        if (publishBack && publishPage) {
            publishBack.addEventListener('click', () => {
                publishPage.classList.remove('active');
                if (mainPage) mainPage.style.visibility = '';
            });
        }
        if (publishLinkToggle && publishLinkForm) {
            publishLinkToggle.addEventListener('click', () => publishLinkForm.classList.toggle('active'));
        }
        if (publishFileToggle && publishFileInput) {
            publishFileToggle.addEventListener('click', () => publishFileInput.click());
            publishFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    pubFile = file;
                    container.querySelector('#momentsPublishFileName').textContent = file.name;
                    container.querySelector('#momentsPublishFileSize').textContent = this._formatFileSize(file.size);
                    publishFilePreview.classList.add('active');
                }
                publishFileInput.value = '';
            });
        }
        if (publishFileDelete) {
            publishFileDelete.addEventListener('click', () => {
                pubFile = null;
                publishFilePreview.classList.remove('active');
            });
        }
        if (publishAddBtn && publishImageInput) {
            publishAddBtn.addEventListener('click', () => publishImageInput.click());
            publishImageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        pubImages.push(ev.target.result);
                        this._renderPublishImages(pubImages, publishImages);
                    };
                    reader.readAsDataURL(file);
                });
                publishImageInput.value = '';
            });
        }
        if (publishSubmit) {
            publishSubmit.addEventListener('click', async () => {
                const text = publishText.value.trim();
                const linkTitle = container.querySelector('#momentsPublishLinkTitle')?.value.trim() || '';
                if (!text && pubImages.length === 0 && !linkTitle && !pubFile) return;
                const uploadedImages = [];
                for (const img of pubImages) {
                    if (typeof img === 'string' && img.startsWith('data:')) {
                        const fileName = this._generateImageFileName(img);
                        const url = await this.uploadBase64ToAssets(img, fileName);
                        uploadedImages.push(url || img);
                    } else {
                        uploadedImages.push(img);
                    }
                }
                pubImages.length = 0;
                pubImages.push(...uploadedImages);
                const mid = this.getMomentNextId();
                const newMoment = {
                    id: mid,
                    text: text || '',
                    images: [...uploadedImages],
                    file: pubFile ? { name: pubFile.name, size: this._formatFileSize(pubFile.size) } : null,
                    link: linkTitle ? { title: linkTitle, url: container.querySelector('#momentsPublishLinkUrl')?.value.trim() || '' } : null,
                    likes: [],
                    comments: [],
                    created: Date.now(),
                    updated: Date.now()
                };
                this.moments.unshift(newMoment);
                this.saveMoments();
                publishPage.classList.remove('active');
                this._doRenderMoments();
                if (scrollContainer) scrollContainer.scrollTop = 0;
            });
        }

        // 编辑页面
        const editPage = container.querySelector('#momentsEditPage');
        const editBack = container.querySelector('#momentsEditBack');
        const editSave = container.querySelector('#momentsEditSave');
        const editText = container.querySelector('#momentsEditText');
        const editImages = container.querySelector('#momentsEditImages');
        const editAddBtn = container.querySelector('#momentsEditAdd');
        const editImageInput = container.querySelector('#momentsEditImageInput');
        const editFileInput = container.querySelector('#momentsEditFileInput');
        const editFileToggle = container.querySelector('#momentsEditFileToggle');
        const editFilePreview = container.querySelector('#momentsEditFilePreview');
        const editFileDelete = container.querySelector('#momentsEditFileDelete');
        const editLinkToggle = container.querySelector('#momentsEditLinkToggle');
        const editLinkForm = container.querySelector('#momentsEditLinkForm');

        let editMid = null;
        let editImgs = [];
        let editFile = null;
        let editHasLink = false;

        if (editBack && editPage) {
            editBack.addEventListener('click', () => {
                editPage.classList.remove('active');
                if (mainPage) mainPage.style.visibility = '';
                editMid = null;
                editImgs = [];
                editFile = null;
                editHasLink = false;
            });
        }
        if (editLinkToggle && editLinkForm) {
            editLinkToggle.addEventListener('click', () => editLinkForm.classList.toggle('active'));
        }
        if (editFileToggle && editFileInput) {
            editFileToggle.addEventListener('click', () => editFileInput.click());
            editFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    editFile = file;
                    container.querySelector('#momentsEditFileName').textContent = file.name;
                    container.querySelector('#momentsEditFileSize').textContent = this._formatFileSize(file.size);
                    editFilePreview.classList.add('active');
                    editHasLink = false;
                    editLinkForm.classList.remove('active');
                }
                editFileInput.value = '';
            });
        }
        if (editFileDelete) {
            editFileDelete.addEventListener('click', () => {
                editFile = null;
                editFilePreview.classList.remove('active');
            });
        }
        if (editAddBtn && editImageInput) {
            editAddBtn.addEventListener('click', () => editImageInput.click());
            editImageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        editImgs.push(ev.target.result);
                        this._renderEditImages(editImgs, editImages);
                    };
                    reader.readAsDataURL(file);
                });
                editImageInput.value = '';
            });
        }
        if (editSave) {
            editSave.addEventListener('click', async () => {
                if (!editMid) return;
                const m = this.moments.find(x => x.id === editMid);
                if (!m) return;
                m.text = editText.value.trim();
                const uploadedEditImages = [];
                for (const img of editImgs) {
                    if (typeof img === 'string' && img.startsWith('data:')) {
                        const fileName = this._generateImageFileName(img);
                        const url = await this.uploadBase64ToAssets(img, fileName);
                        uploadedEditImages.push(url || img);
                    } else {
                        uploadedEditImages.push(img);
                    }
                }
                m.images = uploadedEditImages;
                if (editFile) {
                    m.file = { name: editFile.name, size: this._formatFileSize(editFile.size) };
                    m.link = null;
                } else {
                    m.file = null;
                }
                const editLinkTitleVal = container.querySelector('#momentsEditLinkTitle')?.value.trim() || '';
                if (editLinkTitleVal && editHasLink) {
                    m.link = { title: editLinkTitleVal, url: container.querySelector('#momentsEditLinkUrl')?.value.trim() || '' };
                    m.file = null;
                } else if (!editLinkTitleVal) {
                    m.link = null;
                }
                m.updated = Date.now();
                this.saveMoments();
                editPage.classList.remove('active');
                editMid = null;
                editImgs = [];
                editFile = null;
                editHasLink = false;
                this._doRenderMoments();
            });
        }

        // 暴露编辑打开方法到实例
        this._openMomentEdit = (mid) => {
            const m = this.moments.find(x => x.id === mid);
            if (!m) return;
            editMid = mid;
            editText.value = m.text || '';
            editImgs = m.images ? [...m.images] : [];
            this._renderEditImages(editImgs, editImages);
            editFile = null;
            editHasLink = false;
            if (m.file) {
                editFile = m.file;
                container.querySelector('#momentsEditFileName').textContent = m.file.name;
                container.querySelector('#momentsEditFileSize').textContent = m.file.size;
                editFilePreview.classList.add('active');
                editLinkForm.classList.remove('active');
            } else if (m.link && m.link.title) {
                editHasLink = true;
                container.querySelector('#momentsEditLinkTitle').value = m.link.title;
                container.querySelector('#momentsEditLinkUrl').value = m.link.url || '';
                editLinkForm.classList.add('active');
                editFilePreview.classList.remove('active');
            } else {
                editLinkForm.classList.remove('active');
                editFilePreview.classList.remove('active');
            }
            if (mainPage) mainPage.style.visibility = 'hidden';
            editPage.classList.add('active');
            if (scrollContainer) scrollContainer.scrollTop = 0;
            container.querySelectorAll('.lumina-moments-action-popup.active').forEach(p => p.classList.remove('active'));
        };
    }

    _renderPublishImages(images, containerEl) {
        if (!containerEl) return;
        const addBtn = containerEl.querySelector('#momentsPublishAdd');
        containerEl.innerHTML = '';
        images.forEach((src, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'lumina-moments-publish-img-wrapper';
            const img = document.createElement('img');
            img.className = 'lumina-moments-publish-img-item';
            img.src = src;
            const del = document.createElement('div');
            del.className = 'lumina-moments-publish-img-del';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                images.splice(index, 1);
                this._renderPublishImages(images, containerEl);
            });
            wrapper.appendChild(img);
            wrapper.appendChild(del);
            containerEl.appendChild(wrapper);
        });
        if (addBtn) containerEl.appendChild(addBtn);
    }

    _renderEditImages(images, containerEl) {
        if (!containerEl) return;
        const addBtn = containerEl.querySelector('#momentsEditAdd');
        containerEl.innerHTML = '';
        images.forEach((src, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'lumina-moments-edit-img-wrapper';
            const img = document.createElement('img');
            img.className = 'lumina-moments-edit-img-item';
            img.src = src;
            const del = document.createElement('div');
            del.className = 'lumina-moments-edit-img-del';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                images.splice(index, 1);
                this._renderEditImages(images, containerEl);
            });
            wrapper.appendChild(img);
            wrapper.appendChild(del);
            containerEl.appendChild(wrapper);
        });
        if (addBtn) containerEl.appendChild(addBtn);
    }

    // ============ 图书书架视图 ============
    renderBookshelf() {
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;
        this.bookshelfCurrentView = 'list';
        this.bookshelfSearch = '';
        this._doRenderBookshelf(listEl);
    }

    _doRenderBookshelf(listEl) {
        listEl.style.padding = '0';
        listEl.innerHTML = `
            <div class="lumina-bookshelf-container" id="bookshelfContainer">
                <div class="lumina-bookshelf-header" id="bookshelfHeader">
                    <div class="lumina-bookshelf-header-inner">
                        <div class="lumina-bookshelf-toolbar-left">
                            <div class="lumina-bookshelf-search">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <input type="text" id="bookshelfSearchInput" placeholder="搜索书名|作者">
                            </div>
                            <div class="lumina-bookshelf-filter-group">
                                <button class="lumina-bookshelf-filter-btn" id="bookshelfBtnType" data-dropdown="type">
                                    <span id="bookshelfLabelType">全部类型</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                                <div class="lumina-bookshelf-dropdown" id="bookshelfDropdownType">
                                    <div class="lumina-bookshelf-dropdown-item selected" data-value="all">全部类型<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="book">图书<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="article">文章<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                </div>
                                <button class="lumina-bookshelf-filter-btn" id="bookshelfBtnStatus" data-dropdown="status">
                                    <span id="bookshelfLabelStatus">在读+已读</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                                <div class="lumina-bookshelf-dropdown" id="bookshelfDropdownStatus">
                                    <div class="lumina-bookshelf-dropdown-item" data-value="all">全部状态<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-divider"></div>
                                    <div class="lumina-bookshelf-dropdown-item selected" data-value="read+reading">在读+已读<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="reading">在读<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="read">已读<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="unread">未读<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                </div>
                                <button class="lumina-bookshelf-filter-btn" id="bookshelfBtnSort" data-dropdown="sort">
                                    <span id="bookshelfLabelSort">时间排序</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
                                </button>
                                <div class="lumina-bookshelf-dropdown" id="bookshelfDropdownSort">
                                    <div class="lumina-bookshelf-dropdown-item selected" data-value="time">时间排序<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="name">书名排序<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                    <div class="lumina-bookshelf-dropdown-item" data-value="author">作者排序<svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></div>
                                </div>
                                <label class="lumina-bookshelf-toggle">
                                    <input type="checkbox" id="bookshelfYearToggle" checked>
                                    <span class="lumina-bookshelf-toggle-slider"></span>
                                    <span>按年份</span>
                                </label>
                            </div>
                        </div>
                        <div class="lumina-bookshelf-toolbar-right">
                            <button class="lumina-bookshelf-action-btn" id="bookshelfImportBtn" title="导入微信读书笔记">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                导入
                            </button>
                            <input type="file" id="bookshelfImportInput" accept=".json" style="display:none;">
                        </div>
                    </div>
                </div>
                <div class="lumina-bookshelf-stats">
                    <span id="bookshelfStatsText">展示 0 本书</span>
                </div>
                <div class="lumina-bookshelf-main">
                    <div class="lumina-bookshelf-view" id="bookshelfListView">
                        <div id="bookshelfBookContainer"></div>
                    </div>
                    <div class="lumina-bookshelf-view lumina-bookshelf-detail hidden" id="bookshelfDetailView">
                        <div class="lumina-bookshelf-detail-header">
                            <div class="lumina-bookshelf-detail-book">
                                <div class="lumina-bookshelf-detail-cover" id="bookshelfDetailCover"></div>
                                <div class="lumina-bookshelf-detail-meta">
                                    <div class="lumina-bookshelf-detail-title" id="bookshelfDetailTitle"></div>
                                    <div class="lumina-bookshelf-detail-author" id="bookshelfDetailAuthor"></div>
                                    <div class="lumina-bookshelf-detail-badges">
                                        <span class="lumina-bookshelf-detail-badge" id="bookshelfDetailStatus"></span>
                                        <span class="lumina-bookshelf-detail-badge" id="bookshelfDetailType"></span>
                                    </div>
                                    <div class="lumina-bookshelf-detail-stats">
                                        <span class="lumina-bookshelf-detail-stat">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            <span id="bookshelfDetailYear"></span>
                                        </span>
                                        <span class="lumina-bookshelf-detail-stat">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                                            <span>划线 <span id="bookshelfDetailHighlights"></span></span>
                                        </span>
                                        <span class="lumina-bookshelf-detail-stat">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                                            <span>想法 <span id="bookshelfDetailIdeas"></span></span>
                                        </span>
                                        <span class="lumina-bookshelf-detail-stat">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            <span id="bookshelfDetailReadTime"></span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button class="lumina-bookshelf-detail-back top-right" id="bookshelfDetailBack">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
                                返回书架
                            </button>
                        </div>
                        <div class="lumina-bookshelf-detail-content">
                            <div class="lumina-bookshelf-masonry" id="bookshelfDetailNotes"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this._bindBookshelfEvents();
        this._refreshBookshelfList();
    }

    _refreshBookshelfList() {
        const container = this.container.querySelector('#bookshelfBookContainer');
        const statsText = this.container.querySelector('#bookshelfStatsText');
        if (!container) return;
        const filtered = this._getFilteredBooks();
        const years = [...new Set(filtered.map(b => b.year))].sort((a, b) => b - a);
        const groupByYear = this.container.querySelector('#bookshelfYearToggle')?.checked ?? true;
        if (filtered.length === 0) {
            if (statsText) statsText.textContent = '没有找到符合条件的书籍';
        } else if (groupByYear) {
            if (statsText) statsText.textContent = `展示 ${filtered.length} 本书 · ${years.length}个年份分组`;
        } else {
            if (statsText) statsText.textContent = `展示 ${filtered.length} 本书`;
        }
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="lumina-bookshelf-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                    <p>没有找到符合条件的书籍</p>
                </div>
            `;
            return;
        }
        let html = '';
        if (groupByYear) {
            years.forEach((year, yi) => {
                const yearBooks = filtered.filter(b => b.year === year);
                html += `
                    <section class="lumina-bookshelf-year-section">
                        <div class="lumina-bookshelf-year-header">
                            <span class="lumina-bookshelf-year-title">${year}</span>
                            <span class="lumina-bookshelf-year-line"></span>
                            <span class="lumina-bookshelf-year-count">${yearBooks.length} 本</span>
                        </div>
                        <div class="lumina-bookshelf-grid">
                            ${yearBooks.map((b, bi) => this._renderBookCard(b, yi * 100 + bi)).join('')}
                        </div>
                    </section>
                `;
            });
        } else {
            html += `<div class="lumina-bookshelf-grid">${filtered.map((b, i) => this._renderBookCard(b, i)).join('')}</div>`;
        }
        container.innerHTML = html;
    }

    _getFilteredBooks() {
        const search = this.bookshelfSearch || '';
        const filters = this.bookshelfFilters || { type: 'all', status: 'read+reading', sort: 'time' };
        let result = this.books.filter(b => {
            if (search) {
                const q = search.toLowerCase();
                if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
            }
            if (filters.type !== 'all' && b.type !== filters.type) return false;
            if (filters.status !== 'all') {
                if (filters.status === 'read+reading') {
                    if (b.readStatus !== 'read' && b.readStatus !== 'reading') return false;
                } else if (b.readStatus !== filters.status) return false;
            }
            return true;
        });
        result.sort((a, b) => {
            if (filters.sort === 'time') {
                if (!a.readTime && !b.readTime) return 0;
                if (!a.readTime) return 1;
                if (!b.readTime) return -1;
                return new Date(b.readTime) - new Date(a.readTime);
            }
            if (filters.sort === 'name') return a.title.localeCompare(b.title, 'zh');
            if (filters.sort === 'author') return a.author.localeCompare(b.author, 'zh');
            return 0;
        });
        return result;
    }

    _renderBookCard(b, index) {
        const statusClass = b.readStatus === 'read' ? 'done' : b.readStatus === 'reading' ? 'reading' : 'unread';
        const statusText = b.readStatus === 'read' ? '已读' : b.readStatus === 'reading' ? '在读' : '未读';
        const timeText = b.readTime ? `最近阅读 ${b.readTime}` : '最近阅读 —';
        let coverHtml = '';
        if (b.coverImage) {
            coverHtml = `<img src="${b.coverImage}" alt="${b.title}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            let coverInner = '';
            if (b.coverClass === 'effortless') {
                coverInner = `<div class="c-en">Effortless</div><div class="c-line"></div><div class="c-cn">轻松主义</div><div class="c-sub">让关键的事情变得容易做</div>`;
            } else if (b.coverClass === 'antifragile') {
                coverInner = `<div class="c-cn">反脆弱</div><div class="c-en">Antifragile</div>`;
            } else if (b.coverClass === 'amusing') {
                coverInner = `<div class="c-stamp">娱乐<br>至死</div><div class="c-cn">娱乐至死</div>`;
            } else if (b.coverClass === 'autumn') {
                coverInner = `<div class="c-leaf"></div><div class="c-cn">秋叶集</div>`;
            } else if (b.coverClass === 'method') {
                coverInner = `<div class="blk"></div><div class="blk"></div><div class="blk"></div><div class="blk"></div><div class="m-text"><div class="cn">谈谈方法</div></div>`;
            }
            coverHtml = `<div class="lumina-bookshelf-cover-inner ${b.coverClass}">${coverInner}</div>`;
        }
        return `
            <div class="lumina-bookshelf-card lumina-bookshelf-animate" style="--i: ${index}" data-book-id="${b.id}">
                <div class="lumina-bookshelf-cover">${coverHtml}</div>
                <div class="lumina-bookshelf-info">
                    <div class="lumina-bookshelf-title">${b.title}</div>
                    <div class="lumina-bookshelf-author">${b.author}</div>
                    <div class="lumina-bookshelf-tags">
                        <span class="lumina-bookshelf-tag">${b.type === 'book' ? '图书' : '文章'}</span>
                        <span class="lumina-bookshelf-tag-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="lumina-bookshelf-stats-line">
                        <span>划线 ${b.highlights}</span><span class="lumina-bookshelf-stat-dot">·</span><span>想法 ${b.ideas}</span>
                    </div>
                    <div class="lumina-bookshelf-time">${timeText}</div>
                </div>
            </div>
        `;
    }

    _bindBookshelfEvents() {
        const container = this.container.querySelector('#bookshelfContainer');
        if (!container) return;

        // 搜索
        const searchInput = container.querySelector('#bookshelfSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.bookshelfSearch = e.target.value.trim();
                this._refreshBookshelfList();
            });
        }

        // 下拉菜单
        container.querySelectorAll('.lumina-bookshelf-filter-btn[data-dropdown]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = btn.dataset.dropdown;
                const dropdown = container.querySelector(`#bookshelfDropdown${name.charAt(0).toUpperCase() + name.slice(1)}`);
                container.querySelectorAll('.lumina-bookshelf-dropdown').forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
                container.querySelectorAll('.lumina-bookshelf-filter-btn').forEach(b => { if (b !== btn) b.classList.remove('open'); });
                if (dropdown) dropdown.classList.toggle('show');
                btn.classList.toggle('open');
            });
        });

        // 下拉选项
        container.querySelectorAll('.lumina-bookshelf-dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const dropdown = item.closest('.lumina-bookshelf-dropdown');
                const filterType = dropdown.id.replace('bookshelfDropdown', '').toLowerCase();
                const value = item.dataset.value;
                const label = item.textContent.trim();
                this.bookshelfFilters[filterType] = value;
                const labelEl = container.querySelector(`#bookshelfLabel${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
                if (labelEl) labelEl.textContent = label;
                dropdown.querySelectorAll('.lumina-bookshelf-dropdown-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                dropdown.classList.remove('show');
                const btn = container.querySelector(`#bookshelfBtn${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`);
                if (btn) btn.classList.remove('open');
                this._refreshBookshelfList();
            });
        });

        // 按年份切换
        const yearToggle = container.querySelector('#bookshelfYearToggle');
        if (yearToggle) {
            yearToggle.addEventListener('change', () => {
                this.bookshelfGroupByYear = yearToggle.checked;
                this._refreshBookshelfList();
            });
        }

        // 点击外部关闭下拉
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.lumina-bookshelf-filter-group')) {
                container.querySelectorAll('.lumina-bookshelf-dropdown').forEach(d => d.classList.remove('show'));
                container.querySelectorAll('.lumina-bookshelf-filter-btn').forEach(b => b.classList.remove('open'));
            }
        });

        // 右键菜单
        container.addEventListener('contextmenu', (e) => {
            const card = e.target.closest('.lumina-bookshelf-card');
            if (!card) return;
            e.preventDefault();
            const bookId = card.dataset.bookId;
            if (!bookId) return;

            // 移除已有的菜单
            document.querySelectorAll('.lumina-bookshelf-context-menu').forEach(m => m.remove());

            const menu = document.createElement('div');
            menu.className = 'lumina-bookshelf-context-menu';
            menu.innerHTML = `
                <div class="lumina-bookshelf-context-menu-item" data-action="sync">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3"/></svg>
                    同步到思源
                </div>
                <div class="lumina-bookshelf-context-menu-divider"></div>
                <div class="lumina-bookshelf-context-menu-item danger" data-action="delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    删除图书
                </div>
            `;
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
            document.body.appendChild(menu);

            const closeMenu = () => menu.remove();
            const onClick = (ev) => {
                const item = ev.target.closest('.lumina-bookshelf-context-menu-item');
                if (!item) return;
                const action = item.dataset.action;
                closeMenu();
                if (action === 'delete') {
                    this._deleteBook(bookId);
                } else if (action === 'sync') {
                    this._syncBookToSiyuan(bookId);
                }
            };
            menu.addEventListener('click', onClick);
            setTimeout(() => {
                document.addEventListener('click', closeMenu, { once: true });
            }, 0);
        });

        // 点击图书卡片
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.lumina-bookshelf-card');
            if (card) {
                const bookId = card.dataset.bookId;
                if (bookId) this._openBookDetail(bookId);
            }
        });

        // 返回书架
        const backBtn = container.querySelector('#bookshelfDetailBack');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this._switchBookshelfView('list');
            });
        }

        // 导入按钮
        const importBtn = container.querySelector('#bookshelfImportBtn');
        const importInput = container.querySelector('#bookshelfImportInput');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => {
                importInput.click();
            });
            importInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                await this._importBooksFromJson(file);
                importInput.value = '';
            });
        }
    }

    _switchBookshelfView(viewName) {
        const listView = this.container.querySelector('#bookshelfListView');
        const detailView = this.container.querySelector('#bookshelfDetailView');
        if (!listView || !detailView) return;
        if (viewName === 'list') {
            listView.classList.remove('hidden');
            detailView.classList.remove('active');
            setTimeout(() => detailView.classList.add('hidden'), 200);
            this.bookshelfCurrentView = 'list';
        } else if (viewName === 'detail') {
            detailView.classList.remove('hidden');
            setTimeout(() => detailView.classList.add('active'), 10);
            listView.classList.add('hidden');
            this.bookshelfCurrentView = 'detail';
        }
    }

    _openBookDetail(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        const container = this.container.querySelector('#bookshelfContainer');
        if (!container) return;

        container.querySelector('#bookshelfDetailTitle').textContent = book.title;
        container.querySelector('#bookshelfDetailAuthor').textContent = book.author;
        const statusEl = container.querySelector('#bookshelfDetailStatus');
        statusEl.textContent = book.readStatus === 'read' ? '已读' : book.readStatus === 'reading' ? '在读' : '未读';
        statusEl.className = `lumina-bookshelf-detail-badge ${book.readStatus === 'read' ? 'done' : book.readStatus === 'reading' ? 'reading' : 'unread'}`;
        container.querySelector('#bookshelfDetailType').textContent = book.type === 'book' ? '图书' : '文章';
        container.querySelector('#bookshelfDetailYear').textContent = book.year;
        container.querySelector('#bookshelfDetailHighlights').textContent = book.highlights;
        container.querySelector('#bookshelfDetailIdeas').textContent = book.ideas;
        container.querySelector('#bookshelfDetailReadTime').textContent = book.readTime ? `最近阅读 ${book.readTime}` : '最近阅读 —';

        if (book.coverImage) {
            container.querySelector('#bookshelfDetailCover').innerHTML = `<img src="${book.coverImage}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
        } else {
            let coverInner = '';
            if (book.coverClass === 'effortless') {
                coverInner = `<div class="c-en">Effortless</div><div class="c-line"></div><div class="c-cn">轻松主义</div><div class="c-sub">让关键的事情变得容易做</div>`;
            } else if (book.coverClass === 'antifragile') {
                coverInner = `<div class="c-cn">反脆弱</div><div class="c-en">Antifragile</div>`;
            } else if (book.coverClass === 'amusing') {
                coverInner = `<div class="c-stamp">娱乐<br>至死</div><div class="c-cn">娱乐至死</div>`;
            } else if (book.coverClass === 'autumn') {
                coverInner = `<div class="c-leaf"></div><div class="c-cn">秋叶集</div>`;
            } else if (book.coverClass === 'method') {
                coverInner = `<div class="blk"></div><div class="blk"></div><div class="blk"></div><div class="blk"></div><div class="m-text"><div class="cn">谈谈方法</div></div>`;
            }
            container.querySelector('#bookshelfDetailCover').innerHTML = `<div class="lumina-bookshelf-cover-inner ${book.coverClass}">${coverInner}</div>`;
        }

        const notesContainer = container.querySelector('#bookshelfDetailNotes');
        if (book.notes.length === 0) {
            notesContainer.innerHTML = `<div style="text-align:center;color:var(--b3-theme-on-surface-light);padding:40px 0;">暂无划线和想法</div>`;
        } else {
            notesContainer.innerHTML = book.notes.map((note, idx) => {
                const typeLabel = note.type === "highlight"
                    ? `<div class="lumina-bookshelf-note-type highlight">▌ 划线</div>`
                    : `<div class="lumina-bookshelf-note-type idea">💡 想法</div>`;
                const titleHtml = note.title ? `<div class="lumina-bookshelf-note-title">${note.title}</div>` : "";
                const tagsHtml = note.tags?.length
                    ? `<div class="lumina-bookshelf-note-tags">${note.tags.map(t => `<span class="lumina-bookshelf-note-tag">${t}</span>`).join("")}</div>`
                    : "";
                const quoteHtml = note.quote ? `<div class="lumina-bookshelf-note-quote"><p>${note.quote}</p></div>` : "";
                const thoughtHtml = note.thought ? `<div class="lumina-bookshelf-note-thought"><p>${note.thought}</p></div>` : "";
                return `
                    <div class="lumina-bookshelf-note-card" data-note-index="${idx}">
                        <div class="lumina-bookshelf-note-header">
                            <span class="lumina-bookshelf-note-time">${note.time}</span>
                            <div class="lumina-bookshelf-note-header-right">
                                ${typeLabel}
                                ${tagsHtml}
                                <button class="lumina-bookshelf-note-menu" data-note-index="${idx}">⋯</button>
                            </div>
                        </div>
                        ${titleHtml}${thoughtHtml}${quoteHtml}
                    </div>
                `;
            }).join("");
        }

        this._switchBookshelfView('detail');
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (listEl) listEl.scrollTop = 0;
        this.applyBookshelfFontConfig();

        // 绑定笔记卡片菜单事件
        if (notesContainer) {
            notesContainer.querySelectorAll('.lumina-bookshelf-note-menu').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const noteIndex = parseInt(btn.dataset.noteIndex);
                    this._showBookNoteMenu(bookId, noteIndex, btn);
                });
            });
        }
    }

    _showBookNoteMenu(bookId, noteIndex, triggerBtn) {
        document.querySelectorAll('.lumina-bookshelf-note-dropdown').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'lumina-bookshelf-note-dropdown';
        menu.innerHTML = `
            <div class="lumina-bookshelf-note-dropdown-item" data-action="sync">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.3"/></svg>
                同步到思源
            </div>
            <div class="lumina-bookshelf-note-dropdown-divider"></div>
            <div class="lumina-bookshelf-note-dropdown-item danger" data-action="delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                删除笔记
            </div>
        `;

        const rect = triggerBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.left = (rect.left - 100) + 'px';
        document.body.appendChild(menu);

        const closeMenu = () => menu.remove();
        const onClick = (ev) => {
            const item = ev.target.closest('.lumina-bookshelf-note-dropdown-item');
            if (!item) return;
            const action = item.dataset.action;
            closeMenu();
            if (action === 'delete') {
                this._deleteBookNote(bookId, noteIndex);
            } else if (action === 'sync') {
                this._syncBookNoteToSiyuan(bookId, noteIndex);
            }
        };
        menu.addEventListener('click', onClick);
        setTimeout(() => document.addEventListener('click', closeMenu, { once: true }), 0);
    }

    async _deleteBookNote(bookId, noteIndex) {
        const book = this.books.find(b => b.id === bookId);
        if (!book || !book.notes || noteIndex < 0 || noteIndex >= book.notes.length) return;
        this.confirmAboveMobileShell('确认删除', '确定要删除这条笔记吗？', async () => {
            const note = book.notes[noteIndex];
            book.notes.splice(noteIndex, 1);
            if (note.type === 'highlight') book.highlights = Math.max(0, (book.highlights || 0) - 1);
            if (note.type === 'thought') book.ideas = Math.max(0, (book.ideas || 0) - 1);
            await this.saveBooks();
            this._showBookDetail(bookId);
            showMessage('已删除笔记');
        });
    }

    async _syncBookNoteToSiyuan(bookId, noteIndex) {
        const book = this.books.find(b => b.id === bookId);
        if (!book || !book.notes || noteIndex < 0 || noteIndex >= book.notes.length) return;
        const note = book.notes[noteIndex];

        const cfg = this.bookshelfSyncConfig || {};
        const syncMode = cfg.syncMode || 'dailynote';
        const notebookId = cfg.syncNotebookId || '';
        const syncDocId = cfg.syncDocId || '';

        if (syncMode === 'dailynote' && !notebookId) {
            showMessage('请先在图书视图设置中配置日记笔记本');
            return;
        }
        if (syncMode === 'doc' && !syncDocId) {
            showMessage('请先在图书视图设置中配置同步目标文档ID');
            return;
        }

        try {
            const parts = [];
            if (note.title) parts.push(`**章节**: ${note.title}`);
            if (note.quote) parts.push(`> ${note.quote}`);
            if (note.thought) parts.push(`💡 ${note.thought}`);
            if (note.tags && note.tags.length) parts.push(`标签: ${note.tags.join(' ')}`);

            let content = parts.join('\n\n');
            if (!content.trim()) {
                showMessage('该笔记内容为空，无需同步');
                return;
            }

            const typeLabel = note.type === 'highlight' ? '划线' : '想法';
            const timeStr = note.time || '';
            const dateStr = timeStr.split(' ')[0] || new Date().toISOString().split('T')[0];

            let diaryContent = `> [!NOTE] 📖 《${book.title}》| ${typeLabel}${timeStr ? ' | ' + timeStr : ''}`;
            const lines = content.split('\n');
            for (const line of lines) {
                diaryContent += '\n> ' + line;
            }
            diaryContent += ' ';

            if (syncMode === 'dailynote') {
                const docId = await this.getOrCreateDailyNoteDoc(new Date(note.time || Date.now()), notebookId);
                if (!docId) {
                    showMessage('无法获取或创建日记文档');
                    return;
                }
                const response = await fetch('/api/block/appendBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parentID: docId,
                        dataType: 'markdown',
                        data: diaryContent
                    })
                });
                const result = await response.json();
                if (result.code !== 0) {
                    showMessage('同步失败: ' + result.msg);
                    return;
                }
            } else if (syncMode === 'doc') {
                const blockId = await this.appendToDocWithDateGroup(syncDocId, diaryContent, new Date(note.time || Date.now()).getTime());
                if (!blockId) {
                    showMessage('同步失败，请检查配置');
                    return;
                }
            }

            showMessage('已同步到思源笔记');
        } catch (e) {
            console.error('同步笔记到思源失败:', e);
            showMessage('同步失败');
        }
    }

    async _deleteBook(bookId) {
        this.confirmAboveMobileShell('确认删除', '确定要删除这本书吗？相关的划线和想法也将一并删除。', async () => {
            this.books = this.books.filter(b => b.id !== bookId);
            await this.saveBooks();
            this._refreshBookshelfList();
            showMessage('已删除图书');
        });
    }

    async _syncBookToSiyuan(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;
        if (!book.notes || book.notes.length === 0) {
            showMessage('该书没有划线和想法，无需同步');
            return;
        }

        const cfg = this.bookshelfSyncConfig || {};
        const syncMode = cfg.syncMode || 'dailynote';
        const notebookId = cfg.syncNotebookId || '';
        const syncDocId = cfg.syncDocId || '';

        if (syncMode === 'dailynote' && !notebookId) {
            showMessage('请先在图书视图设置中配置日记笔记本');
            return;
        }
        if (syncMode === 'doc' && !syncDocId) {
            showMessage('请先在图书视图设置中配置同步目标文档ID');
            return;
        }

        showMessage(`开始同步《${book.title}》的 ${book.notes.length} 条笔记...`);
        let successCount = 0;

        for (const note of book.notes) {
            try {
                const parts = [];
                if (note.title) parts.push(`**章节**: ${note.title}`);
                if (note.quote) parts.push(`> ${note.quote}`);
                if (note.thought) parts.push(`💡 ${note.thought}`);
                if (note.tags && note.tags.length) parts.push(`标签: ${note.tags.join(' ')}`);

                let content = parts.join('\n\n');
                if (!content.trim()) continue;

                const typeLabel = note.type === 'highlight' ? '划线' : '想法';
                const timeStr = note.time || '';
                const dateStr = timeStr.split(' ')[0] || new Date().toISOString().split('T')[0];

                let diaryContent = `> [!NOTE] 📖 《${book.title}》| ${typeLabel}${timeStr ? ' | ' + timeStr : ''}`;
                const lines = content.split('\n');
                for (const line of lines) {
                    diaryContent += '\n> ' + line;
                }
                diaryContent += ' ';

                if (syncMode === 'dailynote') {
                    const docId = await this.getOrCreateDailyNoteDoc(new Date(note.time || Date.now()), notebookId);
                    if (!docId) continue;
                    await fetch('/api/block/appendBlock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            parentID: docId,
                            dataType: 'markdown',
                            data: diaryContent
                        })
                    });
                } else if (syncMode === 'doc') {
                    await this.appendToDocWithDateGroup(syncDocId, diaryContent, new Date(note.time || Date.now()).getTime());
                }
                successCount++;
            } catch (e) {
                console.error('同步笔记失败:', e);
            }
        }

        showMessage(`同步完成：成功 ${successCount} / ${book.notes.length} 条笔记`);
    }

    // 从JSON文件导入微信读书笔记
    async _importBooksFromJson(file) {
        try {
            showMessage('正在导入图书数据...');
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data.books || !Array.isArray(data.books)) {
                showMessage('导入失败：JSON格式不正确，缺少books字段');
                return;
            }
            const parsedBooks = await this._parseWereadJson(data);
            if (parsedBooks.length === 0) {
                showMessage('导入失败：没有解析到有效的图书数据');
                return;
            }
            // 去重：根据bookId覆盖已有图书
            for (const newBook of parsedBooks) {
                const idx = this.books.findIndex(b => b.id === newBook.id);
                if (idx >= 0) {
                    this.books[idx] = newBook;
                } else {
                    this.books.push(newBook);
                }
            }
            await this.saveBooks();
            this._refreshBookshelfList();
            showMessage(`成功导入 ${parsedBooks.length} 本图书`);
        } catch (e) {
            console.error('导入图书失败:', e);
            showMessage('导入失败：' + (e.message || '未知错误'));
        }
    }

    // 解析微信读书JSON格式
    async _parseWereadJson(data) {
        const results = [];
        for (const book of data.books) {
            try {
                if (!book.bookId || !book.title) continue;
                // 下载封面图片并转为本地
                let localCover = null;
                if (book.cover) {
                    localCover = await this._downloadCoverImage(book.cover, book.bookId);
                }
                // 解析笔记
                const notes = [];
                let highlights = 0;
                let ideas = 0;
                if (book.notes && Array.isArray(book.notes)) {
                    for (const note of book.notes) {
                        const time = note.createTime ? this._formatWereadTime(note.createTime) : '';
                        if (note.type === 'mark') {
                            highlights++;
                            notes.push({
                                type: 'highlight',
                                time: time,
                                quote: note.markText || '',
                                thought: '',
                                tags: [`#resources/书籍/${book.title}`],
                                title: note.chapterTitle || ''
                            });
                        } else if (note.type === 'review') {
                            ideas++;
                            notes.push({
                                type: 'idea',
                                time: time,
                                quote: note.markText || '',
                                thought: note.thought || '',
                                tags: [`#resources/书籍/${book.title}`],
                                title: note.chapterTitle || ''
                            });
                        }
                    }
                }
                // 计算年份和最近阅读时间
                let year = new Date().getFullYear();
                let readTime = null;
                if (book.notes && book.notes.length > 0) {
                    const times = book.notes.map(n => n.createTime ? new Date(n.createTime) : null).filter(Boolean);
                    if (times.length > 0) {
                        times.sort((a, b) => b - a);
                        year = times[0].getFullYear();
                        readTime = this._formatWereadDate(times[0]);
                    }
                }
                // 如果没有笔记但有 cover，也给个默认样式
                const coverClass = this._getCoverClassForBook(book.title);
                results.push({
                    id: book.bookId,
                    title: book.title,
                    author: book.author || '未知作者',
                    coverClass: coverClass,
                    coverImage: localCover,
                    type: 'book',
                    syncStatus: 'synced',
                    readStatus: book.noteCount > 0 || book.reviewCount > 0 ? 'read' : 'unread',
                    year: year,
                    readTime: readTime,
                    highlights: highlights,
                    ideas: ideas,
                    notes: notes
                });
            } catch (e) {
                console.error('解析图书失败:', book.title, e);
            }
        }
        return results;
    }

    // 下载封面图片并转为本地assets
    async _downloadCoverImage(url, bookId) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) return null;
            const blob = await response.blob();
            const ext = blob.type.includes('png') ? 'png' : blob.type.includes('gif') ? 'gif' : 'jpg';
            const file = new File([blob], `${bookId}_cover.${ext}`, { type: blob.type });
            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);
            const uploadRes = await fetch('/api/asset/upload', {
                method: 'POST',
                body: formData
            });
            const result = await uploadRes.json();
            if (result.code === 0 && result.data && result.data.succMap && Object.keys(result.data.succMap).length > 0) {
                return Object.values(result.data.succMap)[0];
            }
            return null;
        } catch (e) {
            console.error('下载封面失败:', url, e);
            return null;
        }
    }

    // 格式化微信读书时间
    _formatWereadTime(isoTime) {
        try {
            const d = new Date(isoTime);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const h = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${day} ${h}:${min}`;
        } catch (e) {
            return isoTime || '';
        }
    }

    _formatWereadDate(date) {
        try {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        } catch (e) {
            return '';
        }
    }

    // 根据书名生成封面样式类
    _getCoverClassForBook(title) {
        const hash = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const classes = ['effortless', 'antifragile', 'amusing', 'autumn', 'method'];
        return classes[hash % classes.length];
    }

    _formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        if (typeof bytes === 'string') return bytes;
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

    // 打开指定文档
    openDoc(docId) {
        try {
            openTab({
                app: this.app,
                doc: {
                    id: docId,
                    action: ["cb-get-all"]
                }
            });
        } catch (e) {
            console.error('打开文档失败:', e);
            showMessage('打开文档失败: ' + e.message);
        }
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
                    
                    // 自定义 emoji 是图片路径，内置 emoji 是 unicode 十六进制代码
                    const isCustomEmoji = /\.(png|gif|jpg|jpeg|webp)$/i.test(unicode);
                    
                    // 调试：检查看起来无效的 unicode 值（排除自定义 emoji 图片路径）
                    if (unicode && !isCustomEmoji && !unicode.match(/^[\da-fA-F\s_\-U\+]+$/)) {
                        console.warn('Emoji 包含非十六进制字符:', unicode, '描述:', desc);
                    }
                    
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

    // 生成月度分布内容
    generateMonthlyDistributionContent(year) {
        const monthlyCounts = new Array(12).fill(0);
        this.shuoshuos.forEach(note => {
            const date = new Date(note.created);
            if (date.getFullYear() === year) {
                monthlyCounts[date.getMonth()]++;
            }
        });

        const totalYear = monthlyCounts.reduce((a, b) => a + b, 0);
        const maxCount = Math.max(...monthlyCounts);
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        let barsHtml = '';
        monthlyCounts.forEach((count, index) => {
            const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
            const monthNum = (index + 1).toString().padStart(2, '0');
            const tooltip = `${year}-${monthNum}: ${count}条`;
            barsHtml += `
                <div class="north-shuoshuo-monthly-bar" data-lumina-tip="${tooltip}">
                    <div class="north-shuoshuo-monthly-bar-bg">
                        <div class="north-shuoshuo-monthly-bar-fill" style="height: ${percentage}%"></div>
                    </div>
                    <span class="north-shuoshuo-monthly-bar-count">${count > 0 ? count : '0'}</span>
                    <span class="north-shuoshuo-monthly-bar-label">${months[index]}</span>
                </div>
            `;
        });

        return `
            <div class="north-shuoshuo-distribution-section">
                <div class="north-shuoshuo-distribution-header">
                    <span>月度分布</span>
                    <span class="north-shuoshuo-distribution-subtitle">${year} 年共 ${totalYear} 条</span>
                </div>
                <div class="north-shuoshuo-monthly-distribution">
                    ${barsHtml}
                </div>
            </div>
        `;
    }

    // 获取标签图标 HTML
    getTagIconHtml(tagName) {
        const iconConfig = this.tagIcons[tagName] || '';
        if (iconConfig && iconConfig.startsWith('icon:')) {
            const parts = iconConfig.substring(5).split(':');
            const type = parts[0];
            if (type === 'dynamic') {
                const dynamicType = parts[1] || '1';
                return `<img class="north-shuoshuo-tag-dynamic-icon" src="/api/icon/getDynamicIcon?type=${dynamicType}&color=%232ecc71" alt="icon">`;
            } else if (type === 'customEmoji') {
                const emojiPath = decodeURIComponent(parts[1] || '');
                return `<img class="north-shuoshuo-tag-dynamic-icon" src="/emojis/${emojiPath}" alt="emoji">`;
            } else {
                let content = decodeURIComponent(parts[0] || '');
                const color = parts[1] || '#2ecc71';
                content = this.convertHexToEmoji(content);
                const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
                if (isEmoji) {
                    return `<span class="north-shuoshuo-tag-emoji">${content}</span>`;
                } else {
                    return `<img class="north-shuoshuo-tag-dynamic-icon" src="/api/icon/getDynamicIcon?type=8&color=${encodeURIComponent(color)}&content=${encodeURIComponent(content)}" alt="${content}">`;
                }
            }
        }
        return `<span class="north-shuoshuo-tag-icon-default">#</span>`;
    }

    // 生成最常用标签 Top 10
    generateTopTagsContent() {
        const tagCounts = {};
        this.shuoshuos.forEach(note => {
            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const maxCount = sortedTags.length > 0 ? sortedTags[0][1] : 0;

        let html = `
            <div class="north-shuoshuo-distribution-section">
                <div class="north-shuoshuo-distribution-header">最常用标签 Top 10</div>
                <div class="north-shuoshuo-word-distribution">
        `;
        if (sortedTags.length === 0) {
            html += `<div style="text-align:center;color:var(--b3-theme-on-surface-light);padding:20px 0;">暂无标签数据</div>`;
        } else {
            sortedTags.forEach(([tag, count]) => {
                const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
                const iconHtml = this.getTagIconHtml(tag);
                html += `
                    <div class="north-shuoshuo-word-bar">
                        <span class="north-shuoshuo-word-label">${iconHtml} ${tag}</span>
                        <div class="north-shuoshuo-word-bar-bg">
                            <div class="north-shuoshuo-word-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="north-shuoshuo-word-count">${count} 条</span>
                    </div>
                `;
            });
        }
        html += '</div></div>';
        return html;
    }

    // 生成标签云
    generateTagCloudContent() {
        const tagCounts = {};
        this.shuoshuos.forEach(note => {
            if (note.tags && note.tags.length > 0) {
                note.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]);

        if (sortedTags.length === 0) {
            return `<div class="north-shuoshuo-distribution-section">
                <div class="north-shuoshuo-distribution-header">标签云</div>
                <div style="text-align:center;color:var(--b3-theme-on-surface-light);padding:20px 0;">暂无标签数据</div>
            </div>`;
        }

        const tagsHtml = sortedTags.map(([tag, count]) => {
            const iconHtml = this.getTagIconHtml(tag);
            const style = this.getTagColorStyle(tag);
            return `<span class="north-shuoshuo-tag-cloud-item" style="${style}">${iconHtml} ${tag}<sup class="north-shuoshuo-tag-cloud-count">${count}</sup></span>`;
        }).join('');

        return `
            <div class="north-shuoshuo-distribution-section">
                <div class="north-shuoshuo-distribution-header">标签云</div>
                <div class="north-shuoshuo-tag-cloud">
                    ${tagsHtml}
                </div>
            </div>
        `;
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

    // 生成大型热力图（GitHub 风格贡献图）
    generateLargeHeatmap(year = null) {
        const today = new Date();
        const targetYear = year || today.getFullYear();

        // 确定起始日期（该年1月1日之前的第一个周日）
        const yearStart = new Date(targetYear, 0, 1);
        const startDate = new Date(yearStart);
        startDate.setDate(yearStart.getDate() - yearStart.getDay());

        // 确定结束日期（该年12月31日）
        const yearEnd = new Date(targetYear, 11, 31);

        // 计算总天数和周数
        const totalDays = Math.floor((yearEnd - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const weeks = Math.ceil(totalDays / 7);

        // 生成每列（每周）
        let columnsHtml = '';
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        for (let week = 0; week < weeks; week++) {
            let columnCells = '';

            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);

                if (date.getFullYear() === targetYear) {
                    const count = this.getNoteCountByDate(date);
                    let level = 0;
                    if (count >= 1) level = 2;
                    if (count >= 3) level = 3;
                    if (count >= 5) level = 4;

                    const dateStr = this.formatDateKey(date);
                    const tooltip = `${dateStr}: ${count}条记录`;
                    columnCells += `<div class="north-shuoshuo-contribution-cell level-${level}" data-date="${dateStr}" title="${tooltip}"></div>`;
                } else {
                    columnCells += `<div class="north-shuoshuo-contribution-cell level-empty"></div>`;
                }
            }

            columnsHtml += `<div class="north-shuoshuo-contribution-column">${columnCells}</div>`;
        }

        // 计算每个月份覆盖的周范围，标签放在中间位置
        const monthStartWeek = new Array(12).fill(-1);
        const monthEndWeek = new Array(12).fill(-1);

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);
                if (date.getFullYear() === targetYear) {
                    const m = date.getMonth();
                    if (monthStartWeek[m] === -1) monthStartWeek[m] = week;
                    monthEndWeek[m] = week;
                }
            }
        }

        // 计算每个月份标签的位置（百分比定位，基于该月中间周）
        const monthLabels = [];
        for (let m = 0; m < 12; m++) {
            if (monthStartWeek[m] !== -1) {
                const midWeek = (monthStartWeek[m] + monthEndWeek[m]) / 2;
                const leftPercent = ((midWeek + 0.5) / weeks * 100).toFixed(2) + '%';
                monthLabels.push({ name: monthNames[m], left: leftPercent });
            }
        }

        // 生成月份标签 HTML（绝对定位）
        const monthsHtml = monthLabels.map(l =>
            `<span class="north-shuoshuo-contribution-month-label" style="left: ${l.left};">${l.name}</span>`
        ).join('');

        return {
            columns: columnsHtml,
            months: monthsHtml,
            weeks: weeks
        };
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
            
            // 粘贴图片
            input.addEventListener('paste', (e) => {
                this.handlePasteImage(e, input);
            });
        }

        // 输入监听，控制发送按钮，并自动转换列表符?
        if (input && sendBtn) {
            const autoResize = () => {
                input.style.height = 'auto';
                const newHeight = Math.max(60, input.scrollHeight);
                const maxHeight = 300; // 与CSS中的max-height保持一致
                input.style.height = Math.min(newHeight, maxHeight) + 'px';
            };
            input.addEventListener('input', () => {
                if (input.value.trim().length > 0) {
                    sendBtn.classList.add('active');
                } else {
                    sendBtn.classList.remove('active');
                }
                
                requestAnimationFrame(autoResize);
                
                // 处理 @ 快速引用
                this.handleMentionInput(input);
            });

            // Enter 换行/提交，支持列表自动延?
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.enterToSubmit && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    this.sendMessage(input.closest('.north-shuoshuo-flomo-area') || input.closest('.north-shuoshuo-container') || this.container);
                    return;
                }

                if (e.key === 'Enter' && !(e.ctrlKey || e.metaKey)) {
                    const cursorPos = input.selectionStart;
                    const value = input.value;
                    const beforeCursor = value.substring(0, cursorPos);
                    const afterCursor = value.substring(cursorPos);
                    
                    // 获取当前行
                    const lines = beforeCursor.split('\n');
                    const currentLine = lines[lines.length - 1];
                    
                    // 检查是否是无序列表（排除任务列表）
                    const unorderedMatch = currentLine.match(/^(•\s|-\s(?!\[)|\*\s)(.*)$/);
                    // 检查是否是任务列表
                    const taskMatch = currentLine.match(/^(- \[[ x]\]\s?)(.*)$/);
                    // 检查是否是有序列表
                    const orderedMatch = currentLine.match(/^(\d+)\.\s(.*)$/);

                    if (taskMatch) {
                        if (!taskMatch[2].trim()) {
                            e.preventDefault();
                            lines[lines.length - 1] = '';
                            input.value = lines.join('\n') + '\n' + afterCursor;
                            const newPos = lines.join('\n').length + 1;
                            input.setSelectionRange(newPos, newPos);
                            return;
                        }
                        e.preventDefault();
                        const newLine = '\n' + taskMatch[1];
                        input.value = beforeCursor + newLine + afterCursor;
                        input.setSelectionRange(cursorPos + newLine.length, cursorPos + newLine.length);
                        return;
                    }

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
                        const newLine = '\n' + unorderedMatch[1];
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
                    this.sendMessage(input.closest('.north-shuoshuo-flomo-area') || input.closest('.north-shuoshuo-container') || this.container);
                }
            });
        }

        // 发送按?
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage(sendBtn.closest('.north-shuoshuo-flomo-area') || sendBtn.closest('.north-shuoshuo-container') || this.container);
            });
        }

        // 笔记卡片菜单
        const listEl = this.container.querySelector('#shuoshuo-notes-list');
        if (listEl) {
            // LifeLog 卡片右键菜单
            listEl.addEventListener('contextmenu', (e) => {
                const lifeLogCard = e.target.closest('.north-shuoshuo-note-card.lifelog-record');
                if (lifeLogCard) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = lifeLogCard.dataset.id;
                    if (id) {
                        this.showLifeLogMenu(id, lifeLogCard, e.clientX, e.clientY);
                    }
                }
            });

            listEl.addEventListener('click', (e) => {
                // 处理图片点击 - 打开图片预览
                const imgEl = e.target.closest('.north-shuoshuo-note-card img');
                if (imgEl) {
                    e.stopPropagation();
                    e.preventDefault();
                    const imgSrc = imgEl.getAttribute('src');
                    if (imgSrc) {
                        this.showImagePreview(imgSrc);
                    }
                    return;
                }

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
                    return;
                }

                // 处理任务列表复选框点击
                const taskCheckbox = e.target.closest('.shuoshuo-task-checkbox');
                if (taskCheckbox) {
                    e.stopPropagation();
                    const taskItem = taskCheckbox.closest('.task-item');
                    const noteCard = taskCheckbox.closest('.north-shuoshuo-note-card');
                    if (taskItem && noteCard) {
                        const shuoshuoId = noteCard.dataset.id;
                        // 获取当前任务在卡片所有任务项中的索引
                        const taskItems = noteCard.querySelectorAll('.task-item');
                        const taskIndex = Array.from(taskItems).indexOf(taskItem);
                        if (shuoshuoId && taskIndex !== -1) {
                            this.toggleTaskCheckbox(shuoshuoId, taskIndex);
                        }
                    }
                    return;
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
                const container = item.closest('.north-shuoshuo-flomo-area') || item.closest('.north-shuoshuo-container') || this.container;
                this.container = container;
                this.switchMainView(view, item);
            });
        });

        // 移动端底部 Tab 栏切换视图
        const mobileTabItems = this.container.querySelectorAll('.north-shuoshuo-mobile-tabbar .mobile-tab-item[data-view]');
        mobileTabItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                const container = item.closest('.north-shuoshuo-flomo-area') || item.closest('.north-shuoshuo-container') || this.container;
                this.container = container;
                this.switchMainView(view, null);
            });
        });

        // 移动端顶部加号按钮：显示/隐藏输入框
        const mobileAddBtn = this.container.querySelector('#shuoshuo-mobile-add');
        const inputArea = this.container.querySelector('#shuoshuo-input-area');
        if (mobileAddBtn && inputArea) {
            mobileAddBtn.addEventListener('click', () => {
                const isVisible = inputArea.classList.toggle('mobile-visible');
                if (isVisible) {
                    const input = inputArea.querySelector('#shuoshuo-input');
                    if (input) input.focus();
                }
            });
        }

        // 移动端汉堡菜单：打开/关闭抽屉侧边栏
        const mobileMenuBtn = this.container.querySelector('#shuoshuo-mobile-menu');
        const flomoSidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
        const openDrawer = () => {
            const host = this.container.querySelector('.north-shuoshuo-container') || this.container;
            if (host instanceof HTMLElement) {
                const hostPosition = window.getComputedStyle(host).position;
                if (hostPosition === 'static') host.style.position = 'relative';
            }
            if (flomoSidebar) {
                flomoSidebar.classList.add('drawer-open');
                flomoSidebar.style.zIndex = '30';
            }
            let overlay = this.container.querySelector('.north-shuoshuo-drawer-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'north-shuoshuo-drawer-overlay';
                overlay.style.cssText = 'position:absolute;inset:0;z-index:20;background:rgba(15,23,42,.32);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .2s ease;';
                host.appendChild(overlay);
                overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeDrawer();
                }, true);
            }
            overlay.classList.add('show');
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'auto';
        };
        const closeDrawer = () => {
            if (flomoSidebar) {
                flomoSidebar.classList.remove('drawer-open');
                flomoSidebar.style.removeProperty('z-index');
            }
            const overlay = this.container.querySelector('.north-shuoshuo-drawer-overlay');
            if (overlay) {
                overlay.classList.remove('show');
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    if (overlay && !overlay.classList.contains('show')) {
                        overlay.remove();
                    }
                }, 300);
            }
        };
        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);

        // 移动端搜索按钮：显示/隐藏搜索栏
        const mobileSearchBtn = this.container.querySelector('#shuoshuo-mobile-search');
        const mobileSearchBar = this.container.querySelector('#shuoshuo-mobile-search-bar');
        const mobileSearchInput = this.container.querySelector('#shuoshuo-mobile-search-input');
        const mobileSearchClose = this.container.querySelector('#shuoshuo-mobile-search-close');
        if (mobileSearchBtn && mobileSearchBar) {
            mobileSearchBtn.addEventListener('click', () => {
                mobileSearchBar.classList.toggle('show');
                if (mobileSearchBar.classList.contains('show') && mobileSearchInput) {
                    mobileSearchInput.focus();
                }
            });
        }
        if (mobileSearchClose && mobileSearchBar) {
            mobileSearchClose.addEventListener('click', () => {
                mobileSearchBar.classList.remove('show');
                if (mobileSearchInput) mobileSearchInput.value = '';
                const origSearchInput = this.container.querySelector('#shuoshuo-search-input');
                if (origSearchInput) origSearchInput.value = '';
                this.filterQuery = null;
                this.renderNotes();
            });
        }
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                const origSearchInput = this.container.querySelector('#shuoshuo-search-input');
                if (origSearchInput) origSearchInput.value = value;
                clearTimeout(this._mobileSearchDebounce);
                this._mobileSearchDebounce = setTimeout(() => {
                    if (value.trim()) {
                        this.filterQuery = null;
                        this.selectedTag = null;
                        this.selectedDate = null;
                        this.container.querySelectorAll('.north-shuoshuo-heatmap-cell').forEach(c => c.classList.remove('selected'));
                        this.container.querySelectorAll('.north-shuoshuo-tag-tree-item').forEach(t => t.classList.remove('selected'));
                        this.container.querySelectorAll('.north-shuoshuo-query-item').forEach(item => item.classList.remove('selected'));
                        this.container.querySelectorAll('.north-shuoshuo-menu-item').forEach(item => item.classList.remove('active'));
                        this.renderNotes();
                    } else if (!value && this.filterQuery === null) {
                        this.renderNotes();
                    }
                }, 250);
            });
            mobileSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    mobileSearchBar.classList.remove('show');
                }
            });
        }

        // 工具栏按?
        this.bindToolbarEvents();

        // Flomo 侧边栏菜单点击
        const menuItems = this.container.querySelectorAll('.north-shuoshuo-menu-list .north-shuoshuo-menu-item[data-view]');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                const container = item.closest('.north-shuoshuo-flomo-area') || item.closest('.north-shuoshuo-container') || this.container;
                this.container = container;
                
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
                
                // 清除检索式选中
                this.filterQuery = null;
                this.container.querySelectorAll('.north-shuoshuo-query-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 切换视图（active 状态由 switchMainView 统一处理）
                this.switchMainView(view, null);
            });
        });

        // 标签点击筛选和展开/折叠
        const tagsListEl = this.container.querySelector('.north-shuoshuo-tags-list');
        if (tagsListEl) {
            // 单独处理 hover 背景，避免 CSS :hover 冒泡到祖先标签项
            tagsListEl.addEventListener('mouseover', (e) => {
                const tagItem = e.target.closest('.north-shuoshuo-tag-tree-item');
                if (!tagItem) return;
                // 清除其他标签项的 hover
                tagsListEl.querySelectorAll('.north-shuoshuo-tag-item-hovered').forEach(el => {
                    el.classList.remove('north-shuoshuo-tag-item-hovered');
                });
                const content = tagItem.children[0];
                if (content && content.classList.contains('north-shuoshuo-tag-item-content')) {
                    content.classList.add('north-shuoshuo-tag-item-hovered');
                }
            });
            tagsListEl.addEventListener('mouseleave', () => {
                tagsListEl.querySelectorAll('.north-shuoshuo-tag-item-hovered').forEach(el => {
                    el.classList.remove('north-shuoshuo-tag-item-hovered');
                });
            });

            tagsListEl.addEventListener('click', (e) => {
                // 处理展开/折叠按钮点击
                const toggleBtn = e.target.closest('.north-shuoshuo-tag-toggle');
                if (toggleBtn) {
                    e.stopPropagation();
                    const targetId = toggleBtn.dataset.target;
                    if (!targetId) return;
                    const childrenEl = document.getElementById(targetId);
                    const tagItem = toggleBtn.closest('.north-shuoshuo-tag-tree-item');
                    if (childrenEl) {
                        const isExpanded = childrenEl.classList.contains('expanded');
                        if (isExpanded) {
                            childrenEl.classList.remove('expanded');
                            childrenEl.style.maxHeight = '0';
                        } else {
                            childrenEl.classList.add('expanded');
                            // 先设置实际高度以获得丝滑动画
                            const height = childrenEl.scrollHeight;
                            childrenEl.style.maxHeight = height + 'px';
                            // 动画结束后移除高度限制，确保内容可自适应
                            setTimeout(() => {
                                if (childrenEl.classList.contains('expanded')) {
                                    childrenEl.style.maxHeight = 'none';
                                }
                            }, 350);
                        }
                        if (tagItem) {
                            tagItem.classList.toggle('expanded', !isExpanded);
                        }
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
                        
                        // 清除检索式选中状态
                        this.container.querySelectorAll('.north-shuoshuo-query-item').forEach(item => {
                            item.classList.remove('selected');
                        });
                        this.filterQuery = null;

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

        // 检索式点击筛选
        const queryListEl = this.container.querySelector('.north-shuoshuo-query-list');
        if (queryListEl) {
            queryListEl.addEventListener('click', (e) => {
                const queryItem = e.target.closest('.north-shuoshuo-query-item');
                if (!queryItem) return;
                const query = queryItem.dataset.query;
                if (!query) return;
                
                const wasSelected = queryItem.classList.contains('selected');
                
                // 清除所有检索式选中
                queryListEl.querySelectorAll('.north-shuoshuo-query-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 清除标签选中状态
                this.container.querySelectorAll('.north-shuoshuo-tag-tree-item').forEach(item => {
                    item.classList.remove('selected');
                });
                this.selectedTag = null;
                
                if (wasSelected) {
                    this.filterQuery = null;
                    this.renderNotes();
                } else {
                    queryItem.classList.add('selected');
                    this.filterQuery = query;
                    this.renderNotes();
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
                        
                        // 清除检索式选中
                        this.filterQuery = null;
                        this.container.querySelectorAll('.north-shuoshuo-query-item').forEach(item => {
                            item.classList.remove('selected');
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
                    const tooltip = cell.dataset.luminaTip;
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

    sendMessage(container) {
        const target = container || this.container;
        const input = target.querySelector('#shuoshuo-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        this.addShuoshuo(text);

        input.value = '';
        input.style.height = 'auto';
        const sendBtn = target.querySelector('#shuoshuo-send');
        if (sendBtn) sendBtn.classList.remove('active');
        const inputBox = target.querySelector('#shuoshuo-input-box');
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

        // 只有开启自动同步时才插入日记，并保存 blockId
        // 指定文档模式下只单向同步，不保存 boundBlockId，避免思源端操作反向影响说说
        if (this.autoSync) {
            const blockId = await this.appendToDailyNote(content, shuoshuo.created);
            if (blockId && this.syncMode === 'dailynote') {
                shuoshuo.boundBlockId = blockId;
                await this.saveShuoshuos();
            }
        }

        this._lightweightRefreshAfterAdd(shuoshuo);
        showMessage("已记录");
    }

    // 提取标签（格式：#标签，只有开头有#，结尾没有#）
    extractTags(content) {
        // 匹配 #标签 格式（只有开头有#，结尾没有#，这才是标签）
        // 要求标签后面必须是：空格、换行、字符串结尾，或者是中文标点等分隔符
        // 避免将 #类型# 中的部分内容（如 #学）误判为标签
        const tagRegex = /#([\w\/\u4e00-\u9fa5-]+)(?=\s|\n|$|[，。！？；：""''（）【】])/g;
        const tags = [];
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            const tag = match[1].trim();
            // 过滤掉纯数字、空字符串
            if (tag && !/^\d+$/.test(tag)) {
                tags.push(tag);
            }
        }
        return [...new Set(tags)]; // 去重
    }

    // 提取类型（#类型# 格式，前后都有#号）
    extractType(content) {
        if (!content) return '';
        
        // 优先识别开头 "类型：" 格式（只在内容开头有效，仅限中文字符 + 全角冒号）
        const prefixMatch = content.trim().match(/^([\u4e00-\u9fa5]+)[：]\s*/);
        if (prefixMatch) {
            const type = prefixMatch[1].trim();
            if (type && !/^\d+$/.test(type)) {
                return type;
            }
        }
        
        // 识别 "时间 类型：内容" 格式（如 09:44 记录：内容，来自思源同步）
        const timeTypeMatch = content.trim().match(/^\d{1,2}:\d{2}\s+([\u4e00-\u9fa5]+)[：]\s*/);
        if (timeTypeMatch) {
            const type = timeTypeMatch[1].trim();
            if (type && !/^\d+$/.test(type)) {
                return type;
            }
        }
        
        // 兼容旧的 #类型# 格式
        const typeRegex = /#([\w\u4e00-\u9fa5-]+)#/g;
        const types = [];
        let match;
        while ((match = typeRegex.exec(content)) !== null) {
            const type = match[1].trim();
            if (type && !/^\d+$/.test(type)) {
                types.push(type);
            }
        }
        // 返回第一个匹配的类型，如果没有则返回空字符串
        return types.length > 0 ? types[0] : '';
    }

    /**
     * 在旧内容模板中，用新纯内容替换旧纯内容，保持标签和类型的相对位置不变
     * @param {string} oldContent - 旧说说内容（含标签和类型）
     * @param {string} newPureContent - 新的纯内容（不含标签和类型）
     * @returns {string} 新说说内容
     */
    rebuildContentWithNewPureContent(oldContent, newPureContent) {
        if (!oldContent) return newPureContent || '';

        // 辅助函数：规范化行内空白，但保留换行结构
        const normalizeSpaces = (text) => {
            return text.split('\n').map(line => line.replace(/\s+/g, ' ').trim()).join('\n').trim();
        };

        newPureContent = normalizeSpaces(newPureContent || '');

        const oldTags = this.extractTags(oldContent);
        const oldType = this.extractType(oldContent);

        // 如果没有标签和类型，直接返回新纯内容
        if (oldTags.length === 0 && !oldType) return newPureContent;

        // 把旧内容中的标签和类型替换为占位符
        let template = oldContent;
        const placeholders = [];
        let phIndex = 0;

        // 先替换类型标记（#类型# 或 类型：），避免类型名被误判为标签
        if (oldType) {
            // 替换 #类型# 格式
            const typeRegex = new RegExp(`#${oldType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}#`, 'g');
            template = template.replace(typeRegex, () => {
                const ph = `__LPH${phIndex++}__`;
                placeholders.push({ ph, value: `#${oldType}#` });
                return ph;
            });
            
            // 替换开头 "类型：" 格式
            const prefixTypeRegex = new RegExp(`^${oldType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[：:]\\s*`);
            template = template.replace(prefixTypeRegex, () => {
                const ph = `__LPH${phIndex++}__`;
                placeholders.push({ ph, value: `${oldType}：` });
                return ph;
            });
        }

        // 替换标签（去重，按原顺序）
        const seenTags = new Set();
        oldTags.forEach(tag => {
            if (seenTags.has(tag)) return;
            seenTags.add(tag);
            const tagRegex = new RegExp(`#${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$|[，。！？；：""''（）【】])`, 'g');
            template = template.replace(tagRegex, () => {
                const ph = `__LPH${phIndex++}__`;
                placeholders.push({ ph, value: `#${tag}` });
                return ph;
            });
        });

        // 清理模板中的多余空格（保留换行）
        template = normalizeSpaces(template);

        // 从模板中提取旧纯内容
        let oldPureInTemplate = template;
        placeholders.forEach(p => {
            oldPureInTemplate = oldPureInTemplate.replace(new RegExp(p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*', 'g'), ' ');
        });
        oldPureInTemplate = normalizeSpaces(oldPureInTemplate);

        let newTemplate;
        if (oldPureInTemplate && template.includes(oldPureInTemplate)) {
            // 能在模板中找到旧纯内容，直接替换
            newTemplate = template.replace(oldPureInTemplate, newPureContent);
        } else {
            // 无法精确定位（如标签在中间分散的情况），根据标签位置模式判断
            const firstPh = placeholders[0].ph;
            const lastPh = placeholders[placeholders.length - 1].ph;
            const firstIndex = template.indexOf(firstPh);
            const lastEnd = template.lastIndexOf(lastPh) + lastPh.length;

            const textBefore = template.substring(0, firstIndex).trim();
            const textAfter = template.substring(lastEnd).trim();

            if (!textBefore && textAfter) {
                // 标签在开头：替换最后一个占位符后面的文本
                newTemplate = template.substring(0, lastEnd) + ' ' + newPureContent;
            } else if (textBefore && !textAfter) {
                // 标签在末尾：替换第一个占位符前面的文本
                newTemplate = newPureContent + ' ' + template.substring(firstIndex);
            } else if (!textBefore && !textAfter) {
                // 只有标签
                newTemplate = template + ' ' + newPureContent;
            } else {
                // 标签在中间：保持首尾文本，把新纯内容放中间，标签放到新纯内容后面
                const middleTags = [];
                for (let i = 0; i < placeholders.length; i++) {
                    middleTags.push(placeholders[i].ph);
                }
                newTemplate = textBefore + ' ' + newPureContent + ' ' + middleTags.join(' ') + ' ' + textAfter;
            }
        }

        // 恢复占位符为标签和类型
        let result = newTemplate;
        // 按占位符编号从大到小替换，避免短编号被长编号包含时误匹配
        const sortedPh = [...placeholders].sort((a, b) => b.ph.localeCompare(a.ph));
        sortedPh.forEach(p => {
            result = result.replace(new RegExp(p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), p.value);
        });

        return normalizeSpaces(result);
    }

    // 绑定工具栏事?
    bindToolbarEvents() {
        const input = this.container.querySelector('#shuoshuo-input');
        if (!input) return;

        // 搜索框事件
        const searchInput = this.container.querySelector('#shuoshuo-search-input');
        const searchClear = this.container.querySelector('#shuoshuo-search-clear');
        const filterBtn = this.container.querySelector('#shuoshuo-filter-btn');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                // 显示/隐藏清除按钮
                if (searchClear) {
                    searchClear.style.display = searchInput.value ? 'flex' : 'none';
                }
                clearTimeout(this._searchDebounce);
                this._searchDebounce = setTimeout(() => {
                    if (this.currentMainView === 'table') {
                        this.renderTable();
                    } else {
                        this.renderNotes();
                    }
                }, 250);
            });
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                clearTimeout(this._searchDebounce);
                if (this.currentMainView === 'table') {
                    this.renderTable();
                } else {
                    this.renderNotes();
                }
            });
        }

        // 日历弹层
        const calendarModal = this.container.querySelector('#shuoshuo-calendar-modal');
        const calendarOverlay = this.container.querySelector('#shuoshuo-calendar-overlay');
        const calendarClose = this.container.querySelector('#shuoshuo-calendar-close');
        const calendarBody = this.container.querySelector('#shuoshuo-calendar-body');
        const calendarYear = this.container.querySelector('#shuoshuo-calendar-year');
        const calendarContent = this.container.querySelector('#shuoshuo-calendar-modal .lumina-moments-calendar-content');
        const calendarTitle = this.container.querySelector('#shuoshuo-calendar-modal .lumina-moments-calendar-title span');
        const mobileMonthSelect = this.container.querySelector('#mobile-calendar-month');

        // 移动端日历状态
        let mobileCalendarYear = new Date().getFullYear();
        let mobileCalendarMonth = new Date().getMonth();

        const renderShuoshuoCalendarBody = (year, month = null) => {
            if (!calendarBody) return;
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile && month !== null) {
                // 移动端：显示月份日历
                const calendar = this.generateShuoshuoCalendar(year, month);
                calendarBody.innerHTML = `
                    <div class="lumina-moments-calendar-mobile-grid">
                        ${calendar.columns}
                    </div>
                `;
                // 移动端不更新标题，保持"轻语日历"文字
            } else {
                // PC端：显示热力图
                const heatmap = this.generateShuoshuoCalendar(year);
                calendarBody.innerHTML = `
                    <div class="lumina-moments-calendar-grid">
                        <div class="lumina-moments-calendar-columns">${heatmap.columns}</div>
                        <div class="lumina-moments-calendar-months">${heatmap.months}</div>
                    </div>
                `;
            }
        };

        const initShuoshuoCalendarYearOptions = () => {
            if (!calendarYear) return;
            const years = new Set();
            this.shuoshuos.forEach(s => years.add(new Date(s.created).getFullYear()));
            const currentYear = new Date().getFullYear();
            years.add(currentYear);
            const sortedYears = Array.from(years).sort((a, b) => b - a);
            calendarYear.innerHTML = sortedYears.map(y => `<option value="${y}">${y}年</option>`).join('');
            calendarYear.value = currentYear;
        };

        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                // 如果已有日期筛选，点击则清除
                if (this.selectedDate) {
                    this.selectedDate = null;
                    filterBtn.classList.remove('active');
                    if (this.currentMainView === 'table') {
                        this.renderTable();
                    } else {
                        this.renderNotes();
                    }
                    return;
                }
                // 显示日历弹层
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    // 移动端：初始化月份日历
                    mobileCalendarYear = new Date().getFullYear();
                    mobileCalendarMonth = new Date().getMonth();
                    // 同步下拉框
                    if (calendarYear) {
                        initShuoshuoCalendarYearOptions();
                        calendarYear.value = mobileCalendarYear;
                    }
                    if (mobileMonthSelect) {
                        mobileMonthSelect.value = mobileCalendarMonth;
                    }
                    renderShuoshuoCalendarBody(mobileCalendarYear, mobileCalendarMonth);
                } else {
                    // PC端：初始化热力图
                    initShuoshuoCalendarYearOptions();
                    renderShuoshuoCalendarBody(calendarYear?.value ? parseInt(calendarYear.value) : new Date().getFullYear());
                }
                if (calendarContent) calendarContent.style.transform = '';
                // 移动端：将日历弹窗移动到 body 下以避免 transform 影响 position: fixed
                if (isMobile && calendarModal && calendarModal.parentElement !== document.body) {
                    document.body.appendChild(calendarModal);
                    // 同步复制主题类到日历弹窗，确保CSS变量生效
                    const containerEl = this.container?.querySelector('.north-shuoshuo-container');
                    if (containerEl) {
                        const themeClasses = Array.from(containerEl.classList).filter(c => c.startsWith('theme-') || c.startsWith('morandi-'));
                        themeClasses.forEach(c => calendarModal.classList.add(c));
                    }
                }
                calendarModal?.classList.add('active');
            });
        }

        if (calendarYear) {
            calendarYear.addEventListener('change', () => {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    mobileCalendarYear = parseInt(calendarYear.value);
                    renderShuoshuoCalendarBody(mobileCalendarYear, mobileCalendarMonth);
                } else {
                    renderShuoshuoCalendarBody(parseInt(calendarYear.value));
                }
            });
        }

        // 移动端月份选择
        if (mobileMonthSelect) {
            mobileMonthSelect.addEventListener('change', () => {
                mobileCalendarMonth = parseInt(mobileMonthSelect.value);
                renderShuoshuoCalendarBody(mobileCalendarYear, mobileCalendarMonth);
            });
        }

        // 保存日历弹窗的原始父元素，用于关闭后恢复
        const calendarModalOriginalParent = calendarModal?.parentElement;

        if (calendarOverlay) {
            calendarOverlay.addEventListener('click', () => {
                calendarModal?.classList.remove('active');
                if (calendarContent) calendarContent.style.transform = '';
                // 移动端：关闭后将日历弹窗移回原始位置
                if (window.innerWidth <= 768 && calendarModal && calendarModalOriginalParent && calendarModal.parentElement !== calendarModalOriginalParent) {
                    // 移除从容器复制的主题类
                    const themeClasses = Array.from(calendarModal.classList).filter(c => c.startsWith('theme-') || c.startsWith('morandi-'));
                    themeClasses.forEach(c => calendarModal.classList.remove(c));
                    calendarModalOriginalParent.appendChild(calendarModal);
                }
            });
        }

        if (calendarClose) {
            calendarClose.addEventListener('click', () => {
                calendarModal?.classList.remove('active');
                if (calendarContent) calendarContent.style.transform = '';
                // 移动端：关闭后将日历弹窗移回原始位置
                if (window.innerWidth <= 768 && calendarModal && calendarModalOriginalParent && calendarModal.parentElement !== calendarModalOriginalParent) {
                    // 移除从容器复制的主题类
                    const themeClasses = Array.from(calendarModal.classList).filter(c => c.startsWith('theme-') || c.startsWith('morandi-'));
                    themeClasses.forEach(c => calendarModal.classList.remove(c));
                    calendarModalOriginalParent.appendChild(calendarModal);
                }
            });
        }

        // 移动端：点击日历弹窗外部关闭
        if (calendarModal) {
            calendarModal.addEventListener('click', (e) => {
                // 只在移动端且遮罩层隐藏时生效
                if (window.innerWidth <= 768) {
                    // 如果点击的是日历内容区域，不关闭
                    if (e.target.closest('.lumina-moments-calendar-content')) {
                        return;
                    }
                    // 点击外部关闭
                    calendarModal?.classList.remove('active');
                    if (calendarContent) calendarContent.style.transform = '';
                    if (calendarModal && calendarModalOriginalParent && calendarModal.parentElement !== calendarModalOriginalParent) {
                        // 移除从容器复制的主题类
                        const themeClasses = Array.from(calendarModal.classList).filter(c => c.startsWith('theme-') || c.startsWith('morandi-'));
                        themeClasses.forEach(c => calendarModal.classList.remove(c));
                        calendarModalOriginalParent.appendChild(calendarModal);
                    }
                }
            });
        }

        if (calendarBody) {
            calendarBody.addEventListener('click', (e) => {
                // 移动端：处理日期点击
                const mobileDay = e.target.closest('.mobile-calendar-day[data-date]');
                if (mobileDay) {
                    const date = mobileDay.dataset.date;
                    this.selectedDate = date;
                    if (filterBtn) filterBtn.classList.add('active');
                    calendarModal?.classList.remove('active');
                    if (window.innerWidth <= 768 && calendarModal && calendarModalOriginalParent && calendarModal.parentElement !== calendarModalOriginalParent) {
                        calendarModalOriginalParent.appendChild(calendarModal);
                    }
                    if (this.currentMainView === 'table') {
                        this.renderTable();
                    } else {
                        this.renderNotes();
                    }
                    return;
                }
                // PC端：处理热力图格子点击
                const cell = e.target.closest('.lumina-moments-calendar-cell[data-date]');
                if (!cell) return;
                const date = cell.dataset.date;
                this.selectedDate = date;
                if (filterBtn) filterBtn.classList.add('active');
                calendarModal?.classList.remove('active');
                // 移动端：关闭后将日历弹窗移回原始位置
                if (window.innerWidth <= 768 && calendarModal && calendarModalOriginalParent && calendarModal.parentElement !== calendarModalOriginalParent) {
                    calendarModalOriginalParent.appendChild(calendarModal);
                }
                if (this.currentMainView === 'table') {
                    this.renderTable();
                } else {
                    this.renderNotes();
                }
            });
        }



        // 日历弹窗拖动
        const calendarHeader = this.container.querySelector('#shuoshuo-calendar-modal .lumina-moments-calendar-header');
        if (calendarHeader && calendarContent) {
            let isDragging = false;
            let dragStartX = 0;
            let dragStartY = 0;
            let dragOffsetX = 0;
            let dragOffsetY = 0;

            calendarHeader.addEventListener('mousedown', (e) => {
                // 不拦截下拉框和关闭按钮的点击
                if (e.target.closest('.lumina-moments-calendar-year') || e.target.closest('.mobile-calendar-month') || e.target.closest('.lumina-moments-calendar-close')) return;
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                // 获取当前已应用的偏移
                const style = calendarContent.style.transform;
                const match = style.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
                dragOffsetX = match ? parseFloat(match[1]) : 0;
                dragOffsetY = match ? parseFloat(match[2]) : 0;
                calendarHeader.style.cursor = 'grabbing';
                e.preventDefault();
            });

            const onMouseMove = (e) => {
                if (!isDragging) return;
                const dx = dragOffsetX + (e.clientX - dragStartX);
                const dy = dragOffsetY + (e.clientY - dragStartY);
                calendarContent.style.transform = `translate(${dx}px, ${dy}px)`;
            };

            const onMouseUp = () => {
                if (!isDragging) return;
                isDragging = false;
                calendarHeader.style.cursor = '';
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            // 清理引用（虽然 bindToolbarEvents 通常只调用一次）
            this._calendarDragCleanup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
        }

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

        // 任务列表按钮
        const taskBtn = this.container.querySelector('#toolbar-task');
        if (taskBtn) {
            taskBtn.addEventListener('click', () => {
                this.insertText(input, '- [ ] ', '');
                input.focus();
            });
        }

        // 无序列表按钮
        const ulBtn = this.container.querySelector('#toolbar-ul');
        if (ulBtn) {
            ulBtn.addEventListener('click', () => {
                this.insertText(input, '- ', '');
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
        const rect = input.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.left = `${rect.left + 20}px`;
        picker.style.top = `${rect.bottom + 8}px`;
        picker.style.zIndex = '99999';
        
        document.body.appendChild(picker);
        
        const listEl = picker.querySelector('.north-shuoshuo-mention-picker-list');
        const searchText = input.value.substring(triggerPos + 1, input.selectionStart);
        this.filterMentionPicker(listEl, searchText, input);
        
        // 点击外部关闭
        const closeOnClickOutside = (e) => {
            if (!picker.contains(e.target) && !e.target.closest('.north-shuoshuo-toolbar-icon, .toolbar-icon')) {
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

    applyBookshelfFontConfig() {
        const container = this.container?.querySelector('.lumina-bookshelf-container');
        if (!container) return;
        const cfg = this.bookshelfFontConfig || DEFAULT_BOOKSHELF_FONT_CONFIG;
        container.style.setProperty('--bookshelf-title-font-size', (cfg.title || 14) + 'px');
        container.style.setProperty('--bookshelf-highlight-font-size', (cfg.highlight || 13) + 'px');
        container.style.setProperty('--bookshelf-thought-font-size', (cfg.thought || 13) + 'px');
    }

    // 根据字符串哈希获取颜色索引
    getColorIndex(str, max = 10) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % max;
    }

    // 获取标签颜色样式
    getTagColorStyle(tagName) {
        const idx = this.getColorIndex(tagName, TAG_COLORS.length);
        const c = TAG_COLORS[idx];
        return `background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    }

    // 获取类型颜色样式
    getTypeColorStyle(typeName) {
        const idx = this.getColorIndex(typeName, TYPE_COLORS.length);
        const c = TYPE_COLORS[idx];
        return `background:${c.bg};color:${c.color}`;
    }

    // 插入 MEMO 引用
    insertMention(input, noteId, triggerPos) {
        // 先保存光标位置，因为 focus() 在某些浏览器下会重置选区
        const savedCursorPos = input.selectionStart;
        input.focus(); // 确保获取到正确的光标位置
        const value = input.value;
        
        if (triggerPos !== null && triggerPos >= 0 && value.substring(triggerPos, triggerPos + 1) === '@') {
            const before = value.substring(0, triggerPos);
            // 如果保存的光标位置不可靠（<= triggerPos），则回退到 triggerPos + 1（只替换 @）
            const cursorPos = savedCursorPos > triggerPos ? savedCursorPos : triggerPos + 1;
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
        const themeClass = `theme-${this.themeMode || 'original'}`;
        const morandiClass = this.themeMode === 'morandi' && this.morandiColor ? ` morandi-${this.morandiColor}` : '';
        overlay.className = `north-shuoshuo-memo-detail-modal ${themeClass}${morandiClass}`;
        
        const noteSummary = (note.content || '').split('\n')[0].substring(0, 30) + ((note.content || '').length > 30 ? '...' : '');
        const noteDate = this.formatDate(note.created);
        
        const renderLinkCard = (linkNote) => {
            const date = this.formatDate(linkNote.created);
            const tags = this.extractTags(linkNote.content);
            let content = (linkNote.content || '').trim();
            let quote = '';
            let thought = content;
            
            const lines = content.split('\n');
            const isCommentFormat = lines[0] && lines[0].includes(`[MEMO:${noteId}]`);
            
            thought = content.replace(new RegExp(`\\[MEMO:${noteId}\\]`, 'g'), '').trim();
            
            if (lines[0] && lines[0].startsWith('关联自：')) {
                thought = lines.slice(1).join('\n').trim();
            } else if (isCommentFormat && lines.length > 1) {
                const restLines = lines.slice(1);
                const emptyIndex = restLines.findIndex(l => l.trim() === '');
                if (emptyIndex > 0) {
                    quote = restLines.slice(0, emptyIndex).join('\n').trim();
                    thought = restLines.slice(emptyIndex + 1).join('\n').trim();
                } else {
                    thought = restLines.join('\n').trim();
                }
            }
            
            const tagsHtml = tags.length > 0 
                ? `<div class="north-shuoshuo-note-tags">${tags.map(t => `<span class="north-shuoshuo-note-tag">${this.escapeHtml(t)}</span>`).join('')}</div>` 
                : '';
            
            const quoteHtml = quote 
                ? `<div class="north-shuoshuo-note-quote">${this.renderNoteContent(quote)}</div>` 
                : '';
            
            const thoughtHtml = thought 
                ? `<div class="north-shuoshuo-note-thought">${this.renderNoteContent(thought)}</div>` 
                : '';
            
            return `
                <div class="north-shuoshuo-note-card" data-id="${linkNote.id}">
                    <div class="north-shuoshuo-note-header">
                        <span class="north-shuoshuo-note-time">${date}</span>
                        <div class="north-shuoshuo-note-type highlight">▌ 关联</div>
                    </div>
                    ${tagsHtml}
                    ${thoughtHtml}
                    ${quoteHtml}
                </div>
            `;
        };
        
        overlay.innerHTML = `
            <div class="north-shuoshuo-modal-overlay"></div>
            <div class="north-shuoshuo-modal-content">
                <div class="north-shuoshuo-modal-header">
                    <button class="north-shuoshuo-modal-back">←</button>
                    <div class="north-shuoshuo-modal-book-info">
                        <div class="north-shuoshuo-modal-book-meta">${noteDate} · ${linkingNotes.length} 条关联</div>
                    </div>
                    <button class="north-shuoshuo-memo-detail-save" style="display:none;">保存</button>
                </div>
                <div class="north-shuoshuo-modal-body">
                    <div class="north-shuoshuo-masonry">
                        <div class="north-shuoshuo-note-card north-shuoshuo-note-card-original" data-id="${noteId}">
                            <div class="north-shuoshuo-note-header">
                                <span class="north-shuoshuo-note-time">${noteDate}</span>
                            </div>
                            <div class="north-shuoshuo-note-type idea">📌 原文</div>
                            <div class="north-shuoshuo-memo-detail-content">${this.renderNoteContent(note.content)}</div>
                            <textarea class="north-shuoshuo-memo-detail-textarea" style="display:none;">${this.escapeHtml(note.content)}</textarea>
                        </div>
                        ${linkingNotes.map(linkNote => renderLinkCard(linkNote)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // 绑定块引用点击事件
        const contentEl = overlay.querySelector('.north-shuoshuo-memo-detail-content');
        contentEl.querySelectorAll('.north-shuoshuo-block-ref').forEach(ref => {
            ref.addEventListener('click', (e) => {
                e.stopPropagation();
                const blockId = ref.dataset.blockId;
                if (blockId) {
                    this.openSiyuanBlockAndCloseMobileShell(blockId);
                }
            });
        });
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
        
        // 关闭事件
        overlay.querySelector('.north-shuoshuo-modal-back').addEventListener('click', () => {
            overlay.remove();
        });
        overlay.querySelector('.north-shuoshuo-modal-overlay').addEventListener('click', () => {
            overlay.remove();
        });
        
        // ESC 关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // 点击"▌ 关联"或"📌 原文"标签跳转到原位置
        overlay.querySelectorAll('.north-shuoshuo-note-card .north-shuoshuo-note-type').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = el.closest('.north-shuoshuo-note-card');
                const id = card?.dataset.id;
                if (!id) return;
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
                setTimeout(() => {
                    const notesList = this.container.querySelector('#shuoshuo-notes-list');
                    const targetCard = notesList?.querySelector(`.north-shuoshuo-note-card[data-id="${id}"]`);
                    if (targetCard && notesList) {
                        const cardRect = targetCard.getBoundingClientRect();
                        const listRect = notesList.getBoundingClientRect();
                        const scrollTop = notesList.scrollTop + (cardRect.top - listRect.top) - notesList.clientHeight / 2 + cardRect.height / 2;
                        notesList.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' });
                        targetCard.classList.add('north-shuoshuo-note-highlight');
                        setTimeout(() => targetCard.classList.remove('north-shuoshuo-note-highlight'), 1500);
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
            
            // 更新详情弹窗中的原文展示
            contentEl.innerHTML = this.renderNoteContent(newContent);
            // 重新绑定块引用点击事件
            contentEl.querySelectorAll('.north-shuoshuo-block-ref').forEach(ref => {
                ref.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const blockId = ref.dataset.blockId;
                    if (blockId) {
                        this.openSiyuanBlockAndCloseMobileShell(blockId);
                    }
                });
            });
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
        const rect = input.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.left = `${rect.left + 20}px`;
        picker.style.top = `${rect.bottom + 8}px`;
        picker.style.zIndex = '99999';

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
            if (!picker.contains(e.target) && !e.target.closest('.north-shuoshuo-toolbar-icon, .toolbar-icon')) {
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
            const tags = this.extractTags(s.content);
            tags.forEach(tag => tagSet.add(tag));
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
                
                const token = window.siyuan?.config?.api?.token || '';
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Token ${token}`;
                }
                const response = await fetch('/api/asset/upload', {
                    method: 'POST',
                    body: formData,
                    headers
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

    // 处理粘贴图片
    async handlePasteImage(e, input) {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        const imageFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) imageFiles.push(file);
            }
        }
        
        if (imageFiles.length === 0) return;
        
        e.preventDefault();
        
        for (const file of imageFiles) {
            try {
                showMessage("正在上传...");
                const formData = new FormData();
                formData.append('assetsDirPath', '/assets/');
                formData.append('file[]', file);
                
                const token = window.siyuan?.config?.api?.token || '';
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Token ${token}`;
                }
                const response = await fetch('/api/asset/upload', {
                    method: 'POST',
                    body: formData,
                    headers
                });
                const result = await response.json();
                if (result.code === 0) {
                    const succMap = result.data.succMap;
                    const originalName = file.name;
                    const newPath = succMap[originalName];
                    if (newPath) {
                        const imgPath = newPath.startsWith('/') ? newPath.substring(1) : newPath;
                        this.insertText(input, `![图片](${imgPath})`, '');
                        showMessage("图片插入成功");
                    }
                } else {
                    showMessage('上传失败：' + (result.msg || '未知错误'));
                }
            } catch (err) {
                console.error(err);
                showMessage('上传失败：' + err.message);
            }
        }
        
        input.focus();
    }

    // 渲染标签列表（支持层级显示）
    renderTags() {
        // 获取所有标签及数量
        const tagCounts = {};
        this.shuoshuos.forEach(item => {
            const tags = this.extractTags(item.content);
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // 保存当前展开和选中的标签状态，防止重新渲染后丢失
        const expandedTags = new Set();
        const tagsContainer = this.container?.querySelector('.north-shuoshuo-tags-list');
        if (tagsContainer) {
            tagsContainer.querySelectorAll('.north-shuoshuo-tag-tree-item.expanded').forEach(el => {
                const tag = el.dataset.tag;
                if (tag) expandedTags.add(tag);
            });
        }
        
        // 构建标签?
        const tagTree = this.buildTagTree(tagCounts);
        
        // 更新侧边栏标签列?
        if (tagsContainer) {
            if (Object.keys(tagCounts).length === 0) {
                tagsContainer.innerHTML = '<div class="north-shuoshuo-tag-empty">暂无标签</div>';
            } else {
                tagsContainer.innerHTML = this.renderTagTree(tagTree, 0);
                // 恢复展开状态
                if (expandedTags.size > 0) {
                    tagsContainer.querySelectorAll('.north-shuoshuo-tag-tree-item').forEach(el => {
                        const tag = el.dataset.tag;
                        if (tag && expandedTags.has(tag)) {
                            el.classList.add('expanded');
                            const childrenEl = el.querySelector('.north-shuoshuo-tag-children');
                            if (childrenEl) {
                                childrenEl.classList.add('expanded');
                                childrenEl.style.maxHeight = 'none';
                            }
                        }
                    });
                }
                // 恢复选中状态
                if (this.selectedTag) {
                    const selectedEl = tagsContainer.querySelector(`.north-shuoshuo-tag-tree-item[data-tag="${CSS.escape(this.selectedTag)}"]`);
                    if (selectedEl) {
                        selectedEl.classList.add('selected');
                    }
                }
            }
        }
        
        // 更新标签数量统计（只统计一级标签）
        const tagCountEl = this.container?.querySelector('#shuoshuo-tag-count');
        if (tagCountEl) {
            const rootTags = Object.keys(tagTree).length;
            tagCountEl.textContent = rootTags;
        }
        
        // 更新天数统计（从最早记录到今天）
        const dayCountEl = this.container?.querySelector('#shuoshuo-day-count');
        if (dayCountEl && this.shuoshuos.length > 0) {
            const timestamps = this.shuoshuos.map(s => parseInt(s.created)).filter(t => !isNaN(t) && t > 0);
            if (timestamps.length > 0) {
                const earliest = Math.min(...timestamps);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const earliestDate = new Date(earliest);
                earliestDate.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today - earliestDate) / (1000 * 60 * 60 * 24)) + 1;
                dayCountEl.textContent = daysDiff > 0 ? daysDiff : 1;
            } else {
                dayCountEl.textContent = '1';
            }
        } else if (dayCountEl) {
            dayCountEl.textContent = '0';
        }
    }

    // 更新检索式数量
    updateQueryCounts() {
        if (!this.container) return;
        
        let noTagCount = 0;
        let hasImageCount = 0;
        let hasLinkCount = 0;
        
        for (const s of this.shuoshuos) {
            const content = s.content || '';
            const tags = this.extractTags(content);
            
            if (tags.length === 0) noTagCount++;
            if (content.includes('![') || /\[.*?\]\(.*?\.(png|jpg|jpeg|gif|webp|svg)\)/i.test(content)) hasImageCount++;
            if (/https?:\/\//.test(content) || /\[.*?\]\(https?:\/\/.*?\)/.test(content)) hasLinkCount++;
        }
        
        const counts = {
            'no-tag': noTagCount,
            'has-image': hasImageCount,
            'has-link': hasLinkCount,
            'lifelog': this.shuoshuos.filter(s => !!this.extractType(s.content) || !!s._isLifeLog).length,
            'has-comment': this.shuoshuos.filter(s => {
                const c = s.content || '';
                return c.includes('[MEMO:') || /^关联自：/.test(c);
            }).length
        };
        
        this.container.querySelectorAll('.north-shuoshuo-query-count').forEach(el => {
            const query = el.dataset.queryCount;
            if (query && counts[query] !== undefined) {
                el.textContent = counts[query];
            }
        });
    }

    // 提交说说后轻量刷新所有容器（只前置插入新卡片，不触发全量重渲染）
    _lightweightRefreshAfterAdd(shuoshuo) {
        if (!shuoshuo) return;
        const containers = this.getMountedLuminaContainers();
        if (!containers.length && this.container) containers.push(this.container);

        requestAnimationFrame(() => {
            const cardHtml = this.renderNoteCard(shuoshuo);
            for (const container of containers) {
                if (!(container instanceof HTMLElement) || !document.body.contains(container)) continue;
                const view = this.getContainerMainView(container);
                if (view !== 'notes' && view !== 'week') continue;

                const listEl = container.querySelector('#shuoshuo-notes-list');
                if (!listEl) continue;

                const countEl = container.querySelector('#shuoshuo-count');
                if (countEl) countEl.textContent = this.shuoshuos.length;

                const firstGroup = listEl.querySelector('.north-shuoshuo-date-group');
                if (firstGroup) {
                    firstGroup.insertAdjacentHTML('afterend', cardHtml);
                } else {
                    const todayKey = this.formatDateKey(new Date(shuoshuo.created));
                    const title = this.getDateGroupTitle(todayKey);
                    listEl.insertAdjacentHTML('afterbegin', `<div class="north-shuoshuo-date-group">${title}</div>${cardHtml}`);
                }
            }
            this.updateQueryCounts();
            this.applyAutoCollapse();
            this.renderTags();
        });
    }

    // 重建侧栏检索式区块（在设置保存后调用，确保切换到说说视图时立即生效）
    _rebuildQuerySections() {
        this.getMountedLuminaContainers().forEach(container => {
            const querySection = container.querySelector('.north-shuoshuo-query-section');
            if (!querySection) return;
            const queryList = querySection.querySelector('.north-shuoshuo-query-list');
            if (!queryList) return;
            const hasLifeLog = !!this.queryVisibility?.lifelog;
            const hasNoTag = this.queryVisibility?.['no-tag'] !== false;
            const hasImage = this.queryVisibility?.['has-image'] !== false;
            const hasLink = this.queryVisibility?.['has-link'] !== false;
            const hasComment = !!this.queryVisibility?.['has-comment'];
            const anyVisible = hasLifeLog || hasNoTag || hasImage || hasLink || hasComment;
            if (!anyVisible) {
                querySection.style.display = 'none';
                return;
            }
            querySection.style.display = '';
            const items = [
                { visible: hasLifeLog, query: 'lifelog', label: 'LifeLog', icon: 'iconSparkles' },
                { visible: hasNoTag, query: 'no-tag', label: '无标签', icon: 'iconTags' },
                { visible: hasImage, query: 'has-image', label: '有图片', icon: 'iconImage' },
                { visible: hasLink, query: 'has-link', label: '有链接', icon: 'iconLink' },
                { visible: hasComment, query: 'has-comment', label: '已批注', icon: 'iconRef' }
            ];
            const isSelected = (query) => this.filterQuery === query;
            let html = '';
            for (const item of items) {
                if (!item.visible) continue;
                const selected = isSelected(item.query) ? ' selected' : '';
                html += `<div class="north-shuoshuo-query-item${selected}" data-query="${item.query}">
                    <span class="north-shuoshuo-query-icon">
                        <svg class="icon"><use xlink:href="#${item.icon}"></use></svg>
                    </span>
                    <span class="north-shuoshuo-query-text">${item.label}</span>
                    <span class="north-shuoshuo-query-count" data-query-count="${item.query}">0</span>
                </div>`;
            }
            queryList.innerHTML = html;
            // 重新绑定点击事件
            queryList.querySelectorAll('.north-shuoshuo-query-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const query = item.dataset.query;
                    queryList.querySelectorAll('.north-shuoshuo-query-item').forEach(i => i.classList.remove('selected'));
                    if (this.filterQuery === query) {
                        this.filterQuery = null;
                    } else {
                        item.classList.add('selected');
                        this.filterQuery = query;
                    }
                    this.renderNotes();
                });
            });
        });
    }

    // 从 MD 文本中提取所有 assets/ 图片路径
    _extractAssetPaths(mdContent) {
        const paths = [];
        const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(mdContent)) !== null) {
            const url = match[2].trim();
            if (url.startsWith('assets/') || url.startsWith('/assets/')) {
                const clean = url.startsWith('/') ? url.slice(1) : url;
                if (!paths.includes(clean)) paths.push(clean);
            }
        }
        return paths;
    }

    // 纯 JS 生成 ZIP 文件 Blob
    _createZipBlob(files) {
        // CRC32 表
        const crcTable = [];
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            crcTable[i] = c;
        }
        const crc32 = (data) => {
            let c = 0xFFFFFFFF;
            for (let i = 0; i < data.length; i++) c = crcTable[(c ^ data[i]) & 0xFF] ^ (c >>> 8);
            return (c ^ 0xFFFFFFFF) >>> 0;
        };

        const localHeaders = [];
        const centralEntries = [];
        let offset = 0;

        for (const file of files) {
            const nameBytes = new TextEncoder().encode(file.name);
            const crc = crc32(file.data);
            const size = file.data.length;
            const now = new Date();
            const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
            const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

            // Local file header (30 bytes + filename)
            const localHeader = new ArrayBuffer(30 + nameBytes.length);
            const lh = new DataView(localHeader);
            lh.setUint32(0, 0x04034b50, true);
            lh.setUint16(4, 20, true);
            lh.setUint16(6, 0, true);
            lh.setUint16(8, 0, true);
            lh.setUint16(10, dosTime, true);
            lh.setUint16(12, dosDate, true);
            lh.setUint32(14, crc, true);
            lh.setUint32(18, size, true);
            lh.setUint32(22, size, true);
            lh.setUint16(26, nameBytes.length, true);
            lh.setUint16(28, 0, true);
            for (let i = 0; i < nameBytes.length; i++) lh.setUint8(30 + i, nameBytes[i]);

            localHeaders.push({ buffer: localHeader, data: file.data });

            // Central directory entry (46 bytes + filename)
            const centralEntry = new ArrayBuffer(46 + nameBytes.length);
            const ce = new DataView(centralEntry);
            ce.setUint32(0, 0x02014b50, true);
            ce.setUint16(4, 20, true);
            ce.setUint16(6, 20, true);
            ce.setUint16(8, 0, true);
            ce.setUint16(10, 0, true);
            ce.setUint16(12, dosTime, true);
            ce.setUint16(14, dosDate, true);
            ce.setUint32(16, crc, true);
            ce.setUint32(20, size, true);
            ce.setUint32(24, size, true);
            ce.setUint16(28, nameBytes.length, true);
            ce.setUint16(30, 0, true);
            ce.setUint16(32, 0, true);
            ce.setUint16(34, 0, true);
            ce.setUint16(36, 0, true);
            ce.setUint32(38, 0, true);
            ce.setUint32(42, offset, true);
            for (let i = 0; i < nameBytes.length; i++) ce.setUint8(46 + i, nameBytes[i]);

            centralEntries.push(centralEntry);
            offset += 30 + nameBytes.length + size;
        }

        // End of central directory (22 bytes)
        const centralSize = centralEntries.reduce((s, e) => s + e.byteLength, 0);
        const centralOffset = offset;
        const eocd = new ArrayBuffer(22);
        const eo = new DataView(eocd);
        eo.setUint32(0, 0x06054b50, true);
        eo.setUint16(4, 0, true);
        eo.setUint16(6, 0, true);
        eo.setUint16(8, files.length, true);
        eo.setUint16(10, files.length, true);
        eo.setUint32(12, centralSize, true);
        eo.setUint32(16, centralOffset, true);
        eo.setUint16(20, 0, true);

        // 合并所有片段
        const parts = [];
        for (const lh of localHeaders) {
            parts.push(lh.buffer);
            parts.push(lh.data.buffer);
        }
        for (const ce of centralEntries) {
            parts.push(ce);
        }
        parts.push(eocd);
        return new Blob(parts, { type: 'application/zip' });
    }

    // 导出 MD + assets 资源图片为 ZIP 包
    async _downloadMdWithAssets(mdContent, baseName) {
        const assetPaths = this._extractAssetPaths(mdContent);
        const files = [];

        // 添加 MD 文件
        const mdBytes = new TextEncoder().encode(mdContent);
        files.push({ name: `${baseName}.md`, data: mdBytes });

        // 添加 assets/ 图片
        for (const assetPath of assetPaths) {
            try {
                const url = '/' + assetPath;
                const resp = await fetch(url);
                if (!resp.ok) continue;
                const blob = await resp.blob();
                const buffer = await blob.arrayBuffer();
                files.push({ name: assetPath, data: new Uint8Array(buffer) });
            } catch (e) {
                console.warn('导出图片失败:', assetPath, e);
            }
        }

        const zipBlob = this._createZipBlob(files);
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}.zip`;
        a.click();
        URL.revokeObjectURL(url);
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
            
            // 构建左侧内容
            const toggleBtn = `<span class="north-shuoshuo-tag-toggle" data-target="${hasChildren ? itemId : ''}">›</span>`;
            
            let html = `
                <div class="north-shuoshuo-tag-tree-item ${level > 0 ? 'child' : ''} ${isPinned ? 'pinned' : ''} ${hasChildren ? 'has-children' : ''} ${!hasChildren ? 'leaf' : ''}" data-level="${level}" data-tag="${fullPath}">
                    <div class="north-shuoshuo-tag-item-content">
                        ${toggleBtn}
                        <span class="north-shuoshuo-tag-icon-wrapper" data-tag="${fullPath}">${iconHtml}</span>
                        <span class="north-shuoshuo-tag-name">${name}</span>
                        <div class="north-shuoshuo-tag-right">
                            <span class="north-shuoshuo-tag-count">${data.count}</span>
                            <span class="north-shuoshuo-tag-menu-btn" data-tag="${fullPath}">⋯</span>
                        </div>
                    </div>
                    ${hasChildren ? `
                        <div class="north-shuoshuo-tag-children" id="${itemId}">
                            ${this.renderTagTree(data.children, level + 1, data.fullPath)}
                        </div>
                    ` : ''}
                </div>
            `;
            
            return html;
        }).join('');
    }

    async appendToDailyNote(content, timestamp) {
        if (this.syncMode === 'dailynote' && !this.notebookId) return;
        if (this.syncMode === 'doc' && !this.syncDocId) return;

        try {
            const timeStr = this.formatTimeForDiary(timestamp);
            const dateTimeStr = this.formatDateTimeAttr(timestamp);

            // 提取 #高亮内容# 格式（#xxx# 包裹的内容）
            const highlightRegex = /#([\w\/\u4e00-\u9fa5-]+)#/g;
            const highlights = [];
            let match;
            while ((match = highlightRegex.exec(content)) !== null) {
                highlights.push(match[1]);
            }

            // 提取普通标签 #标签
            const tags = this.extractTags(content);

            // 提取类型（支持 #类型# 和开头"类型："两种格式）
            const typeStr = this.extractType(content);

            // 只要有 #xxx# 高亮标签或开头类型，就添加时间前缀
            const hasHighlight = highlights.length > 0;
            const hasType = !!typeStr;

            let pureContent = content;

            // 移除所有 #高亮内容# 格式，但先记录下来
            highlights.forEach(h => {
                pureContent = pureContent.replace(new RegExp(`#${h}#\\s*`, 'g'), '');
            });

            // 如果是开头"类型："格式（且没有#类型#高亮），移除前缀避免重复
            if (hasType && !hasHighlight) {
                pureContent = pureContent.replace(/^[^\s:：\n]+[：:]\s*/, '').trim();
            }

            // 保留普通标签在内容中，让思源笔记自动识别 #标签 格式
            pureContent = pureContent.trim();

            // 清理空格但保留换行
            pureContent = pureContent
                .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
                .trim();

            // 预计算不含标签的内容版本（用于引用块格式将标签显示在标题行）
            let contentWithoutTags = pureContent;
            tags.forEach(tag => {
                contentWithoutTags = contentWithoutTags.replace(new RegExp(`#${tag}\\s*`, 'g'), '');
            });
            contentWithoutTags = contentWithoutTags.replace(/\s*#\s*$/g, '').trim();

            // 将内容按行分割
            const lines = pureContent.split('\n').map(line => line.trim());

            if (lines.length === 0 || (lines.length === 1 && !lines[0])) return;

            // 构建日记内容
            // 如果有 #类型# 高亮标签或开头类型，使用原格式：21:40 类型：内容
            // 如果没有高亮标签也没有开头类型，使用引用块格式：> [!NOTE] ✏️ 2026-04-30 21:35\n> 内容
            let diaryContent;

            if (hasHighlight || hasType) {
                // 有类型标记，思源笔记格式：时间 类型：内容
                const displayType = hasHighlight ? highlights.join(' ') : typeStr;
                // 第一行：时间 + 类型 + 冒号 + 内容
                diaryContent = `${timeStr} ${displayType}：${lines[0]}`;

                // 如果有更多行，添加换行和后续内容
                if (lines.length > 1) {
                    const remainingContent = lines.slice(1).join('\n\n');
                    if (remainingContent) {
                        diaryContent = diaryContent + '\n\n' + remainingContent;
                    }
                }
            } else {
                // 没有高亮标签，使用引用块格式
                const dateStr = this.formatDateTimeAttr(timestamp).split(' ')[0]; // 获取日期部分 2026-04-30
                const dateDisplay = dateStr; // 保持 YYYY-MM-DD 格式

                // 从内容中提取标签，放到标题行中显示（不带#号）
                const contentTags = this.extractTags(pureContent);

                // 构建引用块标题行：时间 + 标签名
                diaryContent = `> [!NOTE] ✏️ ${dateDisplay} ${timeStr}${contentTags.length > 0 ? ' ' + contentTags.join(' ') : ''}`;

                // 添加内容行（每行前面加上 >，包括空行）
                // 保持引述块连续，不添加额外的空行分隔
                const originalLines = contentWithoutTags.split('\n');
                for (let i = 0; i < originalLines.length; i++) {
                    const line = originalLines[i];
                    const trimmedLine = line.trim();
                    
                    // 当前行
                    diaryContent += '\n> ' + trimmedLine;
                }
            }

            diaryContent = diaryContent + ' ';

            let blockId = null;

            if (this.syncMode === 'dailynote') {
                // 每日笔记模式：按日期分发到对应日期的日记文档
                const noteDate = new Date(timestamp);
                const docId = await this.getOrCreateDailyNoteDoc(noteDate);
                if (!docId) {
                    console.warn('无法获取或创建日记文档');
                    return null;
                }
                
                const response = await fetch('/api/block/appendBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parentID: docId,
                        dataType: 'markdown',
                        data: diaryContent
                    })
                });
                
                const result = await response.json();
                if (result.code !== 0) {
                    console.warn('追加到日记文档失败:', result.msg);
                    return null;
                }
                
                // 提取 blockId
                if (Array.isArray(result.data) && result.data.length > 0) {
                    const firstItem = result.data[0];
                    if (firstItem.doOperations && Array.isArray(firstItem.doOperations) && firstItem.doOperations.length > 0) {
                        blockId = firstItem.doOperations[0].id || firstItem.doOperations[0].blockId || null;
                    }
                } else if (result.data && typeof result.data === 'object') {
                    if (result.data.doOperations && Array.isArray(result.data.doOperations) && result.data.doOperations.length > 0) {
                        blockId = result.data.doOperations[0].id || result.data.doOperations[0].blockId || null;
                    } else {
                        blockId = result.data.id || result.data.blockId || null;
                    }
                } else if (typeof result.data === 'string') {
                    blockId = result.data;
                }
            } else if (this.syncMode === 'doc') {
                // 指定文档模式：按日期分组追加
                blockId = await this.appendToDocWithDateGroup(this.syncDocId, diaryContent, timestamp);
            }

            if (blockId && typeof blockId === 'string') {
                // LifeLog（类型：内容）不设置 custom-lumina-* 属性，避免 loadShuoshuosFromSiyuan 读取到导致重复显示
                // LifeLog 由 queryLifeLogRecords 通过 custom-lifelog-* 属性单独读取
                if (!hasType) {
                    // 设置自定义属性
                    // 将类型和标签分开保存，便于后续加载时区分
                    const attrResult = await this.setLuminaBlockAttrs(blockId, {
                        date: dateTimeStr,
                        content: contentWithoutTags,
                        tag: tags.join(' '),  // 只保存标签
                        type: highlights.join(' ')  // 保存类型（#类型# 格式中的类型名）
                    });
                }
            }

            return blockId; // 返回 blockId，供调用方保存到说说对象
        } catch (e) {
            console.error("同步到思源失败", e);
            return null;
        }
    }

    // 设置 Lumina 自定义块属性
    async setLuminaBlockAttrs(blockId, attrs) {
        try {
            const payload = {
                id: blockId,
                attrs: {
                    'custom-lumina-date': attrs.date || '',
                    'custom-lumina-content': attrs.content || '',
                    'custom-lumina-tag': attrs.tag || '',
                    'custom-lumina-type': attrs.type || ''  // 类型（#类型# 格式中的类型名）
                }
            };

            const response = await fetch('/api/attr/setBlockAttrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.code === 0) {
                // console.log('[轻语] 块属性设置成功，blockId:', blockId);
                return true;
            } else {
                // console.warn('[轻语] 块属性设置失败:', result.msg, 'blockId:', blockId);
                return false;
            }
        } catch (e) {
            // console.error('[轻语] 设置块属性请求异常:', e);
            return false;
        }
    }

    // 格式化日期时间为属性格式：2026-4-28 09:48（无前导零）
    formatDateTimeAttr(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    formatTimeForDiary(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 计算 ISO 8601 周数
    getISOWeekInfo(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const day = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        return { year: d.getUTCFullYear(), week };
    }

    // Go 风格日期格式化
    formatGoDate(fmt, date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let result = "";
        let i = 0;
        while (i < fmt.length) {
            if (fmt.startsWith("2006", i)) { result += String(year); i += 4; }
            else if (fmt.startsWith("January", i)) { result += months[month - 1]; i += 7; }
            else if (fmt.startsWith("Jan", i)) { result += monthsShort[month - 1]; i += 3; }
            else if (fmt.startsWith("Monday", i)) { result += weekdays[date.getDay()]; i += 6; }
            else if (fmt.startsWith("Mon", i)) { result += weekdaysShort[date.getDay()]; i += 3; }
            else if (fmt.startsWith("15", i)) { result += String(hour).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("04", i)) { result += String(minute).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("05", i)) { result += String(second).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("03", i)) { result += String(hour % 12 || 12).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("02", i)) { result += String(day).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("01", i)) { result += String(month).padStart(2, "0"); i += 2; }
            else if (fmt.startsWith("PM", i) || fmt.startsWith("pm", i)) {
                const isUpper = fmt[i] === "P";
                result += hour >= 12 ? (isUpper ? "PM" : "pm") : (isUpper ? "AM" : "am");
                i += 2;
            } else {
                result += fmt[i];
                i++;
            }
        }
        return result;
    }

    // 执行内置日期函数
    runDateFunc(name, date) {
        const weekdaysCN = ["日", "一", "二", "三", "四", "五", "六"];
        const weekdaysCNFull = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        const weekdaysEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const seasonMap = ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬'];
        const seasonMapEN = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
        const iso = this.getISOWeekInfo(date);

        switch (name) {
            case "ISOWeek": return String(iso.week);
            case "ISOYear": return String(iso.year);
            case "ISOMonth": return String(date.getMonth() + 1).padStart(2, "0");
            case "ISOWeekDate": {
                const d = date.getDay() || 7;
                return `${iso.year}-W${String(iso.week).padStart(2, "0")}-${d}`;
            }
            case "Weekday": return String(date.getDay());
            case "WeekdayCN": return weekdaysCN[date.getDay()];
            case "WeekdayCN2": return "周" + weekdaysCN[date.getDay()];
            case "WeekdayCNFull": return weekdaysCNFull[date.getDay()];
            case "WeekdayEN": return weekdaysEN[date.getDay()];
            case "Season": return seasonMap[date.getMonth()];
            case "SeasonEN": return seasonMapEN[date.getMonth()];
            case "WeekOfYear": {
                const d = new Date(date);
                const currentWeekday = (d.getDay() + 6) % 7;
                const mondayOfThisWeek = new Date(d);
                mondayOfThisWeek.setDate(d.getDate() - currentWeekday);
                const firstDayOfYear = new Date(mondayOfThisWeek.getFullYear(), 0, 1);
                const daysFromYearStart = Math.floor((mondayOfThisWeek - firstDayOfYear) / (24 * 60 * 60 * 1000));
                const weekNumber = Math.floor((daysFromYearStart + 7) / 7);
                return String(weekNumber);
            }
            default: return `{{now | ${name}}}`;
        }
    }

    // 渲染 daily note 路径模板
    // 同时支持旧版 Go 模板语法 {{now | date "2006"}} 和新的简化占位符语法 {YYYY} 等
    renderDailyNotePath(template, date) {
        if (!template) return '';
        let result = template;

        // 1. 先处理旧版 Go 模板语法（兼容已有配置）
        result = result.replace(/\{\{\s*now\s*\|\s*date\s*"([^"]+)"\s*\}\}/g, (_, fmt) => this.formatGoDate(fmt, date));
        result = result.replace(/\{\{\s*now\s*\|\s*(\w+)\s*\}\}/g, (_, name) => this.runDateFunc(name, date));

        // 2. 处理新的简化占位符语法 {变量名}
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const weekday = date.getDay();
        const weekdaysCN = ["日", "一", "二", "三", "四", "五", "六"];
        const weekdaysCNFull = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        const iso = this.getISOWeekInfo(date);

        // 计算年内第几周
        const d = new Date(date);
        const currentWeekday = (d.getDay() + 6) % 7;
        const mondayOfThisWeek = new Date(d);
        mondayOfThisWeek.setDate(d.getDate() - currentWeekday);
        const firstDayOfYear = new Date(mondayOfThisWeek.getFullYear(), 0, 1);
        const daysFromYearStart = Math.floor((mondayOfThisWeek - firstDayOfYear) / (24 * 60 * 60 * 1000));
        const weekOfYear = Math.floor((daysFromYearStart + 7) / 7);

        // 季节判断
        const seasonMap = ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬'];
        const season = seasonMap[month - 1];
        const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const seasonMapEN = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];

        const placeholders = {
            '{YYYY}': String(year),
            '{YY}': String(year).slice(-2),
            '{MM}': String(month).padStart(2, '0'),
            '{M}': String(month),
            '{DD}': String(day).padStart(2, '0'),
            '{D}': String(day),
            '{hh}': String(hour).padStart(2, '0'),
            '{h}': String(hour),
            '{mm}': String(minute).padStart(2, '0'),
            '{m}': String(minute),
            '{ss}': String(second).padStart(2, '0'),
            '{s}': String(second),
            '{Weekday}': String(weekday),
            '{WeekdayCN}': weekdaysCN[weekday],
            '{WeekdayCNFull}': weekdaysCNFull[weekday],
            '{WeekdayCN2}': '周' + weekdaysCN[weekday],
            '{WeekdayEN}': weekdaysEN[weekday],
            '{Season}': season,
            '{SeasonEN}': seasonMapEN[month - 1],
            '{WeekOfYear}': String(weekOfYear),
            '{ISOWeek}': String(iso.week),
            '{ISOYear}': String(iso.year),
        };

        // 按占位符长度降序替换，避免短占位符干扰长的（如 {M} 干扰 {MM}）
        const sortedKeys = Object.keys(placeholders).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
            result = result.split(key).join(placeholders[key]);
        }

        return result.trim();
    }

    // 获取或创建对应日期的日记文档
    // customTemplate: 可选的自定义模板，如果提供则优先使用
    // useGlobalTemplate: 是否允许使用全局的 dailyNotePathTemplate（说说功能的配置），默认为 true
    async getOrCreateDailyNoteDoc(date, notebookId = null, customTemplate = null, useGlobalTemplate = true) {
        const nbId = notebookId || this.notebookId;
        try {
            let template = '';
            
            // 1. 优先使用传入的自定义模板
            if (customTemplate && customTemplate.trim()) {
                template = customTemplate.trim();
            } else if (useGlobalTemplate && this.dailyNotePathTemplate && this.dailyNotePathTemplate.trim()) {
                // 其次使用用户自定义的 daily note 路径模板（仅当允许使用全局模板时）
                template = this.dailyNotePathTemplate.trim();
            } else {
                // 最后获取笔记本配置的日记保存路径模板
                const confResponse = await fetch('/api/notebook/getNotebookConf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notebook: nbId })
                });
                const confResult = await confResponse.json();
                if (confResult.code !== 0) {
                    console.warn('获取笔记本配置失败:', confResult.msg);
                } else {
                    template = confResult.data?.conf?.dailyNoteSavePath || '';
                }
            }
            
            // 如果仍然没有模板，使用思源默认的 dailyNoteSavePath 模板
            if (!template) {
                template = '/daily note/{{now | date "2006/01"}}/{{now | date "2006-01-02"}}';
                console.log('使用思源默认每日笔记路径模板:', template);
            }
            
            // 2. 渲染模板为实际路径
            const hPath = this.renderDailyNotePath(template, date);
            
            // 3. 查找文档ID
            const idsResponse = await fetch('/api/filetree/getIDsByHPath', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notebook: nbId,
                    path: hPath
                })
            });
            const idsResult = await idsResponse.json();
            let docId = null;
            let isNewDoc = false;
            if (idsResult.code === 0 && idsResult.data && idsResult.data.length > 0) {
                docId = idsResult.data[0];
            } else {
                // 4. 文档不存在，创建它
                const createResponse = await fetch('/api/filetree/createDocWithMd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        notebook: nbId,
                        path: hPath,
                        markdown: ''
                    })
                });
                const createResult = await createResponse.json();
                if (createResult.code === 0 && createResult.data) {
                    docId = createResult.data.id || createResult.data;
                    isNewDoc = true;
                }
            }

            // 5. 设置日记自定义属性（仅新创建时）
            if (docId && isNewDoc) {
                try {
                    // 根据模板变量生成纯英文/数字的属性后缀（思源属性名不支持中文）
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    let attrSuffix = `${year}${month}${day}`;

                    const weekdaysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const seasonMapEN = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];

                    // 检测模板中是否使用了星期相关变量（兼容 {WeekdayXX} 和 {{now | WeekdayXX}} 语法）
                    const hasWeekday = /{(Weekday|WeekdayCN|WeekdayCN2|WeekdayCNFull|WeekdayEN)}/.test(template) || /{{\s*now\s*\|\s*Weekday/.test(template);
                    // 检测模板中是否使用了季节相关变量
                    const hasSeason = /{(Season|SeasonEN)}/.test(template) || /{{\s*now\s*\|\s*Season/.test(template);

                    if (hasWeekday) {
                        attrSuffix += weekdaysEN[date.getDay()];
                    }
                    if (hasSeason) {
                        attrSuffix += seasonMapEN[date.getMonth()];
                    }

                    const attrName = `custom-dailynote-${attrSuffix}`;
                    await fetch('/api/attr/setBlockAttrs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: docId,
                            attrs: {
                                [attrName]: attrSuffix
                            }
                        })
                    });
                } catch (e) {
                    console.warn('设置日记自定义属性失败:', e);
                }
            }

            // 6. 设置日记动态图标
            if (docId && this.dailyNoteIconType) {
                try {
                    const dateStr = date.toISOString().split('T')[0];
                    const isWeekend = [0, 6].includes(date.getDay());
                    const color = isWeekend ? this.dailyNoteIconColorWeekend : this.dailyNoteIconColorWeekday;
                    const colorParam = color ? `&color=${encodeURIComponent(color.startsWith('#') ? color : '#' + color)}` : '';
                    const iconUrl = `api/icon/getDynamicIcon?type=${this.dailyNoteIconType}&date=${dateStr}${colorParam}`;
                    await fetch('/api/attr/setBlockAttrs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: docId,
                            attrs: {
                                'icon': iconUrl
                            }
                        })
                    });
                } catch (e) {
                    console.warn('设置日记动态图标失败:', e);
                }
            }

            // 7. 设置年份和月份文件夹的排序（新创建的排在前面）
            try {
                const pathParts = hPath.split('/');
                if (pathParts.length >= 2) {
                    const yearStr = pathParts[0];
                    const monthStr = pathParts[1];
                    const year = parseInt(yearStr, 10);
                    const month = parseInt(monthStr, 10);
                    if (!isNaN(year) && !isNaN(month)) {
                        // 年份排序：值越小排越前（新年份 = 小值）
                        const yearSort = 9999 - year;
                        // 月份排序：值越小排越前（新月份 = 小值）
                        const monthSort = 12 - month + 1;

                        // 设置年份文件夹排序
                        const yearPath = pathParts[0];
                        const yearIdsRes = await fetch('/api/filetree/getIDsByHPath', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notebook: nbId, path: yearPath })
                        });
                        const yearIdsResult = await yearIdsRes.json();
                        if (yearIdsResult.code === 0 && yearIdsResult.data && yearIdsResult.data.length > 0) {
                            await fetch('/api/attr/setBlockAttrs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: yearIdsResult.data[0],
                                    attrs: { 'custom-sy-sort': String(yearSort) }
                                })
                            });
                        }

                        // 设置月份文件夹排序
                        const monthPath = pathParts.slice(0, 2).join('/');
                        const monthIdsRes = await fetch('/api/filetree/getIDsByHPath', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notebook: nbId, path: monthPath })
                        });
                        const monthIdsResult = await monthIdsRes.json();
                        if (monthIdsResult.code === 0 && monthIdsResult.data && monthIdsResult.data.length > 0) {
                            await fetch('/api/attr/setBlockAttrs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: monthIdsResult.data[0],
                                    attrs: { 'custom-sy-sort': String(monthSort) }
                                })
                            });
                        }
                    }
                }
            } catch (e) {
                console.warn('设置日记文件夹排序失败:', e);
            }

            return docId;
        } catch (e) {
            console.error('获取或创建日记文档失败:', e);
            return null;
        }
    }

    // 向指定文档按日期分组追加内容
    async appendToDocWithDateGroup(docId, content, timestamp) {
        try {
            const dateStr = this.formatDateTimeAttr(timestamp).split(' ')[0];
            
            // 1. 查找文档中是否已有对应日期的 h2 标题
            const h2Response = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT id, created FROM blocks 
                           WHERE root_id = '${docId}' AND type = 'h' AND subtype = 'h2' AND content LIKE '${dateStr}%'
                           ORDER BY created LIMIT 1`
                })
            });
            const h2Result = await h2Response.json();
            
            let previousId = null;
            
            if (h2Result.code === 0 && h2Result.data && h2Result.data.length > 0) {
                const h2Id = h2Result.data[0].id;
                const h2Created = h2Result.data[0].created;
                
                // 查找下一个 h2 标题
                const nextH2Response = await fetch('/api/query/sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stmt: `SELECT created FROM blocks 
                               WHERE root_id = '${docId}' AND type = 'h' AND subtype = 'h2' AND created > '${h2Created}'
                               ORDER BY created LIMIT 1`
                    })
                });
                const nextH2Result = await nextH2Response.json();
                const nextH2Created = (nextH2Result.code === 0 && nextH2Result.data && nextH2Result.data.length > 0) 
                    ? nextH2Result.data[0].created 
                    : null;
                
                // 查找该 h2 到下一个 h2 之间的最后一个块
                // 必须限制 parent_id = docId，只选文档的直接子块，避免选中引用块/列表等容器内部的子块
                // 同时排除容器块类型（l=列表, b=引述块, s=超级块），防止 insertBlock 把新内容插入到容器块内部导致嵌套
                let lastBlockQuery = `SELECT id, created FROM blocks 
                                      WHERE root_id = '${docId}' AND type NOT IN ('d', 'l', 'b', 's') AND parent_id = '${docId}' AND created > '${h2Created}'`;
                if (nextH2Created) {
                    lastBlockQuery += ` AND created < '${nextH2Created}'`;
                }
                lastBlockQuery += ` ORDER BY created DESC LIMIT 1`;
                
                const lastBlockResponse = await fetch('/api/query/sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stmt: lastBlockQuery })
                });
                const lastBlockResult = await lastBlockResponse.json();
                
                if (lastBlockResult.code === 0 && lastBlockResult.data && lastBlockResult.data.length > 0) {
                    previousId = lastBlockResult.data[0].id;
                } else {
                    // h2 下只有容器块（如引述块），直接使用 h2Id 作为插入锚点
                    previousId = h2Id;
                }
            } else {
                // 没有对应日期的 h2，创建它
                // 排除容器块类型（l=列表, b=引述块, s=超级块），防止 insertBlock 把 h2 插入到容器块内部
                const lastBlockResponse = await fetch('/api/query/sql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        stmt: `SELECT id, created FROM blocks 
                               WHERE root_id = '${docId}' AND type NOT IN ('d', 'l', 'b', 's') AND parent_id = '${docId}'
                               ORDER BY created DESC LIMIT 1`
                    })
                });
                const lastBlockResult = await lastBlockResponse.json();
                
                const h2Data = `## ${dateStr}\n\n`;
                
                if (lastBlockResult.code === 0 && lastBlockResult.data && lastBlockResult.data.length > 0) {
                    const insertResponse = await fetch('/api/block/insertBlock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dataType: 'markdown',
                            data: h2Data,
                            previousID: lastBlockResult.data[0].id
                        })
                    });
                    const insertResult = await insertResponse.json();
                    if (insertResult.code === 0 && insertResult.data && insertResult.data.length > 0) {
                        const ops = insertResult.data[0].doOperations;
                        if (ops && ops.length > 0) {
                            previousId = ops[ops.length - 1].id;
                        }
                    }
                } else {
                    const appendResponse = await fetch('/api/block/appendBlock', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dataType: 'markdown',
                            data: h2Data,
                            parentID: docId
                        })
                    });
                    const appendResult = await appendResponse.json();
                    if (appendResult.code === 0 && appendResult.data && appendResult.data.length > 0) {
                        const ops = appendResult.data[0].doOperations;
                        if (ops && ops.length > 0) {
                            previousId = ops[ops.length - 1].id;
                        }
                    }
                }
            }
            
            // 插入实际内容
            if (previousId) {
                const response = await fetch('/api/block/insertBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dataType: 'markdown',
                        data: content,
                        previousID: previousId
                    })
                });
                const result = await response.json();
                if (result.code === 0 && result.data && result.data.length > 0) {
                    const ops = result.data[0].doOperations;
                    if (ops && ops.length > 0) {
                        return ops[ops.length - 1].id;
                    }
                }
            } else {
                const response = await fetch('/api/block/appendBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dataType: 'markdown',
                        data: content,
                        parentID: docId
                    })
                });
                const result = await response.json();
                if (result.code === 0 && result.data && result.data.length > 0) {
                    const ops = result.data[0].doOperations;
                    if (ops && ops.length > 0) {
                        return ops[ops.length - 1].id;
                    }
                }
            }
            return null;
        } catch (e) {
            console.error('向指定文档追加内容失败:', e);
            return null;
        }
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

    // 按日期分组笔记
    groupNotesByDate(notes) {
        const groups = new Map();
        for (const note of notes) {
            const dateKey = this.formatDateKey(new Date(note.created));
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey).push(note);
        }
        // 按日期倒序排列
        return new Map([...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])));
    }

    // 获取日期分组的友好标题
    getDateGroupTitle(dateKey) {
        const date = new Date(dateKey + 'T00:00:00');
        const now = new Date();
        const todayKey = this.formatDateKey(now);
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = this.formatDateKey(yesterday);
        
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[date.getDay()];
        
        if (dateKey === todayKey) {
            return `今天 ${weekday}`;
        }
        if (dateKey === yesterdayKey) {
            return `昨天 ${weekday}`;
        }
        return `${dateKey} ${weekday}`;
    }

    // 渲染笔记内容（支持九宫格图片布局?
    renderNoteContent(content, options = {}) {
        const { text, images } = this.extractContentAndImages(content);
        
        let displayText = text;
        if (options.hideTags) {
            // 移除内容中的标签，避免重复显示
            displayText = displayText.replace(/#[^\s\d][^\s]*(?:\/[^\s]+)*/g, '').trim();
            // 移除开头的"类型："前缀（类型标记）
            displayText = displayText.replace(/^[^\s:：\n]+[：:]\s*/, '').trim();
            displayText = displayText.replace(/\n{3,}/g, '\n\n').trim();
        }
        
        let html = '<div class="north-shuoshuo-note-content">';
        
        // 渲染文字内容
        if (displayText.trim()) {
            html += this.formatContent(displayText);
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
        
        // 提取思源笔记块引用 ((id 'title')) 格式
        const blockRefs = [];
        html = html.replace(/\(\(\s*([\w-]+)\s+'([^']+)'\s*\)\)/g, (match, blockId, title) => {
            blockRefs.push({ blockId, title });
            return `{{BLOCKREF${blockRefs.length - 1}}}`;
        });
        
        // 转义 HTML
        html = this.escapeHtml(html);

        // 清理可能残留的内联属性标记（思源笔记 kramdown 格式）
        // 例如: "1. {: id=\"xxx\" updated=\"xxx\"}内容" -> "1. 内容"
        // 注意：只移除 {:...} 本身，不移除前面的空格，避免误删列表标记后的空格
        html = html.replace(/\{:([^}]+)\}/g, '');

        // 清理引用块格式（从思源笔记同步回来的内容可能包含）
        // 移除 > [!NOTE] ✏️ 2026-4-30 21:42 这样的标题行
        html = html.replace(/^>\s*\[!NOTE\][^\n]*\n?/gm, '');
        // 移除 > 开头的引用标记，保留内容
        html = html.replace(/^>\s?/gm, '');

        // ★ 批注 MEMO 处理：在 Markdown 渲染之前，先处理原始文本
        // 这样避免操作 HTML 导致的标签残缺问题
        // 批注格式：[MEMO:xxx]\n第一行批注\n第二行批注...
        if (html.includes('[MEMO:')) {
            const memoLines = html.split('\n');
            let memoLineIdx = -1;
            let memoColIdx = -1;
            for (let i = 0; i < memoLines.length; i++) {
                memoColIdx = memoLines[i].indexOf('[MEMO:');
                if (memoColIdx !== -1) {
                    memoLineIdx = i;
                    break;
                }
            }
            if (memoLineIdx !== -1) {
                // 找到 MEMO 标记结束位置
                const memoEnd = memoLines[memoLineIdx].indexOf(']', memoColIdx);
                // 提取 MEMO 标记之后同行的内容（纯文本批注开头）
                let commentText = memoLines[memoLineIdx].substring(memoEnd + 1).trim();
                memoLines[memoLineIdx] = commentText;
                // 保留 MEMO 行及之后（批注内容），移除之前的原文引用
                html = memoLines.slice(memoLineIdx).join('\n').trim();
            }
        }

        // 移除旧格式批注的引用头部
        html = html.replace(/^关联自：[^\n]*(\n|$)/m, '');

        // 移除 lumina MEMO 链接和 MEMO 引用标记
        html = html.replace(/lumina:\/\/memo\/[a-zA-Z0-9]+/g, '');
        html = html.replace(/\[MEMO:[^\]]+\]/g, '');

        // 清理多余空行（在 Markdown 渲染前清理，效果更好）
        html = html.replace(/\n{3,}/g, '\n\n');

        // 处理 Markdown 语法（完整块级解析器，正确处理段落、列表、代码块等）
        html = this.renderMarkdown(html);

        // #高亮内容# 转换为高亮样式
        html = html.replace(/#([\w\/\u4e00-\u9fa5-]+)#/g, '<span class="north-shuoshuo-highlight">#$1#</span>');

        // #标签?转换为标签样式（支持多级标签 #??孙）
        html = html.replace(/#([\w\/\u4e00-\u9fa5-]+)(?![\w\/\u4e00-\u9fa5-])(?!#)/g, '<span class="north-shuoshuo-tag">#$1</span>');
        
        // 还原图片标签（这里保留单张图片的处理，用于兼容纯图片内容?
        images.forEach((img, index) => {
            html = html.replace(
                `{{IMAGE${index}}}`,
                `<img src="${img.url}" alt="${this.escapeHtml(img.alt)}" class="north-shuoshuo-markdown-img" loading="lazy">`
            );
        });
        
        // 还原块引用为可点击的链接
        blockRefs.forEach((ref, index) => {
            html = html.replace(
                `{{BLOCKREF${index}}}`,
                `<span class="north-shuoshuo-block-ref" data-block-id="${ref.blockId}" title="点击跳转到思源笔记">${this.escapeHtml(ref.title)}</span>`
            );
        });
        
        return html;
    }

    // 渲染 Markdown（完整块级解析器）
    renderMarkdown(text) {
        // 预处理：还原被 escapeHtml 转义的行首引用块标记 &gt;
        text = text.replace(/^(\s*)&gt;(\s?)/gm, '$1>$2');

        // 保护转义字符
        const escapes = [];
        text = text.replace(/\\([\\`*_{}[\]()#+-.!~|>])/g, (match, char) => {
            escapes.push(char);
            return `\u0000E${escapes.length - 1}\u0000`;
        });

        const lines = text.split('\n');
        const blocks = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];
            const trimmed = line.trimStart();

            // 代码块
            if (trimmed.startsWith('```')) {
                const fenceMatch = trimmed.match(/^(`{3,})/);
                const fence = fenceMatch ? fenceMatch[1] : '```';
                const lang = trimmed.slice(fence.length).trim();
                i++;
                const codeLines = [];
                while (i < lines.length) {
                    if (lines[i].trimStart().startsWith(fence)) {
                        i++;
                        break;
                    }
                    codeLines.push(lines[i]);
                    i++;
                }
                const code = codeLines.join('\n');
                blocks.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>${code}</code></pre>`);
                continue;
            }

            // 标题 H1-H6
            const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                blocks.push(`<h${level}>${this.renderInline(headingMatch[2])}</h${level}>`);
                i++;
                continue;
            }

            // 分割线
            if (trimmed.match(/^(---|\*\*\*|___)\s*$/)) {
                blocks.push('<hr>');
                i++;
                continue;
            }

            // 引用块
            if (trimmed.startsWith('>')) {
                const result = this.renderBlockquote(lines, i);
                blocks.push(result.html);
                i = result.nextIndex;
                continue;
            }

            // 列表
            if (this.isListItem(trimmed)) {
                const result = this.renderList(lines, i);
                blocks.push(result.html);
                i = result.nextIndex;
                continue;
            }

            // 空行
            if (trimmed === '') {
                i++;
                continue;
            }

            // 段落（收集连续的非空行，直到遇到新的块级元素）
            const paraLines = [];
            while (i < lines.length && lines[i].trim() !== '') {
                if (this.isBlockStart(lines[i], lines, i)) break;
                paraLines.push(lines[i]);
                i++;
            }
            const para = paraLines.join('<br>').trim();
            if (para) {
                blocks.push(`<p>${this.renderInline(para)}</p>`);
            }
        }

        let html = blocks.join('\n');

        // 恢复转义字符
        escapes.forEach((char, idx) => {
            html = html.replace(`\u0000E${idx}\u0000`, char);
        });

        return html;
    }

    // 行内 Markdown 解析
    renderInline(text) {
        // 保护行内代码
        const codes = [];
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            codes.push(code);
            return `\u0000C${codes.length - 1}\u0000`;
        });

        // 自动链接 <url> 和 <email>
        text = text.replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1" target="_blank">$1</a>');
        text = text.replace(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g, '<a href="mailto:$1">$1</a>');

        // 链接 [text](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 删除线 ~~text~~
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

        // 粗斜体 ***text***
        text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        // 粗体 **text**
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // 斜体 *text*
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // 下划线强调 _text_（标准 Markdown 斜体，与 * 等价）
        text = text.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

        // 恢复行内代码
        codes.forEach((code, idx) => {
            text = text.replace(`\u0000C${idx}\u0000`, `<code>${code}</code>`);
        });

        return text;
    }

    // 判断是否列表项
    isListItem(line) {
        return line.match(/^(\s*)([-*+]|\d+\.)\s+/) !== null ||
               line.match(/^(\s*)([-*+]|\d+\.)\s+\[([ xX])\]\s+/) !== null;
    }

    // 判断是否是新的块级元素开始
    isBlockStart(line, lines, i) {
        const trimmed = line.trimStart();
        if (trimmed.startsWith('```')) return true;
        if (trimmed.match(/^(#{1,6})\s+/)) return true;
        if (trimmed.match(/^(---|\*\*\*|___)\s*$/)) return true;
        if (trimmed.startsWith('>')) return true;
        if (this.isListItem(trimmed)) return true;
        return false;
    }

    // 渲染引用块（支持嵌套）
    renderBlockquote(lines, start) {
        const quoteLines = [];
        let i = start;
        while (i < lines.length) {
            const trimmed = lines[i].trimStart();
            if (trimmed.startsWith('>')) {
                quoteLines.push(lines[i].replace(/^>\s?/, ''));
                i++;
            } else if (trimmed === '' && quoteLines.length > 0) {
                if (i + 1 < lines.length && lines[i + 1].trimStart().startsWith('>')) {
                    quoteLines.push('');
                    i++;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        const inner = this.renderMarkdown(quoteLines.join('\n'));
        return { html: `<blockquote>\n${inner}\n</blockquote>`, nextIndex: i };
    }

    // 渲染列表（无序/有序/任务）
    renderList(lines, start) {
        const items = [];
        let i = start;
        let listType = null;
        let startNum = null;

        while (i < lines.length) {
            // 尝试匹配任务列表项
            let match = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+\[([ xX])\]\s+(.*)$/);
            let isTask = false;
            let taskChecked = false;
            let marker, content;

            if (match) {
                isTask = true;
                taskChecked = match[3] === 'x' || match[3] === 'X';
                marker = match[2];
                content = match[4];
            } else {
                // 尝试匹配普通列表项
                match = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
                if (!match) break;
                marker = match[2];
                content = match[3];
            }

            const isOrdered = /^\d+\./.test(marker);
            const currentType = isTask ? 'task' : (isOrdered ? 'ol' : 'ul');

            if (listType === null) {
                listType = currentType;
                if (isOrdered) startNum = parseInt(marker);
            } else if (listType !== currentType) {
                break;
            }

            content = this.renderInline(content);

            if (isTask) {
                const checked = taskChecked ? 'checked' : '';
                items.push(`<li class="task-item" data-task-line="${this.escapeHtml(lines[i])}"><input type="checkbox" class="shuoshuo-task-checkbox" ${checked}> <span>${content}</span></li>`);
            } else {
                items.push(`<li>${content}</li>`);
            }
            i++;
        }

        const tag = listType === 'ol' ? 'ol' : 'ul';
        const classAttr = listType === 'task' ? ' class="task-list"' : '';
        const startAttr = (listType === 'ol' && startNum !== null && startNum !== 1) ? ` start="${startNum}"` : '';
        const html = `<${tag}${classAttr}${startAttr}>\n${items.join('\n')}\n</${tag}>`;

        return { html, nextIndex: i };
    }

    async toggleTaskCheckbox(shuoshuoId, taskIndex) {
        const shuoshuo = this.shuoshuos.find(s => s.id === shuoshuoId);
        if (!shuoshuo || !shuoshuo.content) return;

        // 按行分割内容，找到所有任务行
        const lines = shuoshuo.content.split('\n');
        const taskLineIndices = [];
        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
                taskLineIndices.push(idx);
            }
        });

        // 使用索引定位到具体的任务行
        if (taskIndex < 0 || taskIndex >= taskLineIndices.length) return;
        const lineIdx = taskLineIndices[taskIndex];
        const targetLine = lines[lineIdx];

        // 切换 [ ] 和 [x]
        let newLine, isChecked;
        if (targetLine.includes('[ ]')) {
            newLine = targetLine.replace('[ ]', '[x]');
            isChecked = true;
        } else if (targetLine.includes('[x]') || targetLine.includes('[X]')) {
            newLine = targetLine.replace(/\[x\]/i, '[ ]');
            isChecked = false;
        } else {
            return;
        }

        lines[lineIdx] = newLine;
        const newContent = lines.join('\n');
        if (newContent === shuoshuo.content) return;

        shuoshuo.content = newContent;
        shuoshuo.updated = Date.now();
        await this.saveShuoshuos();

        // 如果绑定了思源块，同步更新
        if (shuoshuo.boundBlockId) {
            await this.syncShuoshuoToSiyuan(shuoshuo);
        }

        // 就地更新 DOM 中的复选框状态，避免全量重渲染导致滚动
        const containers = this.getMountedLuminaContainers();
        if (!containers.length && this.container) containers.push(this.container);
        containers.forEach(container => {
            const card = container.querySelector(`.north-shuoshuo-note-card[data-id="${shuoshuoId}"]`);
            if (!card) return;
            const taskItems = card.querySelectorAll('.task-item');
            if (taskIndex >= taskItems.length) return;
            const taskItem = taskItems[taskIndex];
            const checkbox = taskItem.querySelector('.shuoshuo-task-checkbox');
            if (checkbox) {
                checkbox.checked = isChecked;
            }
            // 更新 data-task-line 为切换后的值，确保下次点击能匹配（兼容旧版传参方式）
            taskItem.dataset.taskLine = newLine;
        });
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
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconPin"></use></svg></span>
                <span class="north-shuoshuo-menu-text">${item.pinned ? '取消置顶' : '置顶'}</span>
            </div>
            <div class="north-shuoshuo-menu-item" data-action="edit">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconEdit"></use></svg></span>
                <span class="north-shuoshuo-menu-text">编辑</span>
            </div>
            <div class="north-shuoshuo-menu-divider"></div>
            <div class="north-shuoshuo-menu-item" data-action="comment">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconMark"></use></svg></span>
                <span class="north-shuoshuo-menu-text">批注</span>
            </div>
            ${item.boundBlockId ? `
            <div class="north-shuoshuo-menu-item" data-action="jump">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconOpen"></use></svg></span>
                <span class="north-shuoshuo-menu-text">跳转至文档</span>
            </div>
            <div class="north-shuoshuo-menu-item" data-action="sync">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconSparkles"></use></svg></span>
                <span class="north-shuoshuo-menu-text">同步到思源块</span>
            </div>
            ` : `
            <div class="north-shuoshuo-menu-item" data-action="sync">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconSparkles"></use></svg></span>
                <span class="north-shuoshuo-menu-text">插入今日日记</span>
            </div>
            `}
            <div class="north-shuoshuo-menu-divider"></div>
            <div class="north-shuoshuo-menu-item" data-action="add-to-moments">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconGlobe"></use></svg></span>
                <span class="north-shuoshuo-menu-text">添加到朋友圈</span>
            </div>
            <div class="north-shuoshuo-menu-item danger" data-action="delete">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:14px;height:14px;"><use xlink:href="#iconTrashcan"></use></svg></span>
                <span class="north-shuoshuo-menu-text">删除</span>
            </div>
        `;

        document.body.appendChild(menu);

        // 定位菜单
        const rect = triggerEl.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.zIndex = '99999';

        const menuHeight = menu.offsetHeight;
        const viewportHeight = window.innerHeight;

        // 检测菜单是否会超出视口底部，若超出则向上显示
        if (rect.bottom + 4 + menuHeight > viewportHeight) {
            menu.style.top = `${rect.top - menuHeight - 4}px`;
        } else {
            menu.style.top = `${rect.bottom + 4}px`;
        }
        menu.style.left = `${rect.left - 120}px`;

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
                case 'jump':
                    await this.openSiyuanBlockAndCloseMobileShell(item.boundBlockId);
                    break;
                case 'sync':
                    if (item.boundBlockId) {
                        // 已绑定的说说：手动触发重新同步到思源块
                        await this.syncShuoshuoToSiyuan(item);
                        showMessage('已同步到思源块');
                    } else {
                        await this.syncToDailyNote(id);
                    }
                    break;
                case 'add-to-moments':
                    await this.addShuoshuoToMoments(id);
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

    // 显示 LifeLog 卡片菜单（编辑 + 打开文档）
    // mouseX/mouseY: 右键点击时的鼠标位置（可选）
    showLifeLogMenu(id, triggerEl, mouseX, mouseY) {
        const existingMenu = document.querySelector('.north-shuoshuo-note-menu-dropdown');
        if (existingMenu) existingMenu.remove();

        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        const menu = document.createElement('div');
        menu.className = 'north-shuoshuo-note-menu-dropdown';
        menu.innerHTML = `
            <div class="north-shuoshuo-menu-item" data-action="edit">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconEdit"></use></svg></span>
                <span class="north-shuoshuo-menu-text">编辑</span>
            </div>
            <div class="north-shuoshuo-menu-item" data-action="jump">
                <span class="north-shuoshuo-menu-icon"><svg class="icon" style="width:16px;height:16px;"><use xlink:href="#iconOpen"></use></svg></span>
                <span class="north-shuoshuo-menu-text">打开文档</span>
            </div>
        `;

        document.body.appendChild(menu);

        menu.style.position = 'fixed';
        menu.style.zIndex = '99999';
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (mouseX != null && mouseY != null) {
            // 基于鼠标位置定位
            let top = mouseY;
            let left = mouseX;
            if (top + menuHeight > viewportHeight) top = mouseY - menuHeight;
            if (left + menuWidth > viewportWidth) left = viewportWidth - menuWidth - 8;
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;
        } else {
            const rect = triggerEl.getBoundingClientRect();
            if (rect.bottom + 4 + menuHeight > viewportHeight) {
                menu.style.top = `${rect.top - menuHeight - 4}px`;
            } else {
                menu.style.top = `${rect.bottom + 4}px`;
            }
            menu.style.left = `${rect.left - 120}px`;
        }

        menu.addEventListener('click', async (e) => {
            const menuItem = e.target.closest('.north-shuoshuo-menu-item');
            if (!menuItem) return;
            const action = menuItem.dataset.action;
            menu.remove();
            switch (action) {
                case 'edit':
                    await this.editLifeLog(id);
                    break;
                case 'jump':
                    if (item.boundBlockId) {
                        await this.openSiyuanBlockAndCloseMobileShell(item.boundBlockId);
                    }
                    break;
            }
        });

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }

    // 显示图片预览
    showImagePreview(imgSrc) {
        const overlay = document.createElement('div');
        overlay.className = 'north-shuoshuo-image-preview-modal';
        overlay.innerHTML = `
            <div class="north-shuoshuo-image-preview-overlay"></div>
            <div class="north-shuoshuo-image-preview-container">
                <img src="${imgSrc}" alt="图片预览" class="north-shuoshuo-image-preview-img">
                <div class="north-shuoshuo-image-preview-close">×</div>
            </div>
        `;
        document.body.appendChild(overlay);

        // 点击关闭
        const closeModal = () => overlay.remove();
        overlay.querySelector('.north-shuoshuo-image-preview-overlay').addEventListener('click', closeModal);
        overlay.querySelector('.north-shuoshuo-image-preview-close').addEventListener('click', closeModal);
        
        // 点击图片本身也关闭
        overlay.querySelector('.north-shuoshuo-image-preview-img').addEventListener('click', closeModal);

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 编辑 LifeLog（弹窗编辑思源块内容）
    async editLifeLog(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (!item || !item.boundBlockId) return;

        // 获取思源块原始内容
        let originalContent = '';
        try {
            const response = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stmt: `SELECT content FROM blocks WHERE id = '${item.boundBlockId}'` })
            });
            const result = await response.json();
            if (result.code === 0 && result.data && result.data.length > 0) {
                originalContent = result.data[0].content || '';
            }
        } catch (e) {}

        // 构造默认编辑内容：时间 类型：内容
        const timeStr = this.formatTimeForDiary(item.created);
        const typeStr = item._lifeLogType || this.extractType(originalContent) || '';
        const defaultContent = originalContent || `${timeStr} ${typeStr}：${item.content || ''}`;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex;
            align-items: center; justify-content: center; z-index: 99999;
        `;
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: var(--b3-theme-background); padding: 24px; border-radius: 12px;
            width: 500px; max-width: 90%; max-height: 80vh; overflow: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15); color: var(--b3-theme-on-background);
        `;
        dialog.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">编辑 LifeLog</div>
            <textarea id="lifelog-edit-content" style="
                width: 100%; min-height: 120px; padding: 12px;
                border: 1px solid var(--b3-border-color); border-radius: 8px;
                font-size: 14px; font-family: inherit; resize: vertical;
                outline: none; box-sizing: border-box; margin-bottom: 16px;
                background: var(--b3-theme-background); color: var(--b3-theme-on-background);
            ">${this.escapeHtml(defaultContent)}</textarea>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="lifelog-edit-cancel" style="
                    padding: 8px 16px; border: 1px solid var(--b3-border-color);
                    background: var(--b3-theme-background); border-radius: 6px;
                    cursor: pointer; font-size: 14px; color: var(--b3-theme-on-background);
                ">取消</button>
                <button id="lifelog-edit-save" style="
                    padding: 8px 16px; border: none; background: var(--b3-theme-primary);
                    color: var(--b3-theme-on-primary); border-radius: 6px;
                    cursor: pointer; font-size: 14px;
                ">保存</button>
            </div>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const textarea = dialog.querySelector('#lifelog-edit-content');
        textarea.focus();

        dialog.querySelector('#lifelog-edit-cancel').addEventListener('click', () => overlay.remove());

        dialog.querySelector('#lifelog-edit-save').addEventListener('click', async () => {
            const newContent = textarea.value.trim();
            if (!newContent) {
                showMessage('内容不能为空');
                return;
            }
            try {
                const updateResponse = await fetch('/api/block/updateBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataType: 'markdown', data: newContent, id: item.boundBlockId })
                });
                const updateResult = await updateResponse.json();
                if (updateResult.code === 0) {
                    overlay.remove();
                    showMessage('已保存');
                    // 刷新说说列表以显示更新后的内容
                    await this.loadShuoshuos();
                    this.refreshMountedShuoshuoViews();
                } else {
                    showMessage('保存失败: ' + (updateResult.msg || '未知错误'));
                }
            } catch (e) {
                showMessage('保存失败');
            }
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
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
            : targetCard.querySelector('.north-shuoshuo-review-card-content, .north-shuoshuo-review-content');
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
            contentEl.parentElement.insertBefore(editBox, contentEl.nextSibling);
        } else {
            contentEl.parentElement.appendChild(editBox);
        }

        const textarea = editBox.querySelector('.north-shuoshuo-inline-edit-field');
        const autoResize = () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
        };

        // 输入监听（@ mention）
        textarea.addEventListener('input', () => {
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
                    const newLine = '\n' + unorderedMatch[1];
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
            this.insertText(textarea, '- ', '');
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

            // 如果此说说已绑定到思源块，同步更新块内容和属性
            if (item.boundBlockId) {
                await this.syncShuoshuoToSiyuan(item);
            }

            this.refreshMountedShuoshuoViews();
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

            // 如果此说说已绑定到思源块，同步更新块内容和属性
            if (item.boundBlockId) {
                await this.syncShuoshuoToSiyuan(item);
            }

            this.refreshMountedShuoshuoViews();
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
        
        // 提取被引用笔记的内容预览（第一行，去除引用标记和标签）
        let preview = (note.content || '').replace(/\[MEMO:[^\]]+\]/g, '').trim();
        preview = preview.split('\n')[0];
        preview = preview.replace(/#[^\s\d][^\s]*(?:\/[^\s]+)*/g, '').trim().replace(/\s+/g, ' ');
        preview = preview.substring(0, 60) + (preview.length > 60 ? '...' : '');
        
        // 滚动到输入区域
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 插入 MEMO 引用到输入框顶部
        const currentValue = input.value.trim();
        const insertText = `${preview} [MEMO:${id}]`;
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

    // ===== 思源笔记双向绑定相关函数 =====

    /**
     * 从思源笔记中查询所有绑定了 Lumina 属性的块，加载为说说列表
     * 通过 SQL 查询具有 custom-lumina-content 属性的块，获取其内容和属性
     */
    async loadShuoshuosFromSiyuan() {
        this._lastLoadShuoshuosFromSiyuanOk = false;
        this._lastSiyuanBoundBlockIds = null;
        try {
            // 查询所有具有 custom-lumina-content 属性且内容非空的块
            const sqlResponse = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT b.id, b.content, b.updated
                           FROM blocks b
                           WHERE b.id IN (
                               SELECT a.block_id
                               FROM attributes a
                               WHERE a.name = 'custom-lumina-content' AND a.value != ''
                           )
                           ORDER BY b.updated DESC`
                })
            });
            const sqlResult = await sqlResponse.json();
            if (sqlResult.code !== 0 || !Array.isArray(sqlResult.data)) {
                return [];
            }
            this._lastLoadShuoshuosFromSiyuanOk = true;
            this._lastSiyuanBoundBlockIds = new Set(sqlResult.data.map(row => row?.id).filter(Boolean));

            const boundShuoshuos = [];
            for (const row of sqlResult.data) {
                const blockId = row.id;
                try {
                    // 获取块的自定义属性
                    const attrResponse = await fetch('/api/attr/getBlockAttrs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: blockId })
                    });
                    const attrResult = await attrResponse.json();
                    if (attrResult.code !== 0) continue;

                    const attrs = attrResult.data || {};
                    const attrContent = attrs['custom-lumina-content'] || '';
                    const luminaDate = attrs['custom-lumina-date'] || '';
                    const luminaTag = attrs['custom-lumina-tag'] || '';
                    const luminaType = attrs['custom-lumina-type'] || '';  // 类型（#类型# 格式中的类型名）

                    // 使用 custom-lumina-content 属性值（_syncBoundBlockAttr 已实时同步）
                    // 属性值为空时回退到 SQL 内容
                    let luminaContent = attrContent || (row.content || '').trim();
                    if (!luminaContent) continue;

                    // 清理 luminaContent：移除可能的时间前缀和类型前缀
                    // 处理格式："08:51 学习： 内容" 或 "08:51 #标签 内容" → 提取纯内容
                    // 先尝试匹配 "时间 #标签 内容" 格式
                    const tagMatch = luminaContent.match(/^\d{2}:\d{2}\s+#[\w\/\u4e00-\u9fa5-]+\s*/);
                    if (tagMatch) {
                        luminaContent = luminaContent.substring(tagMatch[0].length).trim();
                    } else {
                        // 尝试匹配 "时间 类型：内容" 格式
                        const typeMatch = luminaContent.match(/^\d{2}:\d{2}\s+([^：:]+)[：:]\s*/);
                        if (typeMatch) {
                            luminaContent = luminaContent.substring(typeMatch[0].length).trim();
                        }
                    }

                    // 如果块的真实内容（b.content）为空，说明用户在思源中删光了文字
                    // 此时应跳过此块，并清除属性值以便下次 SQL 查询也跳过
                    const rowContent = (row.content || '').trim();
                    if (!rowContent && attrContent) {
                        // 静默清除属性，让下次 SQL 不再查到
                        this.setLuminaBlockAttrs(blockId, {
                            content: '',
                            date: luminaDate,
                            tag: luminaTag,
                            type: luminaType
                        }).catch(() => {});
                        continue;
                    }

                    // 从属性中解析标签和类型
                    const tags = luminaTag ? luminaTag.split(/\s+/).filter(Boolean) : [];
                    const types = luminaType ? luminaType.split(/\s+/).filter(Boolean) : [];

                    // 解析日期时间
                    let created = Date.now();
                    if (luminaDate) {
                        const parsed = new Date(luminaDate.replace(/-/g, '/'));
                        if (!isNaN(parsed.getTime())) {
                            created = parsed.getTime();
                        }
                    }

                    // 根据 row.updated 计算 updated 时间
                    let updated = created;
                    if (row.updated) {
                        const updatedStr = String(row.updated);
                        // 思源返回的 updated 格式为 YYYYMMDDHHmmss 或 YYYYMMDD
                        if (/^\d{14}$/.test(updatedStr)) {
                            const y = updatedStr.slice(0, 4);
                            const M = updatedStr.slice(4, 6);
                            const d = updatedStr.slice(6, 8);
                            const h = updatedStr.slice(8, 10);
                            const m = updatedStr.slice(10, 12);
                            const s = updatedStr.slice(12, 14);
                            updated = new Date(`${y}-${M}-${d}T${h}:${m}:${s}`).getTime();
                        } else if (/^\d{8}$/.test(updatedStr)) {
                            const y = updatedStr.slice(0, 4);
                            const M = updatedStr.slice(4, 6);
                            const d = updatedStr.slice(6, 8);
                            updated = new Date(`${y}-${M}-${d}`).getTime();
                        } else {
                            const parsedUpdated = new Date(updatedStr.replace(/-/g, '/'));
                            if (!isNaN(parsedUpdated.getTime())) {
                                updated = parsedUpdated.getTime();
                            }
                        }
                    }

                    // 构建说说视图格式，保持标签原始位置
                    let displayContent;
                    const localShuoshuo = this.shuoshuos.find(s => s.boundBlockId === blockId);
                    if (localShuoshuo && localShuoshuo.content) {
                        // 使用本地旧内容作为模板，保持标签位置不变
                        displayContent = this.rebuildContentWithNewPureContent(localShuoshuo.content, luminaContent);
                    } else {
                        // 没有本地记录，默认标签在前
                        displayContent = luminaContent;
                        if (types.length > 0) {
                            displayContent = displayContent + ' ' + types.map(t => `#${t}#`).join(' ');
                        }
                        if (tags.length > 0) {
                            displayContent = tags.map(t => `#${t}`).join(' ') + ' ' + displayContent;
                        }
                    }

                    boundShuoshuos.push({
                        id: blockId, // 使用块ID作为唯一标识
                        content: displayContent,
                        tags: tags,
                        pinned: false,
                        created: created,
                        updated: updated,
                        boundBlockId: blockId // 标记已绑定到思源块
                    });
                } catch (e) {
                    // console.warn('[轻语] 读取块属性失败:', blockId, e);
                }
            }
            return boundShuoshuos;
        } catch (e) {
            // console.error('[轻语] 从思源查询绑定块失败:', e);
            return [];
        }
    }

    /**
     * 将说说内容同步更新到绑定的思源块
     * 同时更新块的内容和三个自定义属性
     */
    async syncShuoshuoToSiyuan(shuoshuo) {
        if (!shuoshuo || !shuoshuo.boundBlockId) return false;

        const blockId = shuoshuo.boundBlockId;
        try {
            // 1. 准备纯内容（去除标签和类型标记等）
            const tags = shuoshuo.tags || this.extractTags(shuoshuo.content);
            const types = this.extractType(shuoshuo.content);  // 提取类型（#类型# 格式）
            let pureContent = shuoshuo.content;
            
            // 移除所有 #类型# 格式（前后都有#号）
            pureContent = pureContent.replace(/#([\w\/\u4e00-\u9fa5-]+)#\s*/g, '').trim();
            
            // 移除开头 "类型：" 格式（如果存在）
            if (types) {
                pureContent = pureContent.replace(new RegExp(`^${types.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[：:]\\s*`), '').trim();
            }
            
            // 移除所有 #标签 格式（只有开头有#号）
            tags.forEach(tag => {
                pureContent = pureContent.replace(new RegExp(`#${tag}\\s*`, 'g'), '');
            });
            
            // 移除可能残留的单个#号
            pureContent = pureContent.replace(/\s*#\s*$/g, '').trim();
            
            pureContent = pureContent
                .replace(/\u200B|\u200C|\u200D|\uFEFF/g, '')
                .trim();

            // 2. 获取当前块的 kramdown 内容，检查是否是引用块格式
            const kramdownResponse = await fetch('/api/block/getBlockKramdown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: blockId })
            });
            const kramdownResult = await kramdownResponse.json();
            let isBlockquote = false;
            let hasNoteCallout = false;
            let blockquoteHeader = '';
            
            if (kramdownResult.code === 0 && kramdownResult.data) {
                const kramdown = kramdownResult.data.kramdown || '';
                // 检查是否是引用块格式
                if (kramdown.includes('> [!NOTE]')) {
                    isBlockquote = true;
                    hasNoteCallout = true;
                    // 提取标题行
                    const headerMatch = kramdown.match(/^> \[!NOTE\][^\n]*/);
                    if (headerMatch) {
                        blockquoteHeader = headerMatch[0];
                    }
                } else if (kramdown.trim().startsWith('>')) {
                    isBlockquote = true;
                }
            }

            // 3. 构建更新内容
            let updateContent;
            const timeStr = this.formatDateTimeAttr(shuoshuo.created).split(' ')[1]; // 获取时间 HH:mm
            
            // 如果有类型，构建 "时间 类型：内容" 格式
            if (types) {
                updateContent = `${timeStr} ${types}：${pureContent}`;
            } else if (isBlockquote && hasNoteCallout) {
                // 如果是 [!NOTE] 引用块格式，重建标题行以确保标签同步正确
                const lines = pureContent.split('\n');
                const dateStr = this.formatDateTimeAttr(shuoshuo.created).split(' ')[0];
                const dateTimeStr = this.formatDateTimeAttr(shuoshuo.created);
                const timePart = dateTimeStr.split(' ')[1];
                // 提取原有 emoji（如 ✏️）
                const emojiMatch = blockquoteHeader.match(/\[!NOTE\]\s+(\S+)/);
                const emoji = emojiMatch ? emojiMatch[1] : '✏️';
                updateContent = `> [!NOTE] ${emoji} ${dateStr} ${timePart}${tags.length > 0 ? ' ' + tags.join(' ') : ''}`;
                // 保持引述块连续，不添加额外的空行分隔
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    updateContent += '\n> ' + line;
                }
            } else if (tags.length > 0) {
                // 如果有标签但没有类型，且原块不是 [!NOTE] 引用块格式
                // 构建 "时间 #标签 内容" 格式
                updateContent = `${timeStr} #${tags[0]} ${pureContent}`;
            } else {
                // 普通格式，直接使用纯内容
                updateContent = pureContent;
            }

            // 4. 更新块内容（使用 markdown 格式）
            const updateResponse = await fetch('/api/block/updateBlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataType: 'markdown',
                    data: updateContent,
                    id: blockId
                })
            });
            const updateResult = await updateResponse.json();
            if (updateResult.code !== 0) {
                // console.warn('[轻语] 更新绑定块内容失败:', updateResult.msg);
            }

            // 5. 更新自定义属性（属性中保存纯内容、标签和类型）
            // LifeLog（类型：内容）不设置 custom-lumina-* 属性，避免 loadShuoshuosFromSiyuan 读取到导致重复
            if (!types) {
                const dateTimeStr = this.formatDateTimeAttr(shuoshuo.created);
                await this.setLuminaBlockAttrs(blockId, {
                    date: dateTimeStr,
                    content: pureContent,
                    tag: tags.join(' '),  // 保存标签
                    type: types  // 保存类型（#类型# 格式中的类型名）
                });
            }

            return true;
        } catch (e) {
            // console.error('[轻语] 同步说说到思源块失败:', e);
            return false;
        }
    }

    /**
     * 删除思源笔记中的块
     */
    async deleteSiyuanBlock(blockId) {
        if (!blockId) return false;
        try {
            const response = await fetch('/api/block/deleteBlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: blockId })
            });
            const result = await response.json();
            if (result.code === 0) {
                // console.log('[轻语] 已删除思源块:', blockId);
                return true;
            } else {
                // console.warn('[轻语] 删除思源块失败:', result.msg);
                return false;
            }
        } catch (e) {
            // console.error('[轻语] 删除思源块请求异常:', e);
            return false;
        }
    }

    // 同步到今日日记（手动触发），并保存 blockId 实现绑定
    async syncToDailyNote(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        if (!item) return;

        if (this.syncMode === 'dailynote' && !this.notebookId) {
            showMessage("请先设置日记笔记本");
            return;
        }
        if (this.syncMode === 'doc' && !this.syncDocId) {
            showMessage("请先设置同步目标文档ID");
            return;
        }

        const blockId = await this.appendToDailyNote(item.content, item.created);
        if (blockId) {
            // 指定文档模式下只单向同步，不保存 boundBlockId
            if (this.syncMode === 'dailynote') {
                item.boundBlockId = blockId;
                await this.saveShuoshuos();
                // LifeLog（类型：内容）提示与普通说说区分
                const isLifeLog = !!this.extractType(item.content);
                showMessage(isLifeLog ? "已同步到日记" : "已同步到日记，并与此说说绑定");
            } else {
                showMessage("已同步到指定文档");
            }
        } else {
            showMessage("同步失败，请检查配置");
        }
    }

    // 上传 base64 图片到思源 assets
    async uploadBase64ToAssets(base64Data, fileName) {
        try {
            const base64Response = await fetch(base64Data);
            const blob = await base64Response.blob();
            const file = new File([blob], fileName, { type: blob.type });
            const formData = new FormData();
            formData.append('assetsDirPath', '/assets/');
            formData.append('file[]', file);

            const token = window.siyuan?.config?.api?.token || '';
            const headers = {};
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }

            const response = await fetch('/api/asset/upload', {
                method: 'POST',
                body: formData,
                headers
            });
            const result = await response.json();
            if (result.code === 0 && result.data.succMap && Object.keys(result.data.succMap).length > 0) {
                let url = Object.values(result.data.succMap)[0];
                // 确保返回的是 assets/xxx 格式，不带前导 /
                if (url.startsWith('/')) {
                    url = url.substring(1);
                }
                return url;
            }
            return null;
        } catch (e) {
            console.error('上传图片到 assets 失败:', e);
            return null;
        }
    }

    _generateImageFileName(base64Data) {
        const mimeMatch = base64Data.match(/data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const extMap = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/bmp': '.bmp'
        };
        const ext = extMap[mimeType] || '.png';
        const now = new Date();
        const timeStr = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `image-${timeStr}-${randomStr}${ext}`;
    }

    async _migrateMomentsImages() {
        let hasChanges = false;
        for (const m of this.moments) {
            if (m.images && m.images.length > 0) {
                const newImages = [];
                let changed = false;
                for (const img of m.images) {
                    if (typeof img === 'string' && img.startsWith('data:')) {
                        const fileName = this._generateImageFileName(img);
                        const url = await this.uploadBase64ToAssets(img, fileName);
                        if (url) {
                            newImages.push(url);
                            changed = true;
                        } else {
                            newImages.push(img);
                        }
                    } else {
                        newImages.push(img);
                    }
                }
                if (changed) {
                    m.images = newImages;
                    hasChanges = true;
                }
            }
        }
        if (this.momentsConfig && this.momentsConfig.cover && typeof this.momentsConfig.cover === 'string' && this.momentsConfig.cover.startsWith('data:')) {
            const fileName = this._generateImageFileName(this.momentsConfig.cover);
            const url = await this.uploadBase64ToAssets(this.momentsConfig.cover, fileName);
            if (url) {
                this.momentsConfig.cover = url;
                hasChanges = true;
            }
        }
        if (hasChanges) {
            await this.saveMoments();
        }
    }

    // 同步单条朋友圈到思源笔记
    async syncMomentToSiyuan(mid) {
        const m = this.moments.find(x => x.id === mid);
        if (!m) return;

        const cfg = this.momentsConfig || {};
        const syncMode = cfg.syncMode || 'dailynote';
        const notebookId = cfg.syncNotebookId || '';
        const syncDocId = cfg.syncDocId || '';

        if (syncMode === 'dailynote' && !notebookId) {
            showMessage('请先在朋友圈设置中配置日记笔记本');
            return;
        }
        if (syncMode === 'doc' && !syncDocId) {
            showMessage('请先在朋友圈设置中配置同步目标文档ID');
            return;
        }

        // 构建 markdown 内容
        let content = m.text || '';

        // 处理图片：base64 先上传到 assets
        let imageUrls = [];
        if (m.images && m.images.length > 0) {
            let hasUpdate = false;
            const updatedImages = [];
            for (let i = 0; i < m.images.length; i++) {
                const imgUrl = m.images[i];
                if (imgUrl.startsWith('data:')) {
                    const mimeMatch = imgUrl.match(/data:([^;]+);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    const extMap = {
                        'image/jpeg': '.jpg',
                        'image/jpg': '.jpg',
                        'image/png': '.png',
                        'image/gif': '.gif',
                        'image/webp': '.webp',
                        'image/bmp': '.bmp'
                    };
                    const ext = extMap[mimeType] || '.png';
                    const now = new Date();
                    const timeStr = now.getFullYear().toString() +
                        String(now.getMonth() + 1).padStart(2, '0') +
                        String(now.getDate()).padStart(2, '0') +
                        String(now.getHours()).padStart(2, '0') +
                        String(now.getMinutes()).padStart(2, '0') +
                        String(now.getSeconds()).padStart(2, '0');
                    const randomStr = Math.random().toString(36).substring(2, 8);
                    const fileName = `image-${timeStr}-${randomStr}${ext}`;
                    const assetUrl = await this.uploadBase64ToAssets(imgUrl, fileName);
                    if (assetUrl) {
                        updatedImages.push(assetUrl);
                        hasUpdate = true;
                    } else {
                        updatedImages.push(imgUrl);
                    }
                } else {
                    updatedImages.push(imgUrl);
                }
            }
            if (hasUpdate) {
                m.images = updatedImages;
                await this.saveMoments();
            }
            imageUrls = updatedImages;
        }

        if (imageUrls.length > 0) {
            content += '\n\n' + imageUrls.map(url => `![图片](${url})`).join('\n');
        }
        if (m.file) {
            content += `\n\n📎 文件: ${m.file.name}`;
        }
        if (m.link) {
            content += `\n\n🔗 [${m.link.title}](${m.link.url})`;
        }

        const timeStr = this.formatTimeForDiary(m.created);
        const dateTimeStr = this.formatDateTimeAttr(m.created);
        const dateStr = dateTimeStr.split(' ')[0];

        // 构建引用块格式
        let diaryContent = `> [!NOTE] 📱 ${dateStr} ${timeStr}`;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            diaryContent += '\n> ' + lines[i];
        }
        diaryContent += ' ';

        let blockId = null;

        try {
            if (syncMode === 'dailynote') {
                // 朋友圈同步直接使用思源笔记本的 dailyNoteSavePath 配置
                // 传入空模板和 useGlobalTemplate=false，确保使用思源笔记本配置
                const docId = await this.getOrCreateDailyNoteDoc(new Date(m.created), notebookId, '', false);
                if (!docId) {
                    showMessage('无法获取或创建日记文档');
                    return;
                }
                const response = await fetch('/api/block/appendBlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parentID: docId,
                        dataType: 'markdown',
                        data: diaryContent
                    })
                });
                const result = await response.json();
                if (result.code !== 0) {
                    showMessage('同步失败: ' + result.msg);
                    return;
                }
                // 提取 blockId
                if (Array.isArray(result.data) && result.data.length > 0) {
                    const firstItem = result.data[0];
                    if (firstItem.doOperations && Array.isArray(firstItem.doOperations) && firstItem.doOperations.length > 0) {
                        blockId = firstItem.doOperations[0].id || firstItem.doOperations[0].blockId || null;
                    }
                } else if (result.data && typeof result.data === 'object') {
                    if (result.data.doOperations && Array.isArray(result.data.doOperations) && result.data.doOperations.length > 0) {
                        blockId = result.data.doOperations[0].id || result.data.doOperations[0].blockId || null;
                    } else {
                        blockId = result.data.id || result.data.blockId || null;
                    }
                } else if (typeof result.data === 'string') {
                    blockId = result.data;
                }
            } else if (syncMode === 'doc') {
                blockId = await this.appendToDocWithDateGroup(syncDocId, diaryContent, m.created);
            }

            if (blockId) {
                m.blockId = blockId;
                m.synced = true;
                await this.saveMoments();
                showMessage('已同步到思源笔记');
            } else {
                showMessage('同步失败，请检查配置');
            }
        } catch (e) {
            console.error('同步朋友圈到思源失败:', e);
            showMessage('同步失败');
        }
    }

    // 批量同步说说到思源笔记
    // isFullSync: 是否全量同步（包括已同步过的笔记）
    async batchSyncToSiyuan(isFullSync = false) {
        const itemsToSync = isFullSync ? [...this.shuoshuos] : this.shuoshuos.filter(s => !s.boundBlockId);
        if (itemsToSync.length === 0) {
            showMessage('所有笔记已同步，无需重复操作');
            return;
        }

        const total = itemsToSync.length;
        let successCount = 0;
        let failCount = 0;

        showMessage(`开始同步 ${total} 条笔记...`);

        for (let i = 0; i < itemsToSync.length; i++) {
            const item = itemsToSync[i];
            try {
                const blockId = await this.appendToDailyNote(item.content, item.created);
                if (blockId) {
                    // 指定文档模式下只单向同步，不保存 boundBlockId
                    if (this.syncMode === 'dailynote') {
                        item.boundBlockId = blockId;
                    }
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (e) {
                failCount++;
                console.error('同步笔记失败:', item.id, e);
            }
            // 每同步 5 条显示一次进度
            if ((i + 1) % 5 === 0 || i === itemsToSync.length - 1) {
                showMessage(`同步进度: ${i + 1}/${total} (${successCount} 成功${failCount > 0 ? `, ${failCount} 失败` : ''})`);
            }
        }

        await this.saveShuoshuos();

        if (failCount === 0) {
            showMessage(`✅ 全部同步完成！共 ${successCount} 条笔记`);
        } else {
            showMessage(`同步完成：${successCount} 条成功，${failCount} 条失败`);
        }
    }

    deleteShuoshuo(id) {
        const item = this.shuoshuos.find(s => s.id === id);
        // LifeLog 记录为只读，不允许删除
        if (item && item._isLifeLog) {
            showMessage('LifeLog 记录为只读，无法删除');
            return;
        }
        this.confirmAboveMobileShell("⚠️ 确认删除", "确定要删除这条笔记吗？\n\n如果已绑定到思源笔记块，将同时删除对应的块。", async () => {
            // 如果有绑定的思源块，先删除块
            this.shuoshuos = this.shuoshuos.filter(s => s.id !== id);
            await this.saveShuoshuos();
            if (item && item.boundBlockId) {
                await this.deleteSiyuanBlock(item.boundBlockId);
            }
            this.refreshMountedShuoshuoViews();
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
                const token = window.siyuan?.config?.api?.token || '';
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Token ${token}`;
                }
                const response = await fetch('/api/asset/upload', {
                    method: 'POST',
                    body: formData,
                    headers
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
                            await this.saveConfig();
                        } else {
                            this.userAvatarUrl = fullPath;
                            await this.saveConfig();
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

    // 刷新已绑定的思源块数据（从思源查询最新数据合并到本地列表）
    async refreshBoundBlocks() {
        // 指定文档模式下只单向同步，不执行双向绑定刷新
        if (this.syncMode === 'doc') return;
        try {
            const boundFromSiyuan = await this.loadShuoshuosFromSiyuan();
            if (!this._lastLoadShuoshuosFromSiyuanOk) return;

            const boundMap = new Map();
            boundFromSiyuan.forEach(s => boundMap.set(s.boundBlockId, s));

            let changed = false;
            const refreshed = [];
            for (const local of this.shuoshuos) {
                if (local.boundBlockId && boundMap.has(local.boundBlockId)) {
                    const siyuan = boundMap.get(local.boundBlockId);
                    // 如果思源数据与本地不同，更新
                    if (siyuan.content !== local.content ||
                        JSON.stringify(siyuan.tags) !== JSON.stringify(local.tags)) {
                        changed = true;
                        refreshed.push({
                            ...siyuan,
                            pinned: local.pinned || false,
                            id: local.id
                        });
                    } else {
                        refreshed.push(local);
                    }
                } else if (local.boundBlockId) {
                    changed = true;
                } else {
                    refreshed.push(local);
                }
            }
            this.shuoshuos = refreshed;

            // 添加思源中有但本地没有的新绑定说说
            const localBoundIds = new Set(
                this.shuoshuos.filter(s => s.boundBlockId).map(s => s.boundBlockId)
            );
            boundFromSiyuan.forEach(siyuan => {
                if (!localBoundIds.has(siyuan.boundBlockId)) {
                    this.shuoshuos.push(siyuan);
                    changed = true;
                }
            });

            if (changed) {
                await this.saveShuoshuos();
                // 重新渲染当前视图（但避免递归调用）
                if (this.currentMainView === 'notes' || this.currentMainView === 'week') {
                    this.renderNotes();
                }
            }
        } catch (e) {
            // console.warn('[轻语] 刷新绑定的块失败:', e.message);
        }
    }

    // 检查 blockId 是否是我们已绑定的块
    _isBoundBlockId(blockId) {
        if (!blockId) return false;
        // 优先使用缓存查找
        if (this._boundBlockIdsCache && this._boundBlockIdsCache.size > 0) {
            const has = this._boundBlockIdsCache.has(blockId);
            // console.log('[轻语] 缓存检查:', blockId, has, '缓存大小:', this._boundBlockIdsCache.size);
            return has;
        }
        // 缓存未初始化，遍历查找
        const found = this.shuoshuos && this.shuoshuos.some(s => s.boundBlockId === blockId);
        // console.log('[轻语] 遍历检查:', blockId, found);
        return found;
    }

    // 更新已绑定块ID的缓存
    _updateBoundCache() {
        if (!this._boundBlockIdsCache) {
            this._boundBlockIdsCache = new Set();
        }
        this._boundBlockIdsCache.clear();
        if (this.shuoshuos) {
            this.shuoshuos.forEach(s => {
                if (s.boundBlockId) {
                    this._boundBlockIdsCache.add(s.boundBlockId);
                }
            });
        }
    }

    // 通过子块ID查找父块ID（用于transaction事件中的列表项操作）
    // 返回父块ID，如果未找到则返回null
    async _findParentBlockId(childBlockId) {
        if (!childBlockId) return null;
        
        try {
            // 使用思源API查询块的父块信息
            const response = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT parent_id FROM blocks WHERE id = '${childBlockId}' LIMIT 1`
                })
            });
            const result = await response.json();
            if (result.code === 0 && result.data && result.data.length > 0) {
                return result.data[0].parent_id || null;
            }
        } catch (e) {
            // 查询失败，返回null
        }
        return null;
    }

    // 获取块的子块内容（用于列表块等包含子块的类型）
    // 返回组合后的纯文本内容，包含列表格式
    async _getBlockChildrenContent(parentBlockId) {
        if (!parentBlockId) return null;
        
        try {
            // 查询所有子块
            const response = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT id, content, type, subtype FROM blocks WHERE parent_id = '${parentBlockId}' ORDER BY created ASC`
                })
            });
            const result = await response.json();
            if (result.code !== 0 || !result.data || result.data.length === 0) {
                return null;
            }

            const children = result.data;
            
            // 判断父块类型
            const parentResponse = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT type, subtype FROM blocks WHERE id = '${parentBlockId}' LIMIT 1`
                })
            });
            const parentResult = await parentResponse.json();
            const parentType = parentResult.code === 0 && parentResult.data?.length > 0 
                ? parentResult.data[0].type 
                : '';
            const parentSubtype = parentResult.code === 0 && parentResult.data?.length > 0 
                ? parentResult.data[0].subtype 
                : '';

            // 获取每个子块的 kramdown 内容
            const contentLines = [];
            let index = 1;
            
            for (const child of children) {
                try {
                    const kramdownResponse = await fetch('/api/block/getBlockKramdown', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: child.id })
                    });
                    const kramdownResult = await kramdownResponse.json();
                    if (kramdownResult.code !== 0 || !kramdownResult.data) continue;
                    
                    const kramdown = kramdownResult.data.kramdown || '';
                    // console.log('[轻语] 子块kramdown:', JSON.stringify(kramdown));
                    const lines = kramdown.split('\n');
                    
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed.startsWith('{:')) continue;
                        
                        // 移除内联属性（只移除 {:...} 本身，不移除前面的空格）
                        let cleanedLine = trimmed.replace(/\{:([^}]+)\}/g, '').trim();
                        // console.log('[轻语] 清理后:', JSON.stringify(cleanedLine), 'parentSubtype:', parentSubtype);
                        
                        if (cleanedLine) {
                            // 根据父块类型添加列表标记
                            if (parentType === 'NodeList') {
                                if (parentSubtype === 'o') {
                                    // 有序列表：检查是否已经以数字.开头
                                    if (/^\d+\.\s+/.test(cleanedLine)) {
                                        contentLines.push(cleanedLine);
                                    } else {
                                        contentLines.push(`${index}. ${cleanedLine}`);
                                        index++;
                                    }
                                } else if (parentSubtype === 'u') {
                                    // 无序列表：检查是否已经以-或*或+开头
                                    if (/^[-*+]\s+/.test(cleanedLine)) {
                                        contentLines.push(cleanedLine);
                                    } else {
                                        contentLines.push(`- ${cleanedLine}`);
                                    }
                                } else if (parentSubtype === 't') {
                                    // 任务列表：检查是否已经以- [ ]或- [x]开头
                                    if (/^[-*+]\s+\[[xX\s]\]\s+/.test(cleanedLine)) {
                                        // 已经是完整格式，直接使用
                                        contentLines.push(cleanedLine);
                                    } else if (/^\[[xX\s]\]\s+/.test(cleanedLine)) {
                                        // 只有[x]标记，添加-前缀
                                        contentLines.push(`- ${cleanedLine}`);
                                    } else {
                                        // 纯内容，构造任务列表格式
                                        const isChecked = cleanedLine.startsWith('[x]') || cleanedLine.startsWith('[X]');
                                        const taskContent = cleanedLine.replace(/^\[[xX\s]\]\s*/, '');
                                        contentLines.push(`- [${isChecked ? 'x' : ' '}] ${taskContent}`);
                                    }
                                } else {
                                    // 默认无序列表
                                    if (/^[-*+]\s+/.test(cleanedLine)) {
                                        contentLines.push(cleanedLine);
                                    } else {
                                        contentLines.push(`- ${cleanedLine}`);
                                    }
                                }
                            } else {
                                contentLines.push(cleanedLine);
                            }
                        }
                    }
                } catch (e) {
                    // 单个子块处理失败，跳过
                }
            }
            
            return contentLines.length > 0 ? contentLines.join('\n').trim() : null;
        } catch (e) {
            // 查询失败，返回null
            return null;
        }
    }

    // 批量检查并同步绑定块的父块
    async _checkAndSyncBoundParents(blockIds) {
        try {
            // 去重
            const uniqueIds = [...new Set(blockIds)];
            // console.log('[轻语] 检查父块，块IDs:', uniqueIds);
            
            // 批量查询父块
            const idList = uniqueIds.map(id => `'${id}'`).join(',');
            const response = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stmt: `SELECT id, parent_id FROM blocks WHERE id IN (${idList})`
                })
            });
            const result = await response.json();
            // console.log('[轻语] 父块查询结果:', result);
            if (result.code !== 0 || !result.data) return;
            
            // 检查哪些父块是绑定的块
            const syncedBlocks = new Set();
            for (const row of result.data) {
                const parentId = row.parent_id;
                // console.log('[轻语] 检查父块是否绑定:', parentId, this._isBoundBlockId(parentId));
                if (parentId && this._isBoundBlockId(parentId) && !syncedBlocks.has(parentId)) {
                    // console.log('[轻语] 父块是绑定块，同步:', parentId);
                    this._debouncedSyncBoundAttr(parentId);
                    syncedBlocks.add(parentId);
                }
            }
        } catch (e) {
            // console.warn('[轻语] 检查父块失败:', e);
        }
    }

    // 防抖：将绑定块的当前内容同步到 custom-lumina-content 属性
    _debouncedSyncBoundAttr(blockId, kramdown) {
        if (!blockId) return;
        if (!this._syncAttrTimer) this._syncAttrTimer = {};
        if (this._syncAttrTimer[blockId]) {
            clearTimeout(this._syncAttrTimer[blockId]);
        }
        this._syncAttrTimer[blockId] = setTimeout(async () => {
            delete this._syncAttrTimer[blockId];
            await this._syncBoundBlockAttr(blockId, kramdown);
        }, 600);
    }

    // 将绑定块的当前内容同步到 custom-lumina-content 属性
    async _syncBoundBlockAttr(blockId, preKramdown) {
        try {
            let kramdown = preKramdown || '';
            // 如果没传入预提取的 kramdown（来自 transaction 事件），使用 API 获取
            if (!kramdown) {
                const kramdownResponse = await fetch('/api/block/getBlockKramdown', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: blockId })
                });
                const kramdownResult = await kramdownResponse.json();
                if (kramdownResult.code !== 0 || !kramdownResult.data) {
                    try {
                        const sqlResponse = await fetch('/api/query/sql', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ stmt: `SELECT id FROM blocks WHERE id = '${blockId}' LIMIT 1` })
                        });
                        const sqlResult = await sqlResponse.json();
                        if (sqlResult.code === 0 && (!sqlResult.data || sqlResult.data.length === 0)) {
                            const index = this.shuoshuos.findIndex(s => s.boundBlockId === blockId);
                            if (index !== -1) {
                                this.shuoshuos.splice(index, 1);
                                await this.saveShuoshuos();
                                this.refreshMountedShuoshuoViews();
                            }
                        }
                    } catch (e) {}
                    return;
                }
                kramdown = kramdownResult.data.kramdown || '';
            }
            // console.log('[轻语] 父块kramdown:', JSON.stringify(kramdown));

            // 2. 从 kramdown 中提取纯文本内容
            //    kramdown 格式: 可能包含属性行 {: key="val"}，后面跟实际内容
            //    并且可能有 id/updated 等思源自带属性
            //    列表项格式: "1. {: id=\"...\" updated=\"...\"}内容" 或 "- {: id=\"...\"}内容"
            let lines = kramdown.split('\n');
            let blockContent = '';

            // 处理每一行：移除内联属性 {: ...}，并跳过纯属性行
            const contentLines = [];
            for (const line of lines) {
                let trimmed = line.trim();
                // 跳过空行和以 {: 开头的纯属性行
                if (!trimmed || trimmed.startsWith('{:')) continue;
                
                // 移除引用块标记（> 开头的行），提取纯内容
                // 处理格式：> [!NOTE] ✏️ 2026-4-30 21:42 或 > 内容
                if (trimmed.startsWith('>')) {
                    // 移除开头的 > 和可能的空格
                    trimmed = trimmed.substring(1).trim();
                    // 跳过引用块标题行（包含 [!NOTE]）
                    if (trimmed.includes('[!NOTE]')) continue;
                }
                
                // 移除行内的属性标记 {: id="..." updated="..."}
                // 处理列表项中的内联属性，如: "1. {: id=\"...\"}内容" 或 "- {: id=\"...\"}内容"
                // 注意：只移除 {:...} 本身，不移除前面的空格，避免误删列表标记后的空格
                let cleanedLine = trimmed.replace(/\{:([^}]+)\}/g, '').trim();
                
                // 清理后如果只剩下列表标记（如"- "、"1. "），也跳过
                if (!cleanedLine || /^\d+\.\s*$|^[-*+]\s*$/.test(cleanedLine)) continue;
                
                if (cleanedLine) {
                    contentLines.push(cleanedLine);
                }
            }
            
            blockContent = contentLines.join('\n').trim();

            // 3. 如果块内容是空的但有子块（如列表块），尝试获取子块内容
            //    思源笔记的列表块（NodeList）的 kramdown 可能不包含子列表项内容
            if (!blockContent || blockContent === '{:}' || /^\d+\.\s*$|^[-*+]\s*$/.test(blockContent)) {
                const childContent = await this._getBlockChildrenContent(blockId);
                if (childContent) {
                    blockContent = childContent;
                }
            }

            // 4. 如果内容为空（用户删完了所有文字），清除属性并移除说说记录
            if (!blockContent) {
                const attrResponse = await fetch('/api/attr/getBlockAttrs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: blockId })
                });
                const attrResult = await attrResponse.json();
                if (attrResult.code === 0) {
                    const attrs = attrResult.data || {};
                    await this.setLuminaBlockAttrs(blockId, {
                        date: attrs['custom-lumina-date'] || '',
                        content: '',
                        tag: attrs['custom-lumina-tag'] || ''
                    });
                }
                // 从本地列表中移除对应的说说
                const index = this.shuoshuos.findIndex(s => s.boundBlockId === blockId);
                if (index !== -1) {
                    this.shuoshuos.splice(index, 1);
                    await this.saveShuoshuos();
                    this.refreshMountedShuoshuoViews();
                }
                return;
            }

            // 5. 获取当前属性
            const attrResponse = await fetch('/api/attr/getBlockAttrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: blockId })
            });
            const attrResult = await attrResponse.json();
            if (attrResult.code !== 0) return;
            const attrs = attrResult.data || {};
            const oldContent = attrs['custom-lumina-content'] || '';

            // 6. 如果内容变了，更新属性
            // console.log('[轻语] 提取内容:', JSON.stringify(blockContent), '旧内容:', JSON.stringify(oldContent));
            // 从 kramdown 标题行提取标签（用于引用块格式）
            let headerTags = [];
            try {
                const headerLine = kramdown.split('\n').find(line => line.trim().startsWith('>') && line.includes('[!NOTE]'));
                if (headerLine) {
                    const timeMatch = headerLine.match(/(\d{4}-\d{1,2}-\d{1,2}\s+\d{2}:\d{2})\s*(.*)/);
                    if (timeMatch) {
                        const afterTime = timeMatch[2].replace(/\{:.*/g, '').trim();
                        if (/[\w\u4e00-\u9fa5#]/.test(afterTime)) {
                            headerTags = afterTime.split(/\s+/).map(t => t.replace(/^#/, '')).filter(Boolean);
                        }
                    }
                }
            } catch (e) {}

            // 计算新标签
            let newTags = this.extractTags(blockContent);
            if (newTags.length === 0) {
                newTags = headerTags.length > 0 ? headerTags : (attrs['custom-lumina-tag'] || '').split(/\s+/).filter(Boolean);
            }

            const newTagStr = newTags.join(' ');
            const oldTagStr = attrs['custom-lumina-tag'] || '';
            const tagsChanged = newTagStr !== oldTagStr;

            if (blockContent !== oldContent || tagsChanged) {
                // 从旧说说内容中提取类型，用于更新属性
                const index = this.shuoshuos.findIndex(s => s.boundBlockId === blockId);
                // 如果块不在当前说说列表中，不设置属性（避免给 LifeLog 等未绑定块设置属性）
                if (index === -1) return;
                
                let currentType = attrs['custom-lumina-type'] || '';
                currentType = this.extractType(this.shuoshuos[index].content);
                const isLifeLog = !!this.shuoshuos[index]._isLifeLog || !!currentType;
                
                // LifeLog（类型：内容）不设置 custom-lumina-* 属性
                if (!isLifeLog) {
                    await this.setLuminaBlockAttrs(blockId, {
                        date: attrs['custom-lumina-date'] || '',
                        content: blockContent,
                        tag: newTagStr,
                        type: currentType
                    });
                    // console.log('[轻语] 已自动同步块内容到属性:', blockId);
                }

                // index 已在上面声明，这里直接使用
                if (index !== -1) {
                    // 保留说说视图中的标签和类型格式
                    const oldShuoshuoContent = this.shuoshuos[index].content;
                    const oldType = this.extractType(oldShuoshuoContent); // 提取原来的类型（如 #固#）
                    
                    // 解析思源笔记格式，支持两种格式：
                    // 1. "06:49 #标签 记录111" → 提取纯内容 "记录111"
                    // 2. "06:49 固：激励理论" → 提取纯内容 "激励理论"
                    let pureContent = blockContent;
                    let detectedType = ''; // 从思源笔记检测到的类型
                    
                    // 先尝试匹配 "时间 #标签 内容" 格式
                    const tagMatch = blockContent.match(/^\d{2}:\d{2}\s+#[\w\/\u4e00-\u9fa5-]+\s*/);
                    if (tagMatch) {
                        // 是 "时间 #标签 内容" 格式，提取纯内容部分
                        pureContent = blockContent.substring(tagMatch[0].length).trim();
                    } else {
                        // 尝试匹配 "时间 类型：内容" 格式（类型可以是中文、英文、数字等）
                        const typeMatch = blockContent.match(/^\d{2}:\d{2}\s+([^：:]+)[：:]\s*/);
                        if (typeMatch) {
                            // 是 "时间 类型：内容" 格式，提取纯内容部分
                            pureContent = blockContent.substring(typeMatch[0].length).trim();
                            detectedType = typeMatch[1].trim(); // 提取类型名称（如 "固"）
                        }
                    }

                    // 使用本地旧内容作为模板，保持标签位置不变
                    const oldContent = this.shuoshuos[index].content;
                    const newContent = this.rebuildContentWithNewPureContent(oldContent, pureContent);
                    
                    this.shuoshuos[index].content = newContent;
                    this.shuoshuos[index].tags = newTags;
                    this.shuoshuos[index].updated = Date.now();
                    await this.saveShuoshuos();
                    this.refreshMountedShuoshuoViews();
                }
            }
        } catch (e) {
            // console.warn('[轻语] 同步块属性失败:', e.message);
        }
    }

    // MutationObserver：监听 Protyle 编辑器 DOM 变化作为兜底
    _startMutationObserver() {
        try {
            if (this._protyleObserver) return;
            const targetNode = document.querySelector('.protyle-wysiwyg') ||
                               document.querySelector('.protyle-content') ||
                               document.getElementById('editor') ||
                               document.querySelector('.fn__flex-1');
            if (!targetNode) {
                setTimeout(() => this._startMutationObserver(), 2000);
                return;
            }
            this._protyleObserver = new MutationObserver((mutations) => {
                // console.log('[轻语] MutationObserver 触发，变化数:', mutations.length);
                for (const mutation of mutations) {
                    // 尝试获取直接包含 data-node-id 的元素
                    let blockEl = mutation.target?.closest?.('[data-node-id]');
                    let blockId = blockEl?.getAttribute('data-node-id');
                    
                    // console.log('[轻语] 检测到变化，目标:', mutation.target?.className, '块ID:', blockId, '类型:', mutation.type);
                    
                    // 如果找到绑定块，直接同步
                    if (blockId && this._isBoundBlockId(blockId)) {
                        // console.log('[轻语] 找到绑定块，准备同步:', blockId);
                        this._debouncedSyncBoundAttr(blockId);
                        break;
                    }
                    
                    // 如果没有直接找到，可能是列表项的情况
                    // 尝试查找父元素，看是否是列表容器
                    if (blockEl) {
                        // 检查是否是列表项 (.li 类) 或列表容器 (.list 类)
                        const listContainer = blockEl.closest?.('.list, [data-type="NodeList"]');
                        if (listContainer) {
                            const listBlockId = listContainer.getAttribute('data-node-id');
                            // console.log('[轻语] 找到列表容器，块ID:', listBlockId, '是否绑定:', this._isBoundBlockId(listBlockId));
                            if (listBlockId && this._isBoundBlockId(listBlockId)) {
                                // console.log('[轻语] 列表容器是绑定块，准备同步:', listBlockId);
                                this._debouncedSyncBoundAttr(listBlockId);
                                break;
                            }
                            
                            // 列表容器不是绑定块，向上查找列表的父级
                            const listParentEl = listContainer.parentElement?.closest?.('[data-node-id]');
                            if (listParentEl) {
                                const listParentId = listParentEl.getAttribute('data-node-id');
                                // console.log('[轻语] 找到列表父级，块ID:', listParentId, '是否绑定:', this._isBoundBlockId(listParentId));
                                if (listParentId && this._isBoundBlockId(listParentId)) {
                                    // console.log('[轻语] 列表父级是绑定块，准备同步:', listParentId);
                                    this._debouncedSyncBoundAttr(listParentId);
                                    break;
                                }
                            }
                        }
                        
                        // 再检查祖父元素是否是绑定块（处理嵌套列表情况）
                        const parentEl = blockEl.parentElement?.closest?.('[data-node-id]');
                        if (parentEl) {
                            const parentId = parentEl.getAttribute('data-node-id');
                            // console.log('[轻语] 检查父元素，块ID:', parentId, '是否绑定:', this._isBoundBlockId(parentId));
                            if (parentId && this._isBoundBlockId(parentId)) {
                                // console.log('[轻语] 父元素是绑定块，准备同步:', parentId);
                                this._debouncedSyncBoundAttr(parentId);
                                break;
                            }
                            
                            // 继续向上查找曾祖父元素
                            const grandParentEl = parentEl.parentElement?.closest?.('[data-node-id]');
                            if (grandParentEl) {
                                const grandParentId = grandParentEl.getAttribute('data-node-id');
                                // console.log('[轻语] 检查曾祖父元素，块ID:', grandParentId, '是否绑定:', this._isBoundBlockId(grandParentId));
                                if (grandParentId && this._isBoundBlockId(grandParentId)) {
                                    // console.log('[轻语] 曾祖父元素是绑定块，准备同步:', grandParentId);
                                    this._debouncedSyncBoundAttr(grandParentId);
                                    break;
                                }
                            }
                        }
                    }
                }
            });
            this._protyleObserver.observe(targetNode, {
                characterData: true,
                childList: true,
                subtree: true,
                attributes: false
            });
            // console.log('[轻语] MutationObserver 已启动，监听节点:', targetNode.className || targetNode.id);
        } catch (e) {
            // console.warn('[轻语] MutationObserver 启动失败:', e.message);
        }
    }

    // ============ WebSocket 广播连接：丝滑实时更新 ============

    _connectBroadcastWebSocket() {
        this._wsBroadcastDestroyed = false;
        if (this._wsBroadcast) {
            try { this._wsBroadcast.close(); } catch (e) {}
            this._wsBroadcast = null;
        }
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/broadcast?channel=wsjs`;
            this._wsBroadcast = new WebSocket(wsUrl);
            this._wsBroadcast.onopen = () => {
                this._wsBroadcastReconnectRetries = 0;
            };
            this._wsBroadcast.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this._handleBlockChange(msg);
                } catch (e) {}
            };
            this._wsBroadcast.onclose = () => {
                this._wsBroadcast = null;
                if (!this._wsBroadcastDestroyed) {
                    const delay = Math.min(1000 * Math.pow(2, (this._wsBroadcastReconnectRetries || 0)), 30000);
                    this._wsBroadcastReconnectRetries = (this._wsBroadcastReconnectRetries || 0) + 1;
                    this._wsBroadcastReconnectTimer = setTimeout(() => {
                        this._connectBroadcastWebSocket();
                    }, delay);
                }
            };
            this._wsBroadcast.onerror = () => {};
        } catch (e) {
            if (!this._wsBroadcastDestroyed) {
                this._wsBroadcastReconnectTimer = setTimeout(() => {
                    this._connectBroadcastWebSocket();
                }, 10000);
            }
        }
    }

    _disconnectBroadcastWebSocket() {
        this._wsBroadcastDestroyed = true;
        if (this._wsBroadcastReconnectTimer) {
            clearTimeout(this._wsBroadcastReconnectTimer);
            this._wsBroadcastReconnectTimer = null;
        }
        if (this._wsBroadcast) {
            try {
                this._wsBroadcast.onclose = null;
                this._wsBroadcast.close();
            } catch (e) {}
            this._wsBroadcast = null;
        }
    }

    _handleBlockChange(data) {
        if (!this.autoSync) return;
        const cmd = data.cmd || '';
        const blockId = data.id || null;
        const isBlockChange = cmd === 'saved' || cmd === 'setblockattrs' || cmd === 'updated';
        if (!isBlockChange) return;
        if (blockId) {
            if (this._isBoundBlockId(blockId)) {
                this._debouncedRefreshBound(blockId);
            }
        } else {
            this._debouncedRefreshBound();
        }
    }

    // 防抖刷新绑定的块（避免频繁请求）
    _debouncedRefreshBound(specificBlockId) {
        if (specificBlockId) {
            if (!this._refreshBlockTimers) this._refreshBlockTimers = {};
            if (this._refreshBlockTimers[specificBlockId]) {
                clearTimeout(this._refreshBlockTimers[specificBlockId]);
            }
            this._refreshBlockTimers[specificBlockId] = setTimeout(() => {
                delete this._refreshBlockTimers[specificBlockId];
                this._refreshSingleBoundBlock(specificBlockId);
            }, 250);
        } else {
            if (this._refreshTimer) {
                clearTimeout(this._refreshTimer);
            }
            this._refreshTimer = setTimeout(() => {
                this._refreshTimer = null;
                this.refreshBoundBlocks();
            }, 800);
        }
    }

    // 刷新单个绑定块的数据（更高效，只查一个块）
    async _refreshSingleBoundBlock(blockId) {
        try {
            // 在说说列表中查找对应的说说
            const index = this.shuoshuos.findIndex(s => s.boundBlockId === blockId);
            if (index === -1) return;

            const existing = this.shuoshuos[index];

            // 获取该块的最新属性
            const attrResponse = await fetch('/api/attr/getBlockAttrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: blockId })
            });
            const attrResult = await attrResponse.json();
            if (attrResult.code !== 0) return;

            const attrs = attrResult.data || {};
            const newContent = attrs['custom-lumina-content'] || '';
            const newTag = attrs['custom-lumina-tag'] || '';
            const newType = attrs['custom-lumina-type'] || '';

            // 从属性中解析标签和类型
            const newTags = newTag ? newTag.split(/\s+/).filter(Boolean) : [];
            const newTypes = newType ? newType.split(/\s+/).filter(Boolean) : [];

            // 构建说说视图格式：纯内容 + #类型#（如果有）+ #标签（如果有）
            let displayContent = newContent;
            if (newTypes.length > 0) {
                displayContent = displayContent + ' ' + newTypes.map(t => `#${t}#`).join(' ');
            }
            if (newTags.length > 0) {
                displayContent = displayContent + ' ' + newTags.map(t => `#${t}`).join(' ');
            }

            // 检查内容是否真的有变化
            if (displayContent === existing.content) return;

            // 更新说说对象
            this.shuoshuos[index] = {
                ...existing,
                content: displayContent,
                tags: newTags,
                updated: Date.now()
            };

            await this.saveShuoshuos();

            if ((this.currentMainView === 'notes' || this.currentMainView === 'week') && this.container) {
                const card = this.container.querySelector(`.north-shuoshuo-note-card[data-id="${existing.id}"]`);
                if (card) {
                    card.classList.add('north-shuoshuo-note-highlight');
                    setTimeout(() => card.classList.remove('north-shuoshuo-note-highlight'), 1500);
                }
                this.renderNotes();
                if (card) {
                    const newCard = this.container.querySelector(`.north-shuoshuo-note-card[data-id="${existing.id}"]`);
                    if (newCard) {
                        newCard.classList.add('north-shuoshuo-note-highlight');
                        setTimeout(() => newCard.classList.remove('north-shuoshuo-note-highlight'), 1500);
                    }
                }
            }
        } catch (e) {
            // console.warn('[轻语] 刷新单个绑定块失败:', e.message);
        }
    }

    // 切换主视图（说说视图 vs 设置视图）
    switchMainView(view, navItem) {
        // Dock 侧边栏始终只显示笔记列表视图，不参与视图切换
        if (this.container?.closest?.('.north-shuoshuo-dock-view') && view !== 'notes') {
            return;
        }
        const flomoArea = this.container.querySelector('.north-shuoshuo-flomo-area');
        const settingsArea = this.container.querySelector('#shuoshuo-settings-area');

        // 移动端：确保底部 Tabbar 在正确的容器中
        const tabbar = this.container.querySelector('.north-shuoshuo-mobile-tabbar');
        if (tabbar) {
            if (view === 'settings') {
                if (settingsArea) settingsArea.appendChild(tabbar);
            } else {
                const mainArea = this.container.querySelector('.north-shuoshuo-main');
                if (mainArea) mainArea.appendChild(tabbar);
            }
        }

        // 移动端：顶部 Header 和搜索栏只在说说视图显示
        const mobileHeader = this.container.querySelector('.north-shuoshuo-mobile-header');
        const mobileSearchBar = this.container.querySelector('.north-shuoshuo-mobile-search-bar');
        const isShuoshuoView = ['notes', 'week', 'review', 'random'].includes(view);
        if (mobileHeader) mobileHeader.style.display = (this.isMobile && isShuoshuoView) ? '' : 'none';
        if (mobileSearchBar) mobileSearchBar.classList.remove('show');

        // 移动端 Dock 栏内隐藏思源侧栏顶部工具栏；独立面板内打开时不影响宿主侧栏。
        // 仅朋友圈和说说相关视图隐藏顶部栏，统计、设置等视图保留。
        const shouldHideSiyuanSidebarToolbar = this.isMobile && !this.isInMobileShell() && (view === 'moments' || isShuoshuoView);
        if (shouldHideSiyuanSidebarToolbar) {
            const hideToolbar = () => {
                document.querySelectorAll('#sidebar>.toolbar').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
            };
            hideToolbar();
            if (!this._toolbarObserver) {
                this._toolbarObserver = new MutationObserver(hideToolbar);
                this._toolbarObserver.observe(document.body, { childList: true, subtree: true });
            }
        } else {
            if (this._toolbarObserver) {
                this._toolbarObserver.disconnect();
                this._toolbarObserver = null;
            }
            if (this._shuoshuoToolbarObserver) {
                this._shuoshuoToolbarObserver.disconnect();
                this._shuoshuoToolbarObserver = null;
            }
            document.querySelectorAll('#sidebar>.toolbar').forEach(el => {
                el.style.removeProperty('display');
            });
        }

        // 更新左侧边栏选中状态
        this.container.querySelectorAll('.north-shuoshuo-sidebar .north-shuoshuo-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const sidebarView = (view === 'review' || view === 'random' || view === 'week') ? 'notes' : view;
        const targetNav = navItem || this.container.querySelector(`.north-shuoshuo-sidebar .north-shuoshuo-nav-item[data-view="${sidebarView}"]`);
        if (targetNav) {
            targetNav.classList.add('active');
        }

        // 更新中间菜单选中状态
        this.container.querySelectorAll('.north-shuoshuo-menu-list .north-shuoshuo-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const targetMenu = this.container.querySelector(`.north-shuoshuo-menu-list .north-shuoshuo-menu-item[data-view="${view}"]`);
        if (targetMenu) {
            targetMenu.classList.add('active');
        }

        // 更新移动端底部 Tab 选中状态
        this.container.querySelectorAll('.north-shuoshuo-mobile-tabbar .mobile-tab-item').forEach(item => {
            item.classList.remove('active');
        });
        const sidebarViewMobile = (view === 'review' || view === 'random' || view === 'week') ? 'notes' : view;
        const targetMobileTab = this.container.querySelector(`.north-shuoshuo-mobile-tabbar .mobile-tab-item[data-view="${sidebarViewMobile}"]`);
        if (targetMobileTab) {
            targetMobileTab.classList.add('active');
        }

        this.currentMainView = view;

        // 重要：切换到说说相关视图时，先从思源SQL加载最新绑定块数据
        // 确保思源中修改的内容能在说说视图中立即反映
        const needsRefresh = ['notes', 'week', 'table', 'stats', 'review', 'random'];
        if (view === 'moments') {
            // 朋友圈视图独立渲染，不等待 loadShuoshuos，切换更丝滑
            if (flomoArea) flomoArea.style.display = 'flex';
            if (settingsArea) settingsArea.style.display = 'none';
            const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
            if (inputArea) inputArea.style.display = 'none';
            const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
            if (sidebar) sidebar.style.display = 'none';
            this.renderMoments();
            // 后台同步说说数据（不影响朋友圈视图）
            this.loadShuoshuos().catch(() => {});
        } else if (view === 'bookshelf') {
            if (flomoArea) flomoArea.style.display = 'flex';
            if (settingsArea) settingsArea.style.display = 'none';
            const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
            if (inputArea) inputArea.style.display = 'none';
            const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
            if (sidebar) sidebar.style.display = 'none';
            this.renderBookshelf();
        } else if (needsRefresh.includes(view)) {
            // 先显示视图框架，然后异步加载最新数据后渲染内容
            if (flomoArea) flomoArea.style.display = 'flex';
            if (settingsArea) settingsArea.style.display = 'none';
            // 显示输入区域（仅 notes 和 week 视图显示输入框，review 也显示）
            const inputArea = this.container.querySelector('.north-shuoshuo-input-area');
            if (inputArea) inputArea.style.display = (view === 'notes' || view === 'week' || view === 'review') ? 'block' : 'none';
            const sidebar = this.container.querySelector('.north-shuoshuo-flomo-sidebar');
            if (sidebar) sidebar.style.display = view === 'stats' || view === 'table' ? 'none' : '';
            // 恢复 notes-list 的 padding（书架视图会清除它）
            const notesList = this.container.querySelector('#shuoshuo-notes-list');
            if (notesList) notesList.style.padding = '';
            // 立即清空列表内容，避免旧视图残留导致闪烁
            if (view === 'review' || view === 'random') {
                const listEl = this.container.querySelector('#shuoshuo-notes-list');
                if (listEl) listEl.innerHTML = '';
            }
            // 异步加载思源数据并渲染
            this.loadShuoshuos().then(() => {
                if (this.currentMainView === view) {
                    switch (view) {
                        case 'notes':
                        case 'week': this.renderNotes(); break;
                        case 'review': this.renderReview(); break;
                        case 'random': this.renderRandom(); break;
                        case 'table': this.renderTable(); break;
                        case 'stats': this.renderStats(); break;
                    }
                }
            });
        } else {
            // settings 视图不需要刷新数据
            if (flomoArea) flomoArea.style.display = 'none';
            if (settingsArea) settingsArea.style.display = 'flex';
            this.bindSettingsEvents();
        }
    }

    // 加载笔记本列?
    async loadNotebooks() {
        const select = this.container?.querySelector('#settings-notebook-select');
        const momentsSelect = this.container?.querySelector('#moments-notebook-select');
        const bookshelfSelect = this.container?.querySelector('#bookshelf-notebook-select');

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
                
                // 重建主说说选项
                if (select) {
                    let html = '<option value="">请选择笔记?..</option>';
                    notebooks.forEach(nb => {
                        const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                        const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                        const selected = nb.id === this.notebookId ? 'selected' : '';
                        html += `<option value="${nb.id}" ${selected}>${icon} ${nb.name}</option>`;
                    });
                    select.innerHTML = html;
                }
                
                // 重建朋友圈选项
                if (momentsSelect) {
                    let html = '<option value="">请选择笔记本...</option>';
                    notebooks.forEach(nb => {
                        const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                        const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                        const selected = nb.id === (this.momentsConfig?.syncNotebookId || '') ? 'selected' : '';
                        html += `<option value="${nb.id}" ${selected}>${icon} ${nb.name}</option>`;
                    });
                    momentsSelect.innerHTML = html;
                }

                // 重建图书视图选项
                if (bookshelfSelect) {
                    let html = '<option value="">请选择笔记本...</option>';
                    notebooks.forEach(nb => {
                        const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                        const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                        const selected = nb.id === (this.bookshelfSyncConfig?.syncNotebookId || '') ? 'selected' : '';
                        html += `<option value="${nb.id}" ${selected}>${icon} ${nb.name}</option>`;
                    });
                    bookshelfSelect.innerHTML = html;
                }
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
            showMessage('加载笔记本列表失败');
        }
    }

    // 绑定设置页面事件
    async bindSettingsEvents() {
        // 加载笔记本列表
        this.loadNotebooks();

        // 加载朋友圈配置并更新输入框
        await this.loadMoments();
        const momentsNicknameInput = this.container.querySelector('#moments-nickname-input');
        const momentsSignatureInput = this.container.querySelector('#moments-signature-input');
        if (momentsNicknameInput) momentsNicknameInput.value = this.momentsConfig?.nickname || '月亮';
        if (momentsSignatureInput) momentsSignatureInput.value = this.momentsConfig?.signature || '言念君子 温其如玉';
        
        // 绑定朋友圈同步模式切换事件
        const momentsSyncModeSelect = this.container.querySelector('#moments-sync-mode-select');
        const momentsSyncDocIdRow = this.container.querySelector('#moments-sync-doc-id-row');
        if (momentsSyncModeSelect) {
            momentsSyncModeSelect.addEventListener('change', () => {
                const mode = momentsSyncModeSelect.value;
                if (!this.momentsConfig) this.momentsConfig = {};
                this.momentsConfig.syncMode = mode;
                if (momentsSyncDocIdRow) {
                    momentsSyncDocIdRow.style.display = mode === 'doc' ? 'block' : 'none';
                }
            });
        }

        // 绑定朋友圈字体大小模式选择事件
        const momentsFontSizeModeItems = this.container.querySelectorAll('#moments-font-size-mode-group .north-shuoshuo-radio-item');
        const momentsFontSizeCustomRow = this.container.querySelector('#moments-font-size-custom-row');
        const momentsFontSizeCustomInput = this.container.querySelector('#moments-font-size-custom-input');
        momentsFontSizeModeItems.forEach(item => {
            item.addEventListener('click', async () => {
                const mode = item.dataset.mode;
                if (!this.momentsConfig) this.momentsConfig = {};
                if (!this.momentsConfig.fontSize) this.momentsConfig.fontSize = { mode: 'default', customSize: 14.5 };
                this.momentsConfig.fontSize.mode = mode;
                momentsFontSizeModeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                if (momentsFontSizeCustomRow) {
                    momentsFontSizeCustomRow.style.display = mode === 'custom' ? 'flex' : 'none';
                }
                await this.saveMoments();
            });
        });
        if (momentsFontSizeCustomInput) {
            momentsFontSizeCustomInput.addEventListener('input', async () => {
                let size = parseFloat(momentsFontSizeCustomInput.value);
                if (isNaN(size) || size < 10) size = 10;
                if (size > 24) size = 24;
                if (!this.momentsConfig) this.momentsConfig = {};
                if (!this.momentsConfig.fontSize) this.momentsConfig.fontSize = { mode: 'default', customSize: 14.5 };
                this.momentsConfig.fontSize.customSize = size;
                await this.saveMoments();
            });
        }

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

                // 数据管理页面不需要保存/取消按钮
                const actionsBar = this.container.querySelector('.north-shuoshuo-actions');
                if (actionsBar) {
                    actionsBar.style.display = setting === 'data' ? 'none' : '';
                }
            });
        });

        // 初始化设置页面：每次打开设置都默认显示说说视图
        const defaultSetting = 'view';
        const navItems = this.container.querySelectorAll('.north-shuoshuo-settings-nav-item');
        navItems.forEach(item => {
            if (item.dataset.setting === defaultSetting) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        this.container.querySelectorAll('.north-shuoshuo-settings-section').forEach(group => {
            group.style.display = 'none';
        });
        const targetGroup = this.container.querySelector(`#setting-group-${defaultSetting}`);
        if (targetGroup) targetGroup.style.display = 'block';

        const actionsBar = this.container.querySelector('.north-shuoshuo-actions');
        if (actionsBar) {
            actionsBar.style.display = '';
        }

        // 视图样式下拉框
        const viewStyleSelect = this.container.querySelector('#view-style-select');
        if (viewStyleSelect) {
            viewStyleSelect.addEventListener('change', async () => {
                this.viewStyle = viewStyleSelect.value || 'list';
                await this.saveConfig();
                this.applyViewStyle();
            });
        }

        // 回车直接提交
        const enterSubmitSwitch = this.container.querySelector('#settings-enter-submit-switch');
        if (enterSubmitSwitch) {
            enterSubmitSwitch.addEventListener('click', async () => {
                enterSubmitSwitch.classList.toggle('on');
                this.enterToSubmit = enterSubmitSwitch.classList.contains('on');
                this.syncEnterKeyHint();
                await this.saveConfig();
            });
        }

        // 显示侧边栏
        const showSidebarDockSwitch = this.container.querySelector('#settings-show-sidebar-dock-switch');
        if (showSidebarDockSwitch) {
            // 使用 cloneNode 防止重复绑定事件
            showSidebarDockSwitch.replaceWith(showSidebarDockSwitch.cloneNode(true));
            const newShowSidebarDockSwitch = this.container.querySelector('#settings-show-sidebar-dock-switch');
            newShowSidebarDockSwitch.addEventListener('click', async () => {
                newShowSidebarDockSwitch.classList.toggle('on');
                this.showSidebarDock = newShowSidebarDockSwitch.classList.contains('on');
                await this.saveConfig();
                showMessage(this.showSidebarDock ? '已开启侧边栏，请刷新界面生效' : '已关闭侧边栏，请刷新界面生效');
            });
        }

        // 显示 LifeLog 记录
        const showLifeLogRecordsSwitch = this.container.querySelector('#settings-show-lifelog-records-switch');
        if (showLifeLogRecordsSwitch) {
            // 使用 cloneNode 防止重复绑定事件（bindSettingsEvents 每次切换设置视图都会调用）
            showLifeLogRecordsSwitch.replaceWith(showLifeLogRecordsSwitch.cloneNode(true));
            const newShowLifeLogRecordsSwitch = this.container.querySelector('#settings-show-lifelog-records-switch');
            newShowLifeLogRecordsSwitch.addEventListener('click', async () => {
                newShowLifeLogRecordsSwitch.classList.toggle('on');
                this.showLifeLogRecords = newShowLifeLogRecordsSwitch.classList.contains('on');
                await this.saveConfig();
                await this.loadShuoshuos();
                this.refreshMountedShuoshuoViews();
                showMessage(this.showLifeLogRecords ? '已开启 LifeLog 记录显示' : '已关闭 LifeLog 记录显示');
            });
        }

        // 紧凑模式
        const compactModeSwitch = this.container.querySelector('#settings-compact-mode-switch');
        if (compactModeSwitch) {
            compactModeSwitch.replaceWith(compactModeSwitch.cloneNode(true));
            const newCompactModeSwitch = this.container.querySelector('#settings-compact-mode-switch');
            newCompactModeSwitch.addEventListener('click', async () => {
                newCompactModeSwitch.classList.toggle('on');
                this.compactMode = newCompactModeSwitch.classList.contains('on');
                await this.saveConfig();
                this.applyCompactMode();
                // 刷新所有视图
                this.refreshMountedShuoshuoViews();
                showMessage(this.compactMode ? '已开启紧凑模式' : '已关闭紧凑模式');
            });
        }

        // 加权回顾开关
        const weightedReviewToggle = this.container.querySelector('#weighted-review-toggle');
        if (weightedReviewToggle) {
            weightedReviewToggle.replaceWith(weightedReviewToggle.cloneNode(true));
            const newWeightedReviewToggle = this.container.querySelector('#weighted-review-toggle');
            newWeightedReviewToggle.addEventListener('click', () => {
                newWeightedReviewToggle.classList.toggle('on');
            });
        }

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
                await this.saveConfig();
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
                await this.saveConfig();
            });
        });

        // 绑定字体大小模式选择事件
        const fontSizeModeItems = this.container.querySelectorAll('#font-size-mode-group .north-shuoshuo-radio-item');
        const fontSizeCustomRow = this.container.querySelector('#font-size-custom-row');
        const fontSizeCustomInput = this.container.querySelector('#font-size-custom-input');
        
        fontSizeModeItems.forEach(item => {
            item.addEventListener('click', async () => {
                const mode = item.dataset.mode;
                this.fontSizeConfig.mode = mode;
                
                // 更新选中状态
                fontSizeModeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // 更新 radio 输入
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 显示/隐藏自定义输入框
                if (fontSizeCustomRow) {
                    fontSizeCustomRow.style.display = mode === 'custom' ? 'flex' : 'none';
                }
                
                // 应用字体大小
                this.applyFontSizeConfig();
                
                // 保存设置
                await this.saveConfig();
            });
        });
        
        // 自定义字体大小输入
        if (fontSizeCustomInput) {
            fontSizeCustomInput.addEventListener('input', async () => {
                let size = parseFloat(fontSizeCustomInput.value);
                if (isNaN(size) || size < 10) size = 10;
                if (size > 24) size = 24;
                this.fontSizeConfig.customSize = size;
                this.applyFontSizeConfig();
                await this.saveConfig();
            });
        }

        // 图书视图字体大小设置
        const bookshelfFontInputs = [
            { id: 'bookshelf-font-title', key: 'title' },
            { id: 'bookshelf-font-highlight', key: 'highlight' },
            { id: 'bookshelf-font-thought', key: 'thought' }
        ];
        bookshelfFontInputs.forEach(({ id, key }) => {
            const input = this.container.querySelector(`#${id}`);
            if (input) {
                input.addEventListener('change', async () => {
                    let val = parseInt(input.value);
                    if (isNaN(val) || val < 10) val = 10;
                    if (val > 24) val = 24;
                    input.value = val;
                    this.bookshelfFontConfig[key] = val;
                    this.applyBookshelfFontConfig();
                    await this.saveConfig();
                });
            }
        });

        // 图书视图同步配置
        const bookshelfSyncModeItems = this.container.querySelectorAll('#bookshelf-sync-mode-group .north-shuoshuo-radio-item');
        const bookshelfSyncDocIdRow = this.container.querySelector('#bookshelf-sync-doc-id-row');
        const bookshelfSyncDocIdInput = this.container.querySelector('#bookshelf-sync-doc-id');
        const bookshelfNotebookSelect = this.container.querySelector('#bookshelf-notebook-select');
        const bookshelfRefreshBtn = this.container.querySelector('#bookshelf-refresh-notebooks');
        const bookshelfSyncStatus = this.container.querySelector('#bookshelf-sync-status');

        bookshelfSyncModeItems.forEach(item => {
            item.addEventListener('click', async () => {
                const mode = item.dataset.mode;
                this.bookshelfSyncConfig.syncMode = mode;
                bookshelfSyncModeItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                if (bookshelfSyncDocIdRow) {
                    bookshelfSyncDocIdRow.style.display = mode === 'doc' ? 'block' : 'none';
                }
                await this.saveConfig();
            });
        });

        if (bookshelfSyncDocIdInput) {
            bookshelfSyncDocIdInput.addEventListener('change', async () => {
                this.bookshelfSyncConfig.syncDocId = bookshelfSyncDocIdInput.value.trim();
                await this.saveConfig();
            });
        }

        if (bookshelfNotebookSelect) {
            bookshelfNotebookSelect.addEventListener('change', async () => {
                this.bookshelfSyncConfig.syncNotebookId = bookshelfNotebookSelect.value;
                if (bookshelfSyncStatus) {
                    if (bookshelfNotebookSelect.value) {
                        bookshelfSyncStatus.textContent = '已配置';
                        bookshelfSyncStatus.className = 'north-shuoshuo-badge north-shuoshuo-badge-success';
                    } else {
                        bookshelfSyncStatus.textContent = '未配置';
                        bookshelfSyncStatus.className = 'north-shuoshuo-badge';
                        bookshelfSyncStatus.style.background = '#f5f5f5';
                        bookshelfSyncStatus.style.color = '#888';
                    }
                }
                await this.saveConfig();
            });
        }

        if (bookshelfRefreshBtn) {
            bookshelfRefreshBtn.onclick = () => {
                showMessage('正在加载笔记本列表...');
                this.loadNotebooks();
            };
        }

        const saveBtn = this.container.querySelector('#settings-save');
        const cancelBtn = this.container.querySelector('#settings-cancel');
        const exportShuoshuoJsonBtn = this.container.querySelector('#settings-export-shuoshuo-json');
        const exportShuoshuoMdBtn = this.container.querySelector('#settings-export-shuoshuo-md');
        const exportMomentsJsonBtn = this.container.querySelector('#settings-export-moments-json');
        const exportMomentsMdBtn = this.container.querySelector('#settings-export-moments-md');

        // 绑定同步模式切换事件
        const syncModeSelect = this.container.querySelector('#sync-mode-select');
        const syncDocIdRow = this.container.querySelector('#sync-doc-id-row');
        if (syncModeSelect) {
            syncModeSelect.addEventListener('change', () => {
                const mode = syncModeSelect.value;
                this.syncMode = mode;
                if (syncDocIdRow) {
                    syncDocIdRow.style.display = mode === 'doc' ? 'block' : 'none';
                }
            });
        }

        // daily note 路径模板示例点击填入（说说设置）
        const dailyNoteTemplateTextarea = this.container.querySelector('#settings-daily-note-path-template');
        if (dailyNoteTemplateTextarea) {
            const dailyNoteExamples = this.container.querySelectorAll('#settings-daily-note-path-template ~ .daily-note-examples-row .daily-note-example, #settings-daily-note-path-template + div .daily-note-example');
            dailyNoteExamples.forEach(example => {
                example.addEventListener('click', () => {
                    const template = example.dataset.template;
                    if (template) {
                        dailyNoteTemplateTextarea.value = template;
                        dailyNoteTemplateTextarea.focus();
                        showMessage('已填入示例模板');
                    }
                });
            });
        }

        // 日记动态图标选择
        const dailyNoteIconOptions = this.container.querySelectorAll('#dailyNoteIconOptions .daily-note-icon-option');
        const dailyNoteIconColors = this.container.querySelector('#dailyNoteIconColors');
        const updateIconPreview = () => {
            const activeType = this.container.querySelector('#dailyNoteIconOptions .daily-note-icon-option.active')?.dataset?.iconType || '';
            if (dailyNoteIconColors) {
                dailyNoteIconColors.style.display = activeType ? 'flex' : 'none';
            }
            // 更新所有预览图标的颜色
            dailyNoteIconOptions.forEach(option => {
                const type = option.dataset.iconType;
                const img = option.querySelector('img');
                if (img && type) {
                    const today = new Date();
                    const dateStr = today.toISOString().split('T')[0];
                    const isWeekend = [0, 6].includes(today.getDay());
                    const colorInput = this.container.querySelector(`.daily-note-icon-color-input[data-color-group="${isWeekend ? 'weekend' : 'weekday'}"]`);
                    const color = colorInput?.value?.trim() || '';
                    const colorParam = color ? `&color=${encodeURIComponent(color.startsWith('#') ? color : '#' + color)}` : '';
                    img.src = `/api/icon/getDynamicIcon?type=${type}&date=${dateStr}${colorParam}`;
                }
            });
        };
        dailyNoteIconOptions.forEach(option => {
            option.addEventListener('click', () => {
                dailyNoteIconOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                updateIconPreview();
            });
        });

        // 日记动态图标颜色选择
        const colorDots = this.container.querySelectorAll('.daily-note-icon-color-dot');
        const colorInputs = this.container.querySelectorAll('.daily-note-icon-color-input');
        colorDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const group = dot.dataset.colorGroup;
                const color = dot.dataset.color;
                // 更新同组所有圆点状态
                this.container.querySelectorAll(`.daily-note-icon-color-dot[data-color-group="${group}"]`).forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                // 同步更新输入框
                const input = this.container.querySelector(`.daily-note-icon-color-input[data-color-group="${group}"]`);
                if (input) input.value = color.replace(/^#/, '');
                updateIconPreview();
            });
        });
        colorInputs.forEach(input => {
            input.addEventListener('input', () => {
                const group = input.dataset.colorGroup;
                const val = input.value.trim();
                const fullColor = val ? (val.startsWith('#') ? val : '#' + val) : '';
                // 更新圆点状态
                this.container.querySelectorAll(`.daily-note-icon-color-dot[data-color-group="${group}"]`).forEach(d => {
                    d.classList.toggle('active', fullColor && d.dataset.color === fullColor);
                });
                updateIconPreview();
            });
        });

        // 模板变量弹窗交互
        const dailyNoteVarsBtn = this.container.querySelector('#dailyNoteVarsBtn');
        const dailyNoteVarsPopup = this.container.querySelector('#dailyNoteVarsPopup');
        const dailyNoteVarsOverlay = this.container.querySelector('#dailyNoteVarsOverlay');
        const dailyNoteVarsClose = this.container.querySelector('#dailyNoteVarsClose');
        const dailyNoteVarTags = this.container.querySelectorAll('.daily-note-var-tag');
        const dailyNoteVarsPreviewInput = this.container.querySelector('#dailyNoteVarsPreviewInput');
        const dailyNoteVarsPreviewCopy = this.container.querySelector('#dailyNoteVarsPreviewCopy');
        const dailyNoteVarsTreeWrap = this.container.querySelector('#dailyNoteVarsTreeWrap');

        const openVarsPopup = () => {
            if (dailyNoteVarsPopup) dailyNoteVarsPopup.classList.add('active');
        };
        const closeVarsPopup = () => {
            if (dailyNoteVarsPopup) dailyNoteVarsPopup.classList.remove('active');
        };

        // 文档树预览 HTML 生成
        const buildDocTreeHtml = (path) => {
            if (!path || !path.trim()) return '<div style="color:var(--b3-theme-on-surface-light);font-size:12px;padding:4px 0;">输入模板后将在此显示预览...</div>';
            const parts = path.split('/').filter(p => p.trim());
            if (parts.length === 0) return '<div style="color:var(--b3-theme-on-surface-light);font-size:12px;padding:4px 0;">输入模板后将在此显示预览...</div>';
            let html = '';
            parts.forEach((part, index) => {
                const isLast = index === parts.length - 1;
                const iconClass = index === 0 ? 'root' : (isLast ? 'file' : 'folder');
                const textClass = isLast ? 'leaf' : '';
                const indentHtml = index > 0 ? '<span class="daily-note-tree-indent">│</span>' : '';
                html += `<div class="daily-note-tree-node" style="padding-left:${index * 14}px">
                    ${indentHtml}
                    <span class="daily-note-tree-icon ${iconClass}"></span>
                    <span class="daily-note-tree-text ${textClass}">${this.escapeHtml(part)}</span>
                </div>`;
            });
            return html;
        };

        // 更新弹窗内的预览（输入框 + 文档树）
        const updatePopupPreview = () => {
            if (!dailyNoteVarsPreviewInput) return;
            const template = dailyNoteVarsPreviewInput.value;
            const now = new Date();
            const rendered = this.renderDailyNotePath(template, now);
            if (dailyNoteVarsTreeWrap) {
                dailyNoteVarsTreeWrap.innerHTML = buildDocTreeHtml(rendered);
            }
        };

        // 打开弹窗时：把设置页面 textarea 的值同步到弹窗输入框，并刷新预览
        const openVarsPopupWithSync = () => {
            openVarsPopup();
            if (dailyNoteVarsPreviewInput && dailyNoteTemplateTextarea) {
                dailyNoteVarsPreviewInput.value = dailyNoteTemplateTextarea.value;
            }
            updatePopupPreview();
        };

        if (dailyNoteVarsBtn) dailyNoteVarsBtn.addEventListener('click', openVarsPopupWithSync);
        if (dailyNoteVarsOverlay) dailyNoteVarsOverlay.addEventListener('click', closeVarsPopup);
        if (dailyNoteVarsClose) dailyNoteVarsClose.addEventListener('click', closeVarsPopup);

        // 弹窗内输入框编辑时，实时更新文档树预览（不影响设置页面 textarea）
        if (dailyNoteVarsPreviewInput) {
            dailyNoteVarsPreviewInput.addEventListener('input', updatePopupPreview);
        }

        // 点击变量插入到弹窗输入框光标位置
        dailyNoteVarTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const variable = tag.dataset.var;
                if (dailyNoteVarsPreviewInput && variable) {
                    const start = dailyNoteVarsPreviewInput.selectionStart;
                    const end = dailyNoteVarsPreviewInput.selectionEnd;
                    const text = dailyNoteVarsPreviewInput.value;
                    dailyNoteVarsPreviewInput.value = text.slice(0, start) + variable + text.slice(end);
                    dailyNoteVarsPreviewInput.selectionStart = dailyNoteVarsPreviewInput.selectionEnd = start + variable.length;
                    dailyNoteVarsPreviewInput.focus();
                    updatePopupPreview();
                }
            });
        });

        // 弹窗内复制路径（复制弹窗输入框的内容）
        if (dailyNoteVarsPreviewCopy) {
            dailyNoteVarsPreviewCopy.addEventListener('click', () => {
                const text = dailyNoteVarsPreviewInput?.value || '';
                if (!text) {
                    showMessage('没有可复制的内容');
                    return;
                }
                navigator.clipboard.writeText(text).then(() => {
                    dailyNoteVarsPreviewCopy.textContent = '✅ 已复制';
                    dailyNoteVarsPreviewCopy.classList.add('copied');
                    showMessage('路径已复制到剪贴板');
                    setTimeout(() => {
                        dailyNoteVarsPreviewCopy.textContent = '📋 复制';
                        dailyNoteVarsPreviewCopy.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    showMessage('复制失败，请手动复制');
                });
            });
        }

        if (saveBtn) {
            saveBtn.onclick = async () => {
                const notebookId = this.container.querySelector('#settings-notebook-select')?.value || '';
                const autoSyncSwitchEl = this.container.querySelector('#settings-auto-sync-switch');
                // 明确转换为布尔值
                const autoSync = autoSyncSwitchEl?.classList.contains('on') ? true : false;
                // 获取选中的视图样式
                const viewStyleSelect = this.container.querySelector('#view-style-select');
                this.viewStyle = viewStyleSelect?.value || 'list';
                // 获取同步模式和指定文档ID
                this.syncMode = this.container.querySelector('#sync-mode-select')?.value || 'dailynote';
                this.syncDocId = this.container.querySelector('#settings-sync-doc-id')?.value?.trim() || '';
                this.dailyNotePathTemplate = this.container.querySelector('#settings-daily-note-path-template')?.value?.trim() || '';
                this.dailyNoteIconType = this.container.querySelector('#dailyNoteIconOptions .daily-note-icon-option.active')?.dataset?.iconType || '';
                const weekdayColorInput = this.container.querySelector('.daily-note-icon-color-input[data-color-group="weekday"]');
                const weekendColorInput = this.container.querySelector('.daily-note-icon-color-input[data-color-group="weekend"]');
                this.dailyNoteIconColorWeekday = weekdayColorInput?.value?.trim() || '';
                this.dailyNoteIconColorWeekend = weekendColorInput?.value?.trim() || '';

                // 获取检索式可见性配置
                const queryVisibilityCheckboxes = this.container.querySelectorAll('input[name="query-visibility"]');
                queryVisibilityCheckboxes.forEach(cb => {
                    this.queryVisibility[cb.value] = cb.checked;
                });

                // 获取长笔记自动折叠配置
                const autoCollapseSelect = this.container.querySelector('#auto-collapse-lines');
                this.autoCollapseLines = parseInt(autoCollapseSelect?.value || '0', 10);

                // 获取自定义签名
                const signatureInput = this.container.querySelector('#custom-signature-input');
                this.customSignature = signatureInput?.value?.trim() || '遇事不决，可问春风';

                this.notebookId = notebookId;
                const prevAutoSync = this.autoSync;
                this.autoSync = autoSync;
                if (this.autoSync && !prevAutoSync) {
                    this._connectBroadcastWebSocket();
                }

                await this.saveConfig();

                // 保存回顾设置
                const reviewScope = this.container.querySelector('input[name="review-content-scope"]:checked')?.value || 'all';
                const reviewTags = Array.from(this.container.querySelectorAll('#review-tags-select input:checked')).map(cb => cb.value);
                const reviewTimeRange = this.container.querySelector('#review-time-range')?.value || '6_months';
                const reviewDailyCount = parseInt(this.container.querySelector('#review-daily-count')?.value || '8');
                const weightedReview = this.container.querySelector('#weighted-review-toggle')?.classList?.contains('on') || false;

                this.reviewConfig = {
                    contentScope: reviewScope,
                    contentScopeTags: reviewTags,
                    timeRange: reviewTimeRange,
                    dailyCount: reviewDailyCount,
                    weightedReview: weightedReview
                };

                await this.saveConfig();

                // 保存朋友圈设置
                const momentsNickname = this.container.querySelector('#moments-nickname-input')?.value?.trim() || '月亮';
                const momentsSignature = this.container.querySelector('#moments-signature-input')?.value?.trim() || '言念君子 温其如玉';
                const momentsNotebookId = this.container.querySelector('#moments-notebook-select')?.value || '';
                const momentsSyncMode = this.container.querySelector('#moments-sync-mode-select')?.value || 'dailynote';
                const momentsSyncDocId = this.container.querySelector('#moments-sync-doc-id')?.value?.trim() || '';
                const momentsFontSizeMode = this.container.querySelector('input[name="moments-font-size-mode"]:checked')?.value || 'default';
                const momentsFontSizeCustom = parseFloat(this.container.querySelector('#moments-font-size-custom-input')?.value) || 14.5;
                if (!this.momentsConfig) this.momentsConfig = {};
                this.momentsConfig.nickname = momentsNickname;
                this.momentsConfig.signature = momentsSignature;
                this.momentsConfig.syncNotebookId = momentsNotebookId;
                this.momentsConfig.syncMode = momentsSyncMode;
                this.momentsConfig.syncDocId = momentsSyncDocId;
                if (!this.momentsConfig.fontSize) this.momentsConfig.fontSize = { mode: 'default', customSize: 14.5 };
                this.momentsConfig.fontSize.mode = momentsFontSizeMode;
                this.momentsConfig.fontSize.customSize = momentsFontSizeCustom;
                await this.saveMoments();

                // 保存图书视图同步设置
                const bookshelfNotebookId = this.container.querySelector('#bookshelf-notebook-select')?.value || '';
                const bookshelfSyncMode = this.container.querySelector('input[name="bookshelf-sync-mode"]:checked')?.value || 'dailynote';
                const bookshelfSyncDocId = this.container.querySelector('#bookshelf-sync-doc-id')?.value?.trim() || '';
                if (!this.bookshelfSyncConfig) this.bookshelfSyncConfig = { ...DEFAULT_BOOKSHELF_SYNC_CONFIG };
                this.bookshelfSyncConfig.syncNotebookId = bookshelfNotebookId;
                this.bookshelfSyncConfig.syncMode = bookshelfSyncMode;
                this.bookshelfSyncConfig.syncDocId = bookshelfSyncDocId;
                await this.saveConfig();

                // 保存后立即应用涉及 DOM 的配置
                this._rebuildQuerySections();
                this.syncEnterKeyHint();
                this.applyFontSizeConfig();

                showMessage('设置已保存');
            };
        }

        // 开始同步按钮
        const startSyncBtn = this.container.querySelector('#settings-start-sync');
        const fullSyncCheckbox = this.container.querySelector('#settings-full-sync');
        if (startSyncBtn) {
            startSyncBtn.onclick = async () => {
                if (this.syncMode === 'dailynote' && !this.notebookId) {
                    showMessage('请先设置日记笔记本');
                    return;
                }
                if (this.syncMode === 'doc' && !this.syncDocId) {
                    showMessage('请先设置同步目标文档ID');
                    return;
                }
                const isFullSync = fullSyncCheckbox?.checked || false;
                await this.batchSyncToSiyuan(isFullSync);
                // 同步完成后取消勾选全量同步
                if (fullSyncCheckbox) fullSyncCheckbox.checked = false;
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = () => {
                // 返回说说视图
                this.switchMainView('notes', this.container.querySelector('.north-shuoshuo-sidebar .north-shuoshuo-nav-item[data-view="notes"]'));
            };
        }

        if (exportShuoshuoJsonBtn) {
            exportShuoshuoJsonBtn.onclick = () => {
                const dateStr = new Date().toISOString().split('T')[0];
                const data = JSON.stringify(this.shuoshuos, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `shuoshuo-backup-${dateStr}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showMessage('说说数据 (JSON) 已导出');
            };
        }

        if (exportShuoshuoMdBtn) {
            exportShuoshuoMdBtn.onclick = async () => {
                const dateStr = new Date().toISOString().split('T')[0];
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                let md = `# 说说备份\n> 导出时间：${dateStr} ${timeStr}\n> 共 ${this.shuoshuos.length} 条笔记\n\n---\n\n`;
                const sorted = [...this.shuoshuos].sort((a, b) => (a.created || 0) - (b.created || 0));
                for (const s of sorted) {
                    const d = new Date(s.created || Date.now());
                    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    const tags = (s.tags || []).map(t => `#${t}`).join(' ');
                    md += `## ${dateKey} ${t}\n\n${s.content || ''}\n\n`;
                    if (tags) md += `${tags}\n\n`;
                    md += `---\n\n`;
                }
                const baseName = `shuoshuo-backup-${dateStr}`;
                await this._downloadMdWithAssets(md, baseName);
                showMessage('说说数据 (MD) 已导出');
            };
        }

        if (exportMomentsJsonBtn) {
            exportMomentsJsonBtn.onclick = async () => {
                let momentsData = [];
                try {
                    momentsData = await this.loadData(MOMENTS_STORAGE_NAME) || [];
                } catch (e) {
                    momentsData = [];
                }
                const dateStr = new Date().toISOString().split('T')[0];
                const data = JSON.stringify(momentsData, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `moments-backup-${dateStr}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showMessage('朋友圈数据 (JSON) 已导出');
            };
        }

        if (exportMomentsMdBtn) {
            exportMomentsMdBtn.onclick = async () => {
                let momentsData = [];
                try {
                    momentsData = await this.loadData(MOMENTS_STORAGE_NAME) || [];
                } catch (e) {
                    momentsData = [];
                }
                const moments = momentsData?.moments || this.moments || [];
                const dateStr = new Date().toISOString().split('T')[0];
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                let md = `# 朋友圈备份\n> 导出时间：${dateStr} ${timeStr}\n> 共 ${moments.length} 条动态\n\n---\n\n`;
                const sorted = [...moments].sort((a, b) => (a.created || 0) - (b.created || 0));
                for (const m of sorted) {
                    const d = new Date(m.created || Date.now());
                    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    md += `## ${dateKey} ${t}\n\n${m.text || m.content || ''}\n\n`;
                    if (m.images && m.images.length > 0) {
                        for (const img of m.images) {
                            md += `![图片](${img})\n`;
                        }
                        md += '\n';
                    }
                    if (m.link && m.link.title) {
                        md += `🔗 [${m.link.title}](${m.link.url || '#'})\n\n`;
                    }
                    md += `---\n\n`;
                }
                const baseName = `moments-backup-${dateStr}`;
                await this._downloadMdWithAssets(md, baseName);
                showMessage('朋友圈数据 (MD) 已导出');
            };
        }

        // ==================== 回顾设置事件绑定 ====================
        this.bindReviewSettingsEvents();

        // ==================== Flomo 同步事件绑定 ====================
        this.bindFlomoEvents();

        // ==================== 写拉松同步事件绑定 ====================
        this.bindWriteathonEvents();

        // ==================== Memos 同步事件绑定 ====================
        this.bindMemosEvents();
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
                await this.saveConfig();
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
                
                await this.saveConfig();
                
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

    // ==================== 写拉松同步事件绑定 ====================
    bindWriteathonEvents() {
        this.updateWriteathonUI();
        
        // 加载笔记本列表到写拉松选择器
        this.loadWriteathonNotebooks();

        const verifyBtn = this.container.querySelector('#writeathon-verify-btn');
        const clearBtn = this.container.querySelector('#writeathon-clear-btn');
        const tokenInput = this.container.querySelector('#writeathon-token');
        const userIdInput = this.container.querySelector('#writeathon-userid');
        const syncBtn = this.container.querySelector('#writeathon-sync-btn');
        const refreshSpacesBtn = this.container.querySelector('#writeathon-refresh-spaces');

        if (verifyBtn) {
            verifyBtn.onclick = async () => {
                const token = tokenInput?.value?.trim();
                const userId = userIdInput?.value?.trim();
                
                if (!token || !userId) {
                    showMessage('请输入集成 Token 和用户 ID');
                    return;
                }
                
                verifyBtn.textContent = '验证中...';
                verifyBtn.disabled = true;
                
                const result = await this.writeathonVerify(token, userId);
                
                verifyBtn.textContent = '验证并保存';
                verifyBtn.disabled = false;
                
                if (result.success) {
                    this.writeathonConfig.token = token;
                    this.writeathonConfig.userId = userId;
                    await this.saveConfig();
                    showMessage('验证成功');
                    this.updateWriteathonUI();
                    // 加载空间列表
                    this.loadWriteathonSpaces();
                } else {
                    showMessage(result.message);
                }
            };
        }

        if (clearBtn) {
            clearBtn.onclick = async () => {
                this.writeathonConfig = { token: '', userId: '', spaceId: '', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '' };
                await this.saveConfig();
                if (tokenInput) tokenInput.value = '';
                if (userIdInput) userIdInput.value = '';
                this.updateWriteathonUI();
                showMessage('已清除配置');
            };
        }

        if (syncBtn) {
            syncBtn.onclick = async () => {
                // 保存当前选择的同步目标
                const targetRadio = this.container.querySelector('input[name="writeathon-target"]:checked');
                this.writeathonConfig.syncTarget = targetRadio?.value || 'shuoshuo';
                
                // 保存输入的目标文档 ID
                const targetDocIdInput = this.container.querySelector('#writeathon-target-doc-id');
                if (targetDocIdInput) {
                    this.writeathonConfig.syncDocId = targetDocIdInput.value.trim();
                }
                
                await this.saveConfig();
                
                // 检查是否选择了全量同步
                const fullSyncCheckbox = this.container.querySelector('#writeathon-full-sync');
                const isFullSync = fullSyncCheckbox?.checked || false;
                
                await this.writeathonSync(isFullSync);
                
                // 取消勾选全量同步
                if (fullSyncCheckbox) fullSyncCheckbox.checked = false;
                
                this.updateWriteathonUI();
            };
        }

        if (refreshSpacesBtn) {
            refreshSpacesBtn.onclick = async () => {
                await this.loadWriteathonSpaces();
            };
        }

        // 空间选择器变化时保存
        const spaceSelect = this.container.querySelector('#writeathon-space-select');
        // 写拉松目标单选框
        const writeathonTargetItems = this.container.querySelectorAll('.writeathon-target');
        const writeathonNotebookRow = this.container.querySelector('#writeathon-notebook-row');
        const writeathonDocRow = this.container.querySelector('#writeathon-doc-row');
        
        writeathonTargetItems.forEach(item => {
            item.addEventListener('click', () => {
                writeathonTargetItems.forEach(r => r.classList.remove('selected'));
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 根据选择显示/隐藏选择器
                const value = item.dataset.value;
                if (writeathonNotebookRow) {
                    writeathonNotebookRow.style.display = value === 'shuoshuo' ? 'none' : 'block';
                }
                if (writeathonDocRow) {
                    writeathonDocRow.style.display = value === 'singledoc' ? 'block' : 'none';
                }
            });
        });
        
        // 初始化选择器显示状态
        const initialTarget = this.container.querySelector('input[name="writeathon-target"]:checked');
        if (initialTarget) {
            const initialValue = initialTarget.value;
            if (writeathonNotebookRow) {
                writeathonNotebookRow.style.display = initialValue === 'shuoshuo' ? 'none' : 'block';
            }
            if (writeathonDocRow) {
                writeathonDocRow.style.display = initialValue === 'singledoc' ? 'block' : 'none';
            }
        }

        if (spaceSelect) {
            spaceSelect.addEventListener('change', async () => {
                this.writeathonConfig.spaceId = spaceSelect.value;
                await this.saveConfig();
            });
        }
    }

    // ==================== Memos 同步事件绑定 ====================
    bindMemosEvents() {
        this.updateMemosUI();

        const verifyBtn = this.container.querySelector('#memos-verify-btn');
        const clearBtn = this.container.querySelector('#memos-clear-btn');
        const hostInput = this.container.querySelector('#memos-host');
        const tokenInput = this.container.querySelector('#memos-token');
        const syncBtn = this.container.querySelector('#memos-sync-btn');

        if (verifyBtn) {
            verifyBtn.onclick = async () => {
                const host = hostInput?.value?.trim();
                const token = tokenInput?.value?.trim();
                
                if (!host || !token) {
                    showMessage('请输入服务器地址和 Access Token');
                    return;
                }
                
                verifyBtn.textContent = '验证中...';
                verifyBtn.disabled = true;
                
                const result = await this.memosVerify(host, token);
                
                verifyBtn.textContent = '验证并保存';
                verifyBtn.disabled = false;
                
                if (result.success) {
                    this.memosConfig.host = host;
                    this.memosConfig.token = token;
                    await this.saveConfig();
                    showMessage('验证成功');
                    this.updateMemosUI();
                } else {
                    showMessage(result.message);
                }
            };
        }

        if (clearBtn) {
            clearBtn.onclick = async () => {
                this.memosConfig = { host: '', token: '', version: 'v2', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '' };
                await this.saveConfig();
                if (hostInput) hostInput.value = '';
                if (tokenInput) tokenInput.value = '';
                this.updateMemosUI();
                showMessage('已清除配置');
            };
        }

        if (syncBtn) {
            syncBtn.onclick = async () => {
                // 保存当前选择的同步目标
                const targetRadio = this.container.querySelector('input[name="memos-target"]:checked');
                this.memosConfig.syncTarget = targetRadio?.value || 'shuoshuo';
                
                // 保存输入的目标文档 ID
                const targetDocIdInput = this.container.querySelector('#memos-target-doc-id');
                if (targetDocIdInput) {
                    this.memosConfig.syncDocId = targetDocIdInput.value.trim();
                }
                
                await this.saveConfig();
                
                // 检查是否选择了全量同步
                const fullSyncCheckbox = this.container.querySelector('#memos-full-sync');
                const isFullSync = fullSyncCheckbox?.checked || false;
                
                await this.memosSync(isFullSync);
                
                // 取消勾选全量同步
                if (fullSyncCheckbox) fullSyncCheckbox.checked = false;
                
                this.updateMemosUI();
            };
        }

        // Memos 目标单选框
        const memosTargetItems = this.container.querySelectorAll('.memos-target');
        const memosNotebookRow = this.container.querySelector('#memos-notebook-row');
        const memosDocRow = this.container.querySelector('#memos-doc-row');
        
        memosTargetItems.forEach(item => {
            item.addEventListener('click', () => {
                memosTargetItems.forEach(r => r.classList.remove('selected'));
                item.classList.add('selected');
                const radio = item.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // 根据选择显示/隐藏选择器
                const value = item.dataset.value;
                if (memosNotebookRow) {
                    memosNotebookRow.style.display = value === 'shuoshuo' ? 'none' : 'block';
                }
                if (memosDocRow) {
                    memosDocRow.style.display = value === 'singledoc' ? 'block' : 'none';
                }
            });
        });
        
        // 初始化选择器显示状态
        const initialTarget = this.container.querySelector('input[name="memos-target"]:checked');
        if (initialTarget) {
            const initialValue = initialTarget.value;
            if (memosNotebookRow) {
                memosNotebookRow.style.display = initialValue === 'shuoshuo' ? 'none' : 'block';
            }
            if (memosDocRow) {
                memosDocRow.style.display = initialValue === 'singledoc' ? 'block' : 'none';
            }
        }

        // 加载笔记本列表
        this.loadMemosNotebooks();
    }

    // 更新 Memos UI 状态
    updateMemosUI() {
        const statusBadge = this.container.querySelector('#memos-connection-status');
        const hostInput = this.container.querySelector('#memos-host');
        const tokenInput = this.container.querySelector('#memos-token');
        const verifyBtn = this.container.querySelector('#memos-verify-btn');
        const clearBtn = this.container.querySelector('#memos-clear-btn');
        const syncCard = this.container.querySelector('#memos-sync-card');
        const lastSyncEl = this.container.querySelector('#memos-last-sync');
        const memosNotebookRow = this.container.querySelector('#memos-notebook-row');
        const memosDocRow = this.container.querySelector('#memos-doc-row');

        const isConfigured = !!this.memosConfig.host && !!this.memosConfig.token;
        
        // 更新选择器显示状态
        const targetRadio = this.container?.querySelector('input[name="memos-target"]:checked');
        const syncTarget = targetRadio?.value || this.memosConfig.syncTarget || 'shuoshuo';
        
        if (memosNotebookRow) {
            memosNotebookRow.style.display = syncTarget === 'shuoshuo' ? 'none' : 'block';
        }
        if (memosDocRow) {
            memosDocRow.style.display = syncTarget === 'singledoc' ? 'block' : 'none';
        }

        if (statusBadge) {
            if (isConfigured) {
                statusBadge.textContent = '已配置';
                statusBadge.className = 'north-shuoshuo-badge north-shuoshuo-badge-success';
            } else {
                statusBadge.textContent = '未配置';
                statusBadge.className = 'north-shuoshuo-badge';
                statusBadge.style.background = '#f5f5f5';
                statusBadge.style.color = '#888';
            }
        }

        if (isConfigured) {
            if (hostInput) {
                hostInput.value = this.memosConfig.host;
                hostInput.disabled = true;
                hostInput.classList.add('readonly-field');
            }
            if (tokenInput) {
                tokenInput.value = '********';
                tokenInput.disabled = true;
                tokenInput.classList.add('readonly-field');
            }
            if (verifyBtn) verifyBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (syncCard) {
                syncCard.style.opacity = '1';
                syncCard.style.pointerEvents = 'auto';
            }
        } else {
            if (hostInput) hostInput.disabled = false;
            if (tokenInput) tokenInput.disabled = false;
            if (verifyBtn) verifyBtn.style.display = 'inline-block';
            if (clearBtn) clearBtn.style.display = 'none';
            if (syncCard) {
                syncCard.style.opacity = '0.5';
                syncCard.style.pointerEvents = 'none';
            }
        }

        if (lastSyncEl) {
            if (this.memosConfig.lastSyncTime) {
                lastSyncEl.textContent = this.memosConfig.lastSyncTime;
            } else {
                lastSyncEl.textContent = '从未同步';
            }
        }

        // 初始化同步目标单选框
        const savedSyncTarget = this.memosConfig.syncTarget || 'shuoshuo';
        const targetRadios = this.container.querySelectorAll('input[name="memos-target"]');
        targetRadios.forEach(radio => {
            if (radio.value === savedSyncTarget) {
                radio.checked = true;
                radio.closest('.memos-target')?.classList.add('selected');
            } else {
                radio.checked = false;
                radio.closest('.memos-target')?.classList.remove('selected');
            }
        });
        
        // 根据初始目标设置选择器显示状态
        if (memosNotebookRow) {
            memosNotebookRow.style.display = savedSyncTarget === 'shuoshuo' ? 'none' : 'block';
        }
        if (memosDocRow) {
            memosDocRow.style.display = savedSyncTarget === 'singledoc' ? 'block' : 'none';
        }

        // 恢复保存的目标文档 ID
        const targetDocIdInput = this.container.querySelector('#memos-target-doc-id');
        if (targetDocIdInput && this.memosConfig.syncDocId) {
            targetDocIdInput.value = this.memosConfig.syncDocId;
        }
    }

    // 更新写拉松 UI 状态
    updateWriteathonUI() {
        const statusBadge = this.container.querySelector('#writeathon-connection-status');
        const tokenInput = this.container.querySelector('#writeathon-token');
        const userIdInput = this.container.querySelector('#writeathon-userid');
        const verifyBtn = this.container.querySelector('#writeathon-verify-btn');
        const clearBtn = this.container.querySelector('#writeathon-clear-btn');
        const syncCard = this.container.querySelector('#writeathon-sync-card');
        const lastSyncEl = this.container.querySelector('#writeathon-last-sync');
        const writeathonNotebookRow = this.container.querySelector('#writeathon-notebook-row');
        const writeathonDocRow = this.container.querySelector('#writeathon-doc-row');

        const isConfigured = !!this.writeathonConfig.token && !!this.writeathonConfig.userId;
        
        // 更新选择器显示状态
        const targetRadio = this.container?.querySelector('input[name="writeathon-target"]:checked');
        const syncTarget = targetRadio?.value || this.writeathonConfig.syncTarget || 'shuoshuo';
        
        if (writeathonNotebookRow) {
            writeathonNotebookRow.style.display = syncTarget === 'shuoshuo' ? 'none' : 'block';
        }
        if (writeathonDocRow) {
            writeathonDocRow.style.display = syncTarget === 'singledoc' ? 'block' : 'none';
        }

        if (statusBadge) {
            if (isConfigured) {
                statusBadge.textContent = '已配置';
                statusBadge.className = 'north-shuoshuo-badge north-shuoshuo-badge-success';
            } else {
                statusBadge.textContent = '未配置';
                statusBadge.className = 'north-shuoshuo-badge';
                statusBadge.style.background = '#f5f5f5';
                statusBadge.style.color = '#888';
            }
        }

        if (isConfigured) {
            if (tokenInput) {
                tokenInput.value = this.writeathonConfig.token;
                tokenInput.disabled = true;
                tokenInput.classList.add('readonly-field');
            }
            if (userIdInput) {
                userIdInput.value = this.writeathonConfig.userId;
                userIdInput.disabled = true;
                userIdInput.classList.add('readonly-field');
            }
            if (verifyBtn) verifyBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'inline-block';
            if (syncCard) {
                syncCard.style.opacity = '1';
                syncCard.style.pointerEvents = 'auto';
            }
        } else {
            if (tokenInput) tokenInput.disabled = false;
            if (userIdInput) userIdInput.disabled = false;
            if (verifyBtn) verifyBtn.style.display = 'inline-block';
            if (clearBtn) clearBtn.style.display = 'none';
            if (syncCard) {
                syncCard.style.opacity = '0.5';
                syncCard.style.pointerEvents = 'none';
            }
        }

        if (lastSyncEl) {
            if (this.writeathonConfig.lastSyncTime) {
                lastSyncEl.textContent = this.writeathonConfig.lastSyncTime;
            } else {
                lastSyncEl.textContent = '从未同步';
            }
        }

        // 初始化同步目标单选框
        const savedSyncTarget = this.writeathonConfig.syncTarget || 'shuoshuo';
        const targetRadios = this.container.querySelectorAll('input[name="writeathon-target"]');
        targetRadios.forEach(radio => {
            if (radio.value === savedSyncTarget) {
                radio.checked = true;
                radio.closest('.writeathon-target')?.classList.add('selected');
            } else {
                radio.checked = false;
                radio.closest('.writeathon-target')?.classList.remove('selected');
            }
        });
        
        // 根据初始目标设置选择器显示状态
        if (writeathonNotebookRow) {
            writeathonNotebookRow.style.display = savedSyncTarget === 'shuoshuo' ? 'none' : 'block';
        }
        if (writeathonDocRow) {
            writeathonDocRow.style.display = savedSyncTarget === 'singledoc' ? 'block' : 'none';
        }

        // 恢复保存的目标文档 ID
        const targetDocIdInput = this.container.querySelector('#writeathon-target-doc-id');
        if (targetDocIdInput && this.writeathonConfig.syncDocId) {
            targetDocIdInput.value = this.writeathonConfig.syncDocId;
        }

        // 恢复保存的空间选择
        const spaceSelect = this.container.querySelector('#writeathon-space-select');
        if (spaceSelect && this.writeathonConfig.spaceId) {
            spaceSelect.value = this.writeathonConfig.spaceId;
        }
        
        // 如果已配置，加载空间列表
        if (isConfigured) {
            this.loadWriteathonSpaces();
        }
    }

    // 加载写拉松空间列表
    async loadWriteathonSpaces() {
        const select = this.container?.querySelector('#writeathon-space-select');
        if (!select) return;

        if (!this.writeathonConfig.token || !this.writeathonConfig.userId) {
            select.innerHTML = '<option value="">默认空间</option>';
            return;
        }

        try {
            const result = await this.writeathonGetSpaces();
            if (result.success && result.data && result.data.length > 0) {
                let html = '<option value="">默认空间</option>';
                result.data.forEach(space => {
                    html += `<option value="${space.id}">${space.title}</option>`;
                });
                select.innerHTML = html;
                // 恢复保存的选择
                if (this.writeathonConfig.spaceId) {
                    select.value = this.writeathonConfig.spaceId;
                }
            } else {
                select.innerHTML = '<option value="">默认空间</option>';
            }
        } catch (e) {
            console.error('加载写拉松空间列表失败', e);
            select.innerHTML = '<option value="">默认空间</option>';
        }
    }

    // 加载笔记本列表到写拉松选择器
    async loadWriteathonNotebooks() {
        const select = this.container?.querySelector('#writeathon-notebook-select');
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
                    const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                    const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                    html += `<option value="${nb.id}">${icon} ${nb.name}</option>`;
                });
                select.innerHTML = html;
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
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
                    const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                    const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                    html += `<option value="${nb.id}">${icon} ${nb.name}</option>`;
                });
                select.innerHTML = html;
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
        }
    }

    async loadShuoshuos() {
        return this._withSaveLock('shuoshuos', async () => {
            try {
                // 1. 先从本地加载未绑定的说说
                let data = await this.loadData(STORAGE_NAME);
                // 数据丢失保护：主存储为空时尝试从备份恢复
                if (!data || data.length === 0) {
                    const restored = await this._restoreFromBackup(STORAGE_NAME, STORAGE_BACKUP_NAME);
                    if (restored) {
                        data = restored;
                        console.warn('[轻语] 主数据为空，已从备份恢复说说数据');
                    }
                }
                const localShuoshuos = data || [];

                // 关键：先把本地数据设到 this.shuoshuos，让 loadShuoshuosFromSiyuan 能查到旧内容模板
                // 从而保持标签的原始位置不变
                const previousShuoshuos = this.shuoshuos;
                this.shuoshuos = localShuoshuos;

                // 2. 从思源笔记查询所有绑定的块（主要数据源）
                //    思源SQL是最新的数据，确保思源改了说说视图也能看到
                //    仅在每日笔记模式下执行双向同步，指定文档模式下只单向同步
                let boundFromSiyuan = [];
                if (this.syncMode === 'dailynote') {
                    try {
                        boundFromSiyuan = await this.loadShuoshuosFromSiyuan();
                    } catch (e) {
                        // 出错时恢复之前的状态
                        this.shuoshuos = previousShuoshuos;
                        // console.warn('[轻语] 从思源加载绑定块失败，使用本地数据:', e.message);
                    }
                }

                // 3. 从思源笔记查询 LifeLog 记录（根据设置开关决定是否加载）
                let lifeLogRecords = [];
                if (this.showLifeLogRecords) {
                    try {
                        lifeLogRecords = await this.queryLifeLogRecords();
                    } catch (e) {
                        // console.warn('[轻语] 加载 LifeLog 记录失败:', e.message);
                    }
                }

                if (this._lastLoadShuoshuosFromSiyuanOk) {
                    // 合并策略：
                    // - 已绑定的说说以思源SQL数据为准（覆盖本地缓存）
                    // - 未绑定的说说保留本地数据
                    // - 本地有 boundBlockId 但思源 SQL 已查不到的记录视为已删除，清出本地缓存
                    // - 思源中有但本地没有的新绑定块，追加到列表
                    const boundMap = new Map();
                    boundFromSiyuan.forEach(s => boundMap.set(s.boundBlockId, s));

                    const merged = [];
                    const processedBoundIds = new Set();

                    // 遍历本地说说，已绑定的用思源数据替换
                    for (const local of localShuoshuos) {
                        if (local.boundBlockId && boundMap.has(local.boundBlockId)) {
                            const siyuan = boundMap.get(local.boundBlockId);
                            merged.push({
                                ...siyuan,
                                pinned: local.pinned || false,
                                id: local.id // 保留本地ID维持引用
                            });
                            processedBoundIds.add(local.boundBlockId);
                        } else if (local.boundBlockId) {
                            continue;
                        } else {
                            merged.push(local);
                        }
                    }

                    // 收集 LifeLog 的原始块ID（boundBlockId），用于去重
                    const lifeLogBlockIds = new Set();
                    for (const lr of lifeLogRecords) {
                        if (lr.boundBlockId) lifeLogBlockIds.add(lr.boundBlockId);
                    }

                    // 添加思源中有但本地没有的新绑定块（排除已被 LifeLog 占用的块，避免重复显示）
                    for (const siyuan of boundFromSiyuan) {
                        if (!processedBoundIds.has(siyuan.boundBlockId) && !lifeLogBlockIds.has(siyuan.boundBlockId)) {
                            merged.push(siyuan);
                        }
                    }

                    // 添加 LifeLog 记录
                    merged.push(...lifeLogRecords);

                    this.shuoshuos = merged;
                } else {
                    // 没有绑定的块，直接使用本地数据 + LifeLog 记录
                    // 本地数据中也要排除 boundBlockId 属于 LifeLog 的（避免旧缓存重复）
                    const lifeLogBlockIds = new Set();
                    for (const lr of lifeLogRecords) {
                        if (lr.boundBlockId) lifeLogBlockIds.add(lr.boundBlockId);
                    }
                    const filteredLocal = localShuoshuos.filter(s => !s.boundBlockId || !lifeLogBlockIds.has(s.boundBlockId));
                    this.shuoshuos = [...filteredLocal, ...lifeLogRecords];
                }
            } catch (e) {
                console.warn("加载笔记失败", e);
                // 加载失败时尝试从备份恢复
                if (!this.shuoshuos || this.shuoshuos.length === 0) {
                    const restored = await this._restoreFromBackup(STORAGE_NAME, STORAGE_BACKUP_NAME);
                    if (restored) {
                        this.shuoshuos = restored;
                        console.warn('[轻语] 加载异常，已从备份恢复说说数据');
                    } else {
                        this.shuoshuos = [];
                    }
                }
            }

            // 如果关闭 LifeLog 显示，过滤掉所有 LifeLog 记录（包括本地输入的类型：内容格式）
            if (!this.showLifeLogRecords) {
                this.shuoshuos = this.shuoshuos.filter(s => !s._isLifeLog && !this.extractType(s.content));
            }

            // 更新已绑定块ID的缓存
            this._updateBoundCache();
        });
    }

    // 查询思源笔记中带有 LifeLog 属性的记录（今年）
    // 只查询带有 custom-lifelog-* 属性的块（LifeLog 插件标准方式）
    async queryLifeLogRecords() {
        const records = [];

        const sql = `
            SELECT 
                b.id,
                b.content,
                a1.value AS lifelog_date,
                a2.value AS lifelog_time,
                a3.value AS lifelog_type
            FROM blocks b
            INNER JOIN attributes a1 ON b.id = a1.block_id AND a1.name = 'custom-lifelog-date'
            INNER JOIN attributes a2 ON b.id = a2.block_id AND a2.name = 'custom-lifelog-time'
            INNER JOIN attributes a3 ON b.id = a3.block_id AND a3.name = 'custom-lifelog-type'
            WHERE 
                b.type = 'p' 
                AND substr(b.created, 1, 4) = strftime('%Y', 'now')
            ORDER BY 
                a1.value DESC, 
                a2.value DESC
            LIMIT -1
        `;
        try {
            const resp = await fetch('/api/query/sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stmt: sql })
            });
            const result = await resp.json();
            if (result.code === 0 && result.data) {
                for (const row of result.data) {
                    records.push(this._parseLifeLogRow(row, true));
                }
            }
        } catch (e) {
            // console.warn('[轻语] 查询 LifeLog 属性记录失败:', e.message);
        }

        // 按时间倒序排序
        records.sort((a, b) => b.created - a.created);
        return records;
    }

    // 安全解析思源 blocks.created 字段（支持 YYYYMMDDHHMMSS 字符串或毫秒时间戳）
    _parseBlockTime(raw) {
        if (!raw) return Date.now();
        const str = String(raw).trim();

        // 1. 纯数字且长度 > 10，视为毫秒时间戳
        if (/^\d+$/.test(str) && str.length > 10) {
            const ts = parseInt(str, 10);
            if (!isNaN(ts)) return ts;
        }

        // 2. YYYYMMDDHHMMSS 格式（长度 >= 14）
        if (str.length >= 14) {
            const year = str.substring(0, 4);
            const month = str.substring(4, 6);
            const day = str.substring(6, 8);
            const hour = str.substring(8, 10);
            const minute = str.substring(10, 12);
            const dateTimeStr = `${year}-${month}-${day} ${hour}:${minute}`;
            const parsed = new Date(dateTimeStr.replace(/-/g, '/')).getTime();
            if (!isNaN(parsed)) return parsed;
        }

        // 3. 最后尝试直接解析
        const parsed = new Date(str).getTime();
        return isNaN(parsed) ? Date.now() : parsed;
    }

    // 解析 LifeLog 查询行数据为统一记录格式
    _parseLifeLogRow(row, hasAttr) {
        let contentStr = (row.content || '').trim();
        const extractedType = this.extractType(contentStr);
        const typeStr = row.lifelog_type || extractedType || '';
        // 移除内容中可能存在的时间前缀（如 10:16 ）
        contentStr = contentStr.replace(/^\d{1,2}:\d{2}\s*/, '').trim();
        // 如果内容以"类型："开头，移除类型前缀获取纯内容
        if (typeStr) {
            const typePrefixRegex = new RegExp(`^${typeStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[：:]\\s*`);
            contentStr = contentStr.replace(typePrefixRegex, '').trim();
        }
        // 解析日期时间为时间戳（方式1有 lifelog_date/time，方式2用 created_raw）
        let created;
        if (row.lifelog_date && row.lifelog_time) {
            const dateTimeStr = `${row.lifelog_date} ${row.lifelog_time}`;
            created = new Date(dateTimeStr.replace(/-/g, '/')).getTime();
        } else if (row.created_raw) {
            created = this._parseBlockTime(row.created_raw);
        } else {
            created = Date.now();
        }
        if (isNaN(created)) created = Date.now();

        return {
            id: `lifelog_${row.id}`,
            content: contentStr,
            tags: [],
            pinned: false,
            created: created,
            updated: created,
            boundBlockId: row.id,
            _isLifeLog: true,
            _lifeLogType: typeStr,
            _hasLifeLogAttr: hasAttr
        };
    }

    // 从思源SQL加载数据并刷新列表（渲染前调用，确保数据最新）
    async syncAndRender(viewType) {
        await this.loadShuoshuos(); // 重新加载（从SQL获取最新）
        switch (viewType) {
            case 'notes': this.renderNotes(); break;
            case 'review': this.renderReview(); break;
            case 'random': this.renderRandom(); break;
            case 'table': this.renderTable(); break;
            case 'stats': this.renderStats(); break;
            default: this.renderNotes(); break;
        }
    }

    // ============ 朋友圈数据管理 ============
    async loadMoments() {
        return this._withSaveLock('moments', async () => {
            try {
                let data = await this.loadData(MOMENTS_STORAGE_NAME);
                // 数据丢失保护：主存储为空时尝试从备份恢复
                if (!data || Object.keys(data).length === 0) {
                    const restored = await this._restoreFromBackup(MOMENTS_STORAGE_NAME, MOMENTS_BACKUP_NAME);
                    if (restored) {
                        data = restored;
                        console.warn('[轻语] 主数据为空，已从备份恢复朋友圈数据');
                    }
                }
                this.moments = data?.moments || [];
                this.momentsConfig = data?.config || {
                    nickname: '月亮',
                    signature: '言念君子 温其如玉',
                    avatar: null,
                    cover: null,
                    syncToSiyuan: false,
                    syncNotebookId: '',
                    syncMode: 'dailynote',
                    syncDocId: ''
                };
            } catch (e) {
                // 加载失败时不要粗暴清空，尝试从备份恢复
                if (!this.moments || this.moments.length === 0) {
                    const restored = await this._restoreFromBackup(MOMENTS_STORAGE_NAME, MOMENTS_BACKUP_NAME);
                    if (restored) {
                        this.moments = restored.moments || [];
                        this.momentsConfig = restored.config || this.momentsConfig;
                        console.warn('[轻语] 加载异常，已从备份恢复朋友圈数据');
                    } else if (!this.moments) {
                        this.moments = [];
                    }
                }
                if (!this.momentsConfig) {
                    this.momentsConfig = { nickname: '月亮', signature: '言念君子 温其如玉', avatar: null, cover: null, syncToSiyuan: false, syncNotebookId: '', syncMode: 'dailynote', syncDocId: '', dailyNotePathTemplate: '' };
                }
            }
            // 合并字体大小默认值
            if (!this.momentsConfig.fontSize) {
                this.momentsConfig.fontSize = { mode: 'default', customSize: 14.5 };
            }
            // 后台迁移已存在的 base64 图片到 assets 目录
            setTimeout(() => {
                this._migrateMomentsImages();
            }, 3000);
        });
    }

    async saveMoments() {
        return this._withSaveLock('moments', async () => {
            try {
                const dataToSave = {
                    moments: this.moments,
                    config: this.momentsConfig
                };
                // 空数据保护：如果内存数据为空但存储中有数据，不要覆盖
                const isEmpty = (!this.moments || this.moments.length === 0) &&
                    (!this.momentsConfig || (!this.momentsConfig.nickname && !this.momentsConfig.avatar && !this.momentsConfig.cover));
                if (isEmpty) {
                    const existing = await this.loadData(MOMENTS_STORAGE_NAME);
                    const existingHasData = existing && (existing.moments?.length > 0 || existing.config?.nickname || existing.config?.avatar || existing.config?.cover);
                    if (existingHasData) {
                        console.warn('[轻语] saveMoments: 内存数据为空但存储非空，跳过保存');
                        return;
                    }
                }
                await this._backupData(MOMENTS_STORAGE_NAME, MOMENTS_BACKUP_NAME);
                await this.saveData(MOMENTS_STORAGE_NAME, dataToSave);
            } catch (e) {
                console.error('保存朋友圈失败', e);
            }
        });
    }

    // ============ 图书书架数据管理 ============
    async loadBooks() {
        return this._withSaveLock('books', async () => {
            try {
                let data = await this.loadData(BOOKS_STORAGE_NAME);
                // 数据丢失保护：主存储为空时尝试从备份恢复
                if (!data || Object.keys(data).length === 0) {
                    const restored = await this._restoreFromBackup(BOOKS_STORAGE_NAME, BOOKS_BACKUP_NAME);
                    if (restored) {
                        data = restored;
                        console.warn('[轻语] 主数据为空，已从备份恢复图书数据');
                    }
                }
                this.books = data?.books || getDefaultBooks();
            } catch (e) {
                if (!this.books || this.books.length === 0) {
                    const restored = await this._restoreFromBackup(BOOKS_STORAGE_NAME, BOOKS_BACKUP_NAME);
                    if (restored) {
                        this.books = restored.books || getDefaultBooks();
                        console.warn('[轻语] 加载异常，已从备份恢复图书数据');
                    } else {
                        this.books = getDefaultBooks();
                    }
                }
            }
        });
    }

    async saveBooks() {
        return this._withSaveLock('books', async () => {
            try {
                const dataToSave = { books: this.books };
                // 空数据保护
                if (!this.books || this.books.length === 0) {
                    const existing = await this.loadData(BOOKS_STORAGE_NAME);
                    if (existing && existing.books && existing.books.length > 0) {
                        console.warn('[轻语] saveBooks: 内存数据为空但存储非空，跳过保存');
                        return;
                    }
                }
                await this._backupData(BOOKS_STORAGE_NAME, BOOKS_BACKUP_NAME);
                await this.saveData(BOOKS_STORAGE_NAME, dataToSave);
            } catch (e) {
                console.error('保存图书数据失败', e);
            }
        });
    }

    getMomentNextId() {
        const ids = this.moments.map(m => parseInt(m.id) || 0);
        return (Math.max(0, ...ids) + 1).toString();
    }

    // 将说说内容添加到朋友圈
    async addShuoshuoToMoments(shuoshuoId) {
        const item = this.shuoshuos.find(s => s.id === shuoshuoId);
        if (!item) return;

        const { text, images } = this.extractContentAndImages(item.content || '');

        // 提取链接（支持 [title](url) 格式）
        let link = null;
        const linkMatch = (item.content || '').match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        if (linkMatch) {
            link = { title: linkMatch[1], url: linkMatch[2] };
        } else {
            // 尝试提取裸链接
            const bareLinkMatch = (item.content || '').match(/(https?:\/\/[^\s\)]+)/);
            if (bareLinkMatch) {
                link = { title: bareLinkMatch[1], url: bareLinkMatch[1] };
            }
        }

        const newMoment = {
            id: this.getMomentNextId(),
            text: text || '',
            images: images.map(img => img.url),
            file: null,
            link: link,
            likes: [],
            comments: [],
            created: item.created || Date.now(),
            updated: Date.now()
        };

        this.moments.unshift(newMoment);
        await this.saveMoments();
        showMessage('已添加到朋友圈');

        // 如果当前在朋友圈视图，刷新显示
        if (this.currentMainView === 'moments') {
            this._doRenderMoments();
        }
    }

    formatMomentTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        if (diff < minute) return '刚刚';
        if (diff < hour) return Math.floor(diff / minute) + '分钟前';
        if (diff < day) return Math.floor(diff / hour) + '小时前';
        if (diff < 2 * day) return '昨天';
        if (diff < 3 * day) return '前天';
        const d = new Date(timestamp);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    }

    formatMomentDate(timestamp) {
        const d = new Date(timestamp);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }

    generateMomentsCalendar(year = null) {
        const targetYear = year || new Date().getFullYear();

        // 确定起始日期（该年1月1日之前的第一个周日）
        const yearStart = new Date(targetYear, 0, 1);
        const startDate = new Date(yearStart);
        startDate.setDate(yearStart.getDate() - yearStart.getDay());

        // 确定结束日期（该年12月31日）
        const yearEnd = new Date(targetYear, 11, 31);

        // 计算总天数和周数
        const totalDays = Math.floor((yearEnd - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const weeks = Math.ceil(totalDays / 7);

        // 统计朋友圈每天的发布数量
        const dayCounts = {};
        this.moments.forEach(m => {
            const d = new Date(m.created);
            if (d.getFullYear() === targetYear) {
                const key = this.formatDateKey(d);
                dayCounts[key] = (dayCounts[key] || 0) + 1;
            }
        });

        // 生成每列（每周）
        let columnsHtml = '';
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        for (let week = 0; week < weeks; week++) {
            let columnCells = '';

            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);

                if (date.getFullYear() === targetYear) {
                    const key = this.formatDateKey(date);
                    const count = dayCounts[key] || 0;
                    let level = 0;
                    if (count >= 1) level = 2;
                    if (count >= 3) level = 3;
                    if (count >= 5) level = 4;

                    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
                    const tooltip = count > 0 ? `${dateStr}: ${count}条朋友圈` : dateStr;
                    columnCells += `<div class="lumina-moments-calendar-cell level-${level}" data-date="${key}" title="${tooltip}"></div>`;
                } else {
                    columnCells += `<div class="lumina-moments-calendar-cell level-empty"></div>`;
                }
            }

            columnsHtml += `<div class="lumina-moments-calendar-column">${columnCells}</div>`;
        }

        // 计算月份标签位置
        const monthStartWeek = new Array(12).fill(-1);
        const monthEndWeek = new Array(12).fill(-1);

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);
                if (date.getFullYear() === targetYear) {
                    const m = date.getMonth();
                    if (monthStartWeek[m] === -1) monthStartWeek[m] = week;
                    monthEndWeek[m] = week;
                }
            }
        }

        const monthLabels = [];
        for (let m = 0; m < 12; m++) {
            if (monthStartWeek[m] !== -1) {
                const midWeek = (monthStartWeek[m] + monthEndWeek[m]) / 2;
                const leftPercent = ((midWeek + 0.5) / weeks * 100).toFixed(2) + '%';
                monthLabels.push({ name: monthNames[m], left: leftPercent });
            }
        }

        const monthsHtml = monthLabels.map(l =>
            `<span class="lumina-moments-calendar-month-label" style="left: ${l.left};">${l.name}</span>`
        ).join('');

        return {
            columns: columnsHtml,
            months: monthsHtml,
            weeks: weeks
        };
    }

    generateShuoshuoCalendar(year = null, month = null) {
        const isMobile = window.innerWidth <= 768;
        
        // 移动端：显示月份日历
        if (isMobile && month !== null) {
            return this.generateMobileMonthCalendar(year, month);
        }
        
        // PC端：显示热力图
        const targetYear = year || new Date().getFullYear();

        // 确定起始日期（该年1月1日之前的第一个周日）
        const yearStart = new Date(targetYear, 0, 1);
        const startDate = new Date(yearStart);
        startDate.setDate(yearStart.getDate() - yearStart.getDay());

        // 确定结束日期（该年12月31日）
        const yearEnd = new Date(targetYear, 11, 31);

        // 计算总天数和周数
        const totalDays = Math.floor((yearEnd - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const weeks = Math.ceil(totalDays / 7);

        // 统计说说每天的发布数量
        const dayCounts = {};
        this.shuoshuos.forEach(s => {
            const d = new Date(s.created);
            if (d.getFullYear() === targetYear) {
                const key = this.formatDateKey(d);
                dayCounts[key] = (dayCounts[key] || 0) + 1;
            }
        });

        // 生成每列（每周）
        let columnsHtml = '';
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        for (let week = 0; week < weeks; week++) {
            let columnCells = '';

            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);

                if (date.getFullYear() === targetYear) {
                    const key = this.formatDateKey(date);
                    const count = dayCounts[key] || 0;
                    let level = 0;
                    if (count >= 1) level = 2;
                    if (count >= 3) level = 3;
                    if (count >= 5) level = 4;

                    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
                    const tooltip = count > 0 ? `${dateStr}: ${count}条说说` : dateStr;
                    const selectedClass = this.selectedDate === key ? ' selected' : '';
                    columnCells += `<div class="lumina-moments-calendar-cell level-${level}${selectedClass}" data-date="${key}" title="${tooltip}"></div>`;
                } else {
                    columnCells += `<div class="lumina-moments-calendar-cell level-empty"></div>`;
                }
            }

            columnsHtml += `<div class="lumina-moments-calendar-column">${columnCells}</div>`;
        }

        // 计算月份标签位置
        const monthStartWeek = new Array(12).fill(-1);
        const monthEndWeek = new Array(12).fill(-1);

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + week * 7 + day);
                if (date.getFullYear() === targetYear) {
                    const m = date.getMonth();
                    if (monthStartWeek[m] === -1) monthStartWeek[m] = week;
                    monthEndWeek[m] = week;
                }
            }
        }

        const monthLabels = [];
        for (let m = 0; m < 12; m++) {
            if (monthStartWeek[m] !== -1) {
                const midWeek = (monthStartWeek[m] + monthEndWeek[m]) / 2;
                const leftPercent = ((midWeek + 0.5) / weeks * 100).toFixed(2) + '%';
                monthLabels.push({ name: monthNames[m], left: leftPercent });
            }
        }

        const monthsHtml = monthLabels.map(l =>
            `<span class="lumina-moments-calendar-month-label" style="left: ${l.left};">${l.name}</span>`
        ).join('');

        return {
            columns: columnsHtml,
            months: monthsHtml,
            weeks: weeks
        };
    }

    // 生成移动端月份日历
    generateMobileMonthCalendar(year, month) {
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // 从周日开始

        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        // 统计说说每天的发布数量
        const dayCounts = {};
        this.shuoshuos.forEach(s => {
            const d = new Date(s.created);
            const key = this.formatDateKey(d);
            dayCounts[key] = (dayCounts[key] || 0) + 1;
        });

        // 生成星期标题
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        let weekdaysHtml = '<div class="mobile-calendar-weekdays">';
        weekdays.forEach(day => {
            weekdaysHtml += `<span>${day}</span>`;
        });
        weekdaysHtml += '</div>';

        // 生成日期格子
        let daysHtml = '<div class="mobile-calendar-days">';
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dateStr = this.formatDateKey(date);
            const count = dayCounts[dateStr] || 0;
            const isCurrentMonth = date.getMonth() === month;
            const isToday = this.formatDateKey(date) === this.formatDateKey(today);
            const isSelected = dateStr === this.selectedDate;

            // 根据内容数量确定等级
            let level = 0;
            if (count >= 1) level = 1;
            if (count >= 3) level = 2;
            if (count >= 5) level = 3;

            let className = 'mobile-calendar-day';
            if (!isCurrentMonth) className += ' other-month';
            if (count > 0) className += ` has-content level-${level}`;
            if (isToday) className += ' today';
            if (isSelected) className += ' selected';

            const tooltip = count > 0 ? `${date.getMonth() + 1}月${date.getDate()}日: ${count}条说说` : `${date.getMonth() + 1}月${date.getDate()}日`;
            daysHtml += `<div class="${className}" data-date="${dateStr}" title="${tooltip}">${date.getDate()}</div>`;
        }
        daysHtml += '</div>';

        return {
            columns: weekdaysHtml + daysHtml,
            months: '',
            weeks: 0,
            title: `${year}年${monthNames[month]}`
        };
    }

    async loadConfig() {
        return this._withSaveLock('config', async () => {
            try {
                let data = await this.loadData(CONFIG_STORAGE_NAME);
                // 数据丢失保护：主存储为空时尝试从备份恢复
                if (!data || Object.keys(data).length === 0) {
                    const restored = await this._restoreFromBackup(CONFIG_STORAGE_NAME, CONFIG_BACKUP_NAME);
                    if (restored) {
                        data = restored;
                        console.warn('[轻语] 主配置为空，已从备份恢复配置数据');
                    }
                }
                // 如果 data 为空或没有实质内容，尝试从旧配置迁移
                if (!data || Object.keys(data).length === 0) {
                    data = await this.migrateOldConfig();
                }
                this.assistantAvatarUrl = data.assistantAvatarUrl ?? null;
                this.userAvatarUrl = data.userAvatarUrl ?? null;
                this.notebookId = data.notebookId ?? DEFAULT_NOTEBOOK_ID;
                this.autoSync = data.autoSync === true || data.autoSync === 'true' || data.autoSync === 1;
                this.syncMode = data.syncMode === 'doc' ? 'doc' : 'dailynote';
                this.syncDocId = data.syncDocId || '';
                this.dailyNotePathTemplate = data.dailyNotePathTemplate || '';
                this.dailyNoteIconType = data.dailyNoteIconType || '';
                this.dailyNoteIconColorWeekday = data.dailyNoteIconColorWeekday || '';
                this.dailyNoteIconColorWeekend = data.dailyNoteIconColorWeekend || '';
                this.viewStyle = data.viewStyle === 'card' ? 'card' : 'list';
                this.flomoConfig = { username: '', password: '', accessToken: '', lastSyncTime: '', syncTarget: 'dailynote', syncDocId: '', ...(data.flomoConfig || data.flomo || {}) };
                this.writeathonConfig = { token: '', userId: '', spaceId: '', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '', ...(data.writeathonConfig || data.writeathon || {}) };
                this.memosConfig = { host: '', token: '', version: 'v2', lastSyncTime: '', syncTarget: 'shuoshuo', syncDocId: '', ...(data.memosConfig || data.memos || {}) };
                this.reviewConfig = { ...DEFAULT_REVIEW_CONFIG, ...(data.reviewConfig || data.review || {}) };
                // 优先保留已有的 tagIcons（防止意外覆盖），只有在 data.tagIcons 有值时才更新
                if (data.tagIcons && Object.keys(data.tagIcons).length > 0) {
                    this.tagIcons = data.tagIcons;
                } else {
                    // 如果主配置中没有 tagIcons，尝试从备份恢复
                    try {
                        const backup = await this.loadData('shuoshuo-tag-icons-backup');
                        if (backup && Object.keys(backup).length > 0) {
                            this.tagIcons = backup;
                        }
                    } catch (e) {
                        // 忽略备份读取失败
                    }
                }
                this.pinnedTags = Array.isArray(data.pinnedTags) ? data.pinnedTags : [];
                this.themeMode = data.themeMode || DEFAULT_THEME_MODE;
                this.morandiColor = MORANDI_COLORS.map(c => c.key).includes(data.morandiColor) ? data.morandiColor : MORANDI_COLORS[0].key;
                this.fontSizeConfig = { ...DEFAULT_FONT_SIZE_CONFIG, ...(data.fontSizeConfig || data.fontSize || {}) };
                this.enterToSubmit = data.enterToSubmit === true || data.enterToSubmit === 'true' || data.enterToSubmit === 1;
                this.showSidebarDock = data.showSidebarDock === true || data.showSidebarDock === 'true' || data.showSidebarDock === 1;
                this.showLifeLogRecords = data.showLifeLogRecords === true || data.showLifeLogRecords === 'true' || data.showLifeLogRecords === 1;
                this.compactMode = data.compactMode === true || data.compactMode === 'true' || data.compactMode === 1;
                this.bookshelfFontConfig = { ...DEFAULT_BOOKSHELF_FONT_CONFIG, ...(data.bookshelfFontConfig || {}) };
                this.bookshelfSyncConfig = { ...DEFAULT_BOOKSHELF_SYNC_CONFIG, ...(data.bookshelfSyncConfig || {}) };
                this.queryVisibility = { lifelog: false, 'no-tag': true, 'has-image': true, 'has-link': true, 'has-comment': false, ...(data.queryVisibility || {}) };
                this.autoCollapseLines = typeof data.autoCollapseLines === 'number' ? data.autoCollapseLines : DEFAULT_AUTO_COLLAPSE_LINES;
                this.customSignature = data.customSignature || '遇事不决，可问春风';
                this.reviewHistory = data.reviewHistory || {};
            } catch (e) {
                console.warn("加载配置失败", e);
            }
        });
    }

    async migrateOldConfig() {
        const data = {};
        const oldKeys = {
            assistantAvatarUrl: 'shuoshuo-avatar-assistant',
            userAvatarUrl: 'shuoshuo-avatar-user',
            notebookId: 'shuoshuo-notebook-id',
            autoSync: 'shuoshuo-auto-sync',
            syncMode: 'shuoshuo-sync-mode',
            syncDocId: 'shuoshuo-sync-doc-id',
            viewStyle: 'shuoshuo-view-style',
            flomoConfig: 'shuoshuo-flomo-config',
            writeathonConfig: 'shuoshuo-writeathon-config',
            memosConfig: 'shuoshuo-memos-config',
            reviewConfig: 'shuoshuo-review-config',
            tagIcons: 'shuoshuo-tag-icons',
            pinnedTags: 'shuoshuo-tag-pinned',
            themeMode: 'shuoshuo-theme-mode',
            morandiColor: 'shuoshuo-morandi-color',
            fontSizeConfig: 'shuoshuo-font-size-config'
        };
        for (const [key, storageKey] of Object.entries(oldKeys)) {
            try {
                const val = await this.loadData(storageKey);
                if (val !== null && val !== undefined) {
                    data[key] = val;
                }
            } catch (e) {
                // 忽略旧配置读取失败
            }
        }
        await this.saveData(CONFIG_STORAGE_NAME, data);
        return data;
    }

    async saveConfig() {
        return this._withSaveLock('config', async () => {
            try {
                // 如果 tagIcons 为空但之前有值，尝试从备份恢复
                if (!this.tagIcons || Object.keys(this.tagIcons).length === 0) {
                    try {
                        const backup = await this.loadData('shuoshuo-tag-icons-backup');
                        if (backup && Object.keys(backup).length > 0) {
                            this.tagIcons = backup;
                        }
                    } catch (e) {
                        // 忽略备份读取失败
                    }
                }

                const config = {
                    assistantAvatarUrl: this.assistantAvatarUrl,
                    userAvatarUrl: this.userAvatarUrl,
                    notebookId: this.notebookId,
                    autoSync: this.autoSync,
                    syncMode: this.syncMode,
                    syncDocId: this.syncDocId,
                    dailyNotePathTemplate: this.dailyNotePathTemplate,
                    dailyNoteIconType: this.dailyNoteIconType,
                    dailyNoteIconColorWeekday: this.dailyNoteIconColorWeekday,
                    dailyNoteIconColorWeekend: this.dailyNoteIconColorWeekend,
                    viewStyle: this.viewStyle,
                    flomoConfig: this.flomoConfig,
                    writeathonConfig: this.writeathonConfig,
                    memosConfig: this.memosConfig,
                    reviewConfig: this.reviewConfig,
                    tagIcons: this.tagIcons,
                    pinnedTags: this.pinnedTags,
                    themeMode: this.themeMode,
                    morandiColor: this.morandiColor,
                    fontSizeConfig: this.fontSizeConfig,
                    enterToSubmit: this.enterToSubmit,
                    showSidebarDock: this.showSidebarDock,
                    showLifeLogRecords: this.showLifeLogRecords,
                    compactMode: this.compactMode,
                    bookshelfFontConfig: this.bookshelfFontConfig,
                    bookshelfSyncConfig: this.bookshelfSyncConfig,
                    queryVisibility: this.queryVisibility,
                    autoCollapseLines: this.autoCollapseLines,
                    customSignature: this.customSignature,
                    reviewHistory: this.reviewHistory
                };

                // 空数据保护：如果所有关键配置都为空但存储中有数据，不要覆盖
                const isEmpty = !this.assistantAvatarUrl && !this.userAvatarUrl &&
                    !this.notebookId && !this.flomoConfig?.accessToken &&
                    !this.writeathonConfig?.token && !this.memosConfig?.token &&
                    (!this.tagIcons || Object.keys(this.tagIcons).length === 0);
                if (isEmpty) {
                    const existing = await this.loadData(CONFIG_STORAGE_NAME);
                    const existingHasData = existing && Object.keys(existing).length > 0 &&
                        (existing.assistantAvatarUrl || existing.userAvatarUrl || existing.notebookId ||
                         (existing.tagIcons && Object.keys(existing.tagIcons).length > 0));
                    if (existingHasData) {
                        console.warn('[轻语] saveConfig: 内存配置为空但存储非空，跳过保存');
                        return;
                    }
                }

                await this._backupData(CONFIG_STORAGE_NAME, CONFIG_BACKUP_NAME);
                await this.saveData(CONFIG_STORAGE_NAME, config);

                // 同时备份 tagIcons，防止丢失
                if (this.tagIcons && Object.keys(this.tagIcons).length > 0) {
                    await this.saveData('shuoshuo-tag-icons-backup', this.tagIcons);
                }
            } catch (e) {
                console.warn("保存配置失败", e);
            }
        });
    }

    // 应用视图样式到笔记列表
    async applyViewStyle() {
        const listEl = this.container?.querySelector('#shuoshuo-notes-list');
        if (!listEl) return;
        
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

    // 应用紧凑模式
    applyCompactMode() {
        const containers = this.getMountedLuminaContainers();
        if (!containers.length && this.container) containers.push(this.container);
        containers.forEach(container => {
            if (container) {
                container.classList.toggle('north-shuoshuo-compact', this.compactMode);
            }
        });
    }

    async saveShuoshuos() {
        return this._withSaveLock('shuoshuos', async () => {
            try {
                // 过滤掉可以从思源读取的 LifeLog（有 boundBlockId 的），避免重复保存
                // 但保留本地创建的 LifeLog（无 boundBlockId），这样不开自动同步时也能显示
                const localOnly = this.shuoshuos.filter(s => !(s._isLifeLog && s.boundBlockId));
                // 保存前先备份旧数据
                await this._backupData(STORAGE_NAME, STORAGE_BACKUP_NAME);
                await this.saveData(STORAGE_NAME, localOnly);
                // 保存后更新已绑定块ID的缓存
                this._updateBoundCache();
            } catch (e) {
                console.warn("保存笔记失败", e);
                showMessage("保存失败: " + e.message);
            }
        });
    }

    // ==================== Flomo 同步功能 ====================

    // 设置标签图标
    async setTagIcon(tagName, icon) {
        if (icon && icon.trim()) {
            this.tagIcons[tagName] = icon.trim();
        } else {
            delete this.tagIcons[tagName];
        }
        await this.saveConfig();
        this.renderTags(); // 刷新标签列表
    }

    // 切换置顶状态
    async togglePinnedTag(tagName) {
        const index = this.pinnedTags.indexOf(tagName);
        if (index > -1) {
            this.pinnedTags.splice(index, 1);
        } else {
            this.pinnedTags.push(tagName);
        }
        await this.saveConfig();
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M8 4h8"/><path d="M9 4v6l-2 4"/><path d="M15 4v6l2 4"/><path d="M7 14h10"/></svg>
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

        // 定位（先渲染获取高度，再做边界检测）
        const rect = anchorEl.getBoundingClientRect();
        const menuHeight = menu.offsetHeight || 120;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        let top;
        if (spaceBelow < menuHeight + 8 && spaceAbove > spaceBelow) {
            top = rect.top - menuHeight - 4;
        } else {
            top = rect.bottom + 4;
        }
        menu.style.position = 'fixed';
        menu.style.top = `${Math.max(4, top)}px`;
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

        await this.saveShuoshuos();
        await this.saveConfig();

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

        await this.saveShuoshuos();
        await this.saveConfig();
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

        await this.saveShuoshuos();
        await this.saveConfig();
        this.renderTags();
        this.renderNotes();
        showMessage('标签和关联笔记已删除');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // 根据字符串哈希获取颜色索引
    getColorIndex(str, max = 10) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) % max;
    }

    // 获取标签颜色样式
    getTagColorStyle(tagName) {
        const idx = this.getColorIndex(tagName, TAG_COLORS.length);
        const c = TAG_COLORS[idx];
        return `background:${c.bg};color:${c.color};border:1px solid ${c.border}`;
    }

    // 获取类型颜色样式
    getTypeColorStyle(typeName) {
        const idx = this.getColorIndex(typeName, TYPE_COLORS.length);
        const c = TYPE_COLORS[idx];
        return `background:${c.bg};color:${c.color}`;
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

    // 应用字体大小配置
    applyFontSizeConfig() {
        let fontSize;
        switch (this.fontSizeConfig.mode) {
            case 'siyuan':
                fontSize = 'var(--b3-font-size-editor)';
                break;
            case 'custom':
                fontSize = `${this.fontSizeConfig.customSize || 14.5}px`;
                break;
            default:
                fontSize = '14.5px';
        }
        // 应用到所有已挂载容器
        const containers = this.getMountedLuminaContainers();
        if (!containers.length && this.container) containers.push(this.container);
        containers.forEach(container => {
            const shuoshuoContainer = container.querySelector('.north-shuoshuo-container');
            if (shuoshuoContainer) {
                shuoshuoContainer.style.setProperty('--shuoshuo-content-font-size', fontSize);
            }
        });
        // 同时设置到根元素，让轻语速记浮层等也能使用
        document.documentElement.style.setProperty('--shuoshuo-content-font-size', fontSize);
    }

    // 根据回顾配置获取回顾笔记
    getReviewNotes() {
        const { contentScope, contentScopeTags, timeRange, dailyCount, weightedReview } = this.reviewConfig;
        
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
            filtered = filtered.filter(s => !s.tags || s.tags.length === 0);
        } else if (contentScope === 'include_tags' && contentScopeTags.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.tags || s.tags.length === 0) return false;
                return contentScopeTags.some(tag => s.tags.includes(tag));
            });
        } else if (contentScope === 'exclude_tags' && contentScopeTags.length > 0) {
            filtered = filtered.filter(s => {
                if (!s.tags || s.tags.length === 0) return true;
                return !contentScopeTags.some(tag => s.tags.includes(tag));
            });
        }

        if (weightedReview) {
            // 加权算法：越久没翻过的越优先
            const now = Date.now();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            const scored = filtered.map(s => {
                const lastReview = this.reviewHistory[s.id] || 0;
                let score;
                if (lastReview === 0) {
                    score = now + Math.random() * sevenDays;
                } else {
                    score = (now - lastReview) + Math.random() * sevenDays * 0.3;
                }
                return { note: s, score };
            });
            scored.sort((a, b) => b.score - a.score);
            return scored.slice(0, dailyCount).map(item => item.note);
        }
        
        // 3. 随机打乱并限制数量
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, dailyCount);
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
                await this.saveConfig();
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
            await this.saveConfig();
            
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
            
            const token = window.siyuan?.config?.api?.token || '';
            const headers = {};
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
            const uploadResponse = await fetch('/api/asset/upload', {
                method: 'POST',
                body: formData,
                headers
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
                // 处理无序列表 <ul><li>...</li></ul>
                .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
                    return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
                })
                // 处理有序列表 <ol><li>...</li></ol>
                .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
                    let index = 1;
                    return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (liMatch, itemContent) => {
                        return `${index++}. ${itemContent}\n`;
                    });
                })
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
            const tagRegex = /#([\w\/\u4e00-\u9fa5-]+)(?![\w\/\u4e00-\u9fa5-])(?!#)/g;
            let match;
            while ((match = tagRegex.exec(contentTrimmed)) !== null) {
                const tag = match[1].trim();
                if (tag && !/^\d+$/.test(tag)) {
                    existingTags.add(tag); // 存储标签名（不含#）
                }
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
            // 按时间排序，从早到晚
            dayMemos.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            
            for (const memo of dayMemos) {
                // 转换 HTML 为 Markdown（简化处理）
                let memoContent = memo.content
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                    // 处理无序列表 <ul><li>...</li></ul>
                    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
                        return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
                    })
                    // 处理有序列表 <ol><li>...</li></ol>
                    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
                        let index = 1;
                        return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (liMatch, itemContent) => {
                            return `${index++}. ${itemContent}\n`;
                        });
                    })
                    .replace(/<[^>]+>/g, ''); // 移除剩余标签
                
                // 处理图片 - 直接使用远程 URL，后续统一转换
                if (memo.files && memo.files.length > 0) {
                    memo.files.forEach(file => {
                        memoContent += `\n![${file.file_name}](${file.url})`;
                    });
                }
                
                // 提取 flomo 标签
                const flomoTags = memo.tags || [];
                const tagStr = flomoTags.length > 0 ? ' ' + flomoTags.map(t => `#${t}`).join(' ') : '';
                
                // 构建完整内容（标签 + 内容）
                const fullContent = tagStr ? `${tagStr}\n${memoContent.trim()}` : memoContent.trim();
                
                // 使用 memo 的创建时间戳
                const memoTimestamp = new Date(memo.created_at).getTime();
                
                // 每条笔记单独保存到每日笔记（使用引用块格式）
                await this.appendToDailyNote(fullContent, memoTimestamp);
            }
            
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
                    // 处理无序列表 <ul><li>...</li></ul>
                    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, listContent) => {
                        return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
                    })
                    // 处理有序列表 <ol><li>...</li></ol>
                    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, listContent) => {
                        let index = 1;
                        return listContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (liMatch, itemContent) => {
                            return `${index++}. ${itemContent}\n`;
                        });
                    })
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

    // ==================== 写拉松同步功能 ====================

    async writeathonRequest(path, options = {}) {
        const url = `${WRITEATHON_API_BASE}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'x-writeathon-token': this.writeathonConfig.token || ''
        };
        
        const response = await fetch(url, {
            ...options,
            headers: { ...headers, ...options.headers }
        });
        
        const data = await response.json();
        return data;
    }

    // 验证写拉松 Token
    async writeathonVerify(token, userId) {
        try {
            // 临时使用传入的 token 验证
            const url = `${WRITEATHON_API_BASE}/v1/me`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-writeathon-token': token
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.data) {
                return { success: true, message: '验证成功', data: data.data };
            } else {
                return { success: false, message: data.message || '验证失败' };
            }
        } catch (e) {
            console.error('写拉松验证失败:', e);
            return { success: false, message: '验证失败：' + e.message };
        }
    }

    // 获取空间列表
    async writeathonGetSpaces() {
        try {
            const userId = this.writeathonConfig.userId;
            if (!userId) {
                return { success: false, message: '未配置用户 ID' };
            }
            
            const data = await this.writeathonRequest(`/v1/users/${userId}/spaces`, {
                method: 'GET'
            });
            
            if (data.success && data.data) {
                return { success: true, data: data.data };
            } else {
                return { success: false, message: data.message || '获取空间列表失败' };
            }
        } catch (e) {
            console.error('获取写拉松空间列表失败:', e);
            return { success: false, message: '获取空间列表失败：' + e.message };
        }
    }

    // 同步写拉松卡片
    async writeathonSync(isFullSync = false) {
        if (!this.writeathonConfig.token || !this.writeathonConfig.userId) {
            showMessage('请先配置写拉松 Token 和用户 ID');
            return;
        }

        try {
            showMessage('正在同步写拉松...');
            const userId = this.writeathonConfig.userId;
            const spaceId = this.writeathonConfig.spaceId;
            
            let cards = [];
            
            // 方案1：获取最近更新的卡片列表
            let recentUrl = `/v1/users/${userId}/cards/recent`;
            const queryParams = [];
            if (spaceId) {
                queryParams.push(`space=${encodeURIComponent(spaceId)}`);
            }
            // 不排除日期标题，避免过滤掉有效卡片
            queryParams.push(`exclude_date_title=false`);
            if (queryParams.length > 0) {
                recentUrl += '?' + queryParams.join('&');
            }
            
            console.log('写拉松同步请求 URL:', recentUrl);
            const recentData = await this.writeathonRequest(recentUrl, {
                method: 'GET'
            });
            console.log('写拉松 recent API 返回:', recentData);
            
            // 解析返回数据，兼容多种可能的数据结构
            if (recentData.success) {
                if (Array.isArray(recentData.data)) {
                    cards = recentData.data;
                } else if (recentData.data && typeof recentData.data === 'object') {
                    // 可能数据被包装在子字段中
                    cards = recentData.data.cards || recentData.data.list || recentData.data.data || [];
                }
            }
            
            // 方案2：如果 recent 没有返回数据，尝试写作拾贝接口
            if (cards.length === 0) {
                console.log('recent 接口未返回卡片，尝试 writing-pick 接口');
                const pickData = await this.writeathonRequest(`/v1/users/${userId}/writing-pick`, {
                    method: 'POST',
                    body: JSON.stringify({ type: 'card', limit: 10 })
                });
                console.log('写拉松 writing-pick API 返回:', pickData);
                
                if (pickData.success) {
                    if (Array.isArray(pickData.data)) {
                        cards = pickData.data;
                    } else if (pickData.data && typeof pickData.data === 'object') {
                        cards = pickData.data.cards || pickData.data.list || pickData.data.data || [];
                    }
                }
            }
            
            if (cards.length === 0) {
                showMessage('没有获取到卡片（请确认卡片盒中已有卡片，或检查空间选择）');
                return;
            }
            
            console.log('获取到卡片列表:', cards);
            const cardDetails = [];
            
            // 获取每个卡片的详情
            for (const card of cards) {
                const cardId = card._id || card.id;
                const cardTitle = card.title || '';
                if (!cardId) {
                    console.log('跳过无 ID 的卡片:', card);
                    continue;
                }
                
                try {
                    console.log('获取卡片详情:', cardId, cardTitle);
                    const detailData = await this.writeathonRequest(`/v1/users/${userId}/cards/get`, {
                        method: 'POST',
                        body: JSON.stringify({ id: cardId })
                    });
                    console.log('卡片详情返回:', cardId, detailData);
                    
                    if (detailData.success && detailData.data) {
                        cardDetails.push(detailData.data);
                    } else {
                        // 如果详情获取失败但列表数据已有 content，直接用列表数据
                        if (card.content) {
                            cardDetails.push(card);
                        }
                    }
                } catch (e) {
                    console.error(`获取卡片 ${cardId} 详情失败:`, e);
                    // 如果详情获取失败但列表数据已有 content，直接用列表数据
                    if (card.content) {
                        cardDetails.push(card);
                    }
                }
            }
            
            if (cardDetails.length === 0) {
                showMessage('没有获取到卡片详情');
                return;
            }
            
            // 根据同步目标分别处理
            const syncTarget = this.writeathonConfig.syncTarget || 'shuoshuo';
            if (syncTarget === 'shuoshuo') {
                await this.saveWriteathonCardsToShuoshuo(cardDetails, isFullSync);
            } else if (syncTarget === 'singledoc') {
                await this.saveWriteathonCardsToSingleDoc(cardDetails);
            } else {
                await this.saveWriteathonCardsToDailyNote(cardDetails);
            }
            
            // 更新最后同步时间
            this.writeathonConfig.lastSyncTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
            await this.saveConfig();
            
            showMessage(`成功同步 ${cardDetails.length} 张卡片`);
        } catch (e) {
            console.error('写拉松同步失败:', e);
            showMessage('同步失败：' + e.message);
        }
    }

    // 判断是否为自动生成的日期标题（纯数字，8位或14位）
    isDateTitle(title) {
        if (!title) return false;
        // 匹配纯数字的标题，如 20260418 或 20260418153514
        return /^\d{8}(\d{6})?$/.test(title.trim());
    }

    // 移除内容开头的日期标题行
    removeDateTitleFromContent(content) {
        if (!content) return content;
        const lines = content.split('\n');
        if (lines.length > 0 && this.isDateTitle(lines[0])) {
            return lines.slice(1).join('\n').trim();
        }
        return content;
    }

    // 下载写拉松内容中的远程图片并替换为本地路径
    async processWriteathonImages(content) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const matches = [];
        let match;
        while ((match = imageRegex.exec(content)) !== null) {
            const alt = match[1];
            const url = match[2];
            if (url.startsWith('http://') || url.startsWith('https://')) {
                matches.push({ full: match[0], alt, url });
            }
        }
        
        let result = content;
        for (const img of matches) {
            showMessage(`正在下载图片...`);
            const localPath = await this.downloadRemoteImage(img.url, img.alt || 'image.png');
            if (localPath) {
                result = result.replace(img.full, `![${img.alt}](${localPath})`);
            }
        }
        return result;
    }

    // 保存写拉松卡片到说说视图
    async saveWriteathonCardsToShuoshuo(cards, isFullSync = false) {
        let addedCount = 0;
        let updatedCount = 0;
        
        for (const card of cards) {
            // 兼容 _id 和 id 两种字段名
            const cardId = card._id || card.id;
            if (!cardId) continue;
            
            // 写拉松内容直接是文本/Markdown
            let content = (card.content || '').trim();
            const title = (card.title || '').trim();
            
            // 处理图片 - 下载远程图片并替换为本地路径
            content = await this.processWriteathonImages(content);
            
            // 移除内容开头的日期标题行（写拉松有时会把标题也放到 content 里）
            content = this.removeDateTitleFromContent(content);
            
            // 如果有标题且不是自动生成的日期标题，把标题加到内容前面
            if (title && !this.isDateTitle(title)) {
                content = title + '\n' + content;
            }
            
            // 提取标签
            const tags = this.extractTags(content);
            
            // 处理时间字段，兼容多种格式
            let createdTime = Date.now();
            let updatedTime = Date.now();
            try {
                if (card.created) createdTime = new Date(card.created).getTime();
                else if (card.created_at) createdTime = new Date(card.created_at).getTime();
            } catch (e) {}
            try {
                if (card.updated) updatedTime = new Date(card.updated).getTime();
                else if (card.updated_at) updatedTime = new Date(card.updated_at).getTime();
            } catch (e) {}
            
            // 创建说说对象
            const shuoshuo = {
                id: `writeathon_${cardId}`,
                content: content,
                tags: tags,
                pinned: false,
                created: createdTime,
                updated: updatedTime,
                source: 'writeathon'
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
        
        if (addedCount > 0 && updatedCount > 0) {
            showMessage(`同步完成：新增 ${addedCount} 条，更新 ${updatedCount} 条`);
        } else if (addedCount > 0) {
            showMessage(`成功添加 ${addedCount} 条卡片到说说视图`);
        } else if (updatedCount > 0) {
            showMessage(`成功更新 ${updatedCount} 条卡片`);
        } else {
            showMessage(`同步完成：没有变化的卡片`);
        }
    }

    // 保存写拉松卡片到每日笔记
    async saveWriteathonCardsToDailyNote(cards) {
        // 按日期分组
        const cardsByDate = {};
        
        for (const card of cards) {
            let dateStr;
            try {
                const d = new Date(card.created || card.created_at || Date.now());
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            } catch (e) {
                dateStr = new Date().toISOString().split('T')[0];
            }
            if (!cardsByDate[dateStr]) {
                cardsByDate[dateStr] = [];
            }
            cardsByDate[dateStr].push(card);
        }
        
        // 处理每一天的卡片
        for (const [dateStr, dayCards] of Object.entries(cardsByDate)) {
            let allContent = '';
            
            for (const card of dayCards) {
                let content = (card.content || '').trim();
                const title = (card.title || '').trim();
                
                // 处理图片
                content = await this.processWriteathonImages(content);
                
                // 移除内容开头的日期标题行
                content = this.removeDateTitleFromContent(content);
                
                // 去掉日期标题
                if (title && !this.isDateTitle(title)) {
                    content = title + '\n' + content;
                }
                
                allContent += `- ${content.trim()}\n\n`;
            }
            
            if (allContent) {
                await this.appendToDailyNote(allContent, new Date(dateStr).getTime());
            }
        }
        
        showMessage(`成功同步 ${cards.length} 张卡片到每日笔记`);
    }

    // 保存写拉松卡片到指定文档
    async saveWriteathonCardsToSingleDoc(cards) {
        const docId = this.writeathonConfig.syncDocId;
        if (!docId) {
            showMessage('请输入目标文档 ID');
            return;
        }
        
        let allContent = '';
        
        for (const card of cards) {
            let content = (card.content || '').trim();
            const title = (card.title || '').trim();
            
            // 处理图片
            content = await this.processWriteathonImages(content);
            
            // 去掉日期标题
            if (title && !this.isDateTitle(title)) {
                content = title + '\n' + content;
            }
            
            allContent += `- ${content.trim()}\n\n`;
        }
        
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
                showMessage(`成功追加 ${cards.length} 张卡片到指定文档`);
            } else {
                showMessage('保存失败：' + (result.msg || '未知错误'));
            }
        } catch (e) {
            console.error('保存到指定文档失败:', e);
            showMessage('保存失败：' + e.message);
        }
    }

    // ==================== Memos 同步功能 ====================

    async memosRequest(path, options = {}) {
        const url = `${this.memosConfig.host.replace(/\/$/, '')}${path}`;
        
        // 尝试多种认证头格式
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.memosConfig.token || ''}`,
                    ...options.headers
                }
            });
        } catch (e) {
            console.warn('Memos 请求失败（Bearer）:', e.message);
            throw e;
        }
        
        // 如果 401，尝试不带 Bearer 的格式
        if (response.status === 401) {
            console.log('Memos 请求 401，尝试不带 Bearer 的认证头');
            response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.memosConfig.token || '',
                    ...options.headers
                }
            });
        }
        
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            console.error('Memos 请求失败:', response.status, text);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    }

    // 验证 Memos Token
    async memosVerify(host, token) {
        try {
            const baseUrl = host.replace(/\/$/, '');
            
            // 尝试多种认证头格式
            const authHeaders = [
                { 'Authorization': `Bearer ${token}` },
                { 'Authorization': token },
            ];
            
            // 尝试 V2 接口（优先，因为 V2 更常见）
            const v2Paths = ['/api/v1/user/me', '/api/v1/auth/status', '/api/v1/users'];
            
            for (const path of v2Paths) {
                for (const headers of authHeaders) {
                    try {
                        console.log(`Memos 验证尝试: ${baseUrl}${path}`, headers);
                        const response = await fetch(`${baseUrl}${path}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                ...headers
                            }
                        });
                        
                        console.log(`Memos 验证响应: ${path}`, response.status, response.statusText);
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Memos 验证数据:', data);
                            
                            // V2 成功标志
                            if (data.users || data.name || data.id || data.email) {
                                return { success: true, message: '验证成功' };
                            }
                        }
                    } catch (innerE) {
                        console.log(`Memos 验证 ${path} 失败:`, innerE.message);
                    }
                }
            }
            
            // 最后尝试不认证直接访问（某些公开实例）
            try {
                const publicResponse = await fetch(`${baseUrl}/api/v1/memos?pageSize=1`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (publicResponse.ok) {
                    return { success: true, message: '验证成功（公开实例）' };
                }
            } catch (e) {}
            
            return { success: false, message: '验证失败：请检查服务器地址和 Token 是否正确，并在浏览器控制台查看详细日志' };
        } catch (e) {
            console.error('Memos 验证失败:', e);
            return { success: false, message: '验证失败：' + e.message };
        }
    }

    // 同步 Memos
    async memosSync(isFullSync = false) {
        if (!this.memosConfig.host || !this.memosConfig.token) {
            showMessage('请先配置 Memos 服务器地址和 Token');
            return;
        }

        try {
            showMessage('正在同步 Memos...');
            
            let memos = [];
            const version = this.memosConfig.version;
            
            if (version === 'v1') {
                memos = await this.memosGetV1Memos(isFullSync);
            } else {
                memos = await this.memosGetV2Memos(isFullSync);
            }
            
            if (memos.length === 0) {
                showMessage('没有需要同步的 Memos');
                return;
            }
            
            console.log('获取到 Memos:', memos.length);
            
            // 根据同步目标分别处理
            const syncTarget = this.memosConfig.syncTarget || 'shuoshuo';
            if (syncTarget === 'shuoshuo') {
                await this.saveMemosToShuoshuo(memos);
            } else if (syncTarget === 'singledoc') {
                await this.saveMemosToSingleDoc(memos);
            } else {
                await this.saveMemosToDailyNote(memos);
            }
            
            // 更新最后同步时间
            this.memosConfig.lastSyncTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
            await this.saveConfig();
            
            showMessage(`成功同步 ${memos.length} 条 Memos`);
        } catch (e) {
            console.error('Memos 同步失败:', e);
            showMessage('同步失败：' + e.message);
        }
    }

    // V1 获取 Memos
    async memosGetV1Memos(isFullSync) {
        const allMemos = [];
        const pageSize = 100;
        let offset = 0;
        const lastSyncTime = isFullSync ? '1970-01-01 00:00:00' : (this.memosConfig.lastSyncTime || '1970-01-01 00:00:00');
        
        while (true) {
            const data = await this.memosRequest(`/api/v1/memo?offset=${offset}&limit=${pageSize}`, {
                method: 'GET'
            });
            
            if (!Array.isArray(data) || data.length === 0) break;
            
            for (const memo of data) {
                const updatedTs = memo.updatedTs ? new Date(memo.updatedTs * 1000) : new Date(0);
                if (isFullSync || updatedTs >= new Date(lastSyncTime)) {
                    allMemos.push(memo);
                }
            }
            
            if (data.length < pageSize) break;
            offset += pageSize;
        }
        
        return allMemos;
    }

    // V2 获取 Memos
    async memosGetV2Memos(isFullSync) {
        const allMemos = [];
        const pageSize = 100;
        let pageToken = '';
        const lastSyncTime = isFullSync ? '1970-01-01 00:00:00' : (this.memosConfig.lastSyncTime || '1970-01-01 00:00:00');
        
        while (true) {
            let url = `/api/v1/memos?pageSize=${pageSize}`;
            if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;
            
            const data = await this.memosRequest(url, { method: 'GET' });
            
            if (!data || !Array.isArray(data.memos) || data.memos.length === 0) break;
            
            for (const memo of data.memos) {
                let updateTime;
                try {
                    updateTime = memo.updateTime ? new Date(memo.updateTime) : new Date(0);
                } catch (e) {
                    updateTime = new Date(0);
                }
                if (isFullSync || updateTime >= new Date(lastSyncTime)) {
                    allMemos.push(memo);
                }
            }
            
            if (!data.nextPageToken) break;
            pageToken = data.nextPageToken;
        }
        
        return allMemos;
    }

    // 处理 Memos 内容（标签、链接、图片）
    async processMemosContent(content, resources = []) {
        if (!content) return '';
        
        // 处理标签 #tag -> #tag#
        content = content.replace(/#([^\s#][^\s]*)/g, '#$1');
        
        // 处理双链引用 ((...))
        content = content.replace(/\(\(([^)]+)\)\)/g, '[[$1]]');
        
        // 处理纯 URL 转为 Markdown 链接
        content = content.replace(/(?<![\[(])(https?:\/\/[^\s]+)/g, (url) => {
            // 如果已经是 markdown 链接的一部分，不处理
            return `[${url}](${url})`;
        });
        
        // 处理资源（图片、附件）
        for (const res of resources) {
            const filename = res.filename || res.name || 'file';
            const ext = filename.split('.').pop().toLowerCase();
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
            
            let resourceUrl;
            if (res.externalLink) {
                resourceUrl = res.externalLink;
            } else {
                // 构造资源下载 URL
                const resName = res.name || res.uid || '';
                resourceUrl = `${this.memosConfig.host.replace(/\/$/, '')}/file/${resName}/${filename}`;
            }
            
            if (isImage && !res.externalLink) {
                // 下载图片到本地
                showMessage(`正在下载图片: ${filename}...`);
                const localPath = await this.downloadRemoteImage(resourceUrl, filename);
                if (localPath) {
                    resourceUrl = localPath;
                }
            }
            
            if (isImage) {
                content += `\n![${filename}](${resourceUrl})`;
            } else {
                content += `\n[${filename}](${resourceUrl})`;
            }
        }
        
        return content.trim();
    }

    // 保存 Memos 到说说视图
    async saveMemosToShuoshuo(memos) {
        let addedCount = 0;
        let updatedCount = 0;
        
        for (const memo of memos) {
            const memoId = memo.id || memo.name;
            if (!memoId) continue;
            
            // V1 和 V2 字段名不同
            const content = memo.content || '';
            const resources = memo.resourceList || memo.resources || memo.attachments || [];
            
            // 处理内容
            let processedContent = await this.processMemosContent(content, resources);
            
            // 提取标签
            const tags = this.extractTags(processedContent);
            
            // 处理时间
            let createdTime = Date.now();
            let updatedTime = Date.now();
            try {
                if (memo.createdTs) createdTime = memo.createdTs * 1000;
                else if (memo.createTime) createdTime = new Date(memo.createTime).getTime();
            } catch (e) {}
            try {
                if (memo.updatedTs) updatedTime = memo.updatedTs * 1000;
                else if (memo.updateTime) updatedTime = new Date(memo.updateTime).getTime();
            } catch (e) {}
            
            // 创建说说对象
            const shuoshuo = {
                id: `memos_${memoId}`,
                content: processedContent,
                tags: tags,
                pinned: false,
                created: createdTime,
                updated: updatedTime,
                source: 'memos'
            };
            
            // 检查是否已存在
            const existingIndex = this.shuoshuos.findIndex(s => s.id === shuoshuo.id);
            if (existingIndex === -1) {
                this.shuoshuos.push(shuoshuo);
                addedCount++;
            } else {
                this.shuoshuos[existingIndex] = shuoshuo;
                updatedCount++;
            }
        }
        
        // 保存到存储
        await this.saveShuoshuos();
        
        // 刷新说说视图
        this.renderNotes();
        this.renderTags();
        
        if (addedCount > 0 && updatedCount > 0) {
            showMessage(`同步完成：新增 ${addedCount} 条，更新 ${updatedCount} 条`);
        } else if (addedCount > 0) {
            showMessage(`成功添加 ${addedCount} 条 Memos 到说说视图`);
        } else if (updatedCount > 0) {
            showMessage(`成功更新 ${updatedCount} 条 Memos`);
        } else {
            showMessage(`同步完成：没有变化的 Memos`);
        }
    }

    // 加载笔记本列表到 Memos 选择器
    async loadMemosNotebooks() {
        const select = this.container?.querySelector('#memos-notebook-select');
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
                    const code = nb.icon ? parseInt(nb.icon, 16) : NaN;
                    const icon = !isNaN(code) ? String.fromCodePoint(code) : '📒';
                    html += `<option value="${nb.id}">${icon} ${nb.name}</option>`;
                });
                select.innerHTML = html;
            }
        } catch (e) {
            console.error('加载笔记本列表失败', e);
        }
    }

    // 保存 Memos 到每日笔记
    async saveMemosToDailyNote(memos) {
        // 按日期分组
        const memosByDate = {};
        
        for (const memo of memos) {
            let dateStr;
            try {
                let ts;
                if (memo.createdTs) ts = memo.createdTs * 1000;
                else if (memo.createTime) ts = new Date(memo.createTime).getTime();
                else ts = Date.now();
                const d = new Date(ts);
                dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            } catch (e) {
                dateStr = new Date().toISOString().split('T')[0];
            }
            if (!memosByDate[dateStr]) {
                memosByDate[dateStr] = [];
            }
            memosByDate[dateStr].push(memo);
        }
        
        // 处理每一天的 Memos
        for (const [dateStr, dayMemos] of Object.entries(memosByDate)) {
            let allContent = '';
            
            for (const memo of dayMemos) {
                const content = memo.content || '';
                const resources = memo.resourceList || memo.resources || memo.attachments || [];
                let processedContent = await this.processMemosContent(content, resources);
                allContent += `- ${processedContent.trim()}\n\n`;
            }
            
            if (allContent) {
                await this.appendToDailyNote(allContent, new Date(dateStr).getTime());
            }
        }
        
        showMessage(`成功同步 ${memos.length} 条 Memos 到每日笔记`);
    }

    // 保存 Memos 到指定文档
    async saveMemosToSingleDoc(memos) {
        const docId = this.memosConfig.syncDocId;
        if (!docId) {
            showMessage('请输入目标文档 ID');
            return;
        }
        
        let allContent = '';
        
        for (const memo of memos) {
            const content = memo.content || '';
            const resources = memo.resourceList || memo.resources || memo.attachments || [];
            let processedContent = await this.processMemosContent(content, resources);
            allContent += `- ${processedContent.trim()}\n\n`;
        }
        
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
                showMessage(`成功追加 ${memos.length} 条 Memos 到指定文档`);
            } else {
                showMessage('保存失败：' + (result.msg || '未知错误'));
            }
        } catch (e) {
            console.error('保存到指定文档失败:', e);
            showMessage('保存失败：' + e.message);
        }
    }

    uninstall() {
        // 保留用户笔记数据（STORAGE_NAME），仅删除配置文件
        this.removeData(CONFIG_STORAGE_NAME).catch(e => {
            showMessage(`uninstall [${this.name}] remove data [${CONFIG_STORAGE_NAME}] fail: ${e.msg}`);
        });
    }
}
