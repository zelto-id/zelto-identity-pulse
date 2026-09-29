/* The welcome page always offers both choices, including on a return visit. */
(() => {
  const params = new URLSearchParams(location.search);
  const provider = params.get('provider') === 'okta' ? 'okta' : 'auth0';
  const sample = ['risk', 'healthy', 'partial'].includes(params.get('sample')) ? params.get('sample') : 'risk';
  document.querySelectorAll('[data-enter]').forEach(link => {
    const url = new URL(link.getAttribute('href'), location.href);
    url.searchParams.set('provider', provider);
    url.searchParams.set('sample', sample);
    link.setAttribute('href', 'workspace.html' + url.search);
  });
})();
