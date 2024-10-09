import { NextRequest, NextResponse } from 'next/server';
import { Log } from '../../../../api/logger';
import { isAuthenticated } from '../../../../api/manager/auth';
import { teardown } from '../../../../api/manager/teardown';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const options = await request.json();

  return teardown(options)
    .then((result) => {
      return new NextResponse(JSON.stringify(result));
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
