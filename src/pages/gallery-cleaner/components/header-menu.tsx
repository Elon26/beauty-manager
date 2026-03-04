import { Button, ContextMenu } from '@expo/ui/swift-ui';
import { SfSymbol } from '@/ui/sf-symbol';

type HeaderMenuProps = {
  selectAll: () => void;
  deselectAll: () => void;
  isAllSelected: boolean;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  isNoneSelected: boolean;
};

export function HeaderMenu({
  selectAll,
  deselectAll,
  isAllSelected,
  selectionMode,
  setSelectionMode,
  isNoneSelected,
}: HeaderMenuProps) {
  return (
    <ContextMenu>
      <ContextMenu.Items>
        {selectionMode && !isAllSelected && (
          <Button onPress={selectAll} systemImage="checklist.checked">
            Check all
          </Button>
        )}
        {selectionMode && !isNoneSelected && (
          <Button onPress={deselectAll} systemImage="checklist.unchecked">
            Uncheck all
          </Button>
        )}
        {!selectionMode && (
          <Button onPress={() => setSelectionMode(true)} systemImage="checkmark.circle">
            Select items
          </Button>
        )}
        {selectionMode && (
          // biome-ignore lint/a11y/useValidAriaRole: <explanation>
          <Button
            onPress={() => {
              setSelectionMode(false);
              deselectAll();
            }}
            role="destructive"
            systemImage="xmark.circle"
          >
            Cancel selection
          </Button>
        )}
      </ContextMenu.Items>
      <ContextMenu.Trigger>
        <SfSymbol name="ellipsis" weight="bold" />
      </ContextMenu.Trigger>
    </ContextMenu>
  );
}
