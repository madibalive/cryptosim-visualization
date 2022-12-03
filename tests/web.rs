#[path="../src/lib.rs"]
mod private_voting;

use private_voting::*;

use wasm_bindgen_test::{wasm_bindgen_test,wasm_bindgen_test_configure};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_init_ballot() {
    let _ballot = Ballot::new(1);
}

#[wasm_bindgen_test]
fn test_get_pubkey_pem() {
    let _ballot = Ballot::new(1);
    let _pubkey_pem = _ballot.get_pubkey_pem();
}

#[wasm_bindgen_test]
fn test_vote() {
    let mut _ballot = Ballot::new(1);
    _ballot.vote("test".to_owned());
}   

#[wasm_bindgen_test]
fn test_finalize_ballot() {
    let _ballot = Ballot::new(1);
    _ballot.finalize();
}