#!/usr/bin/env node
/**
 * Verifica que el sitio no tenga enlaces rotos:
 *  - todo href/src relativo de cada .html apunta a un archivo que existe
 *  - cada juego del catálogo (js/portal.js) tiene su página en juegos/
 *  - avisa de páginas en juegos/ que no están en el catálogo
 * Uso: node scripts/verificar.mjs        (sin dependencias)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SALTAR = new Set(['.git', '.github', 'node_modules', '_site', 'docs', 'scripts']);
const errores = [], avisos = [];

function html(dir) {
  return readdirSync(dir).flatMap(n => {
    if (SALTAR.has(n)) return [];
    const p = join(dir, n);
    return statSync(p).isDirectory() ? html(p) : n.endsWith('.html') ? [p] : [];
  });
}

const paginas = html(raiz);
for (const f of paginas) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(?:[a-z]+:|\/\/|#|data:|\$\{|\{)/i.test(u) || u.includes('${')) continue;
    const ruta = u.split(/[?#]/)[0];
    if (!ruta) continue;
    const dest = ruta.startsWith('/') ? join(raiz, ruta) : resolve(dirname(f), ruta);
    if (!existsSync(dest) && !(ruta === '/' )) errores.push(`${relative(raiz, f)} → ${u} (no existe)`);
  }
}

const portal = readFileSync(join(raiz, 'js/portal.js'), 'utf8');
const enCatalogo = new Set([...portal.matchAll(/h:'(juegos\/[^']+\.html)'/g)].map(m => m[1]));
for (const h of enCatalogo) if (!existsSync(join(raiz, h))) errores.push(`catálogo → ${h} (no existe)`);
const datos = readFileSync(join(raiz, 'js/datos.js'), 'utf8');
const alias = new Set([...((datos.match(/const ALIAS=\{([^}]*)\}/) || [])[1] || '').matchAll(/(\w+):/g)].map(m => m[1] + '.html'));   // páginas antiguas que reutilizan otro juego
for (const n of readdirSync(join(raiz, 'juegos')).filter(n => n.endsWith('.html')))
  if (!enCatalogo.has('juegos/' + n) && !alias.has(n)) avisos.push(`juegos/${n} no está en el catálogo (js/portal.js)`);
for (const m of portal.matchAll(/\bi:'([a-z0-9_-]+)'/g))
  if (!existsSync(join(raiz, 'img', m[1] + '.svg'))) errores.push(`catálogo → img/${m[1]}.svg (no existe)`);

// --- requisitos legales mínimos
for (const f of ['aviso-privacidad.html', 'terminos.html', 'js/legal.js'])
  if (!existsSync(join(raiz, f))) errores.push(`falta ${f} (aviso de privacidad / términos)`);
if (existsSync(join(raiz, 'js/legal.js'))) {
  const lg = readFileSync(join(raiz, 'js/legal.js'), 'utf8');
  for (const campo of ['responsable', 'correo', 'domicilio'])
    if (!new RegExp(`${campo}:\\s*'[^']+'`).test(lg)) errores.push(`js/legal.js: completa el campo «${campo}» antes de publicar`);
}
for (const p of ['index.html']) if (!/aviso-privacidad\.html/.test(readFileSync(join(raiz, p), 'utf8'))) errores.push(`${p} no enlaza al aviso de privacidad`);

console.log(`Páginas revisadas: ${paginas.length} · Juegos en catálogo: ${enCatalogo.size}`);
avisos.forEach(a => console.warn('AVISO  ' + a));
errores.forEach(e => console.error('ERROR  ' + e));
if (errores.length) { console.error(`\n${errores.length} error(es).`); process.exit(1); }
console.log('Todo en orden ✔');
