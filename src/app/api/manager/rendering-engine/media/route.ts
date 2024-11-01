import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { createPipelineMediaSource } from '../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { Log } from '../../../../../api/logger';
import { MediaSource } from '../../../../../interfaces/renderingEngine';
import { Production } from '../../../../../interfaces/production';
import { SourceReference } from '../../../../../interfaces/Source';
import { PipelineSettings } from '../../../../../interfaces/pipeline';

export type CreateMediaRequestBody = {
  pipelines: PipelineSettings[];
  mediaBody: MediaSource;
  inputSlot: number;
  source: SourceReference;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const data = await request.json();
  const createMediaRequest = data as CreateMediaRequestBody;

  return await createPipelineMediaSource(
    createMediaRequest.pipelines,
    createMediaRequest.inputSlot,
    createMediaRequest.mediaBody,
    createMediaRequest.source
  )
    .then((response) => {
      return new NextResponse(JSON.stringify(response));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: error
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}
