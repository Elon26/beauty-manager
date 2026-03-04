import type {
  GalleryConfig,
  GalleryContextAction,
  GallerySection,
  IndexPath,
} from '../src/Gallery.types';

const STABLE_UUID = 'E621E1F8-C36C-495A-93FC-0C247A3E6E5F';

export function getGroups(data: string[] | GallerySection[]): GallerySection[] {
  if (data.length === 0) {
    return [];
  }
  if (typeof data[0] === 'string') {
    return [
      {
        id: STABLE_UUID,
        assets: data as string[],
      },
    ];
  }
  return data as GallerySection[];
}

export function getSelectionIndexPaths(selected: Set<string>, groups: GallerySection[]) {
  const indexPaths: IndexPath[] = [];

  for (let sec = 0; sec < groups.length; sec++) {
    const group = groups[sec];
    const items = group.assets;

    for (let itm = 0; itm < items.length; itm++) {
      const item = items[itm];
      if (selected.has(item)) {
        indexPaths.push({ section: sec, item: itm });
      }
    }
  }
  return indexPaths;
}

export function separateActions(input: GalleryConfig) {
  const actions: GalleryContextAction[] = [];
  const callbacks: Record<string, GalleryContextAction['action']> = {};
  for (const item of input.actions ?? []) {
    const { action, ...rest } = item;
    callbacks[item.id] = action;
    actions.push(rest);
  }
  const config = { ...input, actions };
  return { actions, callbacks, config };
}
