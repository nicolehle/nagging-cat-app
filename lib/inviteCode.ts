export function generateInviteCode() {
  const num = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `CAT-${num}`;
}