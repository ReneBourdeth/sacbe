// Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { numeroWhatsApp } from './telefono.ts'

test('a Honduran number gets its country code', () => {
  assert.equal(numeroWhatsApp('9999-9999'), '50499999999')
  assert.equal(numeroWhatsApp(' 3312 4567 '), '50433124567')
})

test('a number with its country code is kept', () => {
  assert.equal(numeroWhatsApp('+504 9999-9999'), '50499999999')
  assert.equal(numeroWhatsApp('+1 (555) 010-0000'), '15550100000')
})

test('anything else is refused', () => {
  for (const malo of ['', '1234', '+504 99', 'hola', '9999-999', '1234567890123456']) {
    assert.equal(numeroWhatsApp(malo), null, malo)
  }
})
