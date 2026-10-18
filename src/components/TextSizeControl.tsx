import type { TypeSize } from '../textSize';

export default function TextSizeControl({
  value,
  onChange,
  label,
  nameM,
  nameL,
  nameXl,
}: {
  value: TypeSize;
  onChange: (size: TypeSize) => void;
  label: string;
  nameM: string;
  nameL: string;
  nameXl: string;
}) {
  const sizes = [
    { id: 'm' as const, px: 12, name: nameM },
    { id: 'l' as const, px: 15, name: nameL },
    { id: 'xl' as const, px: 18, name: nameXl },
  ];
  return (
    <div
      className="flex items-end gap-0.5 shrink-0 ui-sans"
      role="radiogroup"
      aria-label={label}
      onTouchStart={(event) => event.stopPropagation()}
    >
      {sizes.map(({ id, px, name }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={name}
            onClick={() => onChange(id)}
            className={`h-8 w-8 flex items-center justify-center rounded-md font-semibold leading-none transition-all ${
              active ? 'bg-[#0D9488] text-white' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
            style={{ fontSize: px }}
          >
            A
          </button>
        );
      })}
    </div>
  );
}
