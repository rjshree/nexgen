const { runApiGenerator } = require("./runApiGenerator");

/**
 * Service layer — called by the Express server
 * Wraps input into the shape expected by runApiGenerator
 * @param {string} projectName
 * @param {string[]} apps
 * @param {Object[]} models
 * @returns {Promise<Object>}
 */
async function runApiGeneratorService(projectName, baseDir, djangoModel, db) {
  console.log("Service received:", { projectName, baseDir, djangoModel, db });
  return await runApiGenerator({ projectName, baseDir, djangoModel, db , type: "crud"});
}

async function runAPISkeletonGeneratorService(projectName, baseDir) {
  console.log("Service received request to generate UI skeleton for project:", projectName);
  return await runApiGenerator({ projectName, baseDir, djangoModel: undefined, db: undefined, type: "api-skeleton" });
}

module.exports = { runApiGeneratorService, runAPISkeletonGeneratorService };