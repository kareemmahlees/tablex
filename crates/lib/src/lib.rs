//! # TableX Lib
//!
//! This crate is concerned with common/shared operations like reading & writing to the file system,
//! common types, decoding, etc ...
//!
//! Other crates can depend on this crate, but this crate *Mustn't* depend on others.

pub mod decode;
mod error;
pub mod events;
pub mod fs;
pub mod types;

pub use error::TxError;
pub use types::Result;
