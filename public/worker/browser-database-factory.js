var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Subject, filter, firstValueFrom } from 'rxjs';
import { BrowserSqliteDatabase } from './browser-sqlite-database';
export class BrowserSqliteDatabaseFactory {
    constructor(workerDirUrl) {
        this.workerDirUrl = workerDirUrl;
    }
    open(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const startSubject = new Subject();
            const databaseStarted = firstValueFrom(startSubject.asObservable().pipe(filter((x) => x)));
            /**
             * This assumes that this is running in a browser environment
             */
            const database = new BrowserSqliteDatabase(filename, startSubject, this.workerDirUrl);
            yield databaseStarted;
            return database;
        });
    }
}
