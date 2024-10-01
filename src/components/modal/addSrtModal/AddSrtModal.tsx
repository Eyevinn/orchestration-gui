'use client';
import { useTranslate } from '../../../i18n/useTranslate';
import { Modal } from '../../modal/Modal';
import { Select } from '../../select/Select';
import { useState, useEffect } from 'react';
import { Button } from '../../button/Button';
import { SrtSource } from '../../../interfaces/Source';
import styles from './AddSrtModal.module.css';
import { Loader } from '../../loader/Loader';
import { useIngests } from '../../../hooks/ingests';
import Input from '../../input/Input';

type AddSrtModalProps = {
  open: boolean;
  loading: boolean;
  onAbort: () => void;
  onConfirm: (ingestUuid: string, srtPayload: SrtSource) => void;
};

type SelectOptions = 'Caller' | 'Listener';

export function AddSrtModal({
  open,
  loading,
  onAbort,
  onConfirm
}: AddSrtModalProps) {
  const ingests = useIngests();

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

  const handleCloseModal = () => {
    setIsNameError(false);
    setIsIngestNameError(false);
    onAbort();
  };

  const handleCreateSrtSource = () => {
    if (!name) {
      setIsNameError(true);
    }
    if (ingestName === '') {
      setIsIngestNameError(true);
    }
    if (!name || ingestName === '') {
      return false;
    }
    if (!isIngestNameError && !isNameError) {
      onConfirm(ingestUuid, srtPayload);
      onAbort();
    }
    setIsIngestNameError(false);
  };

  const handleModeChange = () => {
    setMode((prevMode) => (prevMode === 'Listener' ? 'Caller' : 'Listener'));
    setIsIngestNameError(false);
  };

  useEffect(() => {
    if ([t('inventory_list.select_ingest'), ''].includes(ingestName)) {
      setIsIngestNameError(true);
    } else {
      setIsIngestNameError(false);
    }
  }, [ingestName]);

  const handleIngestNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIngestName(e.target.value);
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    errorSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      if (errorSetter) {
        errorSetter(false);
      }
    };
  };

  const t = useTranslate();
  return (
    <Modal open={open} outsideClick={handleCloseModal} className="w-1/5">
      <h1 className=" text-xl mb-12 mt-4 px-8">
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
              className="w-full flex-grow ml-2"
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
          <Input
            className="flex-grow ml-2"
            type="text"
            value={localIp}
            onChange={handleInputChange(setLocalIp)}
          />
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.local_port')}:
          </h2>
          <Input
            className="flex-grow ml-2"
            type="number"
            value={localPort}
            onChange={handleInputChange(setLocalPort)}
          />
        </span>
        <div
          className={`${styles.expandableSection} ${
            mode === 'Caller' ? styles.expanded : styles.collapsed
          } space-y-4 w-full`}
        >
          <span className="flex items-center w-full">
            <h2 className="flex w-1/3 text-left">
              {t('inventory_list.remote_ip')}:
            </h2>
            <Input
              className="flex-grow ml-2"
              type="text"
              value={remoteIp}
              onChange={handleInputChange(setRemoteIp)}
            />
          </span>
          <span className="flex items-center w-full">
            <h2 className="flex w-1/3 text-left">
              {t('inventory_list.remote_port')}:
            </h2>
            <Input
              className="flex-grow ml-2"
              type="number"
              value={remotePort}
              onChange={handleInputChange(setRemotePort)}
            />
          </span>
        </div>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.latency')}:
          </h2>
          <Input
            className="flex-grow ml-2"
            type="number"
            value={latency}
            onChange={handleInputChange(setLatency)}
          />
        </span>
        <span className="flex items-center w-full">
          <h2 className="flex-none w-1/3 text-left">
            {t('inventory_list.passphrase')}:
          </h2>
          <Input
            className="mb-4 flex-grow ml-2"
            type="text"
            value={passphrase}
            onChange={handleInputChange(setPassphrase)}
          />
        </span>
      </div>
      <div className="flex justify-end px-8">
        {loading ? (
          <Loader className="w-10 h-5" />
        ) : (
          <Button className="justify-self-end" onClick={handleCreateSrtSource}>
            {t('inventory_list.create_srt')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
