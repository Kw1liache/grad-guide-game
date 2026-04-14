import Phaser from 'phaser';

export class LibraryScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearBookshelf = -1;
  private nearDoor = false;

  constructor() {
    super({ key: 'LibraryScene' });
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

    this.add.rectangle(w / 2, h / 2, w, h, 0x1e1a28);
    this.add.rectangle(w / 2, h - 30, w, 60, 0x4a3828);
    for (let x = 0; x < w; x += 32) {
      this.add.rectangle(x + 16, h - 30, 30, 58, (x / 32) % 2 === 0 ? 0x4e3c2c : 0x4a3828);
    }
    this.add.rectangle(w / 2, 30, w, 60, 0x2a2535);

    for (let lx = 200; lx < w; lx += 250) {
      this.add.rectangle(lx, 60, 2, 30, 0x666644);
      this.add.rectangle(lx, 78, 20, 6, 0xaaaa44);
      const light = this.add.triangle(lx, 120, -30, 60, 30, 60, 0, 0, 0xffff88);
      light.setAlpha(0.05);
    }

    const shelfColors = [0x8B4513, 0x6B3410, 0x7B4020, 0x5B3015];
    const bookColors = [
      [0xcc3333, 0x33cc33, 0x3333cc, 0xcccc33, 0xcc33cc],
      [0x33cccc, 0xaa5522, 0x5522aa, 0x22aa55, 0xcc6633],
      [0x6633cc, 0x33cc66, 0xcc3366, 0x66cc33, 0x3366cc],
      [0xaaaa33, 0x33aaaa, 0xaa33aa, 0x33aa33, 0xaa3333],
    ];

    for (let i = 0; i < 4; i++) {
      const sx = 180 + i * 180;
      this.add.rectangle(sx, 200, 100, 200, shelfColors[i]);
      for (let sh = 0; sh < 4; sh++) {
        const sy = 120 + sh * 45;
        this.add.rectangle(sx, sy, 96, 3, 0x3a2a1a);
        for (let b = 0; b < 5; b++) {
          const bx = sx - 38 + b * 18;
          const bh = 20 + Math.random() * 15;
          this.add.rectangle(bx, sy - bh / 2 - 2, 14, bh, bookColors[i][b]);
        }
      }
      this.add.text(sx, 310, `Полка ${i + 1}`, { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#aa8866' }).setOrigin(0.5);
    }

    for (let d = 0; d < 2; d++) {
      const dx = 350 + d * 250;
      this.add.rectangle(dx, h - 80, 80, 8, 0x5a4a3a);
      this.add.rectangle(dx - 30, h - 60, 6, 40, 0x4a3a2a);
      this.add.rectangle(dx + 30, h - 60, 6, 40, 0x4a3a2a);
      this.add.rectangle(dx - 8, h - 88, 20, 14, 0xeeddcc);
      this.add.rectangle(dx + 8, h - 88, 20, 14, 0xeeddcc);
      this.add.rectangle(dx, h - 88, 2, 14, 0x8a7a6a);
      this.add.rectangle(dx, h - 55, 24, 18, 0x664422);
      this.add.rectangle(dx, h - 70, 22, 6, 0x775533);
    }

    this.add.circle(860, h - 100, 18, 0x2255aa);
    this.add.circle(860, h - 100, 16, 0x3366bb);
    this.add.rectangle(860, h - 100, 34, 2, 0x44aa44).setAngle(23);
    this.add.rectangle(860, h - 78, 6, 12, 0x665544);
    this.add.rectangle(860, h - 70, 20, 4, 0x554433);

    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a30);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa8866' }).setOrigin(0.5);

    this.add.text(w / 2, 75, '📚 Библиотека', { fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#ccaa66' }).setOrigin(0.5);

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
    if (onVisit) onVisit('library');
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
    this.nearBookshelf = -1;

    for (let i = 0; i < 4; i++) {
      const sx = 180 + i * 180;
      if (px > sx - 55 && px < sx + 55) { this.nearBookshelf = i; break; }
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
