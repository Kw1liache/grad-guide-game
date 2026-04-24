import Phaser from 'phaser';

export class DeanScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private nearBoard = -1;
  private nearDoor = false;
  private charId!: string;
  private returnFloor = 3;
  private returnX = 1000;

  constructor() {
    super({ key: 'DeanScene' });
  }

  init(data: { returnFloor?: number; returnX?: number }) {
    this.returnFloor = data?.returnFloor ?? 3;
    this.returnX = data?.returnX ?? 1000;
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
    const w = 960, h = 540;

    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a24);
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a2244);
    for (let x = 0; x < w; x += 24) {
      this.add.rectangle(x + 12, h - 30, 22, 58, (x / 24) % 2 === 0 ? 0x2e2648 : 0x2a2244);
    }
    this.add.rectangle(w / 2, h - 58, w - 40, 2, 0x4a3a5a);
    this.add.rectangle(w / 2, 30, w, 60, 0x222235);

    this.add.rectangle(w / 2, 62, 4, 20, 0x887744);
    this.add.rectangle(w / 2, 75, 40, 8, 0xaa9944);
    for (let i = -1; i <= 1; i++) { this.add.circle(w / 2 + i * 14, 82, 4, 0xffdd66); }

    this.add.text(w / 2, 80, '🏛️ Деканат', { fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#aa88cc' }).setOrigin(0.5);

    // Boards
    this.add.rectangle(200, 200, 140, 100, 0x334433);
    this.add.rectangle(200, 200, 134, 94, 0xddddcc);
    this.add.text(200, 165, '📋 Расписание', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#334433' }).setOrigin(0.5);
    for (let l = 0; l < 4; l++) {
      this.add.rectangle(200, 185 + l * 12, 110, 2, 0xaaaaaa);
      this.add.rectangle(165, 185 + l * 12, 20, 6, 0x88aa88);
    }

    this.add.rectangle(480, 200, 160, 100, 0x443322);
    this.add.rectangle(480, 200, 154, 94, 0x554433);
    this.add.text(480, 162, '🏆 Доска почёта', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#ffcc44' }).setOrigin(0.5);
    for (let s = 0; s < 3; s++) {
      const sx = 430 + s * 50;
      this.add.rectangle(sx, 200, 30, 36, 0x888888);
      this.add.rectangle(sx, 192, 20, 20, 0xffccaa);
      this.add.rectangle(sx, 210, 20, 10, 0x4466aa);
      this.add.text(sx, 225, '⭐', { fontSize: '6px' }).setOrigin(0.5);
    }

    this.add.rectangle(750, 200, 140, 100, 0x333344);
    this.add.rectangle(750, 200, 134, 94, 0xffffee);
    this.add.text(750, 165, '📢 Объявления', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#334' }).setOrigin(0.5);
    const noteColors = [0xffee88, 0x88eeff, 0xffaa88, 0xaaff88];
    for (let n = 0; n < 4; n++) {
      const nx = 710 + (n % 2) * 60;
      const ny = 190 + Math.floor(n / 2) * 30;
      this.add.rectangle(nx, ny, 40, 20, noteColors[n]);
      this.add.circle(nx, ny - 8, 2, 0xcc3333);
    }

    // Desk & decorations
    this.add.rectangle(480, h - 75, 120, 12, 0x553322);
    this.add.rectangle(440, h - 55, 6, 40, 0x443322);
    this.add.rectangle(520, h - 55, 6, 40, 0x443322);
    this.add.rectangle(460, h - 86, 14, 10, 0x333333);
    this.add.rectangle(500, h - 84, 8, 12, 0xcc6633);
    this.add.rectangle(480, h - 88, 40, 8, 0xccaa44);
    this.add.text(480, h - 88, 'Декан', { fontSize: '4px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    this.add.rectangle(880, 280, 60, 160, 0x553322);
    for (let sh = 0; sh < 4; sh++) {
      this.add.rectangle(880, 215 + sh * 38, 56, 3, 0x442211);
      for (let b = 0; b < 3; b++) {
        this.add.rectangle(862 + b * 16, 208 + sh * 38, 12, 20 + Math.random() * 10, [0xcc3333, 0x3333cc, 0x33aa33, 0xaaaa33][Math.floor(Math.random() * 4)]);
      }
    }

    this.add.rectangle(120, 280, 50, 120, 0x444466);
    this.add.rectangle(120, 280, 46, 116, 0x334455);
    this.add.text(120, 240, '🏆', { fontSize: '12px' }).setOrigin(0.5);
    this.add.text(120, 270, '🥇', { fontSize: '10px' }).setOrigin(0.5);
    this.add.text(120, 300, '🏅', { fontSize: '10px' }).setOrigin(0.5);

    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a5a);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa88cc' }).setOrigin(0.5);

    this.player = this.add.image(100, h - 100, `player_right_${this.charId}`);
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
    if (onVisit) onVisit('dean');
  }

  update() {
    const uiOpen = this.registry.get('uiOpen');
    const body = this.playerBody;

    if (uiOpen) { body.setVelocityX(0); return; }

    const speed = 200;
    if (this.keys.a.isDown) {
      body.setVelocityX(-speed);
      if (!this.facingLeft) { this.player.setTexture(`player_left_${this.charId}`); this.facingLeft = true; }
    } else if (this.keys.d.isDown) {
      body.setVelocityX(speed);
      if (this.facingLeft) { this.player.setTexture(`player_right_${this.charId}`); this.facingLeft = false; }
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
    this.nearBoard = -1;

    const boardPositions = [200, 480, 750];
    for (let i = 0; i < boardPositions.length; i++) {
      if (px > boardPositions[i] - 60 && px < boardPositions[i] + 60) { this.nearBoard = i; break; }
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
        this.scene.start('CorridorScene', { floor: this.returnFloor, spawnX: this.returnX });
      }
    }
  }
}
