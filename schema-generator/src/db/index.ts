import { DbConnection, RawColumn } from "./types";
import { introspectOracle } from "./oracleIntrospector";
import { introspectMariaDbTable } from "./mariaDbIntrospector";

export async function introspectTable(db: DbConnection, table: string): Promise<RawColumn[]> {
  console.log(`***********************Introspecting table "${table}" on ${db.type} database at ${db.host}...`);
  switch (db.type) {
    case "oracle":
      return introspectOracle(db, table);
    case "mariadb":
      return introspectMariaDbTable(db, table);
    default:
      throw new Error(`Unsupported database type: ${db.type}`);
  }
}