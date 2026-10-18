// Run with: npm test   (Node's built-in test runner, no extra packages)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rutaInternaSegura } from './navegacion.ts'

test('keeps paths inside the site', () => {
  assert.equal(rutaInternaSegura('/mis-viajes'), '/mis-viajes')
  assert.equal(rutaInternaSegura('/resultados?origen=SPS&destino=TGU'), '/resultados?origen=SPS&destino=TGU')
})

test('blocks other websites', () => {
  for (const malo of ['https://evil.com', '//evil.com', '/\\evil.com', '\\\\evil.com', 'javascript:alert(1)']) {
    assert.equal(rutaInternaSegura(malo), '/mis-viajes', malo)
  }
})

test('falls back when missing', () => {
  assert.equal(rutaInternaSegura(null), '/mis-viajes')
  assert.equal(rutaInternaSegura('', '/'), '/')
})
