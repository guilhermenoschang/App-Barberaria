/** Remove caracteres perigosos de strings */
export function sanitize(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}
export function sanitizePhone(s: string): string {
  return s.replace(/[^\d\s()\-+]/g, '').trim().slice(0, 20)
}
export function sanitizeEmail(s: string): string {
  return s.replace(/[^a-zA-Z0-9@._\-+]/g, '').trim().slice(0, 100)
}
