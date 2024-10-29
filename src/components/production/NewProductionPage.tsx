'use client';

import React, { useEffect, useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import ProductionMonitoring from './monitoring/ProductionMonitoring';
import { Production } from '../../interfaces/production';
import { useGetProduction, usePutProduction } from '../../hooks/productions';
import { useUpdateSourceInputSlotOnMultiviewLayouts } from '../../hooks/useUpdateSourceInputSlotOnMultiviewLayouts';
import NewProductionHeader from './header/NewProductionHeader';
import cloneDeep from 'lodash.clonedeep';
import NewProductionPipelines from './pipelines/NewProductionPipelines';
import { PipelineOutput, PipelineSettings } from '../../interfaces/pipeline';
import ProductionControlConnections from './controlConnections/ProductionControlConnections';
import { ControlConnection } from '../../interfaces/controlConnections';
import ProductionOutputs from './outputs/ProductionOutputs';
import NewProductionSources from './sources/NewProductionSources';
import ProductionMultiviewers from './multiviewers/ProductionMultiviewers';

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

  // useEffect(() => {
  //   console.log('NUUU');
  //   refreshPipelines();
  //   refreshControlPanels();
  // }, [productionSetup?.isActive]);

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

  const onOutputsChange = (outputs: PipelineOutput[][]) => {
    if (production) {
      const newProduction = cloneDeep(production);
      newProduction.outputs = outputs;
      setProduction(newProduction);
    }
  };

  return (
    <div className="flex pb-4 flex-col">
      {production && (
        <>
          <NewProductionHeader
            production={production}
            presetName={production.preset_name}
            refreshProduction={refreshProduction}
            onProductionNameChange={onProductionNameChange}
          />
          <NewProductionSources
            setProductionSetup={setProductionSetup}
            putProduction={putProduction}
            productionSetup={productionSetup}
            refreshProduction={refreshProduction}
            setUpdateMuliviewLayouts={setUpdateMuliviewLayouts}
          />
          <NewProductionPipelines
            pipelines={production.pipelines}
            onChange={onPipelinesChange}
          />
          <ProductionOutputs
            outputs={production.outputs}
            onOuputsChange={onOutputsChange}
            pipelines={production.pipelines}
          />
          <ProductionControlConnections
            controlConnection={production.control_connection}
            onChange={onControlConnectionChange}
          />
          <ProductionMultiviewers sources={production.sources} />
          <ProductionMonitoring productionSetup={productionSetup} />
        </>
      )}
    </div>
  );
};

export default NewProductionPage;