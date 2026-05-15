/**
 * Form overlay manager
 * Supports multiple simultaneous form overlays on the same page.
 * Each active form gets its own floating button + panel.
 */

const AT_FONT     = "'Inter Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const AT_BLUE     = '#166ee1';
const AT_BLUE2    = '#0768f8';
const AT_DARK     = '#181d26';
const AT_MUTED    = '#616670';
const AT_BORDER   = '#e5e9f0';
const AT_BG       = '#ffffff';
const AT_INPUT_BG = '#f2f4f8';

const ICON_PLUS = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const ICON_CLOSE = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`;

// ── Single overlay ────────────────────────────────────────────────────────────

function createOverlay(config, stackIndex) {
    const id = `yuumi-overlay-${stackIndex}`;
    if (document.getElementById(id)) return;

    // Stack multiple overlays: offset each one to the left of the previous
    const rightOffset = 20 + stackIndex * 58;

    const fieldsHtml = config.fields.map(field => `
        <div style="margin-bottom:10px;">
            <label style="display:block;font-weight:500;font-size:11px;color:${AT_MUTED};margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">${field}</label>
            <input type="text" data-field="${field}"
                style="display:block;width:100%;padding:7px 10px;font-size:13px;font-family:${AT_FONT};color:${AT_DARK};background:${AT_INPUT_BG};border:1.5px solid ${AT_BORDER};border-radius:6px;box-sizing:border-box;outline:none;transition:border-color .15s,box-shadow .15s,background .15s;"
                onfocus="this.style.borderColor='${AT_BLUE}';this.style.boxShadow='0 0 0 3px rgba(22,110,225,.12)';this.style.background='#fff'"
                onblur="this.style.borderColor='${AT_BORDER}';this.style.boxShadow='none';this.style.background='${AT_INPUT_BG}'"
            />
        </div>
    `).join('');

    const container = document.createElement('div');
    container.id = id;
    container.style.cssText = `
        position:fixed;bottom:20px;right:${rightOffset}px;z-index:999999;
        font-family:${AT_FONT};display:flex;flex-direction:column;align-items:flex-end;gap:8px;
    `;

    container.innerHTML = `
        <div id="${id}-panel" style="
            display:none;background:${AT_BG};border:1px solid ${AT_BORDER};
            border-radius:10px;
            box-shadow:0 4px 6px -1px rgba(0,0,0,.07),0 10px 24px -4px rgba(0,0,0,.12);
            width:296px;box-sizing:border-box;overflow:hidden;
        ">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 12px;border-bottom:1px solid ${AT_BORDER};">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:24px;height:24px;background:${AT_BLUE};border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">${ICON_PLUS}</div>
                    <span style="font-size:13px;font-weight:600;color:${AT_DARK};line-height:1;">${config.title || 'Création rapide'}</span>
                </div>
                <button id="${id}-close" style="background:none;border:none;color:${AT_MUTED};cursor:pointer;width:24px;height:24px;border-radius:4px;display:flex;align-items:center;justify-content:center;padding:0;transition:background .1s,color .1s;"
                    onmouseover="this.style.background='#f2f4f8';this.style.color='${AT_DARK}'"
                    onmouseout="this.style.background='none';this.style.color='${AT_MUTED}'"
                >${ICON_CLOSE}</button>
            </div>
            <div style="padding:14px 16px 4px;">${fieldsHtml}</div>
            <div style="padding:8px 16px 14px;">
                <button id="${id}-submit" style="
                    width:100%;background:${AT_BLUE};color:white;border:none;
                    padding:0 14px;height:32px;font-size:13px;font-weight:600;
                    font-family:${AT_FONT};border-radius:6px;cursor:pointer;
                    display:flex;align-items:center;justify-content:center;gap:6px;
                    transition:background .15s;box-sizing:border-box;
                "
                    onmouseover="this.style.background='${AT_BLUE2}'"
                    onmouseout="this.style.background='${AT_BLUE}'"
                >Envoyer</button>
                <div id="${id}-feedback" style="margin-top:8px;font-size:12px;text-align:center;min-height:18px;color:${AT_MUTED};"></div>
            </div>
        </div>

        <button id="${id}-toggle" style="
            background:${AT_BLUE};color:white;border:none;border-radius:20px;
            height:36px;padding:0 14px 0 10px;cursor:pointer;
            display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;
            font-family:${AT_FONT};
            box-shadow:0 2px 8px rgba(22,110,225,.35),0 1px 2px rgba(0,0,0,.1);
            transition:background .15s,box-shadow .15s,transform .15s;
        "
            onmouseover="this.style.background='${AT_BLUE2}';this.style.boxShadow='0 4px 12px rgba(22,110,225,.45),0 1px 3px rgba(0,0,0,.12)';this.style.transform='translateY(-1px)'"
            onmouseout="this.style.background='${AT_BLUE}';this.style.boxShadow='0 2px 8px rgba(22,110,225,.35),0 1px 2px rgba(0,0,0,.1)';this.style.transform='translateY(0)'"
        >
            <span id="${id}-icon" style="display:flex;align-items:center;transition:transform .2s ease;">${ICON_PLUS}</span>
            <span id="${id}-label">${config.title ? config.title.replace(/^Ajouter /, '') : 'Nouveau'}</span>
        </button>
    `;

    document.body.appendChild(container);

    const panel  = container.querySelector(`#${id}-panel`);
    const toggle = container.querySelector(`#${id}-toggle`);
    const submit = container.querySelector(`#${id}-submit`);
    const icon   = container.querySelector(`#${id}-icon`);
    const label  = container.querySelector(`#${id}-label`);
    const baseLabel = label.textContent;

    function openPanel() {
        panel.style.display = 'block';
        icon.style.transform = 'rotate(45deg)';
        label.textContent = 'Fermer';
    }
    function closePanel() {
        panel.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        label.textContent = baseLabel;
    }

    toggle.onclick = () => panel.style.display === 'block' ? closePanel() : openPanel();
    container.querySelector(`#${id}-close`).onclick = closePanel;

    submit.onclick = async () => {
        const feedback = container.querySelector(`#${id}-feedback`);
        const inputs   = container.querySelectorAll('[data-field]');
        const payload  = Array.from(inputs).reduce((acc, i) => ({ ...acc, [i.dataset.field]: i.value }), {});

        submit.disabled = true;
        submit.style.opacity = '0.7';
        submit.textContent = 'Envoi en cours…';

        try {
            const resp = await chrome.runtime.sendMessage({
                action: 'sendToWebhook',
                url: config.webhookUrl,
                payload
            });
            if (!resp?.success) throw new Error();

            feedback.style.color = '#048a0e';
            feedback.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;font-weight:500">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2.5 8.5L6.5 12.5L13.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Enregistré avec succès
            </span>`;
            inputs.forEach(i => i.value = '');
            setTimeout(() => { closePanel(); feedback.textContent = ''; }, 2000);
        } catch {
            feedback.style.color = '#dc043b';
            feedback.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;font-weight:500">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
                Échec de l'envoi
            </span>`;
        } finally {
            submit.disabled = false;
            submit.style.opacity = '1';
            submit.textContent = 'Envoyer';
        }
    };
}

function removeOverlay(stackIndex) {
    document.getElementById(`yuumi-overlay-${stackIndex}`)?.remove();
}

// ── URL matching ──────────────────────────────────────────────────────────────

function getMatchingForms() {
    if (!YUUMI_CONFIG?.forms) return [];
    return YUUMI_CONFIG.forms.filter(form => {
        const urls = Array.isArray(form.detectUrl) ? form.detectUrl : [form.detectUrl];
        return urls.some(u => window.location.href.includes(u));
    });
}

// ── Evaluation (debounced) ────────────────────────────────────────────────────

let _evalTimer = null;

function evaluateForms() {
    clearTimeout(_evalTimer);
    _evalTimer = setTimeout(() => {
        const active = getMatchingForms();

        // Remove overlays that are no longer needed
        const maxOverlays = Math.max(active.length, 10);
        for (let i = 0; i < maxOverlays; i++) {
            if (i >= active.length) removeOverlay(i);
        }

        // Create overlays for matching forms
        active.forEach((form, i) => createOverlay(form, i));
    }, 150);
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initForm() {
    // Watch DOM changes (Airtable is a SPA)
    const observer = new MutationObserver(evaluateForms);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also poll for URL changes (SPA navigation doesn't fire MutationObserver reliably)
    let lastUrl = location.href;
    const urlPoller = setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            evaluateForms();
        }
    }, 500);

    // Cleanup on unload
    window.addEventListener('unload', () => {
        observer.disconnect();
        clearInterval(urlPoller);
    }, { once: true });

    evaluateForms();

    // Re-evaluate when config is updated from popup
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'yuumi_config_updated') {
            loadYuumiConfig(() => evaluateForms());
        }
    });
}

yuumiReady(initForm);