import {encode, reconstruct} from "./pkg";

const SHARD_SIZE = 4;
const DATA_SHARDS = 4;
const PARITY_SHARDS = 2;

const input = Uint8Array.of(
    1, 2, 3, 4,
    1, 2, 3, 4,
    1, 2, 3, 4,
    1, 2, 3, 4,
);

const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
shards.set(input.slice());

console.log(
    'Encoding success: expect 0, result',
    encode(shards, DATA_SHARDS, PARITY_SHARDS),
);

const corrupted_shards = shards.slice();
corrupted_shards.set([0, 0, 0, 0], 0);
corrupted_shards.set([0, 0, 0, 0], SHARD_SIZE);

console.log('Corrupted shards 0 and 1');

const result = reconstruct(corrupted_shards, DATA_SHARDS, PARITY_SHARDS, Uint8Array.of(0, 0, 1, 1, 1, 1));

console.log(
    'Reconstructing corrupted data shards: expect 0, result',
    result,
);
console.log(
    'Original data shards:     ',
    input.join(', '),
);
console.log(
    'Reconstructed data shards:',
    corrupted_shards.slice(0, SHARD_SIZE * DATA_SHARDS).join(', '),
);
