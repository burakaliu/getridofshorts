document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shortsToggle');

  // Load saved state
  chrome.storage.sync.get(['enabled'], (result) => {
    toggle.checked = result.enabled === undefined ? true : result.enabled;
  });

  // Save state changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ enabled });

    // Send message to content script with error handling
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { enabled })
          .catch(error => {
            console.log('Could not send message to content script:', error);
          });
      }
    });
  });
});