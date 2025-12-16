// @ts-check

/**
 * Initialize GitHub OAuth flow
 * Redirects the user to the GitHub OAuth authorization page
 */
function initiateGitHubOAuth() {
  // Redirect to our server endpoint that will handle the OAuth flow
  window.location.href = '/auth/github/start';
}

/**
 * Initialize Google OAuth flow
 * Redirects the user to the Google OAuth authorization page
 */
function initiateGoogleOAuth() {
  // Redirect to our server endpoint that will handle the OAuth flow
  window.location.href = '/auth/google/start';
}

/**
 * Set up event listeners when the DOM is ready
 */
function initializeAuthPage() {
  // Find the GitHub OAuth button
  const githubButton = document.querySelector('.btn-github');
  if (githubButton) {
    githubButton.addEventListener('click', initiateGitHubOAuth);
  }

  // Find the Google OAuth button
  const googleButton = document.querySelector('.btn-google');
  if (googleButton) {
    googleButton.addEventListener('click', initiateGoogleOAuth);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAuthPage);
} else {
  // DOM is already ready
  initializeAuthPage();
}
