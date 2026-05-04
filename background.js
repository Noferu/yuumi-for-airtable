/**
 * Request Manager
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendToWebhook') {
        fetch(request.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.payload)
        })
        .then(res => {
            if (!res.ok) throw new Error();
            sendResponse({ success: true });
        })
        .catch(() => sendResponse({ success: false }))
        return true;
    }
});