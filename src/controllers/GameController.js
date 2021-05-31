export class GameController {
  /** @readonly */
  boardLength = 4 * 4

  /**
   * @private
   * @type {Array<Array<string>>}
   */
  board = Array.from({ length: this.boardLength }, () => [])

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

  /**
   * @param {string} figureName
   * @param {number} cell
   */
  setFigureOnBoard (figureName, cell) {
    this.board[cell] = figureName.split('')
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

  get hasPlayerWin () {
    console.log(this.board)

    for (let i = 0; i < this.boardLength / 4; i++) {
      for (let j = 0; j < this.boardLength / 4; j++) {
        for (let k = 0; i < this.boardLength / 4; k++) {
          // TODO (2021.05.31): Implement check win
        }
      }
    }

    return false
  }
}
