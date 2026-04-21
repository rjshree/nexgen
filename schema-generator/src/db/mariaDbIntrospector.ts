
import { RawColumn, DbConnection } from "./types";

export async function introspectMariaDbTable(
  db: DbConnection,
  table: string
): Promise<RawColumn[]> {
  const mariadb = await (eval('import("mariadb")') as Promise<typeof import("mariadb")>);

  const pool = mariadb.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.schema,
    port: db.port ?? 3306,
  });

  const conn = await pool.getConnection();

  const rows = await conn.query(
    `
    SELECT
      COLUMN_NAME,
      DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH,
      NUMERIC_PRECISION,
      NUMERIC_SCALE,
      IS_NULLABLE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = ?
    ORDER BY ORDINAL_POSITION
    `,
    [db.schema, table]
  );

  conn.release();

  return rows.map((r: any) => ({
    name: r.COLUMN_NAME,
    dbType: r.DATA_TYPE,
    length: r.CHARACTER_MAXIMUM_LENGTH,
    precision: r.NUMERIC_PRECISION,
    scale: r.NUMERIC_SCALE,
    nullable: r.IS_NULLABLE === "YES",
  }));
}