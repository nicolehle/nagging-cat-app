export function msFromNow(ms: number) {
  return ms - Date.now();
}

export function formatTimeLeft(msLeft: number) {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);

  if (hours <= 0) return `${mins}m left`;
  return `${hours}h ${mins}m left`;
}