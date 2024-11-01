'use client';

import React, { useEffect, useState } from 'react';
import { useTranslate } from '../../i18n/useTranslate';
import ProductionMonitoring from './monitoring/ProductionMonitoring';
import {
  Production,
  ProductionControlConnection
} from '../../interfaces/production';
import { useGetProduction, usePutProduction } from '../../hooks/productions';
import { PipelineOutput, PipelineSettings } from '../../interfaces/pipeline';
import ProductionControlConnections from './controlConnections/ProductionControlConnections';
import ProductionOutputs from './outputs/ProductionOutputs';
import ProductionMultiviews from './multiviews/ProductionMultiviews';
import { MultiviewSettings } from '../../interfaces/multiview';
import { SourceReference } from '../../interfaces/Source';
import ProductionSources from './sources/ProductionSources';
import ProductionHeader from './header/ProductionHeader';
import ProductionPipelines from './pipelines/ProductionPipelines';
import { LoadingCover } from '../loader/LoadingCover';

interface ProductionPageProps {
  id: string;
}

const ProductionPage: React.FC<ProductionPageProps> = (props) => {
  const { id } = props;

  const t = useTranslate();
  const [production, setProduction] = useState<Production>();
  const [productionName, setProductionName] = useState<string>('');
  const [isProductionActive, setIsProductionActive] = useState<boolean>(false);
  const [sources, setSources] = useState<SourceReference[]>([]);
  const [outputs, setOutputs] = useState<PipelineOutput[][]>([]);
  const [pipelines, setPipelines] = useState<PipelineSettings[]>([]);
  const [multiviews, setMultiviews] = useState<MultiviewSettings[]>([]);
  const [controlConnection, setControlConnection] =
    useState<ProductionControlConnection>();

  //PRODUCTION
  const putProduction = usePutProduction();
  const getProduction = useGetProduction();

  // FETCH PRESETS AND PRODUCTION
  const fetchProduction = () => {
    getProduction(id).then((prod) => {
      setProduction(prod);
      setProductionName(prod.name);
      setIsProductionActive(prod.isActive);
      setSources(prod.sources);
      setPipelines(prod.pipelines);
      setOutputs(prod.outputs);
      setMultiviews(prod.multiviews);
      setControlConnection(prod.control_connection);
      // check if production has pipelines in use or control panels in use, if so update production
      // const production = config.isActive
      //   ? config
      //   : checkProductionPipelines(config, pipelines);
    });
  };

  useEffect(() => {
    fetchProduction();
  }, []);

  // EVERY TIME THE PRODUCTION IS UPDATE -> UPLOAD IT TO DB
  useEffect(() => {
    const newProduction = {
      ...production,
      name: productionName,
      sources,
      pipelines,
      outputs,
      multiviews,
      control_connection: controlConnection
    } as Production;
    setProduction(newProduction);
    if (production?._id) {
      putProduction(production._id, newProduction);
    }
  }, [
    productionName,
    sources,
    pipelines,
    outputs,
    multiviews,
    controlConnection
  ]);

  return (
    <div className="flex pb-4 flex-col h-full w-full ">
      {(production && (
        <>
          <ProductionHeader
            production={production}
            presetName={production.preset_name}
            refreshProduction={fetchProduction}
            onProductionNameChange={setProductionName}
          />
          <ProductionSources
            productionId={production._id}
            isProductionActive={isProductionActive}
            sources={sources}
            updateSources={setSources}
            multiviews={multiviews}
            pipelines={pipelines}
            updatePipelines={setPipelines}
            refreshProduction={fetchProduction}
          />
          <ProductionPipelines pipelines={pipelines} onChange={setPipelines} />
          <ProductionOutputs
            outputs={outputs}
            onOuputsChange={setOutputs}
            pipelines={pipelines}
          />
          <ProductionControlConnections
            controlConnection={controlConnection}
            onChange={setControlConnection}
          />
          <ProductionMultiviews
            sources={sources}
            productionId={production._id}
            isProductionActive={isProductionActive}
            multiviews={multiviews}
            updateMultiviews={setMultiviews}
          />
          <ProductionMonitoring
            productionId={production._id}
            isProductionActive={isProductionActive}
            pipelines={pipelines}
          />
        </>
      )) || (
        <div className="h-full w-full flex flex-col justify-center items center">
          <LoadingCover />
        </div>
      )}
    </div>
  );
};

export default ProductionPage;
