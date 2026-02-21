export const COLOR_PALETTE = [
  { name: 'Pink', hex: '#e91e8c', light: '#fce4f3' },
  { name: 'Blue', hex: '#2196f3', light: '#e3f2fd' },
  { name: 'Purple', hex: '#9c27b0', light: '#f3e5f5' },
  { name: 'Teal', hex: '#009688', light: '#e0f2f1' },
  { name: 'Orange', hex: '#ff9800', light: '#fff3e0' },
  { name: 'Red', hex: '#f44336', light: '#ffebee' },
  { name: 'Green', hex: '#4caf50', light: '#e8f5e9' },
  { name: 'Indigo', hex: '#3f51b5', light: '#e8eaf6' },
  { name: 'Amber', hex: '#ffc107', light: '#fff8e1' },
  { name: 'Cyan', hex: '#00bcd4', light: '#e0f7fa' },
];

export function getLightColor(hex) {
  if (!hex) return '#f5f5f7';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const light = (c) => Math.round(c + (255 - c) * 0.85);
  return `rgb(${light(r)}, ${light(g)}, ${light(b)})`;
}

export function getMemberColor(members, memberId) {
  const m = members.find((mem) => mem.id === memberId);
  return m?.color || '#6b7280';
}
