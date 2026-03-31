// Boot the app
document.addEventListener('DOMContentLoaded', () => {
  // Check if admin route
  if (location.hash === '#admin' || location.pathname.endsWith('/admin')) {
    Router.go('admin');
    return;
  }
  Router.go('splash');
});

// Handle browser back button
window.addEventListener('popstate', () => {
  if (location.hash === '#admin') {
    Router.go('admin');
  }
});
