// Gemeinsame Schnittstelle für Offline (Worker) und Online (WebSocket).

export interface Transport {
  readonly online: boolean;
  /** Binärdaten an das laufende Match */
  send(data: ArrayBuffer): void;
  /** Nachrichten vom Match (Text = JSON, sonst Binär) */
  onMessage: ((data: ArrayBuffer | string) => void) | null;
  /** Verbindung verloren (nur online) */
  onClose: ((reason: string) => void) | null;
  /** Match verlassen */
  leave(): void;
}
