import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { cssInterop } from 'nativewind';

export function SfSymbol(props: SymbolViewProps) {
  return <SymbolView {...props} />;
}

cssInterop(SfSymbol, { className: { target: 'style' } });
