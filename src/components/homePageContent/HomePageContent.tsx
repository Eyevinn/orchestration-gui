import { CreateProduction } from '../createProduction/CreateProduction';
import { Suspense } from 'react';
import { LoadingCover } from '../loader/LoadingCover';
import ProductionsList from '../productionsList/ProductionsList';

export const HomePageContent = () => {
  return (
    <div>
      <CreateProduction />
      <div className="flex items-center w-full">
        <Suspense fallback={<LoadingCover />}>
          <ProductionsList />
        </Suspense>
      </div>
    </div>
  );
};
