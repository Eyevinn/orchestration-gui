'use client';
import {
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconServerCog
} from '@tabler/icons-react';
import {
  Production,
  StartProductionStatus,
  StopProductionStatus
} from '../../interfaces/production';
import Link from 'next/link';
import { DeleteProductionButton } from './DeleteProductionButton';
import { MonitoringButton } from '../button/MonitoringButton';
import RunningIndication from '../pipeline/RunningIndication';
import { useStartProduction, useStopProduction } from '../../hooks/workflow';
import { usePutProduction } from '../../hooks/productions';
import { Loader } from '../loader/Loader';
import toast from 'react-hot-toast';
import { refresh } from '../../utils/refresh';
import { StopModal } from '../modal/StopModal';
import { useContext, useState } from 'react';
import { StartModal } from '../modal/StartModal';
import { GlobalContext } from '../../contexts/GlobalContext';

type ProductionListItemProps = {
  production: Production;
};

export function ProductionsListItem({ production }: ProductionListItemProps) {
  const [stopProduction, loading] = useStopProduction();
  const [startProduction, loadingStartProduction] = useStartProduction();
  const [startProductionStatus, setStartProductionStatus] =
    useState<StartProductionStatus>();
  const [stopProductionStatus, setStopProductionStatus] =
    useState<StopProductionStatus>();
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [startErrorModalOpen, setStartErrorModalOpen] = useState(false);
  const putProduction = usePutProduction();
  const { locked } = useContext(GlobalContext);

  const handleStopProduction = async () => {
    stopProduction(production)
      .then((status) => {
        putProduction(production._id.toString(), {
          ...production,
          isActive: false
        });
        if (status.ok) {
          setStopModalOpen(false);
          setStopProductionStatus(undefined);
          refresh('/');
        }
        if (!status.ok) {
          setStopModalOpen(true);
          if (!status.value) {
            setStopProductionStatus({
              success: false,
              steps: [{ step: 'unexpected', success: false }]
            });
          } else {
            setStopProductionStatus({ success: false, steps: status.value });
          }
        }
      })
      .catch(() => {
        toast.error('Something went wrong when stopping pipeline');
      });
  };
  const handleStartStopButtonClick = () => {
    if (production.isActive && !stopModalOpen) {
      setStopModalOpen(true);
    } else if (!production.isActive && isConfigured(production)) {
      startProduction(production)
        .then((status) => {
          if (status.ok) {
            console.log(`Starting production '${production.name}'`);
            refresh('/');
            setStartErrorModalOpen(false);
            setStartProductionStatus(undefined);
          }
          if (!status.ok) {
            if (!status.value) {
              setStartProductionStatus({
                success: false,
                steps: [{ step: 'unexpected', success: false }]
              });
              setStartErrorModalOpen(true);
            } else {
              setStartProductionStatus({ success: false, steps: status.value });
              setStartErrorModalOpen(true);
            }
          }
        })
        .catch((error) => {
          setStartProductionStatus({
            success: false,
            steps: [{ step: 'start', success: false }]
          });
          setStartErrorModalOpen(true);
        });
    }
  };

  const onStartCancel = () => {
    setStartErrorModalOpen(false);
    setStartProductionStatus(undefined);
  };

  const onCancel = () => {
    setStopProductionStatus(undefined);
    setStopModalOpen(false);
    refresh('/'); // TODO: Only refresh incase of a "failed" stop attempt
  };
  const isConfigured = (production: Production) => {
    if (!production) return false;
    const hasSetPipelines = production.pipelines?.every((p) => p.pipeline_id);
    const hasSetControlPanels =
      !!production.control_connection?.control_panel_ids?.length;
    return hasSetPipelines && hasSetControlPanels;
  };
  const isOutdated = (production: any) => {
    if (!production) return false;
    return !!production.production_settings;
  };

  return (
    <li className="flex space-x-4 m-2 p-3 pb-3 sm:pb-4 bg-container rounded shadow-md">
      {(!isOutdated(production) && (
        <Link
          className="flex items-center space-x-4 flex-1"
          href={`/production/${production._id}`}
        >
          <div className="flex justify-start items-center w-6">
            {production.isActive ? (
              <RunningIndication running={production.isActive} />
            ) : (
              <IconServerCog className="min-w-max text-brand" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex-row">
            <p className="text-sm font-medium text-p truncate inline-flex w-96">
              {production.name}
            </p>
          </div>
        </Link>
      )) || (
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex justify-start items-center w-6">
            {production.isActive ? (
              <RunningIndication running={production.isActive} />
            ) : (
              <IconServerCog className="min-w-max text-brand" />
            )}
          </div>
          <div className="flex-1 min-w-0 flex-row">
            <p className="text-sm font-medium text-p truncate inline-flex w-96">
              {production.name}
            </p>
            {isOutdated(production) && (
              <p className="ml-4 text-sm font-medium text-p truncate italic text-gray-800 inline-flex">
                This production is outdated and can only be deleted
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex space-x-4">
        {production.isActive && (
          <MonitoringButton id={production._id.toString()} />
        )}
        {isConfigured(production) && !isOutdated(production) && (
          <div
            onClick={() => handleStartStopButtonClick()}
            className={`${
              locked
                ? 'pointer-events-none bg-brand/50 text-p/50'
                : 'pointer-events-auto'
            } ${
              production.isActive && !locked
                ? 'bg-button-delete hover:bg-button-hover-red-bg pointer-events-none'
                : 'bg-brand hover:bg-button-hover-bg'
            } 
            ${locked && production.isActive && 'bg-button-delete/50'}
            p-2 rounded cursor-pointer`}
          >
            {(loading || loadingStartProduction) && !startErrorModalOpen ? (
              <Loader className="w-6 h-6" />
            ) : production.isActive ? (
              <>
                <IconPlayerStopFilled className="text-p" />
                <StopModal
                  loading={loading}
                  open={stopModalOpen}
                  onCancel={onCancel}
                  onConfirm={handleStopProduction}
                  name={production.name}
                  stopStatus={stopProductionStatus}
                />
              </>
            ) : (
              <IconPlayerPlayFilled className="text-p" />
            )}
          </div>
        )}
        <StartModal
          startStatus={startProductionStatus}
          name={production.name}
          open={startErrorModalOpen}
          onAbort={onStartCancel}
          onConfirm={handleStartStopButtonClick}
          loading={loadingStartProduction}
        />
        <DeleteProductionButton
          isActive={production.isActive}
          id={production._id.toString()}
          name={production.name}
          locked={locked}
        />
      </div>
    </li>
  );
}
