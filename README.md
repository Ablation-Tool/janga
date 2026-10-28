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

## Search-result organizer not an ad blocker

JANGA is a **search-result organizer**, not a general-purpose ad blocker. It changes how Amazon.com search results are displayed in your browser after Amazon delivers the page.

- It organizes, separates, or hides sponsored **product cards in the search-result list** according to your preferences.
- It does not block advertising requests, prevent sponsored content from being delivered, block trackers, or interfere with Amazon's advertising systems.
- It does not remove large brand banners, sponsored brand modules, video ads, pop-ups, or advertising outside the product-result list.
- Manual sponsored marks are personal display preferences saved for your browser. They are not spam reports, seller reports, or complaints submitted to Amazon.
- It only runs on Amazon.com search pages and includes no analytics, remote code, or product data collection.

## Install in Chrome or Microsoft Edge

JANGA is installed directly from this repository as an unpacked extension. You do not need to install Node.js, run a build, or use the Chrome Web Store.

### 1. Download JANGA

**Option A: Download a ZIP file**

1. Open https://github.com/Ablation-Tool/janga in your browser.
2. Click the green **Code** button, then choose **Download ZIP**.
3. Unzip the downloaded file. This normally creates a folder named `janga-main`.

**Option B: Download with Git**

```sh
git clone https://github.com/Ablation-Tool/janga.git
```

This creates a folder named `janga`.

### 2. Load the extension

**Google Chrome**

1. Open a new tab and enter `chrome://extensions` in the address bar.
2. Turn on **Developer mode** using the switch near the top-right.
3. Click **Load unpacked** near the top-left.
4. Select the `janga-main` or `janga` folder you just downloaded, then click **Select Folder**.

**Microsoft Edge**

1. Open a new tab and enter `edge://extensions` in the address bar.
2. Turn on **Developer mode** in the left sidebar.
3. Click **Load unpacked** near the top of the page.
4. Select the `janga-main` or `janga` folder you just downloaded, then click **Select Folder**.

Select the folder that directly contains `manifest.json`, `content.js`, and the other extension files. Do not select the ZIP file or an outer folder. JANGA should now appear in your list of installed extensions.

### 3. Use JANGA on Amazon

1. Go to https://www.amazon.com and perform a product search.
2. The **JANGA** panel appears at the bottom-right of the search page.
3. Choose how to handle sponsored product cards:
   - **Show in original positions** keeps Amazon's placement.
   - **Separate below organic results** moves them into a collapsible sponsored section.
   - **Hide on every search** hides them and saves that preference for future searches.
4. Choose how many organic products to display and, optionally, a displayed-price order.
5. Click **Apply**. Larger counts retrieve additional Amazon pages; use **Stop loading** to cancel.
6. If JANGA misses a sponsored product, click **Mark as sponsored** on that product card. Use **Undo sponsored mark** in the sponsored section if you marked it by mistake.

The same default display settings are available on the extension's **Options** page. Manual sponsored marks and preferences are saved through your browser's extension storage.

### Updating after a new download

Replace the old extension files with the new ones, open the browser's extensions page, click **Reload** on JANGA, and refresh any open Amazon searches.

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

## License

JANGA is free and open-source software under the [MIT License](LICENSE). You may use, modify, and distribute it, including for commercial purposes, provided the copyright and license notice are retained. The software is provided without warranty.
