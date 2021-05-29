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
   * @private
   */
  _currentTurn = 0

  /**
   * @type {((player: number, turn: number) => void)?}
   */
  onTurn = null

  /**
   * @param {Array<THREE.Object3D>} players
   */
  constructor (players) {
    this.players = players.map((it, index) => ({
      player: index,
      marker: it
    }))
  }

  /**
   * @param {((player: number, turn: number) => void)?} onTurn
   */
  setOnTurn (onTurn) {
    this.onTurn = onTurn
  }

  nextTurn () {
    this._currentPlayer = this._currentPlayer + 1 > 1 ? 0 : 1
    this._currentTurn++

    if (this.onTurn) {
      this.onTurn(this._currentPlayer, this._currentTurn)
    }
  }

  get currentPlayer () {
    return this.players[this._currentPlayer]
  }

  get nextPlayer () {
    const nextPlayerIndex = this._currentPlayer + 1 > 1 ? 0 : 1
    return this.players[nextPlayerIndex]
  }

  get currentTurn () {
    return this._currentTurn
  }
}
