// Web stub — expo-sqlite requiere SharedArrayBuffer (headers COOP/COEP).
// En web usamos React Query como cache en memoria; no hay persistencia local.
// El tipo satisface a TypeScript; en runtime los data sources web son no-ops
// y nunca llegan a usar este valor.
import type { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import type * as schema from './schema';

export const db = null as unknown as ExpoSQLiteDatabase<typeof schema>;
