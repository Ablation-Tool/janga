const DEFAULTS = {
  sponsoredMode: 'show',
  resultCount: 0,
  priceOrder: 'original'
};

const form = document.querySelector('#options-form');
const status = document.querySelector('#status');

function showStatus(message) {
  status.textContent = message;
}

async function restoreOptions() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  form.elements.sponsoredMode.value = settings.sponsoredMode;
  form.elements.resultCount.value = String(settings.resultCount);
  form.elements.priceOrder.value = settings.priceOrder;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await chrome.storage.sync.set({
      sponsoredMode: form.elements.sponsoredMode.value,
      resultCount: Number(form.elements.resultCount.value),
      priceOrder: form.elements.priceOrder.value
    });
    showStatus('Defaults saved. Refresh open Amazon searches to use them.');
  } catch (error) {
    showStatus(`Could not save options: ${error.message}`);
  }
});

restoreOptions().catch((error) => {
  showStatus(`Could not load options: ${error.message}`);
});
