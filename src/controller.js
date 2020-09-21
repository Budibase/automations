const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const Automation = require("./automation");

function Controller() {
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
        const distPath = path.join(controller.rootPath, "dist");
        fs.ensureDirSync(distPath);
        const manifestPath = path.join(distPath, "manifest.json")
        fs.removeSync(manifestPath);
        console.log(`Writing manifest to ${manifestPath}...`)
        try {
            let manifest = { version: controller.package.version };
            const automations = controller.automations.map(x => x.getManifestEntry());
            manifest.automations = automations;
            fs.writeJsonSync(manifestPath, automations, { spaces: "\t" });
            console.log("Manifest written successfully.")
        } catch (error) {
            console.log(`\nError building and writing manifest: \n${error}\n`);
        }
        return this;
    };

    controller.buildTar = () => {
        const distAutomationsPath = path.join(controller.rootPath, "dist", "automations");
        fs.removeSync(distAutomationsPath);
        fs.ensureDirSync(distAutomationsPath);
        controller.automations.forEach(automation => {
           const bundlePath = path.join(automation.path, "dist", "bundle.min.js");
           if (fs.existsSync(bundlePath)) {
               const distBundlePath = path.join(distAutomationsPath, `${automation.getStub()}.min.js`);
               fs.copySync(bundlePath, distBundlePath);
           }
        });
        const tarPath = path.join(controller.rootPath, "dist", "automations.tar.gz");
        fs.removeSync(tarPath);
        const cwd = path.join(controller.rootPath, "dist");
        tar.c({
           gzip: true,
           file: tarPath,
           sync: true,
           cwd
        }, ["automations"]);
        return this;
    };
}

module.exports = Controller;
