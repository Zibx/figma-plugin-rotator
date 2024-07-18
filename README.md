# Figma vector rotation plugin

https://github.com/user-attachments/assets/397913ac-290a-4a25-813f-0384905df83a

This plugin performs rotation of the selected shape in a 3D space.

# Installation for development

You MUST have node.js version >= 18. It is convenient to use [nvm](https://github.com/nvm-sh/nvm) for install\switch node.js versions.

Install the TypeScript globally:

```shell
npm install -g typescript
```

Clone the repo and do `npm i` or `yarn` depending on the package manager that you use.

```shell
npm i
```

While development stage use the `watch` script. It would automatically reload the plugin when any changes are made:

```shell
npm start watch
```

# Launch the plugin

While `watch` script is activated

From the main menu select `Plugins` > `Development` > `Import plugin from manifest` and navigate to the repo folder, then choose the `manifest.json` file.

# [TODO list](./TODO.md)
