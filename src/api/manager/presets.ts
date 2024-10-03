import { ObjectId } from 'mongodb';
import { PresetWithId } from '../../interfaces/preset';
import { getDatabase } from '../mongoClient/dbClient';

export async function getPresets(): Promise<PresetWithId[]> {
  const db = await getDatabase();
  return await db.collection<PresetWithId>('presets').find({}).toArray();
}

export async function getPresetByid(id: string): Promise<PresetWithId> {
  const db = await getDatabase();
  return (await db
    .collection('presets')
    .findOne({ _id: new ObjectId(id) })) as PresetWithId;
}

export async function putPreset(
  id: string,
  preset: PresetWithId
): Promise<void> {
  const db = await getDatabase();
  await db
    .collection('presets')
    .findOneAndReplace({ _id: new ObjectId(id) }, preset);
}
