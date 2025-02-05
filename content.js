console.log('Content script loaded and initialized');

// Function to check if current URL is a Shorts URL
function isShortUrl() {
  return window.location.href.includes('/shorts/');
}

// Hide Shorts-related elements from the YouTube interface
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded event fired');

  // Function to hide Shorts elements
  function hideShorts() {
    console.log('Running hideShorts function...');

    // Hide Shorts tab in navigation
    const shortsTab = document.querySelector('a[title="Shorts"], ytd-guide-entry-renderer[title="Shorts"]');
    if (shortsTab) {
      console.log('Found Shorts tab in navigation, hiding it');
      shortsTab.style.display = 'none';
    } else {
      console.log('Shorts tab not found in navigation');
    }

    // Hide Shorts in recommendations
    const shortsElements = document.querySelectorAll('a[href*="/shorts/"], ytd-reel-shelf-renderer');
    console.log(`Found ${shortsElements.length} Shorts elements in recommendations`);

    shortsElements.forEach((element, index) => {
      const container = element.closest('ytd-video-renderer, ytd-rich-item-renderer, ytd-reel-item-renderer, ytd-shelf-renderer');
      if (container) {
        console.log(`Hiding Shorts container ${index + 1}`);
        container.style.display = 'none';
      }
    });
  }

  // Run initially after a short delay to ensure YouTube's content is loaded
  setTimeout(() => {
    console.log('Running initial hideShorts');
    hideShorts();
  }, 1000);

  // Create an observer to handle dynamically loaded content
  const observer = new MutationObserver((mutations) => {
    console.log('Mutation observed, running hideShorts');
    hideShorts();
    
    // Check if we're on a Shorts page and redirect
    if (isShortUrl()) {
      console.log('Shorts URL detected, redirecting...');
      window.location.href = 'https://www.youtube.com';
    }
  });

  // Monitor URL changes (for YouTube's SPA navigation)
  const oldHref = window.location.href;
  const bodyObserver = new MutationObserver(() => {
    if (oldHref !== window.location.href) {
      console.log('URL changed:', window.location.href);
      if (isShortUrl()) {
        console.log('Shorts URL detected after navigation, redirecting...');
        window.location.href = 'https://www.youtube.com';
      }
      hideShorts();
    }
  });

  // Start observing with a delay to ensure YouTube's content is loaded
  setTimeout(() => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    console.log('MutationObserver started');
  }, 1500);
});