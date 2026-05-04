/**
 * Table visibility manager
 */

const STORAGE_KEY = 'yuumi_active_configs';

function getVisibleTableIds(activeConfigs) {
    if (!activeConfigs || activeConfigs.length === 0) return null; // null = tout afficher

    const ids = new Set();
    activeConfigs.forEach(configName => {
        const found = YUUMI_CONFIG.visibleTables.find(c => c.config === configName);
        if (found) found.tables.forEach(id => ids.add(id));
    });
    return ids;
}

function applyVisibility(visibleIds) {
    const tabs = document.querySelectorAll('[id^="tableTab-"]');
    tabs.forEach(tab => {
        const tableId = tab.id.replace('tableTab-', '');
        if (visibleIds === null) {
            tab.style.display = '';
        } else {
            tab.style.display = visibleIds.has(tableId) ? '' : 'none';
        }
    });
}

let _currentVisibleIds = null;
let _tabObserver = null;

function startTabObserver() {
    if (_tabObserver) _tabObserver.disconnect();

    _tabObserver = new MutationObserver(() => {
        applyVisibility(_currentVisibleIds);
    });

    const nav = document.querySelector('[data-tutorial-selector-id="appControlsTablesTabs"]');
    if (nav) {
        _tabObserver.observe(nav, { childList: true, subtree: true });
    } else {
        _tabObserver.observe(document.body, { childList: true, subtree: true });
    }
}

function loadAndApply() {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
        const activeConfigs = result[STORAGE_KEY] || [];
        _currentVisibleIds = getVisibleTableIds(activeConfigs);
        applyVisibility(_currentVisibleIds);
        startTabObserver();
    });
}

function saveAndApply(activeConfigs) {
    chrome.storage.sync.set({ [STORAGE_KEY]: activeConfigs }, () => {
        _currentVisibleIds = getVisibleTableIds(activeConfigs);
        applyVisibility(_currentVisibleIds);
    });
}

window.__yuumiTables = {
    STORAGE_KEY,
    saveAndApply,
    getConfigs: () => YUUMI_CONFIG.visibleTables.map(c => c.config),
};

chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'yuumi_update_configs') {
        _currentVisibleIds = getVisibleTableIds(request.activeConfigs);
        applyVisibility(_currentVisibleIds);
    }
});

function waitForConfig(callback, retries = 20) {
    if (typeof YUUMI_CONFIG !== 'undefined') {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForConfig(callback, retries - 1), 50);
    } else {
        console.warn('[Yuumi] tables.js : YUUMI_CONFIG introuvable après attente.');
    }
}

waitForConfig(loadAndApply);