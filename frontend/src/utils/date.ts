/**
 * Calculate age from birth date (YYYY-MM format)
 */
export function calculateAge(birthDate: string): string {
  if (!birthDate) return '';
  const [year, month] = birthDate.split('-').map(Number);
  if (!year || !month) return '';
  const now = new Date();
  const birth = new Date(year, month - 1);
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return String(age);
}

/**
 * Format birth date for display (YYYY-MM -> YYYY年MM月)
 */
export function formatBirthDate(birthDate: string): string {
  if (!birthDate) return '';
  const [year, month] = birthDate.split('-');
  if (!year || !month) return birthDate;
  return `${year}年${month}月`;
}
