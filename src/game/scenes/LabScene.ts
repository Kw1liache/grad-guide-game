import Phaser from 'phaser';

export class LabScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearExperiment = -1;
  private nearDoor = false;

  constructor() {
    super({ key: 'LabScene' });
  }

  preload() {
    const charId = this.registry.get('characterId') || 'char_a';
    if (charId === 'char_b') {
      this.load.image('player_left', '/sprites/girl_left.png');
      this.load.image('player_right', '/sprites/girl_right.png');
    } else {
      this.load.image('player_left', '/sprites/boy_left.png');
      this.load.image('player_right', '/sprites/boy_right.png');
    }
  }

  create() {
    const w = 960, h = 540;

    this.add.rectangle(w / 2, h / 2, w, h, 0x181e2a);
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a3040);
    for (let x = 0; x < w; x += 40) {
      this.add.rectangle(x + 20, h - 30, 38, 58, (x / 40) % 2 === 0 ? 0x2e3444 : 0x2a3040);
      this.add.rectangle(x + 20, h - 2, 38, 2, 0x3a4050);
    }
    this.add.rectangle(w / 2, 30, w, 60, 0x1a2030);

    for (let lx = 200; lx < w; lx += 300) {
      this.add.rectangle(lx, 62, 80, 6, 0xccccdd);
      this.add.rectangle(lx, 62, 76, 2, 0xeeeeff);
    }

    this.add.text(w / 2, 80, '🔬 Лаборатория', { fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);

    this.createSignalGenerator(200, h - 95);
    this.createOscilloscope(480, h - 95);
    this.createRobotArm(750, h - 95);

    this.add.rectangle(200, h - 65, 140, 8, 0x445566);
    this.add.rectangle(480, h - 65, 140, 8, 0x445566);
    this.add.rectangle(750, h - 65, 140, 8, 0x445566);
    for (const bx of [200, 480, 750]) {
      this.add.rectangle(bx - 60, h - 50, 6, 30, 0x3a4a5a);
      this.add.rectangle(bx + 60, h - 50, 6, 30, 0x3a4a5a);
    }

    this.add.rectangle(880, 180, 50, 70, 0xeecc44);
    this.add.text(880, 160, '⚠️', { fontSize: '14px' }).setOrigin(0.5);
    this.add.text(880, 185, 'ТБ', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    this.add.rectangle(350, 180, 180, 90, 0xdddddd);
    this.add.rectangle(350, 180, 174, 84, 0xeeeeee);
    this.add.text(290, 155, 'E = mc²', { fontSize: '9px', fontFamily: '"Press Start 2P"', color: '#2244aa' });
    this.add.text(290, 175, 'V = IR', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#22aa44' });
    this.add.text(290, 195, 'f = 1/T', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#aa2244' });

    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x3a4a5a);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#6688aa' }).setOrigin(0.5);

    this.player = this.add.image(100, h - 100, 'player_right');
    this.player.setScale(0.08);
    this.player.setDepth(5);
    this.physics.add.existing(this.player);

    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(300, 400);
    this.playerBody.setOffset(100, 60);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
      esc: this.input.keyboard!.addKey('ESC'),
    };

    this.promptText = this.add.text(w / 2, h - 240, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('lab');
  }

  private createSignalGenerator(x: number, y: number) {
    this.add.rectangle(x, y, 60, 40, 0x334455);
    this.add.rectangle(x, y, 56, 36, 0x2a3a4a);
    this.add.rectangle(x - 8, y - 6, 24, 16, 0x112211);
    this.add.rectangle(x - 8, y - 6, 20, 12, 0x224422);
    this.add.circle(x + 18, y - 6, 5, 0x666666);
    this.add.circle(x + 18, y + 8, 4, 0x888888);
    this.add.text(x, y + 30, '📡 Генератор', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  private createOscilloscope(x: number, y: number) {
    this.add.rectangle(x, y, 70, 50, 0x334455);
    this.add.rectangle(x, y, 66, 46, 0x2a3a4a);
    this.add.rectangle(x, y - 4, 40, 28, 0x111122);
    this.add.rectangle(x, y - 4, 36, 24, 0x112233);
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x44ff44, 0.8);
    graphics.beginPath();
    for (let i = 0; i < 36; i++) {
      const px = x - 18 + i;
      const py = y - 4 + Math.sin(i * 0.5) * 8;
      if (i === 0) graphics.moveTo(px, py); else graphics.lineTo(px, py);
    }
    graphics.strokePath();
    for (let b = 0; b < 3; b++) { this.add.rectangle(x - 12 + b * 12, y + 18, 8, 6, 0x666688); }
    this.add.text(x, y + 35, '📊 Осциллограф', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  private createRobotArm(x: number, y: number) {
    this.add.rectangle(x, y + 15, 40, 10, 0x555566);
    this.add.rectangle(x, y + 5, 8, 20, 0x666677);
    this.add.rectangle(x + 4, y - 8, 16, 6, 0x777788);
    this.add.rectangle(x + 14, y - 12, 4, 8, 0x888899);
    this.add.rectangle(x + 14, y - 17, 6, 3, 0x999aaa);
    this.add.rectangle(x + 14, y - 7, 6, 3, 0x999aaa);
    this.add.circle(x - 4, y + 2, 2, 0x44ff44);
    this.add.text(x, y + 30, '🤖 Робот', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#66aacc' }).setOrigin(0.5);
  }

  update() {
    const uiOpen = this.registry.get('uiOpen');
    const body = this.playerBody;

    if (uiOpen) { body.setVelocityX(0); return; }

    const speed = 200;
    if (this.keys.a.isDown) {
      body.setVelocityX(-speed);
      if (!this.facingLeft) { this.player.setTexture('player_left'); this.facingLeft = true; }
    } else if (this.keys.d.isDown) {
      body.setVelocityX(speed);
      if (this.facingLeft) { this.player.setTexture('player_right'); this.facingLeft = false; }
    } else {
      body.setVelocityX(0);
    }

    if (this.keys.space.isDown && body.blocked.down) { body.setVelocityY(-400); }

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      const cb = this.registry.get('onOpenSettings');
      if (cb) cb();
      return;
    }

    const px = this.player.x;
    this.nearDoor = px < 90;
    this.nearExperiment = -1;

    const expPositions = [200, 480, 750];
    for (let i = 0; i < expPositions.length; i++) {
      if (px > expPositions[i] - 50 && px < expPositions[i] + 50) { this.nearExperiment = i; break; }
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
