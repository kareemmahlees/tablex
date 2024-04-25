use crate::connection::{connections_exist, create_connection_record, establish_connection};
use crate::state::SharedState;
use clap::Command;
use clap::{error::ErrorKind, CommandFactory, Parser};
use tauri::{async_runtime::Mutex, Manager};
use tauri::{AppHandle, Window};
use tx_lib::Drivers;

#[derive(Parser, Debug)]
#[command(version, about)]
pub struct Args {
    /// Connection string of the database
    conn_string: Option<String>,

    /// Optional name of the connection
    #[arg(short, long, value_name = "NAME")]
    conn_name: Option<String>,

    /// Save the connection
    #[arg(short, long, value_name = "SAVE", requires = "conn_name")]
    save: bool,
}

/// Only on windows.
///
/// Attaches the console so the user can see output in the terminal.
#[cfg(all(windows, not(dev)))]
fn attach_console() {
    use windows::Win32::System::Console::{AttachConsole, ATTACH_PARENT_PROCESS};
    let _ = unsafe { AttachConsole(ATTACH_PARENT_PROCESS) };
}

/// Only on windows.
///
/// Frees the console so the user won't see weird println's  
/// after he is done using the cli.
#[cfg(all(windows, not(dev)))]
fn free_console() {
    use windows::Win32::System::Console::FreeConsole;
    let _ = unsafe { FreeConsole() };
}

/// If the app is ran with CLI args, this will parse them and handle
/// the errors messages.
pub fn parse_cli_args() -> (Args, Command) {
    #[cfg(all(windows, not(dev)))]
    attach_console();

    let args = Args::parse();
    let cmd = Args::command();

    #[cfg(all(windows, not(dev)))]
    free_console();
    (args, cmd)
}

/// Receives the return values from `parse_cli_args` and handles establishing
/// and saving connections.
/// # Errors
/// - If the connection string is malformed.
/// - If the driver is invalid.
/// - If `--save` is set without `-c`.
pub async fn handle_cli_args(app: &AppHandle, args: Args, mut cmd: Command) {
    let main_window = app.get_window("main").unwrap();
    let splash_screen = app.get_window("splashscreen").unwrap();

    if let Some(conn_string) = args.conn_string {
        #[cfg(all(windows, not(dev)))]
        attach_console();

        let driver = establish_on_the_fly_connection(app, &conn_string)
            .await
            .map_err(|e| cmd.error(ErrorKind::Format, e).exit())
            .unwrap();

        if args.save {
            let _ = create_connection_record(
                app.clone(),
                conn_string,
                args.conn_name.clone().unwrap(),
                driver,
            )
            .map_err(|e| cmd.error(ErrorKind::Io, e).exit());
        }

        #[cfg(all(windows, not(dev)))]
        free_console();

        splash_screen.show().unwrap();

        let url = format!(
            "/dashboard/layout/land?connectionName={}",
            &args.conn_name.unwrap_or("Temp".into())
        );
        let _ = main_window.eval(format!("window.location.replace('{url}')").as_str());
    } else {
        splash_screen.show().unwrap();

        normal_navigation(app, main_window);
    }
}

/// If the app is ran with CLI args
async fn establish_on_the_fly_connection(
    app: &AppHandle,
    conn_string: &String,
) -> Result<Drivers, String> {
    let (prefix, _) = conn_string
        .split_once(':')
        .ok_or::<String>("Invalid connection string format".into())?;

    let state = app.state::<Mutex<SharedState>>();

    let mut driver: Drivers = Drivers::default();

    match prefix {
        "sqlite" | "sqlite3" => {
            driver = Drivers::SQLite;
            Ok(())
        }
        "postgresql" | "postgres" => {
            driver = Drivers::PostgreSQL;
            Ok(())
        }
        "mysql" => {
            driver = Drivers::MySQL;
            Ok(())
        }
        _ => Err(format!("Unsupported driver {prefix}")),
    }?;
    establish_connection(state, conn_string.into(), driver.clone()).await?;

    Ok(driver)
}

/// If the app is ran without CLI args
fn normal_navigation(app: &AppHandle, main_window: Window) {
    let exist = connections_exist(app.clone()).unwrap();

    if exist {
        let _ = main_window.eval("window.location.replace('/connections')");
    }
}
