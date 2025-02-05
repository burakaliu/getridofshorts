console.log('Background script initialized');

// Listen for navigation events and tab updates
chrome.webNavigation.onBeforeNavigate.addListener(
  function(details) {
    console.log('Navigation detected:', details.url);
    
    // Check if the URL contains '/shorts/'
    if (details.url.includes('/shorts/')) {
      console.log('Shorts URL detected, redirecting...');
      // Get the tab ID and redirect to the main YouTube page
      chrome.tabs.update(details.tabId, {
        url: 'https://www.youtube.com'
      }).then(() => {
        console.log('Successfully redirected from Shorts');
      }).catch((error) => {
        console.error('Failed to redirect:', error);
      });
    }
  },
  {
    url: [{
      hostEquals: 'www.youtube.com'
    }]
  }
);

// Listen for tab updates to catch in-page navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && changeInfo.url.includes('/shorts/')) {
    console.log('Shorts URL detected in tab update:', changeInfo.url);
    chrome.tabs.update(tabId, {
      url: 'https://www.youtube.com'
    }).then(() => {
      console.log('Successfully redirected from Shorts (tab update)');
    }).catch((error) => {
      console.error('Failed to redirect:', error);
    });
  }
});