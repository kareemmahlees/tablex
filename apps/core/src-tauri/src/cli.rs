use clap::Parser;

#[derive(Parser, Debug)]
#[command(version, about)]
pub(crate) struct Args {}

/// Only on windows.
///
/// Attaches the console so the user can see output in the terminal.
#[cfg(windows)]
fn attach_console() {
    use windows::Win32::System::Console::{AttachConsole, ATTACH_PARENT_PROCESS};
    let _ = unsafe { AttachConsole(ATTACH_PARENT_PROCESS) };
}

/// Only on windows.
///
/// Frees the console so the user won't see weird println's  
/// after he is done using the cli.
#[cfg(windows)]
fn free_console() {
    use windows::Win32::System::Console::FreeConsole;
    let _ = unsafe { FreeConsole() };
}

// TODO: #46 - Support arguments such as DB connection.
/// Process basic cli args (like --help and --version).
pub(crate) fn parse_cli_args() -> Args {
    #[cfg(windows)]
    attach_console();

    let args = Args::parse();

    #[cfg(windows)]
    free_console();

    args
}
