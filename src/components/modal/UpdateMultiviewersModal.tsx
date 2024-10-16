import { useTranslate } from '../../i18n/useTranslate';
import { Button } from '../button/Button';
import { Modal } from './Modal';

type UpdateMultiviewersModalProps = {
  open: boolean;
  onAbort: () => void;
  onConfirm: () => void;
};

export function UpdateMultiviewersModal({
  open,
  onAbort,
  onConfirm
}: UpdateMultiviewersModalProps) {
  const t = useTranslate();
  return (
    <Modal open={open} outsideClick={onAbort}>
      <div className="text-center flex flex-col items-center">
        <h1 className="text-xl">{t('preset.confirm_update_multiviewers')}</h1>

        <div className="flex gap-8 mt-4">
          <Button
            onClick={onAbort}
            className="bg-button-delete hover:bg-button-hover-red-bg"
          >
            {t('abort')}
          </Button>

          <Button onClick={onConfirm} className={'min-w-fit'}>
            {t('preset.confirm_update')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
