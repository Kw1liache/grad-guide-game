import Phaser from 'phaser';
import { characters } from '../data';

export class DeanScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearBoard = -1;
  private nearDoor = false;

  constructor() {
    super({ key: 'DeanScene' });
  }

  create() {
    const w = 960, h = 540;
    const charId = this.registry.get('characterId');
    const charData = characters.find(c => c.id === charId) || characters[0];

    // Background - formal office tone
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a24);

    // Floor - carpet
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a2244);
    for (let x = 0; x < w; x += 24) {
      this.add.rectangle(x + 12, h - 30, 22, 58, (x / 24) % 2 === 0 ? 0x2e2648 : 0x2a2244);
    }
    // Carpet border
    this.add.rectangle(w / 2, h - 58, w - 40, 2, 0x4a3a5a);

    // Ceiling
    this.add.rectangle(w / 2, 30, w, 60, 0x222235);

    // Chandelier
    this.add.rectangle(w / 2, 62, 4, 20, 0x887744);
    this.add.rectangle(w / 2, 75, 40, 8, 0xaa9944);
    for (let i = -1; i <= 1; i++) {
      this.add.circle(w / 2 + i * 14, 82, 4, 0xffdd66);
    }

    // Title
    this.add.text(w / 2, 80, '🏛️ Деканат', {
      fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#aa88cc',
    }).setOrigin(0.5);

    // Board 1: Schedule (x=200)
    this.add.rectangle(200, 200, 140, 100, 0x334433);
    this.add.rectangle(200, 200, 134, 94, 0xddddcc);
    this.add.text(200, 165, '📋 Расписание', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#334433' }).setOrigin(0.5);
    // Schedule lines
    for (let l = 0; l < 4; l++) {
      this.add.rectangle(200, 185 + l * 12, 110, 2, 0xaaaaaa);
      this.add.rectangle(165, 185 + l * 12, 20, 6, 0x88aa88);
    }

    // Board 2: Honor board (x=480)
    this.add.rectangle(480, 200, 160, 100, 0x443322);
    this.add.rectangle(480, 200, 154, 94, 0x554433);
    this.add.text(480, 162, '🏆 Доска почёта', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#ffcc44' }).setOrigin(0.5);
    // Student photos (pixel)
    for (let s = 0; s < 3; s++) {
      const sx = 430 + s * 50;
      this.add.rectangle(sx, 200, 30, 36, 0x888888);
      this.add.rectangle(sx, 192, 20, 20, 0xffccaa);
      this.add.rectangle(sx, 210, 20, 10, 0x4466aa);
      // Star
      this.add.text(sx, 225, '⭐', { fontSize: '6px' }).setOrigin(0.5);
    }

    // Board 3: Announcements (x=750)
    this.add.rectangle(750, 200, 140, 100, 0x333344);
    this.add.rectangle(750, 200, 134, 94, 0xffffee);
    this.add.text(750, 165, '📢 Объявления', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#334' }).setOrigin(0.5);
    // Pinned notes
    const noteColors = [0xffee88, 0x88eeff, 0xffaa88, 0xaaff88];
    for (let n = 0; n < 4; n++) {
      const nx = 710 + (n % 2) * 60;
      const ny = 190 + Math.floor(n / 2) * 30;
      this.add.rectangle(nx, ny, 40, 20, noteColors[n]);
      this.add.circle(nx, ny - 8, 2, 0xcc3333);
    }

    // Dean's desk
    this.add.rectangle(480, h - 75, 120, 12, 0x553322);
    this.add.rectangle(440, h - 55, 6, 40, 0x443322);
    this.add.rectangle(520, h - 55, 6, 40, 0x443322);
    // Items on desk
    this.add.rectangle(460, h - 86, 14, 10, 0x333333); // phone
    this.add.rectangle(500, h - 84, 8, 12, 0xcc6633); // pen holder
    // Nameplate
    this.add.rectangle(480, h - 88, 40, 8, 0xccaa44);
    this.add.text(480, h - 88, 'Декан', { fontSize: '4px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    // Bookcase
    this.add.rectangle(880, 280, 60, 160, 0x553322);
    for (let sh = 0; sh < 4; sh++) {
      this.add.rectangle(880, 215 + sh * 38, 56, 3, 0x442211);
      for (let b = 0; b < 3; b++) {
        this.add.rectangle(862 + b * 16, 208 + sh * 38, 12, 20 + Math.random() * 10, [0xcc3333, 0x3333cc, 0x33aa33, 0xaaaa33][Math.floor(Math.random() * 4)]);
      }
    }

    // Trophy case
    this.add.rectangle(120, 280, 50, 120, 0x444466);
    this.add.rectangle(120, 280, 46, 116, 0x334455);
    // Trophies
    this.add.text(120, 240, '🏆', { fontSize: '12px' }).setOrigin(0.5);
    this.add.text(120, 270, '🥇', { fontSize: '10px' }).setOrigin(0.5);
    this.add.text(120, 300, '🏅', { fontSize: '10px' }).setOrigin(0.5);

    // Door
    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a5a);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa88cc' }).setOrigin(0.5);

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
    if (onVisit) onVisit('dean');
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
    this.nearBoard = -1;

    const boardPositions = [200, 480, 750];
    for (let i = 0; i < boardPositions.length; i++) {
      if (px > boardPositions[i] - 60 && px < boardPositions[i] + 60) {
        this.nearBoard = i;
        break;
      }
    }

    const boardNames = ['Расписание', 'Доска почёта', 'Объявления'];
    if (this.nearBoard >= 0) {
      this.promptText.setText(`[E] Читать: ${boardNames[this.nearBoard]}`);
      this.promptText.setX(boardPositions[this.nearBoard]);
      this.promptText.setVisible(true);
    } else if (this.nearDoor) {
      this.promptText.setText('[E] Выйти в коридор');
      this.promptText.setX(50);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearBoard >= 0) {
        const cb = this.registry.get('onReadNotice');
        if (cb) cb(this.nearBoard);
      } else if (this.nearDoor) {
        this.scene.start('CorridorScene');
      }
    }
  }
}
