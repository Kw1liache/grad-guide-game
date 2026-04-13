import Phaser from 'phaser';
import { characters } from '../data';

export class LibraryScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearBookshelf = -1;
  private nearDoor = false;

  constructor() {
    super({ key: 'LibraryScene' });
  }

  create() {
    const w = 960, h = 540;
    const charId = this.registry.get('characterId');
    const charData = characters.find(c => c.id === charId) || characters[0];

    // Background - warm library tone
    this.add.rectangle(w / 2, h / 2, w, h, 0x1e1a28);

    // Floor - wooden
    this.add.rectangle(w / 2, h - 30, w, 60, 0x4a3828);
    for (let x = 0; x < w; x += 32) {
      this.add.rectangle(x + 16, h - 30, 30, 58, (x / 32) % 2 === 0 ? 0x4e3c2c : 0x4a3828);
    }

    // Ceiling
    this.add.rectangle(w / 2, 30, w, 60, 0x2a2535);

    // Hanging lamp
    for (let lx = 200; lx < w; lx += 250) {
      this.add.rectangle(lx, 60, 2, 30, 0x666644);
      this.add.rectangle(lx, 78, 20, 6, 0xaaaa44);
      // Light cone (subtle)
      const light = this.add.triangle(lx, 120, -30, 60, 30, 60, 0, 0, 0xffff88);
      light.setAlpha(0.05);
    }

    // 4 Bookshelves along the wall
    const shelfColors = [0x8B4513, 0x6B3410, 0x7B4020, 0x5B3015];
    const bookColors = [
      [0xcc3333, 0x33cc33, 0x3333cc, 0xcccc33, 0xcc33cc],
      [0x33cccc, 0xaa5522, 0x5522aa, 0x22aa55, 0xcc6633],
      [0x6633cc, 0x33cc66, 0xcc3366, 0x66cc33, 0x3366cc],
      [0xaaaa33, 0x33aaaa, 0xaa33aa, 0x33aa33, 0xaa3333],
    ];

    for (let i = 0; i < 4; i++) {
      const sx = 180 + i * 180;
      // Shelf structure
      this.add.rectangle(sx, 200, 100, 200, shelfColors[i]);
      // Shelves
      for (let sh = 0; sh < 4; sh++) {
        const sy = 120 + sh * 45;
        this.add.rectangle(sx, sy, 96, 3, 0x3a2a1a);
        // Books on shelf
        for (let b = 0; b < 5; b++) {
          const bx = sx - 38 + b * 18;
          const bh = 20 + Math.random() * 15;
          this.add.rectangle(bx, sy - bh / 2 - 2, 14, bh, bookColors[i][b]);
        }
      }
      // Label
      this.add.text(sx, 310, `Полка ${i + 1}`, {
        fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#aa8866',
      }).setOrigin(0.5);
    }

    // Reading desks
    for (let d = 0; d < 2; d++) {
      const dx = 350 + d * 250;
      // Table
      this.add.rectangle(dx, h - 80, 80, 8, 0x5a4a3a);
      this.add.rectangle(dx - 30, h - 60, 6, 40, 0x4a3a2a);
      this.add.rectangle(dx + 30, h - 60, 6, 40, 0x4a3a2a);
      // Open book on table
      this.add.rectangle(dx - 8, h - 88, 20, 14, 0xeeddcc);
      this.add.rectangle(dx + 8, h - 88, 20, 14, 0xeeddcc);
      this.add.rectangle(dx, h - 88, 2, 14, 0x8a7a6a);
      // Chair
      this.add.rectangle(dx, h - 55, 24, 18, 0x664422);
      this.add.rectangle(dx, h - 70, 22, 6, 0x775533);
    }

    // Globe
    this.add.circle(860, h - 100, 18, 0x2255aa);
    this.add.circle(860, h - 100, 16, 0x3366bb);
    this.add.rectangle(860, h - 100, 34, 2, 0x44aa44).setAngle(23);
    this.add.rectangle(860, h - 78, 6, 12, 0x665544);
    this.add.rectangle(860, h - 70, 20, 4, 0x554433);
    this.add.text(860, h - 130, '🌍', { fontSize: '6px' }).setOrigin(0.5);

    // Door back
    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a30);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa8866' }).setOrigin(0.5);

    // Title
    this.add.text(w / 2, 75, '📚 Библиотека', {
      fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#ccaa66',
    }).setOrigin(0.5);

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

    this.promptText = this.add.text(w / 2, h - 240, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    this.input.keyboard!.addKey('ESC').on('down', () => {
      this.scene.start('CorridorScene');
    });

    // Notify room visit
    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('library');
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
    this.nearBookshelf = -1;

    // Check proximity to bookshelves
    for (let i = 0; i < 4; i++) {
      const sx = 180 + i * 180;
      if (px > sx - 55 && px < sx + 55) {
        this.nearBookshelf = i;
        break;
      }
    }

    if (this.nearBookshelf >= 0) {
      const sx = 180 + this.nearBookshelf * 180;
      this.promptText.setText(`[E] Читать книгу (Полка ${this.nearBookshelf + 1})`);
      this.promptText.setX(sx);
      this.promptText.setVisible(true);
    } else if (this.nearDoor) {
      this.promptText.setText('[E] Выйти в коридор');
      this.promptText.setX(50);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearBookshelf >= 0) {
        const cb = this.registry.get('onReadBook');
        if (cb) cb(this.nearBookshelf);
      } else if (this.nearDoor) {
        this.scene.start('CorridorScene');
      }
    }
  }
}
