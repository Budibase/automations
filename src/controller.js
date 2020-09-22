const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const S3 = require("./s3");
const Worker = require("./worker");
const Automation = require("./automation");

/**
 * Controller responsible for orchestrating automation functions.
 */
module.exports = function () {
  const controller = this;
  controller.worker = new Worker(controller);
  controller.automations = [];
  controller.rootPath = path.join(__dirname, "..");
  controller.package = require(path.join(controller.rootPath, "package.json"));

  /**
   * Discovers available automations and parses them.
   * Must be called before building automations.
   */
  controller.discoverAutomations = controller.worker.do(() => {
    const automationsPath = path.join(controller.rootPath, "packages");
    const directories = fs.readdirSync(automationsPath);
    let automations = [];
    directories.forEach(directory => {
      try {
        const automation = new Automation(automationsPath, directory);
        automations.push(automation);
      } catch (error) {
        console.log(`Skipping automation "${directory}" due to error: \n${error}`);
      }
    });
    controller.automations = automations;
  });

  /**
   * Prints a list of all available automations and their versions.
   */
  controller.listAutomations = controller.worker.do(() => {
    console.log(`${controller.automations.length} automation(s) found.`)
    controller.automations.forEach(automation => {
      console.log(automation.getSummary());
    });
  });

  /**
   * Builds the manifest file of all available automations.
   */
  controller.buildManifest = controller.worker.do(() => {
    // Remove any old manifest
    const distPath = path.join(controller.rootPath, "dist");
    fs.ensureDirSync(distPath);
    const manifestPath = path.join(distPath, "manifest.json")
    fs.removeSync(manifestPath);

    // Write new manifest
    console.log(`Writing manifest to ${manifestPath}...`)
    try {
      let manifest = {};
      const automations = controller.automations.map(x => x.getManifestEntry());
      manifest.automations = automations;
      fs.writeJsonSync(manifestPath, automations, {spaces: "\t"});
    } catch (error) {
      console.log(`\nError building and writing manifest: \n${error}\n`);
    }
  });

  /**
   * Builds a compressed tar file of all available built automations.
   */
  controller.buildTar = controller.worker.do(() => {
    // Remove any old bundles
    const distAutomationsPath = path.join(controller.rootPath, "dist", "automations");
    fs.removeSync(distAutomationsPath);
    fs.ensureDirSync(distAutomationsPath);

    // Copy all built automation bundles to their correct structure
    controller.automations.forEach(automation => {
      const bundlePath = path.join(automation.path, "dist", "bundle.min.js");
      if (fs.existsSync(bundlePath)) {
        const distBundlePath = path.join(distAutomationsPath, `${automation.getStub()}.min.js`);
        fs.copySync(bundlePath, distBundlePath);
      }
    });

    // Remove any old tar files
    const tarPath = path.join(controller.rootPath, "dist", "automations.tar.gz");
    fs.removeSync(tarPath);

    // Create new tar file
    console.log(`Writing tar bundle to ${tarPath}...`)
    const cwd = path.join(controller.rootPath, "dist");
    tar.c({
      gzip: true,
      file: tarPath,
      sync: true,
      cwd
    }, ["automations"]);
  });

  /**
   * Publishes the manifest, tar file and individual built automations to a S3 bucket.
   * Individual automations are published under the path [name]/[version]/[name]@[version].min.js.
   */
  controller.publish = controller.worker.do(async () => {
    // Authenticate with AWS and ensure S3 bucket exists
    const s3 = new S3();
    await s3.init();
    await s3.ensureBucketExists();
    await s3.configureBucketPolicy();

    // Upload manifest and tar
    const manifestPath = path.join(controller.rootPath, "dist", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      await s3.upload(manifestPath, "manifest.json");
    }

    // Upload tar if it exists
    const tarPath = path.join(controller.rootPath, "dist", "automations.tar.gz");
    if (fs.existsSync(tarPath)) {
      await s3.upload(tarPath, "automations.tar.gz");
    }

    // Upload automations
    const distAutomationsPath = path.join(controller.rootPath, "dist", "automations");
    fs.ensureDirSync(distAutomationsPath);
    const bundles = fs.readdirSync(distAutomationsPath);
    for (let bundle of bundles) {
      try {
        const name = bundle.split("@")[0];
        const version = bundle.split("@")[1].split(".min.js")[0];
        const key = `${name}/${version}/${name}@${version}.min.js`;
        const bundlePath = path.join(distAutomationsPath, bundle);
        await s3.upload(bundlePath, key);
      } catch (error) {
        console.log(`Error uploading ${bundle}:`);
        console.log(error);
      }
    }
  });
}
