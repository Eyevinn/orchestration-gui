'use client';

import React, { useEffect, useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import ProductionSources from './sources/ProductionsSources';
import ProductionMonitoring from './monitoring/ProductionMonitoring';
import { Production } from '../../interfaces/production';
import { useGetProduction, usePutProduction } from '../../hooks/productions';
import { useUpdateSourceInputSlotOnMultiviewLayouts } from '../../hooks/useUpdateSourceInputSlotOnMultiviewLayouts';
import NewProductionHeader from './header/NewProductionHeader';
import cloneDeep from 'lodash.clonedeep';
import NewProductionPipelines from './pipelines/NewProductionPipelines';
import { PipelineSettings } from '../../interfaces/pipeline';
import ProductionControlConnections from './controlConnections/ProductionControlConnections';
import { ControlConnection } from '../../interfaces/controlConnections';

interface ProductionPageProps {
  id: string;
}

const NewProductionPage: React.FC<ProductionPageProps> = (props) => {
  const { id } = props;

  const t = useTranslate();
  const [production, setProduction] = useState<Production>();

  //PRODUCTION
  const putProduction = usePutProduction();
  const getProduction = useGetProduction();
  const [productionSetup, setProductionSetup] = useState<Production>();

  //MULTIVIEWS
  const [updateMuliviewLayouts, setUpdateMuliviewLayouts] = useState(false);
  const [updateSourceInputSlotOnMultiviewLayouts] =
    useUpdateSourceInputSlotOnMultiviewLayouts();

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

  const onPipelinesChange = (pipelines: PipelineSettings[]) => {
    if (production) {
      const newProduction = cloneDeep(production);
      newProduction.pipelines = pipelines;
      setProduction(newProduction);
    }
  };

  const onControlConnectionChange = (cc: ControlConnection) => {
    if (production) {
      const newProduction = cloneDeep(production);
      newProduction.control_connection = cc;
      setProduction(newProduction);
    }
  };

  return (
    <div className="flex h-[95%] flex-col">
      {production && (
        <>
          <NewProductionHeader
            production={production}
            presetName={production.preset_name}
            refreshProduction={refreshProduction}
            onProductionNameChange={onProductionNameChange}
          />
          <NewProductionPipelines
            pipelines={production.pipelines}
            onChange={onPipelinesChange}
          />
          <ProductionControlConnections
            controlConnection={production.control_connection}
            onChange={onControlConnectionChange}
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
