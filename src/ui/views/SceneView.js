import { onMount } from 'svelte'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
  WebGLRenderer,
  sRGBEncoding,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  Color
} from 'three'
import figuresDescription from '../../assets/figures.json'
import lightsDescription from '../../assets/lights.json'
import sceneDescription from '../../assets/scene.json'
import cameraDescription from '../../assets/camera.json'
import boardDescription from '../../assets/board.json'
import playersDescription from '../../assets/players.json'

/**
 * @type {HTMLDivElement}
 * @readonly
 */
let container

onMount(() => {
  const fps = 30
  const renderer = makeRenderer(container)
  const camera = makeCamera(container)
  const controls = makeControls(camera, renderer.domElement)
  const scene = makeScene()

  // watch resize window
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.fov = calcFov(container)
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })
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
