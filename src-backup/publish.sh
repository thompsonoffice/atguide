set -euo pipefail
trap 'echo "PUBLISH FAILED at line $LINENO: $BASH_COMMAND" >&2' ERR
[ -n "${1:-}" ] || { echo "PUBLISH FAILED: no commit message" >&2; exit 2; }
cd /workspace/atguide
OUT=$(node build/build.js data/new2.canvas.tsx 2>&1)
echo "$OUT" | grep -q "bad refs: \[\]" || { echo "$OUT" | tail -5 >&2; echo "PUBLISH FAILED: build did not report bad refs: []" >&2; exit 1; }
node txtgen/gen.js >/dev/null
cd dist && rm -f ATGuide-TXT.zip && python3 -c "import shutil;shutil.make_archive('ATGuide-TXT','zip','.','ATGuide-TXT')" && cd ..
echo "$OUT" | grep -iE "unknown|no txt" >&2 || true
cp dist/ATGuide-TXT.zip ATGuide-TXT.zip; rm -rf txt; cp -r dist/txt txt
S=/workspace/atguide-site; cp index.html manifest.json ATGuide-TXT.zip icon-*.png $S/; rm -rf $S/txt; cp -r txt $S/txt
mkdir -p $S/src-backup; cp /workspace/atguide/build/build.js /workspace/atguide/data/research.js /workspace/atguide/data/research2.js /workspace/atguide/data/new2.canvas.tsx /workspace/atguide/txtgen/gen.js /workspace/publish.sh $S/src-backup/; cp /workspace/atguide-native/tools/export_data.py /workspace/rezip.py $S/src-backup/
cd $S; git add -A
if git diff --cached --quiet; then echo "PUBLISH FAILED: nothing changed to commit" >&2; exit 1; fi
git -c user.name=thompsonoffice -c user.email=thompsonoffice@users.noreply.github.com commit -qm "$1"
git push -q
[ "$(git rev-parse HEAD)" = "$(git rev-parse @{u})" ] || { echo "PUBLISH FAILED: push did not reach origin" >&2; exit 1; }
echo "PUBLISHED $(git log -1 --format=%h)"
