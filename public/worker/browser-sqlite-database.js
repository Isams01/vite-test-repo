var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Map } from 'immutable';
import _ from 'lodash';
class CentralDispatch {
    constructor(filename, startedSubject, workerDirUrl) {
        this.msgPromiseMap = Map();
        this.id = 0;
        // create worker
        this.worker = new Worker(new URL(workerDirUrl + '/worker.js'), {
            type: 'module',
        });
        this.worker.postMessage({ type: 'open', filename });
        // afterwards setup message handler
        this.worker.onmessage = (event) => {
            // worker reply has the message id
            // 1 or more results are returned from  the worker but all should contain msgId and type
            const { type, msgId } = _.get(event.data, [0], { type: '', msgId: -1 });
            if (type === 'start complete') {
                startedSubject.next(true);
                return;
            }
            const p = this.msgPromiseMap.get(msgId);
            if (p === undefined) {
                return;
            }
            this.msgPromiseMap = this.msgPromiseMap.delete(msgId);
            p.resolve(event.data);
        };
    }
    nextId() {
        return this.id++;
    }
    execAsync(queries, readOnly) {
        // send message to worker
        const msgId = this.nextId();
        const p = new Promise((resolve, reject) => {
            this.msgPromiseMap = this.msgPromiseMap.set(msgId, { resolve, reject });
        });
        this.worker.postMessage({ type: 'exec', queries, readOnly, msgId });
        return p;
    }
    close() {
        this.worker.postMessage({ type: 'close' });
        this.worker.terminate();
    }
}
export class BrowserSqliteDatabase {
    constructor(filename, startSubject, workerDirUrl) {
        this.queue = [];
        /**
         * processing should only be read and written in processQueue()
         */
        this.processing = false;
        this.dispatcher = new CentralDispatch(filename, startSubject, workerDirUrl);
    }
    execAsync(queries, readOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            const dispatchVal = this.dispatcher.execAsync(queries, readOnly);
            return dispatchVal;
        });
    }
    transactionAsync(asyncCallback, readOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.queue.push(() => __awaiter(this, void 0, void 0, function* () {
                    const result = yield this.processTransaction(asyncCallback, readOnly);
                    if (!result) {
                        console.error('Transaction failed');
                        reject();
                    }
                    resolve();
                }));
                this.processQueue();
            });
        });
    }
    processQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.processing) {
                // already processing
                return;
            }
            while (this.queue.length > 0) {
                this.processing = true;
                const transaction = this.queue.shift();
                if (transaction) {
                    yield transaction();
                }
            }
            this.processing = false;
        });
    }
    processTransaction(asyncCallback, readOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.execAsync([{ sql: 'BEGIN;', args: [] }], false);
                const transaction = new SqliteTransactionAsync(this, readOnly !== null && readOnly !== void 0 ? readOnly : false);
                yield asyncCallback(transaction);
                yield this.execAsync([{ sql: 'END;', args: [] }], false);
                return true;
            }
            catch (e) {
                yield this.execAsync([{ sql: 'ROLLBACK;', args: [] }], false);
                return false;
            }
        });
    }
    closeAsync() {
        this.dispatcher.close();
    }
}
export class SqliteTransactionAsync {
    constructor(db, readOnly) {
        this.db = db;
        this.readOnly = readOnly;
    }
    executeSqlAsync(sqlStatement, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultSets = yield this.db.execAsync([{ sql: sqlStatement, args: args !== null && args !== void 0 ? args : [] }], this.readOnly);
            return resultSets[0];
        });
    }
}
