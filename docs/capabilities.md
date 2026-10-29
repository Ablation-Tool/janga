# JANGA Capability Reference

JANGA organizes Amazon.com search results in Chrome and Edge. It changes how product cards appear after Amazon delivers them. It is not an ad blocker and does not submit reports to Amazon.

Each capability below links back to the [README overview](../README.md#capabilities) and relevant implementation files.

## Sponsored Result Organization

### Original Placement

**Show in original positions** keeps detected sponsored cards in Amazon's result sequence. JANGA records each card's original position so cards moved by another mode can be restored.

This mode does not suppress Amazon's sponsored placement or change its price order. It provides a baseline for switching between display modes without reloading the search.

Implementation: [`content.js`](../content.js).

### Separate Sponsored Section

**Separate below organic results** moves sponsored cards into a native collapsible `<details>` section below the organic result list. The section summary reports how many sponsored cards are loaded.

Moving a card does not delete it or report it to Amazon. Open the section to inspect sponsored products or undo a manual sponsored mark.

Implementation: [`content.js`](../content.js) and [`content.css`](../content.css).

### Persistent Hide Mode

**Hide on every search** applies `display: none` to sponsored cards and saves that mode as a preference. The setting applies to initial results, cards added dynamically, and cards loaded from later pages.

The preference persists through browser extension storage. It affects sponsored product cards only; brand banners and advertising modules outside the result list remain visible.

Implementation: [`content.js`](../content.js) and [`options.js`](../options.js).

### Manual Sponsored Marks

Organic cards include **Mark as sponsored** for sponsored placements that automatic detection misses. JANGA stores the product's ASIN in `manualSponsoredAsins` and applies the current Show, Separate, or Hide mode to it.

To reverse a manual mark, load the product and choose **Undo sponsored mark**. In Hide mode the card is not visible, so switch to Separate mode first. Automatic Amazon-detected sponsored cards do not offer an organic override.

Marks are per ASIN and persist across searches. There is currently no bulk-clear control for all manual marks.

Implementation: [`content.js`](../content.js).

### Organic Duplicate Preference

Amazon can return sponsored and organic cards with the same ASIN. JANGA keeps the organic card in that case instead of discarding it as a duplicate. This prevents Hide mode from removing the only organic presentation of a product.

When duplicate cards have the same sponsorship state, JANGA keeps the first card encountered. Organic replacement works on both the initial page and fetched pages.

Implementation: [`content.js`](../content.js).

## Result Expansion & Price Ordering

### Selectable Result Counts

JANGA offers Amazon's default plus targets of 10, 100, 200, and 300 organic products. Sponsored cards do not count toward these targets.

If more organic cards are loaded than requested, JANGA hides the excess rather than deleting them. If fewer are loaded, it requests more pages until it reaches the target, encounters an end condition, or reaches its request limit.

Implementation: [`content.js`](../content.js) and [`options.html`](../options.html).

### Successive-Page Loading

For larger targets, JANGA updates the current search URL's `page` parameter and requests successive same-origin Amazon pages with the existing browser session. Cards are imported, normalized, deduplicated, and appended to the current result list.

Loads are sequential and capped at 30 page requests per operation. **Stop loading** aborts the active request and keeps products already loaded. Larger targets can take longer and use more memory.

Implementation: [`content.js`](../content.js).

### ASIN Deduplication

Every tracked product is indexed by its ASIN. JANGA skips repeated products when combining pages, subject to the organic-preference rule above.

An empty ASIN cannot be tracked as a product card. Deduplication does not compare product variations, prices, sellers, or shipping offers.

Implementation: [`content.js`](../content.js).

### Displayed-Price Sorting

JANGA can sort loaded organic cards by the first usable displayed price, low to high or high to low. Products without a usable price remain last.

Sorting covers loaded products only. It does not establish the lowest price across Amazon, include shipping or coupons, select variations, or calculate Subscribe & Save pricing. Returning to Amazon's order restores the recorded card sequence.

Implementation: [`content.js`](../content.js).

### Access-Control Handling

JANGA checks HTTP status, response content type, and Amazon CAPTCHA or Robot Check markup before importing cards. It stops and reports an error when a response is unusable.

It does not solve CAPTCHAs, bypass rate limits, rotate identities, or retry through another host. Wait for Amazon to allow normal browsing or reduce the requested result count.

Implementation: [`content.js`](../content.js).

## Languages, Preferences & Privacy

### Sponsored-Label Detection

JANGA combines Amazon sponsored-component selectors with exact label matching in scoped card elements. Supported labels are:

| Language | Sponsored label |
|:---|:---|
| English | `Sponsored` |
| Spanish | `Patrocinado` |
| Hindi | `प्रायोजित` |
| Mandarin, simplified | `赞助` |
| Mandarin, traditional | `贊助` |

Other languages or changed Amazon markup may be missed. Use **Mark as sponsored** for a missed product card. Detection does not cover separate brand banners or advertising modules outside the result list.

Implementation: [`content.js`](../content.js).

### Persistent Preferences

Display mode, result count, price order, and manually marked ASINs are stored with `chrome.storage.sync`. Settings normally persist across searches and may also synchronize through the user's browser account when browser sync is enabled.

Browser-managed synchronization can involve the browser vendor's infrastructure. JANGA does not operate a server or send this data to its developer. Storage failures are reported in the panel or options page, and changes remain active for the current page when possible.

Implementation: [`content.js`](../content.js) and [`options.js`](../options.js).

### Dynamic Results

A `MutationObserver` watches for product cards inserted, removed, or replaced after the initial scan. JANGA discards stale card records, classifies new cards, applies the current display mode, and updates manual controls.

Fetched cards have script elements removed before insertion. Lazy-loaded image attributes are normalized so imported products remain usable. JANGA does not inject third-party code into these cards.

Implementation: [`content.js`](../content.js).

### Minimal Permissions

The extension manifest requests only the `storage` permission and access to Amazon.com search pages. `panel.css` is exposed as a web-accessible resource to Amazon pages so the Shadow DOM panel can load its stylesheet.

JANGA does not request browsing history, tab management, native messaging, or broad access to every website. Search-page fetches remain same-origin and use the browser's existing Amazon session.

Implementation: [`manifest.json`](../manifest.json).

### Local Operation

JANGA has no runtime package dependencies, analytics, remote code, third-party tracking, or developer-operated data collection. Product organization and price sorting happen in the current browser tab.

Two operations involve external communication: same-origin requests to Amazon for additional search pages, and browser-managed storage synchronization described above. JANGA does not send manual marks to Amazon as reports.

Implementation: [`content.js`](../content.js), [`options.js`](../options.js), and [`manifest.json`](../manifest.json).
