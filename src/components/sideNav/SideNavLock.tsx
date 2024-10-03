'use client';

import { useContext } from 'react';
import Icons from '../icons/Icons';
import { GlobalContext } from '../../contexts/GlobalContext';
import CustomSwitch from '../customSwitch/CustomSwitch';
import { SideNavItemBaseProps } from './SideNav';
import SideNavTooltip from './SideNavTooltip';
import { useTranslate } from '../../i18n/useTranslate';

const SideNavLock = (props: SideNavItemBaseProps) => {
  const { open } = props;
  const { locked, toggleLocked } = useContext(GlobalContext);
  const t = useTranslate();

  // The wrapper element must have classNames "group" and "relative" for the tooltips to work. They use "group-hover".
  return (
    <div className="group relative">
      <div
        className={`flex justify-between items-center pl-4 py-4 overflow-hidden rounded-xl group relative ${
          !open ? 'hover:cursor-pointer hover:bg-light' : ''
        }`}
        onClick={() => {
          if (!open) toggleLocked();
        }}
      >
        <div className="flex items-center">
          <Icons
            name={locked ? 'IconLock' : 'IconLockOpen'}
            className={`w-8 h-8 mr-4 ${
              !locked ? 'text-confirm' : 'text-button-delete'
            }`}
          />
          {locked ? t('lock.locked') : t('lock.unlocked')}
        </div>
        <CustomSwitch
          checked={!locked}
          onChange={() => {
            if (open) toggleLocked();
          }}
        />
      </div>
      <SideNavTooltip
        open={open}
        label={locked ? t('lock.unlock') : t('lock.lock')}
      />
    </div>
  );
};

export default SideNavLock;
