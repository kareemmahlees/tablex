use tauri::AppHandle;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};
use tauri_specta::Event;
use tx_lib::events::{Shortcut as ShortcutEvent, ShortcutAction};

const SHORTCUTS: &[(Modifiers, Code, ShortcutAction)] = &[
    (Modifiers::CONTROL, Code::KeyS, ShortcutAction::FocusSearch),
    (Modifiers::CONTROL, Code::KeyC, ShortcutAction::Copy),
];

pub struct ShortcutHandler<'a> {
    app: &'a AppHandle,
}

impl<'a> ShortcutHandler<'a> {
    pub fn new(app: &'a AppHandle) -> Self {
        ShortcutHandler { app }
    }

    pub fn handle_shortcut(&self, shortcut: &Shortcut) {
        for (modifier, key, action) in SHORTCUTS.iter() {
            if shortcut.matches(modifier, key) {
                ShortcutEvent(action.clone()).emit(self.app).unwrap()
            }
        }
    }
}
