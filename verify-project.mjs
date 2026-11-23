import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = path.join(root, 'www');
const htmlPath = path.join(webRoot, 'index.html');
const errors = [];
const checks = [];
const mustExist = [
  'www/index.html',
  'www/lib/three.min.js',
  'www/assets/cover.jpg',
  'www/assets/video_1.mp4',
  'assets/icon.png',
  'assets/splash.png',
  'capacitor.config.json',
  'package.json'
];
for (const rel of mustExist) {
  const ok = fs.existsSync(path.join(root, rel));
  checks.push([ok, `file ${rel}`]);
  if (!ok) errors.push(`Missing required file: ${rel}`);
}

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const ref of refs) {
    if (/^(?:https?:|data:|#|\/\/)/i.test(ref)) continue;
    const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
    const target = path.resolve(webRoot, clean);
    const inside = target === webRoot || target.startsWith(webRoot + path.sep);
    const ok = inside && fs.existsSync(target);
    checks.push([ok, `asset reference ${ref}`]);
    if (!ok) errors.push(`Broken or unsafe local reference in index.html: ${ref}`);
  }
  const inlineScripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  for (let i = 0; i < inlineScripts.length; i++) {
    const temp = path.join(os.tmpdir(), `gta6-inline-${process.pid}-${i}.js`);
    fs.writeFileSync(temp, inlineScripts[i]);
    const result = spawnSync(process.execPath, ['--check', temp], { encoding: 'utf8' });
    fs.rmSync(temp, { force: true });
    const ok = result.status === 0;
    checks.push([ok, `inline JavaScript syntax ${i + 1}`]);
    if (!ok) errors.push(`JavaScript syntax error: ${result.stderr || result.stdout}`);
  }
}

const mp4 = path.join(webRoot, 'assets/video_1.mp4');
if (fs.existsSync(mp4)) {
  const b = fs.readFileSync(mp4);
  const ok = b.length > 12 && b.toString('ascii', 4, 8) === 'ftyp';
  checks.push([ok, 'MP4 container signature']);
  if (!ok) errors.push('video_1.mp4 does not look like an MP4/ISO-BMFF file');
}
const png = path.join(root, 'assets/icon.png');
if (fs.existsSync(png)) {
  const b = fs.readFileSync(png);
  const ok = b.length > 24 && b.readUInt32BE(0) === 0x89504e47 && b.readUInt32BE(16) === 1024 && b.readUInt32BE(20) === 1024;
  checks.push([ok, 'launcher icon PNG 1024x1024']);
  if (!ok) errors.push('assets/icon.png must be a valid 1024x1024 PNG');
}

for (const [ok, label] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (errors.length) {
  console.error(`\n${errors.length} verification error(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`\nProject verification passed (${checks.length} checks).`);
