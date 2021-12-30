const sceneMessageBus = new MessageBus();
import * as utils from '@dcl/ecs-scene-utils'
import { Arissa } from './arissa'

sceneMessageBus.on("hoverMove", (info) => {
  log(info)
  arissa.getComponent(Transform).scale.setAll(1)

  //sceneMessageBus.emit(`hoverMove`, {
  //  index: this.boards.indexOf(this.actived),
  //  position: this.actived.getComponent(Transform).position,
  //});

  //let newCube = new Entity()
  //let transform = new Transform()
  ////transform.position.set(info.position.x, info.position.y, info.position.z)
  //transform.position.set(4,1,4)
  //newCube.addComponent(transform)
  //engine.addComponent(newCube)
})

//////// LOG PLAYER POSITION

Input.instance.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, true, (e) => {
  log(`pos: `, Camera.instance.position)
  log(`rot: `, Camera.instance.rotation)
})

// Base
const base = new Entity()
base.addComponent(new GLTFShape('models/baseGrass.glb'))
engine.addEntity(base)

// zone
const zone = new Entity()
zone.addComponent(new PlaneShape())
zone.addComponent(
  new Transform({
    position: new Vector3(16, 4, 11),
  })
)
zone.addComponent(
  new Transform({ position: new Vector3(8, 2, 10.5) })
)

//Create material and configure its fields
const myMaterial = new Material()
myMaterial.albedoColor = Color3.Blue()
myMaterial.metallic = 0.9
myMaterial.roughness = 0.1

//Assign the material to the entity
zone.addComponent(myMaterial)
engine.addEntity(zone)

// Arissa
const arissa = new Arissa(
  new GLTFShape('models/arissa.glb'),
  new Transform({
    position: new Vector3(0, 0.05, -0.1),
    scale: new Vector3(0, 0, 0),
  })
)
arissa.setParent(Attachable.AVATAR)

// a system to carry out the movement
//export class LerpMove implements ISystem {
//  update(dt: number) {
//    let transform = hideAvatarsEntity.getComponent(Transform)
//    let lerp = hideAvatarsEntity.getComponent(LerpData)
//    if (lerp.fraction < 1) {
//      transform.position = Vector3.Lerp(lerp.origin, lerp.target, lerp.fraction)
//      lerp.fraction += dt / 6
//    }
//  }
//}

// Hide avatars
const hideAvatarsEntity = new Entity()
hideAvatarsEntity.addComponent(
  new AvatarModifierArea({
    area: { box: new Vector3(16, 4, 11) },
    modifiers: [AvatarModifiers.HIDE_AVATARS],
  })
)
hideAvatarsEntity.addComponent(
  new Transform({ position: new Vector3(8, 2, 10.5) })
)
engine.addEntity(hideAvatarsEntity)

// Create to show Arissa avatar
hideAvatarsEntity.addComponent(
  new utils.TriggerComponent(
    new utils.TriggerBoxShape(new Vector3(16, 4, 11), Vector3.Zero()),
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

