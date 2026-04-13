import Phaser from 'phaser';
import { characters } from '../data';

export class CorridorScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private nearDoor: string | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;

  constructor() {
    super({ key: 'CorridorScene' });
  }

  create() {
    const w = 960, h = 540;
    const charId = this.registry.get('characterId');
    const charData = characters.find(c => c.id === charId) || characters[0];

    // Background - corridor
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1e2e);
    
    // Floor
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a2e3e);
    this.add.rectangle(w / 2, h - 58, w, 4, 0x3a3e4e);
    
    // Walls
    this.add.rectangle(w / 2, 40, w, 80, 0x252838);
    
    // Ceiling line
    this.add.rectangle(w / 2, 80, w, 2, 0x3a3e4e);

    // Floor tiles
    for (let x = 0; x < w; x += 48) {
      this.add.rectangle(x + 24, h - 30, 46, 58, (x / 48) % 2 === 0 ? 0x2d3142 : 0x2a2e3e);
    }

    // Doors
    const doorPositions = [
      { x: 150, label: 'Библиотека', active: false },
      { x: 400, label: 'Лекционная', active: true },
      { x: 650, label: 'Лаборатория', active: false },
      { x: 850, label: 'Деканат', active: false },
    ];

    doorPositions.forEach(dp => {
      // Door frame
      this.add.rectangle(dp.x, h - 130, 80, 140, 0x1a1520);
      // Door
      const doorColor = dp.active ? 0x4a6a3a : 0x3a3530;
      this.add.rectangle(dp.x, h - 130, 72, 132, doorColor);
      // Handle
      this.add.circle(dp.x + 28, h - 120, 4, 0xccaa44);
      // Label
      const labelColor = dp.active ? '#66ff88' : '#666666';
      this.add.text(dp.x, h - 210, dp.label, {
        fontSize: '8px', fontFamily: '"Press Start 2P"', color: labelColor,
      }).setOrigin(0.5);

      if (!dp.active) {
        this.add.text(dp.x, h - 195, '🔒', { fontSize: '10px' }).setOrigin(0.5);
      }

      // Interaction zone for active door
      if (dp.active) {
        const zone = this.add.zone(dp.x, h - 130, 90, 150).setInteractive();
        zone.setData('doorId', 'lecture');
      }
    });

    // Windows
    for (let i = 0; i < 3; i++) {
      const wx = 250 + i * 200;
      this.add.rectangle(wx, 160, 60, 50, 0x223355);
      this.add.rectangle(wx, 160, 56, 46, 0x334488);
      // Window cross
      this.add.rectangle(wx, 160, 2, 46, 0x556688);
      this.add.rectangle(wx, 160, 56, 2, 0x556688);
    }

    // Create player
    this.player = this.createPixelCharacter(200, h - 100, charData.color);
    
    // Physics
    const floorLine = this.add.rectangle(w / 2, h - 2, w, 4, 0x2a2e3e);
    this.physics.add.existing(floorLine, true);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(24, 36);
    this.playerBody.setOffset(-12, -18);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, floorLine);

    // Ground platform
    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.physics.add.collider(this.player, ground);

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
    };

    // Prompt text
    this.promptText = this.add.text(w / 2, h - 240, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    // Arrow hint
    this.add.text(400, h - 240, '← Используйте A/D для движения →', {
      fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#666688',
    }).setOrigin(0.5).setAlpha(0.8);
  }

  private createPixelCharacter(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Body
    const body = this.add.rectangle(0, 4, 16, 20, color);
    // Head
    const head = this.add.rectangle(0, -12, 14, 14, 0xffccaa);
    // Eyes
    const eyeL = this.add.rectangle(-3, -14, 3, 3, 0x222222);
    const eyeR = this.add.rectangle(3, -14, 3, 3, 0x222222);
    // Hair
    const hair = this.add.rectangle(0, -20, 16, 4, color);
    // Legs
    const legL = this.add.rectangle(-4, 18, 6, 8, color === 0x4488ff ? 0x2244aa : 0xaa3355);
    const legR = this.add.rectangle(4, 18, 6, 8, color === 0x4488ff ? 0x2244aa : 0xaa3355);
    // Shoes
    const shoeL = this.add.rectangle(-4, 23, 7, 4, 0x333333);
    const shoeR = this.add.rectangle(4, 23, 7, 4, 0x333333);

    container.add([body, head, eyeL, eyeR, hair, legL, legR, shoeL, shoeR]);
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

    // Check proximity to lecture door
    const px = this.player.x;
    if (px > 360 && px < 440) {
      this.nearDoor = 'lecture';
      this.promptText.setText('[E] Войти в лекционную');
      this.promptText.setX(400);
      this.promptText.setVisible(true);
    } else {
      this.nearDoor = null;
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e) && this.nearDoor === 'lecture') {
      this.scene.start('LectureRoomScene');
    }
  }
}
