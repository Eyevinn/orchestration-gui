'use client';
import { PipelineSettings } from '../../../interfaces/pipeline';
import { MonitoringButton } from '../../button/MonitoringButton';
import { Pipelines } from '../../pipeline/Pipelines';

interface ProductionMonitoringProps {
  isProductionActive: boolean;
  productionId: string;
  pipelines: PipelineSettings[];
}

const ProductionMonitoring: React.FC<ProductionMonitoringProps> = (props) => {
  const { isProductionActive, productionId, pipelines } = props;

  return (
    <div className="flex justify-end p-3">
      <div className="w-full flex">
        <Pipelines
          isProductionActive={isProductionActive}
          pipelines={pipelines}
        />
      </div>
      {isProductionActive && <MonitoringButton id={productionId} />}
    </div>
  );
};

export default ProductionMonitoring;
