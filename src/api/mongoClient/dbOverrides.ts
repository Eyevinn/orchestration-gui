import { Db, ObjectId, WithId } from 'mongodb';

import { MultiviewPreset, Preset } from '../../interfaces/preset';
import { PipelineSettings } from '../../interfaces/pipeline';

interface DbOverride {
  type: string;
  name: string;
  key: string;
  value: string;
}

function parseOverrideString(overrides: string): DbOverride[] {
  const overrideList: DbOverride[] = [];
  overrides.split(',').map((str: string) => {
    const m = str.match(/(pipeline|multiview)\[(.*?)\]\.(.*?)=(.*)/);
    if (m) {
      const override = {
        type: m[1],
        name: m[2],
        key: m[3],
        value: m[4]
      };
      overrideList.push(override);
    }
  });
  return overrideList;
}

async function overridePipelinePreset(
  db: Db,
  preset: WithId<Preset>,
  pipeline: PipelineSettings,
  override: DbOverride
) {
  pipeline.program_output.forEach((outputStream) => {
    switch (override.key) {
      case 'port':
        outputStream.port = parseInt(override.value);
        break;
      case 'local_ip':
        outputStream.local_ip = override.value;
        break;
      case 'remote_ip':
        outputStream.remote_ip = override.value;
        break;
      case 'srt_mode':
        if (override.value !== 'listener' && override.value !== 'caller') {
          console.error('Invalid SRT mode override provided, skipping');
          console.log(override);
        } else {
          outputStream.srt_mode = override.value;
        }
        break;
      default:
        console.error(
          'Unsupported pipeline output override provided, skipping'
        );
        console.log(override);
        break;
    }
  });

  console.log(
    `Overriding pipeline ${pipeline.pipeline_name}/${override.key}=${override.value}`
  );
  const { _id, ...rest } = preset;
  await db.collection<Preset>('presets').findOneAndReplace(
    { _id: new ObjectId(_id) },
    {
      ...rest
    },
    { returnDocument: 'after' }
  );
}

async function overrideMultiviewPreset(
  db: Db,
  multiviewPreset: WithId<MultiviewPreset>,
  override: DbOverride
) {
  switch (override.key) {
    case 'port':
      multiviewPreset.output.local_port = parseInt(override.value);
      multiviewPreset.output.remote_port = parseInt(override.value);
      break;
    case 'local_ip':
      multiviewPreset.output.local_ip = override.value;
      break;
    case 'remote_ip':
      multiviewPreset.output.remote_ip = override.value;
      break;
    case 'srt_mode':
      if (override.value !== 'listener' && override.value !== 'caller') {
        console.error('Invalid SRT mode override provided, skipping');
        console.log(override);
      } else {
        multiviewPreset.output.srt_mode = override.value;
      }
      break;
  }
  const { _id, ...rest } = multiviewPreset;
  await db.collection<MultiviewPreset>('multiview-presets').findOneAndReplace(
    { _id: new ObjectId(_id) },
    {
      ...rest
    },
    { returnDocument: 'after' }
  );
}

export async function applyPresetOverrides(db: Db, overrideString: string) {
  const overrideList = parseOverrideString(overrideString);

  for (const override of overrideList) {
    if (override.type === 'pipeline') {
      // One day we might want to iterate over all presets and find the pipeline
      // but not this day...
      const presets = await db.collection<Preset>('presets').find({}).toArray();
      const presetToOverride = presets[0];
      const pipelineToOverride = presetToOverride.pipelines.find(
        (pipeline) => pipeline.pipeline_name === override.name
      );
      if (pipelineToOverride) {
        await overridePipelinePreset(
          db,
          presetToOverride,
          pipelineToOverride,
          override
        );
      }
    } else if (override.type === 'multiview') {
      const multiviewPreset = await db
        .collection<MultiviewPreset>('multiview-presets')
        .findOne({ name: override.name });
      if (multiviewPreset) {
        await overrideMultiviewPreset(db, multiviewPreset, override);
      }
    } else {
      console.error('Unsupported override type');
      console.log(override);
    }
  }
}
