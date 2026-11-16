# Rankfall Rules

The JavaScript rules module used by Rankfall, a two-player, pass-and-play strategy board game. It has no runtime dependencies.

- [Play Rankfall](https://rankfall.com/)
- [Read the rules](https://rankfall.com/rules/)
- [Look up the pieces and ranks](https://rankfall.com/pieces/)

game.mjs exports newGame for the randomized starting layout, legalMoves for move validation, battle for resolving an attack, and play for applying a move and detecting a winner. Squares use zero-based indices in row-major order. Rank 10 is the Marshal, B is a Bomb, and F is the Flag.

Move validation and combat are adapted from Ben Letchford's [stratego.io](https://github.com/benletchford/stratego.io) under the MIT License. See [LICENSE](LICENSE).

Rankfall is an independent project and is not affiliated with the original game publisher.
