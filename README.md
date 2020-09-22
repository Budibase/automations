# Budibase Automations

> **Snazzy description of automations.**

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Creating an Automation

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

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
