export type TypeSize = 'm' | 'l' | 'xl';

export function resolveTypeSize(value: string | null | undefined): TypeSize {
  if (value === 'l' || value === 'xl') return value;
  return 'm';
}

export const TYPE_SCALE: Record<TypeSize, { he: number; instruction: number; translit: number; translation: number }> = {
  m: { he: 26, instruction: 15, translit: 14, translation: 15 },
  l: { he: 32, instruction: 17, translit: 17, translation: 18 },
  xl: { he: 40, instruction: 20, translit: 21, translation: 22 },
};
