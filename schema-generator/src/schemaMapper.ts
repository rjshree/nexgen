import { RawColumn, NormalizedColumn } from "./db/types";

const ORACLE_TO_DJANGO: Record<string, { field: string; options?: string }> = {
  "VARCHAR2":    { field: "CharField" },
  "NVARCHAR2":   { field: "CharField" },
  "CHAR":        { field: "CharField" },
  "CLOB":        { field: "TextField" },
  "NCLOB":       { field: "TextField" },
  "NUMBER":      { field: "IntegerField" },
  "INTEGER":     { field: "IntegerField" },
  "FLOAT":       { field: "FloatField" },
  "BINARY_FLOAT":  { field: "FloatField" },
  "BINARY_DOUBLE": { field: "FloatField" },
  "DATE":        { field: "DateTimeField" },
  "TIMESTAMP(6)": { field: "DateTimeField" },
  "TIMESTAMP":   { field: "DateTimeField" },
  "BLOB":        { field: "BinaryField" },
  "RAW":         { field: "BinaryField" },
};

const ORACLE_TO_MUI: Record<string, NormalizedColumn["muiType"]> = {
  "VARCHAR2":    "string",
  "NVARCHAR2":   "string",
  "CHAR":        "string",
  "CLOB":        "string",
  "NCLOB":       "string",
  "NUMBER":      "number",
  "INTEGER":     "number",
  "FLOAT":       "number",
  "BINARY_FLOAT":  "number",
  "BINARY_DOUBLE": "number",
  "DATE":        "dateTime",
  "TIMESTAMP(6)": "dateTime",
  "TIMESTAMP":   "dateTime",
};

function toSnakeCase(name: string): string {
  return name.toLowerCase();
}

function buildDjangoOptions(col: RawColumn, djangoField: string): string {
  const opts: string[] = [];

  if (col.isPrimaryKey) {
    opts.push("primary_key=True");
  }

  if (col.nullable && !col.isPrimaryKey) {
    opts.push("null=True", "blank=True");
  }

  if (djangoField === "CharField" && col.maxLength) {
    opts.push(`max_length=${col.maxLength}`);
  }

  if (djangoField === "DecimalField") {
    opts.push(`max_digits=${col.precision || 10}`);
    opts.push(`decimal_places=${col.scale || 2}`);
  }

  return opts.join(", ");
}

function estimateMuiWidth(col: RawColumn, muiType: string): number {
  if (muiType === "number") return 120;
  if (muiType === "dateTime" || muiType === "date") return 180;
  if (col.maxLength && col.maxLength > 100) return 250;
  if (col.maxLength && col.maxLength > 50) return 200;
  return 150;
}

export function normalizeSchema(rawColumns: RawColumn[]): NormalizedColumn[] {
  return rawColumns.map((col) => {
    // Strip precision from type like "TIMESTAMP(6)" -> "TIMESTAMP"
    const baseType = col.dataType.replace(/\(\d+\)/, "").trim();

    const djangoMapping = ORACLE_TO_DJANGO[col.dataType] || ORACLE_TO_DJANGO[baseType] || { field: "CharField" };
    const muiType = ORACLE_TO_MUI[col.dataType] || ORACLE_TO_MUI[baseType] || "string";

    const djangoOptions = buildDjangoOptions(col, djangoMapping.field);

    return {
      name: toSnakeCase(col.columnName),
      djangoField: djangoMapping.field,
      djangoOptions,
      muiType,
      muiWidth: estimateMuiWidth(col, muiType),
    };
  });
}