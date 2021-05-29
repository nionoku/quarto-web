export class GameController {
  /**
   * @private
   * @type {Array<{ player: number, marker: THREE.Object3D }>}
   */
  players

  /**
   * @private
   */
  _currentPlayer = 0

  /**
   * @param {Array<THREE.Object3D>} players
   */
  constructor (players) {
    this.players = players.map((it, index) => ({
      player: index,
      marker: it
    }))
  }

  nextTurn () {
    this._currentPlayer++
  }

  get currentPlayer () {
    return this.players[this._currentPlayer]
  }

  get nextPlayer () {
    const nextPlayerIndex = this._currentPlayer + 1 > 1 ? 0 : 1
    return this.players[nextPlayerIndex]
  }
}
