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
   * @type {((figure: THREE.Object3D) => void)?}
   */
  onSelectFigure

  /**
   * @type {((figure: THREE.Object3D) => void)?}
   */
  onUnselectFigure

  /**
   * @param {Array<THREE.Object3D>} figures
   * @param {((figure: THREE.Object3D) => void)?} onSelectFigure
   * @param {((figure: THREE.Object3D) => void)?} onUnselectFigure
   */
  constructor (figures, onSelectFigure, onUnselectFigure) {
    this.figures = figures
    this.onSelectFigure = onSelectFigure
    this.onUnselectFigure = onUnselectFigure
  }

  /**
   * @param {string?} name
   * @returns {void}
   */
  selectFigure (name) {
    // unselect previuse figure
    if (this.selected) {
      if (this.onUnselectFigure) {
        this.onUnselectFigure(this.selected)
      }

      this.selected = null
    }

    this.selected = this.figures.find(it => it.name === name) ?? null

    if (this.selected && this.onSelectFigure) {
      this.onSelectFigure(this.selected)
    }
  }

  lockFiguresSelector () {
    this._isLocked = true
  }

  releaseFiguresSelector () {
    this._isLocked = false
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
