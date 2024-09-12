import { ObjectId, UpdateResult } from 'mongodb';
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

export async function purgeInventorySourceItem(
  id: string
): Promise<UpdateResult<Document>> {
  const db = await getDatabase();
  const objectId = new ObjectId(id);

  // Not possible to delete from API so this adds a purge-flag
  // to the source
  const result = await db
    .collection('inventory')
    .updateOne({ _id: objectId, status: 'gone' }, { $set: { status: 'purge' } })
    .catch((error) => {
      throw `Was not able to set source-id for ${id} to purge: ${error}`;
    });

  return result as UpdateResult<Document>;
}
