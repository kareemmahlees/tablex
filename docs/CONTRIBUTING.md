# Thank You 😄

Thank you for taking the time to contribute and help TableX to grow and evolve!.

All contributions are very welcomed, starting from fixing typos or reporting issues to bug fixes and pushing cool features.

Whatever the level of your expertise, you will definitely find some issue that suites you best. ( Check out the [issues](https://github.com/kareemmahlees/tablex/issues) section ).

# Codebase Overview

**TableX** is a [Tauri](https://tauri.app/) app which uses [NextJs](https://nextjs.org/) for the Frontend and [Rust](https://www.rust-lang.org/) as the Backend.

**TableX** is also a `monorepo` that contains:

- TableX application logic at `apps/core`.
- TableX website, built with `React + Vite`, at `apps/web`.

You will find also an `apps/scripts` directory, which contain some scripts that are used only in the `release` action on github.

Inside the [package.json](../package.json) file, you will find all the scripts you need regarding linting, starting dev servers, building, etc.

# Local Development

To start playing around with TableX locally, you will need the following requirements:

- Node v20.9.0 or later ( you can use the .nvmrc )
- Cargo 1.74.1 or later
- pnpm 8.13.1 or later

> some previous versions of the previously mentioned requirements may still work fine, but no guarantee.

Once you have setup the previous requirements, you can start by cloning the repo:

```shell
git clone https://github.com/kareemmahlees/tablex.git --depth=1
```

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

this will create a debug build/executables of the application that you can then install and see your features in action 🥳.

If you want to create a release build, run the following:

```shell
pnpm tauri:build
```

## Some Guidelines to follow

Make sure you have fulfilled the requirements and local development steps mentioned [here](../README.md#local-development-🧑🏻‍💻).

## Commits

TableX follows commit conventions inforced by [commitlint](https://github.com/conventional-changelog/commitlint).

Commit checking is highly integrated in all parts of development process either as a pre-commit hook or checking by the lint action on push or pull-request.

This is a very crucial part and we care about it soo much to keep the commit log consistent and clean, so please take the time to read the conventions of commitlint.

## Multiply tiny is better than a Big one

Separating your changes into multiple small commits is better to review and debug than a big fat commit

## Changesets

It is very preferable to add a changeset at the end of your work in the pr.
Please refer to [changesets](https://github.com/changesets/changesets) documentation for more info.
