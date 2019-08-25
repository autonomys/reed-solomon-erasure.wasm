import * as test from "tape";
import {ReedSolomonErasure} from "../src";

test('Basic test', async (t) => {
    const SHARD_SIZE = 4;
    const DATA_SHARDS = 4;
    const PARITY_SHARDS = 2;

    const reedSolomonErasure = await ReedSolomonErasure.fromCurrentDirectory();

    const input = Uint8Array.of(
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4,
        1, 2, 3, 4,
    );

    const shards = new Uint8Array(SHARD_SIZE * (DATA_SHARDS + PARITY_SHARDS));
    shards.set(input.slice());

    t.equal(
        reedSolomonErasure.encode(shards, DATA_SHARDS, PARITY_SHARDS),
        ReedSolomonErasure.RESULT_OK,
        'Encoded successfully',
    );

    {
        const corruptedShards = shards.slice();
        corruptedShards.set([0, 0, 0, 0], 0);
        corruptedShards.set([0, 0, 0, 0], SHARD_SIZE);

        t.equal(
            reedSolomonErasure.reconstruct(corruptedShards, DATA_SHARDS, PARITY_SHARDS, [false, false, true, true, true, true]),
            ReedSolomonErasure.RESULT_OK,
            'Reconstructed successfully',
        );
        t.equal(
            corruptedShards.slice(0, SHARD_SIZE * DATA_SHARDS).join(', '),
            input.join(', '),
            'Reconstructed data correctly',
        );
    }

    {
        const corruptedShards = shards.slice();
        corruptedShards.set([0, 0, 0, 0], 0);
        corruptedShards.set([0, 0, 0, 0], SHARD_SIZE);
        corruptedShards.set([0, 0, 0, 0], SHARD_SIZE * 2);

        t.equal(
            reedSolomonErasure.reconstruct(corruptedShards, DATA_SHARDS, PARITY_SHARDS, [false, false, false, true, true, true]),
            ReedSolomonErasure.RESULT_ERROR_TOO_FEW_SHARDS_PRESENT,
            'Failed to reconstruct when not enough shards are available',
        );
        t.notEqual(
            corruptedShards.slice(0, SHARD_SIZE * DATA_SHARDS).join(', '),
            input.join(', '),
            'Failed to reconstruct data correctly',
        );
    }

    t.end();
});
