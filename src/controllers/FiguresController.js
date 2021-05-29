export class FiguresController {
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
  setSelected (name) {
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

  /**
   * @returns {THREE.Object3D | null}
   */
  get selectedFigure () {
    return this.selected
  }
}
