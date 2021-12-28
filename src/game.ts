import * as utils from '@dcl/ecs-scene-utils'
import { Arissa } from './arissa'

// Base
//const base = new Entity()
//base.addComponent(new GLTFShape('models/baseGrass.glb'))
//engine.addEntity(base)

// Arissa
const arissa = new Arissa(
  new GLTFShape('models/arissa.glb'),
  new Transform({
    position: new Vector3(0, 0.05, -0.1),
    scale: new Vector3(0, 0, 0),
  })
)
arissa.setParent(Attachable.AVATAR)

//let box = new Entity()
//box.addComponent(
//  new Transform({
//    position: new Vector3(8, 0, 10.5),
//    scale: new Vector3(16, 0, 11),
//  })
//)
//
//box.addComponent(new BoxShape())
//
////Create material and configure its fields
//const myMaterial = new Material()
//myMaterial.albedoColor = Color3.Blue()
//myMaterial.metallic = 0.9
//myMaterial.roughness = 0.1
//
////Assign the material to the entity
//box.addComponent(myMaterial)
//
//engine.addEntity(box)
//
//// Hide avatars
//const hideAvatarsEntity = new Entity()
//hideAvatarsEntity.addComponent(
//  new AvatarModifierArea({
//    area: { box: new Vector3(16, 4, 11) },
//    modifiers: [AvatarModifiers.HIDE_AVATARS],
//  })
//)
//hideAvatarsEntity.addComponent(
//  new Transform({ position: new Vector3(8, 2, 10.5) })
//)
//engine.addEntity(hideAvatarsEntity)
//
//// Create to show Arissa avatar
//hideAvatarsEntity.addComponent(
//  new utils.TriggerComponent(
//    new utils.TriggerBoxShape(new Vector3(16, 4, 11), Vector3.Zero()),
//    {
//      onCameraEnter: () => {
//        arissa.getComponent(Transform).scale.setAll(1)
//      },
//      onCameraExit: () => {
//        arissa.getComponent(Transform).scale.setAll(0)
//      },
//    }
//  )
//)

// Check if player is moving
let currentPosition = new Vector3()

class CheckPlayerIsMovingSystem implements ISystem {
  update() {
    if (currentPosition.equals(Camera.instance.position)) {
      arissa.playIdle()
    } else {
      currentPosition.copyFrom(Camera.instance.position)
      arissa.playRunning()
    }
  }
}
engine.addSystem(new CheckPlayerIsMovingSystem())



const point1 = new Vector3(1, 1, 1)
const point2 = new Vector3(8, 1, 3)
const point3 = new Vector3(8, 4, 7)
const point4 = new Vector3(1, 1, 7)

const myPath = new Path3D([point1, point2, point3, point4])

@Component("pathData")
export class PathData {
  origin: Vector3 = myPath.path[0]
  target: Vector3 = myPath.path[1]
  fraction: number = 0
  nextPathIndex: number = 1
}

export class PatrolPath implements ISystem {
  update(dt: number) {
    let transform = myEntity.getComponent(Transform)
    let path = myEntity.getComponent(PathData)
    if (path.fraction < 1) {
      transform.position = Vector3.Lerp(path.origin, path.target, path.fraction)
      path.fraction += dt / 6
    } else {
      path.nextPathIndex += 1
      if (path.nextPathIndex >= myPath.path.length) {
        path.nextPathIndex = 0
      }
      path.origin = path.target
      path.target = myPath.path[path.nextPathIndex]
      path.fraction = 0
    }
  }
}

engine.addSystem(new PatrolPath())

const myEntity = new Entity()

myEntity.addComponent(
  new AvatarModifierArea({
    area: { box: new Vector3(2, 2, 2) },
    modifiers: [AvatarModifiers.HIDE_AVATARS],
  })
)

myEntity.addComponent(new Transform())
myEntity.addComponent(new BoxShape())
myEntity.addComponent(new PathData())

// Create to show Arissa avatar
myEntity.addComponent(
  new utils.TriggerComponent(
    new utils.TriggerBoxShape(
			new Vector3(2,2,2),
			Vector3.Zero()
		),
    {
      onCameraEnter: () => {
        arissa.getComponent(Transform).scale.setAll(1)
      },
      onCameraExit: () => {
        arissa.getComponent(Transform).scale.setAll(0)
      },
    }
  )
)

engine.addEntity(myEntity)

