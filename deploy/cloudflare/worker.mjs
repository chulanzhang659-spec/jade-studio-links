const hostedDocuments = /^\/assets\/projects\/[^?#]+\.(?:m4v|mp4|pdf|docx|pptx|xlsx)$/i;
const mirror = 'https://fbti-preview-d6gsc6s08060a75ee-1526099639.tcloudbaseapp.com/jade';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (!hostedDocuments.test(url.pathname)) return env.ASSETS.fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status: 405});
    const headers = new Headers();
    for (const name of ['range', 'if-none-match', 'if-modified-since']) {
      if (request.headers.has(name)) headers.set(name, request.headers.get(name));
    }
    return fetch(mirror + url.pathname, {method: request.method, headers});
  },
};
