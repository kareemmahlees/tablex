use crate::schema::{Keybinding, KeybindingCommand, Sidebar, Table};

/// Generate a set of default keybindings.
///
/// Typically used for when the keybindings file doesn't exist
/// from the start.
pub fn get_default_keybindings() -> Vec<Keybinding> {
    let mut result = Vec::<Keybinding>::with_capacity(4);
    // TODO: refactor the modifier key out to be platform dependent instead of registering both.
    let default_keybindings = [
        (
            vec![String::from("ctrl+s"), String::from("command+s")],
            KeybindingCommand::Sidebar(Sidebar::FocusSearch),
        ),
        (
            vec![String::from("delete")],
            KeybindingCommand::Table(Table::DeleteRow),
        ),
        (
            vec![String::from("ctrl+c"), String::from("command+c")],
            KeybindingCommand::Table(Table::CopyRow),
        ),
        (
            vec![String::from("ctrl+a"), String::from("command+a")],
            KeybindingCommand::Table(Table::SelectAll),
        ),
    ];
    for (shortcuts, command) in default_keybindings {
        let keybinding = Keybinding::new(shortcuts, command);
        result.push(keybinding)
    }
    result
}
