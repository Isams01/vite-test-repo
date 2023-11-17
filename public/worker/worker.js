var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import sqlite3InitModule from './sqlite3/sqlite3-bundler-friendly.mjs';
const logArgs = function (type, ...args) {
    postMessage({
        type,
        payload: { args },
    });
};
const log = (...args) => logArgs('log', ...args);
const error = (...args) => logArgs('error', ...args);
let db;
function start(sqlite3, filename) {
    const capi = sqlite3.capi; // C-style API
    const oo = sqlite3.oo1; // High-level OO API
    log('SQLite3 version', capi.sqlite3_libversion(), capi.sqlite3_sourceid());
    const OpfsDb = oo.OpfsDb;
    if ('OpfsDb' in oo && OpfsDb) {
        db = new OpfsDb(`/${filename}.sqlite3`);
    }
    else {
        console.warn('Opfs is not available');
        db = new sqlite3.oo1.DB(`/${filename}.sqlite3`, 'ct');
    }
    postMessage([{ type: 'start complete' }]);
}
self.onmessage = function (event) {
    const { type } = event.data;
    if (!db && type !== 'open') {
        throw new Error('db is not set');
    }
    switch (type) {
        case 'open': {
            if (db)
                return;
            const { filename } = event.data;
            sqlite3InitModule({
                print: log,
                printErr: error,
            }).then(function (sqlite3) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        start(sqlite3, filename);
                    }
                    catch (e) {
                        console.error(e);
                        error('Exception:', e);
                    }
                });
            });
            break;
        }
        case 'exec': {
            if (!db) {
                const { msgId } = event.data;
                const resultError = {
                    error: new Error('db is not initialized'),
                    msgId,
                    type,
                };
                postMessage([resultError]);
                return;
            }
            const { queries, msgId } = event.data;
            try {
                const results = [];
                for (const query of queries) {
                    const { sql, args } = query;
                    const res = db.exec({
                        sql,
                        bind: args,
                        returnValue: 'resultRows',
                        rowMode: 'object',
                    });
                    const mutationStatements = ['insert', 'update', 'delete'];
                    const isMutatingStatement = mutationStatements.some((s) => sql.trim().toLowerCase().startsWith(s));
                    // If a SELECT statement is executed it will still return the changed from the last insert
                    // So we have to manually set it to 0
                    const rowsAffected = isMutatingStatement ? db.changes() : 0;
                    const result = {
                        rows: res,
                        rowsAffected: rowsAffected,
                        msgId, // database must know which message this is
                    };
                    results.push(result);
                }
                postMessage(results);
            }
            catch (e) {
                const resultError = [
                    {
                        error: e,
                        msgId,
                        type,
                    },
                ];
                postMessage(resultError);
            }
            break;
        }
        case 'close': {
            if (db) {
                db.close();
                db = null;
            }
        }
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
};
