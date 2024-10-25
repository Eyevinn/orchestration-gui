import { NextRequest, NextResponse } from 'next/server';
import { stopProduction } from '../../../../api/manager/workflow';
import { Log } from '../../../../api/logger';
import { isAuthenticated } from '../../../../api/manager/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const { production } = await request.json();
  return stopProduction(production)
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
