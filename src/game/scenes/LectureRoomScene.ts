import Phaser from 'phaser';
import { characters } from '../data';

export class LectureRoomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private nearNPC = false;
  private nearLaptop = false;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;

  constructor() {
    super({ key: 'LectureRoomScene' });
  }

  create() {
    const w = 960, h = 540;
    const charId = this.registry.get('characterId');
    const charData = characters.find(c => c.id === charId) || characters[0];

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x1e2230);

    // Floor
    this.add.rectangle(w / 2, h - 30, w, 60, 0x3a3228);
    for (let x = 0; x < w; x += 40) {
      this.add.rectangle(x + 20, h - 30, 38, 58, (x / 40) % 2 === 0 ? 0x3e3630 : 0x3a3228);
    }

    // Ceiling
    this.add.rectangle(w / 2, 30, w, 60, 0x252838);
    
    // Blackboard
    this.add.rectangle(200, 160, 200, 100, 0x1a3a1a);
    this.add.rectangle(200, 160, 192, 92, 0x224422);
    this.add.text(200, 145, 'ИРИТ-РТФ', { fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#aaccaa' }).setOrigin(0.5);
    this.add.text(200, 170, 'Лекция #1', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#88aa88' }).setOrigin(0.5);

    // NPC Lecturer - positioned at x=250
    this.createNPC(280, h - 85);

    // Laptop on stand - positioned at x=350
    this.createLaptop(380, h - 80);

    // Seating rows
    for (let row = 0; row < 3; row++) {
      const ry = h - 80 - row * 5;
      const rx = 550 + row * 60;
      for (let s = 0; s < 4; s++) {
        const sx = rx + s * 50;
        if (sx < w - 30) {
          // Chair
          this.add.rectangle(sx, ry + 5, 30, 24, 0x554433);
          this.add.rectangle(sx, ry - 8, 28, 4, 0x665544);
          // Desk
          this.add.rectangle(sx, ry - 14, 34, 4, 0x443322);
        }
      }
    }

    // Door back
    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a30);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa8866' }).setOrigin(0.5);

    // Player
    this.player = this.createPixelCharacter(100, h - 85, charData.color);
    
    // Physics
    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(24, 36);
    this.playerBody.setOffset(-12, -18);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
    };

    // Prompt
    this.promptText = this.add.text(w / 2, h - 240, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    // ESC to go back
    this.input.keyboard!.addKey('ESC').on('down', () => {
      this.scene.start('CorridorScene');
    });

    // Notify room visit
    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('lecture');
  }

  private createNPC(x: number, y: number) {
    // Body
    this.add.rectangle(x, y + 4, 18, 22, 0x884422);
    // Head
    this.add.rectangle(x, y - 12, 16, 16, 0xffccaa);
    // Glasses
    this.add.rectangle(x - 4, y - 14, 6, 4, 0x4466aa).setAlpha(0.7);
    this.add.rectangle(x + 4, y - 14, 6, 4, 0x4466aa).setAlpha(0.7);
    this.add.rectangle(x, y - 14, 4, 2, 0x4466aa).setAlpha(0.7);
    // Hair
    this.add.rectangle(x, y - 21, 18, 4, 0x555555);
    // Label
    this.add.text(x, y - 35, 'Лектор', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#ffcc44' }).setOrigin(0.5);
  }

  private createLaptop(x: number, y: number) {
    // Stand
    this.add.rectangle(x, y + 10, 8, 20, 0x555555);
    this.add.rectangle(x, y + 22, 20, 4, 0x444444);
    // Laptop base
    this.add.rectangle(x, y - 2, 30, 4, 0x333333);
    // Screen
    this.add.rectangle(x, y - 14, 28, 20, 0x222222);
    this.add.rectangle(x, y - 14, 24, 16, 0x2244aa);
    // Screen glow
    this.add.text(x, y - 14, '💻', { fontSize: '8px' }).setOrigin(0.5);
    // Label
    this.add.text(x, y - 32, 'Ноутбук', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#6688ff' }).setOrigin(0.5);
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

    // Near NPC
    this.nearNPC = px > 240 && px < 320;
    // Near Laptop
    this.nearLaptop = px > 340 && px < 420;
    // Near door
    const nearDoor = px < 90;

    if (this.nearNPC) {
      this.promptText.setText('[E] Поговорить с лектором');
      this.promptText.setX(280);
      this.promptText.setVisible(true);
    } else if (this.nearLaptop) {
      this.promptText.setText('[E] Открыть ноутбук');
      this.promptText.setX(380);
      this.promptText.setVisible(true);
    } else if (nearDoor) {
      this.promptText.setText('[E] Выйти в коридор');
      this.promptText.setX(50);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearNPC) {
        const cb = this.registry.get('onOpenDialog');
        if (cb) cb();
      } else if (this.nearLaptop) {
        const cb = this.registry.get('onOpenQuiz');
        if (cb) cb();
      } else if (nearDoor) {
        this.scene.start('CorridorScene');
      }
    }
  }
}
