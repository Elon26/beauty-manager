export type GalleryCleanerKitModuleEvents = {
  onLookupStarted: (event: { processName: CleanerProcess }) => void;
  onLookupProgressChange: (event: { processName: CleanerProcess; progress: number }) => void;
  onIntermediateResult: (event: DuplicatesResult) => void;
  onLookupFinished: (event: { processName: CleanerProcess }) => void;
};

export type PHAssetDetails = {
  id: string;
  uri: string;
  createdAt: number;
  updatedAt: number;
  type: string;
  duration?: number;
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

export type PHAssetUri = {
  id: string;
  uri: string;
};

export const PHSmartAlbum = {
  selfies: 'selfies',
  livePhotos: 'livePhotos',
  screenshots: 'screenshots',
  videos: 'videos',
} as const;

export type PHSmartAlbumType = keyof typeof PHSmartAlbum;

export type SmartAlbumRecord = string[];
export type SmartAlbumRecords = Record<PHSmartAlbumType, SmartAlbumRecord>;

export type DuplicatesResult = {
  similarPhotoGroups: DuplicateGroup[];
  aestheticsScores: string[];
  blurScores: string[];
  blurryImages: Record<string, number>;
};

export type DuplicateGroup = {
  id: string;
  assets: string[];
};

export const ProcessState = {
  idle: 'idle',
  searching: 'searching',
  done: 'done',
  error: 'error',
} as const;

export type ProcessState = (typeof ProcessState)[keyof typeof ProcessState];

export const CleanerProcess = {
  similarPhotos: 'similarPhotos',
  blurryPhotos: 'blurryPhotos',
} as const;

export type CleanerProcess = (typeof CleanerProcess)[keyof typeof CleanerProcess];
