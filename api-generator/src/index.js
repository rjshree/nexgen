const { runApiGenerator } = require("./runApiGenerator");
const { runApiGeneratorService } = require("./service");

// Export for external consumers — no direct execution
module.exports = { runApiGenerator, runApiGeneratorService };