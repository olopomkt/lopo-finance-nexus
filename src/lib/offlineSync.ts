
import { clear as idbClear, createStore, entries, set } from 'idb-keyval';

export type OutboxAction = 'save' | 'update' | 'delete';
export type OutboxTable = 'company_revenues' | 'company_expenses' | 'personal_expenses';

export interface OutboxItem {
  id: string;
  tableName: OutboxTable;
  action: OutboxAction;
  data: any;
  recordId?: string;
  timestamp: number;
}

const OUTBOX_DB_NAME = 'offline-db';
const OUTBOX_STORE_NAME = 'outbox';
const outboxStore = createStore(OUTBOX_DB_NAME, OUTBOX_STORE_NAME);

/**
 * Adiciona uma operação à fila de outbox.
 */
export async function addToOutbox(item: Omit<OutboxItem, 'id' | 'timestamp'>): Promise<string> {
  const fullItem: OutboxItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await set(fullItem.id, fullItem, outboxStore);
  return fullItem.id;
}

/**
 * Retorna todos os itens da outbox, ordenados por timestamp.
 */
export async function getOutbox(): Promise<OutboxItem[]> {
  const all = await entries<string, OutboxItem>(outboxStore);
  return all.map(([, value]) => value).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Limpa todos os itens da outbox.
 */
export async function clearOutbox(): Promise<void> {
  await idbClear(outboxStore);
}

