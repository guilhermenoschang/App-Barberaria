/**
 * Utilitários de data — sem conversão UTC.
 * Datas são sempre tratadas como strings YYYY-MM-DD no fuso local.
 */

/** Retorna hoje como YYYY-MM-DD no fuso local */
export function todayStr(): string {
  const d = new Date()
  return localDateStr(d)
}

/** Converte Date para YYYY-MM-DD no fuso local (sem UTC drift) */
export function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Avança ou recua N dias a partir de uma string YYYY-MM-DD */
export function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return localDateStr(dt)
}

/** Formata YYYY-MM-DD para exibição em português */
export function formatDatePT(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

/** Formata YYYY-MM-DD para exibição curta: 07/05/2025 */
export function formatDateShort(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

/** Retorna o nome do dia da semana em inglês (para WeekSchedule) */
export function weekdayKey(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const keys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  return keys[dt.getDay()]
}

/** Compara duas strings YYYY-MM-DD */
export function isBeforeToday(dateStr: string): boolean {
  return dateStr < todayStr()
}
