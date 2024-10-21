import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { createPipelineHtmlSource } from '../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';
import { Log } from '../../../../../api/logger';
import { HTMLSource } from '../../../../../interfaces/renderingEngine';
import { Production } from '../../../../../interfaces/production';
import { SourceReference } from '../../../../../interfaces/Source';

export type CreateHtmlRequestBody = {
  production: Production;
  htmlBody: HTMLSource;
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
  const createHtmlRequest = data as CreateHtmlRequestBody;

  return await createPipelineHtmlSource(
    createHtmlRequest.production,
    createHtmlRequest.inputSlot,
    createHtmlRequest.htmlBody,
    createHtmlRequest.source
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
