import React, { useRef } from 'react'
import * as THREE from 'three/src/Three'
import { useRender } from 'react-three-fiber'

const DASH_OFFSET_DELTA = 0.005

const SprinklerLine = ({ id, totalLines }) => {
  const material = useRef()
  const color = new THREE.Color(0xff0000)
  color.g = id / totalLines
  const width = 0.05
  const ratio = 0.95

  const numPoints = 10
  const radius = 0.75

  const vertices = []

  let turtle = new THREE.Vector3(0, 0, 0)
  for (let i = 0; i < numPoints; ++i) {
    const phi = THREE.Math.mapLinear(id, 0, totalLines, 0, Math.PI * 2)
    const theta = THREE.Math.mapLinear(i, 0, numPoints, 0, Math.PI * 2)
    let x = radius * Math.sin(theta) * Math.cos(phi)
    let y = radius * Math.sin(theta) * Math.sin(phi)
    let z = radius * Math.cos(theta)
    turtle.add(new THREE.Vector3(x, y, z))

    vertices.push(turtle.clone())
  }

  useRender(() => (material.current.uniforms.dashOffset.value -= DASH_OFFSET_DELTA))

  return (
    <mesh>
      <meshLine attach="geometry" vertices={vertices} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        lineWidth={width}
        color={color}
        dashArray={0.2}
        dashRatio={ratio}
      />
    </mesh>
  )
}

const Sprinkler = () => {
  const group = useRef()
  let theta = 0
  const numLines = 20
  const lines = new Array(numLines).fill()

  useRender(() => {
    const rotation = 5 * Math.sin(THREE.Math.degToRad((theta += 0.02)))
    group.current.rotation.set(0, 0, rotation)
  })

  return (
    <group ref={group}>{lines.map((_, index) => <SprinklerLine key={index} id={index} totalLines={numLines} />)}</group>
  )
}

export { Sprinkler }
