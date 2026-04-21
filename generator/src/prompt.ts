import inquirer from "inquirer";

export async function askProjectName(): Promise<string> {
  const { projectName } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Enter project name:",
      validate: (value) =>
        value.trim() !== "" ? true : "Project name cannot be empty"
    }
  ]);

  return projectName.trim();
}