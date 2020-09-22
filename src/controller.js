const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const S3 = require("./s3");
const Automation = require("./automation");

module.exports = function () {
  const controller = this;
  controller.automations = [];
  controller.rootPath = path.join(__dirname, "..");
  controller.package = require(path.join(controller.rootPath, "package.json"));

  controller.discoverAutomations = () => {
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
    return this;
  };

  controller.listAutomations = () => {
    console.log(`${controller.automations.length} automation(s) found.`)
    controller.automations.forEach(automation => {
      console.log(automation.getSummary());
    });
    return this;
  };

  controller.buildManifest = () => {
    // Remove any old manifest
    const distPath = path.join(controller.rootPath, "dist");
    fs.ensureDirSync(distPath);
    const manifestPath = path.join(distPath, "manifest.json")
    fs.removeSync(manifestPath);

    // Write new manifest
    console.log(`Writing manifest to ${manifestPath}...`)
    try {
      let manifest = {version: controller.package.version};
      const automations = controller.automations.map(x => x.getManifestEntry());
      manifest.automations = automations;
      fs.writeJsonSync(manifestPath, automations, {spaces: "\t"});
      console.log("Manifest written successfully.")
    } catch (error) {
      console.log(`\nError building and writing manifest: \n${error}\n`);
    }
    return this;
  };

  controller.buildTar = () => {
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
    const cwd = path.join(controller.rootPath, "dist");
    tar.c({
      gzip: true,
      file: tarPath,
      sync: true,
      cwd
    }, ["automations"]);
    return this;
  };

  controller.publish = async () => {
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
  }
}
