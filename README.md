<p align="center">
  <img src="./docs/billboard.png">
</p>
<div align="center">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/kareemmahlees/tablex/lint.yml">
  <img alt="GitHub package.json version (subfolder of monorepo)" src="https://img.shields.io/github/package-json/v/kareemmahlees/tablex?color=blue">
  <img alt="Static Badge" src="https://img.shields.io/badge/node-v20.9.0%20-green">
<img alt="Static Badge" src="https://img.shields.io/badge/cargo-v1.74.1-orange">

</div>

> Note: TableX is still under development, don't expect it to be perfect, yet.

## About the Project

Tablex aims at delivering a fast, user friendly, productive and **free** database browsing experience.

While not claiming that it is a replacement of any other tool, yet, it strives to provide a, hopefully, good user experience.

## What Does it offer ✨

- Delightful user experience
- Top-Notch performance
- Ultra small bundle size (~ 12MB)
- Keyboard shortcuts for productivity homies
- Free and Open-Source

## Tech Stack ⌨️

- [Tauri](https://tauri.app/) :
  - [NextJs](https://nextjs.org/) : Frontend Framework
  - [Rust](https://www.rust-lang.org/) : Backend
- [Tailwind](https://tailwindcss.com/) : CSS Framework
- [Tanstack](https://tanstack.com/) : [Query](https://tanstack.com/query/latest), [Table](https://tanstack.com/table/v8)
- [shadcn/ui](https://ui.shadcn.com/) : Components
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

```bash
git clone https://github.com/kareemmahlees/tablex.git --depth=1
```

then, install necessary dependencies:

```bash
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

## Contributing 🫱🏻‍🫲🏻

please refer to [CONTRIBUTING.md](./docs/CONTRIBUTING.md)
foo
