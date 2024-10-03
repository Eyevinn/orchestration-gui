import React, { use } from 'react';
import { ProductionsListItem } from './ProductionsListItem';
import { getProductions } from '../../api/manager/productions';

function ProductionsList() {
  const productions = use(getProductions());

  return (
    <ul className="w-full">
      {productions
        .sort((a, b) => {
          return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
        })
        .map((production) => ({
          ...production,
          _id: production._id.toString()
        }))
        .map((production) => (
          <ProductionsListItem
            key={`${production._id}`}
            production={production}
          />
        ))}
    </ul>
  );
}

export default ProductionsList;
