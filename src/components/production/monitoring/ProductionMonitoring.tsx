'use client';
import { Production } from '../../../interfaces/production';
import { MonitoringButton } from '../../button/MonitoringButton';

interface ProductionMonitoringProps {
  productionSetup?: Production;
}

const ProductionMonitoring: React.FC<ProductionMonitoringProps> = (props) => {
  const { productionSetup } = props;

  return (
    <>
      {productionSetup && productionSetup.isActive && (
        <div className="flex justify-end p-3">
          <MonitoringButton id={productionSetup?._id.toString()} />
        </div>
      )}
    </>
  );
};

export default ProductionMonitoring;
