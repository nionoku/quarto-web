export class FiguresController {
  /** @private */
  _isLocked = false

  /**
   * @private
   * @type {THREE.Object3D | null}
   */
  selected = null

  /**
   * @private
   * @type {Array<THREE.Object3D>}
   */
  figures = []

  /**
   * @param {Array<THREE.Object3D>} figures
   */
  constructor (figures) {
    this.figures = figures
  }

  /**
   * @param {string?} name
   * @returns {void}
   */
  selectFigure (name) {
    this.selected = this.figures.find(it => it.name === name) ?? null
  }

  releaseFigure () {
    this.selectFigure(null)
  }

  lockFiguresSelector () {
    this._isLocked = true
  }

  releaseFiguresSelector () {
    this._isLocked = false
  }

  /**
   * @param {string} name
   * @returns {void}
   */
  removeFigure (name) {
    this.figures.splice(this.figures.findIndex(it => it.name === name), 1)
  }

  /**
   * @returns {THREE.Object3D | null}
   */
  get selectedFigure () {
    return this.selected
  }

  get isLocked () {
    return this._isLocked
  }
}
