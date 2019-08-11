extern crate reed_solomon_erasure;
extern crate wasm_bindgen;

use reed_solomon_erasure::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn main () {
    let r = ReedSolomon::new(3, 2).unwrap(); // 3 data shards, 2 parity shards

    let mut master_copy = shards!([0, 1,  2,  3],
                                  [4, 5,  6,  7],
                                  [8, 9, 10, 11],
                                  [0, 0,  0,  0], // last 2 rows are parity shards
                                  [0, 0,  0,  0]);

    // Construct the parity shards
    r.encode_shards(&mut master_copy).unwrap();

    // Make a copy and transform it into option shards arrangement
    // for feeding into reconstruct_shards
    let mut shards = shards_into_option_shards(master_copy.clone());

    // We can remove up to 2 shards, which may be data or parity shards
    shards[0] = None;
    shards[4] = None;

    // Try to reconstruct missing shards
    r.reconstruct_shards(&mut shards).unwrap();

    // Convert back to normal shard arrangement
    let result = option_shards_into_shards(shards);

    assert!(r.verify_shards(&result).unwrap());
    assert_eq!(master_copy, result);
}
