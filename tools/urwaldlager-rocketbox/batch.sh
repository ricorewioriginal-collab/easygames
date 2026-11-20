#!/bin/bash
# usage: batch.sh Group/Name ...
B=https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/Avatars
W=/tmp/claude-0/-home-user/c86ff5d5-3485-502a-bd04-f54fff5cec9c/scratchpad/rb
cd $W; mkdir -p glb thumbs
for P in "$@"; do
  N=${P#*/}; [ -f glb/$N.glb ] && continue
  mkdir -p src/$P/Export t/$N
  curl -sf -o src/$P/Export/$N.fbx $B/$P/Export/$N.fbx || { echo "MISS $P"; continue; }
  for tn in $(strings src/$P/Export/$N.fbx | grep -io "[a-z]*[0-9]*_\(body\|head\|opacity\)_color\.tga" | sort -u); do
    curl -sf -o t/$N/$tn $B/$P/Textures/$tn || echo "notex $tn"
  done
  python3 - "$N" <<'P'
import sys,os
from PIL import Image
n=sys.argv[1]; d='t/'+n
for f in os.listdir(d):
  if not f.endswith('.tga'): continue
  im=Image.open(os.path.join(d,f))
  if 'opacity' in f: im.convert('RGBA').resize((256,256),Image.LANCZOS).save(os.path.join(d,f[:-4]+'.png'),optimize=True)
  else: im.convert('RGB').resize((512,512),Image.LANCZOS).save(os.path.join(d,f[:-4]+'.jpg'),quality=82)
  os.remove(os.path.join(d,f))
P
  NODE_PATH=$(npm root -g) timeout 120 node prev.cjs "fbx=src/$P/Export/$N.fbx&tex=t/$N/" thumbs/$N '[["Unarmed_Idle",0.5,0]]' glb/$N.glb 2>&1 | grep -v "^{" | head -3
  echo "OK $N $(stat -c %s glb/$N.glb 2>/dev/null)"
done
