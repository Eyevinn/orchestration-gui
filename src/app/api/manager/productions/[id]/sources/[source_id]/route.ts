import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../api/manager/auth';
import { replaceProductionSourceStreamIds } from '../../../../../../../api/manager/productions';
import { Log } from '../../../../../../../api/logger';

type Params = {
  id: string;
  source_id: string;
};

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
    const body = (await request.json()) as { stream_uuids: string[] };
    const prod = await replaceProductionSourceStreamIds(
      params.id,
      params.source_id,
      body.stream_uuids
    );
    return new NextResponse(JSON.stringify(prod), { status: 200 });
  } catch (error) {
    Log().warn('Could not update production source stream ids', error);

    return new NextResponse(`Error searching DB! Error: ${error}`, {
      status: 500
    });
  }
}
