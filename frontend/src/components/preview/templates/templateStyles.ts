export const fonts = {
  heading: '"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
  body: '"Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
};

export const colors = {
  text: '#000000',
  textSecondary: '#222222',
  textLight: '#666666',
  heading: '#000000',
  divider: '#e0e0e0',
  accent: '#333333',
  background: '#ffffff',
};

export const spacing = {
  pagePadding: '40px 50px',
  sectionGap: '16px',
  itemGap: '12px',
  lineHeight: '1.5',
};

export function getScaledStyles(scale: number | null) {
  const s = scale ?? 1;
  const clamp = Math.max(s, 0.75);
  const vPad = Math.round(40 * clamp);
  const hPad = Math.round(50 * clamp);
  return {
    fontSize: (base: number) => `${Math.round(base * clamp)}px`,
    lineHeight: `${Math.max(1.2, 1.5 * clamp).toFixed(2)}`,
    pagePadding: `${vPad}px ${hPad}px`,
    sectionGap: `${Math.round(16 * clamp)}px`,
    itemGap: `${Math.round(12 * clamp)}px`,
    scale: clamp,
  };
}
