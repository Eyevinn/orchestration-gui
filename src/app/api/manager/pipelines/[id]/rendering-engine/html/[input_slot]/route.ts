import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../../api/manager/auth';
import { deleteHtmlFromPipeline } from '../../../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { MultiviewSettings } from '../../../../../../../../interfaces/multiview';
import { updateMultiviewForPipeline } from '../../../../../../../../api/ateliereLive/pipelines/multiviews/multiviews';
import { DeleteRenderingEngineSourceStep } from '../../../../../../../../interfaces/Source';
import { Result } from '../../../../../../../../interfaces/result';
import { Log } from '../../../../../../../../api/logger';

type Params = {
  id: string;
  input_slot: number;
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
    await deleteHtmlFromPipeline(params.id, params.input_slot).catch((e) => {
      Log().error(`Failed to delete html: ${params.id}: ${e.message}`);
      throw `Failed to delete html: ${params.id}: ${e.message}`;
    });
    if (!multiview || multiview.length === 0) {
      return new NextResponse(
        JSON.stringify({
          ok: true,
          value: [
            {
              step: 'delete_html',
              success: true
            }
          ]
        })
      );
    }
  } catch (e) {
    if (typeof e !== 'string') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          value: [
            {
              step: 'delete_html',
              success: false,
              message: `Failed to delete html`
            }
          ],
          error: 'Delete html failed'
        } satisfies Result<DeleteRenderingEngineSourceStep[]>)
      );
    }
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_html',
            success: false,
            message: `Failed to delete html: ${params.id}: ${e}`
          }
        ],
        error: e
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  }

  try {
    const multiviewUpdates = multiview.map(async (singleMultiview) => {
      if (!singleMultiview.multiview_id) {
        throw `The provided multiview settings did not contain any multiview id`;
      }
      return updateMultiviewForPipeline(
        params.id,
        singleMultiview.multiview_id,
        singleMultiview.layout.views
      ).catch((e) => {
        throw `Error when updating multiview: ${e.message}`;
      });
    });

    await Promise.all(multiviewUpdates);

    return new NextResponse(
      JSON.stringify({
        ok: true,
        value: [
          {
            step: 'delete_html',
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
    if (typeof e !== 'string') {
      return new NextResponse(
        JSON.stringify({
          ok: false,
          value: [
            {
              step: 'delete_html',
              success: true
            },
            {
              step: 'update_multiview',
              success: false,
              message: `Failed to update multiview`
            }
          ],
          error: 'Failed to update multiview'
        } satisfies Result<DeleteRenderingEngineSourceStep[]>)
      );
    }
    return new NextResponse(
      JSON.stringify({
        ok: false,
        value: [
          {
            step: 'delete_html',
            success: true
          },
          {
            step: 'update_multiview',
            success: false,
            message: `Failed to update multiview: ${e}`
          }
        ],
        error: e
      } satisfies Result<DeleteRenderingEngineSourceStep[]>)
    );
  }
}
