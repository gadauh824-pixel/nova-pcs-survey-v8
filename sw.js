const CACHE='pcs-v8';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.open(CACHE).then(async c=>{
      const r = await c.match(e.request);
      try{
        const net = await fetch(e.request);
        if(net.ok) c.put(e.request,net.clone());
        return net;
      }catch(_){ return r || new Response('offline',{status:503}); }
    })
  );
});
