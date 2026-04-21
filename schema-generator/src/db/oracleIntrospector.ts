import { DbConnection, RawColumn } from "./types";

export async function introspectOracle(db: DbConnection, table: string): Promise<RawColumn[]> {
  // Use oracledb driver
  const oracledb = require("oracledb");
  const serviceName = "odavlos"; // Replace with your actual service name if needed
  // Use serviceName for connection, schema for SQL queries
  const connectString = `${db.host}:${db.port || 1521}/${db.serviceName}`;
  console.log(` Connecting to: ${connectString} (owner: ${db.serviceName})`);

  const connection = await oracledb.getConnection({
    user: db.user,
    password: db.password,
    connectString: `${db.host}:${db.port || 1521}/${db.serviceName}`,
  });

  try {
    const columnsQuery = `SELECT 
        col.COLUMN_NAME,
        col.DATA_TYPE,
        col.NULLABLE,
        col.DATA_LENGTH,
        col.DATA_PRECISION,
        col.DATA_SCALE
      FROM ALL_TAB_COLUMNS col
      WHERE col.TABLE_NAME = ${table.toUpperCase()}
        AND col.OWNER = ${db.schema.toUpperCase()}
      ORDER BY col.COLUMN_ID`

    console.log("  Executing column query:", columnsQuery);
    const colResult = await connection.execute(
      `SELECT 
        col.COLUMN_NAME,
        col.DATA_TYPE,
        col.NULLABLE,
        col.DATA_LENGTH,
        col.DATA_PRECISION,
        col.DATA_SCALE
      FROM ALL_TAB_COLUMNS col
      WHERE col.TABLE_NAME = :tableName
        AND col.OWNER = :owner
      ORDER BY col.COLUMN_ID`,
      { tableName: table.toUpperCase(), owner: db.schema.toUpperCase() }
    );

    // Get primary keys
    const pkResult = await connection.execute(
      `SELECT cols.COLUMN_NAME
       FROM ALL_CONSTRAINTS cons
       JOIN ALL_CONS_COLUMNS cols ON cons.CONSTRAINT_NAME = cols.CONSTRAINT_NAME
       WHERE cons.TABLE_NAME = :tableName
         AND cons.OWNER = :owner
         AND cons.CONSTRAINT_TYPE = 'P'`,
      { tableName: table.toUpperCase(), owner: db.schema.toUpperCase() }
    );

    const pkColumns = new Set(
      (pkResult.rows as any[]).map((r: any[]) => r[0])
    );

    return (colResult.rows as any[]).map((row: any[]) => ({
      columnName: row[0],
      dataType: row[1],
      nullable: row[2] === "Y",
      maxLength: row[3],
      precision: row[4],
      scale: row[5],
      isPrimaryKey: pkColumns.has(row[0]),
    }));
  } finally {
    await connection.close();
  }
}