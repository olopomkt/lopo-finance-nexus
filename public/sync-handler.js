
// Este arquivo é carregado pelo service worker gerado (Workbox) via importScripts.
// Ele lida com o evento de Background Sync para processar a outbox no IndexedDB.
// Importante: Não usamos módulos do bundle aqui; tudo é código puro de SW.

// Configurações do Supabase (públicas) para REST
const SUPABASE_URL = 'https://kdumengvbndveepkponj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkdW1lbmd2Ym5kdmVlcGtwb25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTY5ODksImV4cCI6MjA2NzczMjk4OX0.poInFg3xiPNTi2prR9f7CAjtheWWdA_sbrSpJ-v8Fi8';

// Outbox DB/Store nomes (devem bater com o utilitário do app)
const OUTBOX_DB_NAME = 'offline-db';
const OUTBOX_STORE_NAME = 'outbox';

// Utilitários mínimos de IndexedDB no contexto do SW
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OUTBOX_DB_NAME);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE_NAME)) {
        db.createObjectStore(OUTBOX_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE_NAME, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE_NAME);
    const items = [];
    const cursorReq = store.openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        items.push(cursor.value);
        cursor.continue();
      } else {
        resolve(items);
      }
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

async function idbClear() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE_NAME);
    const clearReq = store.clear();
    clearReq.onsuccess = () => resolve();
    clearReq.onerror = () => reject(clearReq.error);
  });
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-outbox') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const outbox = await idbGetAll();
    if (!outbox.length) {
      return;
    }

    for (const item of outbox) {
      await processItem(item);
    }

    await idbClear();

    // Notifica clientes para atualizar dados (o app já escuta essa mensagem)
    const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage({ type: 'SYNC_OFFLINE_DATA' });
    }
  } catch (e) {
    // Silencioso: Workbox/Background Sync tentará novamente
    console.error('[SW sync-handler] Sync error:', e);
  }
}

async function processItem(item) {
  const baseUrl = `${SUPABASE_URL}/rest/v1/${item.tableName}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  if (item.action === 'save') {
    await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(item.data),
    });
    return;
  }

  if (!item.recordId) return;

  const urlWithFilter = `${baseUrl}?id=eq.${encodeURIComponent(item.recordId)}`;

  if (item.action === 'update') {
    await fetch(urlWithFilter, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(item.data),
    });
    return;
  }

  if (item.action === 'delete') {
    await fetch(urlWithFilter, {
      method: 'DELETE',
      headers,
    });
  }
}

