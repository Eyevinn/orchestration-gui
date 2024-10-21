'use client';
import { useTranslate } from '../../../i18n/useTranslate';
import { Modal } from '../Modal';
import Input from '../../input/Input';
import React, { useState } from 'react';
import { Button } from '../../button/Button';
import { Loader } from '../../loader/Loader';

type CreateMediaModalProps = {
  open: boolean;
  loading: boolean;
  onAbort: () => void;
  onConfirm: (filename: string) => void;
};

export function CreateMediaModal({
  open,
  loading,
  onAbort,
  onConfirm
}: CreateMediaModalProps) {
  const [filename, setFilename] = useState<string>('');

  const t = useTranslate();

  const handleCancel = () => {
    // Reset all values
    setFilename('');
    onAbort();
  };

  const handleCreate = () => {
    if (!filename) {
      setFilename('');
    }
    onConfirm(filename);
    onAbort();
  };

  return (
    <Modal className="w-[400px]" open={open} outsideClick={handleCancel}>
      <h2 className="text-xl">
        {t('rendering_engine.media.create.create_media')}
      </h2>
      <div className="flex flex-col items-center w-full px-8 mt-4">
        <span className="flex flex-col items-center w-full space-y-2">
          <h2 className="flex self-start">
            {t('rendering_engine.media.create.filename')}:
          </h2>
          <Input
            className="w-full ml-2"
            type="text"
            value={filename}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilename(e.target.value)
            }
          />
        </span>
      </div>
      <div className="flex justify-between px-8 mt-8">
        <>
          <Button
            className="bg-button-abort hover:bg-button-abort-hover"
            onClick={handleCancel}
          >
            {t('rendering_engine.media.create.abort')}
          </Button>
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            <Button className="justify-self-end" onClick={handleCreate}>
              {t('rendering_engine.media.create.create')}
            </Button>
          )}
        </>
      </div>
    </Modal>
  );
}
