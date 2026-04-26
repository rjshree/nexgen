const { runApiGenerator } = require("./runApiGenerator");

/**
 * Service layer — called by the Express server
 * Wraps input into the shape expected by runApiGenerator
 * @param {string} projectName
 * @param {string[]} apps
 * @param {Object[]} models
 * @returns {Promise<Object>}
 */
async function runApiGeneratorService(projectName, baseDir, djangoModel, db, setupVenv) {
  console.log("Service received:", { projectName, baseDir, djangoModel, db,  setupVenv});
  return await runApiGenerator({ projectName, baseDir, setupVenv, djangoModel, db , type: "crud"});
}

async function runAPISkeletonGeneratorService(projectName, baseDir, setupVenv) {
  console.log("Service received request to generate UI skeleton for project:", projectName, setupVenv);
  return await runApiGenerator({ projectName, baseDir, setupVenv, djangoModel: undefined, db: undefined, type: "api-skeleton" });
}

module.exports = { runApiGeneratorService, runAPISkeletonGeneratorService };