import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
const raw=await readFile('info.md','utf8');
const data=JSON.parse(raw.match(/```json\s*([\s\S]*?)```/)?.[1]||'null');
if(!data?.groom||!data?.bride||!data?.photos?.length)throw new Error('info.md의 이름과 사진을 확인하세요.');
const date=new Date(data.date);
if(Number.isNaN(date.getTime()))throw new Error('날짜 형식을 확인하세요.');
const short=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('-','.');
const long=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'long',day:'numeric',weekday:'long',hour:'numeric',minute:'2-digit',hour12:true}).format(date);
const origin=process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'http://localhost:4500');
const url=new URL(origin); if(!['http:','https:'].includes(url.protocol))throw new Error('Invalid SITE_URL');
const title=`${data.groom} ♥ ${data.bride} 결혼합니다`;
const values={TITLE:title,DESCRIPTION:`${long} · ${data.venue} ${data.hall} · ${data.address}`,SITE_URL:url.origin,GROOM:data.groom,BRIDE:data.bride,GREETING:data.greeting,VENUE:data.venue,HALL:data.hall,ADDRESS:data.address,DATE_ISO:data.date,DATE_SHORT:short,DATE_LONG:long,MAIN_PHOTO:data.photos[0].src,MAIN_ALT:data.photos[0].alt,MAP_NAVER:`https://map.naver.com/p/search/${encodeURIComponent(data.address)}`,MAP_KAKAO:`https://map.kakao.com/?q=${encodeURIComponent(data.address)}`};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let html=await readFile('index.html','utf8');
html=html.replace(/\{\{(\w+)\}\}/g,(_,key)=>key==='DATA'?JSON.stringify(data).replaceAll('<','\\u003c'):escape(values[key]??''));
await mkdir('dist',{recursive:true});
await writeFile('dist/index.html',html);
for(const file of ['style.css','app.js'])await cp(file,`dist/${file}`);
await mkdir('dist/images',{recursive:true});
for (const photo of data.photos) {
  if (!/^images\/[a-zA-Z0-9_./-]+$/.test(photo.src) || photo.src.includes('..')) throw new Error('웹용 사진 경로는 images 폴더 안의 영문 경로를 사용하세요.');
  await cp(photo.src, `dist/${photo.src}`);
}
await cp('images/share-thumbnail.png','dist/images/share-thumbnail.png');
console.log(`Built invitation for ${title}; canonical ${url.origin}`);
