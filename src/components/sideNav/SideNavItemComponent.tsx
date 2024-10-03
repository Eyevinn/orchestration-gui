import Link from 'next/link';
import Icons from '../icons/Icons';
import { SideNavItem, SideNavItemBaseProps } from './SideNav';
import { usePathname } from 'next/navigation';
import SideNavTooltip from './SideNavTooltip';

const SideNavItemComponent = (props: SideNavItem & SideNavItemBaseProps) => {
  const { link, label, icon, open } = props;
  const pathName = usePathname();

  // The wrapper element must have classNames "group" and "relative" for the tooltips to work. They use "group-hover".
  return (
    <Link href={link} className="relative group">
      <div
        className={`flex p-4 rounded-xl hover:bg-light hover:cursor-pointer mb-2 overflow-hidden h-16 ${
          pathName === link ? 'bg-light' : ''
        }`}
      >
        <Icons name={icon} className={`min-w-8 min-h-8`} />
        <div className="ml-4">{label}</div>
      </div>
      <SideNavTooltip label={label} open={open} />
    </Link>
  );
};

export default SideNavItemComponent;
