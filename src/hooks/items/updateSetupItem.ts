import { Production } from '../../interfaces/production';
import { SourceReference } from '../../interfaces/Source';

export function updateSetupItem(
  source: SourceReference,
  sources: SourceReference[]
) {
  sources.forEach((tempItem, index) => {
    if (tempItem._id === source._id) {
      sources[index].label = source.label;
    }
  });
  return sources;
}
