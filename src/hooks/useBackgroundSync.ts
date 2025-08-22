
import { useCallback, useEffect } from 'react';
import { indexedDBManager, PendingOperation } from '@/lib/indexedDB';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBackgroundSync = () => {
  // Register background sync
  const registerBackgroundSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Type assertion to handle the sync property
        (registration as any).sync?.register('sync-new-data');
        console.log('[Background Sync] Registered sync event');
      } catch (error) {
        console.error('[Background Sync] Failed to register:', error);
      }
    }
  }, []);

  // Add pending operation to IndexedDB and register sync
  const addPendingOperation = useCallback(async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    try {
      await indexedDBManager.addPendingOperation(operation);
      await registerBackgroundSync();
      console.log('[Background Sync] Added pending operation:', operation);
    } catch (error) {
      console.error('[Background Sync] Failed to add pending operation:', error);
      throw error;
    }
  }, [registerBackgroundSync]);

  // Sync pending operations manually
  const syncPendingOperations = useCallback(async () => {
    try {
      const pendingOperations = await indexedDBManager.getPendingOperations();
      console.log('[Background Sync] Found', pendingOperations.length, 'pending operations');

      for (const operation of pendingOperations) {
        try {
          let success = false;

          switch (operation.type) {
            case 'save':
              if (operation.table === 'company_revenues') {
                const { error } = await supabase.from('company_revenues').insert(operation.data);
                success = !error;
              } else if (operation.table === 'company_expenses') {
                const { error } = await supabase.from('company_expenses').insert(operation.data);
                success = !error;
              } else if (operation.table === 'personal_expenses') {
                const { error } = await supabase.from('personal_expenses').insert(operation.data);
                success = !error;
              }
              break;

            case 'update':
              if (operation.table === 'company_revenues') {
                const { error } = await supabase.from('company_revenues').update(operation.data).eq('id', operation.recordId);
                success = !error;
              } else if (operation.table === 'company_expenses') {
                const { error } = await supabase.from('company_expenses').update(operation.data).eq('id', operation.recordId);
                success = !error;
              } else if (operation.table === 'personal_expenses') {
                const { error } = await supabase.from('personal_expenses').update(operation.data).eq('id', operation.recordId);
                success = !error;
              }
              break;

            case 'delete':
              if (operation.table === 'company_revenues') {
                const { error } = await supabase.from('company_revenues').delete().eq('id', operation.recordId);
                success = !error;
              } else if (operation.table === 'company_expenses') {
                const { error } = await supabase.from('company_expenses').delete().eq('id', operation.recordId);
                success = !error;
              } else if (operation.table === 'personal_expenses') {
                const { error } = await supabase.from('personal_expenses').delete().eq('id', operation.recordId);
                success = !error;
              }
              break;
          }

          if (success) {
            await indexedDBManager.removePendingOperation(operation.id);
            console.log('[Background Sync] Successfully synced operation:', operation.id);
          } else {
            // Increment retry count
            const newRetryCount = operation.retryCount + 1;
            if (newRetryCount > 3) {
              // Remove after 3 retries
              await indexedDBManager.removePendingOperation(operation.id);
              console.log('[Background Sync] Removed operation after max retries:', operation.id);
            } else {
              await indexedDBManager.updateRetryCount(operation.id, newRetryCount);
              console.log('[Background Sync] Updated retry count for operation:', operation.id);
            }
          }
        } catch (error) {
          console.error('[Background Sync] Error syncing operation:', operation.id, error);
          const newRetryCount = operation.retryCount + 1;
          if (newRetryCount > 3) {
            await indexedDBManager.removePendingOperation(operation.id);
          } else {
            await indexedDBManager.updateRetryCount(operation.id, newRetryCount);
          }
        }
      }

      const remainingOperations = await indexedDBManager.getPendingOperations();
      if (remainingOperations.length === 0) {
        toast({
          title: "Sincronização concluída",
          description: "Todos os dados offline foram sincronizados com sucesso!"
        });
      }
    } catch (error) {
      console.error('[Background Sync] Failed to sync pending operations:', error);
    }
  }, []);

  // Check for pending operations on app load
  useEffect(() => {
    const checkPendingOperations = async () => {
      try {
        const pendingOperations = await indexedDBManager.getPendingOperations();
        if (pendingOperations.length > 0) {
          console.log('[Background Sync] Found pending operations on load:', pendingOperations.length);
          await syncPendingOperations();
        }
      } catch (error) {
        console.error('[Background Sync] Error checking pending operations:', error);
      }
    };

    checkPendingOperations();
  }, [syncPendingOperations]);

  return {
    addPendingOperation,
    syncPendingOperations,
    registerBackgroundSync
  };
};
