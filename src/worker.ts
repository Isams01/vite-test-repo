import sqlite3InitModule, { DB, Sqlite3 } from "@sqlite.org/sqlite-wasm";

const logHtml = function (cssClass: unknown, ...args: unknown[]) {
  postMessage({
    type: "log",
    payload: { cssClass, args },
  });
};

const log = (...args: unknown[]) => logHtml("", ...args);
const error = (...args: unknown[]) => logHtml("error", ...args);
let db: DB | undefined;
function start(sqlite3: Sqlite3) {
  const capi = sqlite3.capi; // C-style API
  const oo = sqlite3.oo1; // High-level OO API
  console.log(
    "SQLite3 version",
    capi.sqlite3_libversion(),
    capi.sqlite3_sourceid()
  );

  const OpfsDb = oo.OpfsDb;
  if ("OpfsDb" in oo && OpfsDb) {
    console.log("setting db");
    db = new OpfsDb("/mydb.sqlite3");
    console.log("opfs is available");
    // log('The OPFS is available.');
    console.log("Persisted db =", db.filename);
  } else {
    throw new Error("OPFS not available");
  }
}
console.log("Loading and initializing sqlite3 module...");

export interface ResultSet {
  /**
   * The row ID of the row that the SQL statement inserted into the database, if a row was inserted.
   */
  insertId?: number;
  /**
   * The number of rows that were changed by the SQL statement.
   */
  rowsAffected: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: { [column: string]: any }[];
}

self.onmessage = function (event) {
  const { type } = event.data;
  console.log('worker received message', event.data);
  switch (type) {
    case "open": {
      sqlite3InitModule({
        print: log,
        printErr: error,
      }).then(async function (sqlite3: Sqlite3) {
        // log('Done initializing. Running demo...');
        try {
          start(sqlite3);
        } catch (e: unknown) {
          error("Exception:", e);
        }
      });
      break;
    }
    case 'exec': {
      if (!db) {
        postMessage({
          type: 'exec',
          isError: true,
          error: 'db is not initialized',
        });
        return;
      }
      try {
        const { queries } = event.data;
        let totalAffectedRows = 0;
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
          const isMutatingStatement = mutationStatements.some((s) =>
            sql.trim().toLowerCase().startsWith(s)
          );

          // If a SELECT statement is executed it will still return the changed from the last insert
          // So we have to manually set it to 0
          const rowsAffected = isMutatingStatement ? db.changes() : 0;
          totalAffectedRows += rowsAffected;
          results.push(res);
        }
        const result: ResultSet = {
          rows: results.flatMap((r) => r),
          rowsAffected: totalAffectedRows,
        };
        console.log(result);
        postMessage({
          type: 'exec',
          payload: result,
        });
      } catch (e) {
        postMessage({
          type: 'exec',
          isError: true,
          error: e,
        });
      }
      break;
    }
  }
};
