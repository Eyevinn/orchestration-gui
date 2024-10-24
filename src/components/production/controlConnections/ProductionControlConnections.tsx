import Section from '../../section/Section';

interface ProductionControlConnectionsProps {
  onChange: (cc: any) => void;
}

const ProductionControlConnections: React.FC<
  ProductionControlConnectionsProps
> = (props) => {
  const { onChange } = props;

  const onControlConnectionChange = (cc: any, index: number) => {
    onChange(cc);
  };

  return <Section title="Control Connections" startOpen></Section>;
};

export default ProductionControlConnections;
