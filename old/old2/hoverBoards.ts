const sceneMessageBus = new MessageBus();
import * as ecsUtils from "@dcl/ecs-scene-utils";

const hoverglb = new GLTFShape("models/Hoverboard.glb");

@Component("hoverBoardFlag")
export class HoverBoardFlag {
  initialTransform: Transform;
  lastUpdate: number = 0;
  constructor(initialTransform: Transform) {
    this.initialTransform = initialTransform;
  }
}

export class HoverBoards {
  actived: Entity | undefined;
  timeUpdate: number = 0;
  timep2p: number = 0;
  boards: Entity[] = [];
  showHelp: boolean = true;

  updateSpeed = 1 / 3;
  helpBox: UIContainerRect;
  uiAnimation: boolean[] = [true, false]; // animation finished, ui opened

  constructor() {
    const canvas = new UICanvas();
    this.helpBox = new UIContainerRect(canvas);
    this.helpBox.color = new Color4(0, 0, 0, 0.7);
    this.helpBox.hAlign = "center";
    this.helpBox.vAlign = "top";
    this.helpBox.width = 350;
    this.helpBox.height = 100;
    this.helpBox.positionY = 0;
    this.helpBox.visible = false;
    this.helpBox.opacity = 0;
    this.helpBox.isPointerBlocker = false;

    const text = new UIText(this.helpBox);
    text.value = `Hold click in the direction you want to go\nPress E to go up\nPress F to go down`;
    text.fontSize = 16;
    text.hTextAlign = "center";
    text.vTextAlign = "center";
    text.visible = true;

    sceneMessageBus.on("hoverMove", (value, sender) => {
      if (sender != "self") {
        if (this.boards[value.index] && this.boards[value.index] != this.actived) {
          const currPos = value.position;
          this.boards[value.index].getComponent(HoverBoardFlag).lastUpdate = +new Date();
          this.boards[value.index].addComponentOrReplace(
            new ecsUtils.MoveTransformComponent(
              this.boards[value.index].getComponent(Transform).position,
              new Vector3(currPos.x, currPos.y, currPos.z),
              this.updateSpeed
            )
          );
        }
      }
    });
  }

  hideAndShow(show: boolean): void {
    log(this);
    this.uiAnimation[0] = false;
    if (show) {
      this.uiAnimation[1] = true;
    } else {
      this.uiAnimation[1] = false;
    }
  }

  async update(dt: number): Promise<void> {
    if (!this.uiAnimation[0]) {
      //log(this.helpBox.opacity);
      if (this.uiAnimation[1]) {
        this.helpBox.visible = true;
        this.helpBox.opacity += dt * 5;
        if (this.helpBox.opacity > 1) {
          this.uiAnimation[0] = true;
        }
      } else {
        this.helpBox.opacity -= dt * 5;
        if (this.helpBox.opacity < 0) {
          this.helpBox.visible = false;
          this.uiAnimation[0] = true;
        }
      }
    }

    this.timeUpdate += dt;
    if (this.timep2p > this.updateSpeed) {
      this.timep2p = 0;
      if (this.actived) {
        this.actived.getComponent(HoverBoardFlag).lastUpdate = +new Date();
        sceneMessageBus.emit(`hoverMove`, {
          index: this.boards.indexOf(this.actived),
          position: this.actived.getComponent(Transform).position,
        });
      }
    }
    if (this.timeUpdate > 1) {
      const date = +new Date();

      for (const board of this.boards) {
        if (board.getComponent(HoverBoardFlag).lastUpdate != 0 && board != this.actived) {
          if (board.getComponent(HoverBoardFlag).lastUpdate < date - 1000 * 5) {
            board.getComponent(HoverBoardFlag).lastUpdate = 0;
            log(board.getComponent(Transform).position, board.getComponent(HoverBoardFlag).initialTransform.position);
            board.addComponentOrReplace(
              new ecsUtils.MoveTransformComponent(board.getComponent(Transform).position, board.getComponent(HoverBoardFlag).initialTransform.position, 5)
            );
            board.addComponentOrReplace(
              new ecsUtils.RotateTransformComponent(board.getComponent(Transform).rotation, board.getComponent(HoverBoardFlag).initialTransform.rotation, 0.5)
            );
          }
        }
      }
      const feetPos = Camera.instance.feetPosition;
      this.timeUpdate = 0;
      if (this.actived) {
        this.actived.getComponent(HoverBoardFlag).lastUpdate = +new Date();
        sceneMessageBus.emit(`hoverMove`, {
          index: this.boards.indexOf(this.actived),
          position: this.actived.getComponent(Transform).position,
        });
        if (
          distance(this.actived.getComponent(Transform).position, Camera.instance.feetPosition) > 1.5 ||
          feetPos.y - this.actived.getComponent(Transform).position.y > 2 ||
          feetPos.y - this.actived.getComponent(Transform).position.y < 0
        ) {
          this.actived = undefined;
        }
      }
      if (this.actived == undefined)
        for (const board of this.boards) {
          const boardPos = board.getComponent(Transform).position;
          if (distance(boardPos, Camera.instance.feetPosition) < 0.8 && feetPos.y - boardPos.y < 2 && feetPos.y - boardPos.y > 0) {
            this.actived = board;
            this.displayHelp();
            break;
          }
        }
    }
    if (this.actived) {
      this.actived.getComponent(Transform).rotation.setEuler(0, Camera.instance.rotation.eulerAngles.y - 180, 0);
      const position = this.actived.getComponent(Transform).position;
      if (Input.instance.isButtonPressed(ActionButton.POINTER).BUTTON_DOWN) {
        const rot = (Camera.instance.rotation.eulerAngles.y * Math.PI) / 180;
        position.addInPlace(new Vector3(Math.sin(rot) * 0.33, 0, Math.cos(rot) * 0.33));
      }
      if (Input.instance.isButtonPressed(ActionButton.PRIMARY).BUTTON_DOWN && position.y < 200) {
        position.addInPlace(new Vector3(0, 0.3, 0));
      }
      if (Input.instance.isButtonPressed(ActionButton.SECONDARY).BUTTON_DOWN && position.y > 0.2) {
        position.addInPlace(new Vector3(0, -0.3, 0));
      }
    }
  }

  addBoard(position: Vector3, rotate: number): Entity {
    const board = new Entity();

    const transform = new Transform({
      position,
      scale: new Vector3(1.5, 1, 1.5),
      rotation: Quaternion.Euler(0, rotate, 0),
    });

    board.addComponent(transform);
    //  board.getComponentOrCreate(Material).albedoColor = new Color4(Math.random(), Math.random(), Math.random(), 0.8)
    board.addComponent(hoverglb);
    board.addComponent(
      new HoverBoardFlag(
        new Transform({
          scale: transform.scale.clone(),
          position: transform.position.clone(),
          rotation: transform.rotation.clone(),
        })
      )
    );

    engine.addEntity(board);
    this.boards.push(board);
    return board;
  }

  displayHelp = async () => {
    log(this.showHelp);
    if (!this.showHelp) return;
    this.showHelp = false;
    this.uiAnimation = [false, true];
    await this.delay(5000);
    this.uiAnimation = [false, false];
  };

  delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      const ent = new Entity();
      engine.addEntity(ent);
      ent.addComponent(
        new ecsUtils.Delay(ms, () => {
          resolve();
          engine.removeEntity(ent);
        })
      );
    });
  };
}

function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x;
  const b = pos1.z - pos2.z;
  return a * a + b * b;
}

executeTask(async () => {
  const hoverBoards = new HoverBoards();
  engine.addSystem(hoverBoards);

hoverBoards.addBoard(new Vector3(3,0.5,3), 0);
//  hoverBoards.addBoard(new Vector3(136.5, 0.5, 43.5), 0);
//  hoverBoards.addBoard(new Vector3(136.5, 0.5, 40.4), 0);
//  hoverBoards.addBoard(new Vector3(136.5, 0.5, 37.2), 0);
//  hoverBoards.addBoard(new Vector3(142.3, 0.5, 43.5), 0);
//  hoverBoards.addBoard(new Vector3(142.3, 0.5, 40.4), 0);
//  hoverBoards.addBoard(new Vector3(142.3, 0.5, 37.2), 0);
//
//  hoverBoards.addBoard(new Vector3(6, 0.5, 77.4), 90);
//  hoverBoards.addBoard(new Vector3(6, 0.5, 72), 90);
//
//  hoverBoards.addBoard(new Vector3(6, 0.5, 2.3), 90);
//  hoverBoards.addBoard(new Vector3(6, 0.5, 8), 90);
});
