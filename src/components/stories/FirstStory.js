import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { animated, useRender, extend, useThree } from 'react-three-fiber'
import { apply as applySpring } from 'react-spring/three'
import { StorySegment, ScrollingStory } from './ScrollingStory'
import { FiftyNote } from '../models/UkCurrency'
import { Nefertiti } from '../models/Nefertiti'
import { EnvironmentMap } from '../EnvironmentMap'
import { loadHDREnvironmentMap, loadEnvironmentMapUrls } from '../../util/Loaders'
import { getScrollableHeight } from '../../util/ScrollHelper'
import clock from '../../util/Clock'

import { withSong } from '../HoC/WithSong'
import { Rings } from '../sound-enabled/Rings'

import { MoireEffect } from '../MoireEffect'

import { EffectComposer } from '../../postprocessing/EffectComposer'
import { RenderPass } from '../../postprocessing/RenderPass'
import { GlitchPass } from '../../postprocessing/GlitchPass'
import { ShaderPass } from '../../postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { DrunkPass } from '../../postprocessing/DrunkPass'
import { Video } from '../Video'
import { VideoBackground } from '../VideoBackground'
import { FloatingSphereLights } from '../sound-enabled/FloatingSphereLights'

import { EnvironmentMapHDR } from '../EnvironmentMapHDR'
import { BaseController } from '../controllers/Base'

import { Glassblown } from '../lib/Glassblown'
import { FloatingSpaghetti } from '../lib/FloatingSpaghetti'
import { Sprinkler } from '../lib/Sprinkler'
import { SoundEnabledBackground } from '../sound-enabled/Background'
import { TwistingWaveField } from '../sound-enabled/TwistingWaveField'
import Background, { ShaderBackground } from '../Background'
import events from 'events'
import Player from '../../sound-player/Player'
import { ReturnToSender } from '../ReturnToSender'
import { FlippantSquares } from '../FlippantSquares'
import { VirtualTrack, VirtualTrackComponent, MovingCamera } from '../../MovingCamera/index'
import { WindCloth } from '../WindCloth'
import { AbstractPiano } from '../AbstractPiano'
import { FlippantHexagonGrid } from '../Hexagons/Hexagon'
import { AnimatedRing } from '../lib/AnimatedRing'
import { DEG_TO_RAD } from '../../util/Constants.js'
import { Clusters } from '../Clusters'
import { KickDrum } from '../midi-enabled/KickDrum'
import { HiHat } from '../midi-enabled/HiHat'
import { Bass } from '../midi-enabled/Bass'
import { Snare } from '../midi-enabled/Snare'
import { Lead } from '../midi-enabled/Lead'
import { VertexShader, FragmentShader } from '../../shaders/FirstStory'

applySpring({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass, EnvironmentMapHDR })
extend({ EffectComposer, RenderPass, GlitchPass, ShaderPass, DrunkPass })

const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()
  const glitchPassRef = useRef()
  useEffect(() => {
    composer.current.setSize(size.width, size.height)
  }, [size])

  useRender(() => {
    /*
    if (glitchPassRef.current) {
      const time = clock.getElapsedTime()
      const factor = THREE.Math.lerp(0.6, 0.0, time / 18)
      glitchPassRef.current.setFactor(factor)
    }
    */
    composer.current.render()
  }, true)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" name="passes" args={[scene, camera]} />
      <shaderPass
        attachArray="passes"
        args={[FXAAShader]}
        uniforms-resolution-value={[1 / size.width, 1 / size.height]}
      />
      {/*<glitchPass ref={glitchPassRef} attachArray="passes" factor={0.6} /> */}
      <DrunkPass factor={factor} shouldRenderToScreen={true} />
    </effectComposer>
  )
})

const TRACK = new VirtualTrack([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -5),
  new THREE.Vector3(2, 1, -10),
  new THREE.Vector3(5, 3, -11),
  new THREE.Vector3(7, 7, -15),
])

const LOOK_AT_TRACK = new VirtualTrack([
  new THREE.Vector3(0, 0, -5),
  new THREE.Vector3(1, 0, -10),
  new THREE.Vector3(3, 1, -11),
  new THREE.Vector3(6, 3, -11),
  new THREE.Vector3(8, 5, -13),
  new THREE.Vector3(10, 7, -15),
])

const MovingCameraComponent = () => {
  const { camera } = useThree()
  useRender(() => {
    let t = clock.getElapsedTime()
    //console.log(camera.position)
    camera.position.x = Math.sin(t * 0.25)
    camera.position.y = Math.cos(t * 0.25)
    camera.position.z = 5 + Math.cos(t * 0.1)
    camera.lookAt(0, 1.5, 0)
  })

  /*
  const movingCamera = new MovingCamera(camera, {
    lookAt: LOOK_AT_TRACK,
    camera: TRACK,
  })

*/
  return null
}

class FirstStory extends BaseController {
  constructor() {
    super()
    this.track = TRACK
    this.lookAtTrack = LOOK_AT_TRACK
    const songComponents = [
      <Rings
        amplitude={0}
        name="battery"
        position={[50, 0, 1.5]}
        waveformResolution={16}
        rotateX={Math.PI * 90}
        rotateY={0}
        rotateZ={0}
        size={18}
        hue={0.7}
        scale={0.35}
      />,
      <TwistingWaveField
        position={[-0.5, 0, 0]}
        rotation={[0, 0, 0]}
        waveformResolution={128}
        color={new THREE.Color(0xffff00)}
        opacity={1.0}
        name="piano"
      />,
    ]
    const Song = withSong(songComponents, 'sadette', 2)
    extend({ Song })
    this.Song = <Song />
  }

  CameraTrack = () => {
    return <VirtualTrackComponent path={this.track.trackSpline} />
  }

  LookAtTrack = () => {
    return <VirtualTrackComponent path={this.lookAtTrack.trackSpline} />
  }

  render() {
    const { top, renderer } = this.props

    const cubeTexture = loadEnvironmentMapUrls('daylight-bridge', [
      'posx.jpg',
      'negx.jpg',
      'posy.jpg',
      'negy.jpg',
      'posz.jpg',
      'negz.jpg',
    ])
    const pisaCubeTexture = loadEnvironmentMapUrls('pisa', ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])
    const hdrEnvMap = loadHDREnvironmentMap(
      'pisa-hdr',
      ['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'],
      renderer
    )
    const scrollMax = getScrollableHeight()
    /*
      <ShaderBackground
        vertexShader={VertexShader}
        fragmentShader={FragmentShader}
        color={top.interpolate(
          [0, scrollMax * 0.25, scrollMax * 0.33, scrollMax * 0.5, scrollMax],
          ['#fefefe', '#e0c919', '#504006', '#e32f01', '#333333']
        )}
      />
      */
    const BackgroundComponent = <Background color={0xfefefe} />

    const lightpos = [0, 3, 6]
    const wallColor = 0xffffff
    const walls = (
      <group>
        {/* L + R */}
        <mesh rotation={[0, Math.PI * 0.5, 0]} position={[-5, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} attach="geometry" />
          <meshPhongMaterial color={wallColor} attach="material" />
        </mesh>
        <mesh rotation={[0, Math.PI * -0.5, 0]} position={[5, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} attach="geometry" />
          <meshPhongMaterial color={wallColor} attach="material" />
        </mesh>
        {/* back */}
        <mesh position={[0, 0, -9.5]} receiveShadow>
          <planeGeometry args={[10, 10]} attach="geometry" />
          <meshPhongMaterial color={wallColor} attach="material" />
        </mesh>
        {/* T + B */}
        <mesh rotation={[Math.PI * 0.475, 0, 0]} position={[0, 5, 0]} receiveShadow>
          <planeGeometry args={[10, 20]} attach="geometry" />
          <meshPhongMaterial color={wallColor} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI * -0.475, 0, 0]} position={[0, -5, 0]} receiveShadow>
          <planeGeometry args={[10, 20]} attach="geometry" />
          <meshPhongMaterial color={wallColor} attach="material" />
        </mesh>
      </group>
    )

    // todo: implement mechanism for withSong that allows for cross-component
    // Player integration
    // see: https://tonejs.github.io/docs/13.8.25/Players
    return (
      <scene ref={this.sceneRef}>
        <group>
          {/*
          {this.CameraTrack()}
          {this.LookAtTrack()}
          */}
          <MovingCameraComponent />
          <ScrollingStory top={top} BackgroundComponent={BackgroundComponent}>
            <StorySegment>
              <KickDrum position={[0, 2.5, -4]} scale={12} rotateX={Math.PI * 0.5} numRings={32} size={48} />
              <KickDrum position={[0, 2.5, -3]} scale={1.5} rotateX={Math.PI * 0.5} numRings={32} size={48} />
              <HiHat />
              <Snare position={[0, 1, 0]} />
              <Bass position={[-1, -4, 1]} />
              <Lead position={[0, 2.5, -1.5]} />
              <group position={lightpos}>
                <pointLight color={0xffffff} castShadow intensity={1} />
                <mesh>
                  <boxGeometry attach="geometry" />
                  <meshBasicMaterial color={0xff0000} attach="material" />
                </mesh>
              </group>
            </StorySegment>
            <StorySegment>
              <AbstractPiano />
            </StorySegment>
            <StorySegment>
              <FlippantHexagonGrid
                position={[-1.0, 0.75, -0.25]}
                rotation={[-15 * DEG_TO_RAD, 0, -15 * DEG_TO_RAD]}
                dimensions={[2, 2]}
              />
              <FlippantHexagonGrid dimensions={[3, 3]} />
              <FlippantHexagonGrid
                position={[1.0, -0.75, 0.25]}
                rotation={[15 * DEG_TO_RAD, 0, 15 * DEG_TO_RAD]}
                dimensions={[4, 4]}
              />
            </StorySegment>
            {/*
            <StorySegment>
              <FloatingSphereLights boxDimensions={[6, 36, 6]} boxYPosition={-12} />
            </StorySegment>
            */}
          </ScrollingStory>
          <Effects factor={top.interpolate([0, 150], [0.8, 0.7])} />
        </group>
      </scene>
    )
  }
}

export { FirstStory }
