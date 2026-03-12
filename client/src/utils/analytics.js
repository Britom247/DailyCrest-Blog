export const trackEvent = (category, action, label = null, value = null) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Specific tracking functions
export const trackPostView = (postTitle, postId) => {
  trackEvent('Post', 'View', postTitle, postId);
};

export const trackNewsletterSignup = (email) => {
  trackEvent('Newsletter', 'Signup', email);
};

export const trackComment = (postTitle) => {
  trackEvent('Engagement', 'Comment', postTitle);
};

export const trackSearch = (searchTerm) => {
  trackEvent('Engagement', 'Search', searchTerm);
};