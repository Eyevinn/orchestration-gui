import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../api/manager/auth';
import { getMultiviewPresets } from '../../../../api/manager/multiview-presets';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    return NextResponse.json(await getMultiviewPresets());
  } catch (e) {
    return new NextResponse(JSON.stringify(e), {
      status: 500
    });
  }
}
