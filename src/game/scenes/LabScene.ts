import Phaser from 'phaser';
import { characters } from '../data';

export class LabScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearExperiment = -1;
  private nearDoor = false;

  constructor() {
    super({ key: 'LabScene' });
  }

  create() {
    const w = 960, h = 540;
    const charId = this.registry.get('characterId');
    const charData = characters.find(c => c.id === charId) || characters[0];

    // Background - cold lab tone
    this.add.rectangle(w / 2, h / 2, w, h, 0x181e2a);

    // Floor - lab tiles
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a3040);
    for (let x = 0; x < w; x += 40) {
      this.add.rectangle(x + 20, h - 30, 38, 58, (x / 40) % 2 === 0 ? 0x2e3444 : 0x2a3040);
      // Floor lines
      this.add.rectangle(x + 20, h - 2, 38, 2, 0x3a4050);
    }

    // Ceiling
    this.add.rectangle(w / 2, 30, w, 60, 0x1a2030);

    // Fluorescent lights
    for (let lx = 200; lx < w; lx += 300) {
      this.add.rectangle(lx, 62, 80, 6, 0xccccdd);
      this.add.rectangle(lx, 62, 76, 2, 0xeeeeff);
    }

    // Title
    this.add.text(w / 2, 80, '🔬 Лаборатория', {
      fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#66aacc',
    }).setOrigin(0.5);

    // Experiment 1: Signal Generator (x=200)
    this.createSignalGenerator(200, h - 95);

    // Experiment 2: Oscilloscope (x=480)
    this.createOscilloscope(480, h - 95);

    // Experiment 3: Robot arm (x=750)
    this.createRobotArm(750, h - 95);

    // Lab bench behind experiments
    this.add.rectangle(200, h - 65, 140, 8, 0x445566);
    this.add.rectangle(480, h - 65, 140, 8, 0x445566);
    this.add.rectangle(750, h - 65, 140, 8, 0x445566);
    // Bench legs
    for (const bx of [200, 480, 750]) {
      this.add.rectangle(bx - 60, h - 50, 6, 30, 0x3a4a5a);
      this.add.rectangle(bx + 60, h - 50, 6, 30, 0x3a4a5a);
    }

    // Safety poster on wall
    this.add.rectangle(880, 180, 50, 70, 0xeecc44);
    this.add.text(880, 160, '⚠️', { fontSize: '14px' }).setOrigin(0.5);
    this.add.text(880, 185, 'ТБ', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);
    this.add.text(880, 200, 'правила', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#555' }).setOrigin(0.5);

    // Whiteboard with formulas
    this.add.rectangle(350, 180, 180, 90, 0xdddddd);
    this.add.rectangle(350, 180, 174, 84, 0xeeeeee);
    this.add.text(290, 155, 'E = mc²', { fontSize: '9px', fontFamily: '"Press Start 2P"', color: '#2244aa' });
    this.add.text(290, 175, 'V = IR', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#22aa44' });
    this.add.text(290, 195, 'f = 1/T', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#aa2244' });

    // Door
    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x3a4a5a);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#6688aa' }).setOrigin(0.5);

    // Player
    this.player = this.createPixelCharacter(100, h - 85, charData.color);

    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(24, 36);
    this.playerBody.setOffset(-12, -18);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
    };

    this.promptText = this.add.text(w / 2, h - 240, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    this.input.keyboard!.addKey('ESC').on('down', () => {
      this.scene.start('CorridorScene');
    });

    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('lab');
  }

  private createSignalGenerator(x: number, y: number) {
    // Device body
    this.add.rectangle(x, y, 60, 40, 0x334455);
    this.add.rectangle(x, y, 56, 36, 0x2a3a4a);
    // Screen
    this.add.rectangle(x - 8, y - 6, 24, 16, 0x112211);
    this.add.rectangle(x - 8, y - 6, 20, 12, 0x224422);
    // Knobs
    this.add.circle(x + 18, y - 6, 5, 0x666666);
    this.add.circle(x + 18, y + 8, 4, 0x888888);
    // Label
    this.add.text(x, y + 30, '📡 Генератор', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  private createOscilloscope(x: number, y: number) {
    // Device body
    this.add.rectangle(x, y, 70, 50, 0x334455);
    this.add.rectangle(x, y, 66, 46, 0x2a3a4a);
    // Screen
    this.add.rectangle(x, y - 4, 40, 28, 0x111122);
    this.add.rectangle(x, y - 4, 36, 24, 0x112233);
    // Sine wave on screen
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x44ff44, 0.8);
    graphics.beginPath();
    for (let i = 0; i < 36; i++) {
      const px = x - 18 + i;
      const py = y - 4 + Math.sin(i * 0.5) * 8;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.strokePath();
    // Buttons
    for (let b = 0; b < 3; b++) {
      this.add.rectangle(x - 12 + b * 12, y + 18, 8, 6, 0x666688);
    }
    this.add.text(x, y + 35, '📊 Осциллограф', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  private createRobotArm(x: number, y: number) {
    // Base
    this.add.rectangle(x, y + 15, 40, 10, 0x555566);
    // Arm segments
    this.add.rectangle(x, y + 5, 8, 20, 0x666677);
    this.add.rectangle(x + 4, y - 8, 16, 6, 0x777788);
    // Gripper
    this.add.rectangle(x + 14, y - 12, 4, 8, 0x888899);
    this.add.rectangle(x + 14, y - 17, 6, 3, 0x999aaa);
    this.add.rectangle(x + 14, y - 7, 6, 3, 0x999aaa);
    // LED
    this.add.circle(x - 4, y + 2, 2, 0x44ff44);
    this.add.text(x, y + 30, '🤖 Робот', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  private createPixelCharacter(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const body = this.add.rectangle(0, 4, 16, 20, color);
    const head = this.add.rectangle(0, -12, 14, 14, 0xffccaa);
    const eyeL = this.add.rectangle(-3, -14, 3, 3, 0x222222);
    const eyeR = this.add.rectangle(3, -14, 3, 3, 0x222222);
    const hair = this.add.rectangle(0, -20, 16, 4, color);
    const legL = this.add.rectangle(-4, 18, 6, 8, color === 0x4488ff ? 0x2244aa : 0xaa3355);
    const legR = this.add.rectangle(4, 18, 6, 8, color === 0x4488ff ? 0x2244aa : 0xaa3355);
    const shoeL = this.add.rectangle(-4, 23, 7, 4, 0x333333);
    const shoeR = this.add.rectangle(4, 23, 7, 4, 0x333333);
    container.add([body, head, eyeL, eyeR, hair, legL, legR, shoeL, shoeR]);
    container.setDepth(5);
    return container;
  }

  update() {
    const speed = 200;
    const body = this.playerBody;

    if (this.keys.a.isDown || this.cursors.left.isDown) {
      body.setVelocityX(-speed);
      if (!this.facingLeft) { this.player.setScale(-1, 1); this.facingLeft = true; }
    } else if (this.keys.d.isDown || this.cursors.right.isDown) {
      body.setVelocityX(speed);
      if (this.facingLeft) { this.player.setScale(1, 1); this.facingLeft = false; }
    } else {
      body.setVelocityX(0);
    }

    if ((this.keys.space.isDown || this.cursors.up.isDown) && body.blocked.down) {
      body.setVelocityY(-400);
    }

    const px = this.player.x;
    this.nearDoor = px < 90;
    this.nearExperiment = -1;

    const expPositions = [200, 480, 750];
    for (let i = 0; i < expPositions.length; i++) {
      if (px > expPositions[i] - 50 && px < expPositions[i] + 50) {
        this.nearExperiment = i;
        break;
      }
    }

    const expNames = ['Генератор', 'Осциллограф', 'Робот'];
    if (this.nearExperiment >= 0) {
      this.promptText.setText(`[E] Испытать ${expNames[this.nearExperiment]}`);
      this.promptText.setX(expPositions[this.nearExperiment]);
      this.promptText.setVisible(true);
    } else if (this.nearDoor) {
      this.promptText.setText('[E] Выйти в коридор');
      this.promptText.setX(50);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearExperiment >= 0) {
        const cb = this.registry.get('onUseExperiment');
        if (cb) cb(this.nearExperiment);
      } else if (this.nearDoor) {
        this.scene.start('CorridorScene');
      }
    }
  }
}
