# Core React Native

[![npm version](https://badge.fury.io/js/@universal-packages%2Freact-native.svg)](https://www.npmjs.com/package/@universal-packages/core-react-native)
[![Testing](https://github.com/universal-packages/universal-core-react-native/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-core-react-native/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-core-react-native/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-core-react-native)

[React Native](https://reactnative.dev/) universal-core abstraction.

> | Remember to follow he [Set up your development environment](https://reactnative.dev/docs/set-up-your-environment) guide to make sure you have all the necessary dependencies installed.

## Install

```shell
npm install @universal-packages/core-react-native
```

## Initialization

This will create a new react native app using `react-native` as well as adapting the resulting app to use the core abstraction.

```shell
ucore initialize react-native --name my-app
```

## Development

Instead of running `npm start` you use the `ucore run` command to start the development server of you react native app, you can have multiple apps initialized in the same project and run them individually.

```shell
ucore run react-native --name my-app
```

## Typescript

In order for typescript to see the global types you need to reference the types somewhere in your project, normally `./src/globals.d.ts`.

```ts
/// <reference types="@universal-packages/core-react-native" />
```

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
