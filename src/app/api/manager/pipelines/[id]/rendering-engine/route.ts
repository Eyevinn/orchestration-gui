import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { getPipelineRenderingEngine } from '../../../../../../api/ateliereLive/pipelines/renderingengine/renderingengine';

type Params = {
  id: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    const renderingEngine = await getPipelineRenderingEngine(params.id);
    return new NextResponse(
      JSON.stringify({
        renderingEngine
      }),
      {
        status: 200
      }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(
      `Error getting rendering engine for pipeline! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
