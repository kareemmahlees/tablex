<p align="center">
  <img src="./apps/web/public/billboard.png">
</p>
<div align="center">
  <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/kareemmahlees/tablex/lint.yml">
  <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/kareemmahlees/tablex?color=blue">
  <img alt="Static Badge" src="https://img.shields.io/badge/node-v20.9.0%20-green">
  <img alt="GitHub deployments" src="https://img.shields.io/github/deployments/kareemmahlees/tablex/production?label=production">

<img alt="Static Badge" src="https://img.shields.io/badge/cargo-v1.74.1-orange">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/kareemmahlees/tablex">
<img alt="GitHub Release" src="https://img.shields.io/github/v/release/kareemmahlees/tablex">

</div>

> Note: TableX is still under development, don't expect it to be perfect, yet.

Checkout [Changleogs](./apps/core/CHANGELOG.md), and our [issues](https://github.com/kareemmahlees/tablex/issues) section.

## Don't Waste time, try it NOW 💥

Head to TableX's [official website](https://tablex-tan.vercel.app/) and download the executable of your choice.

## About the Project

Tablex aims at delivering a fast, user friendly, productive and **free** database browsing experience.

While not claiming that it is a replacement of any other tool, yet, it strives to provide a, hopefully, good user experience.

## What Does it offer ✨

- Delightful user experience
- Top-Notch performance
- Support for SQLite, PostgreSQL, MySQL
- Available for Windows, MacOS, and Linux
- Automatically create a RESTfull and GraphQL APIs for your database
- Keyboard shortcuts for productivity homies
- Free and Open-Source

## V2 Update 🎉: Say hi to MetaX

TableX now uses [MetaX](https://github.com/kareemmahlees/meta-x) to automatically create a RESTfull and GraphQL APIs for your database.

MetaX supercharges your experience by allowing you to interact with your database through an API interface ( which is fully swagger documented ), allowing your for example to create, read, update or delete databases, tables or columns through http requests with no effort from you what so over ✨.

Just connect your database and start running 🚀.

## Tech Stack ⌨️

- [Tauri](https://tauri.app/) :
  - [NextJs](https://nextjs.org/) : Frontend Framework
  - [Rust](https://www.rust-lang.org/) : Backend
- [Tailwind](https://tailwindcss.com/) : CSS Framework
- [Tanstack](https://tanstack.com/) : [Query](https://tanstack.com/query/latest), [Table](https://tanstack.com/table/v8)
- [Golang](https://go.dev): [MetaX](https://github.com/kareemmahlees/meta-x)
- [shadcn/ui](https://ui.shadcn.com/) : Components
- [Changesets](https://github.com/changesets/changesets): Versioning and Changelogs
- [Vercel](https://vercel.com/) : Deployment

## Keyboard Shortcuts

| Shortcut                       | Description                       |
| ------------------------------ | --------------------------------- |
| <kbd>Ctrl</kbd> + <kbd>k</kbd> | open command palette              |
| <kbd>Ctrl</kbd> + <kbd>s</kbd> | focus search input                |
| <kbd>Ctrl</kbd> + <kbd>a</kbd> | select or deselect all            |
| <kbd>Ctrl</kbd> + <kbd>c</kbd> | copy selected rows into clipboard |
| <kbd>Delete</kbd>              | delete selected rows              |

## Local Development 🧑🏻‍💻

To start playing around with TableX locally, you will need the following requirements:

- Node v20.9.0 or later ( you can use the .nvmrc )
- Cargo 1.74.1 or later
- pnpm 8.13.1 or later

> some previous versions of the previously mentioned requirements may still work fine, but no guarantee.

Once you have setup the previous requirements, you can start by cloning the repo:

```shell
git clone https://github.com/kareemmahlees/tablex.git --depth=1
```

> Note: TableX uses MetaX as a **submodule**, so, once you have ran the above command you will se an empty meta-x folder.
> there is no need to delete that.

then, install necessary dependencies:

```shell
pnpm install
# And
cargo install
```

install husky git hooks:

```bash
pnpm husky install
```

and you are good to go 💫, you can start your development server by running:

```bash
pnpm tauri:dev
```

Want to test how your modification will look like at the final executable? run this:

```shell
pnpm tauri:debug
```

this will create a debug build/executables of the application that you can then install and see your features in action 🥳

> Note: the `tauri:build` script requires `Golang` to be installed in order to build _MetaX_ and include it as a sidecar in the release build.

## Contributing 🫱🏻‍🫲🏻

please refer to [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
