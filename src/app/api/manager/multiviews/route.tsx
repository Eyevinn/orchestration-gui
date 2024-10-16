import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../api/manager/auth';
import {
  deleteLayouts,
  getMultiviewLayouts,
  putMultiviewLayout
} from '../../../../api/manager/multiviews';
import { MultiviewPreset } from '../../../../interfaces/preset';
import { Log } from '../../../../api/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    return NextResponse.json(await getMultiviewLayouts());
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    const body = (await request.json()) as MultiviewPreset;
    const newMultiviewLayout = await putMultiviewLayout(body);
    return new NextResponse(JSON.stringify(newMultiviewLayout), {
      status: 200
    });
  } catch (error) {
    Log().warn('Could not update layout', error);
    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }
  try {
    const productionId = await request.json();
    await deleteLayouts(productionId);
    return new NextResponse(null, {
      status: 200
    });
  } catch (error) {
    console.log(error);
    return new NextResponse(
      `Error occurred while posting to DB! Error: ${error}`,
      {
        status: 500
      }
    );
  }
}
