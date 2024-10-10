import {
  ResourcesCompactIngestResponse,
  ResourcesCompactPipelineResponse,
  ResourcesConnectionUUIDResponse
} from '../../../types/ateliere-live';
import { FlowStep, TeardownStepNames } from '../../interfaces/production';
import { Result } from '../../interfaces/result';
import { disconnectReceiver } from '../ateliereLive/controlconnections';
import {
  deleteSrtSource,
  getIngests,
  getIngestSources
} from '../ateliereLive/ingest';
import {
  deleteMultiviewFromPipeline,
  getMultiviewsForPipeline
} from '../ateliereLive/pipelines/multiviews/multiviews';
import {
  getPipelineOutputs,
  stopAllOutputStreamsByUuid
} from '../ateliereLive/pipelines/outputs/outputs';
import {
  getPipelines,
  removePipelineStreams,
  resetPipeline
} from '../ateliereLive/pipelines/pipelines';
import { deleteStreamByUuid } from '../ateliereLive/streams';

export interface TeardownOptions {
  pipelines?: ResourcesCompactPipelineResponse[];
  resetPipelines?: boolean;
  deleteIngestSRTSources?: boolean;
}

export async function teardown(
  options: TeardownOptions
): Promise<Result<FlowStep[]>> {
  const {
    pipelines: pipes,
    resetPipelines = true,
    deleteIngestSRTSources = true
  } = options;

  const steps: FlowStep[] = [];

  const addStep = (name: TeardownStepNames, success: boolean, error?: any) => {
    steps.push({
      step: name,
      success,
      message: typeof error === 'string' ? error : ''
    });
  };

  const generateResponse = (ok: boolean): Result<FlowStep[]> => {
    if (ok) return { ok, value: steps };
    return {
      ok,
      value: steps,
      error: steps[steps.length - 1]?.message || 'Unknown error occured'
    };
  };

  // PIPELINES
  // STEP 1
  // FETCH PIPELINES
  let pipelines: ResourcesCompactPipelineResponse[];

  if (pipes) {
    pipelines = pipes;
  } else {
    try {
      pipelines = await getPipelines().catch(() => {
        throw 'Failed to fetch pipelines';
      });
    } catch (e) {
      addStep('pipeline_output_streams', false, 'Failed to fetch pipelines');
      return generateResponse(false);
    }
  }

  // STEP 2
  // FETCH PIPELINE OUTPUTS
  // DELETE PIPELINE OUTPUT STREAMS
  try {
    for (const pipeline of pipelines) {
      const outputs = await getPipelineOutputs(pipeline.uuid).catch(() => {
        throw `Failed to fetch outputs for pipeline ${pipeline.name}`;
      });
      for (const output of outputs) {
        if (output.active_streams?.length) {
          await stopAllOutputStreamsByUuid(pipeline.uuid, output.uuid).catch(
            (e) => {
              console.log(e);
              throw `Failed to delete streams for output ${output.name} in pipeline ${pipeline.name}`;
            }
          );
        }
      }
    }
    addStep('pipeline_output_streams', true);
  } catch (e) {
    addStep('pipeline_output_streams', false, e);
    return generateResponse(false);
  }

  // STEP 3
  // FETCH PIPELINE MULTIVIEWERS
  // DELETE PIPELINE MULTIVIEWERS
  try {
    for (const pipeline of pipelines) {
      const multiviewers = await getMultiviewsForPipeline(pipeline.uuid).catch(
        () => {
          throw `Failed to fetch multiviewers for pipeline ${pipeline.name}`;
        }
      );
      for (const multiviewer of multiviewers) {
        await deleteMultiviewFromPipeline(pipeline.uuid, multiviewer.id).catch(
          () => {
            throw `Failed to delete multiviewer ${multiviewer.id} in pipeline ${pipeline.name}`;
          }
        );
      }
    }
    addStep('pipeline_multiviewers', true);
  } catch (e) {
    addStep('pipeline_multiviewers', false, e);
    return generateResponse(false);
  }

  // STEP 4
  // FETCH PIPELINE STREAMS
  // DELETE PIPELINE STREAMS
  try {
    for (const pipeline of pipelines) {
      await removePipelineStreams(pipeline.uuid).catch(() => {
        throw `Failed to delete streams for pipeline ${pipeline.name}`;
      });
    }
    addStep('pipeline_streams', true);
  } catch (e) {
    addStep('pipeline_streams', false, e);
    return generateResponse(false);
  }

  // STEP 5
  // DELETE PIPELINE CONNECTIONS
  try {
    for (const pipeline of pipelines) {
      const connections: ResourcesConnectionUUIDResponse[] = [
        ...(pipeline.control_receiver?.incoming_connections || []),
        ...(pipeline.control_receiver?.outgoing_connections || [])
      ];

      for (const connection of connections) {
        await disconnectReceiver(connection.connection_uuid).catch(() => {
          throw `Failed to disconnect connection ${connection.connection_uuid} in pipeline ${pipeline.name}`;
        });
      }
    }
    addStep('pipeline_control_connections', true);
  } catch (e) {
    addStep('pipeline_control_connections', false, e);
    return generateResponse(false);
  }

  // STEP 6
  // RESET PIPELINES
  // ONLY DO THIS STEP IF ENABLED IN OPTIONS
  if (resetPipelines) {
    try {
      for (const pipeline of pipelines) {
        await resetPipeline(pipeline.uuid).catch((e) => {
          throw `Failed to reset pipeline ${pipeline.name}`;
        });
      }
      addStep('reset_pipelines', true);
    } catch (e) {
      addStep('reset_pipelines', false, e);
      return generateResponse(false);
    }
  }

  // INGESTS
  // DO NOT DO THESE STEPS IF PIPELINES WERE SPECIFIED IN THE OPTIONS
  if (!pipes) {
    let ingests: ResourcesCompactIngestResponse[];
    // STEP 7
    // FETCH INGESTS
    try {
      ingests = await getIngests().catch((e) => {
        throw 'Failed to fetch ingests';
      });
    } catch (e) {
      addStep('ingest_streams', false, 'Failed to fetch ingests');
      return generateResponse(false);
    }

    // STEP 8
    // DELETE INGEST STREAMS
    try {
      for (const ingest of ingests) {
        for (const stream of ingest.streams) {
          await deleteStreamByUuid(stream.uuid).catch((e) => {
            throw `Failed to delete stream ${stream.uuid} for ingest ${ingest.name}`;
          });
        }
      }
      addStep('ingest_streams', true);
    } catch (e) {
      addStep('ingest_streams', false, e);
      return generateResponse(false);
    }

    // STEP 9
    // DELETE INGEST SRC SOURCES
    // ONLY DO THIS STEP IF ENABLED IN OPTIONS
    if (deleteIngestSRTSources) {
      try {
        for (const ingest of ingests) {
          const sources = await getIngestSources(ingest.uuid);
          for (const source of sources) {
            if (source.type.includes('SRT')) {
              await deleteSrtSource(ingest.uuid, source.source_id).catch(
                (e) => {
                  throw `Failed to delete SRT source ${source.name} for ingest ${ingest.name}`;
                }
              );
            }
          }
        }
        addStep('ingest_src_sources', true);
      } catch (e) {
        addStep('ingest_src_sources', false, e);
        return generateResponse(false);
      }
    }
  }

  // STEP 10
  // CHECK THAT EVERYTHING WAS REMOVED/DISCONNECTED/DELETED
  try {
    const newPipelines = await getPipelines().catch((e) => {
      throw 'Failed to fetch pipelines';
    });

    for (const pipeline of newPipelines) {
      // CHECK IF ALL OUTPUT STREAMS HAVE BEEN STOPPED
      const outputs = await getPipelineOutputs(pipeline.uuid).catch((e) => {
        throw `Failed to fetch outputs for pipeline ${pipeline.name}`;
      });
      for (const output of outputs) {
        if (output.active_streams && output.active_streams.length)
          throw `Failed to stop all active streams for output ${output.name} in pipeline ${pipeline.name}`;
      }
      // CHECK IF ALL MULTIVIEWERS HAVE BEEN DELETED
      const multiviewers = await getMultiviewsForPipeline(pipeline.uuid).catch(
        () => {
          throw `Failed to fetch multiviewers for pipeline ${pipeline.name}`;
        }
      );
      if (multiviewers?.length)
        throw `Failed to delete all multiviewers for pipeline ${pipeline.name}`;
      // CHECK IF ALL PIPELINE STREAMS HAVE BEEN STOPPED
      if (pipeline.streams?.length)
        throw `Failed to stop all streams for pipeline ${pipeline.name}`;
      // CHECK IF ALL PIPELINE CONNECTIONS HAVE BEEN DISCONNECTED
      if (pipeline.control_receiver?.incoming_connections?.length)
        throw `Failed to disconnect all incoming connections to the control receiver of pipeline ${pipeline.name}`;
      if (pipeline.control_receiver?.outgoing_connections?.length)
        throw `Failed to disconnect all outgoing connections from the control receiver of pipeline ${pipeline.name}`;
    }

    if (!pipes) {
      const ingests = await getIngests().catch((e) => {
        throw 'Failed to fetch ingests';
      });

      for (const ingest of ingests) {
        // CHECK IF ALL INGEST STREAMS HAVE BEEN STOPPED
        if (ingest.streams?.length)
          throw `Failed to stop ingest streams for ingest ${ingest.name}`;
        // CHECK IF ALL SRT SOURCES HAVE BEEN DELETED
        // ONLY IF DELETE INGEST SRT SOURCES IS SET TO TRUE IN OPTIONS (DEFAULT)
        if (deleteIngestSRTSources && ingest.sources?.length) {
          const sources = await getIngestSources(ingest.uuid);
          for (const source of sources) {
            if (source.type.includes('SRT')) {
              throw `Failed to delete SRT source ${source.name} for ingest ${ingest.name}`;
            }
          }
        }
      }
    }
    addStep('teardown_check', true);
    return generateResponse(true);
  } catch (e) {
    addStep('teardown_check', false, e);
    return generateResponse(false);
  }
}
