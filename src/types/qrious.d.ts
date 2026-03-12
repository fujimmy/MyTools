declare module 'qrious' {
  export type QRiousLevel = 'L' | 'M' | 'Q' | 'H';

  export interface QRiousOptions {
    element?: HTMLCanvasElement;
    value?: string;
    size?: number;
    padding?: number;
    level?: QRiousLevel;
    background?: string;
    foreground?: string;
    backgroundAlpha?: number;
    foregroundAlpha?: number;
    mime?: string;
  }

  export default class QRious {
    constructor(options?: QRiousOptions);
    set(options: Partial<QRiousOptions>): void;
    toDataURL(mime?: string): string;
  }
}
