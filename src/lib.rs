use wasm_bindgen::prelude::*;
use rsa::{PublicKey, RsaPrivateKey, RsaPublicKey, PaddingScheme, 
          pkcs8::EncodePublicKey, pkcs8::LineEnding};

pub struct Ballot {
    k       : usize,          // k-anonymity parameter
    privkey : RsaPrivateKey,  // private key in PKCS8 PEM encoding
    pubkey  : RsaPublicKey    // public key in PKCS8 PEM encoding
}

#[cfg(target_family="wasm")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: String);
}

#[cfg(target_arch="x86_64")]
fn log(s: String) {
    println!("{}", s);
}

fn gen_keypair() -> (RsaPublicKey, RsaPrivateKey) {
    let bits = 2048;
    let mut rng : rand::rngs::ThreadRng = rand::thread_rng();
    let privkey = RsaPrivateKey::new(&mut rng, bits).expect("failed to generate an RSA key pair");
    let pubkey = RsaPublicKey::from(&privkey);
    return (pubkey, privkey)
}

fn init_ballot_internal(_k: usize) -> Ballot {
    let (_pubkey, _privkey) = gen_keypair();
    return Ballot {k: _k, privkey: _privkey, pubkey: _pubkey}
}

/// Returns the public key for a given ballot encoded in PEM (PKCS8) format.
/// ballot - pointer to the Ballot object to extract the public key for
#[wasm_bindgen]
pub fn get_ballot_pubkey_pem(ballot: *const Ballot) -> String {
    unsafe {
        return (*ballot).pubkey.to_public_key_pem(LineEnding::default()).unwrap();
    }
}

/**
  Initializes a new ballot.
  k - the k-anonymity parameter
*/
#[wasm_bindgen]
pub fn init_ballot(k: u32) -> *const Ballot {
    let ballot = init_ballot_internal(k as usize);
    log(format!("Ballot initialized with k={}", k));
    return &ballot;
} 

/// Submit an encrypted vote.
/// encrypted_vote - encrypted vote encoded in Base64
#[wasm_bindgen]
pub fn vote(encrypted_vote: String) {

}

/// Finalizes the ballot in order to reveal the results.
#[wasm_bindgen]
pub fn finalize_ballot(ballot: *const Ballot) {
    
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gen_keypair() {
        let (_pubkey, _privkey) = gen_keypair();
        assert!(true);
    }

    #[test]
    fn test_init_ballot_internal() {
        let _ballot = init_ballot_internal(1);
        assert!(true);
    }

    #[test]
    fn test_init_ballot() {
        let _ballot = init_ballot(1);
        assert!(!_ballot.is_null());
    }
}