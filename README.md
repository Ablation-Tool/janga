JANGA organizes Amazon.com search results in your browser. It separates or hides sponsored product cards, combines successive search pages, and sorts loaded products by displayed price.

JANGA is a **search-result organizer, not an ad blocker**. It changes the presentation of product results after Amazon delivers them; it does not block Amazon's advertising systems.

---

## Capabilities

<details>
<summary><strong>Sponsored Result Organization</strong></summary>

| Capability | Code | Description |
|:---|:---|:---|
| **Original Placement** | [content.js](content.js) | Keeps sponsored product cards in the positions supplied by Amazon. |
| **Separate Sponsored Section** | [content.js](content.js) | Moves sponsored cards into a collapsible section below organic results. |
| **Persistent Hide Mode** | [content.js](content.js) | Hides sponsored cards on the current search and future searches. |
| **Manual Sponsored Marks** | [content.js](content.js) | Marks missed sponsored cards with one click and provides an undo control for manual marks. |
| **Organic Duplicate Preference** | [content.js](content.js) | Keeps the organic card when sponsored and organic results share an ASIN. |

</details>

<details>
<summary><strong>Result Expansion & Price Ordering</strong></summary>

| Capability | Code | Description |
|:---|:---|:---|
| **Selectable Result Counts** | [content.js](content.js) | Displays 10, 100, 200, or 300 organic products instead of navigating individual pages. |
| **Successive-Page Loading** | [content.js](content.js) | Retrieves additional same-origin Amazon search pages with a request limit and cancellation control. |
| **ASIN Deduplication** | [content.js](content.js) | Prevents duplicate products from being appended across page boundaries. |
| **Displayed-Price Sorting** | [content.js](content.js) | Sorts loaded organic products low to high or high to low, placing products without usable prices last. |
| **Access-Control Handling** | [content.js](content.js) | Stops on CAPTCHAs, access-control pages, request failures, and unusable responses without bypass attempts. |

</details>

<details>
<summary><strong>Languages, Preferences & Privacy</strong></summary>

| Capability | Description |
|:---|:---|
| **Sponsored-Label Detection** | Recognizes English, Spanish, Hindi, and Mandarin, including simplified and traditional Chinese labels. |
| **Persistent Preferences** | Saves display settings and manual sponsored ASINs through the browser's extension storage. |
| **Dynamic Results** | Processes product cards inserted after the initial page load. |
| **Minimal Permissions** | Requests only extension storage and access to Amazon.com search pages. |
| **Local Operation** | Includes no analytics, remote code, third-party dependencies, or product data collection. |

</details>

---

## Setup & About

<details>
<summary><strong>AI Agent Install</strong></summary>

```text
Install JANGA from https://github.com/Ablation-Tool/janga for me.

Clone the repository if it is not already present, then run the included
scripts/install.sh script. Use Chrome by default, or Edge if I ask for it.
The script should verify that manifest.json exists and open the appropriate
browser extensions page.

Do not use sudo, change browser security settings, enable remote debugging,
or attempt to bypass the browser's unpacked-extension confirmation flow.

Give me the exact installation folder, then guide me while I manually enable
Developer mode and choose Load unpacked. Finish by telling me how to open an
Amazon.com search and confirm that the JANGA panel appears.
```

</details>

<details>
<summary><strong>Manual Install</strong></summary>

**Requirements:** Google Chrome or Microsoft Edge. No Node.js installation, package installation, build step, or Chrome Web Store download is required.

**1. Download JANGA**

Download a ZIP file:

1. Open https://github.com/Ablation-Tool/janga.
2. Click the green **Code** button, then choose **Download ZIP**.
3. Unzip the file. This normally creates a folder named `janga-main`.

Or download with Git:

```bash
git clone https://github.com/Ablation-Tool/janga.git
```

This creates a folder named `janga`.

**2. Load the extension in Google Chrome**

1. Open `chrome://extensions` in a new tab.
2. Turn on **Developer mode** near the top-right.
3. Click **Load unpacked** near the top-left.
4. Select the `janga-main` or `janga` folder, then click **Select Folder**.

**3. Load the extension in Microsoft Edge**

1. Open `edge://extensions` in a new tab.
2. Turn on **Developer mode** in the left sidebar.
3. Click **Load unpacked** near the top of the page.
4. Select the `janga-main` or `janga` folder, then click **Select Folder**.

Select the folder that directly contains `manifest.json`, `content.js`, and the other extension files. Do not select the ZIP file or an outer folder. JANGA should appear in the installed-extension list.

**Updating:** Replace the old files with a new download, click **Reload** on JANGA in the browser's extension list, and refresh open Amazon searches.

</details>

<details>
<summary><strong>Use JANGA on Amazon</strong></summary>

1. Go to https://www.amazon.com and perform a product search.
2. Open the **JANGA** panel at the bottom-right of the results page.
3. Choose how to handle sponsored product cards:

| Mode | Behavior |
|:---|:---|
| **Show in original positions** | Keeps Amazon's sponsored-card placement. |
| **Separate below organic results** | Moves sponsored cards into a collapsible section. |
| **Hide on every search** | Hides sponsored cards and saves that preference for future searches. |

4. Choose the number of organic products to display and, optionally, a displayed-price order.
5. Click **Apply**. Larger counts retrieve additional Amazon pages; **Stop loading** cancels an active load.
6. Click **Mark as sponsored** on a missed sponsored product. To reverse a manual mark, open the sponsored section and click **Undo sponsored mark**.

Default display settings are also available on JANGA's **Options** page. Preferences and manual marks persist through browser extension storage.

</details>

<details>
<summary><strong>Search-Result Organizer, Not an Ad Blocker</strong></summary>

JANGA changes how Amazon.com search results appear in your browser after Amazon delivers the page.

- It organizes, separates, or hides sponsored **product cards in the search-result list** according to your preferences.
- It does not block advertising requests, prevent sponsored content from being delivered, block trackers, or interfere with Amazon's advertising systems.
- It does not remove large brand banners, sponsored brand modules, video ads, pop-ups, or advertising outside the product-result list.
- Manual sponsored marks are personal display preferences. They are not spam reports, seller reports, or complaints submitted to Amazon.
- It only runs on Amazon.com search pages.

</details>

<details>
<summary><strong>Result Counts & Price Sorting</strong></summary>

Amazon does not offer a reliable arbitrary page-size setting. For 100, 200, or 300 products, JANGA requests successive search pages, removes duplicate ASINs, and appends organic products until it reaches the requested count or Amazon returns no more usable results. Sponsored products do not count toward the target.

Price sorting applies only to products loaded into the current page. It does not establish the lowest price across all Amazon results. Sorting uses the visible product price and does not include shipping, coupons, Subscribe & Save pricing, or unselected variations. Products without a usable displayed price are placed last.

Amazon may change its markup or present an access-control page. The loader stops rather than attempting to bypass CAPTCHAs or other controls.

</details>

<details>
<summary><strong>Development & Verification</strong></summary>

There is no build step or package installation. Edit the source files, reload JANGA from the browser's extension page, and refresh the Amazon search.

```bash
node --check content.js
node --check options.js
```

Controlled browser verification covers sponsored modes, persistent preferences, manual marks, duplicate ASINs, supported languages, result aggregation, cancellation, price sorting, CAPTCHA handling, and storage failures.

</details>

<details>
<summary><strong>License</strong></summary>

JANGA is free and open-source software under the [MIT License](LICENSE). You may use, modify, and distribute it, including for commercial purposes, provided the copyright and license notice are retained. The software is provided without warranty.

</details>
