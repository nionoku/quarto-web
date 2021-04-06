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
  CylinderGeometry
} from 'three'
import figuresDescription from '../../assets/descriptions/figures.json'
import lightsDescription from '../../assets/descriptions/lights.json'
import sceneDescription from '../../assets/descriptions/scene.json'
import cameraDescription from '../../assets/descriptions/camera.json'
import boardDescription from '../../assets//descriptions/board.json'
import playersDescription from '../../assets/descriptions/players.json'

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

  // watch resize window
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.fov = calcFov(container)
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })

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
 * @returns {Promise<THREE.Mesh>}
 */
async function loadBoard () {
  const loader = new STLLoader()

  const material = new MeshPhongMaterial({ color: new Color(boardDescription.color) })
  const mesh = new Mesh(await loader.loadAsync('assets/models/board.stl'), material)

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
  return boardDescription.cells.map(cell => {
    const geometry = new CylinderGeometry(1, 1, 0.2, 50, 1)
    const material = new MeshPhongMaterial({ color: new Color(cell.color) })
    const mesh = new Mesh(geometry, material)

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
  return playersDescription.map(player => {
    const geometry = new CylinderGeometry(1, 1, 0.2, 50, 1)
    const material = new MeshPhongMaterial({ color: new Color(player.marker.color) })
    const mesh = new Mesh(geometry, material)

    material.transparent = true
    material.opacity = 0.7

    mesh.position.set(
      player.marker.position.x,
      player.marker.position.y,
      player.marker.position.z
    )

    return mesh
  })
}
