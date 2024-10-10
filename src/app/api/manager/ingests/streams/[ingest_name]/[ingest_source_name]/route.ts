import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '../../../../../../../api/manager/auth';
import {
  getUuidFromIngestName,
  getIngestStreams,
  getSourceIdFromSourceName
} from '../../../../../../../api/ateliereLive/ingest';

type Params = {
  ingest_name: string;
  ingest_source_name: string;
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
    const ingestUuid = await getUuidFromIngestName(params.ingest_name);
    const sourceId = ingestUuid
      ? await getSourceIdFromSourceName(ingestUuid, params.ingest_source_name)
      : 0;
    const ingestStreams = ingestUuid ? await getIngestStreams(ingestUuid) : [];
    const sourceStreams = ingestStreams.filter(
      (stream) => stream.source_id === sourceId
    );
    return new NextResponse(JSON.stringify(sourceStreams), { status: 200 });
  } catch (error) {
    return new NextResponse(`Error getting streams for ingest: ${error}`, {
      status: 500
    });
  }
}
