'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import ProductionSources from './sources/ProductionsSources';
import ProductionPipeLines from './pipelines/ProductionPipelines';
import ProductionMonitoring from './monitoring/ProductionMonitoring';
import { Production } from '../../interfaces/production';
import { useGetProduction, usePutProduction } from '../../hooks/productions';
import { useGetPresets } from '../../hooks/presets';
import { Preset, PresetWithId } from '../../interfaces/preset';
import { useUpdateSourceInputSlotOnMultiviewLayouts } from '../../hooks/useUpdateSourceInputSlotOnMultiviewLayouts';
import { useCheckProductionPipelines } from '../../hooks/useCheckProductionPipelines';
import { useControlPanels } from '../../hooks/controlPanels';
import { usePipelines } from '../../hooks/pipelines';
import NewProductionHeader from './header/NewProductionHeader';
import toast from 'react-hot-toast';
import cloneDeep from 'lodash.clonedeep';

interface ProductionPageProps {
  id: string;
}

const NewProductionPage: React.FC<ProductionPageProps> = (props) => {
  const { id } = props;

  const t = useTranslate();
  const [presets, setPresets] = useState<PresetWithId[]>();
  const [production, setProduction] = useState<Production>();
  const [preset, setPreset] = useState<Preset>();

  const [configurationName, setConfigurationName] = useState<string>('');

  //PRODUCTION
  const putProduction = usePutProduction();
  const getPresets = useGetPresets();
  const getProduction = useGetProduction();
  const [productionSetup, setProductionSetup] = useState<Production>();

  //MULTIVIEWS
  const [updateMuliviewLayouts, setUpdateMuliviewLayouts] = useState(false);
  const [updateSourceInputSlotOnMultiviewLayouts] =
    useUpdateSourceInputSlotOnMultiviewLayouts();

  //FROM LIVE API
  const [pipelines, loadingPipelines, , refreshPipelines] = usePipelines();
  const [controlPanels, loadingControlPanels, , refreshControlPanels] =
    useControlPanels();

  const [checkProductionPipelines] = useCheckProductionPipelines();

  const memoizedProduction = useMemo(() => productionSetup, [productionSetup]);

  // useEffect(() => {
  //   console.log('NUUU');
  //   refreshPipelines();
  //   refreshControlPanels();
  // }, [productionSetup?.isActive]);

  useEffect(() => {
    if (updateMuliviewLayouts && productionSetup) {
      updateSourceInputSlotOnMultiviewLayouts(productionSetup).then(
        (updatedSetup) => {
          if (!updatedSetup) return;
          setProductionSetup(updatedSetup);
          setUpdateMuliviewLayouts(false);
          refreshProduction();
        }
      );
    }
  }, [productionSetup, updateMuliviewLayouts]);

  const refreshProduction = () => {
    getProduction(id).then((config) => {});
  };

  // FETCH PRESETS AND PRODUCTION
  const initialize = () => {
    getPresets().then((presets) => {
      setPresets(presets);
    });
    getProduction(id).then((prod) => {
      // check if production has pipelines in use or control panels in use, if so update production
      // const production = config.isActive
      //   ? config
      //   : checkProductionPipelines(config, pipelines);

      setProduction(prod);
    });
  };

  useEffect(() => {
    initialize();
  }, []);

  // ONCE WE HAVE FETCHED PRESETS AND PRODUCTION SET CURRENT PRESET
  // IF THE CURRENT PRESET IS MISSING DEFAULT MULTIVIEWER -> WARN
  useEffect(() => {
    if (!preset && production && presets) {
      const foundPreset = presets.find(
        (preset) => preset._id.toString() === production.preset_id
      );
      setPreset(foundPreset);
      if (foundPreset && !foundPreset.default_multiview_reference) {
        toast.error(t('production.missing_multiview'));
        return;
      }
    }
  }, [production, presets, preset]);

  // EVERY TIME THE PRODUCTION IS UPDATE -> UPLOAD IT TO DB
  useEffect(() => {
    if (production) {
      putProduction(production._id, production);
    }
  }, [production]);

  const onProductionNameChange = (name: string) => {
    if (production) {
      const newProduction = cloneDeep(production);
      newProduction.name = name;
      setProduction(newProduction);
    }
  };

  return (
    <div className="flex h-[95%] flex-col">
      {production && preset && (
        <>
          <NewProductionHeader
            production={production}
            presetName={preset.name}
            refreshProduction={refreshProduction}
            onProductionNameChange={onProductionNameChange}
          />
          <ProductionPipeLines
            selectedPreset={preset}
            setSelectedPreset={preset}
            setProductionSetup={setProductionSetup}
            putProduction={putProduction}
            productionSetup={productionSetup}
            pipelines={pipelines}
            controlPanels={controlPanels}
          />
          <ProductionMonitoring productionSetup={productionSetup} />
          <ProductionSources
            setProductionSetup={setProductionSetup}
            putProduction={putProduction}
            productionSetup={productionSetup}
            refreshProduction={refreshProduction}
            setUpdateMuliviewLayouts={setUpdateMuliviewLayouts}
          />
        </>
      )}
    </div>
  );
};

export default NewProductionPage;
