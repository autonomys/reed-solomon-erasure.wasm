import {encode, memory, reconstruct} from "./pkg/reed_solomon_erasure_bg";

function setMemory(value: ArrayLike<number>, offset?: number): void {
    (new Uint8Array(memory.buffer)).set(value, offset);
}

const SHARD_SIZE = 4;
const DATA_SHARDS = 4;
const PARITY_SHARDS = 2;
const SHARDS_ADDRESS = 0;
const SHARDS_AVAILABLE_ADDRESS = SHARDS_ADDRESS + SHARD_SIZE * (DATA_SHARDS * PARITY_SHARDS);

const input = Uint8Array.of(
    1, 2, 3, 4,
    1, 2, 3, 4,
    1, 2, 3, 4,
    1, 2, 3, 4,
);

const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
shards.set(input.slice());

setMemory(shards, SHARDS_ADDRESS);

console.log(
    'Encoding success: expect 0, result',
    encode(SHARDS_ADDRESS, SHARD_SIZE, DATA_SHARDS, PARITY_SHARDS),
);

setMemory([0, 0, 0, 0], 0);
setMemory([0, 0, 0, 0], SHARD_SIZE);

console.log('Corrupted shards 0 and 1');

setMemory(Uint8Array.of(0, 0, 1, 1, 1, 1), SHARDS_AVAILABLE_ADDRESS);

const result = reconstruct(SHARDS_ADDRESS, SHARD_SIZE, DATA_SHARDS, PARITY_SHARDS, SHARDS_AVAILABLE_ADDRESS);

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
    (new Uint8Array(memory.buffer)).slice(SHARDS_ADDRESS, SHARDS_ADDRESS + SHARD_SIZE * DATA_SHARDS).join(', '),
);
