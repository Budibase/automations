const inquirer = require("inquirer")
const fs = require("fs")
const path = require("path")

const DEFAULT_INDEX = "module.exports = async function ({ inputs }) {}"
const JSON_SCHEMA_TYPES = ["string", "boolean", "number", "object", "array"]

function Property(name, options, defaultValue) {
  this.name = name
  if (options) {
    this.options = options
  }
  if (defaultValue) {
    this.default = defaultValue
  }
}

function makeNewPackage(pkgName, packageJson) {
  let pkgDirectory = path.join("packages", pkgName)
  let srcDirectory = path.join(pkgDirectory, "src")
  let readme = `# ${pkgName}\n\n**TODO: Please complete README!**`
  fs.mkdirSync(pkgDirectory)
  fs.mkdirSync(srcDirectory)
  fs.writeFileSync(path.join(srcDirectory, "index.js"), DEFAULT_INDEX)
  fs.writeFileSync(path.join(pkgDirectory, "README.md"), readme)
  fs.writeFileSync(path.join(pkgDirectory, "package.json"), JSON.stringify(packageJson, null, 2))
}

async function prompt(prompt, opts = {}) {
  let question = {
    message: prompt,
    name: "value",
    type: opts.type ? opts.type : "input",
  }
  if (opts.default != null) {
    question.default = opts.default
  }
  if (opts.options != null) {
    question.type = "list"
    question.choices = opts.options
  }
  return (await inquirer.prompt(question)).value
}

async function buildObject(propName, properties) {
  if (properties.length === 0 || !(properties[0] instanceof Property)) {
    throw "Cannot create object with no valid properties"
  }
  let keepGoing = true
  let attributes = {}
  do {
    keepGoing = await prompt(`Add more ${propName}?>`, { type: "confirm" })
    if (!keepGoing) {
      break
    }
    let attributeName = await prompt(`new ${propName} name>`)
    let attribute = {}
    for (let property of properties) {
      attribute[property.name] = await prompt(`${propName}.${property.name}>`, {
        options: property.options,
        default: property.default,
      })
    }
    attributes[attributeName] = attribute
  } while (keepGoing)
  return attributes
}

async function run() {
  console.log("This process will walk you through creating a new package.")
  let pkgName = await prompt("Package name>")
  let prettyName = await prompt("Package pretty name>", { default: pkgName })
  let version = await prompt("Package version>", { default: "1.0.0" })
  let type = await prompt("Package type>", {
    default: "ACTION",
    options: ["ACTION", "LOGIC"],
  })
  let tagline = await prompt("Package tagline>", { default: `Performs action ${pkgName}` })
  let description = await prompt("Package description>", {
    default: `Information about ${pkgName}`,
  })
  let icon = await prompt("Package icon>", { default: "ri-flashlight-fill" })
  let inputs = await buildObject("inputs", [
    new Property("type", JSON_SCHEMA_TYPES),
    new Property("title"),
  ])
  let outputs = await buildObject("outputs", [
    new Property("type", JSON_SCHEMA_TYPES),
    new Property("description"),
  ])
  let packageJson = {
    version,
    main: "src/index.js",
    name: pkgName,
    type: "commonjs",
    scripts: {
      build: "rollup --config ../../config/rollup.automate.config.mjs",
    },
    automate: {
      tagline,
      description,
      icon,
      stepId: pkgName,
      type,
      name: prettyName,
      inputs: {},
      schema: {
        inputs: {
          properties: inputs,
          required: Object.keys(inputs),
        },
        outputs: {
          properties: outputs,
          required: Object.keys(outputs),
        },
      },
    },
  }
  makeNewPackage(pkgName, packageJson)
  return pkgName
}

run()
  .then((pkgName) => {
    console.log(`Completed package creation - packages/${pkgName}`)
  })
  .catch((err) => {
    console.error(err)
  })
