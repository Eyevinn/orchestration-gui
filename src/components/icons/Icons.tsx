import {
  IconVideo,
  IconMicrophone2,
  IconVideoOff,
  IconVector,
  IconVectorOff,
  IconMicrophone2Off,
  IconCopy,
  IconCopyOff,
  IconLayoutBoardSplit,
  IconDeviceTv,
  IconBrandVlc,
  IconAppWindow,
  IconCast,
  IconMenuDeep,
  IconMenu2,
  IconLogout2,
  IconBuildingFactory2,
  IconListDetails,
  IconUserCircle,
  IconLock,
  IconLockOpen,
  IconPlugConnected,
  IconPlugConnectedX,
  IconRefresh,
  IconSkull,
  IconBulldozer,
  IconBomb,
  IconBiohazard,
  IconAlertTriangle,
  IconRouteOff,
  IconAlertOctagon,
  IconPencil,
  IconPlus
} from '@tabler/icons-react';

interface IClassName {
  className: string;
}

const pickIcon = {
  IconVideoOff: ({ className }: IClassName) => (
    <IconVideoOff className={className} />
  ),
  IconVideo: ({ className }: IClassName) => <IconVideo className={className} />,
  IconMicrophone2Off: ({ className }: IClassName) => (
    <IconMicrophone2Off className={className} />
  ),
  IconMicrophone2: ({ className }: IClassName) => (
    <IconMicrophone2 className={className} />
  ),
  IconVector: ({ className }: IClassName) => (
    <IconVector className={className} />
  ),
  IconVectorOff: ({ className }: IClassName) => (
    <IconVectorOff className={className} />
  ),
  IconCopy: ({ className }: IClassName) => <IconCopy className={className} />,
  IconCopyOff: ({ className }: IClassName) => (
    <IconCopyOff className={className} />
  ),
  IconLayoutBoardSplit: ({ className }: IClassName) => (
    <IconLayoutBoardSplit className={className} />
  ),
  IconDeviceTv: ({ className }: IClassName) => (
    <IconDeviceTv className={className} />
  ),
  IconBrandVlc: ({ className }: IClassName) => (
    <IconBrandVlc className={className} />
  ),
  IconAppWindow: ({ className }: IClassName) => (
    <IconAppWindow className={className} />
  ),
  IconCast: ({ className }: IClassName) => <IconCast className={className} />,
  IconMenuDeep: ({ className }: IClassName) => (
    <IconMenuDeep className={className} />
  ),
  IconMenu2: ({ className }: IClassName) => <IconMenu2 className={className} />,
  IconLogout2: ({ className }: IClassName) => (
    <IconLogout2 className={className} />
  ),
  IconBuildingFactory2: ({ className }: IClassName) => (
    <IconBuildingFactory2 className={className} />
  ),
  IconListDetails: ({ className }: IClassName) => (
    <IconListDetails className={className} />
  ),
  IconUserCircle: ({ className }: IClassName) => (
    <IconUserCircle className={className} />
  ),
  IconLock: ({ className }: IClassName) => <IconLock className={className} />,
  IconLockOpen: ({ className }: IClassName) => (
    <IconLockOpen className={className} />
  ),
  IconPlugConnected: ({ className }: IClassName) => (
    <IconPlugConnected className={className} />
  ),
  IconPlugConnectedX: ({ className }: IClassName) => (
    <IconPlugConnectedX className={className} />
  ),
  IconRefresh: ({ className }: IClassName) => (
    <IconRefresh className={className} />
  ),
  IconSkull: ({ className }: IClassName) => <IconSkull className={className} />,
  IconBulldozer: ({ className }: IClassName) => (
    <IconBulldozer className={className} />
  ),
  IconBomb: ({ className }: IClassName) => <IconBomb className={className} />,
  IconBiohazard: ({ className }: IClassName) => (
    <IconBiohazard className={className} />
  ),
  IconAlertTriangle: ({ className }: IClassName) => (
    <IconAlertTriangle className={className} />
  ),
  IconRouteOff: ({ className }: IClassName) => (
    <IconRouteOff className={className} />
  ),
  IconAlertOctagon: ({ className }: IClassName) => (
    <IconAlertOctagon className={className} />
  ),
  IconPencil: ({ className }: IClassName) => (
    <IconPencil className={className} />
  ),
  IconPlus: ({ className }: IClassName) => <IconPlus className={className} />
};

export type PickIconNames = keyof typeof pickIcon;

interface IIcons {
  name: PickIconNames;
  className: string;
}

export default function Icons({ name, className }: IIcons) {
  return <>{pickIcon[name]({ className })}</>;
}
