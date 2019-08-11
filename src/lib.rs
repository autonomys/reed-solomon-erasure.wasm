extern crate reed_solomon_erasure;
extern crate wasm_bindgen;

use reed_solomon_erasure::*;
use wasm_bindgen::prelude::*;
use std::slice;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn result_to_number(result: Result<(), Error>) -> u8 {
    return match result {
        Ok(()) => 0,
        Err(Error::TooFewShards) => 1,
        Err(Error::TooManyShards) => 2,
        Err(Error::TooFewDataShards) => 3,
        Err(Error::TooManyDataShards) => 4,
        Err(Error::TooFewParityShards) => 5,
        Err(Error::TooManyParityShards) => 6,
        Err(Error::TooFewBufferShards) => 7,
        Err(Error::TooManyBufferShards) => 8,
        Err(Error::IncorrectShardSize) => 9,
        Err(Error::TooFewShardsPresent) => 10,
        Err(Error::EmptyShard) => 11,
        Err(Error::InvalidShardFlags) => 12,
        Err(Error::InvalidIndex) => 13,
    };
}

/**
 * `shards` must have enough of space allocated to hold `shard_size * (data_shards + parity_shards)`
 * bytes with `shard_size * data_shards` already filled with data
 */
#[wasm_bindgen]
pub fn encode(shards: *mut u8, shard_size: usize, data_shards: usize, parity_shards: usize) -> u8 {
    let reed_solomon = ReedSolomon::new(data_shards, parity_shards).unwrap();
    let total_shards = data_shards + parity_shards;
    let total_bytes = shard_size * total_shards;

    let shards_slice = unsafe {
        slice::from_raw_parts_mut(shards, total_bytes)
    };
    let mut separate_slice_shards: Vec<_> = shards_slice
        .chunks_exact_mut(shard_size)
        .collect();

    return result_to_number(
        reed_solomon.encode((&mut separate_slice_shards).as_mut_slice())
    );
}

/**
 * `shards` must have enough of space allocated to hold `shard_size * (data_shards + parity_shards)`
 * bytes with shards that are available filled with data and specified in `shards_available`
 * argument
 */
#[wasm_bindgen]
pub fn reconstruct(shards: *mut u8, shard_size: usize, data_shards: usize, parity_shards: usize, shards_available: *const u8) -> u8 {
    let reed_solomon = ReedSolomon::new(data_shards, parity_shards).unwrap();
    let total_shards = data_shards + parity_shards;
    let total_bytes = shard_size * total_shards;

    let shards_slice = unsafe {
        slice::from_raw_parts_mut(shards, total_bytes)
    };
    let mut separate_slice_shards: Vec<_> = shards_slice
        .chunks_exact_mut(shard_size)
        .collect();
    let shards_available_slice: Vec<bool> = unsafe {
        slice::from_raw_parts(shards_available, total_shards)
            .iter()
            .map(|&num| {
                num == 1u8
            })
            .collect()
    };

    return result_to_number(
        reed_solomon.reconstruct_data(&mut separate_slice_shards, &shards_available_slice)
    );
}
