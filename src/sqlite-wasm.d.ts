declare module '@sqlite.org/sqlite-wasm' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TODO = any

  interface Window {
    sqlite3InitModule: (_?: TODO) => Promise<import('./sqlite3').Sqlite3>
  }

  export interface SqliteClient {
    init: () => void;
    executeSql: (sql: string, args?: TODO[], readOnly?: boolean) => Promise<ResultSet>;
  }

  export type Sqlite3 = {
    oo1: {
      DB: new (...options?: OO1DBOptions) => DB
      OpfsDb?: new (filename: string, mode?: string) => DB
    }
    version: {
      libVersion: string;
    }
    opfs?: {
      debug: TODO
      deleteEntry: TODO
      entryExists: TODO
      metrics: TODO
      mkdir: TODO
      randomFilename: TODO
      registerVfs: TODO
      rootDirectory: TODO
    }
    capi: {
      sqlite3_deserialize: TODO
      [key: string]: TODO
    }
    wasm: {
      allocFromTypedArray: (typedArray: Uint8Array) => number
      [key: string]: TODO
    }
  }

  /** https://sqlite.org/wasm/doc/trunk/api-oo1.md#db-ctor */
  export type OO1DBOptions = [
    filename: string,
    mode?: string,
  ]

  export declare const InitWasm: (_?: TODO) => Promise<Sqlite3>

  export default InitWasm

  export class DB {
    filename: string
    pointer: TODO

    affirmOpen(): DB

    changes(total?: boolean, sixtyFour?: boolean): number

    exec(options: ExecOptions): TODO
    exec(query: FlexibleString, options?: ExecOptions): TODO
    close(): DB
    export(): TODO
    /**
     * @example aDb.prepare("INSERT INTO foo(a) VALUES(?)").bind(123).stepFinalize();
     */
    prepare(query: FlexibleString): Stmt

    checkRc(db: TODO, resultCode: TODO)

    createFunction(): TODO

    dbFilename(): string

    dbName(): string
  }

  export type ExecOptions = {
    sql?: FlexibleString
    bind?: Bindable
    // saveSql?: TODO

    returnValue?: 'this' | 'resultRows' | 'saveSql'

    rowMode?: 'array' | 'object' | 'stmt'

    resultRows?: TODO[]
  }


  /** https://sqlite.org/wasm/doc/trunk/api-oo1.md#stmt-properties */
  export interface Stmt {
    columnCount: number
    parameterCount: number
    pointer: TODO

    bind(bindable: Bindable): Stmt
    bind(indexOrParameterName: number | string, bindable: Bindable): Stmt

    stepFinalize(): boolean
  }

  export type Bindable = BindableValue[] | Record<string, BindableValue>

  export type BindableValue = null | undefined | number | boolean | string | Uint8Array | Int8Array
}