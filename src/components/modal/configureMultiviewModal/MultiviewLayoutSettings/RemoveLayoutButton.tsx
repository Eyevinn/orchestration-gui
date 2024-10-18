import { IconTrash } from "@tabler/icons-react";

type RemoveLayoutButtonProps = {
  removeMultiviewLayout: () => void;
  deleteDisabled: boolean;
  title: string;
}; 

export default function RemoveLayoutButton({removeMultiviewLayout, deleteDisabled, title}: RemoveLayoutButtonProps) {
  return (
    <button
    type="button"
    title={title}
    className="absolute top-0 right-[-10%] min-w-fit"
    onClick={() => removeMultiviewLayout()}
    disabled={deleteDisabled}
  >
    <IconTrash
      className={`ml-4 ${
        deleteDisabled
          ? 'pointer-events-none text-zinc-400'
          : 'text-button-delete hover:text-red-400'
      }`}
    />
  </button>
  );
}