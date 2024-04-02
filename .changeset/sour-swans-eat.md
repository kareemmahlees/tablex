---
"@tablex/core": patch
---

Connection to Databases Via the CLI 🚀

## New Features

- specify a connection string when you run TableX from the terminal like so:

```shell
$ TableX sqlite:test.db
```

- A new flag `--conn-name/-c` to specify the name of the connection.
- A new flag `--save/-s` to optionally save the connection to your records

> [!TIP]
> TableX will continue to run normally if you didn't specify any arguments or flags.
