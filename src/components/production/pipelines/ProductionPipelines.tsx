'use client';

import { useContext } from 'react';
import ControlPanelDropDown from '../../dropDown/ControlPanelDropDown';
import PipelineNameDropDown from '../../dropDown/PipelineNameDropDown';
import { Pipelines } from '../../pipeline/Pipelines';
import { GlobalContext } from '../../../contexts/GlobalContext';
import cloneDeep from 'lodash.clonedeep';

interface ProductionPipelinesProps {
  selectedPreset: any;
  setSelectedPreset: any;
  setProductionSetup: any;
  putProduction: any;
  productionSetup: any;
  pipelines: any;
  controlPanels: any;
}

const ProductionPipeLines: React.FC<ProductionPipelinesProps> = (props) => {
  const {
    selectedPreset,
    setSelectedPreset,
    setProductionSetup,
    putProduction,
    productionSetup,
    pipelines,
    controlPanels
  } = props;
  const { locked } = useContext(GlobalContext);

  const setSelectedPipelineName = (
    pipelineIndex: number,
    pipelineName?: string,
    id?: string
  ) => {
    const selectedPresetCopy = cloneDeep(selectedPreset);
    const foundPipeline = selectedPresetCopy?.pipelines[pipelineIndex];
    if (foundPipeline) {
      foundPipeline.outputs = [];
      foundPipeline.pipeline_name = pipelineName;
    }
    setSelectedPreset(selectedPresetCopy);
    setProductionSetup((prevState: any) => {
      const updatedPipelines = prevState?.production_settings.pipelines;
      if (!updatedPipelines) return;
      updatedPipelines[pipelineIndex].pipeline_name = pipelineName;
      updatedPipelines[pipelineIndex].pipeline_id = id;
      updatedPipelines[pipelineIndex].outputs = [];
      putProduction(prevState._id, {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          pipelines: updatedPipelines
        }
      });
      return {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          pipelines: updatedPipelines
        }
      };
    });
  };

  const setSelectedControlPanel = (controlPanel: string[]) => {
    setProductionSetup((prevState: any) => {
      if (!prevState) return;
      putProduction(prevState._id, {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          control_connection: {
            ...prevState?.production_settings?.control_connection,
            control_panel_name: controlPanel
          }
        }
      });
      return {
        ...prevState,
        production_settings: {
          ...prevState?.production_settings,
          control_connection: {
            ...prevState?.production_settings?.control_connection,
            control_panel_name: controlPanel
          }
        }
      };
    });
  };

  return (
    <>
      <div className="w-full flex gap-2 p-3">
        {productionSetup?.production_settings &&
          productionSetup?.production_settings.pipelines.map(
            (pipeline: any, i: number) => {
              return (
                <PipelineNameDropDown
                  disabled={productionSetup.isActive || locked}
                  key={pipeline.pipeline_readable_name + i}
                  label={pipeline.pipeline_readable_name}
                  options={pipelines?.map((pipeline: any) => ({
                    option: pipeline.name,
                    id: pipeline.uuid,
                    available: pipeline.streams.length === 0
                  }))}
                  pipelineIndex={i}
                  initial={pipeline.pipeline_name}
                  setSelectedPipelineName={setSelectedPipelineName}
                />
              );
            }
          )}
        {productionSetup?.production_settings && (
          <ControlPanelDropDown
            disabled={productionSetup.isActive || locked}
            options={controlPanels?.map((controlPanel: any) => ({
              option: controlPanel.name,
              available: controlPanel.outgoing_connections?.length === 0
            }))}
            initial={
              productionSetup?.production_settings?.control_connection
                .control_panel_name
            }
            setSelectedControlPanel={setSelectedControlPanel}
          />
        )}
        <div className="w-full flex justify-end">
          <Pipelines production={productionSetup} />
        </div>
      </div>
    </>
  );
};

export default ProductionPipeLines;
