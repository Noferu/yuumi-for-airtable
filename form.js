/**
 * Independent overlay management for webhooks
 */
function injectFormOverlay(config) {
    if (document.getElementById('app-overlay-container')) return;

    const AT_FONT  = "'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const AT_BLUE  = '#166ee1';
    const AT_BLUE2 = '#0768f8';   // hover
    const AT_DARK  = '#181d26';
    const AT_MUTED = '#616670';
    const AT_BORDER= '#e5e9f0';
    const AT_BG    = '#ffffff';
    const AT_INPUT_BG = '#f2f4f8';

    const ICON_PLUS = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
    const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
    </svg>`;
    const ICON_CHECK = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 8.5L6.5 12.5L13.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    const container = document.createElement('div');
    container.id = 'app-overlay-container';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: ${AT_FONT};
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    `;

    const fieldsHtml = config.fields.map(field => `
        <div style="margin-bottom: 10px;">
            <label style="
                display: block;
                font-weight: 500;
                font-size: 11px;
                color: ${AT_MUTED};
                margin-bottom: 5px;
                letter-spacing: 0.04em;
                text-transform: uppercase;
            ">${field}</label>
            <input type="text" data-field="${field}" placeholder=""
                style="
                    display: block;
                    width: 100%;
                    padding: 7px 10px;
                    font-size: 13px;
                    font-family: ${AT_FONT};
                    color: ${AT_DARK};
                    background: ${AT_INPUT_BG};
                    border: 1.5px solid ${AT_BORDER};
                    border-radius: 6px;
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
                "
                onfocus="this.style.borderColor='${AT_BLUE}'; this.style.boxShadow='0 0 0 3px rgba(22,110,225,0.12)'; this.style.background='#fff'"
                onblur="this.style.borderColor='${AT_BORDER}'; this.style.boxShadow='none'; this.style.background='${AT_INPUT_BG}'"
            />
        </div>
    `).join('');

    container.innerHTML = `
        <div id="app-form-panel" style="
            display: none;
            background: ${AT_BG};
            border: 1px solid ${AT_BORDER};
            border-radius: 10px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 24px -4px rgba(0,0,0,0.12);
            width: 296px;
            box-sizing: border-box;
            overflow: hidden;
        ">
            <!-- Header -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 14px 16px 12px;
                border-bottom: 1px solid ${AT_BORDER};
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="
                        width: 24px; height: 24px;
                        background: ${AT_BLUE};
                        border-radius: 6px;
                        display: flex; align-items: center; justify-content: center;
                        color: white; flex-shrink: 0;
                    ">${ICON_PLUS}</div>
                    <span style="font-size: 13px; font-weight: 600; color: ${AT_DARK}; line-height: 1;">
                        ${config.title || 'Création rapide'}
                    </span>
                </div>
                <button id="app-close-panel" style="
                    background: none; border: none;
                    color: ${AT_MUTED}; cursor: pointer;
                    width: 24px; height: 24px;
                    border-radius: 4px;
                    display: flex; align-items: center; justify-content: center;
                    padding: 0;
                    transition: background 0.1s, color 0.1s;
                "
                onmouseover="this.style.background='#f2f4f8'; this.style.color='${AT_DARK}'"
                onmouseout="this.style.background='none'; this.style.color='${AT_MUTED}'"
                >${ICON_CLOSE}</button>
            </div>
            <!-- Body -->
            <div style="padding: 14px 16px 4px;">${fieldsHtml}</div>
            <!-- Footer -->
            <div style="padding: 8px 16px 14px;">
                <button id="app-submit-btn" style="
                    width: 100%;
                    background: ${AT_BLUE};
                    color: white;
                    border: none;
                    padding: 0 14px;
                    height: 32px;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: ${AT_FONT};
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    transition: background 0.15s;
                    box-sizing: border-box;
                "
                onmouseover="this.style.background='${AT_BLUE2}'"
                onmouseout="this.style.background='${AT_BLUE}'"
                >
                    Envoyer
                </button>
                <div id="app-feedback" style="margin-top: 8px; font-size: 12px; text-align: center; min-height: 18px; color: ${AT_MUTED};"></div>
            </div>
        </div>

        <!-- FAB pill button -->
        <button id="app-toggle-btn" style="
            background: ${AT_BLUE};
            color: white;
            border: none;
            border-radius: 20px;
            height: 36px;
            padding: 0 14px 0 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            font-family: ${AT_FONT};
            box-shadow: 0 2px 8px rgba(22,110,225,0.35), 0 1px 2px rgba(0,0,0,0.1);
            transition: background 0.15s, box-shadow 0.15s, transform 0.15s;
        "
        onmouseover="this.style.background='${AT_BLUE2}'; this.style.boxShadow='0 4px 12px rgba(22,110,225,0.45), 0 1px 3px rgba(0,0,0,0.12)'; this.style.transform='translateY(-1px)'"
        onmouseout="this.style.background='${AT_BLUE}'; this.style.boxShadow='0 2px 8px rgba(22,110,225,0.35), 0 1px 2px rgba(0,0,0,0.1)'; this.style.transform='translateY(0)'"
        >
            <span id="app-toggle-icon" style="display:flex; align-items:center; transition: transform 0.2s ease;">${ICON_PLUS}</span>
            <span id="app-toggle-label">Nouveau</span>
        </button>
    `;

    document.body.appendChild(container);

    const panel     = container.querySelector('#app-form-panel');
    const toggleBtn = container.querySelector('#app-toggle-btn');
    const submitBtn = container.querySelector('#app-submit-btn');
    const toggleIcon = container.querySelector('#app-toggle-icon');
    const toggleLabel = container.querySelector('#app-toggle-label');

    toggleBtn.onclick = () => {
        const isOpen = panel.style.display === 'block';
        panel.style.display = isOpen ? 'none' : 'block';
        toggleIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
        toggleLabel.textContent = isOpen ? 'Nouveau' : 'Fermer';
    };

    container.querySelector('#app-close-panel').onclick = () => {
        panel.style.display = 'none';
        toggleIcon.style.transform = 'rotate(0deg)';
        toggleLabel.textContent = 'Nouveau';
    };

    submitBtn.onclick = async () => {
        const feedback = container.querySelector('#app-feedback');
        const inputs = container.querySelectorAll('[data-field]');
        const payload = Array.from(inputs).reduce((acc, i) => ({ ...acc, [i.dataset.field]: i.value }), {});

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.textContent = 'Envoi en cours…';

        try {
            const resp = await chrome.runtime.sendMessage({ action: 'sendToWebhook', url: config.webhookUrl, payload });
            if (!resp?.success) throw new Error();
            feedback.style.color = '#048a0e';
            feedback.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;font-weight:500">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5L6.5 12.5L13.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Enregistré avec succès
            </span>`;
            inputs.forEach(i => i.value = '');
            setTimeout(() => {
                panel.style.display = 'none';
                feedback.textContent = '';
                toggleIcon.style.transform = 'rotate(0deg)';
                toggleLabel.textContent = 'Nouveau';
            }, 2000);
        } catch {
            feedback.style.color = '#dc043b';
            feedback.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;font-weight:500">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
                Échec de l'envoi
            </span>`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.textContent = 'Envoyer';
        }
    };
}

let _evalDebounceTimer = null;
function evaluateFormView() {
    clearTimeout(_evalDebounceTimer);
    _evalDebounceTimer = setTimeout(() => {
        if (!YUUMI_CONFIG?.forms) return;

        const active = YUUMI_CONFIG.forms.find(f => window.location.href.includes(f.detectUrl));
        const existing = document.getElementById('app-overlay-container');

        if (active) {
            if (!existing) injectFormOverlay(active);
        } else {
            if (existing) existing.remove();
        }
    }, 150);
}

function initForm() {
    const observer = new MutationObserver(evaluateFormView);
    observer.observe(document.body, { childList: true, subtree: true });

    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            evaluateFormView();
        }
    }, 500);

    evaluateFormView();
}

function waitForConfig(callback, retries = 20) {
    if (typeof YUUMI_CONFIG !== 'undefined') {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForConfig(callback, retries - 1), 50);
    } else {
        console.warn('[Yuumi] form.js : YUUMI_CONFIG introuvable après attente.');
    }
}

waitForConfig(initForm);