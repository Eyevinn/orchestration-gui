import { useEffect, useState } from 'react';
import { MultiviewPreset } from '../interfaces/preset';
import { MultiviewViews } from '../interfaces/multiview';

export function useSetupMultiviewLayout(preset: MultiviewPreset | null) {
  const [multiviewPreset, setMultiviewPreset] = useState<MultiviewPreset>();
  useEffect(() => {
    if (preset) {
      const downScale = 30;
      const arr: MultiviewViews[] = [];
      preset.layout.views.map((view, index) => {
        arr.push({
          ...view,
          x: view.x / downScale,
          y: view.y / downScale,
          height: view.height / downScale,
          width: view.width / downScale,
          id: index.toString()
        });
      });
      return setMultiviewPreset({
        ...preset,
        layout: {
          ...preset.layout,
          output_height: preset.layout.output_height / downScale + 0.5,
          output_width: preset.layout.output_width / downScale + 0.5,
          views: arr
        }
      });
    }
  }, [preset]);
  return { multiviewPresetLayout: multiviewPreset };
}
