import Link from 'next/link';
import Icons from '../icons/Icons';
import { SideNavItemBaseProps } from './SideNav';
import SideNavTooltip from './SideNavTooltip';
import { useSession } from 'next-auth/react';
import { useTranslate } from '../../i18n/useTranslate';

const SideNavAccount = (props: SideNavItemBaseProps) => {
  const { open } = props;
  const t = useTranslate();
  const session = useSession();

  // The wrapper element must have classNames "group" and "relative" for the tooltips to work. They use "group-hover".
  return (
    <div className="relative group">
      <div className="flex flex-row-reverse justify-between bg-light p-4 rounded-xl h-16 items-center overflow-hidden">
        <Link href={'/api/auth/signout'}>
          <Icons
            name="IconLogout2"
            className="min-w-10 min-h-10 stroke-1 hover:cursor-pointer pl-1"
          />
        </Link>
        <div className="flex items-center mr-10">
          <Icons name="IconUserCircle" className="mr-2 w-10 h-10 stroke-1" />
          <div>{session?.data?.user?.name}</div>
        </div>
      </div>
      <SideNavTooltip open={open} label={t('auth.sign_out')} />
    </div>
  );
};

export default SideNavAccount;
