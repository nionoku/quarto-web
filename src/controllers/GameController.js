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

  /**
   * @param {Array<Array<Array<string>>>} array
   */
  checkRowByAttr (array) {
    return array.some(row =>
      row.every(signs => signs.length === 4) && row.every(signs =>
        signs.some((sign, i) => row.every(it => sign === it[i]))
      )
    )
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

  /** @returns {boolean} */
  get hasPlayerWin () {
    [
      [
        this.board[0],
        this.board[5],
        this.board[10],
        this.board[15]
      ]
    ]

    /** @type {Array<Array<Array<string>>>} */
    const itemsByRows = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => []))

    /** @type {Array<Array<Array<string>>>} */
    const itemsByColumns = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => []))

    /** @type {Array<Array<Array<string>>>} */
    const itemsByDiag = Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => []))
    // fill items by row, by columns and by diagonal for check win combination by attributes
    for (let i = 0; i < this.boardLength / 4; i++) {
      for (let j = 0; j < this.boardLength / 4; j++) {
        itemsByRows[i][j].push(...this.board[i * (this.boardLength / 4) + j])
        itemsByColumns[i][j].push(...this.board[j * (this.boardLength / 4) + i])
      }

      itemsByDiag[0][i].push(...this.board[i * 5])
      itemsByDiag[1][i].push(...this.board[i * 3 + 3])
    }

    return [
      this.checkRowByAttr(itemsByRows),
      this.checkRowByAttr(itemsByColumns),
      this.checkRowByAttr(itemsByDiag)
    ].some(it => it)
  }
}
