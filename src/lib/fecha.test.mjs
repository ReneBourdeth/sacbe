// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { diaHonduras, hora24Honduras, instanteHonduras, mesDe } from './fecha.ts'

test('a late-evening Honduras departure stays on the Honduras day', () => {
  // 02:11 UTC on Oct 16 is 20:11 on Oct 15 in Honduras (UTC-6)
  assert.equal(hora24Honduras('2026-10-16T02:11:25Z'), '20:11')
  assert.equal(diaHonduras('2026-10-16T02:11:25Z'), '2026-10-15')
})

test('a Honduras date and time become the right moment', () => {
  assert.equal(new Date(instanteHonduras('2026-11-02', '08:00')).toISOString(), '2026-11-02T14:00:00.000Z')
})

test('round trip: what staff type is what they see again', () => {
  const salida = instanteHonduras('2026-12-01', '23:30')
  assert.equal(hora24Honduras(salida), '23:30')
  assert.equal(diaHonduras(salida), '2026-12-01')
})

test('month range for the revenue report', () => {
  assert.deepEqual(mesDe('2026-11-02'), { desde: '2026-11-01', hasta: '2026-11-30' })
  assert.deepEqual(mesDe('2028-02-10'), { desde: '2028-02-01', hasta: '2028-02-29' }) // leap year
  assert.deepEqual(mesDe('2026-12-31'), { desde: '2026-12-01', hasta: '2026-12-31' })
})
