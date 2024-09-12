import { SourceWithId } from '../interfaces/Source';
import { getThumbnail } from './mockedThumbnails';

export function getSourceThumbnail(source: SourceWithId) {
  if (source.ingest_name.startsWith(`eyevinn-`)) {
    return getThumbnail('camera');
  }
  return `/api/manager/sources/${source.ingest_name}/${source.ingest_source_name}/thumbnail`;
}
