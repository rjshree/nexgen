import { NormalizedColumn } from "../db/types";

export function generateMuiColumns(
  columns: NormalizedColumn[]
): string {
  const colDefs = columns.map((col) => {
    const headerName = col.name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return `  {
    field: '${col.name}',
    headerName: '${headerName}',
    type: '${col.muiType}',
    width: ${col.muiWidth || 150},
    editable: ${!col.djangoOptions.includes("primary_key")},
  }`;
  });

  return `import { GridColDef } from '@mui/x-data-grid';

export const TABLE_COLUMN_CONFIG  = [
${colDefs.join(",\n")}
];
`;
}