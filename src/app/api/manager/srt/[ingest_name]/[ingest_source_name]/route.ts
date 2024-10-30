import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../api/manager/auth';
import { deleteSrtSource } from '../../../../../../api/ateliereLive/ingest';
import { Log } from '../../../../../../api/logger';
import {
  getUuidFromIngestName,
  getSourceIdFromSourceName
} from '../../../../../../api/ateliereLive/ingest';

type Params = {
  ingest_name: string;
  ingest_source_name: string;
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

  const ingestUuid = await getUuidFromIngestName(params.ingest_name, false);
  const sourceId = ingestUuid
    ? await getSourceIdFromSourceName(
        ingestUuid,
        params.ingest_source_name,
        false
      )
    : 0;
  return await deleteSrtSource(ingestUuid || '', sourceId || 0)
    .then((response) => {
      return new NextResponse(JSON.stringify(response));
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
