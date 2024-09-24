import { NextRequest, NextResponse } from 'next/server';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { getMultiviewPreset } from '../../../../api/manager/multiview-presets';
import { isAuthenticated } from '../../../../api/manager/auth';

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
    return NextResponse.json(await getMultiviewPreset(params.id));
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}
