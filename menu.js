/**
 * Managing the insertion of links in the Airtable top bar
 */
function injectMenu(nav) {
    if (nav.querySelector('[data-app="sep"]')) return;

    const separator = document.createElement('li');
    separator.setAttribute('data-app', 'sep');
    separator.style.cssText = 'width:1px;background:currentColor;opacity:0.15;margin:8px 4px';
    nav.appendChild(separator);

    YUUMI_CONFIG.menuLinks.forEach(({ label, url }) => {
        const li = document.createElement('li');
        li.setAttribute('data-app', 'link');
        li.innerHTML = `
        <a class="relative flex height-full items-center" href="${url}" target="_blank">
            <p class="font-family-default text-size-default line-height-4 font-weight-strong py2 colors-foreground-subtle colors-foreground-default-hover" style="white-space:nowrap">${label}</p>
            <div class="absolute right-0 left-0 animate yellow-dark1" style="bottom:-1px;height:0px;"></div>
        </a>`;
        nav.appendChild(li);
    });
}

function initMenu() {
    const observer = new MutationObserver(() => {
        const nav = document.querySelector('[data-tutorial-selector-id="appTopBarNavigationItems"]');
        if (nav) injectMenu(nav);
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function waitForConfig(callback, retries = 20) {
    if (typeof YUUMI_CONFIG !== 'undefined') {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForConfig(callback, retries - 1), 50);
    } else {
        console.warn('[Yuumi] menu.js : YUUMI_CONFIG introuvable après attente.');
    }
}

waitForConfig(initMenu);