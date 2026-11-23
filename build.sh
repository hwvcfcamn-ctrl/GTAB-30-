#!/usr/bin/env bash
# Build a debug APK. Requires Node.js 18+, JDK 17+, Android SDK and SDK platform/build-tools.
set -Eeuo pipefail
cd "$(dirname "$0")"
: "${ANDROID_HOME:=${ANDROID_SDK_ROOT:-}}"
if [[ -z "$ANDROID_HOME" || ! -d "$ANDROID_HOME" ]]; then
  echo "ERROR: Android SDK not found. Set ANDROID_HOME (or ANDROID_SDK_ROOT)." >&2
  exit 2
fi
command -v node >/dev/null || { echo "ERROR: Node.js 18+ is required." >&2; exit 2; }
command -v npm >/dev/null || { echo "ERROR: npm is required." >&2; exit 2; }
command -v java >/dev/null || { echo "ERROR: JDK 17+ is required." >&2; exit 2; }
JAVA_MAJOR="$(java -version 2>&1 | awk -F'[\".]' '/version/ {print $2; exit}')"
[[ -n "$JAVA_MAJOR" && "$JAVA_MAJOR" -ge 17 ]] || { echo "ERROR: JDK 17+ required." >&2; exit 2; }
NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
(( NODE_MAJOR >= 18 )) || { echo "ERROR: Node.js 18+ required; found $(node --version)." >&2; exit 2; }
export ANDROID_HOME
export ANDROID_SDK_ROOT="$ANDROID_HOME"
echo "[0/6] Verifying project files..."
npm run verify
echo "[1/6] Installing project dependencies..."
npm install --no-audit --no-fund
if [[ ! -d android ]]; then
  echo "[2/6] Adding Capacitor Android platform..."
  npx cap add android
else
  echo "[2/6] Android platform already exists."
fi
echo "[3/6] Generating Android launcher icons and splash screen..."
npx capacitor-assets generate --android
echo "[4/6] Syncing web assets..."
npx cap sync android
echo "[5/6] Setting landscape orientation..."
node scripts/set-landscape.mjs
printf 'sdk.dir=%s\n' "$ANDROID_HOME" > android/local.properties
echo "[6/6] Building debug APK..."
(
  cd android
  chmod +x gradlew
  ./gradlew --no-daemon assembleDebug
)
APK="android/app/build/outputs/apk/debug/app-debug.apk"
[[ -f "$APK" ]] || { echo "ERROR: Gradle did not produce $APK" >&2; exit 3; }
cp "$APK" GTA6_3D.apk
echo "SUCCESS: $PWD/GTA6_3D.apk"
