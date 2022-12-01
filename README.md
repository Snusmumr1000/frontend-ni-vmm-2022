# NN Image Comparison app frontend

NN Image Comparison

## Installation
### Docker image installation
#### Build docker image

```bash
docker build -t ni-vmm-th2022
```

#### Start docker image

```bash
docker run -p 9000:9000 ni-vmm-th2022
```


## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```



### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
