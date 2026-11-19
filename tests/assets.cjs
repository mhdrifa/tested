const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['index.html','admin.html','order-confirmation.html'];
let count=0;
for(const file of pages){
 const text=fs.readFileSync(path.join(root,file),'utf8');
 for(const [,src] of text.matchAll(/(?:src|href)="([^"]+)"/g)){
   if(!src||src.startsWith('#')||/^(https?:|data:|tel:|mailto:)/.test(src))continue;
   assert.ok(fs.existsSync(path.join(root,src.split('#')[0].split('?')[0])),`${file}: missing ${src}`);count++;
 }
}
const css=fs.readFileSync(path.join(root,'css/styles.css'),'utf8');
assert.match(css,/@media\(max-width:380px\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/\.carousel\{[^}]*overflow-x:auto/);
console.log(`PASS ${count} local HTML asset references`);
console.log('PASS responsive breakpoints and reduced-motion CSS present');
