import { useTranslate } from '../../../i18n/useTranslate';
import { Button } from '../../button/Button';

interface IDecision {
  onClose: () => void;
  onSave: () => void;
  className?: string;
  buttonText?: string;
}

export default function Decision({
  onClose,
  onSave,
  className,
  buttonText
}: IDecision) {
  const t = useTranslate();

  return (
    <div
      className={`flex justify-center w-full min-w-max gap-16 ${
        className ? className : 'mt-10'
      }`}
    >
      <Button className="hover:bg-red-500" onClick={onClose} state="warning">
        {buttonText ? buttonText : t('close')}
      </Button>
      <Button
        className="relative flex hover:bg-green-400"
        type="submit"
        onClick={onSave}
      >
        {t('save')}
      </Button>
    </div>
  );
}
