import { WithId, ObjectId } from 'mongodb';
import { PipelineSettings } from './pipeline';
import { MultiviewLayout, MultiviewOutputSettings } from './multiview';
import { ControlConnection } from './controlConnections';

export interface Preset {
  _id?: ObjectId;
  name: string;
  default_multiview_reference?: string;
  control_connection: ControlConnection;
  pipelines: PipelineSettings[];
}

export type PresetWithId = WithId<Preset>;

export interface PresetReference {
  _id: ObjectId;
  name: string;
}

export interface MultiviewPreset {
  _id?: ObjectId;
  production_id?: ObjectId;
  name: string;
  layout: MultiviewLayout;
  output: MultiviewOutputSettings;
}

export type MultiviewPresetWithId = WithId<MultiviewPreset>;

export interface MultiviewPresetReference {
  _id: ObjectId;
}
