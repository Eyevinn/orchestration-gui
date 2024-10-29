import { SourceReference } from '../../interfaces/Source';
import { Production } from '../../interfaces/production';

export function addSetupItem(
  source: SourceReference,
  productionSetup: Production
) {
  const multiviews =
    productionSetup.production_settings.pipelines[0].multiviews;
  if (!multiviews || multiviews.length === 0) return;
  return {
    ...productionSetup,
    sources: [
      ...productionSetup.sources,
      {
        _id: source._id,
        type: source.type,
        label: source.label,
        stream_uuids: source.stream_uuids,
        input_slot: source.input_slot,
        html_data: source.html_data,
        media_data: source.media_data
      }
    ].sort((a, b) => a.input_slot - b.input_slot)
  };
}
