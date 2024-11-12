import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { deleteSrtSource } from '../../../../../../api/ateliereLive/ingest';
import { Log } from '../../../../../../api/logger';

type Params = {
  ingest_uuid: string;
  ingest_source_id: number;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  return await deleteSrtSource(params.ingest_uuid, params.ingest_source_id)
    .then((response) => {
      return new NextResponse(JSON.stringify(response));
    })
    .catch((error) => {
      Log().error(error);
      const errorResponse = {
        ok: false,
        error: 'Failed to delete SRT source'
      };
      return new NextResponse(JSON.stringify(errorResponse), { status: 500 });
    });
}
