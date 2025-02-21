document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('shortsToggle');
  const durationContainer = document.getElementById('durationContainer');
  const durationSelect = document.getElementById('duration');
  const timerDisplay = document.getElementById('timer');
  let timerInterval;
  let reEnableTimeout;

  // Load saved state
  chrome.storage.sync.get(['enabled', 'reEnableTime'], (result) => {
    const now = Date.now();
    if (result.reEnableTime && result.reEnableTime > now) {
      // If there's a pending re-enable time
      toggle.checked = false;
      durationContainer.style.display = 'none';
      timerDisplay.style.display = 'block';
      startTimer(result.reEnableTime - now);
    } else {
      toggle.checked = result.enabled === undefined ? true : result.enabled;
      durationContainer.style.display = toggle.checked ? 'block' : 'none';
      timerDisplay.style.display = 'block';
    }
  });

  function startTimer(duration) {
    clearInterval(timerInterval);
    clearTimeout(reEnableTimeout);

    const endTime = Date.now() + duration;
    
    function updateTimer() {
      const remaining = Math.max(0, endTime - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(timerInterval);
        reEnable();
      }
    }

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // Set timeout to re-enable
    reEnableTimeout = setTimeout(reEnable, duration);
  }

  function reEnable() {
    toggle.checked = true;
    timerDisplay.textContent = '';
    timerDisplay.style.display = 'none';
    durationContainer.style.display = 'block';
    chrome.storage.sync.remove('reEnableTime');
    chrome.storage.sync.set({ enabled: true });
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { enabled: true })
          .catch(error => {
            console.log('Could not send message to content script:', error);
          });
      }
    });
  }

  // Handle toggle changes
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    
    if (enabled) {
      // Clear any existing timers when manually enabled
      clearInterval(timerInterval);
      clearTimeout(reEnableTimeout);
      chrome.storage.sync.remove('reEnableTime');
      timerDisplay.textContent = '';
      durationContainer.style.display = 'block';
      timerDisplay.style.display = 'none';
    } else {
      // Start timer with pre-selected duration
      durationContainer.style.display = 'none';
      timerDisplay.style.display = 'block';
      const duration = durationSelect.value * 60000; // Convert minutes to milliseconds
      const reEnableTime = Date.now() + duration;
      chrome.storage.sync.set({ reEnableTime });
      startTimer(duration);
    }

    chrome.storage.sync.set({ enabled });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { enabled })
          .catch(error => {
            console.log('Could not send message to content script:', error);
          });
      }
    });
  });

  // Handle duration changes
  durationSelect.addEventListener('change', () => {
    if (!toggle.checked) {
      const duration = durationSelect.value * 60000;
      const reEnableTime = Date.now() + duration;
      chrome.storage.sync.set({ reEnableTime });
      startTimer(duration);
    }
  });
});