import Phaser from 'phaser';

interface DoorDef {
  x: number;
  label: string;
  scene: string;
  emoji: string;
  color: number;
  promptLabel: string;
}

interface StairDef {
  x: number;
  targetFloor: number;
  direction: 'up' | 'down';
}

interface FloorConfig {
  floor: number;
  title: string;
  bgColor: number;
  floorColor: number;
  ceilColor: number;
  doors: DoorDef[];
  stairs: StairDef[];
  hasRadik: boolean;
}

const WORLD_WIDTH = 1400;
const WORLD_HEIGHT = 540;
const VIEW_W = 960;
const RADIK_X = 700;

const FLOORS: Record<number, FloorConfig> = {
  1: {
    floor: 1,
    title: '1 этаж',
    bgColor: 0x1a1e2e,
    floorColor: 0x2a2e3e,
    ceilColor: 0x252838,
    doors: [
      { x: 400, label: 'Лекционная', scene: 'LectureRoomScene', emoji: '🎓', color: 0x4a6a3a, promptLabel: 'лекционную' },
    ],
    stairs: [
      { x: 1280, targetFloor: 2, direction: 'up' },
    ],
    hasRadik: true,
  },
  2: {
    floor: 2,
    title: '2 этаж',
    bgColor: 0x1e1a2e,
    floorColor: 0x2e2a3e,
    ceilColor: 0x282538,
    doors: [
      { x: 400, label: 'Библиотека', scene: 'LibraryScene', emoji: '📚', color: 0x5a4a3a, promptLabel: 'библиотеку' },
      { x: 850, label: 'Лаборатория', scene: 'LabScene', emoji: '🔬', color: 0x3a4a6a, promptLabel: 'лабораторию' },
    ],
    stairs: [
      { x: 120, targetFloor: 1, direction: 'down' },
      { x: 1280, targetFloor: 3, direction: 'up' },
    ],
    hasRadik: false,
  },
  3: {
    floor: 3,
    title: '3 этаж',
    bgColor: 0x2e1e1a,
    floorColor: 0x3e2e2a,
    ceilColor: 0x382528,
    doors: [
      { x: 700, label: 'Деканат', scene: 'DeanScene', emoji: '🏛️', color: 0x4a3a5a, promptLabel: 'деканат' },
    ],
    stairs: [
      { x: 120, targetFloor: 2, direction: 'down' },
    ],
    hasRadik: false,
  },
};

export class CorridorScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: {
    a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key;
    esc: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key;
  };
  private nearDoor: string | null = null;
  private nearRadik = false;
  private nearStair: StairDef | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private floorLabel!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private radikContainer: Phaser.GameObjects.Container | null = null;
  private radikBobTime = 0;
  private charId!: string;
  private currentFloor = 1;
  private spawnX = 60;
  private transitioning = false;

  constructor() {
    super({ key: 'CorridorScene' });
  }

  init(data: { floor?: number; spawnX?: number }) {
    this.currentFloor = data?.floor ?? 1;
    this.spawnX = data?.spawnX ?? 60;
    this.transitioning = false;
  }

  preload() {
    this.charId = this.registry.get('characterId') || 'char_a';
    const leftKey = `player_left_${this.charId}`;
    const rightKey = `player_right_${this.charId}`;
    if (!this.textures.exists(leftKey)) {
      if (this.charId === 'char_b') {
        this.load.image(leftKey, '/sprites/girl_left.png');
        this.load.image(rightKey, '/sprites/girl_right.png');
      } else {
        this.load.image(leftKey, '/sprites/boy_left.png');
        this.load.image(rightKey, '/sprites/boy_right.png');
      }
    }
  }

  create() {
    const cfg = FLOORS[this.currentFloor];
    const w = WORLD_WIDTH, h = WORLD_HEIGHT;

    // World/camera bounds
    this.physics.world.setBounds(0, 0, w, h);
    this.cameras.main.setBounds(0, 0, w, h);

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, cfg.bgColor);

    // Floor
    this.add.rectangle(w / 2, h - 30, w, 60, cfg.floorColor);
    this.add.rectangle(w / 2, h - 58, w, 4, 0x3a3e4e);
    for (let x = 0; x < w; x += 48) {
      this.add.rectangle(x + 24, h - 30, 46, 58, (x / 48) % 2 === 0 ? cfg.floorColor + 0x030305 : cfg.floorColor);
    }

    // Ceiling
    this.add.rectangle(w / 2, 40, w, 80, cfg.ceilColor);
    this.add.rectangle(w / 2, 80, w, 2, 0x3a3e4e);

    // Lamps
    for (let lx = 150; lx < w; lx += 250) {
      this.add.rectangle(lx, 82, 24, 4, 0x667788);
      this.add.rectangle(lx, 82, 20, 2, 0xaabbcc);
      this.add.circle(lx, 95, 12, 0xffeeaa, 0.15);
    }

    // Windows along walls
    for (let wx = 200; wx < w; wx += 320) {
      this.add.rectangle(wx, 160, 50, 45, 0x223355);
      this.add.rectangle(wx, 160, 46, 41, 0x334488);
      this.add.rectangle(wx, 160, 2, 41, 0x556688);
      this.add.rectangle(wx, 160, 46, 2, 0x556688);
    }

    // Floor signage (corner poster)
    this.add.rectangle(60, 170, 50, 60, 0xeecc44);
    this.add.text(60, 155, '📌', { fontSize: '12px' }).setOrigin(0.5);
    this.add.text(60, 175, cfg.title, { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);
    this.add.text(60, 188, 'ИРИТ-РТФ', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    // Doors
    cfg.doors.forEach(dp => {
      this.add.rectangle(dp.x, h - 130, 80, 140, 0x1a1520);
      this.add.rectangle(dp.x, h - 130, 72, 132, dp.color);
      this.add.circle(dp.x + 28, h - 120, 4, 0xccaa44);
      this.add.rectangle(dp.x, h - 160, 30, 20, 0x223344);
      this.add.rectangle(dp.x, h - 160, 26, 16, 0x334455);
      this.add.text(dp.x, h - 215, dp.emoji, { fontSize: '14px' }).setOrigin(0.5);
      this.add.text(dp.x, h - 198, dp.label, {
        fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#66ff88',
      }).setOrigin(0.5);
    });

    // Stairs
    cfg.stairs.forEach(s => this.createStair(s.x, h, s.direction, s.targetFloor));

    // Radik on floor 1
    if (cfg.hasRadik) {
      this.radikContainer = this.createRadik(RADIK_X, h - 88);
    }

    // Player
    const rightKey = `player_right_${this.charId}`;
    this.player = this.add.image(this.spawnX, h - 100, rightKey);
    this.player.setScale(0.13);
    this.player.setDepth(5);
    this.physics.add.existing(this.player);

    // Ground collider
    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(300, 400);
    this.playerBody.setOffset(100, 60);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // Camera follow + zoom in for bigger view
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 60);
    this.cameras.main.setZoom(1.4);

    // Input
    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
      esc: this.input.keyboard!.addKey('ESC'),
      w: this.input.keyboard!.addKey('W'),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    // Prompt fixed to camera (UI scroll factor 0)
    this.promptText = this.add.text(VIEW_W / 2, WORLD_HEIGHT - 250, '', {
      fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000cc', padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // Floor label (UI)
    this.floorLabel = this.add.text(10, 110, cfg.title, {
      fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#aaccff',
      backgroundColor: '#000000aa', padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(100);

    // Fade in
    this.cameras.main.fadeIn(350, 0, 0, 0);

    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit(`corridor_${this.currentFloor}`);
  }

  private createStair(x: number, h: number, direction: 'up' | 'down', _targetFloor: number) {
    // Floor span: from floor (h-60) up to ceiling (~y=80)
    const floorTop = h - 60;       // top surface of floor
    const ceilBottom = 80;          // bottom of ceiling
    const stairHeight = floorTop - ceilBottom; // ~400
    const stepCount = 14;
    const stepH = stairHeight / stepCount;
    const stairWidth = 90;

    // Backing wall behind stair (visual depth)
    this.add.rectangle(x, ceilBottom + stairHeight / 2, stairWidth + 16, stairHeight, 0x1a1520).setAlpha(0.6);

    // Side stringer (diagonal support)
    const stringerColor = 0x3a2a1a;
    for (let i = 0; i < stepCount; i++) {
      const sy = floorTop - (i + 0.5) * stepH;
      const offset = direction === 'up'
        ? -stairWidth / 2 + (i / stepCount) * stairWidth
        :  stairWidth / 2 - (i / stepCount) * stairWidth;
      // step tread
      this.add.rectangle(x + offset, sy, stairWidth * 0.6, stepH * 0.55, 0x6a5a4a);
      // step riser (darker)
      this.add.rectangle(x + offset, sy + stepH * 0.3, stairWidth * 0.6, stepH * 0.3, 0x4a3a2a);
      // small stringer dot
      this.add.rectangle(x + offset, sy + stepH * 0.5, 3, 3, stringerColor);
    }

    // Top landing (at ceiling level)
    this.add.rectangle(x, ceilBottom + 6, stairWidth + 20, 8, 0x554433);
    // Bottom landing (at floor level)
    this.add.rectangle(x, floorTop - 4, stairWidth + 20, 8, 0x554433);

    // Continuous handrail running diagonally full height
    const handColor = 0xccddee;
    const x1 = direction === 'up' ? x - stairWidth / 2 : x + stairWidth / 2;
    const x2 = direction === 'up' ? x + stairWidth / 2 : x - stairWidth / 2;
    this.add.line(0, 0, x1, floorTop - 18, x2, ceilBottom + 18, handColor)
      .setOrigin(0, 0).setLineWidth(3);

    // Vertical balusters
    for (let i = 0; i <= stepCount; i += 2) {
      const t = i / stepCount;
      const bx = direction === 'up'
        ? x - stairWidth / 2 + t * stairWidth
        : x + stairWidth / 2 - t * stairWidth;
      const by = floorTop - t * stairHeight;
      this.add.rectangle(bx, by - 12, 2, 24, 0x99aabb);
    }

    // Floor sign on stair
    const sign = direction === 'up' ? '⬆ Наверх' : '⬇ Вниз';
    this.add.text(x, ceilBottom - 8, sign, {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#aaccff',
      backgroundColor: '#00000099', padding: { x: 6, y: 4 },
    }).setOrigin(0.5);
  }

  private createRadik(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bodyMain = this.add.rectangle(0, 4, 20, 22, 0x2288cc);
    const belly = this.add.rectangle(0, 8, 12, 10, 0xccddee);
    const head = this.add.rectangle(0, -12, 18, 16, 0xddeeff);
    const earL = this.add.rectangle(-8, -23, 6, 8, 0x2288cc);
    const earR = this.add.rectangle(8, -23, 6, 8, 0x2288cc);
    const earLInner = this.add.rectangle(-8, -22, 3, 5, 0x44ddff);
    const earRInner = this.add.rectangle(8, -22, 3, 5, 0x44ddff);
    const eyeL = this.add.rectangle(-4, -13, 5, 4, 0x00ffff);
    const eyeR = this.add.rectangle(4, -13, 5, 4, 0x00ffff);
    const pupilL = this.add.rectangle(-3, -13, 2, 3, 0x0066aa);
    const pupilR = this.add.rectangle(5, -13, 2, 3, 0x0066aa);
    const nose = this.add.rectangle(0, -9, 3, 2, 0xff6688);
    const whiskerL1 = this.add.rectangle(-12, -10, 8, 1, 0x99bbcc);
    const whiskerL2 = this.add.rectangle(-12, -7, 8, 1, 0x99bbcc);
    const whiskerR1 = this.add.rectangle(12, -10, 8, 1, 0x99bbcc);
    const whiskerR2 = this.add.rectangle(12, -7, 8, 1, 0x99bbcc);
    const legL = this.add.rectangle(-5, 18, 7, 8, 0x1a6699);
    const legR = this.add.rectangle(5, 18, 7, 8, 0x1a6699);
    const pawL = this.add.rectangle(-5, 24, 8, 5, 0xeeeeff);
    const pawR = this.add.rectangle(5, 24, 8, 5, 0xeeeeff);
    const tail1 = this.add.rectangle(12, 0, 4, 6, 0x2288cc);
    const tail2 = this.add.rectangle(15, -4, 4, 6, 0x44aadd);
    const tail3 = this.add.rectangle(17, -9, 4, 4, 0x66ccff);
    const antenna = this.add.rectangle(0, -28, 2, 6, 0x99bbcc);
    const antennaTop = this.add.circle(0, -32, 2, 0x00ffff);
    const circuit1 = this.add.rectangle(-4, 2, 1, 8, 0x44ddff);
    const circuit2 = this.add.rectangle(4, 6, 1, 6, 0x44ddff);

    container.add([
      bodyMain, belly, head, earL, earR, earLInner, earRInner,
      eyeL, eyeR, pupilL, pupilR, nose,
      whiskerL1, whiskerL2, whiskerR1, whiskerR2,
      legL, legR, pawL, pawR, tail1, tail2, tail3,
      antenna, antennaTop, circuit1, circuit2,
    ]);
    container.setDepth(4);

    this.add.text(x, y - 45, 'Радик 🐱', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#44ddff',
    }).setOrigin(0.5).setDepth(4);

    const bubble = this.add.text(x, y - 60, '💬', { fontSize: '10px' }).setOrigin(0.5).setDepth(4);
    this.tweens.add({ targets: bubble, y: y - 65, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: [eyeL, eyeR], alpha: 0.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    return container;
  }

  private changeFloor(targetFloor: number, direction: 'up' | 'down') {
    if (this.transitioning) return;
    this.transitioning = true;
    this.playerBody.setVelocity(0, 0);
    // On the next floor, find the stair that goes back the opposite way — spawn next to it.
    const targetCfg = FLOORS[targetFloor];
    const oppositeDir = direction === 'up' ? 'down' : 'up';
    const returnStair = targetCfg.stairs.find(s => s.direction === oppositeDir);
    // Offset slightly away from the stair toward the corridor interior
    let spawnX = 100;
    if (returnStair) {
      const worldMid = WORLD_WIDTH / 2;
      const inward = returnStair.x < worldMid ? 70 : -70;
      spawnX = returnStair.x + inward;
    }

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.restart({ floor: targetFloor, spawnX });
    });
  }

  update(_time: number, delta: number) {
    if (this.transitioning) return;
    const uiOpen = this.registry.get('uiOpen');
    const body = this.playerBody;

    if (uiOpen) {
      body.setVelocityX(0);
      return;
    }

    const speed = 220;
    const left = this.keys.a.isDown || this.keys.left.isDown;
    const right = this.keys.d.isDown || this.keys.right.isDown;

    if (left) {
      body.setVelocityX(-speed);
      if (!this.facingLeft) {
        this.player.setTexture(`player_left_${this.charId}`);
        this.facingLeft = true;
      }
    } else if (right) {
      body.setVelocityX(speed);
      if (this.facingLeft) {
        this.player.setTexture(`player_right_${this.charId}`);
        this.facingLeft = false;
      }
    } else {
      body.setVelocityX(0);
    }

    if (this.keys.space.isDown && body.blocked.down) {
      body.setVelocityY(-400);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      const cb = this.registry.get('onOpenSettings');
      if (cb) cb();
      return;
    }

    // Radik bob
    if (this.radikContainer) {
      this.radikBobTime += delta;
      this.radikContainer.y = (WORLD_HEIGHT - 88) + Math.sin(this.radikBobTime * 0.003) * 2;
    }

    const px = this.player.x;
    const cfg = FLOORS[this.currentFloor];

    this.nearDoor = null;
    this.nearRadik = false;
    this.nearStair = null;

    // Doors
    for (const d of cfg.doors) {
      if (Math.abs(px - d.x) < 50) {
        this.nearDoor = d.scene;
        this.promptText.setText(`[E] Войти в ${d.promptLabel}`);
        this.promptText.setVisible(true);
        break;
      }
    }

    // Stairs
    if (!this.nearDoor) {
      for (const s of cfg.stairs) {
        if (Math.abs(px - s.x) < 60) {
          this.nearStair = s;
          const arrow = s.direction === 'up' ? '⬆' : '⬇';
          this.promptText.setText(`[W] ${arrow} На ${s.targetFloor} этаж`);
          this.promptText.setVisible(true);
          break;
        }
      }
    }

    // Radik
    if (!this.nearDoor && !this.nearStair && cfg.hasRadik && Math.abs(px - 1100) < 50) {
      this.nearRadik = true;
      this.promptText.setText('[E] Поговорить с Радиком');
      this.promptText.setVisible(true);
    }

    if (!this.nearDoor && !this.nearStair && !this.nearRadik) {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearDoor) {
        this.cameras.main.fadeOut(250, 0, 0, 0);
        this.transitioning = true;
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(this.nearDoor!, { returnFloor: this.currentFloor, returnX: this.player.x });
        });
      } else if (this.nearRadik) {
        const cb = this.registry.get('onTalkRadik');
        if (cb) cb();
      }
    }

    if ((Phaser.Input.Keyboard.JustDown(this.keys.w) || Phaser.Input.Keyboard.JustDown(this.keys.up)) && this.nearStair) {
      this.changeFloor(this.nearStair.targetFloor, this.nearStair.direction);
    }
  }
}
