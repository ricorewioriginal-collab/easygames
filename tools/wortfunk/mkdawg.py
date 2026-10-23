# Baut einen minimalen DAWG (Daciuk) und schreibt ihn als Uint32-Kanten (little endian).
# Kante: bits 0-4 Buchstabe (1..29), bit 5 = Wortende, bit 6 = letzte Kante des Knotens, bits 7-31 = Zielknoten (Index der ersten Kante, 0 = keine)
import sys,struct
AL='ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ'
words=[l.strip() for l in open(sys.argv[1],encoding='utf8') if l.strip()]
words.sort(key=lambda w:[AL.index(c) for c in w])
class N:
    __slots__=('e','t','k')
    def __init__(s): s.e={}; s.t=False; s.k=None
    def key(s):
        if s.k is None: s.k=(s.t,tuple((c,id(n)) for c,n in sorted(s.e.items())))
        return s.k
root=N(); reg={}; unc=[]; prev=''
def mini(down):
    while len(unc)>down:
        p,c,ch=unc.pop(); k=ch.key()
        if k in reg: p.e[c]=reg[k]
        else: reg[k]=ch
for w in words:
    i=0
    while i<min(len(w),len(prev)) and w[i]==prev[i]: i+=1
    mini(i)
    n=unc[-1][2] if unc else root
    for c in w[i:]:
        ch=N(); n.e[c]=ch; unc.append((n,c,ch)); n=ch
    n.t=True; prev=w
mini(0)
# Serialisieren: Knoten 0 = Wurzel-Kantenblock; Index 0 im Ziel heißt "keine Kinder"
order=[]; pos={}
edges=[None]  # Platzhalter, damit Index 0 = keine Kinder
def place(n):
    st=[n]
    while st:
        x=st.pop()
        if id(x) in pos or not x.e: continue
        pos[id(x)]=len(edges); items=sorted(x.e.items(),key=lambda kv:AL.index(kv[0]))
        for _ in items: edges.append(None)
        order.append((x,items))
        for _,c in items: st.append(c)
place(root)
out=bytearray(struct.pack('<I',0))
buf=[0]*len(edges)
for x,items in order:
    b=pos[id(x)]
    for j,(c,ch) in enumerate(items):
        v=(AL.index(c)+1)|(32 if ch.t else 0)|(64 if j==len(items)-1 else 0)|((pos.get(id(ch),0))<<7)
        buf[b+j]=v
buf[0]=pos[id(root)]  # Eintrag 0 zeigt auf die Wurzelkanten
open(sys.argv[2],'wb').write(struct.pack('<%dI'%len(buf),*buf))
print(len(words),'Wörter',len(buf),'Kanten',len(buf)*4,'Bytes')
