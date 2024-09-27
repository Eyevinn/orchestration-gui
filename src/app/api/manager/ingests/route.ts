import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../api/manager/auth';
import { getIngests } from '../../../../api/ateliereLive/ingest';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  const ingests = await getIngests();
  return new NextResponse(JSON.stringify(ingests));
}
