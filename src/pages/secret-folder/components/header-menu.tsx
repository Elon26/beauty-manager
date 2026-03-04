import { Button, ContextMenu } from '@expo/ui/swift-ui';
import { SfSymbol } from '@/ui/sf-symbol';

type HeaderMenuProps = {
  selectAllContacts: () => void;
  deselectAllContacts: () => void;
  isAllSelected: boolean;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  isNoneSelected: boolean;
};

export function HeaderMenu({
  selectAllContacts,
  deselectAllContacts,
  isAllSelected,
  selectionMode,
  setSelectionMode,
  isNoneSelected,
}: HeaderMenuProps) {
  return (
    <ContextMenu>
      <ContextMenu.Items>
        {selectionMode && !isAllSelected && (
          <Button onPress={selectAllContacts} systemImage="checklist.checked">
            Check all
          </Button>
        )}
        {selectionMode && !isNoneSelected && (
          <Button onPress={deselectAllContacts} systemImage="checklist.unchecked">
            Uncheck all
          </Button>
        )}
        {!selectionMode && (
          <Button onPress={() => setSelectionMode(true)} systemImage="checkmark.circle">
            Select contacts
          </Button>
        )}
        {selectionMode && (
          // biome-ignore lint/a11y/useValidAriaRole: <explanation>
          <Button
            onPress={() => setSelectionMode(false)}
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
