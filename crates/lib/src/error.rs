use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TxError {
    #[error(transparent)]
    Database(#[from] sqlx::Error),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    TauriError(#[from] tauri::Error),
}

impl specta::Type for TxError {
    fn inline(_: &mut specta::TypeMap, _: specta::Generics) -> specta::datatype::DataType {
        specta::datatype::DataType::Primitive(specta::datatype::PrimitiveType::String)
    }
}

#[derive(Serialize)]
#[serde(tag = "kind")]
#[serde(rename_all = "camelCase")]
enum TxErrorKind {
    Database { message: String, details: String },
    Io { message: String, details: String },
    TauriError { message: String, details: String },
}

impl Serialize for TxError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::Database(_) => TxErrorKind::Database {
                message: "Error from database".to_string(),
                details: error_message,
            },
            Self::Io(_) => TxErrorKind::Io {
                message: "Filesystem IO error".to_string(),
                details: error_message,
            },
            Self::TauriError(_) => TxErrorKind::TauriError {
                message: "Tauri runtime error".to_string(),
                details: error_message,
            },
        };
        error_kind.serialize(serializer)
    }
}
