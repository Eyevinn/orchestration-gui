import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../../../api/manager/auth';
import { deleteMediaFromPipeline } from '../../../../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { MultiviewSettings } from '../../../../../../../../../interfaces/multiview';
import { updateMultiviewForPipeline } from '../../../../../../../../../api/ateliereLive/pipelines/multiviews/multiviews';
import { DeleteRenderingEngineSourceStep } from '../../../../../../../../../interfaces/Source';
import { Result } from '../../../../../../../../../interfaces/result';
import { Log } from '../../../../../../../../../api/logger';

type Params = {
  id: string;
  input_slot: number;
  ld_pipeline_id: string;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const body = await request.json();
  const multiview = body.multiview as MultiviewSettings[];

  try {
    await deleteMediaFromPipeline(params.id, params.input_slot).catch((e) => {
      Log().error(`Failed to delete media: ${params.id}: ${e.message}`);
      throw `Failed to delete media: ${params.id}: ${e.message}`;
    });
    if (!multiview || multiview.length === 0) {
      return new NextResponse(
        JSON.stringify({
          ok: true,
          value: [
            {
              step: 'delete_media',
              success: true
            }
          ]
        })
      );
    }
  } catch (e) {
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_media',
            success: false,
            message: `Failed to delete media`
          }
        ],
        error: typeof e === 'string' ? e : 'Failed to delete media'
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  }
  try {
    const multiviewUpdates = multiview.map(async (singleMultiview) => {
      if (!singleMultiview.multiview_id) {
        throw `The provided multiview settings did not contain any multiview id`;
      }
      if (params.id === params.ld_pipeline_id) {
        return updateMultiviewForPipeline(
          params.id,
          singleMultiview.multiview_id,
          singleMultiview.layout.views
        ).catch((e) => {
          throw `Error when updating multiview: ${e.message}`;
        });
      }
    });

    await Promise.all(multiviewUpdates);

    return new NextResponse(
      JSON.stringify({
        ok: true,
        value: [
          {
            step: 'delete_media',
            success: true
          },
          {
            step: 'update_multiview',
            success: true
          }
        ]
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  } catch (e) {
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_media',
            success: true
          },
          {
            step: 'update_multiview',
            success: false,
            message: `Failed to update multiview: ${e}`
          }
        ],
        error: typeof e === 'string' ? e : 'Failed to update multiview'
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  }
}
