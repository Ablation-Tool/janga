# JANGA for Amazon

A local, dependency-free Chrome and Edge extension that cleans up Amazon.com search results.

## Features

- Show sponsored products in their original positions, move them into a separate collapsible section, or always hide them.
- Mark missed ads as sponsored with one click, persist those marks across searches, and undo manual marks later.
- Detect sponsored labels in English, Spanish, Hindi, and Mandarin (simplified and traditional Chinese).
- Display 10, 100, 200, or 300 organic products by combining successive search-result pages.
- Sort loaded organic products by displayed price, low to high or high to low.
- Save preferences across searches and browsers that support extension storage sync.
- Stop an in-progress page load at any time.

## Search-result organizer—not an ad blocker

JANGA is a **search-result organizer**, not a general-purpose ad blocker. It changes how Amazon.com search results are displayed in your browser after Amazon delivers the page.

- It organizes, separates, or hides sponsored **product cards in the search-result list** according to your preferences.
- It does not block advertising requests, prevent sponsored content from being delivered, block trackers, or interfere with Amazon's advertising systems.
- It does not remove large brand banners, sponsored brand modules, video ads, pop-ups, or advertising outside the product-result list.
- Manual sponsored marks are personal display preferences saved for your browser. They are not spam reports, seller reports, or complaints submitted to Amazon.
- It only runs on Amazon.com search pages and includes no analytics, remote code, or product data collection.

## Install

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository's directory.
4. Open an Amazon.com search. The **JANGA** panel appears at the bottom-right of the page.

Use the panel's **Apply** button after changing its settings. The same defaults are available from the extension's **Options** page. Choosing **Hide** and applying it saves the preference, so sponsored products stay hidden on future searches.

## How result counts work

Amazon does not offer a reliable arbitrary page-size setting. For 100, 200, or 300 products, the extension requests successive search pages, removes duplicate ASINs, and appends organic products until it reaches the requested count or Amazon returns no more usable results. Sponsored products do not count toward the target.

Price sorting applies only to products loaded into the current page. It does not establish the lowest price across all Amazon results. Sorting uses the visible product price and does not include shipping, coupons, Subscribe & Save pricing, or unselected variations. Products without a usable displayed price are placed last.

Amazon may change its markup or present an access-control page. The loader stops rather than attempting to bypass CAPTCHAs or other controls. If the panel reports changed markup, update the selectors in `content.js`.

## Development

There is no build step or package installation. Edit the source files, then reload the extension from the browser's extensions page and refresh the Amazon search.

Basic syntax checks:

```sh
node --check content.js
node --check options.js
```
