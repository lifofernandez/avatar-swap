// const sceneMessageBus = new MessageBus();
// import * as utils from '@dcl/ecs-scene-utils'
// import { Arissa } from './arissa'
// 
// // Arissa
// const arissa = new Arissa(
//   new GLTFShape('models/arissa.glb'),
//   new Transform({
//     position: new Vector3(0, 0.05, -0.1),
//     scale: new Vector3(0, 0, 0),
//   })
// )
// arissa.setParent(Attachable.AVATAR)
// 
// // Check if player is moving
// let currentPosition = new Vector3()
// 
// class CheckPlayerIsMovingSystem implements ISystem {
//   update() {
//     if (currentPosition.equals(Camera.instance.position)) {
//       arissa.playIdle()
//     } else {
//       currentPosition.copyFrom(Camera.instance.position)
//       arissa.playRunning()
//     }
//   }
// }
// engine.addSystem(new CheckPlayerIsMovingSystem())


// // Move System
// // https://docs.decentraland.org/development-guide/move-entities/#follow-a-path
// const point1 = new Vector3(1, 1, 1)
// const point2 = new Vector3(8, 1, 3)
// const point3 = new Vector3(8, 4, 7)
// const point4 = new Vector3(1, 1, 7)
// 
// const myPath = new Path3D([point1, point2, point3, point4])
// 
// @Component("pathData")
// export class PathData {
//   origin: Vector3 = myPath.path[0]
//   target: Vector3 = myPath.path[1]
//   fraction: number = 0
//   nextPathIndex: number = 1
// }
// 
// export class PatrolPath implements ISystem {
//   update(dt: number) {
//     let transform = avatarSwaper.getComponent(Transform)
//     let path = avatarSwaper.getComponent(PathData)
//     if (path.fraction < 1) {
//       transform.position = Vector3.Lerp(path.origin, path.target, path.fraction)
//       path.fraction += dt / 6
//     } else {
//       path.nextPathIndex += 1
//       if (path.nextPathIndex >= myPath.path.length) {
//         path.nextPathIndex = 0
//       }
//       path.origin = path.target
//       path.target = myPath.path[path.nextPathIndex]
//       path.fraction = 0
//     }
//   }
// }
// 
// engine.addSystem(new PatrolPath())


// const avatarSwaper = new Entity()
// 
// // Hide original avatar
// avatarSwaper.addComponent(
//   new AvatarModifierArea({
//     area: { box: new Vector3(2, 2, 2) },
//     modifiers: [AvatarModifiers.HIDE_AVATARS],
//   })
// )
// 
// avatarSwaper.addComponent(new Transform())
// avatarSwaper.addComponent(new BoxShape())
// avatarSwaper.getComponent(BoxShape).withCollisions = false
// // avatarSwaper.addComponent(new PathData())
// 
// // Create to show Custom avatar
// // https://docs.decentraland.org/development-guide/utils/#triggers
// avatarSwaper.addComponent(
//   new utils.TriggerComponent(
//     new utils.TriggerBoxShape(
// 			new Vector3(2,2,2),
// 			Vector3.Zero()
// 		),
//     {
//       onCameraEnter: () => {
//         arissa.getComponent(Transform).scale.setAll(1)
//       },
//       onCameraExit: () => {
//         arissa.getComponent(Transform).scale.setAll(0)
//       },
//     }
//   )
// )
// 
// engine.addEntity(avatarSwaper)
// 
// 
// 
// 
