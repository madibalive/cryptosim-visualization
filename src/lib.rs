use wasm_bindgen::prelude::*;
use rsa::{PublicKey, RsaPrivateKey, RsaPublicKey, PaddingScheme, 
          pkcs8::EncodePublicKey, pkcs8::LineEnding};
use std::collections::HashMap;          

#[wasm_bindgen]
pub struct Ballot {
    k       : u32,          // k-anonymity parameter
    privkey : RsaPrivateKey,  // private key in PKCS8 PEM encoding
    pubkey  : RsaPublicKey,   // public key in PKCS8 PEM encoding
    votes   : Vec<String>     // list of submitted votes 
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

#[wasm_bindgen]
impl Ballot {

    /// Initializes a new ballot.
    /// k - the k-anonymity parameter
    pub fn new(k: u32) -> Ballot {
        let (_pubkey, _privkey) = gen_keypair();

        log(format!("Ballot initialized with k={}", k));

        Ballot {
            k: k,
            privkey: _privkey,
            pubkey: _pubkey,
            votes: Vec::new()
        }
    }

    /// Returns the public key for a given ballot encoded in PEM (PKCS8) format.
    /// ballot - pointer to the Ballot object to extract the public key for
    pub fn get_pubkey_pem(&self) -> String {
        return self.pubkey.to_public_key_pem(LineEnding::default()).unwrap();
    }

    /// Submit an encrypted vote.
    /// encrypted_vote - encrypted vote encoded in Base64
    pub fn vote(&mut self, encrypted_vote: String) {
        log(format!("Received a new vote: {}", encrypted_vote));
        
        self.votes.push(encrypted_vote);
        log(format!("Added vote to list"));
    }

    /// Finalizes the ballot in order to reveal the results.
    pub fn finalize(&self) -> String {
        let total_votes = self.votes.len();
        log(format!("Received {} votes in total", total_votes));
        
        if total_votes < self.k as usize {
            log(format!("Received less votes than minimum quorum size. Cannot finalize ballot."));
            return "".to_owned()
        }

        let mut vote_count : HashMap<String, usize> = HashMap::new();
        for vote in &self.votes {
            vote_count.entry(vote.to_owned()).and_modify(|count| *count += 1).or_insert(1);
        }

        // create a sorted votes vector by count
        let mut count_vec : Vec<_> = vote_count.iter().collect();
        count_vec.sort_by(|a, b| b.1.cmp(a.1));
        return count_vec[0].0.to_owned()
    }

}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_gen_keypair() {
        let (_pubkey, _privkey) = gen_keypair();
    }

    #[test]
    fn test_init_ballot() {
        let _ballot = Ballot::new(1);
    }

    #[test]
    fn test_get_pubkey_pem() {
        let _ballot = Ballot::new(1);
        let _pubkey_pem = _ballot.get_pubkey_pem();
    }

    #[test]
    fn test_vote() {
        let mut _ballot = Ballot::new(1);
        _ballot.vote("test".to_owned());
    }

    #[test]
    fn test_finalize_ballot() {
        let mut _ballot = Ballot::new(1);
        _ballot.vote("test".to_owned());
        let winner = _ballot.finalize();
        assert!(winner == "test");
        log(format!("Ballot winner: {}", winner))
    }

    #[test]
    fn test_finalize_less_than_k() {
        let _ballot = Ballot::new(1);
        _ballot.finalize();
    }
    
}