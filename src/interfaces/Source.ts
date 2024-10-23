import { ObjectId, WithId } from 'mongodb';
import { HTMLSource, MediaSource } from './renderingEngine';
import { ResourcesSrt } from '../../types/ateliere-live';
export type SourceType = 'camera' | 'graphics' | 'microphone';
export type SourceStatus = 'ready' | 'new' | 'gone' | 'purge';
export type Type = 'ingest_source' | 'html' | 'mediaplayer';
export type SrtMode = 'caller' | 'listener';
export type VideoStream = {
  height?: number;
  width?: number;
  frame_rate?: number;
};

export type AudioStream = {
  number_of_channels?: number;
  sample_rate?: number;
  audio_mapping?: (number | number[])[];
};

export type Numbers = number | number[];

export interface Source {
  _id?: ObjectId | string;
  status: SourceStatus;
  name: string;
  type: SourceType;
  tags: {
    location: string;
    [key: string]: string | undefined;
  };
  ingest_name: string;
  ingest_source_name: string;
  ingest_type: string;
  video_stream: VideoStream;
  audio_stream: AudioStream;
  lastConnected: Date;
  srt?: ResourcesSrt;
}

export interface SourceReference {
  _id?: string;
  type: Type;
  label: string;
  stream_uuids?: string[];
  input_slot: number;
  html_data?: HTMLSource;
  media_data?: MediaSource;
}

export type SourceWithId = WithId<Source>;

export interface SourceToPipelineStream {
  source_id: string;
  stream_uuid: string;
  input_slot: number;
}

export interface DeleteSourceStep {
  step: 'delete_stream' | 'update_multiview' | 'unexpected';
  success: boolean;
  message?: string;
}

export interface DeleteRenderingEngineSourceStep {
  step: 'delete_html' | 'delete_media' | 'update_multiview';
  success: boolean;
  message?: string;
}

export interface DeleteSourceStatus {
  success: boolean;
  steps: DeleteSourceStep[];
}

export interface AddSourceStep {
  step: 'add_stream' | 'update_multiview' | 'unexpected';
  success: boolean;
  message?: string;
}

export interface AddSourceStatus {
  success: boolean;
  steps: AddSourceStep[];
}

export type AddSourceResult =
  | {
      success: true;
      streams: SourceToPipelineStream[];
      steps: AddSourceStep[];
    }
  | {
      success: false;
      steps: AddSourceStep[];
    };

export type AddRenderingEngineSourceResult =
  | {
      success: true;
      streams: SourceToPipelineStream[];
      steps: AddSourceStep[];
    }
  | {
      success: false;
      steps: AddSourceStep[];
    };

export interface SrtSource {
  latency_ms?: number;
  local_ip?: string;
  local_port?: number;
  mode: SrtMode;
  name: string;
  passphrase?: string;
  remote_ip?: string;
  remote_port?: number;
}
