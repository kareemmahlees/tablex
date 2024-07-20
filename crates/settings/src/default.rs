use crate::schema::Settings;

pub fn get_default_settings() -> Settings {
    Settings::new(500)
}
