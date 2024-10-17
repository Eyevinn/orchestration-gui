import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { updateMultiviewForPipeline } from '../../../../../api/ateliereLive/pipelines/multiviews/multiviews';
import { MultiviewViews } from '../../../../../interfaces/multiview';
import {
  deleteLayout,
  getMultiviewLayout
} from '../../../../../api/manager/multiviews';

type PutMultiviewRequest = {
  pipelineId: string;
  multiviews: MultiviewViews[];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    return NextResponse.json(await getMultiviewLayout(params.id));
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const data = (await request.json()) as PutMultiviewRequest;
    return NextResponse.json(
      await updateMultiviewForPipeline(
        data.pipelineId,
        params.id,
        data.multiviews
      )
    );
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    await deleteLayout(params.id);
    return new NextResponse(null, {
      status: 200
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(
      `Error occurred while deleting from DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
