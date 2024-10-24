'use client';
import { useTranslate } from '../../../i18n/useTranslate';
import { Modal } from '../../modal/Modal';
import { Select } from '../../select/Select';
import { useState, useEffect } from 'react';
import { Button } from '../../button/Button';
import { SrtSource } from '../../../interfaces/Source';
import { Loader } from '../../loader/Loader';
import { useIngests } from '../../../hooks/ingests';
import Input from '../../input/Input';
import { ResourcesSourceResponse } from '../../../../types/ateliere-live';
import { useIngestSources } from '../../../hooks/ingests';

type AddSrtModalProps = {
  open: boolean;
  loading?: boolean;
  onAbort: () => void;
  onConfirm: (
    ingestUuid: string,
    srtPayload: SrtSource,
    callback: () => void
  ) => void;
};

type SelectOptions = 'Caller' | 'Listener';

export function AddSrtModal({
  open,
  loading,
  onAbort,
  onConfirm
}: AddSrtModalProps) {
  const ingests = useIngests();
  const t = useTranslate();

  const [ingestUuid, setIngestUuid] = useState<string>('');
  const [ingestName, setIngestName] = useState<string>('');
  const [mode, setMode] = useState<SelectOptions>('Listener');
  const [localIp, setLocalIp] = useState<string>('0.0.0.0');
  const [localPort, setLocalPort] = useState<number>(1234);
  const [remoteIp, setRemoteIp] = useState<string>('127.0.0.1');
  const [remotePort, setRemotePort] = useState<number>(1234);
  const [latency, setLatency] = useState<number>(120);
  const [name, setName] = useState<string>('My SRT source');
  const [passphrase, setPassphrase] = useState<string>();
  const [isNameError, setIsNameError] = useState<boolean>(false);
  const [isIngestNameError, setIsIngestNameError] = useState<boolean>(false);
  const [isLocalPortError, setIsLocalPortError] = useState<boolean>(false);
  const [isRemotePortError, setIsRemotePortError] = useState<boolean>(false);
  const [isLocalIpError, setIsLocalIpError] = useState<boolean>(false);
  const [isRemoteIpError, setIsRemoteIpError] = useState<boolean>(false);
  const [getIngestSources, ingestSourcesLoading] = useIngestSources();
  const [ingestSrtSources, setIngestSrtSources] = useState<
    ResourcesSourceResponse[]
  >([]);
  const [isPortAlreadyInUseError, setIsPortAlreadyInUseError] =
    useState<boolean>(false);
  const [srtPayload, setSrtPayload] = useState<SrtSource>({
    latency_ms: latency,
    local_ip: localIp,
    local_port: localPort,
    mode: 'listener',
    name: name,
    passphrase: passphrase,
    remote_ip: remoteIp,
    remote_port: remotePort
  });

  useEffect(() => {
    if (ingestName !== '') {
      const selectedIngest = ingests.find(
        (ingest) =>
          ingest.name.toLowerCase() === ingestName.toLowerCase().trim()
      );

      if (selectedIngest) {
        setIngestUuid(selectedIngest.uuid);
      }
    }
  }, [ingestName, ingests]);

  useEffect(() => {
    fetchIngestSources();
  }, [ingests]);

  useEffect(() => {
    setSrtPayload({
      latency_ms: latency || undefined,
      local_ip: localIp || undefined,
      local_port: localPort || undefined,
      mode: mode === 'Listener' ? 'listener' : 'caller',
      name: name,
      passphrase: passphrase || undefined,
      remote_ip: mode === 'Caller' ? remoteIp : undefined,
      remote_port: mode === 'Caller' ? remotePort : undefined
    });
  }, [
    mode,
    localIp,
    localPort,
    remoteIp,
    remotePort,
    latency,
    name,
    passphrase
  ]);

  useEffect(() => {
    if (isNameError) {
      if (name.length !== 0 || name !== '') {
        setIsNameError(false);
      }
    }
  }, [isNameError]);

  useEffect(() => {
    if (localIp) {
      setIsLocalIpError(false);
    }
  }, [localIp]);

  useEffect(() => {
    if (localPort) {
      setIsLocalPortError(false);
    }
  }, [localPort]);

  useEffect(() => {
    if (remoteIp) {
      setIsRemoteIpError(false);
    }
  }, [remoteIp]);

  useEffect(() => {
    if (remotePort) {
      setIsRemotePortError(false);
    }
  }, [remotePort]);

  const handleCloseModal = () => {
    setIsNameError(false);
    setIsIngestNameError(false);
    setIsLocalIpError(false);
    setIsLocalPortError(false);
    setIsRemoteIpError(false);
    setIsRemotePortError(false);
    setIsPortAlreadyInUseError(false);
    onAbort();
  };

  const handleCancel = () => {
    // Reset all fields
    setIngestName('');
    setName('My SRT source');
    setLocalIp('0.0.0.0');
    setLocalPort(1234);
    setRemoteIp('127.0.0.1');
    setRemotePort(1234);
    setLatency(120);
    setPassphrase('');

    // Reset all errors
    setIsNameError(false);
    setIsIngestNameError(false);
    setIsLocalIpError(false);
    setIsLocalPortError(false);
    setIsRemoteIpError(false);
    setIsRemotePortError(false);
    setIsPortAlreadyInUseError(false);

    onAbort();
  };

  const fetchIngestSources = async (): Promise<ResourcesSourceResponse[]> => {
    if (ingests && ingests.length > 0) {
      const sources = [];
      for (const ingest of ingests) {
        try {
          const res = await getIngestSources(ingest.name);
          sources.push(...res);
        } catch (error) {
          console.error(
            `Failed to fetch ingest sources for ${ingest.name}:`,
            error
          );
        }
      }
      const srtSources = sources.filter((source) => source.type === 'SRT');
      setIngestSrtSources(srtSources);

      return srtSources;
    }
    return [];
  };

  const handleCreateSrtSource = async () => {
    let hasError = false;

    if (!name) {
      setIsNameError(true);
      hasError = true;
    }
    if (ingestName === '') {
      setIsIngestNameError(true);
      hasError = true;
    }
    if (!localIp) {
      setIsLocalIpError(true);
      hasError = true;
    }
    if (!localPort && mode === 'Listener') {
      setIsLocalPortError(true);
      hasError = true;
    }
    if (!remoteIp && mode === 'Caller') {
      setIsRemoteIpError(true);
      hasError = true;
    }
    if (!remotePort && mode === 'Caller') {
      setIsRemotePortError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const srtSources = await fetchIngestSources();

    if (srtSources.length > 0 && mode === 'Listener') {
      const usedPorts: number[] = [];
      srtSources.forEach((s) => {
        if (s.srt?.local_port) {
          usedPorts.push(s.srt.local_port);
        }
      });

      if (usedPorts.includes(Number(localPort))) {
        setIsPortAlreadyInUseError(true);
        return;
      } else {
        setIsPortAlreadyInUseError(false);

        onConfirm(ingestUuid, srtPayload, () => fetchIngestSources());
        onAbort();
      }
    } else {
      onConfirm(ingestUuid, srtPayload, () => fetchIngestSources());
      onAbort();
    }
  };

  const handleModeChange = () => {
    setMode((prevMode) => (prevMode === 'Listener' ? 'Caller' : 'Listener'));
    setIsIngestNameError(false);
  };

  useEffect(() => {
    if (![t('inventory_list.select_ingest'), ''].includes(ingestName)) {
      setIsIngestNameError(false);
    }
  }, [ingestName]);

  const handleIngestNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIngestName(e.target.value);
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    errorSetter?: React.Dispatch<React.SetStateAction<boolean>>,
    secondErrorSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      if (errorSetter) {
        errorSetter(false);
      }
      if (secondErrorSetter) {
        secondErrorSetter(false);
      }
    };
  };

  return (
    <Modal
      open={open}
      outsideClick={handleCloseModal}
      className="w-[600px] max-w-full overflow-auto"
    >
      <h1 className="text-xl mb-12 mt-4 px-8">
        {t('inventory_list.create_srt_source')}
      </h1>
      <div className="flex flex-col items-center space-y-4 w-full px-8">
        <Select
          classNames="flex-grow ml-2 flex items-center w-full"
          options={['Listener', 'Caller']}
          value={mode}
          onChange={handleModeChange}
        />
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.ingest_uuid')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <select
              className={`${
                isIngestNameError ? 'border-error' : 'border-gray-600'
              } flex-grow ml-2 border flex text-sm rounded-lg w-full pl-2 py-1.5 bg-gray-700 placeholder-gray-400 text-p`}
              value={ingestName}
              onChange={handleIngestNameChange}
            >
              <option value="">{t('inventory_list.select_ingest')}</option>
              {ingests.map((ingest) => (
                <option key={ingest.uuid} value={ingest.name}>
                  {ingest.name}
                </option>
              ))}
            </select>
            {isIngestNameError && (
              <p className="text-xs text-button-delete mt-2">
                {t('inventory_list.no_ingest_selected')}
              </p>
            )}
          </span>
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.name')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <Input
              className="w-full ml-2"
              type="text"
              value={name}
              onChange={handleInputChange(setName, setIsNameError)}
              error={isNameError}
            />
            {isNameError && (
              <p className="text-xs text-button-delete mt-2">
                {t('inventory_list.no_name')}
              </p>
            )}
          </span>
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.local_ip')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <Input
              className="w-full ml-2"
              type="text"
              value={localIp}
              onChange={handleInputChange(setLocalIp)}
              error={isLocalIpError}
            />
            {isLocalIpError && (
              <p className="text-xs text-button-delete mt-2">
                {t('inventory_list.no_local_ip')}
              </p>
            )}
          </span>
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.local_port')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <Input
              className="w-full ml-2"
              type="number"
              value={localPort}
              onChange={handleInputChange(
                setLocalPort,
                setIsLocalPortError,
                setIsPortAlreadyInUseError
              )}
              error={isLocalPortError || isPortAlreadyInUseError}
            />
            {isLocalPortError && (
              <p className="text-xs text-button-delete mt-2">
                {t('inventory_list.no_local_port')}
              </p>
            )}
            {mode === 'Listener' && isPortAlreadyInUseError && (
              <p className="text-center text-sm text-button-delete mt-2">
                {t('inventory_list.port_already_in_use_error')}
              </p>
            )}
          </span>
        </span>
        {mode === 'Caller' && (
          <div className="space-y-4 w-full">
            <span className="flex items-center w-full">
              <h2 className="flex-none w-1/3 text-left">
                {t('inventory_list.remote_ip')}:
              </h2>
              <span className="flex flex-col w-full items-center">
                <Input
                  className="ml-2 w-full"
                  type="text"
                  value={remoteIp}
                  onChange={handleInputChange(setRemoteIp)}
                  error={isRemoteIpError}
                />
                {isRemoteIpError && (
                  <p className="text-xs text-button-delete mt-2">
                    {t('inventory_list.no_remote_ip')}
                  </p>
                )}
              </span>
            </span>
            <span className="flex items-center w-full">
              <h2 className="flex-none w-1/3 text-left">
                {t('inventory_list.remote_port')}:
              </h2>
              <span className="flex flex-col w-full items-center">
                <Input
                  className="ml-2 w-full"
                  type="number"
                  value={remotePort}
                  onChange={handleInputChange(setRemotePort)}
                  error={isRemotePortError}
                />
                {isRemotePortError && (
                  <p className="text-xs text-button-delete mt-2">
                    {t('inventory_list.no_remote_port')}
                  </p>
                )}
              </span>
            </span>
          </div>
        )}
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.latency')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <Input
              className="w-full ml-2"
              type="number"
              value={latency}
              onChange={handleInputChange(setLatency)}
            />
          </span>
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.passphrase')}:
          </h2>
          <span className="flex flex-col w-full items-center">
            <Input
              className="w-full mb-4 ml-2"
              type="text"
              value={passphrase}
              onChange={handleInputChange(setPassphrase)}
            />
          </span>
        </span>
      </div>
      <div className="flex justify-between px-8 mt-8">
        <>
          <Button
            className="bg-button-abort hover:bg-button-abort-hover"
            onClick={handleCancel}
          >
            {t('inventory_list.cancel')}
          </Button>
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            <Button
              className="justify-self-end"
              onClick={handleCreateSrtSource}
            >
              {t('inventory_list.create_srt')}
            </Button>
          )}
        </>
      </div>
    </Modal>
  );
}
