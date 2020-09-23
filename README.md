# Budibase Automations

> We are going through the process where software will automate software, automation will automate automation.

Welcome to Budibase Automations, this repo contains all install-able automations that are currently available to a Budibase app.
We welcome contributions of new ways of creating automated processes within our user's apps, infact we've tried to make it 
as easy as possible!

## Creating a new Automation

The process of creating a new automation is quite simple, the easiest method to do this is to run `yarn new` at the 
top level directory. This will walk you through the steps of creating a new package in the command line - it should be 
noted that all of the information provided can be easily changed, it will be input to an `automate` section in the new package's
`package.json`.

The process will appear as such (example is for the Integromat Automation):
![image](https://user-images.githubusercontent.com/4407001/93998672-c45e8900-fd8c-11ea-90ff-032550ee9d9f.png)

Once you've ran through this process the package will exist under `packages/<Package Name>` all that is required is adding
any required packages, updating the `README.md` to provide information about what your automation does and the runner source code,
found under `src/index.js`. The runner must export an async function with takes the an object of format:
```
{
  inputs: {
    ...specified inputs here
  },
  instanceId: <CUSTOMER INSTANCE ID>
}
```
The runner must also return an object in the correct format based on the outputs specified.

## Building and Publishing

### Building Automations

To build all automations, run the following couple of scripts.

```
yarn install
yarn run build
```

Now `dist/automations.tar.gz` and `dist/manifest.json` are ready for publishing.
Individial automations are built and available for publishing under `dist/automations`.

### Publishing

Publishing pushes all built automations, as well as the manifest and tar bundle, to an AWS S3 bucket.

Publishing can be tested via `yarn run publish`, which will publish them to a newly created S3 bucket
called `budibase-automations-[random-extension]`. When running inside CI it will remove the random extension and
publish them to a bucket name determined by environment variables.

Authentication is attempted via both environment variables (such as when running in CI) and via an AWS
credentials file (such as when running locally).

If the target S3 bucket does not exist when publishing then it will be created for you. Whether the bucket exists
or not, a new bucket policy will be set so that all files uploaded have default public read access. This
ensures that the bundles about to be uploaded will be publicly available without any further configuration.
