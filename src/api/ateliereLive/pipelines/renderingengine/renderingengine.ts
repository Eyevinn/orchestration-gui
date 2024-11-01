import {
  ResourcesHTMLBrowser,
  ResourcesMediaPlayer,
  ResourcesRenderingEngineResponse
} from '../../../../../types/ateliere-live';
import { LIVE_BASE_API_PATH } from '../../../../constants';
import { MultiviewSettings } from '../../../../interfaces/multiview';
import {
  HTMLSource,
  MediaSource
} from '../../../../interfaces/renderingEngine';
import { SourceReference } from '../../../../interfaces/Source';
import { Log } from '../../../logger';
import { getAuthorizationHeader } from '../../utils/authheader';
import {
  getMultiviewsForPipeline,
  updateMultiviewForPipeline
} from '../multiviews/multiviews';
import { PipelineSettings } from '../../../../interfaces/pipeline';

export async function getPipelineHtmlSources(
  pipelineUuid: string
): Promise<ResourcesHTMLBrowser[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/html`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  throw await response.json();
}

export async function createPipelineHtmlSource(
  pipelines: PipelineSettings[],
  inputSlot: number,
  data: HTMLSource,
  source: SourceReference
) {
  try {
    const htmlResults = [];

    for (let i = 0; i < pipelines.length; i++) {
      const response = await fetch(
        new URL(
          LIVE_BASE_API_PATH +
            `/pipelines/${pipelines[i].pipeline_id}/renderingengine/html`,
          process.env.LIVE_URL
        ),
        {
          method: 'POST',
          headers: {
            authorization: getAuthorizationHeader()
          },
          body: JSON.stringify({
            height: Number(data.height),
            input_slot: Number(inputSlot),
            url: data.url || '',
            width: Number(data.width)
          })
        }
      );

      if (response.ok) {
        const text = await response.text();
        const jsonResponse = text ? JSON.parse(text) : {};
        htmlResults.push(jsonResponse);
      } else {
        throw await response.json();
      }
    }
  } catch (e) {
    Log().error('Could not add html');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_html',
              success: false
            }
          ]
        },
        error: 'Could not add html'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_html',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }

  try {
    if (!pipelines[0].pipeline_id) {
      Log().error(`Missing pipeline_id for: ${pipelines[0].pipeline_name}`);
      throw `Missing pipeline_id for: ${pipelines[0].pipeline_name}`;
    }
    const multiviewsResponse = await getMultiviewsForPipeline(
      pipelines[0].pipeline_id
    );

    const multiviews = multiviewsResponse.filter((multiview) => {
      const pipeline = pipelines[0];
      const multiviewArray = pipeline.multiviews;

      if (Array.isArray(multiviewArray)) {
        return multiviewArray.some(
          (item) => item.multiview_id === multiview.id
        );
      } else if (multiviewArray) {
        return (
          (multiviewArray as MultiviewSettings).multiview_id === multiview.id
        );
      }

      return false;
    });

    if (multiviews.length === 0 || !multiviews) {
      Log().error(
        `No multiview found for pipeline: ${pipelines[0].pipeline_id}`
      );
      throw `No multiview found for pipeline: ${pipelines[0].pipeline_id}`;
    }

    await Promise.all(
      multiviews.map(async (multiview) => {
        const views = multiview.layout.views;
        const viewsForSource = views.filter(
          (view) => view.input_slot === inputSlot
        );
        if (!viewsForSource || viewsForSource.length === 0) {
          Log().info(
            `No view found for input slot: ${inputSlot}. Will not connect source to view`
          );
          return {
            ok: true,
            value: {
              success: true,
              steps: [
                {
                  step: 'add_html',
                  success: true
                },
                {
                  step: 'update_multiview',
                  success: true
                }
              ]
            }
          };
        }
        const updatedViewsForSource = viewsForSource.map((v) => {
          return { ...v, label: source.label };
        });

        const updatedViews = [
          ...views.filter((view) => view.input_slot !== inputSlot),
          ...updatedViewsForSource
        ];

        await updateMultiviewForPipeline(
          pipelines[0].pipeline_id!,
          multiview.id,
          updatedViews
        );
      })
    );
  } catch (e) {
    Log().error('Could not update multiview');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_html',
              success: true
            },
            {
              step: 'update_multiview',
              success: false
            }
          ]
        },
        error: 'Could not update multiview'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_html',
            success: true
          },
          {
            step: 'update_multiview',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }

  return {
    ok: true,
    value: {
      success: true,
      steps: [
        {
          step: 'add_html',
          success: true
        },
        {
          step: 'update_multiview',
          success: true
        }
      ]
    }
  };
}

export async function deleteHtmlFromPipeline(
  pipelineUuid: string,
  inputSlot: number
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUuid}/renderingengine/html/${inputSlot}`,
      process.env.LIVE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      }
    }
  );
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  throw await response.json();
}

export async function getPipelineMediaSources(
  pipelineUuid: string
): Promise<ResourcesMediaPlayer[]> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine/media`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      },
      next: {
        revalidate: 0
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
}

export async function createPipelineMediaSource(
  pipelines: PipelineSettings[],
  inputSlot: number,
  data: MediaSource,
  source: SourceReference
) {
  try {
    const mediaResults = [];

    for (let i = 0; i < pipelines.length; i++) {
      const response = await fetch(
        new URL(
          LIVE_BASE_API_PATH +
            `/pipelines/${pipelines[i].pipeline_id}/renderingengine/media`,
          process.env.LIVE_URL
        ),
        {
          method: 'POST',
          headers: {
            authorization: getAuthorizationHeader()
          },
          body: JSON.stringify({
            filename: data.filename,
            input_slot: Number(inputSlot)
          })
        }
      );
      if (response.ok) {
        const text = await response.text();
        const jsonResponse = text ? JSON.parse(text) : {};
        mediaResults.push(jsonResponse);
      } else {
        throw await response.json();
      }
    }
  } catch (e) {
    Log().error('Could not add media');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_media',
              success: false
            }
          ]
        },
        error: 'Could not add media'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_media',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }

  try {
    if (pipelines[0].pipeline_id) {
      Log().error(`Missing pipeline_id for: ${pipelines[0].pipeline_name}`);
      throw `Missing pipeline_id for: ${pipelines[0].pipeline_name}`;
    }
    const multiviewsResponse = await getMultiviewsForPipeline(
      pipelines[0].pipeline_id || ''
    );

    const multiviews = multiviewsResponse.filter((multiview) => {
      const pipeline = pipelines[0];
      const multiviewArray = pipeline.multiviews;

      if (Array.isArray(multiviewArray)) {
        return multiviewArray.some(
          (item) => item.multiview_id === multiview.id
        );
      } else if (multiviewArray) {
        return (
          (multiviewArray as MultiviewSettings).multiview_id === multiview.id
        );
      }

      return false;
    });

    if (multiviews.length === 0 || !multiviews) {
      Log().error(
        `No multiview found for pipeline: ${pipelines[0].pipeline_id}`
      );
      throw `No multiview found for pipeline: ${pipelines[0].pipeline_id}`;
    }

    await Promise.all(
      multiviews.map(async (multiview) => {
        const views = multiview.layout.views;
        const viewsForSource = views.filter(
          (view) => view.input_slot === inputSlot
        );
        if (!viewsForSource || viewsForSource.length === 0) {
          Log().info(
            `No view found for input slot: ${inputSlot}. Will not connect source to view`
          );
          return {
            ok: true,
            value: {
              success: true,
              steps: [
                {
                  step: 'add_media',
                  success: true
                },
                {
                  step: 'update_multiview',
                  success: true
                }
              ]
            }
          };
        }
        const updatedViewsForSource = viewsForSource.map((v) => {
          return { ...v, label: source.label };
        });

        const updatedViews = [
          ...views.filter((view) => view.input_slot !== inputSlot),
          ...updatedViewsForSource
        ];

        await updateMultiviewForPipeline(
          pipelines[0].pipeline_id!,
          multiview.id,
          updatedViews
        );
      })
    );
  } catch (e) {
    Log().error('Could not update multiview');
    Log().error(e);
    if (typeof e !== 'string') {
      return {
        ok: false,
        value: {
          success: false,
          steps: [
            {
              step: 'add_media',
              success: true
            },
            {
              step: 'update_multiview',
              success: false
            }
          ]
        },
        error: 'Could not update multiview'
      };
    }
    return {
      ok: false,
      value: {
        success: false,
        steps: [
          {
            step: 'add_media',
            success: true
          },
          {
            step: 'update_multiview',
            success: false,
            message: e
          }
        ]
      },
      error: e
    };
  }
}

export async function deleteMediaFromPipeline(
  pipelineUuid: string,
  inputSlot: number
): Promise<void> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH +
        `/pipelines/${pipelineUuid}/renderingengine/media/${inputSlot}`,
      process.env.LIVE_URL
    ),
    {
      method: 'DELETE',
      headers: {
        authorization: getAuthorizationHeader()
      }
    }
  );
  if (response.ok) {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }
  throw await response.json();
}

export async function getPipelineRenderingEngine(
  pipelineUuid: string
): Promise<ResourcesRenderingEngineResponse> {
  const response = await fetch(
    new URL(
      LIVE_BASE_API_PATH + `/pipelines/${pipelineUuid}/renderingengine`,
      process.env.LIVE_URL
    ),
    {
      method: 'GET',
      headers: {
        authorization: getAuthorizationHeader()
      }
    }
  );
  if (response.ok) {
    return await response.json();
  }
  throw await response.json();
}
