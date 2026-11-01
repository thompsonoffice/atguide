set -e
cd /workspace/atguide
node build/build.js data/new2.canvas.tsx >/dev/null
node txtgen/gen.js >/dev/null
cd dist && rm -f ATGuide-TXT.zip && python3 -c "import shutil;shutil.make_archive('ATGuide-TXT','zip','.','ATGuide-TXT')" && cd ..
node build/build.js data/new2.canvas.tsx | grep -iE "unknown|bad refs|no txt" || true
cp dist/ATGuide-TXT.zip ATGuide-TXT.zip; rm -rf txt; cp -r dist/txt txt
S=/workspace/atguide-site; cp index.html manifest.json ATGuide-TXT.zip icon-*.png $S/; rm -rf $S/txt; cp -r txt $S/txt
mkdir -p $S/src-backup; cp /workspace/atguide/build/build.js /workspace/atguide/data/research.js /workspace/atguide/data/research2.js /workspace/atguide/data/new2.canvas.tsx /workspace/atguide/txtgen/gen.js /workspace/publish.sh $S/src-backup/; cp /workspace/atguide-native/tools/export_data.py $S/src-backup/
cd $S; git add -A; git -c user.name=thompsonoffice -c user.email=thompsonoffice@users.noreply.github.com commit -qm "$1" && git push -q; git log -1 --format=%h
