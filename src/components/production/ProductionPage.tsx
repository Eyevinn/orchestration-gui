'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import ProductionHeader from './header/ProductionHeader';
import ProductionSources from './sources/ProductionsSources';
import ProductionPipeLines from './pipelines/ProductionPipelines';
import ProductionMonitoring from './monitoring/ProductionMonitoring';
import { Production } from '../../interfaces/production';
import { useGetProduction, usePutProduction } from '../../hooks/productions';
import { useGetPresets } from '../../hooks/presets';
import { Preset } from '../../interfaces/preset';
import { useUpdateSourceInputSlotOnMultiviewLayouts } from '../../hooks/useUpdateSourceInputSlotOnMultiviewLayouts';
import { useCheckProductionPipelines } from '../../hooks/useCheckProductionPipelines';
import { useControlPanels } from '../../hooks/controlPanels';
import { usePipelines } from '../../hooks/pipelines';

interface ProductionPageProps {
  id: string;
}

const ProductionPage: React.FC<ProductionPageProps> = (props) => {
  const { id } = props;

  const t = useTranslate();
  const [configurationName, setConfigurationName] = useState<string>('');

  //PRODUCTION
  const putProduction = usePutProduction();
  const getPresets = useGetPresets();
  const getProduction = useGetProduction();
  const [productionSetup, setProductionSetup] = useState<Production>();
  const [presets, setPresets] = useState<Preset[]>();
  const [selectedPreset, setSelectedPreset] = useState<Preset>();

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

  useEffect(() => {
    refreshPipelines();
    refreshControlPanels();
  }, [productionSetup?.isActive]);

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
    getProduction(id).then((config) => {
      // check if production has pipelines in use or control panels in use, if so update production
      const production = config.isActive
        ? config
        : checkProductionPipelines(config, pipelines);

      putProduction(production._id, production);
      setProductionSetup(production);
      setConfigurationName(production.name);
      setSelectedPreset(production.production_settings);
      getPresets().then((presets) => {
        if (!production.production_settings) {
          setPresets(presets);
        } else {
          const presetsExludingProductionSettings = presets.filter(
            (preset) => preset._id !== production?.production_settings._id
          );
          setPresets([
            ...presetsExludingProductionSettings,
            production.production_settings
          ]);
        }
      });
    });
  };

  useEffect(() => {
    refreshProduction();
  }, []);

  return (
    <div className="flex h-[95%] flex-col">
      <ProductionHeader
        setProductionSetup={setProductionSetup}
        putProduction={putProduction}
        presets={presets}
        selectedPreset={selectedPreset}
        memoizedProduction={memoizedProduction}
        refreshProduction={refreshProduction}
        setPresets={setPresets}
        setSelectedPreset={setSelectedPreset}
        configurationName={configurationName}
        setConfigurationName={setConfigurationName}
        productionSetup={productionSetup}
      />
      <ProductionPipeLines
        selectedPreset={selectedPreset}
        setSelectedPreset={setSelectedPreset}
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
    </div>
  );
};

export default ProductionPage;
