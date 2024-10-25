import { IconTrash } from '@tabler/icons-react';
import { hi } from 'date-fns/locale';

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
  const handleCheckboxChange = () => {
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
      title={title}
      className="flex items-center flex-row mb-5 pl-2 w-[50%]"
      onClick={() => removeMultiviewLayout()}
      disabled={deleteDisabled}
    >
      <IconTrash className={handleCheckboxChange()} />
    </button>
  );
}
