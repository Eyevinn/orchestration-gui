import { NextRequest, NextResponse } from 'next/server';
import { getPresetByid } from '../../../../../api/manager/presets';
import { isAuthenticated } from '../../../../../api/manager/auth';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { putPreset } from '../../../../../api/manager/presets';
import { PresetWithId } from '../../../../../interfaces/preset';
import { Log } from '../../../../../api/logger';

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
    return NextResponse.json(await getPresetByid(params.id));
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
    const body = (await request.json()) as PresetWithId;
    const prod = await putPreset(params.id, body);
    return new NextResponse(JSON.stringify(prod), { status: 200 });
  } catch (error) {
    Log().warn('Could not update preset', error);

    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
