# JADE STUDIO hosting

Publish the same restored site to GitHub Pages, Tencent CloudBase and Cloudflare.
The GitHub workflow remains the source of the archive checksum and extraction steps.

1. Concatenate the numbered `jade-site-v9.tar.gz.part-*` files in order and verify
   SHA256 `14f95aa254aa9b62a8c0601abca45fbf0edf6927413dfa57f4ca5c3ff8a8db09`.
2. Extract into `tmp/site-preview` with `--strip-components=1`, then copy the entire
   contents of `overrides/` on top, preserving paths.
3. Upload the complete directory first:
   `tcb hosting deploy ./tmp/site-preview /jade --env-id fbti-preview-d6gsc6s08060a75ee --json`
   Do not deploy to `/`: that environment also hosts FBTI and another portfolio.
4. Copy `deploy/cloudflare/assetsignore` to `tmp/site-preview/.assetsignore`.
5. Deploy with `wrangler deploy --config deploy/cloudflare/wrangler.jsonc`.

Cloudflare serves HTML, scripts, fonts and images as static assets. The Worker
forwards project documents and videos to the same relative path under Tencent's
`/jade` directory. This avoids large duplicate uploads and Cloudflare's asset size
limit. Range and conditional request headers are forwarded. No credentials are
needed by the deployed Worker.

Public endpoints:

- GitHub: https://chulanzhang659-spec.github.io/jade-studio-links/
- Cloudflare: https://jade-studio.fbti-bureau.workers.dev/
- Custom domain: https://chulanzhang.cn/
- Tencent: https://fbti-preview-d6gsc6s08060a75ee-1526099639.tcloudbaseapp.com/jade/

Tencent's platform-provided domain may show a test-domain confirmation page.
The separate `jade.chulanzhang.cn` subdomain belongs to the typewriter portfolio;
preserve its DNS record and do not bind it to this Worker.

After publishing, check `work.html?project=portfolio-04&type=%E8%84%9A%E6%9C%AC`:
it must show nine scripts, no topic filters, loaded previews, and working individual
PDF links. Verify at least one proxied PDF returns PDF content, not an HTML notice.
