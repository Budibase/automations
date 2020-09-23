const fs = require("fs-extra")
const path = require("path")

/**
 * Individual parsed automation.
 *
 * @param rootPath the absolute path to where automations are listed
 * @param name the name of this automation
 */
module.exports = function (rootPath, name) {
  const automation = this
  automation.rootPath = rootPath
  automation.name = name
  automation.path = path.join(rootPath, name)
  const packagePath = path.join(automation.path, "package.json")
  automation.package = require(packagePath)

  /**
   * Returns the stub, or unique identifier of this automation version.
   * The format is [name]@[version].
   *
   * @returns {string} the stub
   */
  automation.getStub = () => {
    const pkg = automation.package
    return `${pkg.name}@${pkg.version}`
  }

  /**
   * Returns a short summary of the automation.
   *
   * @returns {string} the summary
   */
  automation.getSummary = () => {
    const pkg = automation.package
    return `${automation.getStub()} - ${pkg.description || "No description provided"}`
  }

  /**
   * Builds the structure used inside the manifest for this automation.
   * This consists of the name, version, stub and contents of the "automate" key
   * in package.json.
   * The contents of a README file, if it exists, are also added.
   *
   * @returns {object} the manifest entry
   */
  automation.getManifestEntry = () => {
    let entry = {
      name: automation.name,
      version: automation.package.version,
      stub: automation.getStub(),
      ...automation.package.automate,
    }
    const readmePath = path.join(automation.path, "README.md")
    if (fs.existsSync(readmePath)) {
      entry.readme = fs.readFileSync(readmePath, "utf8")
    }
    return entry
  }
}
