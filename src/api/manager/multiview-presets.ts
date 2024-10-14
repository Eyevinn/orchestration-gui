import { ObjectId, WithId } from 'mongodb';
import { MultiviewPreset } from '../../interfaces/preset';
import { getDatabase } from '../mongoClient/dbClient';

export async function getMultiviewPresets(): Promise<MultiviewPreset[]> {
  const db = await getDatabase();
  return await db
    .collection<MultiviewPreset>('multiview-presets')
    .find({})
    .toArray();
}

export async function getMultiviewPreset(
  id: string
): Promise<WithId<MultiviewPreset>> {
  const db = await getDatabase();
  return (await db
    .collection<MultiviewPreset>('multiview-presets')
    .findOne({ _id: new ObjectId(id) })) as WithId<MultiviewPreset>;
}
