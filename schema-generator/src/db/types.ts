export type DbType = "oracle" | "mariadb";

export interface DbConnection {
  host: string;
  port?: number;
  schema: string;
  serviceName?: string;
  user: string;
  password: string;
  type: DbType;
}

export interface RawColumn {
  columnName: string;
  dataType: string;
  nullable: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
  isPrimaryKey?: boolean;
}

export interface NormalizedColumn {
  name: string;
  djangoField: string;
  djangoOptions: string;
  muiType: "string" | "number" | "date" | "dateTime" | "boolean" | "singleSelect";
  muiWidth?: number;
}