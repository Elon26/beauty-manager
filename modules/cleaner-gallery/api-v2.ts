import CleanerGalleryModule from './src/CleanerGalleryModule';

export namespace CleanerGalleryApiV2 {
  export const fetchDuplicates = findDuplicatesNew;
  export const fetchDuplicatesFast = findDuplicatesFast;
  export const fetchBlurryImages = newFindBlurryImagesFromGallery;
  export const getDetails = getDetailsForAssets;
  export type Asset = {
    id: string;
    uri: string;
  };
  export type AssetDetails = {
    id: string;
    uri: string;
    createdAt: number;
    updatedAt: number;
    type: number; // mediaType
    duration: number;
    width: number;
    height: number;
    favorite: boolean;
    hidden: boolean;
    location: {
      latitude: number;
      longitude: number;
    };
    size: number;
    name: string;
  };
}
/**
 * New api to find duplicates. Uses histogram XOR and location/resolution prefilter
 * @returns array of arrays of assets sorted by "goodness" desc
 */
async function findDuplicatesNew() {
  const result = (await CleanerGalleryModule.newFindSimilarImagesFromGallery()) as string[][];
  return result.map((group) =>
    group.map((asset) => ({ id: asset, uri: `ph://${asset}` }) as CleanerGalleryApiV2.Asset)
  );
}

/**
 * Old duplicate finder optimized. Uses image timestamp
 * @param interval – max interval between 2 images to consider them as puplicates
 * @returns  array of arrays of assets
 */
async function findDuplicatesFast(interval = 15) {
  const result = (await CleanerGalleryModule.findSimilarImagesFromGalleryFast(
    interval
  )) as string[][];
  return result.map((group) =>
    group.map((asset) => ({ id: asset, uri: `ph://${asset}` }) as CleanerGalleryApiV2.Asset)
  );
}

/**
 * Fetch details for assets
 * @param ids
 * @returns array of objects containing detailed info for each asset
 */
async function getDetailsForAssets(ids: string[]) {
  const result = (await CleanerGalleryModule.getAssetsDetails(
    ids
  )) as CleanerGalleryApiV2.AssetDetails[];
  return result;
}

/**
 * New api for finding blurry images
 * @param threshold – minimum score to consider an image "not blurry". The lower the score, the less is image's quality
 * @returns array of assets
 */
async function newFindBlurryImagesFromGallery(threshold = 3.5) {
  const result = (await CleanerGalleryModule.newFindBlurryImagesFromGallery(threshold)) as string[];
  return result.map((asset) => ({ id: asset, uri: `ph://${asset}` }) as CleanerGalleryApiV2.Asset);
}
