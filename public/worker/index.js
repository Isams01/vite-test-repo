import { RxStorageBaseSqlite, } from '@new-mareland/crystal-mirror-base-sqlite-storage';
import { BrowserSqliteDatabaseFactory } from './browser-database-factory';
export function getRxBrowserStorage(settings) {
    const browserDatabaseFactory = new BrowserSqliteDatabaseFactory(settings.workerDirUrl);
    return new RxStorageBaseSqlite(settings, browserDatabaseFactory);
}
export { RxStorageBaseSqlite };
