
const Cnk = (n, k) => {
    if (k < 0 || k > n) return 0;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
    return res;
};

let cp = [0, 1, 2, 3, 4, 5, 6, 7];
let co = [0, 0, 0, 0, 0, 0, 0, 0];
let ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
let eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let move_arr = [
    [0, 1, 2, 3], [0, 1, 2, 3],
    [4, 5, 6, 7], [4, 5, 6, 7],
    [1, 6, 5, 2], [3, 2, 6, 7],
    [0, 3, 4, 7], [0, 4, 5, 1],
    [2, 5, 4, 1], [1, 5, 4, 0],
    [0, 7, 6, 3], [3, 7, 6, 2]
];

const do_move = (m) => {
    const faceIdx = Math.floor(m / 3);
    const temp_co = co.slice();
    const temp_cp = cp.slice();
    const temp_eo = eo.slice();
    const temp_ep = ep.slice();
    const c_move = move_arr[faceIdx * 2];
    const e_move = move_arr[faceIdx * 2 + 1];
    const turns = m % 3;
    for (let t = 0; t <= turns; t++) {
        for (let i = 0; i < 4; i++) {
            co[c_move[i]] = temp_co[c_move[(i + 1) % 4]];
            cp[c_move[i]] = temp_cp[c_move[(i + 1) % 4]];
            eo[e_move[i]] = temp_eo[e_move[(i + 1) % 4]];
            ep[e_move[i]] = temp_ep[e_move[(i + 1) % 4]];
        }
        if (m > 3) {
            if (m < 8) {
                for (let i = 0; i < 4; i++) { co[c_move[i]] = temp_co[c_move[i]] + (i < 2 ? 1 : 2) }
            } else {
                for (let i = 0; i < 4; i++) { eo[e_move[i]] = (temp_eo[e_move[i]] + 1) % 2 }
            }
        }
    }
};

const get_P_idx = () => {
    let idx = 0, x = [0, 1, 2, 3, 4, 5, 6, 7];
    for (let i = 0; i < 4; i++) {
        idx += Cnk(11 - i, x[i] + 1);
        for (let j = i + 1; j < 8; j++) if (ep[j] < ep[i]) x[j]--;
    }
    return idx;
};

const get_P_Move = (idx, m) => {
    let x = 7, k = 3;
    // Reset cp
    cp = [0, 1, 2, 3, 4, 5, 6, 7];
    // Wait, the original code doesn't reset cp? 
    // It seems it tries to reconstruct cp from idx.
    // But the loop logic is:
    // while (idx > 0) { if (idx - Cnk(x, k) >= 0) { idx -= Cnk(x, k); cp[k] = x } else k--; x-- }
    // This looks like it's trying to set cp values.

    // Let's trace with a problematic index if we can find one.
    // The user said it hangs at 70.

    console.log(`Testing get_P_Move with idx=${idx}, m=${m}`);
    let loopCount = 0;
    while (idx > 0) {
        loopCount++;
        if (loopCount > 1000) {
            console.log('Infinite loop detected!');
            break;
        }
        if (idx - Cnk(x, k) >= 0) {
            idx -= Cnk(x, k);
            // cp[k] = x; // This line in original code sets cp[k]
        } else {
            k--;
        }
        x--;
    }
    console.log('Loop finished');
};

// Test with index 70
get_P_Move(70, 0);
