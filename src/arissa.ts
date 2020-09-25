export class Arissa extends Entity {
  constructor(model: GLTFShape, transform: Transform) {
    super()
    engine.addEntity(this)
    this.addComponent(model)
    this.addComponent(transform)

    this.addComponent(new Animator())
    this.getComponent(Animator).addClip(new AnimationState("Running", { looping: true }))
    this.getComponent(Animator).addClip(new AnimationState("Idle", { looping: true }))
  }
  // Play running animation
  playRunning() {
    this.stopAnimations()
    this.getComponent(Animator).getClip("Running").play()
  }

  // Play idle animation
  playIdle() {
    this.stopAnimations()
    this.getComponent(Animator).getClip("Idle").play()
  }

  // Bug workaround: otherwise the next animation clip won't play
  private stopAnimations() {
    this.getComponent(Animator).getClip("Running").stop()
    this.getComponent(Animator).getClip("Idle").stop()
  }
}
