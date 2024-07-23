use tauri::AppHandle;

#[cfg(target_os = "linux")]
use tauri::{Env, Manager};
use tauri_plugin_updater::UpdaterExt;

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
                                // let _ = update.download_and_install(|_, _| {}, || {}).await;
                                println!(
                                    "update available:\n\tdownload url: {}\n\tsignature: {} \n\tversion:{}",
                                    update.download_url, update.signature,update.version
                                );
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
