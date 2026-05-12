/**
 * Popup logic
 */
const STORAGE_KEY = 'yuumi_active_configs';

// ─── Bootstrap: wait for loadYuumiConfig (defined in config.js) ──────────────
// YUUMI_CONFIG starts as null; calling loadYuumiConfig ensures it is populated
// before any popup code runs.  The old waitForConfig only checked typeof, which
// passed immediately against null and caused "Cannot read properties of null".

function bootstrap(callback) {
    if (typeof loadYuumiConfig === 'function') {
        loadYuumiConfig(callback);
    } else {
        // Fallback: config.js not yet evaluated – retry briefly
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

bootstrap(() => {
    initMainView();
    initSettingsView();
});

// ─── Main view ────────────────────────────────────────────────────────────────

function initMainView() {
    const configs = YUUMI_CONFIG.visibleTables.map(c => c.config);
    const list    = document.getElementById('configs-list');

    chrome.storage.sync.get(STORAGE_KEY, (result) => {
        const active = result[STORAGE_KEY] || [];

        configs.forEach(name => {
            const item = document.createElement('div');
            item.className = 'config-item' + (active.includes(name) ? ' active-item' : '');

            const cb = document.createElement('input');
            cb.type    = 'checkbox';
            cb.id      = `cfg-${name}`;
            cb.checked = active.includes(name);

            const label     = document.createElement('label');
            label.htmlFor   = `cfg-${name}`;
            label.textContent = name;

            item.appendChild(cb);
            item.appendChild(label);

            item.addEventListener('click', (e) => {
                if (e.target !== cb) cb.checked = !cb.checked;
                item.classList.toggle('active-item', cb.checked);
                saveState();
            });

            list.appendChild(item);
        });

        updateHint(active);
    });

    // Settings button → switch view
    document.getElementById('btn-open-settings').addEventListener('click', () => {
        document.getElementById('view-main').classList.remove('active');
        document.getElementById('view-settings').classList.add('active');
    });
}

function saveState() {
    const checked = Array.from(
        document.querySelectorAll('#configs-list input[type="checkbox"]:checked')
    ).map(cb => cb.id.replace('cfg-', ''));

    chrome.storage.sync.set({ [STORAGE_KEY]: checked });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'yuumi_update_configs',
                activeConfigs: checked
            });
        }
    });

    updateHint(checked);
}

function updateHint(active) {
    const hint = document.getElementById('hint');
    if (active.length === 0) {
        hint.textContent = 'Aucune sélection = tout afficher';
    } else {
        hint.textContent = `${active.length} config${active.length > 1 ? 's' : ''} active${active.length > 1 ? 's' : ''}`;
    }
}

// ─── Settings view ────────────────────────────────────────────────────────────

function initSettingsView() {
    // ── Back button
    document.getElementById('btn-back').addEventListener('click', () => {
        document.getElementById('view-settings').classList.remove('active');
        document.getElementById('view-main').classList.add('active');
    });

    // ── Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // ── Populate from current config
    renderLinksSettings();
    renderTablesSettings();
    renderPinnedSettings();

    // ── Add buttons
    document.getElementById('btn-add-link').addEventListener('click', () => {
        appendLinkRow({ label: '', url: '' });
    });

    document.getElementById('btn-add-table-config').addEventListener('click', () => {
        appendTableConfigRow({ config: '', tables: [] });
    });

    document.getElementById('btn-add-pinned').addEventListener('click', () => {
        appendPinnedRow('');
    });

    // ── Save
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);

    // ── Reset all
    document.getElementById('btn-reset-all').addEventListener('click', () => {
        if (!confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) return;
        YUUMI_CONFIG_API.resetToDefaults(() => {
            renderLinksSettings();
            renderTablesSettings();
            renderPinnedSettings();
            broadcastConfigUpdate();
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
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.innerHTML = `
        <input type="text" class="link-label" placeholder="Label" value="${escHtml(label)}" style="width:80px;flex:0 0 80px">
        <div class="row-sep"></div>
        <input type="text" class="link-url" placeholder="https://…" value="${escHtml(url)}">
        <button class="delete-btn" title="Supprimer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
        </button>`;
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
    const row = document.createElement('div');
    row.className = 'settings-row';
    row.style.flexDirection = 'column';
    row.style.alignItems    = 'stretch';
    row.style.gap           = '4px';
    row.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px">
            <input type="text" class="cfg-name" placeholder="Nom de config" value="${escHtml(config)}" style="flex:1">
            <button class="delete-btn" title="Supprimer">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <input type="text" class="cfg-tables" placeholder="IDs de tables séparés par des virgules"
            value="${escHtml(tables.join(', '))}"
            style="font-size:10px;font-family:monospace">`;
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
        <button class="delete-btn" title="Supprimer">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
        </button>`;
    row.querySelector('.delete-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

// ── Save settings ─────────────────────────────────────────────────────────────

function saveSettings() {
    // Collect links
    const menuLinks = Array.from(document.querySelectorAll('#links-list .settings-row')).map(row => ({
        label: row.querySelector('.link-label').value.trim(),
        url:   row.querySelector('.link-url').value.trim(),
    })).filter(l => l.label || l.url);

    // Collect table configs
    const visibleTables = Array.from(document.querySelectorAll('#tables-list .settings-row')).map(row => ({
        config: row.querySelector('.cfg-name').value.trim(),
        tables: row.querySelector('.cfg-tables').value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
    })).filter(c => c.config);

    // Collect pinned
    const pinnedTables = Array.from(document.querySelectorAll('#pinned-list .pinned-id'))
        .map(i => i.value.trim())
        .filter(Boolean);

    YUUMI_CONFIG_API.saveLocal({ menuLinks, visibleTables, pinnedTables }, () => {
        broadcastConfigUpdate();
        showSaveFeedback('Enregistré ✓');
    });
}

function broadcastConfigUpdate() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'yuumi_config_updated' });
        }
    });
}

function showSaveFeedback(msg) {
    const btn = document.getElementById('btn-save-settings');
    const orig = btn.textContent;
    btn.textContent = msg;
    btn.style.opacity = '0.75';
    setTimeout(() => {
        btn.textContent = orig;
        btn.style.opacity = '';
    }, 1800);
}

// ── Util ──────────────────────────────────────────────────────────────────────

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}