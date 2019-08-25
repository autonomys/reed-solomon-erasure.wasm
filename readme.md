# reed-solomon-erasure.wasm
[reed-solomon-erasure](https://github.com/darrenldl/reed-solomon-erasure) Rust library compiled to WebAssembly and optimized for small size.

This library aims to provide relatively low-level, yet simple to use API to Reed-Solomon erasure coding.
Library works both in modern browsers and Node.js environment with TypeScript support.

### How to install
```bash
npm install @subspace/reed-solomon-erasure.wasm
```

### How to use
```typescript
import {ReedSolomonErasure} from "@subspace/reed-solomon-erasure.wasm";

const reedSolomonErasure = await ReedSolomonErasure.fromCurrentDirectory();
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
    reedSolomonErasure.encode(shards, DATA_SHARDS, PARITY_SHARDS),
);

const corruptedShards = shards.slice();
corruptedShards.set([0, 0, 0, 0], 0);
corruptedShards.set([0, 0, 0, 0], SHARD_SIZE);

console.log('Corrupted shards 0 and 1');

const result = reedSolomonErasure.reconstruct(
    corruptedShards,
    DATA_SHARDS,
    PARITY_SHARDS,
    [false, false, true, true, true, true],
);

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
    corruptedShards.slice(0, SHARD_SIZE * DATA_SHARDS).join(', '),
);
```

### API

#### ReedSolomonErasure.fromCurrentDirectory(): Promise<ReedSolomonErasure>
Static automagical method that will try to detect environment (Node.js or browser) and load *.wasm file from current directory

#### ReedSolomonErasure.fromCurrentDirectory(source: Response): Promise<ReedSolomonErasure>
Static method for asynchronous instantiation, primarily in Browser environment, expects you to load WASM file with `fetch()`, usage example:
```javascript
fetch('https://domain.tld/path/to/reed_solomon_erasure_bg.wasm')
    .then(ReedSolomonErasure.fromResponse)
    .then((reedSolomonErasure) => {
        // Use library here
    })
```

#### ReedSolomonErasure.fromBytes(bytes: BufferSource): ReedSolomonErasure
Static method for synchronous instantiation, primarily in Node.js environment, usage example:
```javascript
const reedSolomonErasure = ReedSolomonErasure.fromBytes(
    require('fs').readFileSync(`/path/to/reed_solomon_erasure_bg.wasm`)
);
// Use library here
```

#### ReedSolomonErasure.encode(shards: Uint8Array, dataShards: number, parityShards: number): number
Takes a contiguous array of bytes that contain space for `data_shards + parity_shards` shards with `data_shards` shards containing data and fills additional `parity_shards` with parity information that can be later used to reconstruct data in case of corruption.

Returns one of `ReedSolomonErasure.RESULT_*` constants; if `ReedSolomonErasure.RESULT_OK` then parity shards were updated in `shards` in-place.

#### ReedSolomonErasure.reconstruct(shards: Uint8Array, dataShards: number, parityShards: number, shardsAvailable: boolean[]): number
Takes a contiguous array of bytes that contain `data_shards + parity_shards` shards and tries to reconstruct data shards if they are broken and whenever possible using information from `shards_available` (contains `data_shards + parity_shards` boolean values, each of which is either `true` if shard is not corrupted or `false` if it is).

Returns one of `ReedSolomonErasure.RESULT_*` constants; if `ReedSolomonErasure.RESULT_OK` then data shards were reconstructed in `shards` in-place.

#### Constants
Below constants are used to check the result of encoding/reconstruction:
* `ReedSolomonErasure.RESULT_OK`
* `ReedSolomonErasure.RESULT_ERROR_TOO_FEW_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_MANY_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_FEW_DATA_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_MANY_DATA_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_FEW_PARITY_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_MANY_PARITY_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_FEW_BUFFER_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_TOO_MANY_BUFFER_SHARDS`
* `ReedSolomonErasure.RESULT_ERROR_INCORRECT_SHARD_SIZE`
* `ReedSolomonErasure.RESULT_ERROR_TOO_FEW_SHARDS_PRESENT`
* `ReedSolomonErasure.RESULT_ERROR_EMPTY_SHARD`
* `ReedSolomonErasure.RESULT_ERROR_INVALID_SHARD_FLAGS`
* `ReedSolomonErasure.RESULT_ERROR_INVALID_INDEX`

### Tests
Project is covered with tests that ensure things work as expected and do not regress, run them with usual `npm test`.

### License
MIT, see license.txt
