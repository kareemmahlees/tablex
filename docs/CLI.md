## TableX --help

TableX ships, by default, with a little CLI that you can run the same way as you run your GUI, _but from your terminal_.

Example:

```shell
$ path/to/TableX.exe --help
```

If your run `TableX.exe` without any arguments or flags it will startup the GUI for you as if you double clicked the Desktop shortcut or ran it from your start menu.

By default, the CLI establishes an `on the fly` connection, meaning that it will **not** be saved to the records.
If you would like to save your connection, checkout the [--save](#save---s) flag.

> [!NOTE]
> The common convention for CLIs is to be named lower-case, i.e `tablex`, but theres is an [open issue](https://github.com/tauri-apps/tauri/issues/8109) in Tauri that addresses this.

## Dictionary

> [!TIP]
> All of the following flags have both long & shorthand versions ( i.e --save &
> -s ) so make sure to use `--help` to get to know the two version.

<!-- prettier-ignore-start -->
| Name | Description | Argument | Flag | Required | Require other flags |
|---|---|---|---|---|---|
| help | Display help message with all the available flags and arguments. |  | True |  |  |
| version | Get the version of TableX. |  | True |  |  |
| CONN_STRING | Connection string for the database driver of your choice. | True |  | True |  |
| conn-name | Connection name. |  | True |  |  |
| save | Save the established connection to the records. |  | True |  | conn-name |
<!-- prettier-ignore-end -->
