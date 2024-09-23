import { TList } from '../../../../hooks/useCreateInputArray';
import { MultiviewViewsWithId } from '../../../../hooks/useSetupMultiviewLayout';
import { MultiviewPreset } from '../../../../interfaces/preset';
import Options from '../Options';

export default function MultiviewLayout({
  multiviewPresetLayout,
  inputList,
  handleChange
}: {
  multiviewPresetLayout: MultiviewPreset;
  inputList: TList[] | undefined;
  handleChange: (id: number, value: string) => void;
}) {
  return (
    <div
      className={`border-4 border-p/50 relative p-2 m-2`}
      style={{
        width: `${multiviewPresetLayout.layout.output_width}rem`,
        height: `${multiviewPresetLayout.layout.output_height}rem`
      }}
    >
      {(multiviewPresetLayout.layout.views as MultiviewViewsWithId[]).map(
        (singleView: MultiviewViewsWithId) => {
          const { x, y, width, height, label, id } = singleView;
          const previewView = singleView.input_slot === 1002 && y === 0;
          const programView = singleView.input_slot === 1001 && y === 0;

          return (
            <div
              key={x + y}
              className="flex items-center justify-center border-[1px] border-p/50 absolute w-full"
              style={{
                width: `${width}rem`,
                height: `${height}rem`,
                top: `${y}rem`,
                left: `${x}rem`
              }}
            >
              {inputList && (previewView || programView) && (
                <p className="flex items-center">{label}</p>
              )}
              {inputList && !previewView && !programView && (
                <Options
                  label={label}
                  options={inputList.map((singleSource) => ({
                    id: singleSource.id,
                    label: singleSource.label
                  }))}
                  value={label ? label : ''}
                  update={(value) => handleChange(id, value)}
                  columnStyle
                />
              )}
            </div>
          );
        }
      )}
    </div>
  );
}