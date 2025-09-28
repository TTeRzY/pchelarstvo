// генерира примерни серии за 7/30/365 дни
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

function genSeries(days: number, base = 8.0) {
  const out: { date: string; min: number; max: number; avg: number }[] = [];
  let price = base;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // лека „random walk“ симулация
    const delta = (Math.random() - 0.5) * 0.2;
    price = Math.max(6.5, price + delta);
    const min = +(price - Math.random() * 0.15).toFixed(2);
    const max = +(price + Math.random() * 0.15).toFixed(2);
    const avg = +((min + max) / 2).toFixed(2);
    out.push({ date: fmt(d), min, max, avg });
  }
  return out;
}

export const series7d = genSeries(7, 8.2);
export const series30d = genSeries(30, 8.0);
export const series1y = genSeries(365, 7.8);
