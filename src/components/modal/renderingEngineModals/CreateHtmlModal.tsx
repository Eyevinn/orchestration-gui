'use client';
import { useTranslate } from '../../../i18n/useTranslate';
import { Modal } from '../Modal';
import Input from '../../input/Input';
import React, { useEffect, useState } from 'react';
import { Button } from '../../button/Button';
import { Loader } from '../../loader/Loader';

type CreateHtmlModalProps = {
  open: boolean;
  loading: boolean;
  onAbort: () => void;
  onConfirm: (height: number, width: number, url: string) => void;
};

export function CreateHtmlModal({
  open,
  loading,
  onAbort,
  onConfirm
}: CreateHtmlModalProps) {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [url, setUrl] = useState<string>('');
  const [heightError, setHeightError] = useState<boolean>(false);
  const [widthError, setWidthError] = useState<boolean>(false);

  const t = useTranslate();

  useEffect(() => {
    if (height) {
      setHeightError(false);
    }
  }, [height]);

  useEffect(() => {
    if (width) {
      setWidthError(false);
    }
  }, [width]);

  const handleCancel = () => {
    // Reset all errors
    setHeightError(false);
    setWidthError(false);

    // Reset all values
    setUrl('');

    onAbort();
  };

  const handleCreate = () => {
    let hasError = false;

    if (!height) {
      setHeightError(true);
      hasError = true;
    }

    if (!width) {
      setWidthError(true);
      hasError = true;
    }

    if (hasError) {
      return false;
    }

    onConfirm(height, width, url);
    handleCancel();
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<any>>,
    errorSetter?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (errorSetter) {
        errorSetter(false);
      }
    };
  };

  return (
    <Modal className="w-[500px]" open={open} outsideClick={handleCancel}>
      <h2 className="text-xl">
        {t('rendering_engine.html.create.create_html')}
      </h2>
      <div className="flex flex-col items-center w-full px-8 mt-4">
        <span className="flex flex-col items-center w-full space-y-2">
          <h2 className="flex self-start">
            {t('rendering_engine.html.create.width')}:
          </h2>
          <Input
            className="w-full ml-2"
            type="number"
            value={width}
            onChange={handleInputChange(setWidth, setWidthError)}
            error={widthError}
          />
          {widthError && <p>{t('rendering_engine.html.create.width_error')}</p>}
        </span>
        <span className="flex flex-col items-center w-full space-y-2 mt-8">
          <h2 className="flex self-start">
            {t('rendering_engine.html.create.height')}:
          </h2>
          <Input
            className="w-full ml-2"
            type="number"
            value={height}
            onChange={handleInputChange(setHeight, setHeightError)}
            error={heightError}
          />
          {heightError && (
            <p>{t('rendering_engine.html.create.height_error')}</p>
          )}
        </span>
        <span className="flex flex-col items-center w-full space-y-2 mt-8">
          <h2 className="flex self-start">
            {t('rendering_engine.html.create.url')}:
          </h2>
          <Input
            className="w-full ml-2"
            type="text"
            value={url}
            onChange={handleInputChange(setUrl)}
          />
        </span>
      </div>
      <div className="flex justify-between px-8 mt-8">
        <>
          <Button
            className="bg-button-abort hover:bg-button-abort-hover"
            onClick={handleCancel}
          >
            {t('rendering_engine.html.create.abort')}
          </Button>
          {loading ? (
            <Loader className="w-10 h-5" />
          ) : (
            <Button className="justify-self-end" onClick={handleCreate}>
              {t('rendering_engine.html.create.create')}
            </Button>
          )}
        </>
      </div>
    </Modal>
  );
}
