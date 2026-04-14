import Phaser from 'phaser';

export class LectureRoomScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private nearNPC = false;
  private nearLaptop = false;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private charId!: string;

  constructor() {
    super({ key: 'LectureRoomScene' });
  }

  preload() {
    this.charId = this.registry.get('characterId') || 'char_a';
    if (this.charId === 'char_b') {
      this.load.image('player_left', '/sprites/girl_left.png');
      this.load.image('player_right', '/sprites/girl_right.png');
    } else {
      this.load.image('player_left', '/sprites/boy_left.png');
      this.load.image('player_right', '/sprites/boy_right.png');
    }
  }

  create() {
    const w = 960, h = 540;

    this.add.rectangle(w / 2, h / 2, w, h, 0x1e2230);
    this.add.rectangle(w / 2, h - 30, w, 60, 0x3a3228);
    for (let x = 0; x < w; x += 40) {
      this.add.rectangle(x + 20, h - 30, 38, 58, (x / 40) % 2 === 0 ? 0x3e3630 : 0x3a3228);
    }
    this.add.rectangle(w / 2, 30, w, 60, 0x252838);

    // Blackboard
    this.add.rectangle(200, 160, 200, 100, 0x1a3a1a);
    this.add.rectangle(200, 160, 192, 92, 0x224422);
    this.add.text(200, 145, 'ИРИТ-РТФ', { fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#aaccaa' }).setOrigin(0.5);
    this.add.text(200, 170, 'Лекция #1', { fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#88aa88' }).setOrigin(0.5);

    this.createNPC(280, h - 85);
    this.createLaptop(380, h - 80);

    // Seating
    for (let row = 0; row < 3; row++) {
      const ry = h - 80 - row * 5;
      const rx = 550 + row * 60;
      for (let s = 0; s < 4; s++) {
        const sx = rx + s * 50;
        if (sx < w - 30) {
          this.add.rectangle(sx, ry + 5, 30, 24, 0x554433);
          this.add.rectangle(sx, ry - 8, 28, 4, 0x665544);
          this.add.rectangle(sx, ry - 14, 34, 4, 0x443322);
        }
      }
    }

    // Door
    this.add.rectangle(50, h - 100, 60, 120, 0x1a1520);
    this.add.rectangle(50, h - 100, 52, 112, 0x4a3a30);
    this.add.circle(72, h - 95, 3, 0xccaa44);
    this.add.text(50, h - 170, 'Выход', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#aa8866' }).setOrigin(0.5);

    // Player
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
    if (onVisit) onVisit('lecture');
  }

  private createNPC(x: number, y: number) {
    this.add.rectangle(x, y + 4, 18, 22, 0x884422);
    this.add.rectangle(x, y - 12, 16, 16, 0xffccaa);
    this.add.rectangle(x - 4, y - 14, 6, 4, 0x4466aa).setAlpha(0.7);
    this.add.rectangle(x + 4, y - 14, 6, 4, 0x4466aa).setAlpha(0.7);
    this.add.rectangle(x, y - 14, 4, 2, 0x4466aa).setAlpha(0.7);
    this.add.rectangle(x, y - 21, 18, 4, 0x555555);
    this.add.text(x, y - 35, 'Лектор', { fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#ffcc44' }).setOrigin(0.5);
  }

  private createLaptop(x: number, y: number) {
    this.add.rectangle(x, y + 10, 8, 20, 0x555555);
    this.add.rectangle(x, y + 22, 20, 4, 0x444444);
    this.add.rectangle(x, y - 2, 30, 4, 0x333333);
    this.add.rectangle(x, y - 14, 28, 20, 0x222222);
    this.add.rectangle(x, y - 14, 24, 16, 0x2244aa);
    this.add.text(x, y - 14, '💻', { fontSize: '8px' }).setOrigin(0.5);
    this.add.text(x, y - 32, 'Ноутбук', { fontSize: '6px', fontFamily: '"Press Start 2P"', color: '#6688ff' }).setOrigin(0.5);
  }

  update() {
    const uiOpen = this.registry.get('uiOpen');
    const body = this.playerBody;

    if (uiOpen) {
      body.setVelocityX(0);
      return;
    }

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

    if (this.keys.space.isDown && body.blocked.down) {
      body.setVelocityY(-400);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      const cb = this.registry.get('onOpenSettings');
      if (cb) cb();
      return;
    }

    const px = this.player.x;
    this.nearNPC = px > 240 && px < 320;
    this.nearLaptop = px > 340 && px < 420;
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
