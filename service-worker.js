self.addEventListener("install", (e)=>self.skipWaiting());
self.addEventListener("activate", (e)=>self.clients.claim());
const CACHE="expense-neon-v1";
self.addEventListener("fetch", (e)=>{
  e.respondWith(
    caches.open(CACHE).then(c=>c.match(e.request).then(r=>r || fetch(e.request).then(resp=>{
      if(e.request.method==="GET" && resp.ok) c.put(e.request, resp.clone());
      return resp;
    })))
  );
});