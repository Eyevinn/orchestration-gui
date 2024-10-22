'use client';

import { useContext } from 'react';
import Icons from '../icons/Icons';
import { GlobalContext } from '../../contexts/GlobalContext';
import SideNavTooltip from './SideNavTooltip';
import { SideNavItemBaseProps } from './SideNav';
import { useTranslate } from '../../i18n/useTranslate';

const SideNavRefreshThumbnails = (props: SideNavItemBaseProps) => {
  const { open } = props;
  const t = useTranslate();

  const { refetchImages } = useContext(GlobalContext);

  // TODO This button might be changed to a toggle for automatic image refetching.
  return (
    <div className="relative group">
      <div
        className="flex items-center pl-4 py-4 overflow-hidden rounded-xl hover:bg-light hover:cursor-pointer"
        onClick={refetchImages}
      >
        <Icons name="IconRefresh" className="min-w-8 min-h-8 mr-4" />
        <div className="whitespace-nowrap">{t('refresh_images')}</div>
      </div>
      <SideNavTooltip open={open} label={t('refresh_images')} />
    </div>
  );
};

export default SideNavRefreshThumbnails;
