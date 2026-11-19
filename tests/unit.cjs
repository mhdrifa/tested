const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root,'Code.gs'),'utf8');
const sandbox = { console, Date, Math, JSON, Object, Array, String, Number, RegExp, Error, Intl };
vm.createContext(sandbox);
vm.runInContext(code,sandbox);
let passed=0;
function check(name,fn){fn();console.log('PASS',name);passed++}
check('Sri Lankan phone formats are normalized',()=>{
  for(const input of ['0770498004','770498004','94770498004','+94770498004'])
    assert.equal(sandbox.phone_(input,true),'+94770498004');
});
check('Invalid phone and email rejected',()=>{
  assert.throws(()=>sandbox.phone_('abc',true));
  assert.throws(()=>sandbox.email_('not an email',true));
});
check('Email normalization',()=>assert.equal(sandbox.email_(' INFO@EXAMPLE.COM ',true),'info@example.com'));
check('Logo file included and referenced',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/class="brand-image"/);
  assert.match(html,/RESOURCES\/38667688-5F43-4087-B2AC-CE4ABF5291F8.png/);
  assert.ok(fs.statSync(path.join(root,'RESOURCES/38667688-5F43-4087-B2AC-CE4ABF5291F8.png')).size>1000);
});
check('Frontend contact and hero use launch details',()=>{
  const js=fs.readFileSync(path.join(root,'js/store.js'),'utf8');
  assert.match(js,/KALPITIYA TO ALL SRI LANKA/);
  assert.match(js,/syncContact\(\)/);
  assert.doesNotMatch(js,/CEYLON COUTURE ATELIER • KALPITIYA TO COLOMBO/);
});
check('Backend default branding and domain',()=>{
  assert.ok(sandbox.DEFAULT_SETTINGS.some(s=>s[0]==='public.contact_phone'&&s[1]==='+94 77 049 8004'));
  assert.ok(sandbox.DEFAULT_SETTINGS.some(s=>s[0]==='public.site_url'&&s[1]==='https://blackbrand.com.lk'));
});
check('Vercel deployment configuration parses',()=>assert.ok(JSON.parse(fs.readFileSync(path.join(root,'vercel.json'))).headers.length));
console.log(`RESULT ${passed} unit tests passed`);
