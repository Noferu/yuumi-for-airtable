/**
 * Popup logic
 *
 * State ownership:
 *   tables.js (content script) owns chrome.storage.sync and visibility.
 *   The popup NEVER writes storage directly — it sends a message so tables.js
 *   can persist + apply atomically, preventing race conditions.
 */

const STORAGE_KEY = 'yuumi_active_configs';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

function bootstrap(callback) {
    if (typeof loadYuumiConfig === 'function') {
        loadYuumiConfig(callback);
    } else {
        let retries = 30;
        const t = setInterval(() => {
            if (typeof loadYuumiConfig === 'function') {
                clearInterval(t);
                loadYuumiConfig(callback);
            } else if (--retries <= 0) {
                clearInterval(t);
                console.warn('[Yuumi] popup.js : loadYuumiConfig introuvable.');
            }
        }, 50);
    }
}

// DOMContentLoaded fires before chrome APIs are guaranteed — use bootstrap
// which waits for config.js to expose loadYuumiConfig.
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logo').src = chrome.runtime.getURL('assets/icon48.png');
    bootstrap(() => {
        initMainView();
        initSettingsView();
    });
});

// ── Main view ─────────────────────────────────────────────────────────────────

function initMainView() {
    renderMainConfigs();

    document.getElementById('btn-open-settings').addEventListener('click', () => {
        document.getElementById('view-main').classList.remove('active');
        document.getElementById('view-settings').classList.add('active');
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
        clearAllConfigs();
    });

    // Keep UI in sync if the content script changes state (e.g. from another popup instance)
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'yuumi_state_changed') {
            refreshMainItems(request.activeConfigs);
            updateIndicator(request.activeConfigs);
            updateHint(request.activeConfigs);
        }
    });
}

function renderMainConfigs() {
    const configs = YUUMI_CONFIG.visibleTables.map(c => c.config);
    const list = document.getElementById('configs-list');
    list.innerHTML = '';

    chrome.storage.sync.get(STORAGE_KEY, (result) => {
        const active = result[STORAGE_KEY] || [];

        configs.forEach((name) => {
            const isActive = active.includes(name);
            const tableCount = YUUMI_CONFIG.visibleTables.find(c => c.config === name)?.tables.length ?? 0;

            const item = document.createElement('div');
            item.className = 'config-item' + (isActive ? ' active-item' : '');
            item.dataset.config = name;

            // Custom checkbox visual
            const checkbox = document.createElement('span');
            checkbox.className = 'config-checkbox';
            checkbox.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;

            const label = document.createElement('span');
            label.className = 'config-label';
            label.textContent = name;

            const count = document.createElement('span');
            count.className = 'config-count';
            count.textContent = `${tableCount} table${tableCount > 1 ? 's' : ''}`;

            item.appendChild(checkbox);
            item.appendChild(label);
            item.appendChild(count);

            // Entire row is clickable — toggle this config
            item.addEventListener('click', () => {
                const wasActive = item.classList.contains('active-item');
                item.classList.toggle('active-item', !wasActive);
                saveState();
            });

            list.appendChild(item);
        });

        updateIndicator(active);
        updateHint(active);
        updateClearButton(active);
    });
}

function refreshMainItems(active) {
    document.querySelectorAll('#configs-list .config-item').forEach(item => {
        const name = item.dataset.config;
        item.classList.toggle('active-item', active.includes(name));
    });
    updateClearButton(active);
}

/**
 * Collect active configs from the UI and delegate persistence to the
 * content script via message (tables.js is the storage owner).
 */
function saveState() {
    const checked = Array.from(
        document.querySelectorAll('#configs-list .config-item.active-item')
    ).map(item => item.dataset.config);

    updateIndicator(checked);
    updateHint(checked);
    updateClearButton(checked);

    sendToActiveTab({ action: 'yuumi_save_configs', activeConfigs: checked });
}

function clearAllConfigs() {
    document.querySelectorAll('#configs-list .config-item').forEach(item => {
        item.classList.remove('active-item');
    });
    updateIndicator([]);
    updateHint([]);
    updateClearButton([]);
    sendToActiveTab({ action: 'yuumi_save_configs', activeConfigs: [] });
}

function updateIndicator(active) {
    const indicator = document.getElementById('active-indicator');
    if (!indicator) return;

    if (!active || active.length === 0) {
        indicator.textContent = 'Tout visible';
        indicator.className = 'indicator indicator-empty';
    } else {
        indicator.textContent = active.join(' · ');
        indicator.className = 'indicator indicator-active';
    }
}

function updateHint(active) {
    const hint = document.getElementById('hint');
    if (!hint) return;
    hint.textContent = (!active || active.length === 0)
        ? 'Toutes les tables sont affichées'
        : `${active.length} configuration${active.length > 1 ? 's' : ''} active${active.length > 1 ? 's' : ''}`;
}

function updateClearButton(active) {
    const btn = document.getElementById('btn-clear-all');
    if (!btn) return;
    btn.classList.toggle('visible', active && active.length > 0);
}

// ── Settings view ─────────────────────────────────────────────────────────────

function initSettingsView() {
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('view-settings').classList.remove('active');
        document.getElementById('view-main').classList.add('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    renderLinksSettings();
    renderTablesSettings();
    renderPinnedSettings();

    document.getElementById('btn-add-link').addEventListener('click', () => appendLinkRow({ label: '', url: '' }));
    document.getElementById('btn-add-table-config').addEventListener('click', () => appendTableConfigRow({ config: '', tables: [] }));
    document.getElementById('btn-add-pinned').addEventListener('click', () => appendPinnedRow(''));

    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

    document.getElementById('btn-reset-all').addEventListener('click', () => {
        if (!confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) return;
        YUUMI_CONFIG_API.resetToDefaults(() => {
            renderLinksSettings();
            renderTablesSettings();
            renderPinnedSettings();
            broadcastConfigUpdate();
            renderMainConfigs();
            showSaveFeedback('Réinitialisé ✓');
        });
    });
}

// ── Links tab ─────────────────────────────────────────────────────────────────

function renderLinksSettings() {
    const container = document.getElementById('links-list');
    container.innerHTML = '';
    (YUUMI_CONFIG.menuLinks || []).forEach(link => appendLinkRow(link));
}

function appendLinkRow({ label = '', url = '' }) {
    const container = document.getElementById('links-list');
    const row = makeDraggableRow(container);
    row.innerHTML += `
        <input type="text" class="link-label" placeholder="Label" value="${escHtml(label)}" style="width:80px;flex:0 0 80px">
        <div class="row-sep"></div>
        <input type="text" class="link-url" placeholder="https://…" value="${escHtml(url)}">
        ${deleteBtn()}`;
    row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

// ── Tables tab ────────────────────────────────────────────────────────────────

function renderTablesSettings() {
    const container = document.getElementById('tables-list');
    container.innerHTML = '';
    (YUUMI_CONFIG.visibleTables || []).forEach(cfg => appendTableConfigRow(cfg));
}

function appendTableConfigRow({ config = '', tables = [] }) {
    const container = document.getElementById('tables-list');
    const row = makeDraggableRow(container);
    row.style.flexDirection = 'column';
    row.style.alignItems    = 'stretch';
    row.style.gap           = '4px';
    row.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
            <span class="drag-handle" draggable="true">⠿</span>
            <input type="text" class="cfg-name" placeholder="Nom de config" value="${escHtml(config)}" style="flex:1">
            ${deleteBtn()}
        </div>
        <input type="text" class="cfg-tables" placeholder="IDs de tables séparés par des virgules"
            value="${escHtml(tables.join(', '))}"
            style="font-size:10px;font-family:monospace">`;

    // Re-attach drag handle events (innerHTML resets them)
    attachDragEvents(row, container);
    row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

// ── Pinned tab ────────────────────────────────────────────────────────────────

function renderPinnedSettings() {
    const container = document.getElementById('pinned-list');
    container.innerHTML = '';
    (YUUMI_CONFIG.pinnedTables || []).forEach(id => appendPinnedRow(id));
}

function appendPinnedRow(id = '') {
    const container = document.getElementById('pinned-list');
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `
        <span class="table-id-tag">#</span>
        <input type="text" class="pinned-id" placeholder="tblXXXXXXXXXXXXXX" value="${escHtml(id)}" style="font-family:monospace;font-size:10px">
        ${deleteBtn()}`;
    row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

// ── Drag-and-drop reordering ──────────────────────────────────────────────────

let _dragSrc = null;

function makeDraggableRow(container) {
    const row = document.createElement('div');
    row.className = 'settings-row draggable';
    row.innerHTML = `<span class="drag-handle" draggable="true" aria-label="Réordonner">⠿</span>`;
    attachDragEvents(row, container);
    return row;
}

function attachDragEvents(row, container) {
    const handle = row.querySelector('.drag-handle');
    if (!handle) return;

    handle.addEventListener('mousedown', () => { row.draggable = true; });
    handle.addEventListener('mouseup',   () => { row.draggable = false; });

    row.addEventListener('dragstart', (e) => {
        _dragSrc = row;
        e.dataTransfer.effectAllowed = 'move';
        row.style.opacity = '0.4';
    });
    row.addEventListener('dragend', () => {
        row.draggable = false;
        row.style.opacity = '';
        container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (row !== _dragSrc) row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => row.classList.remove('drag-over'));
    row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');
        if (_dragSrc && _dragSrc !== row) {
            const rows = Array.from(container.querySelectorAll('.draggable'));
            const srcIdx  = rows.indexOf(_dragSrc);
            const destIdx = rows.indexOf(row);
            if (srcIdx < destIdx) container.insertBefore(_dragSrc, row.nextSibling);
            else container.insertBefore(_dragSrc, row);
        }
    });
}

// ── Save settings ─────────────────────────────────────────────────────────────

function saveSettings() {
    const menuLinks = Array.from(document.querySelectorAll('#links-list .settings-row')).map(row => ({
        label: row.querySelector('.link-label')?.value.trim() ?? '',
        url:   row.querySelector('.link-url')?.value.trim() ?? '',
    })).filter(l => l.label || l.url);

    const visibleTables = Array.from(document.querySelectorAll('#tables-list .settings-row')).map(row => ({
        config: row.querySelector('.cfg-name')?.value.trim() ?? '',
        tables: (row.querySelector('.cfg-tables')?.value ?? '').split(',').map(s => s.trim()).filter(Boolean),
    })).filter(c => c.config);

    const pinnedTables = Array.from(document.querySelectorAll('#pinned-list .pinned-id'))
        .map(i => i.value.trim()).filter(Boolean);

    YUUMI_CONFIG_API.saveLocal({ menuLinks, visibleTables, pinnedTables }, () => {
        broadcastConfigUpdate();
        renderMainConfigs();
        showSaveFeedback('Enregistré ✓');
    });
}

function broadcastConfigUpdate() {
    sendToActiveTab({ action: 'yuumi_config_updated' });
}

function showSaveFeedback(msg) {
    const btn = document.getElementById('btn-save-settings');
    const orig = btn.textContent;
    btn.textContent = msg;
    btn.style.opacity = '0.75';
    setTimeout(() => { btn.textContent = orig; btn.style.opacity = ''; }, 1800);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
        }
    });
}

function deleteBtn() {
    return `<button class="delete-btn" title="Supprimer">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
    </button>`;
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}