import { Button } from '../../button/Button';
import { useContext } from 'react';
import { EditViewContext } from '../EditViewContext';
import { useTranslate } from '../../../i18n/useTranslate';
import styles from './animation.module.scss';
import { Loader } from '../../loader/Loader';

export default function UpdateButtons({ close }: { close: () => void }) {
  const t = useTranslate();
  const {
    saved: [saved],
    isSame,
    loading
  } = useContext(EditViewContext);

  return (
    <div className="mt-2 flex mb-8 mr-8">
      <div className="flex flex-1 justify-center justify-items-center text-confirm ">
        <div className={`opacity-0 ${saved ? styles.opacity : ''}`}>
          {t('saved')}
        </div>
      </div>

      <div className="flex">
        <Button state="warning" onClick={close}>
          {t('close')}
        </Button>
        <Button className="ml-5 relative flex" type="submit" disabled={isSame}>
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            <p className="w-10">{t('save')}</p>
          )}
        </Button>
      </div>
    </div>
  );
}
