import { Modal } from './Modal';
import { useTranslate } from '../../i18n/useTranslate';
import { Button } from '../button/Button';
import { Loader } from '../loader/Loader';

type ConfigureAlignmentModalProps = {
  open: boolean;
  onAbort: () => void;
  onConfirm: () => void;
  loading: boolean;
};

export function ConfigureAlignmentModal({
  open,
  onAbort,
  onConfirm,
  loading
}: ConfigureAlignmentModalProps) {
  const t = useTranslate();

  return (
    <Modal open={open} outsideClick={onAbort}>
      <div className="text-center flex flex-col items-center">
        <h1 className="text-2xl">Configure alignment</h1>
        <Button className="min-w-fit" onClick={onConfirm}>
          {loading ? <Loader className="w-10 h-5" /> : 'Update alignment'}
        </Button>
      </div>
    </Modal>
  );
}
