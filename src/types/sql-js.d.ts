declare module 'sql.js' {
  export interface SqlJsConfig {
    locateFile?: (fileName: string) => string
  }

  export interface QueryExecResult {
    columns: string[]
    values: Array<Array<string | number | null>>
  }

  export interface Statement {
    bind(values?: unknown[] | Record<string, unknown>): boolean
    free(): boolean
    step(): boolean
    getAsObject(params?: unknown[] | Record<string, unknown>): Record<string, unknown>
    get(params?: unknown[] | Record<string, unknown>): unknown[]
    run(values?: unknown[] | Record<string, unknown>): void
  }

  export interface Database {
    run(sql: string, params?: unknown[] | Record<string, unknown>): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string, params?: unknown[] | Record<string, unknown>): Statement
    getRowsModified(): number
    close(): void
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | BufferSource) => Database
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const src: string
  export default src
}