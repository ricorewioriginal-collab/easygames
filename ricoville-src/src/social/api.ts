// Firestore per REST (kein Firebase-SDK im Spiel): nur die paar Aufrufe, die die Nachbarn brauchen.
// Anmeldung und Token kommen vom easygames-Cloud-Skript (window.AnMaChaCloud.account()).
import type { InboxMsg, MsgType, PublicCity } from './codec';

export interface Account {
  uid: string;
  name: string;
  token: string;
  project: string;
}
export interface CloudBridge {
  account?: () => Promise<Account | null>;
  signIn?: () => Promise<unknown>;
}
export const bridge = (): CloudBridge | undefined => (window as unknown as { AnMaChaCloud?: CloudBridge }).AnMaChaCloud;

type Val = { stringValue?: string; integerValue?: string; booleanValue?: boolean; doubleValue?: number };
type Fields = Record<string, Val>;
const enc = (o: Record<string, string | number | boolean | undefined>): Fields => {
  const f: Fields = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    f[k] = typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v } : { integerValue: String(Math.floor(v)) };
  }
  return f;
};
const dec = (f: Fields = {}): Record<string, string | number | boolean> => {
  const o: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(f)) {
    if (v.stringValue !== undefined) o[k] = v.stringValue;
    else if (v.integerValue !== undefined) o[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) o[k] = v.doubleValue;
    else if (v.booleanValue !== undefined) o[k] = v.booleanValue;
  }
  return o;
};
const lastSeg = (name: string): string => name.slice(name.lastIndexOf('/') + 1);

export class SocialError extends Error {
  constructor(
    msg: string,
    readonly status = 0,
  ) {
    super(msg);
  }
}

export class NeighborApi {
  constructor(private acc: Account) {}
  get uid(): string {
    return this.acc.uid;
  }
  private get base(): string {
    return `https://firestore.googleapis.com/v1/projects/${this.acc.project}/databases/(default)/documents`;
  }
  private async call(path: string, init: RequestInit = {}): Promise<unknown> {
    let r: Response;
    try {
      r = await fetch(this.base + path, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.acc.token}`, ...(init.headers ?? {}) } });
    } catch {
      throw new SocialError('Keine Verbindung. Bist du online?');
    }
    if (r.status === 404) return null;
    if (!r.ok) {
      if (r.status === 403) throw new SocialError('Nicht erlaubt. Sind die Nachbar-Regeln in Firebase veröffentlicht?', 403);
      if (r.status === 401) throw new SocialError('Anmeldung abgelaufen. Bitte neu anmelden.', 401);
      if (r.status === 409) throw new SocialError('Schon erledigt.', 409);
      if (r.status === 429) throw new SocialError('Gerade zu viel los. Bitte später noch einmal.', 429);
      throw new SocialError(`Fehler ${r.status}`, r.status);
    }
    return r.json();
  }

  private cityPath(uid: string): string {
    return `/ricoville_cities/${encodeURIComponent(uid)}`;
  }
  async putCity(c: Omit<PublicCity, 'uid'>): Promise<void> {
    await this.call(this.cityPath(this.uid), { method: 'PATCH', body: JSON.stringify({ fields: enc({ v: 1, ...c }) }) });
  }
  async getCity(uid: string): Promise<PublicCity | null> {
    const j = (await this.call(this.cityPath(uid))) as { fields?: Fields } | null;
    return j ? ({ uid, ...dec(j.fields) } as unknown as PublicCity) : null;
  }
  /** Die zuletzt gespielten Städte (zum Finden neuer Nachbarn). */
  async recentCities(n = 30): Promise<PublicCity[]> {
    const body = { structuredQuery: { from: [{ collectionId: 'ricoville_cities' }], orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }], limit: Math.min(30, n) } };
    const j = (await this.call(':runQuery', { method: 'POST', body: JSON.stringify(body) })) as { document?: { name: string; fields: Fields } }[] | null;
    return (j ?? []).filter((x) => x.document).map((x) => ({ uid: lastSeg(x.document!.name), ...dec(x.document!.fields) }) as unknown as PublicCity);
  }

  async neighbors(): Promise<{ uid: string; name: string }[]> {
    const j = (await this.call(`${this.cityPath(this.uid)}/neighbors?pageSize=100`)) as { documents?: { name: string; fields: Fields }[] } | null;
    return (j?.documents ?? []).map((d) => ({ uid: lastSeg(d.name), name: String(dec(d.fields).name ?? '') }));
  }
  async addNeighbor(uid: string, name: string, now: number): Promise<void> {
    await this.call(`${this.cityPath(this.uid)}/neighbors/${encodeURIComponent(uid)}`, { method: 'PATCH', body: JSON.stringify({ fields: enc({ name: name.slice(0, 24), t: now }) }) });
  }
  async removeNeighbor(uid: string): Promise<void> {
    await this.call(`${this.cityPath(this.uid)}/neighbors/${encodeURIComponent(uid)}`, { method: 'DELETE' });
  }

  async inbox(): Promise<InboxMsg[]> {
    const j = (await this.call(`${this.cityPath(this.uid)}/inbox?pageSize=200`)) as { documents?: { name: string; fields: Fields }[] } | null;
    return (j?.documents ?? []).map((d) => ({ id: lastSeg(d.name), ...dec(d.fields) }) as unknown as InboxMsg);
  }
  /** Nachricht an einen Nachbarn; die ID macht sie pro Absender, Art und Tag einmalig. */
  async send(to: string, type: MsgType, day: number, name: string, extra: { item?: string; n?: number } = {}): Promise<void> {
    const id = `${this.uid}_${day}_${type}`;
    await this.call(`${this.cityPath(to)}/inbox/${encodeURIComponent(id)}?currentDocument.exists=false`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: enc({ from: this.uid, name: name.slice(0, 24), type, day, done: false, ...extra }) }),
    });
  }
  async markDone(id: string): Promise<void> {
    await this.call(`${this.cityPath(this.uid)}/inbox/${encodeURIComponent(id)}?updateMask.fieldPaths=done&currentDocument.exists=true`, {
      method: 'PATCH',
      body: JSON.stringify({ fields: enc({ done: true }) }),
    });
  }
  async remove(id: string): Promise<void> {
    await this.call(`${this.cityPath(this.uid)}/inbox/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
