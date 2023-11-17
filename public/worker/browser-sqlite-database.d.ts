import { Query, ResultSet, ResultSetError, SQLTransactionAsyncCallback, SqliteDatabase, SQLTransactionAsync } from '@new-mareland/crystal-mirror-base-sqlite-storage';
import { Subject } from 'rxjs';
export declare class BrowserSqliteDatabase implements SqliteDatabase {
    private dispatcher;
    private queue;
    /**
     * processing should only be read and written in processQueue()
     */
    private processing;
    constructor(filename: string, startSubject: Subject<boolean>, workerDirUrl: string);
    execAsync(queries: Query[], readOnly: boolean): Promise<(ResultSetError | ResultSet)[]>;
    transactionAsync(asyncCallback: SQLTransactionAsyncCallback, readOnly?: boolean): Promise<void>;
    processQueue(): Promise<void>;
    processTransaction(asyncCallback: SQLTransactionAsyncCallback, readOnly?: boolean): Promise<boolean>;
    closeAsync(): void;
}
export declare class SqliteTransactionAsync implements SQLTransactionAsync {
    private readonly db;
    private readonly readOnly;
    constructor(db: SqliteDatabase, readOnly: boolean);
    executeSqlAsync(sqlStatement: string, args?: (number | string)[]): Promise<ResultSetError | ResultSet>;
}
//# sourceMappingURL=browser-sqlite-database.d.ts.map