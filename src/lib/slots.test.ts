import { describe, expect, it } from 'vitest'
import { generateBlockedTimeRange, validateBlockedTimeRange } from '@/lib/slots'

describe('blocked time ranges', () => {
  it('generates every slot between start and end using the configured interval', () => {
    expect(generateBlockedTimeRange('09:00', '12:00', 60)).toEqual(['09:00', '10:00', '11:00'])
    expect(generateBlockedTimeRange('09:30', '11:00', 30)).toEqual(['09:30', '10:00', '10:30'])
  })

  it('rejects invalid ranges', () => {
    expect(validateBlockedTimeRange('', '12:00', 60)).toEqual({
      ok: false,
      error: 'Informe horario inicial e final.',
    })

    expect(validateBlockedTimeRange('13:00', '12:00', 60)).toEqual({
      ok: false,
      error: 'O horario final precisa ser maior que o inicial.',
    })
  })
})
