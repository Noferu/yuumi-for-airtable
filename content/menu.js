/**
 * Injects quick-access links into the Airtable top navigation bar.
 */

function injectMenu(nav) {
    if (nav.querySelector('[data-yuumi="sep"]')) return;

    const sep = document.createElement('li');
    sep.setAttribute('data-yuumi', 'sep');
    sep.style.cssText = 'width:1px;background:currentColor;opacity:0.15;margin:8px 4px';
    nav.appendChild(sep);

    YUUMI_CONFIG.menuLinks.forEach(({ label, url }) => {
        const li = document.createElement('li');
        li.setAttribute('data-yuumi', 'link');
        li.innerHTML = `
        <a class="relative flex height-full items-center" href="${url}" target="_blank">
            <p class="font-family-default text-size-default line-height-4 font-weight-strong py2 colors-foreground-subtle colors-foreground-default-hover" style="white-space:nowrap">${label}</p>
            <div class="absolute right-0 left-0 animate yellow-dark1" style="bottom:-1px;height:0px;"></div>
        </a>`;
        nav.appendChild(li);
    });
}

function teardownMenu(nav) {
    nav.querySelectorAll('[data-yuumi="sep"], [data-yuumi="link"]').forEach(el => el.remove());
}

function initMenu() {
    const observer = new MutationObserver(() => {
        const nav = document.querySelector('[data-tutorial-selector-id="appTopBarNavigationItems"]');
        if (nav) injectMenu(nav);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === 'yuumi_config_updated') {
            loadYuumiConfig(() => {
                const nav = document.querySelector('[data-tutorial-selector-id="appTopBarNavigationItems"]');
                if (nav) { teardownMenu(nav); injectMenu(nav); }
            });
        }
    });
}

// Uses shared yuumiReady from config.js (injected before this script)
yuumiReady(initMenu);