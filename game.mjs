// Move validation and battle outcomes adapted from Ben Letchford's MIT-licensed
// stratego.io (src/game_logic.rs, c4de75b). See the distributed license notice.

export const size = 10;
export const red = 'red';
export const blue = 'blue';
export const other = (side) => side === red ? blue : red;
export const names = {
  10: 'Marshal', 9: 'General', 8: 'Colonel', 7: 'Major', 6: 'Captain',
  5: 'Lieutenant', 4: 'Sergeant', 3: 'Miner', 2: 'Scout', 1: 'Spy', B: 'Bomb', F: 'Flag',
};
const army = [[10, 1], [9, 1], [8, 2], [7, 3], [6, 4], [5, 4], [4, 4], [3, 5], [2, 8], [1, 1], ['B', 6]]
  .flatMap(([rank, count]) => Array(count).fill(rank));
const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
export const lake = '#';
export const movable = (piece) => piece && piece !== lake && typeof piece.rank === 'number';
export const coordinate = (i) => String.fromCharCode(65 + i % size) + (size - Math.floor(i / size));

function shuffled(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function newGame() {
  const board = Array(size * size).fill(null);
  for (const i of [42, 43, 46, 47, 52, 53, 56, 57]) board[i] = lake;
  for (const [side, offset] of [[red, 60], [blue, 0]]) {
    const ranks = shuffled(army);
    // Keep the flag back and give each army at least one open first move.
    const flagSquare = (side === red ? 30 : 0) + Math.floor(Math.random() * size);
    ranks.splice(flagSquare, 0, 'F');
    const flank = side === red ? 0 : 30;
    const front = [0, 1, 4, 5, 8, 9].map(x => x + flank);
    if (!front.some(i => typeof ranks[i] === 'number')) {
      const spare = ranks.findIndex(rank => typeof rank === 'number');
      [ranks[front[0]], ranks[spare]] = [ranks[spare], ranks[front[0]]];
    }
    ranks.forEach((rank, i) => { board[offset + i] = { rank, side, id: offset + i }; });
  }
  return { board, turn: red, winner: null, reason: null, last: null, repeat: {} };
}

export function legalMoves(game, from) {
  const piece = game.board[from];
  if (game.winner || !movable(piece) || piece.side !== game.turn) return [];
  const result = [];
  const row = Math.floor(from / size);
  const col = from % size;
  const repeated = game.repeat[piece.side];
  for (const [dy, dx] of directions) {
    for (let n = 1; n <= (piece.rank === 2 ? size - 1 : 1); n++) {
      const y = row + dy * n;
      const x = col + dx * n;
      if (x < 0 || y < 0 || x >= size || y >= size) break;
      const to = y * size + x;
      const target = game.board[to];
      if (target === lake || target?.side === piece.side) break;
      if (!(repeated?.id === piece.id && repeated.count >= 3 &&
          repeated.to === from && repeated.from === to)) result.push(to);
      if (target) break;
    }
  }
  return result;
}

export function battle(attacker, defender) {
  if (!defender) return 'move';
  if (defender.rank === 'F') return 'flag';
  if (defender.rank === 'B') return attacker.rank === 3 ? 'win' : 'lose';
  if (attacker.rank === defender.rank) return 'tie';
  return ((attacker.rank === 1 && defender.rank === 10) || attacker.rank > defender.rank) ? 'win' : 'lose';
}

export function play(game, from, to) {
  if (!legalMoves(game, from).includes(to)) return false;
  const attacker = game.board[from];
  const defender = game.board[to];
  const outcome = battle(attacker, defender);
  const previous = game.repeat[attacker.side];
  game.repeat[attacker.side] = {
    id: attacker.id, from, to,
    count: previous?.id === attacker.id && previous.to === from && previous.from === to ? previous.count + 1 : 1,
  };
  game.board[from] = null;
  if (outcome === 'tie') game.board[to] = null;
  else if (outcome !== 'lose') game.board[to] = attacker;
  game.last = { from, to, attacker, defender, outcome };
  game.turn = other(attacker.side);
  if (outcome === 'flag' || !game.board.some((_, i) => legalMoves(game, i).length)) {
    game.winner = attacker.side;
    game.reason = outcome === 'flag' ? 'flag' : 'blocked';
  }
  return true;
}
