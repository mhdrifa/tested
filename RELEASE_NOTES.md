# Black Brand — pre-launch review (20 November 2026)

## Changes prepared

- Updated the homepage hero strapline to **CEYLON COUTURE ATELIER • KALPITIYA TO ALL SRI LANKA**.
- Added subtle hero entrance animations, staggered Best Sellers cards, responsive hover feedback, and reduced-motion support.
- Added scroll-triggered section reveals and unobtrusive admin hover feedback.
- Admin Store Settings now verifies a saved value by immediately reading it back; mismatches display an error rather than a false success toast.

- Added your BB logo as the site's favicon and header mark.
- Corrected invalid Windows-only favicon path.
- Updated the visible phone number to +94 77 049 8004 and WhatsApp button to your supplied link.
- Storefront header/footer contact information can refresh from public settings returned by the backend; known stale legacy defaults are ignored.
- Updated new Apps Script default phone, WhatsApp and site URL. Existing Google Sheet settings must still be edited manually.
- Removed hardcoded homepage metrics and several unsupported logistics claims.
- Added basic Vercel response headers and admin no-index rule.

## IMPORTANT: not yet verified

1. **Backend deployment:** `Code.gs` is not deployed by Vercel. Copy it to your actual Google Apps Script project and deploy **New version** after review. Do not run a second `setup()` without checking existing sheet configuration.
2. **Existing settings:** In Admin → Store Settings, edit the existing `public.contact_phone` to `+94 77 049 8004`, `public.whatsapp_url` to `https://wa.me/message/IFADOYDEKWLEA1`, and `public.site_url` to `https://blackbrand.com.lk`. Changing the script defaults alone does not change old rows.
3. **Admin saves:** Log in and save an innocuous temporary setting, refresh the admin page, then check the exact Google Sheet row. If it disappears, inspect `saveSetting` API response, the published script version, owner role, and the Sheet ID configured in Script Properties.
4. **Checkout:** Test real district shipping options, order creation, stock decrements, confirmation emails (if enabled), COD/bank payment and payment return. Do not perform real card transactions until the payment provider is configured.
5. **Policy and claims:** Size measurements, shipping timelines, delivery/return promises, privacy and terms pages contain template content needing business and legal approval. Do not advertise unconfirmed policies.
6. **Domain:** Add `blackbrand.com.lk` and optionally `www.blackbrand.com.lk` in Vercel → Project → Domains. Add the DNS records Vercel provides at your registrar. Verify both HTTPS and primary-domain redirect.
7. **Deployment:** This package is not pushed to GitHub or deployed. Upload/commit it to the selected repository and check a new production deployment before launch.

## Tests completed

- JavaScript syntax (`node --check`) for all frontend scripts and Apps Script.
- `vercel.json` parsing.
- `node tests/unit.cjs` — 7 backend/branding unit cases passed.
- `node tests/api-integration.cjs` — 3 API client contract cases passed with mocked network responses.
- `node tests/assets.cjs` — 17 local asset references verified; responsive CSS breakpoints and reduced-motion rules checked.
- `tests/smoke.cjs` provides five viewport smoke tests (320, 375, 768, 1440 and 1920 px) plus mocked admin settings save flow, but **could not be executed** in this workspace because Chromium's process/socket creation was denied by the environment. This is not a passing browser test.

## Run responsive/browser tests on your laptop

1. From the extracted `blackbrand-release` directory run `python -m http.server 8765`.
2. In another terminal run `npm install --no-save playwright` if Playwright is unavailable.
3. Run `npx playwright install chromium` if needed, then `node tests/smoke.cjs`. On Windows the test uses Playwright's Chromium automatically.
4. Independently test actual sign-in, add/edit product, stock, Settings, shipping, cart and checkout against your real Apps Script connection.

Tests **not** completed: live backend/API, logged-in admin interactions, Google Sheets writes, payments, mobile browser accessibility, DNS, or production deployment.
