import utils from "../node_modules/decentraland-ecs-utils/index"
import { Arissa } from "./arissa"

// Base
const base = new Entity()
base.addComponent(new GLTFShape("models/baseGrass.glb"))
engine.addEntity(base)

// Arissa
const arissa = new Arissa(new GLTFShape("models/arissa.glb"), new Transform({ position: new Vector3(0, 0.05, -0.10), scale: new Vector3(0, 0, 0)}))
arissa.setParent(Attachable.AVATAR)

// Hide avatars
const hideAvatarsEntity = new Entity()
hideAvatarsEntity.addComponent(new AvatarModifierArea({ area: { box: new Vector3(16, 4, 11) }, modifiers: [AvatarModifiers.HIDE_AVATARS] }))
hideAvatarsEntity.addComponent(new Transform({ position: new Vector3(8, 2, 10.5) }))
engine.addEntity(hideAvatarsEntity)

// Create to show Arissa avatar
hideAvatarsEntity.addComponent(
  new utils.TriggerComponent(
    new utils.TriggerBoxShape(new Vector3(16, 4, 11), Vector3.Zero()), 
    null, null, null, null,
    () => { arissa.getComponent(Transform).scale.setAll(1) },
    () => { arissa.getComponent(Transform).scale.setAll(0) }
  )
)

// Check if player is moving
let currentPosition = new Vector3()

class CheckPlayerIsMovingSystem implements ISystem {
  update() {
    if(currentPosition.equals(Camera.instance.position)) {
      arissa.playIdle()
    } else {
      currentPosition.copyFrom(Camera.instance.position)
      arissa.playRunning()
    }
  }
}
engine.addSystem(new CheckPlayerIsMovingSystem())
