export interface MultiviewViews {
  input_slot: number;
  x: number;
  y: number;
  height: number;
  width: number;
  label: string;
  id?: string;
}

export type TListSource = {
  id: string;
  input_slot: number;
  label: string;
};

export interface MultiviewOutputSettings {
  format: string;
  frame_rate_d: number;
  frame_rate_n: number;
  local_ip: string;
  local_port: number;
  remote_ip: string;
  remote_port: number;
  srt_mode: string;
  srt_latency_ms: number;
  srt_passphrase: string;
  video_format: string;
  video_kilobit_rate: number;
}

export interface MultiviewStructureLayout {
  output_height: number;
  output_width: number;
  views: MultiviewViews[];
  output: MultiviewOutputSettings;
}

export interface MultiviewSettings {
  multiview_id?: number;
  for_pipeline_idx: number;
  name: string;
  layout: MultiviewStructureLayout;
  output: MultiviewOutputSettings;
  _id?: string;
}
