import { COLOR_PALETTE } from '../utils/colors';

export default function ColorPicker({ selected, onSelect }) {
  return (
    <div className="color-picker">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c.hex}
          type="button"
          className={`color-circle ${selected === c.hex ? 'color-circle-selected' : ''}`}
          style={{ background: c.hex }}
          onClick={() => onSelect(c.hex)}
          title={c.name}
        >
          {selected === c.hex && '✓'}
        </button>
      ))}
    </div>
  );
}
