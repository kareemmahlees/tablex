# Thank You 😄

Thank you for taking the time to contribute and help TableX to grow and evolve!.

All contributions are very welcomed, starting from fixing typos or reporting issues to bug fixes and pushing cool features.

Whatever the level of your expertise, you will definitely find some issue that suites you best. ( Check out the [issues](https://github.com/kareemmahlees/tablex/issues) section ).

# Codebase Overview

**TableX** is a [Tauri](https://tauri.app/) app which uses [NextJs](https://nextjs.org/) for the Frontend and [Rust](https://www.rust-lang.org/) as the Backend.

During release builds, we bundle [MetaX](https://github.com/kareemmahlees/meta-x) with the final build.

**TableX** is also a `monorepo` that contains:

- TableX application logic at `apps/core`.
- TableX website, built with `Astro`, at `apps/web`.

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
```

Install husky git hooks:

```bash
pnpm husky install
```

and you are good to go 💫, you can start your development server by running:

```bash
pnpm tauri:dev
```

> NOTE: This will start a dev server, but will also install cargo dependencies before that, which may require you to install some system dependencies, such as: libsoup, libjavascriptcoregtk, libgtk, libwebkit2gtk. Exact installation instructions will vary by platform.

Want to test how your modification will look like at the final executable? run this:

```shell
pnpm tauri:debug
```

this will create a debug build/executables of the application that you can then install and see your features in action 🥳.

If you want to create a release build, run the following:

```shell
pnpm tauri:build
```

If you are interested in playing around with the website, run the following:

```shell
pnpm astro:dev
```

## Some Guidelines to follow

Make sure you have fulfilled the requirements and local development steps mentioned [here](#local-development).

## Commits

TableX follows commit conventions inforced by [commitlint](https://github.com/conventional-changelog/commitlint).

Commit checking is highly integrated in all parts of development process either as a pre-commit hook or checking by the lint action on push or pull-request.

This is a very crucial part and we care about it soo much to keep the commit log consistent and clean, so please take the time to read the conventions of commitlint.

## Multiply tiny is better than a Big one

Separating your changes into multiple small commits is better to review and debug than a big fat commit

## Changesets

It is very preferable to add a changeset at the end of your work in the PR.

We use [Changesets Bot](https://github.com/changesets/bot) to check for changeset in PRs.

Generally after making changes you'll run

```shell
pnpm changeset
```

and fill in the blanks to create a temporary changeset file with metadata about what you've changed that will be submitted to the repo along with your changes. Example: https://github.com/kareemmahlees/tablex/commit/6806384

The Changesets Bot will expect each PR to include such a file, and then after the PR is merged it will process and delete the file.

If your changes don't affect any major component of the repo (such as changes in the website, which we don't version tag), you may need to create an empty changeset to make the bot happy:

```shell
pnpm changeset add --empty
```

Please refer to [changesets](https://github.com/changesets/changesets) documentation for more info.
