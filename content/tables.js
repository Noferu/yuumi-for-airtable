/**
 * Table visibility manager
 * Visual toast shown in Airtable when a config changes.
 */

const STORAGE_KEY = 'yuumi_active_configs';

// ── Visibility logic ──────────────────────────────────────────────────────────

function getVisibleTableIds(activeConfigs) {
    const pinned = new Set(YUUMI_CONFIG?.pinnedTables ?? []);
    if (!activeConfigs || activeConfigs.length === 0) return null;

    const ids = new Set(pinned);
    activeConfigs.forEach(name => {
        const found = YUUMI_CONFIG.visibleTables.find(c => c.config === name);
        if (found) found.tables.forEach(id => ids.add(id));
    });
    return ids;
}

function applyVisibility(visibleIds) {
    const pinned = new Set(YUUMI_CONFIG?.pinnedTables ?? []);
    document.querySelectorAll('[id^="tableTab-"]').forEach(tab => {
        const tableId = tab.id.replace('tableTab-', '');
        tab.style.display = (visibleIds === null || pinned.has(tableId) || visibleIds.has(tableId))
            ? '' : 'none';
    });
}

// ── Toast feedback ────────────────────────────────────────────────────────────

function showToast(activeConfigs) {
    document.getElementById('yuumi-toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'yuumi-toast';

    let msg;
    if (!activeConfigs || activeConfigs.length === 0) {
        msg = 'Yuumi · Tous les tableaux visibles';
    } else {
        const count = activeConfigs.reduce((n, name) => {
            const found = YUUMI_CONFIG.visibleTables.find(c => c.config === name);
            return n + (found ? found.tables.length : 0);
        }, 0) + (YUUMI_CONFIG.pinnedTables?.length ?? 0);
        msg = `Yuumi · ${activeConfigs.join(', ')} — ${count} tableau${count > 1 ? 'x' : ''} visibles`;
    }

    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(24, 29, 38, 0.92);
        color: #fff;
        font-family: 'Inter Display', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 12px;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 20px;
        z-index: 999998;
        pointer-events: none;
        white-space: nowrap;
        letter-spacing: 0.02em;
        transition: opacity 0.3s ease;
        opacity: 1;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

// ── Storage + apply ───────────────────────────────────────────────────────────

let _currentVisibleIds = null;
let _tabObserver = null;

function startTabObserver() {
    _tabObserver?.disconnect();
    _tabObserver = new MutationObserver(() => applyVisibility(_currentVisibleIds));
    const nav = document.querySelector('[data-tutorial-selector-id="appControlsTablesTabs"]');
    _tabObserver.observe(nav ?? document.body, { childList: true, subtree: true });
}

function loadAndApply(silent = false) {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
        const activeConfigs = result[STORAGE_KEY] || [];
        _currentVisibleIds = getVisibleTableIds(activeConfigs);
        applyVisibility(_currentVisibleIds);
        startTabObserver();
        if (!silent) showToast(activeConfigs);
    });
}

/**
 * Persist activeConfigs, apply visibility and show toast.
 * Single source of truth — avoids race conditions.
 */
function saveAndApply(activeConfigs) {
    chrome.storage.sync.set({ [STORAGE_KEY]: activeConfigs }, () => {
        _currentVisibleIds = getVisibleTableIds(activeConfigs);
        applyVisibility(_currentVisibleIds);
        showToast(activeConfigs);
        // Notify popup so its checkboxes stay in sync
        chrome.runtime.sendMessage({ action: 'yuumi_state_changed', activeConfigs }).catch(() => {});
    });
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request) => {
    // Popup toggled a config checkbox → persist + apply
    if (request.action === 'yuumi_save_configs') {
        saveAndApply(request.activeConfigs);
    }
    // Config settings were changed → reload and re-apply silently
    if (request.action === 'yuumi_config_updated') {
        loadYuumiConfig(() => loadAndApply(true));
    }
});

// Expose for popup
window.__yuumiTables = {
    STORAGE_KEY,
    saveAndApply,
    getConfigs: () => YUUMI_CONFIG.visibleTables.map(c => c.config),
};

// ── Init ──────────────────────────────────────────────────────────────────────
yuumiReady(() => loadAndApply(true));