use wasm_bindgen::prelude::*;
use rsa::{PublicKey, RsaPrivateKey, RsaPublicKey, PaddingScheme, 
          pkcs8::EncodePublicKey, pkcs8::LineEnding};

struct Ballot {
    k       : usize,          // k-anonymity parameter
    privkey : RsaPrivateKey,  // private key in PKCS8 PEM encoding
    pubkey  : RsaPublicKey    // public key in PKCS8 PEM encoding
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

/**
  Initializes a new ballot.
  k - the k-anonymity parameter.
*/
#[wasm_bindgen]
pub fn init_ballot(k: u32) -> String {
    let ballot = init_ballot_internal(k as usize);
    return ballot.pubkey.to_public_key_pem(LineEnding::default()).unwrap();
} 

/**
  Submit an encrypted vote.
  encrypted_vote - encrypted vote encoded in Base64
*/
#[wasm_bindgen]
pub fn vote(encrypted_vote: String) {

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
        let _pubkey = init_ballot(1);
        assert!(true);
    }
}