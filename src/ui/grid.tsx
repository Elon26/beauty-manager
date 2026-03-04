import { scaleX } from '@kirz/nativewind-scale';
import { Children } from 'react';
import { View, type ViewProps } from 'react-native';

export type GridProps = {
  columns: number;
  spacing?: number;
  children?: ViewProps['children'];
  rowStyle?: ViewProps['style'];
} & ViewProps;

export function Grid({ columns, spacing = scaleX(8), children, rowStyle, ...props }: GridProps) {
  const childrenNodes = Children.toArray(children);
  const numberOfRows = Math.ceil(childrenNodes.length / columns);
  const restCells = childrenNodes.length % columns;

  if (!numberOfRows) {
    return null;
  }

  return (
    <View {...props}>
      {[...new Array(numberOfRows).keys()].map((rowId) => (
        <View
          key={rowId}
          style={[
            rowStyle,
            {
              flexDirection: 'row',
              marginBottom: rowId < numberOfRows - 1 ? spacing : 0,
              marginHorizontal: -spacing / 2,
            },
          ]}
        >
          {childrenNodes
            .filter((_, nodeIdx) => nodeIdx >= rowId * columns && nodeIdx < (rowId + 1) * columns)
            .map((node, nodeIdx) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <View key={nodeIdx} style={{ flex: 1, marginHorizontal: spacing / 2 }}>
                {node}
              </View>
            ))}

          {rowId === numberOfRows - 1 &&
            [...new Array(restCells > 0 ? columns - restCells : 0).keys()].map((cellIdx) => (
              <View key={cellIdx} style={{ flex: 1, marginHorizontal: spacing / 2 }} />
            ))}
        </View>
      ))}
    </View>
  );
}
