# Schneidet einen ElevenLabs-Take (Zeilen durch 1 s Pause getrennt) in Einzelclips: python3 cut-take.py take.mp3 <von> <bis> <ausgabeordner> [zotik_take.json (Felder orig/clean)]
import sys,json,re,subprocess,os
audio,lo,hi,outd=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
d=json.load(open(sys.argv[5] if len(sys.argv)>5 else 'zotik_take.json'));cl=d['clean'][lo:hi];orig=d['orig'][lo:hi];N=len(cl)
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',audio]))
o=subprocess.run(['ffmpeg','-hide_banner','-i',audio,'-af','silencedetect=noise=-40dB:d=0.35','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',o)];en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',o)]
S=[(a,b) for a,b in zip(st,en)]  # candidate silences
S=[(a,b) for a,b in S if a>0.3 and b<dur-0.05]
chars=[len(t) for t in cl];tot=sum(chars)
speech=dur-(N-1)*1.0-0.3
# erwartete Schnittzeit nach Zeile k (k=1..N-1)
import math
K=N-1;M=len(S);rate=(dur-K*1.0-0.3)/tot
def segcost(k,start,end):
    d=end-start;e=chars[k]*rate+0.3
    return 2.0*abs(math.log(max(d,0.05)/e))
def silcost(j):
    L=S[j][1]-S[j][0];return 20.0*max(0,0.9-L) - 1.0*min(L,1.1)
INF=1e18
dp=[[INF]*M for _ in range(K)];bk=[[-1]*M for _ in range(K)]
for j in range(M): dp[0][j]=segcost(0,0.0,S[j][0])+silcost(j)
for k in range(1,K):
    for j in range(M):
        for jp in range(j):
            if dp[k-1][jp]>=INF: continue
            c=dp[k-1][jp]+segcost(k,S[jp][1],S[j][0])+silcost(j)
            if c<dp[k][j]: dp[k][j]=c;bk[k][j]=jp
best=INF;bj=-1
for j in range(M):
    if dp[K-1][j]<INF:
        c=dp[K-1][j]+segcost(K,S[j][1],dur)
        if c<best:best=c;bj=j
cuts=[];j=bj
for k in range(K-1,-1,-1): cuts.append(S[j]);j=bk[k][j]
cuts=cuts[::-1]
print('Schnitte',len(cuts),'von',K,'Kosten',round(best,1))
bounds=[(0.0 if i==0 else cuts[i-1][1], dur if i==N-1 else cuts[i][0]) for i in range(N)]
def key(who,text):
    h=0x811c9dc5
    for ch in who+'|'+text:
        for u in ([ord(ch)] if ord(ch)<0x10000 else [0xd800+((ord(ch)-0x10000)>>10),0xdc00+((ord(ch)-0x10000)&0x3ff)]):
            h^=u;h=(h*16777619)&0xffffffff
    ds='0123456789abcdefghijklmnopqrstuvwxyz';n=''
    while h:n=ds[h%36]+n;h//=36
    return n or '0'
os.makedirs(outd,exist_ok=True);rep=[]
for i,(a,b) in enumerate(bounds):
    k=key('Zotik',orig[i]);f=os.path.join(outd,k+'.mp3')
    subprocess.run(['ffmpeg','-v','error','-y','-ss','%.3f'%a,'-to','%.3f'%b,'-i',audio,'-ac','1','-ar','24000','-b:a','28k','-af','silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse',f],check=True)
    rep.append(((b-a)/chars[i],b-a,i))
r=sorted(x[0] for x in rep);med=r[len(r)//2]
print('N',N,'dur',round(dur,1),'median s/char',round(med,3))
for q,l,i in rep:
    if q>med*1.6 or q<med*0.6: print('AUSREISSER',lo+i,round(q/med,2),round(l,1),cl[i][:50])
