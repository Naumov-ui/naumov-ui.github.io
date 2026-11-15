/* Jambo Music: сервис-воркер. При выпуске обновления меняйте VER здесь и в index.html. */
const VER='0.0.18';
const CACHE='jambo-'+VER;
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-512-maskable.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  /* музыка, Supabase, Jamendo и всё чужое идёт напрямую, без кэша */
  if(r.method!=='GET'||u.origin!==location.origin)return;
  /* страница: сначала сеть (чтобы обновления доходили), без сети из кэша */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
