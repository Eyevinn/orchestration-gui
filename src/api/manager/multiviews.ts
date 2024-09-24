import { ObjectId, WithId } from 'mongodb';
import { MultiviewPreset } from '../../interfaces/preset';
import { getDatabase } from '../mongoClient/dbClient';

export async function getMultiviewLayouts(): Promise<MultiviewPreset[]> {
  const db = await getDatabase();
  return await db.collection<MultiviewPreset>('multiviews').find({}).toArray();
}

export async function getMultiviewLayout(
  id: string
): Promise<WithId<MultiviewPreset>> {
  const db = await getDatabase();
  return (await db
    .collection<MultiviewPreset>('multiviews')
    .findOne({ _id: new ObjectId(id) })) as WithId<MultiviewPreset>;
}

export async function putMultiviewLayout(
  newMultiviewLayout: MultiviewPreset
): Promise<void> {
  const db = await getDatabase();
  await db
    .collection('multiviews')
    .insertOne({ ...newMultiviewLayout, _id: new ObjectId() });
}
