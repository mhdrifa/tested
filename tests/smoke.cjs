const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.TEST_BASE || 'http://127.0.0.1:8765';
const catalog = {
  products: [], categories: [], collections: [], banners: [], shipping: [],
  settings: { contact_phone: '+94 77 049 8004', whatsapp_url: 'https://wa.me/message/IFADOYDEKWLEA1', payment_methods: ['Cash on Delivery'] }
};
const settingsRows = [
  { 'Setting Name': 'public.contact_phone', 'Setting Value': '+94 77 049 8004', Description: 'Phone' },
  { 'Setting Name': 'public.whatsapp_url', 'Setting Value': 'https://wa.me/message/IFADOYDEKWLEA1', Description: 'WhatsApp' }
];
const errors = [];
let passed = 0;
function ok(label) { console.log('PASS', label); passed++; }
async function mockAPI(route) {
  const req = route.request();
  let action = new URL(req.url()).searchParams.get('action');
  let data = {};
  if (req.method() === 'POST') {
    try { const b = JSON.parse(req.postData()); action = b.action; data = b.data || {}; } catch (_) {}
  }
  let result = {};
  if (action === 'catalog') result = catalog;
  else if (action === 'ping') result = { service: 'BLACK BRAND', version: 'test' };
  else if (action === 'adminMe') result = { staff: { name: 'Test Owner', role: 'owner', totpEnabled: true }, scope: 'full' };
  else if (action === 'list') result = { rows: data.sheet === 'Store Settings' ? settingsRows : [], total: data.sheet === 'Store Settings' ? settingsRows.length : 0 };
  else if (action === 'saveSetting') {
    const row = settingsRows.find(r => r['Setting Name'] === data.name);
    if (row) row['Setting Value'] = data.value;
    else settingsRows.push({ 'Setting Name': data.name, 'Setting Value': data.value, Description: data.description });
    result = { name: data.name, value: data.value };
  }
  else if (action === 'dashboard') result = {
    kpis: Object.fromEntries(['todaysSales','totalRevenue','totalOrders','pendingOrders','completedOrders','cancelledOrders','totalProducts','totalCustomers','lowStockProducts','averageOrderValue'].map(k => [k,0])),
    analytics: { isEmpty:true, daily:[], weekly:[], monthly:[], topProducts:[], byCategory:[], paymentMethods:[], orderStatus:[] }
  };
  await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify({ok:true,data:result}) });
}
async function run() {
 const browser=await chromium.launch({...(process.platform==='linux'?{executablePath:'/usr/bin/chromium'}:{}),headless:true,args:['--no-sandbox']});
 try {
   for (const [label,width,height] of [['phone',375,812],['small-phone',320,700],['tablet',768,1024],['laptop',1440,900],['desktop',1920,1080]]) {
     const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
     await context.route('https://script.google.com/**',mockAPI);
     await context.route('https://script.googleusercontent.com/**',mockAPI);
     const page=await context.newPage();
     page.on('pageerror',e=>errors.push(label+': '+e.message));
     await page.goto(base+'/index.html');
     await page.locator('.hero .pill').waitFor();
     assert.match(await page.locator('.hero .pill').innerText(),/ALL SRI LANKA/);
     assert.equal(await page.locator('.brand-image').count(),1);
     assert.equal(await page.locator('.brand-image').evaluate(e=>e.naturalWidth>0),true);
     const docWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
     assert.ok(docWidth<=width+2,`${label} horizontal overflow: ${docWidth} > ${width}`);
     await page.goto(base+'/index.html#/shop');
     await page.locator('.pgrid, .empty').first().waitFor();
     const shopWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
     assert.ok(shopWidth<=width+2,`${label} shop overflow: ${shopWidth}`);
     ok(label+' storefront layout, logo, navigation');
     await context.close();
   }
   const c=await browser.newContext({viewport:{width:1280,height:850}});
   await c.route('https://script.google.com/**',mockAPI);
   await c.route('https://script.googleusercontent.com/**',mockAPI);
   await c.addInitScript(()=>sessionStorage.setItem('bb_admin_tok','test-token'));
   const p=await c.newPage();p.on('pageerror',e=>errors.push('admin: '+e.message));
   await p.goto(base+'/brand-management.html#/settings');
   await p.locator('[data-a="set-new"]').waitFor();
   await p.locator('[data-a="set-new"]').click();
   await p.locator('#mf [name=name]').fill('public.test_note');
   await p.locator('#mf [name=value]').fill('Smoke test');
   await p.locator('#mf [type=submit]').click();
   await p.getByText('public.test_note').first().waitFor();
   assert.equal(settingsRows.some(r=>r['Setting Name']==='public.test_note'),true);
   ok('admin new setting save + readback integration with mock API');
   await p.setViewportSize({width:375,height:812});
   const w=await p.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(w<=377,'admin phone overflow: '+w);
   ok('admin phone layout');
   await c.close();
   assert.deepEqual(errors,[]);
   console.log(`RESULT ${passed} passed, 0 browser exceptions`);
 } finally { await browser.close(); }
}
run().catch(e=>{console.error('FAIL',e.stack);process.exitCode=1});
