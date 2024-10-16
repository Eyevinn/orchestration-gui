'use client';

import { IconTrash } from '@tabler/icons-react';
import { useDeleteProduction } from '../../hooks/productions';
import { useCallback, useState } from 'react';
import { Loader } from '../loader/Loader';
import { useRouter } from 'next/navigation';
import { DeleteModal } from '../modal/DeleteModal';
import { useDeleteMultiviewLayouts } from '../../hooks/multiviewLayout';

type DeleteProductionButtonProps = {
  id: string;
  name: string;
  isActive: boolean;
  locked: boolean;
};

export function DeleteProductionButton({
  id,
  name,
  isActive,
  locked
}: DeleteProductionButtonProps) {
  const router = useRouter();
  const deleteProduction = useDeleteProduction();
  const deleteLayouts = useDeleteMultiviewLayouts();

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const onClick = useCallback(() => setModalOpen(true), []);
  const onAbort = useCallback(() => setModalOpen(false), []);
  const onConfirm = useCallback(async () => {
    setModalOpen(false);
    setLoading(true);
    await deleteProduction(id);
    deleteLayouts(id)
      .then(() => router.refresh())
      .finally(() => setLoading(false));
  }, [deleteProduction, id, deleteLayouts, router]);

  return (
    <>
      <button
        className={`${
          isActive || locked
            ? 'bg-button-delete/50 text-p/50'
            : 'bg-button-delete hover:bg-button-hover-red-bg text-p'
        } p-2 rounded`}
        onClick={onClick}
        disabled={loading || isActive || locked}
      >
        {loading ? (
          <Loader className="w-6 h-6" />
        ) : (
          <IconTrash className="text-p" />
        )}
      </button>
      <DeleteModal
        name={name}
        onAbort={onAbort}
        onConfirm={onConfirm}
        open={modalOpen}
      />
    </>
  );
}
