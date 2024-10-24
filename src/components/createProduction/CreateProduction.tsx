'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../button/Button';
import { LegacyRef, useCallback, useRef, useState } from 'react';
import { IconServerCog, IconPlus } from '@tabler/icons-react';
import { useTranslate } from '../../i18n/useTranslate';
import { usePostProduction } from '../../hooks/productions';
import { refresh } from '../../utils/refresh';
import { PresetDropdown } from '../startProduction/presetDropdown';
import { Preset, PresetWithId } from '../../interfaces/preset';

export function CreateProduction() {
  const router = useRouter();
  const postProduction = usePostProduction();

  const inputRef: LegacyRef<HTMLInputElement> = useRef<HTMLInputElement>(null);
  const [showing, setShowing] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetWithId>();

  const t = useTranslate();

  const handleCreateNew = useCallback(async () => {
    const name = inputRef.current?.value;
    if (!name || !selectedPreset) {
      return;
    }
    const insertedId = await postProduction(name, selectedPreset);
    refresh('/');
    router.push(`/production/${insertedId}`);
  }, [router, postProduction]);

  const handleOpen = useCallback(
    () => setShowing((showing: boolean) => !showing),
    []
  );

  const placeholder = t('default_prod_placeholder');

  return (
    <>
      <div className="flex flex-row justify-between">
        <div className="text-4xl ml-2 text-p">
          {t('production_configuration')}
        </div>
        <div className="flex mr-2 gap-3">
          <Button
            className="hover:bg-button-hover-bg bg-button-bg"
            onClick={handleOpen}
            icon={<IconPlus size={16} className="mr-2" />}
          >
            {t('create_new')}
          </Button>
        </div>
      </div>
      <div
        className={`p-3 m-2 bg-container grow rounded ${
          showing ? '' : 'hidden'
        }`}
      >
        <div>
          <div className="flex items-center space-x-4 m-2 p-3 pb-3 sm:pb-4 bg-zinc-800 rounded">
            <div className="flex-shrink-0">
              <IconServerCog className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-300 truncate">
                <input
                  ref={inputRef}
                  className="text-sm w-full rounded-lg block p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-zinc-300 focus:ring-green-500 focus:border-green-500"
                  placeholder={placeholder}
                  onClick={(e) => {
                    if (e.currentTarget.value.length === 0) {
                      e.currentTarget.placeholder = '';
                    }
                  }}
                  onBlur={(e) => {
                    if (e.currentTarget.value.length === 0) {
                      e.currentTarget.placeholder = placeholder;
                    }
                  }}
                  required
                />
              </p>
            </div>
            <PresetDropdown
              disabled={false}
              preset={selectedPreset}
              onChange={setSelectedPreset}
            />
            <div className="rounded">
              <Button
                className="hover:bg-button-hover-bg bg-button-bg"
                onClick={handleCreateNew}
              >
                {t('create')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
