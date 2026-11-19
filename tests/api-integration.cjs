const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'../js/api.js'),'utf8');
let calls=[];
const context={ URLSearchParams,JSON,Error,window:{BB_CONFIG:{API_URL:'https://example.test/exec'}},fetch:async(url,options)=>{
  calls.push({url,options});
  const body=options&&JSON.parse(options.body);
  if(body?.action==='bad')return {json:async()=>({ok:false,error:{code:'VALIDATION',message:'Invalid field'}})};
  return {json:async()=>({ok:true,data:{action:body?.action||new URL(url).searchParams.get('action')}})};
}};
vm.createContext(context);vm.runInContext(code,context);
(async()=>{
 const api=context.window.BBApi;
 const got=await api.get('catalog',{page:2});
 assert.equal(got.action,'catalog');
 assert.match(calls[0].url,/action=catalog/);
 assert.match(calls[0].url,/page=2/);
 const saved=await api.post('saveSetting',{name:'public.contact_phone',value:'+94770498004'},{token:'mock-token'});
 assert.equal(saved.action,'saveSetting');
 assert.equal(calls[1].options.headers['Content-Type'],'text/plain;charset=utf-8');
 assert.equal(JSON.parse(calls[1].options.body).token,'mock-token');
 await assert.rejects(api.post('bad'),e=>e.code==='VALIDATION'&&e.message==='Invalid field');
 console.log('PASS API GET query encoding');
 console.log('PASS API authenticated POST request contract');
 console.log('PASS API backend error propagation');
 console.log('RESULT 3 mocked integration tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
