import { ObjectId } from 'mongodb';
import { getDatabase } from '../mongoClient/dbClient';
import { Numbers } from '../../interfaces/Source';
import { Log } from '../logger';

interface IResponse {
  audio_stream?: {
    audio_mapping?: Numbers[];
    number_of_channels: number;
    sample_rate: number;
  };
}

export async function getAudioMapping(id: ObjectId): Promise<IResponse> {
  const db = await getDatabase();

  return (await db
    .collection('inventory')
    .findOne({ _id: id }, { projection: { audio_stream: 1, _id: 0 } })
    .catch(() => {
      throw `Could not find audio mapping for source: ${id.toString()}`;
    })) as IResponse;
}

export async function deleteInventorySourceItem(id: string): Promise<void> {
  const db = await getDatabase();

  const document = await db
    .collection('inventory')
    .findOne({ _id: new ObjectId(id) });
  console.log('DB dokument', document);
  if (!document) {
    console.log('Document not found');
  }

  await db.collection('inventory').deleteOne({ _id: new ObjectId(id) });
  Log().info('Deleted source', id);
}
