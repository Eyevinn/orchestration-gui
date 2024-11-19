import { IconTrash } from '@tabler/icons-react';

type RemoveLayoutButtonProps = {
  removeMultiviewLayout: () => void;
  deleteDisabled: boolean;
  title: string;
  hidden: boolean;
};

export default function RemoveLayoutButton({
  removeMultiviewLayout,
  deleteDisabled,
  title,
  hidden
}: RemoveLayoutButtonProps) {
  const setIconStyling = () => {
    if (deleteDisabled && !hidden) {
      return 'pointer-events-none text-zinc-400';
    }
    if (!deleteDisabled && !hidden) {
      return 'text-button-delete hover:text-red-400';
    }
    if (hidden) {
      return 'pointer-events-none text-gray-800';
    }
  };

  return (
    <button
      type="button"
      className={`flex items-center flex-row mb-5 pl-2 w-[50%]  ${
        deleteDisabled || hidden ? '' : 'hover:cursor-pointer'
      }`}
      disabled={hidden || deleteDisabled}
    >
      <div
        title={title}
        className={`w-6 h-6 ${
          deleteDisabled || hidden ? '' : 'hover:cursor-pointer'
        }`}
        onClick={() => removeMultiviewLayout()}
      >
        <IconTrash className={setIconStyling()} />
      </div>
    </button>
  );
}
