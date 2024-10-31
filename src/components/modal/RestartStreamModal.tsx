import { Modal } from './Modal';
import { useTranslate } from '../../i18n/useTranslate';
import { Loader } from '../loader/Loader';
import { Button } from '../button/Button';

type RestartStreamModalProps = {
  open: boolean;
  loading: boolean;
  onAbort: () => void;
  onConfirm: () => void;
};

export function RestartStreamModal({
  open,
  loading,
  onAbort,
  onConfirm
}: RestartStreamModalProps) {
  const t = useTranslate();

  const handleRestart = () => {
    onConfirm();
    onAbort();
  };

  return (
    <Modal open={open} className="w-[400px]">
      <p className="text-center">
        {t('configure_alignment_latency.restart_stream_info')}
      </p>
      <div className="flex flex-row justify-between mt-8">
        <Button
          className="bg-button-abort hover:bg-button-abort-hover"
          onClick={onAbort}
        >
          {t('configure_alignment_latency.no')}
        </Button>
        <Button
          className="bg-button-bg hover:bg-button-hover-bg"
          onClick={handleRestart}
        >
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            t('configure_alignment_latency.restart_stream')
          )}
        </Button>
      </div>
    </Modal>
  );
}
