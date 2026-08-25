#!/usr/bin/env bash
set -ex

SDK="${ANDROID_HOME:-$LOCALAPPDATA/Android/Sdk}"
[ -d "$SDK" ] || SDK="C:/Users/e/AppData/Local/Android/Sdk"
[ -d "$SDK" ] || { echo "Android SDK not found"; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJ="$ROOT/platforms/android"
OBJ="$PROJ/obj"
DIST="$PROJ/dist"

BT=$(ls -d "$SDK"/build-tools/* 2>/dev/null | sort -V | tail -1)
SYS_JAR=$(ls "$SDK"/platforms/android-*/android.jar 2>/dev/null | sort -V | tail -1)
echo "SDK=$SDK"
echo "BT=$BT"
echo "SYS_JAR=$SYS_JAR"
[ -x "$BT/aapt2" ] || [ -f "$BT/aapt2.exe" ] || { echo "no aapt2"; exit 1; }
[ -f "$SYS_JAR" ] || { echo "no android.jar"; exit 1; }

rm -rf "$OBJ"
mkdir -p "$OBJ/assets" "$OBJ/dex" "$OBJ/classes" "$DIST" "$PROJ/res/drawable-nodpi"
cp "$ROOT/icons/icon-512.png" "$PROJ/res/drawable-nodpi/icon.png"

mkdir -p "$OBJ/assets/www"
tar -C "$ROOT" \
  --exclude='./node_modules' --exclude='./.git' --exclude='./tests' \
  --exclude='./reports' --exclude='./platforms' --exclude='./.github' \
  --exclude='./obj' --exclude='./dist' --exclude='./articles' \
  --exclude='./package-lock.json' --exclude='./*.patent.txt' \
  -cf - . | tar -C "$OBJ/assets/www" -xf -
echo "asset files: $(find "$OBJ/assets/www" -type f | wc -l)"

"$BT/aapt2" compile --dir "$PROJ/res" -o "$OBJ/res.zip"

"$BT/aapt2" link -o "$OBJ/base.apk" -I "$SYS_JAR" \
  --manifest "$PROJ/AndroidManifest.xml" "$OBJ/res.zip" --auto-add-overlay

find "$PROJ/java" -name '*.java' > "$OBJ/sources.txt"
if command -v cygpath >/dev/null 2>&1; then
  sed -i 's|^/c/|C:/|; s|^/d/|D:/|' "$OBJ/sources.txt"
fi
javac --release 8 -cp "$SYS_JAR" -d "$OBJ/classes" "@$OBJ/sources.txt"

jar cf "$OBJ/classes.jar" -C "$OBJ/classes" .

if [ -f "$BT/d8" ]; then D8="$BT/d8"; else D8="$BT/d8.bat"; fi
"$D8" --release --lib "$SYS_JAR" --output "$OBJ/dex" "$OBJ/classes.jar"

PY_ROOT="$ROOT"
PY_OBJ="$OBJ"
if command -v cygpath >/dev/null 2>&1; then
  PY_ROOT=$(cygpath -w "$ROOT")
  PY_OBJ=$(cygpath -w "$OBJ")
fi
PYBIN=""
for cand in python3 python py; do
  if "$cand" -c "import sys" >/dev/null 2>&1; then PYBIN="$cand"; break; fi
done
[ -n "$PYBIN" ] || { echo "no working python found"; exit 1; }
"$PYBIN" - "$PY_ROOT" "$PY_OBJ" <<'PY'
import sys, zipfile, os
root, obj = sys.argv[1], sys.argv[2]
assets = os.path.join(root, 'platforms', 'android', 'obj', 'assets', 'www')
dex = os.path.join(obj, 'dex', 'classes.dex')
with zipfile.ZipFile(os.path.join(obj, 'base.apk'), 'a') as z:
    for dirpath, _, files in os.walk(assets):
        for fn in files:
            fp = os.path.join(dirpath, fn)
            rel = 'assets/www/' + os.path.relpath(fp, assets).replace(os.sep, '/')
            z.write(fp, rel)
    z.write(dex, 'classes.dex')
PY

"$BT/zipalign" -f 4 "$OBJ/base.apk" "$OBJ/aligned.apk"

KS="$PROJ/debug.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -alias limedrive -storepass android -keypass android \
    -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=LimeDrive,O=LimeDrive,C=US"
fi

if [ -f "$BT/apksigner.bat" ]; then APKSIGNER="$BT/apksigner.bat"; else APKSIGNER="$BT/apksigner"; fi
"$APKSIGNER" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android \
  --out "$DIST/LimeDrive.apk" "$OBJ/aligned.apk"

"$APKSIGNER" verify "$DIST/LimeDrive.apk"
echo "OK $DIST/LimeDrive.apk ($(stat -c%s "$DIST/LimeDrive.apk") bytes)"
