use serde::Serialize;
use specta::{
    datatype::{reference::reference, PrimitiveType},
    internal::construct::{
        data_type_reference, field, impl_location, named_data_type, r#struct, sid, struct_named,
    },
    DataType, Generics, NamedType, SpectaID,
};
use thiserror::Error;

#[derive(Debug, Error)]
/// Global error for all TableX operations.
///
/// **Note** that [`serde::Serialize`] is manually implemented for this enum, so
/// the output data might be different from what you expected.
pub enum TxError {
    #[error(transparent)]
    /// Represents all sqlx related errors.
    Database(#[from] sqlx::Error),

    #[error(transparent)]
    /// Represent all filesystem related errors.
    Io(#[from] std::io::Error),

    #[error(transparent)]
    /// Represents tauri runtime's errors.
    TauriError(#[from] tauri::Error),

    #[error(transparent)]
    /// Represents serde's serialization/deserialization errors.
    SerdeError(#[from] serde_json::Error),

    #[error("{0}")]
    MetaXError(String),

    #[error("Unsupported data type {0}")]
    /// Represents errors when trying to decode an unsupported
    /// datatype to a rust datatype.
    UnsupportedDataType(String),

    #[error("Couldn't connect to DB")]
    /// Represents database connection errors.
    ConnectionError,

    #[error("DB not responding to Pings")]
    /// Represents database ping errors.
    PingError,

    #[error("Invalid connection string format")]
    /// Represents malformed connection string error
    /// received from the cli.
    InvalidConnectionString,

    #[error("Unsupported driver {0}")]
    /// For when receiving an unsupported database driver
    /// from the cli.
    UnsupportedDriver(String),
}

impl specta::NamedType for TxError {
    fn sid() -> SpectaID {
        sid("TxError", "tx_error")
    }
    fn named_data_type(
        _type_map: &mut specta::TypeMap,
        _generics: &[DataType],
    ) -> specta::datatype::NamedDataType {
        todo!()
    }
    fn definition_named_data_type(
        type_map: &mut specta::TypeMap,
    ) -> specta::datatype::NamedDataType {
        named_data_type(
            "TxError".into(),
            "Global error object returned by all commands".into(),
            None,
            Self::sid(),
            impl_location("some/impl/location"), // Idk what is the use of this.
            <Self as specta::Type>::inline(type_map, Generics::Definition),
        )
    }
}

impl specta::Type for TxError {
    fn inline(
        _type_map: &mut specta::TypeMap,
        _generics: specta::Generics,
    ) -> specta::datatype::DataType {
        DataType::Struct(r#struct(
            "TxError".into(),
            Some(Self::sid()),
            vec![],
            struct_named(
                vec![
                    (
                        "message".into(),
                        field(
                            false,
                            false,
                            None,
                            "short message to be displayed in the toast".into(),
                            Some(DataType::Primitive(PrimitiveType::String)),
                        ),
                    ),
                    (
                        "details".into(),
                        field(
                            false,
                            false,
                            None,
                            "Detailed error message throwing by the low level api".into(),
                            Some(DataType::Primitive(PrimitiveType::String)),
                        ),
                    ),
                ],
                None,
            ),
        ))
    }
    fn reference(
        type_map: &mut specta::TypeMap,
        _: &[DataType],
    ) -> specta::datatype::reference::Reference {
        reference::<Self>(
            type_map,
            data_type_reference("TxError".into(), Self::sid(), vec![]),
        )
    }
}

#[derive(Serialize)]
#[serde(tag = "kind")]
#[serde(rename_all = "camelCase")]
enum TxErrorKind {
    Database { message: String, details: String },
    Io { message: String, details: String },
    TauriError { message: String, details: String },
    SerdeError { message: String, details: String },
    MetaXError { message: String },
    UnsupportedDataType { message: String, details: String },
    ConnectionError { message: String },
    PingError { message: String },
    InvalidConnectionString { message: String },
    UnsupportedDriver { message: String },
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
            Self::SerdeError(_) => TxErrorKind::SerdeError {
                message: "Serde serialization error".to_string(),
                details: error_message,
            },
            Self::MetaXError(e) => TxErrorKind::MetaXError {
                message: e.to_string(),
            },
            Self::UnsupportedDataType(_) => TxErrorKind::UnsupportedDataType {
                message: "Unsupported data type".to_string(),
                details: error_message,
            },
            Self::ConnectionError => TxErrorKind::ConnectionError {
                message: error_message,
            },
            Self::PingError => TxErrorKind::PingError {
                message: error_message,
            },
            Self::InvalidConnectionString => TxErrorKind::InvalidConnectionString {
                message: error_message,
            },
            Self::UnsupportedDriver(_) => TxErrorKind::UnsupportedDriver {
                message: error_message,
            },
        };
        error_kind.serialize(serializer)
    }
}
