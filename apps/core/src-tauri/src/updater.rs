use tauri::AppHandle;

#[cfg(target_os = "linux")]
use tauri::{Env, Manager};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
use tauri_plugin_updater::{Update, UpdaterExt};

enum NewUpdate {
    Yes,
    No,
}

impl From<NewUpdate> for String {
    fn from(val: NewUpdate) -> Self {
        match val {
            NewUpdate::Yes => String::from("Yes"),
            NewUpdate::No => String::from("No"),
        }
    }
}

/// Checks if there is a version later than the current version.
///
/// taken from [here](https://github.com/i-c-b/example-tauri-v2-updater-action/blob/master/src-tauri/src/main.rs)
pub fn check_for_update(app_handle: AppHandle) -> tauri::Result<()> {
    app_handle.plugin(tauri_plugin_updater::Builder::new().build())?;

    #[cfg(target_os = "linux")]
    let updater_enabled = cfg!(dev) || app_handle.state::<Env>().appimage.is_some();
    #[cfg(not(target_os = "linux"))]
    let updater_enabled = true;

    if updater_enabled {
        tauri::async_runtime::spawn(async move {
            let updater = app_handle.updater();
            match updater {
                Ok(updater) => {
                    let response = updater.check().await;
                    match response {
                        Ok(update_option) => {
                            if let Some(update) = update_option {
                                show_update_dialog(app_handle, update).await;
                            } else {
                                println!("running latest version");
                            }
                        }
                        Err(e) => {
                            println!("updater failed to check: {}", e);
                        }
                    }
                }
                Err(e) => {
                    println!("updater failed to build: {}", e);
                }
            }
        });
    } else {
        println!("updater not enabled");
    }
    Ok(())
}

async fn show_update_dialog(app_handle: AppHandle, update: Update) {
    let error_dialog = app_handle
        .dialog()
        .message("Something went wrong while installing new version")
        .kind(MessageDialogKind::Error)
        .title("Error");

    let update_dialog = app_handle.dialog();
    update_dialog
        .message(format!(
            "TableX v{} is now available -- you have v{}.\n\nWould you like to install it now?",
            update.version, update.current_version
        ))
        .ok_button_label(NewUpdate::Yes)
        .cancel_button_label(NewUpdate::No)
        .show(move |result| match result {
            true => {
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();

                rt.block_on(async {
                    let status = update.download_and_install(|_, _| {}, || {}).await;
                    if status.is_err() {
                        error_dialog.blocking_show();
                    }
                });
            }
            false => {}
        });
}
