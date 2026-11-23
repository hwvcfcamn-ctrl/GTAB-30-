import fs from 'node:fs';
const file = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(file)) {
  console.error(`Android manifest not found: ${file}`);
  process.exit(1);
}
let xml = fs.readFileSync(file, 'utf8');
if (/android:screenOrientation="[^"]+"/.test(xml)) {
  xml = xml.replace(/android:screenOrientation="[^"]+"/, 'android:screenOrientation="sensorLandscape"');
} else if (/<activity\b[^>]*>/.test(xml)) {
  xml = xml.replace(/<activity\b([^>]*)>/, '<activity android:screenOrientation="sensorLandscape"$1>');
} else {
  console.error('No <activity> element found in AndroidManifest.xml');
  process.exit(1);
}
fs.writeFileSync(file, xml);
console.log('Android activity orientation set to sensorLandscape.');
