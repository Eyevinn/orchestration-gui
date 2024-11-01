import { Db, ObjectId, UpdateResult } from 'mongodb';
import { getDatabase } from '../mongoClient/dbClient';
import { Production } from '../../interfaces/production';
import { Log } from '../logger';

export async function getProductions(): Promise<Production[]> {
  const db = await getDatabase();
  return (await db.collection('productions').find({}).toArray()).map(
    (prod) => ({ ...prod, _id: prod._id.toString() })
  ) as Production[];
}

export async function getProduction(id: string): Promise<Production | null> {
  const db = await getDatabase();

  return (await db
    .collection('productions')
    .findOne({ _id: new ObjectId(id) })) as Production | null;
}

export async function setProductionsIsActiveFalse(): Promise<
  UpdateResult<Document>
> {
  const db = await getDatabase();
  return await db
    .collection('productions')
    .updateMany({}, { $set: { isActive: false } });
}

export async function putProduction(
  id: string,
  production: Production
): Promise<Production> {
  const db = await getDatabase();

  const sources = production.sources
    ? production.sources.flatMap((singleSource) => {
        return singleSource._id
          ? singleSource
          : {
              _id: new ObjectId().toString(),
              type: singleSource.type,
              label: singleSource.label,
              input_slot: singleSource.input_slot,
              html_data:
                (singleSource.type === 'html' && singleSource.html_data) ||
                undefined,
              media_data:
                (singleSource.type === 'mediaplayer' &&
                  singleSource.media_data) ||
                undefined
            };
      })
    : [];

  await db.collection('productions').findOneAndReplace(
    { _id: new ObjectId(id) },
    {
      name: production.name,
      isActive: production.isActive,
      sources: sources,
      preset_name: production.preset_name,
      pipelines: production.pipelines,
      control_connection: production.control_connection,
      outputs: production.outputs,
      multiviews: production.multiviews
    }
  );

  if (!production.isActive) {
    deleteMonitoring(db, id);
  }

  return {
    _id: new ObjectId(id).toString(),
    name: production.name,
    isActive: production.isActive,
    sources: sources,
    preset_name: production.preset_name,
    pipelines: production.pipelines,
    control_connection: production.control_connection,
    outputs: production.outputs,
    multiviews: production.multiviews
  };
}

export async function postProduction(data: Production): Promise<ObjectId> {
  const db = await getDatabase();
  return (
    await db
      .collection('productions')
      .insertOne({ ...data, _id: new ObjectId(data._id) })
  ).insertedId;
}

export async function deleteProduction(id: string): Promise<void> {
  const db = await getDatabase();

  await db.collection('productions').deleteOne({
    _id: { $eq: new ObjectId(id) }
  });
  Log().info('Deleted production', id);

  deleteMonitoring(db, id);
}

function deleteMonitoring(db: Db, productionId: string) {
  db.collection('monitoring').deleteMany({ productionId: productionId });
}

export async function getProductionPipelineSourceAlignment(
  productionId: string,
  pipelineId: string,
  sourceId: number
) {
  const production = await getProduction(productionId);

  if (!production) {
    console.error('Production not found');
    return null;
  }

  const pipeline = production.pipelines.find(
    (p) => p.pipeline_id === pipelineId
  );

  const source = pipeline?.sources?.find(
    (source) => String(source.source_id) === String(sourceId)
  );

  const alignment =
    source?.settings?.alignment_ms !== undefined
      ? source.settings.alignment_ms
      : pipeline?.alignment_ms;

  return alignment;
}

export async function setProductionPipelineSourceAlignment(
  productionId: string,
  pipelineId: string,
  sourceId: number,
  alignment_ms: number
) {
  const db = await getDatabase();

  try {
    const result = await db.collection('productions').updateOne(
      {
        _id: new ObjectId(productionId),
        'pipelines.pipeline_id': pipelineId,
        'pipelines.sources.source_id': sourceId
      },
      {
        $set: {
          'pipelines.$[p].sources.$[s].settings.alignment_ms': alignment_ms
        }
      },
      {
        arrayFilters: [
          { 'p.pipeline_id': pipelineId },
          { 's.source_id': sourceId }
        ]
      }
    );

    if (result.matchedCount === 0) {
      console.error('No matching pipeline or source found to update');
      return null;
    }

    return true;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Error updating pipeline source alignment');
  }
}

export async function getProductionSourceLatency(
  productionId: string,
  pipelineId: string,
  sourceId: number
) {
  const production = await getProduction(productionId);

  if (!production) {
    console.error('Production not found');
    return null;
  }

  const pipeline = production.pipelines.find(
    (p) => p.pipeline_id === pipelineId
  );

  const source = pipeline?.sources?.find(
    (source) => String(source.source_id) === String(sourceId)
  );

  const latency =
    source?.settings?.max_network_latency_ms !== undefined
      ? source.settings.max_network_latency_ms
      : pipeline?.max_network_latency_ms;

  return latency;
}

export async function setProductionPipelineSourceLatency(
  productionId: string,
  pipelineId: string,
  sourceId: number,
  max_network_latency_ms: number
) {
  const db = await getDatabase();

  try {
    const result = await db.collection('productions').updateOne(
      {
        _id: new ObjectId(productionId),
        'pipelines.pipeline_id': pipelineId,
        'pipelines.sources.source_id': sourceId
      },
      {
        $set: {
          'pipelines.$[p].sources.$[s].settings.max_network_latency_ms':
            max_network_latency_ms
        }
      },
      {
        arrayFilters: [
          { 'p.pipeline_id': pipelineId },
          { 's.source_id': sourceId }
        ]
      }
    );

    if (result.matchedCount === 0) {
      console.error('No matching pipeline or source found to update');
      return null;
    }

    return true;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Error updating pipeline source latency');
  }
}

export async function replaceProductionSourceStreamIds(
  productionId: string,
  sourceId: string | ObjectId,
  newStreamUuids: string[]
) {
  const db = await getDatabase();
  const productionObjectId = new ObjectId(productionId);

  const sourceIdForQuery =
    typeof sourceId === 'string' ? sourceId : sourceId.toString();

  const updateResult = await db.collection('productions').updateOne(
    {
      _id: productionObjectId,
      'sources._id': sourceIdForQuery
    },
    {
      $set: {
        'sources.$.stream_uuids': newStreamUuids
      }
    }
  );

  if (updateResult.matchedCount === 0) {
    throw new Error('Production or source not found');
  }

  return updateResult;
}
