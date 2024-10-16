import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../api/manager/auth';
import { Log } from '../../../../../../../api/logger';
import {
  getSourceIdFromSourceName,
  getUuidFromIngestName
} from '../../../../../../../api/ateliereLive/ingest';

type Params = {
  ingest_name: string;
  ingest_source_name: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  if (!(await isAuthenticated())) {
    return new NextResponse(`Not Authorized!`, {
      status: 403
    });
  }

  try {
    const ingestUuid = await getUuidFromIngestName(params.ingest_name);
    const sourceId = ingestUuid
      ? await getSourceIdFromSourceName(ingestUuid, params.ingest_source_name)
      : 0;
    return new NextResponse(JSON.stringify(sourceId), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error getting streams for ingest: ${error}`, {
      status: 500
    });
  }
}
