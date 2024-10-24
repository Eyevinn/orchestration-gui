import NewProductionPage from '../../../components/production/NewProductionPage';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return <NewProductionPage id={id} />;
}
