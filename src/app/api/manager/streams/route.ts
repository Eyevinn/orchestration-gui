import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../api/manager/auth';
import { SourceWithId } from '../../../../interfaces/Source';
import { Production } from '../../../../interfaces/production';
import { createStream } from '../../../../api/ateliereLive/pipelines/streams/streams';
import { Log } from '../../../../api/logger';
import { PipelineSettings } from '../../../../interfaces/pipeline';
export type CreateStreamRequestBody = {
  source: SourceWithId;
  pipelines: PipelineSettings[];
  input_slot: number;
};
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const data = await request.json();
  const createStreamRequest = data as CreateStreamRequestBody;

  return await createStream(
    createStreamRequest.source,
    createStreamRequest.pipelines,
    createStreamRequest.input_slot
  )
    .then((response) => {
      return new NextResponse(JSON.stringify(response));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: 'unexpected'
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}
