/**
 * Request Manager
 * Relays webhook POST requests from content scripts (which can't use fetch
 * cross-origin directly) to Airtable webhooks.
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'sendToWebhook') {
        fetch(request.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload)
        })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            sendResponse({ success: true });
        })
        .catch(err => {
            console.warn('[Yuumi] Webhook failed:', err.message);
            sendResponse({ success: false });
        });
        return true; // keep message channel open for async response
    }
});