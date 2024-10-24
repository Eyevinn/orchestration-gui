import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { getIngestSources } from '../../../../../../api/ateliereLive/ingest';

type Params = {
  id: string;
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
    const ingestSources = await getIngestSources(params.id);
    return new NextResponse(JSON.stringify(ingestSources), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error getting sources for ingest: ${error}`, {
      status: 500
    });
  }
}
