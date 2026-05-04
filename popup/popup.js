/**
 * Popup logic
 */
const STORAGE_KEY = 'yuumi_active_configs';

function waitForConfig(callback, retries = 20) {
    if (typeof YUUMI_CONFIG !== 'undefined') {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForConfig(callback, retries - 1), 50);
    }
}

waitForConfig(() => {
    const configs = YUUMI_CONFIG.visibleTables.map(c => c.config);
    const list = document.getElementById('configs-list');

    chrome.storage.sync.get(STORAGE_KEY, (result) => {
        const active = result[STORAGE_KEY] || [];

        configs.forEach(name => {
            const item = document.createElement('div');
            item.className = 'config-item';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = `cfg-${name}`;
            cb.checked = active.includes(name);

            const label = document.createElement('label');
            label.htmlFor = `cfg-${name}`;
            label.textContent = name;

            item.appendChild(cb);
            item.appendChild(label);

            item.addEventListener('click', (e) => {
                if (e.target !== cb) cb.checked = !cb.checked;
                saveState();
            });

            list.appendChild(item);
        });

        updateHint(active);
    });

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
});