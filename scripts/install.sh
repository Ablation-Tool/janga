#!/usr/bin/env bash
set -euo pipefail

repo_url="https://github.com/Ablation-Tool/janga.git"
install_dir="${1:-$HOME/janga}"
browser="${JANGA_BROWSER:-chrome}"

if ! command -v git >/dev/null 2>&1; then
  echo "Git is required. Install Git or download the repository ZIP from:" >&2
  echo "https://github.com/Ablation-Tool/janga" >&2
  exit 1
fi

if [ -e "$install_dir" ] && [ ! -d "$install_dir" ]; then
  echo "Installation path exists and is not a directory: $install_dir" >&2
  exit 1
fi

if [ -d "$install_dir" ] && [ -n "$(ls -A "$install_dir")" ]; then
  if [ ! -f "$install_dir/manifest.json" ]; then
    echo "Directory is not empty and does not contain JANGA: $install_dir" >&2
    echo "Choose another path, for example: bash scripts/install.sh \"$HOME/janga-extension\"" >&2
    exit 1
  fi
  echo "Using existing JANGA files in $install_dir"
else
  mkdir -p "$(dirname "$install_dir")"
  git clone "$repo_url" "$install_dir"
fi

if [ ! -f "$install_dir/manifest.json" ]; then
  echo "JANGA's manifest.json was not found in $install_dir" >&2
  exit 1
fi

install_dir="$(cd "$install_dir" && pwd)"
extensions_url="chrome://extensions"

case "$browser" in
  chrome)
    extensions_url="chrome://extensions"
    ;;
  edge)
    extensions_url="edge://extensions"
    ;;
  *)
    echo "Unsupported JANGA_BROWSER value: $browser (use chrome or edge)" >&2
    exit 1
    ;;
esac

if [ "${JANGA_NO_OPEN:-0}" != "1" ]; then
  if [ "$(uname -s)" = "Darwin" ]; then
    if [ "$browser" = "edge" ]; then
      open -a "Microsoft Edge" "$extensions_url" || true
    else
      open -a "Google Chrome" "$extensions_url" || true
    fi
  elif [ "$browser" = "edge" ] && command -v microsoft-edge >/dev/null 2>&1; then
    microsoft-edge "$extensions_url" >/dev/null 2>&1 &
  elif [ "$browser" = "chrome" ] && command -v google-chrome >/dev/null 2>&1; then
    google-chrome "$extensions_url" >/dev/null 2>&1 &
  elif [ "$browser" = "chrome" ] && command -v chromium >/dev/null 2>&1; then
    chromium "$extensions_url" >/dev/null 2>&1 &
  else
    echo "Could not find the browser executable. Open $extensions_url manually."
  fi
fi

cat <<EOF

JANGA is ready to load from:
$install_dir

Finish the browser-required steps:
1. Open $extensions_url if it is not already open.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this exact folder: $install_dir
5. Open an Amazon.com product search and use the JANGA panel.

Chrome and Edge require the Developer mode and Load unpacked steps to be
completed manually. JANGA does not change browser security settings.
EOF
