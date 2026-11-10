const numberFormatter = new Intl.NumberFormat('en-IN');
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const VES_PER_RUPEE = 10;

export function formatNumber(value) {
  return numberFormatter.format(Math.round(Number(value) || 0));
}

export function formatVE(value) {
  return `${formatNumber(value)} VE`;
}

export function formatINR(value) {
  return inrFormatter.format(Number(value) || 0);
}

export function vesToInr(ves) {
  return (Number(ves) || 0) / VES_PER_RUPEE;
}

export function inrToVes(inr) {
  return Math.round((Number(inr) || 0) * VES_PER_RUPEE);
}

export function dateShort(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value) {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  return `${months} mo ago`;
}

export function daysLeft(value) {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function maskEmail(email = '') {
  const [name, domain] = String(email).split('@');
  if (!domain) return '••••';
  const visible = name.slice(0, 1) || '•';
  return `${visible}${'•'.repeat(Math.max(2, name.length - 1))}@${domain}`;
}

export function maskUpi(upi = '') {
  const [handle, bank] = String(upi).split('@');
  if (!bank) return '••••';
  return `${handle.slice(0, 1)}${'•'.repeat(Math.max(2, handle.length - 1))}@${bank}`;
}

export function maskDestination(method, destination = '') {
  if (method === 'upi') return maskUpi(destination);
  return maskEmail(destination);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'V';
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

export function downloadCsv(filename, rows) {
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
