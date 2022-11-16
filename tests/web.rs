#[path="../src/lib.rs"]
mod private_voting;

use wasm_bindgen_test::{wasm_bindgen_test,wasm_bindgen_test_configure};

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_init_ballot() {
    let _ballot = private_voting::init_ballot(1);
    assert!(!_ballot.is_null())
}