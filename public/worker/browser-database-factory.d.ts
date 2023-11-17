import { SqliteDatabase, SqliteDatabaseFactory } from '@new-mareland/crystal-mirror-base-sqlite-storage';
export declare class BrowserSqliteDatabaseFactory implements SqliteDatabaseFactory {
    readonly workerDirUrl: string;
    constructor(workerDirUrl: string);
    open(filename: string): Promise<SqliteDatabase>;
}
//# sourceMappingURL=browser-database-factory.d.ts.map