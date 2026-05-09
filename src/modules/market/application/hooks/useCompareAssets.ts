import { useState } from 'react';
import type { CoinAsset } from '../../domain/entities/CoinAsset';
import { compareAssets, type AssetsComparison } from '../usecases/CompareAssets.usecase';

interface UseCompareAssetsReturn {
  assetA: CoinAsset | null;
  assetB: CoinAsset | null;
  comparison: AssetsComparison | null;
  selectA: (asset: CoinAsset) => void;
  selectB: (asset: CoinAsset) => void;
  clear: () => void;
}

export function useCompareAssets(): UseCompareAssetsReturn {
  const [assetA, setAssetA] = useState<CoinAsset | null>(null);
  const [assetB, setAssetB] = useState<CoinAsset | null>(null);

  const comparison =
    assetA && assetB ? compareAssets(assetA, assetB) : null;

  function selectA(asset: CoinAsset) {
    // No permitir comparar el mismo activo contra sí mismo
    if (asset.id === assetB?.id) setAssetB(null);
    setAssetA(asset);
  }

  function selectB(asset: CoinAsset) {
    if (asset.id === assetA?.id) setAssetA(null);
    setAssetB(asset);
  }

  function clear() {
    setAssetA(null);
    setAssetB(null);
  }

  return { assetA, assetB, comparison, selectA, selectB, clear };
}
