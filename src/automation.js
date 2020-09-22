const fs = require("fs-extra");
const path = require("path");

function Automation(rootPath, name) {
  const automation = this;
  automation.rootPath = rootPath;
  automation.name = name
  automation.path = path.join(rootPath, name);
  const packagePath = path.join(automation.path, "package.json");
  automation.package = require(packagePath);

  automation.getStub = () => {
    const pkg = automation.package;
    return `${pkg.name}@${pkg.version}`;
  }

  automation.getSummary = () => {
    const pkg = automation.package;
    return `${automation.getStub()} - ${pkg.description || "No description provided"}`;
  }

  automation.getManifestEntry = () => {
    let entry = {
      name: automation.name,
      version: automation.package.version,
      stub: automation.getStub(),
      ...automation.package.automate,
    };
    const readmePath = path.join(automation.path, "README.md");
    if (fs.existsSync(readmePath)) {
      entry.readme = fs.readFileSync(readmePath, "utf8");
    }
    return entry;
  }
}

module.exports = Automation;
