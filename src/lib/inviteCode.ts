export function generateInviteCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CAT-${num}`;
}
