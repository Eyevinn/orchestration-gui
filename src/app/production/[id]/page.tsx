import ProductionPage from '../../../components/production/ProductionPage';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ProductionPage id={id} />;
}
