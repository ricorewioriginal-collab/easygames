import re,sys
ok=re.compile(r'^[A-Za-zÄÖÜäöüß]+$')
S=set()
def add(w,t):
    if t.startswith(('EIG','ABK','IG')) or ':EIG' in t or ':ABK' in t: return
    if not ok.match(w): return
    if sum(ch.isupper() for ch in w)>1: return  # Abkürzungen wie IQs, AGs
    u=w.replace('ß','ss').upper()
    if 2<=len(u)<=15: S.add(u)
for f in sys.argv[1:-1]:
    for line in open(f,encoding='utf8'):
        p=line.rstrip('\n').split('\t')
        if len(p)>=3: add(p[0],p[2])
open(sys.argv[-1],'w',encoding='utf8').write('\n'.join(sorted(S))+'\n')
print(len(S))
