import { onMount } from 'svelte'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import {
  WebGLRenderer,
  sRGBEncoding,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  Color,
  Mesh,
  MeshPhongMaterial,
  DirectionalLight,
  CylinderGeometry,
  Vector2,
  Raycaster
} from 'three'
import figuresDescription from '../../assets/descriptions/figures.json'
import lightsDescription from '../../assets/descriptions/lights.json'
import sceneDescription from '../../assets/descriptions/scene.json'
import cameraDescription from '../../assets/descriptions/camera.json'
import boardDescription from '../../assets//descriptions/board.json'
import playersDescription from '../../assets/descriptions/players.json'
import { FiguresController } from '../../controllers/FiguresController'
import { GameController } from '../../controllers/GameController'

/**
 * @type {HTMLDivElement}
 * @readonly
 */
let container

onMount(async () => {
  const fps = 30
  const renderer = makeRenderer(container)
  const camera = makeCamera(container)
  const controls = makeControls(camera, renderer.domElement)
  const scene = makeScene()
  const raycaster = new Raycaster()

  const mousePosition = new Vector2(-100, 100)

  // make lights
  const lights = makeLights()
  // load board
  const board = await loadBoard()
  // make board cells
  const boardCells = makeBoardCells()
  // load figures
  const figures = await loadFigures()
  // make players markers
  const playersMarkers = makePlayersMarkers()

  // init figures controller
  const figuresController = new FiguresController(figures)
  // init quarto game controller
  const gameController = new GameController(playersMarkers)

  // watch resize window
  window.addEventListener('resize', event => {
    event.preventDefault()

    camera.aspect = window.innerWidth / window.innerHeight
    camera.fov = calcFov(container)
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

  // watch cursor position
  renderer.domElement.addEventListener('mousemove', event => {
    event.preventDefault()

    mousePosition.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1
    mousePosition.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
  })

  // add on mouse click listener
  renderer.domElement.addEventListener('click', event => {
    event.preventDefault()

    onMouseClickIntersect(raycaster, mousePosition, camera, scene, figuresController, gameController)
  })

  // add lights on scene
  scene.add(...lights)
  // add board on scene
  scene.add(board)
  // add board cells on scene
  scene.add(...boardCells)
  // add figures on board
  scene.add(...figures)
  // add players markers
  scene.add(...playersMarkers)
  // add renderer on screen
  container.appendChild(renderer.domElement)

  const render = function () {
    // update controls
    controls.update()
    // render scene
    renderer.render(scene, camera)
  }

  const animate = function () {
    // set fps
    setTimeout(() => {
      requestAnimationFrame(animate)
    }, 1000 / fps)
    // render function
    render()
  }

  animate()
})

/**
 * @param {HTMLElement} container
 * @returns {THREE.Renderer}
 */
function makeRenderer (container) {
  const renderer = new WebGLRenderer({ antialias: true })
  renderer.outputEncoding = sRGBEncoding
  renderer.toneMapping = NoToneMapping
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)

  return renderer
}

/**
 * @param {HTMLElement} container
 * @returns {PerspectiveCamera}
 */
function makeCamera (container) {
  const fov = calcFov(container)
  const aspect = container.clientWidth / container.clientHeight
  const near = cameraDescription.near
  const far = cameraDescription.far

  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(
    cameraDescription.position.x,
    cameraDescription.position.y,
    cameraDescription.position.z
  )

  camera.rotation.set(
    cameraDescription.rotation.x,
    cameraDescription.rotation.y,
    cameraDescription.rotation.z
  )

  return camera
}

/**
 * @returns {THREE.Scene}
 */
function makeScene () {
  const scene = new Scene()
  scene.background = new Color(sceneDescription.background)

  return scene
}

/**
 *
 * @param {THREE.Camera} camera
 * @param {HTMLCanvasElement} canvas
 * @returns {OrbitControls}
 */
function makeControls (camera, canvas) {
  const controls = new OrbitControls(camera, canvas)
  controls.enableRotate = true
  // controls.minPolarAngle = 0
  // controls.maxPolarAngle = Math.PI / 3
  // controls.enableDamping = true

  return controls
}

/**
 * @param {HTMLElement} container
 * @returns {number}
 */
function calcFov (container) {
  const a = container.clientHeight / container.clientWidth
  return Math.pow(a, 2) + cameraDescription.fov.ceed * a + cameraDescription.fov.min
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Vector2} position
 * @param {THREE.Camera} camera
 * @param {THREE.Scene} scene
 */
function onMouseMoveIntersect (raycaster, position, camera, scene) {
  throw new Error('Not implemented')
}

/**
 * @param {THREE.Raycaster} raycaster
 * @param {THREE.Vector2} position
 * @param {THREE.Camera} camera
 * @param {THREE.Scene} scene
 * @param {FiguresController} figuresController
 * @param {GameController} gameController
 */
function onMouseClickIntersect (raycaster, position, camera, scene, figuresController, gameController) {
  try {
    raycaster.setFromCamera(position, camera)

    const intersects = raycaster.intersectObjects(scene.children)

    // on figure intersect
    if (intersects[0].object.name.match(/[DL][CS][BS][FH]/)) {
      onFigureClick(intersects[0].object, figuresController, gameController)
      // on board cell intersect
    } else if (intersects[0].object.name.match(/cell_[\d]+/)) {
      onBoardCellClick(intersects[0].object, figuresController, gameController)
      // on player marker intersect
    } else if (intersects[0].object.name.match(/player_marker_[\d]/)) {
      console.log('is intersect player marker')
      // on board intersect
    } else if (intersects[0].object.name.match(/board/)) {
      console.log('is intersect board')
    }
  } catch (err) {
    onMissClick(figuresController)
  }
}

/**
 * @param {THREE.Object3D} figure
 * @param {FiguresController} figuresController
 * @param {GameController} gameController
 */
function onFigureClick (figure, figuresController, gameController) {
  /**
   * @param {THREE.Object3D} figure
   */
  function onSelectFigure (figure) {
    figure.position.y = 0.7
  }

  /**
   * @param {THREE.Object3D} figure
   */
  function onReleaseFigure (figure) {
    figure.position.y = 0
  }

  if (!figuresController.isLocked) {
    // break function if clicked by already selected figure
    if (figuresController.selectedFigure && figure.name === figuresController.selectedFigure.name) {
      // set figure for next player
      figuresController.selectedFigure.position.set(
        gameController.nextPlayer.marker.position.x,
        gameController.nextPlayer.marker.position.y,
        gameController.nextPlayer.marker.position.z
      )
      // lock figures selector until previuse figure not be placed
      figuresController.lockFiguresSelector()

      return
    }

    // set selected new figure
    figuresController.selectFigure(figure.name)

    if (figuresController.selectedFigure) {
      onSelectFigure(figuresController.selectedFigure)
    }
  }
}

/**
 * @param {THREE.Object3D} cell
 * @param {FiguresController} figuresController
 * @param {GameController} gameController
 */
function onBoardCellClick (cell, figuresController, gameController) {
  if (figuresController.isLocked && figuresController.selectedFigure) {
    // set figure on board cell
    figuresController.selectedFigure.position.set(
      cell.position.x,
      cell.position.y,
      cell.position.z
    )
    // release figure
    figuresController.selectFigure(null)
    // TODO (2021.05.29): Remove placed figure from figures collection
    // release other figures
    figuresController.releaseFiguresSelector()
    // set next turn
    gameController.nextTurn()
  }
}

/**
 * @param {FiguresController} figuresController
 */
function onMissClick (figuresController) {
  if (!figuresController.isLocked) {
    figuresController.selectFigure(null)
  }
}

/**
 * @returns {Promise<THREE.Mesh>}
 */
async function loadBoard () {
  const loader = new STLLoader()

  const material = new MeshPhongMaterial({ color: new Color(boardDescription.color) })
  const mesh = new Mesh(await loader.loadAsync('assets/models/board.stl'), material)

  mesh.name = 'board'
  mesh.scale.set(boardDescription.scale, boardDescription.scale, boardDescription.scale)
  mesh.position.set(boardDescription.position.x, boardDescription.position.y, boardDescription.position.z)
  mesh.rotation.set(-Math.PI / 2, 0, 0)

  return mesh
}

/**
 * @returns {Promise<Array<THREE.Mesh>>}
 */
async function loadFigures () {
  const loader = new STLLoader()

  const promisedMeshes = figuresDescription.map(async figure => {
    const material = new MeshPhongMaterial({ color: new Color(figure.color) })
    const mesh = new Mesh(
      await loader.loadAsync(`./assets/models/${figure.name}.stl`),
      material
    )

    mesh.name = figure.name
    mesh.scale.set(figure.scale, figure.scale, figure.scale)
    mesh.position.set(figure.position.x, figure.position.y, figure.position.z)
    mesh.rotation.set(-Math.PI / 2, 0, 0)

    return mesh
  })

  return Promise.all(promisedMeshes)
}

/**
 * @returns {Array<THREE.Light>}
 */
function makeLights () {
  return lightsDescription.map(it => {
    /**
     * @type {THREE.Light}
     */
    let light

    switch (it.type) {
      case 'directional_light': {
        light = new DirectionalLight(new Color(it.color), it.intensity)
        break
      }

      default: {
        throw new Error('Incorrect light config')
      }
    }

    light.position.set(it.position.x, it.position.y, it.position.z)

    return light
  })
}

/**
 * @returns {Array<THREE.Mesh>}
 */
function makeBoardCells () {
  return boardDescription.cells.map((cell, index) => {
    const geometry = new CylinderGeometry(
      boardDescription.cell.radius_top,
      boardDescription.cell.radius_bottom,
      boardDescription.cell.height,
      boardDescription.cell.radial_segment,
      boardDescription.cell.height_segment
    )
    const material = new MeshPhongMaterial({ color: new Color(cell.color) })
    const mesh = new Mesh(geometry, material)

    mesh.name = `cell_${index}`

    mesh.position.set(
      cell.position.x,
      cell.position.y,
      cell.position.z
    )

    return mesh
  })
}

/**
 * @returns {Array<THREE.Mesh>}
 */
function makePlayersMarkers () {
  return playersDescription.players.map((player, index) => {
    const geometry = new CylinderGeometry(
      playersDescription.marker.radius_top,
      playersDescription.marker.radius_bottom,
      playersDescription.marker.height,
      playersDescription.marker.radial_segment,
      playersDescription.marker.height_segment
    )
    const material = new MeshPhongMaterial({ color: new Color(player.marker.color) })
    const mesh = new Mesh(geometry, material)

    material.transparent = true
    material.opacity = 0

    mesh.name = `player_marker_${index}`

    mesh.position.set(
      player.marker.position.x,
      player.marker.position.y,
      player.marker.position.z
    )

    return mesh
  })
}
