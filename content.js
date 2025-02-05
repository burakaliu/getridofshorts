console.log('Content script loaded');

// Extension state
let isEnabled = true;

// CSS selectors for Shorts-related elements
const shortsSelectors = [
    'a[href*="/shorts"]',  // Shorts links
    'ytd-reel-shelf-renderer',  // Shorts shelf in home page
    'ytd-mini-guide-entry-renderer a[title="Shorts"]',  // Shorts in mini guide
    'ytd-guide-entry-renderer a[title="Shorts"]',  // Shorts in main guide
    '[is-shorts]',  // Elements marked as Shorts
    'ytd-rich-grid-row ytd-rich-item-renderer:has(a[href*="/shorts"])',  // Grid items that are Shorts
    '[page-subtype="shorts"]'  // Shorts page elements
];

// Function to hide Shorts elements
function hideShorts() {
    shortsSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.style.display = 'none';
        });
    });
}

// Load initial state
chrome.storage.sync.get(['enabled'], (result) => {
    isEnabled = result.enabled === undefined ? true : result.enabled;
    if (isEnabled) {
        hideShorts();
    }
});

// Notify that content script is ready
chrome.runtime.sendMessage({ type: 'CONTENT_SCRIPT_READY' });

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.enabled !== undefined) {
        isEnabled = message.enabled;
        if (isEnabled) {
            hideShorts();
        } else {
            // Show all hidden shorts
            shortsSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    element.style.display = '';
                });
            });
        }
    }
    // Always send a response to confirm message was received
    sendResponse({ received: true });
    return true; // Keep the message channel open for async response
});

// Create MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length && isEnabled) {
            hideShorts();
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Clean up observer when the page is unloaded
window.addEventListener('unload', () => {
    observer.disconnect();
});