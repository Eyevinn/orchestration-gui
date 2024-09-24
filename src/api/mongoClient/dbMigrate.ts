import { Db, ObjectId } from 'mongodb';

import { MultiviewPreset, Preset } from '../../interfaces/preset';
import { Production } from '../../interfaces/production';
import { Log } from '../logger';
import { ProgramOutput } from '../../interfaces/pipeline';

//TODO: validate that this
export async function migratePresets(db: Db) {
  const presets = await db.collection<Preset>('presets').find({}).toArray();
  if (
    !Array.isArray(presets[0].pipelines[0].program_output) ||
    !Array.isArray(presets[0].pipelines[1].program_output) ||
    !Array.isArray(presets[1].pipelines[0].program_output)
  ) {
    console.log('Migrating program_ouput to support multiple program_output');
    for (const preset of presets) {
      const migratedPreset = preset;
      for (const pipeline of migratedPreset.pipelines) {
        if (!Array.isArray(pipeline.program_output)) {
          console.log(
            `Migrating program_output of ${pipeline.pipeline_name} in ${preset.name}`
          );
          const outputAsObject =
            pipeline.program_output as unknown as ProgramOutput;
          pipeline.program_output = [{ ...outputAsObject }];
        }
      }
      Log().info(
        `Upgrading preset '${migratedPreset.name}' with multiple program outputs`
      );

      const { _id, ...rest } = migratedPreset;
      await db.collection<Preset>('presets').findOneAndReplace(
        { _id: new ObjectId(_id) },
        {
          ...rest
        },
        { returnDocument: 'after' }
      );
    }
  }
  if (
    !presets[0].pipelines[0].program_output[0] ||
    !presets[0].pipelines[0].program_output[0].video_format
  ) {
    console.log('Need to migrate presets');
    for (const preset of presets) {
      const migratedPreset = preset;
      if (!migratedPreset.pipelines[0].program_output[0]) {
        for (const pipeline of migratedPreset.pipelines) {
          pipeline.program_output = pipeline.program_output.map((output) => {
            return {
              port: output.port,
              local_ip: '0.0.0.0',
              remote_ip: '0.0.0.0',
              format: 'MPEG-TS-SRT',
              srt_mode: 'listener',
              srt_latency_ms: 120,
              srt_passphrase: '',
              audio_format: 'ADTS',
              audio_kilobit_rate: 128,
              video_bit_depth: pipeline.bit_depth,
              video_format: pipeline.format,
              video_gop_length: pipeline.gop_length,
              video_kilobit_rate: pipeline.video_kilobit_rate
            };
          });
        }
      } else if (!migratedPreset.pipelines[0].program_output[0].video_format) {
        for (const pipeline of migratedPreset.pipelines) {
          pipeline.program_output = pipeline.program_output.map((output) => {
            return {
              ...output,
              format: 'MPEG-TS-SRT',
              audio_format: 'ADTS',
              audio_kilobit_rate: 128,
              video_bit_depth: pipeline.bit_depth,
              video_format: pipeline.format,
              video_gop_length: pipeline.gop_length,
              video_kilobit_rate: pipeline.video_kilobit_rate
            };
          });
        }
      }

      Log().info(
        `Upgrading preset '${migratedPreset.name}' with new SRT output settings`
      );

      const { _id, ...rest } = migratedPreset;
      await db.collection<Preset>('presets').findOneAndReplace(
        { _id: new ObjectId(_id) },
        {
          ...rest
        },
        { returnDocument: 'after' }
      );
    }
  }
}

export async function migrateMultiviewPresets(db: Db) {
  const multiviewPresets = await db
    .collection<MultiviewPreset>('multiview-presets')
    .find({})
    .toArray();
  for (const preset of multiviewPresets) {
    const migratedPreset = preset;
    if (!migratedPreset.output.remote_ip) {
      migratedPreset.output.remote_ip = '0.0.0.0';
      migratedPreset.output.remote_port = migratedPreset.output.local_port;
      Log().info(
        `Upgrading multiview preset '${migratedPreset.name}' with new SRT output settings`
      );
      const { _id, ...rest } = migratedPreset;
      await db
        .collection<MultiviewPreset>('multiview-presets')
        .findOneAndReplace(
          { _id: new ObjectId(_id) },
          {
            ...rest
          },
          { returnDocument: 'after' }
        );
    }
  }
}

export async function migrateProductions(db: Db) {
  const productions = await db
    .collection<Production>('productions')
    .find({})
    .toArray();
  for (const production of productions) {
    // if (!production.selectedPresetRef && production.selectedPreset) {
    //   const migratedProduction = production;
    //   migratedProduction.selectedPresetRef = {
    //     _id: new ObjectId(production.selectedPreset._id),
    //     name: production.selectedPreset.name
    //   };
    //   Log().info(
    //     `Upgrading production configuration '${migratedProduction.name}' with preset reference`
    //   );
    //   const { _id, ...rest } = migratedProduction;
    //   await db.collection<Production>('productions').findOneAndReplace(
    //     { _id: new ObjectId(_id) },
    //     {
    //       ...rest
    //     },
    //     { returnDocument: 'after' }
    //   );
    // }
  }
}
