// Test to see what the actual edge is that's failing
const userState = {
    "F": [
        "yellow", "green", "green",
        "yellow", "green", "green",
        "orange", "green", "green"
    ],
    "R": [
        "white", "yellow", "red",
        "red", "red", "red",
        "red", "red", "blue"
    ],
    "B": [
        "white", "white", "red",
        "white", "blue", "blue",
        "orange", "blue", "blue"
    ],
    "L": [
        "blue", "orange", "orange",
        "orange", "orange", "orange",
        "yellow", "white", "white"
    ],
    "U": [
        "white", "orange", "green",
        "green", "white", "blue",
        "green", "white", "orange"
    ],
    "D": [
        "yellow", "yellow", "yellow",
        "yellow", "yellow", "red",
        "blue", "blue", "red"
    ]
};

const Face = { Front: 'F', Right: 'R', Back: 'B', Left: 'L', Up: 'U', Down: 'D' };

const OPPOSITE_COLORS = {
    white: 'yellow', yellow: 'white',
    green: 'blue', blue: 'green',
    red: 'orange', orange: 'red'
};

const PIECE_MAP = {
    edges: [
        { name: 'UF', stickers: [[Face.Up, 7], [Face.Front, 1]] },
        { name: 'UL', stickers: [[Face.Up, 3], [Face.Left, 1]] },
        { name: 'UB', stickers: [[Face.Up, 1], [Face.Back, 1]] },
        { name: 'UR', stickers: [[Face.Up, 5], [Face.Right, 1]] },
        { name: 'DF', stickers: [[Face.Down, 1], [Face.Front, 7]] },
        { name: 'DL', stickers: [[Face.Down, 3], [Face.Left, 7]] },
        { name: 'DB', stickers: [[Face.Down, 7], [Face.Back, 7]] },
        { name: 'DR', stickers: [[Face.Down, 5], [Face.Right, 7]] },
        { name: 'FR', stickers: [[Face.Front, 5], [Face.Right, 3]] },
        { name: 'FL', stickers: [[Face.Front, 3], [Face.Left, 5]] },
        { name: 'BR', stickers: [[Face.Back, 3], [Face.Right, 5]] },
        { name: 'BL', stickers: [[Face.Back, 5], [Face.Left, 3]] },
    ]
};

console.log('Checking edges with Red/Orange swap...\n');

const rightCenter = userState.R[4];
const leftCenter = userState.L[4];
const needsSwap = (rightCenter === 'red' && leftCenter === 'orange');

console.log('Right center:', rightCenter);
console.log('Left center:', leftCenter);
console.log('Needs swap?', needsSwap, '\n');

const getEffectiveColor = (color) => {
    if (!needsSwap) return color;
    if (color === 'red') return 'orange';
    if (color === 'orange') return 'red';
    return color;
};

for (const edge of PIECE_MAP.edges) {
    const rawC1 = userState[edge.stickers[0][0]][edge.stickers[0][1]];
    const rawC2 = userState[edge.stickers[1][0]][edge.stickers[1][1]];
    const c1 = getEffectiveColor(rawC1);
    const c2 = getEffectiveColor(rawC2);

    const isOpposite = OPPOSITE_COLORS[c1] === c2;

    if (isOpposite) {
        console.log(`❌ ${edge.name}: ${rawC1}/${rawC2} (effective: ${c1}/${c2}) - OPPOSITE!`);
    }
}
