# Budibase Automations

> *“We are going through the process where software will automate software, automation will automate automation.”*<br>
> -&nbsp;Mark Cuban


Welcome to Budibase Automations! This repo contains all the installable automations that are currently available to Budibase apps.
We welcome contributions of new ways of creating automated processes within our users' apps, and we've tried to make it 
as easy as possible to do so.

## Creating a new Automation

The process of creating a new automation is quite simple. The easiest method to do this is to run `yarn new` at the 
top level directory. This will walk you through the steps of creating a new automation in the command line. It should be 
noted that all of the information provided can be easily changed, and will be put into an `automate` section in the new automation's
`package.json`. This scipt will generate the boilerplate configuration required for new your automation.

The process will appear as such (example is for the Integromat Automation):
![image](https://user-images.githubusercontent.com/4407001/93998672-c45e8900-fd8c-11ea-90ff-032550ee9d9f.png)

Once you've ran through this process the package will exist under `packages/<Package Name>`.
The next step is to develop your automation, using `src/index.js` as your entry point. You can add as many
dependencies as you require - they'll be automatically bundled with your automation.

Your automation must export an async function with takes a single object parameter of format:
```
{
  inputs: {
    // ...configured inputs
  },
  instanceId: <CUSTOMER INSTANCE ID>
}
```
The runner must also return an object in the correct format based on the outputs specified. Check out some of the
existing automations if you need further clarification.

Once you've finished developing, make sure to update your `README` to describe what your automation does and what the inputs
and outputs are, so that app builders know how to use your automation.

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
