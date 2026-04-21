import { NormalizedColumn } from "../db/types";

export function generateDjangoModel(
  tableName: string,
  columns: NormalizedColumn[]
): string {
  const className = tableName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  const fields = columns
    .map((col) => {
      const opts = col.djangoOptions ? `${col.djangoOptions}` : "";
      return `    ${col.name} = models.${col.djangoField}(${opts})`;
    })
    .join("\n");

  return `from django.db import models


class ${className}(models.Model):
${fields}

    class Meta:
        db_table = '${tableName.toLowerCase()}'
        managed = False
`;
}