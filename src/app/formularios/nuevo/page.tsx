import { BuilderClient } from '../[id]/builder-client';
import { EMPTY_DEFINICION } from '@/lib/formularios/defaults';

export default function NuevoFormularioPage() {
  return (
    <BuilderClient
      initialTitulo=""
      initialDescripcion=""
      initialSlug=""
      initialDefinicion={EMPTY_DEFINICION}
    />
  );
}
