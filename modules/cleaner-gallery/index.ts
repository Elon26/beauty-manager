import { CameraRoll } from './camera-roll';
import { CleanerGalleryApiV2 } from './api-v2';
import { GalleryAsset, GetAssetsParams, SelectKey, SortByKey, VideoInfo } from './types';

const fetchAssets = CameraRoll.getAssets;
const fetchAssetsCount = CameraRoll.getAssetsCount;
const deleteAssets = CameraRoll.deleteAssets;

export {
  CameraRoll,
  deleteAssets,
  CleanerGalleryApiV2,
  fetchAssets,
  fetchAssetsCount,
  GalleryAsset,
  GetAssetsParams,
  SelectKey,
  SortByKey,
  VideoInfo,
};
