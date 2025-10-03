use crate::commands::connection::{create_connection_record, establish_connection};
use crate::state::Storage;
use clap::{Command, CommandFactory, Parser, error::ErrorKind};
use tauri::{AppHandle, Manager};
use tx_lib::TxError;
use tx_lib::{Result, types::Drivers};

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
    use windows::Win32::System::Console::{ATTACH_PARENT_PROCESS, AttachConsole};
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
    let main_window = app.get_webview_window("main").unwrap();

    if let Some(conn_string) = args.conn_string {
        #[cfg(all(windows, not(dev)))]
        attach_console();

        let driver = establish_on_the_fly_connection(app, &conn_string)
            .await
            .map_err(|e| cmd.error(ErrorKind::Format, e).exit())
            .unwrap();

        if args.save {
            let _ = create_connection_record(
                app.state::<Storage>(),
                conn_string,
                args.conn_name.clone().unwrap(),
                driver,
            )
            .await
            .map_err(|e| cmd.error(ErrorKind::Io, e).exit());
        }

        #[cfg(all(windows, not(dev)))]
        free_console();

        let url = format!(
            "/dashboard/land?connectionName={}",
            &args.conn_name.unwrap_or("Temp".into())
        );
        let _ = main_window.eval(format!("window.location.replace('{url}')").as_str());
    } else {
        return;
    }
}

/// If the app is ran with CLI args
async fn establish_on_the_fly_connection(app: &AppHandle, conn_string: &String) -> Result<Drivers> {
    let (prefix, _) = conn_string
        .split_once(':')
        .ok_or(TxError::InvalidConnectionString)?;

    let driver = match prefix {
        "sqlite" | "sqlite3" => Ok(Drivers::SQLite),
        "postgresql" | "postgres" => Ok(Drivers::PostgreSQL),
        "mysql" => Ok(Drivers::MySQL),
        _ => Err(TxError::UnsupportedDriver(prefix.to_string())),
    }?;
    establish_connection(app.to_owned(), conn_string.into(), driver.clone()).await?;

    Ok(driver)
}
