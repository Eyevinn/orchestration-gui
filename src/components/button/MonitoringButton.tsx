'use client';
import Link from 'next/link';
import { useTranslate } from '../../i18n/useTranslate';
import { useMonitoringError } from '../../hooks/monitoring';
import { IconLoader } from '@tabler/icons-react';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { useContext } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';

type MonitoringButtonProps = {
  id: string;
  locked: boolean;
};

export const MonitoringButton = ({ id, locked }: MonitoringButtonProps) => {
  const t = useTranslate();
  const [hasError, loading] = useMonitoringError(id);
  const { locked } = useContext(GlobalContext);
  return (
    <Link
      className={`${
        locked
          ? 'bg-button-bg/50 pointer-events-none text-p/50'
          : 'pointer-events-auto'
      } ${
        hasError && !locked
          ? 'bg-button-delete hover:bg-button-delete '
          : 'bg-button-bg hover:bg-button-hover-bg'
      } text-button-text font-bold px-4 py-2 rounded inline-flex items-center justify-center`}
      href={`/runtime-monitoring/${id}`}
    >
      {!loading && !hasError && <div className="mr-2 w-4 h-4"></div>}
      {loading && (
        <IconLoader
          size={16}
          className="animate-spin transition ease-in-out delay-50 mr-2"
        />
      )}
      {!loading && hasError && (
        <IconAlertTriangleFilled
          size={16}
          className="transition ease-in-out delay-50 mr-2"
        />
      )}
      <span className="text-center">{t('runtime_monitoring.name')}</span>
      <div className="ml-2 w-4 h-4"></div>
    </Link>
  );
};
