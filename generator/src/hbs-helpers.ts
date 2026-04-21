import Handlebars from "handlebars";

// PascalCase: employee → Employee
Handlebars.registerHelper("pascalCase", function (str: string) {
  return str
    .replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, "").toUpperCase());
});

// camelCase: Employee Name → employeeName
Handlebars.registerHelper("camelCase", function (str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toLowerCase());
});

// Uppercase: name → NAME
Handlebars.registerHelper("upperCase", (str: string) => str.toUpperCase());