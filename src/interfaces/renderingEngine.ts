export interface RenderingEngine {
  html: HTMLSource[];
  media: MediaSource[];
}

export interface HTMLSource {
  height: number;
  url?: string;
  width: number;
}

export interface MediaSource {
  filename?: string;
}
