import Phaser from 'phaser';
import { characters } from '../data';

export class CorridorScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private nearDoor: string | null = null;
  private nearRadik = false;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private radikContainer!: Phaser.GameObjects.Container;
  private radikBobTime = 0;

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

    // Corridor lamps
    for (let lx = 150; lx < w; lx += 200) {
      this.add.rectangle(lx, 82, 24, 4, 0x667788);
      this.add.rectangle(lx, 82, 20, 2, 0xaabbcc);
    }

    // Doors - ALL ACTIVE NOW
    const doorPositions = [
      { x: 120, label: 'Библиотека', scene: 'LibraryScene', emoji: '📚', color: 0x5a4a3a },
      { x: 340, label: 'Лекционная', scene: 'LectureRoomScene', emoji: '🎓', color: 0x4a6a3a },
      { x: 560, label: 'Лаборатория', scene: 'LabScene', emoji: '🔬', color: 0x3a4a6a },
      { x: 780, label: 'Деканат', scene: 'DeanScene', emoji: '🏛️', color: 0x4a3a5a },
    ];

    doorPositions.forEach(dp => {
      // Door frame
      this.add.rectangle(dp.x, h - 130, 80, 140, 0x1a1520);
      // Door
      this.add.rectangle(dp.x, h - 130, 72, 132, dp.color);
      // Handle
      this.add.circle(dp.x + 28, h - 120, 4, 0xccaa44);
      // Window on door
      this.add.rectangle(dp.x, h - 160, 30, 20, 0x223344);
      this.add.rectangle(dp.x, h - 160, 26, 16, 0x334455);
      // Label
      this.add.text(dp.x, h - 215, dp.emoji, { fontSize: '12px' }).setOrigin(0.5);
      this.add.text(dp.x, h - 200, dp.label, {
        fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#66ff88',
      }).setOrigin(0.5);
    });

    // Windows between doors
    const windowPositions = [230, 450, 670];
    windowPositions.forEach(wx => {
      this.add.rectangle(wx, 160, 50, 45, 0x223355);
      this.add.rectangle(wx, 160, 46, 41, 0x334488);
      this.add.rectangle(wx, 160, 2, 41, 0x556688);
      this.add.rectangle(wx, 160, 46, 2, 0x556688);
    });

    // Info posters on walls
    this.add.rectangle(900, 170, 40, 55, 0xeecc44);
    this.add.text(900, 155, '📌', { fontSize: '10px' }).setOrigin(0.5);
    this.add.text(900, 175, 'ИРИТ', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);
    this.add.text(900, 188, 'РТФ', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    // Plant decoration
    this.add.rectangle(30, h - 85, 16, 30, 0x5a3a2a);
    this.add.circle(30, h - 108, 14, 0x33aa44);
    this.add.circle(24, h - 115, 8, 0x44bb55);
    this.add.circle(36, h - 112, 10, 0x55cc66);

    // Bench
    this.add.rectangle(920, h - 70, 50, 10, 0x554433);
    this.add.rectangle(900, h - 55, 5, 20, 0x443322);
    this.add.rectangle(940, h - 55, 5, 20, 0x443322);

    // ===== RADIK NPC =====
    this.radikContainer = this.createRadik(500, h - 88);

    // Create player
    this.player = this.createPixelCharacter(60, h - 100, charData.color);

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

    // Prompt text
    this.promptText = this.add.text(w / 2, h - 250, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    // Notify corridor visit
    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('corridor');
  }

  private createRadik(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    // Body - bright orange hoodie
    const body = this.add.rectangle(0, 4, 18, 22, 0xff6622);
    // Hood detail
    this.add.rectangle(0, -4, 20, 4, 0xee5511);
    // Head
    const head = this.add.rectangle(0, -12, 15, 15, 0xffccaa);
    // Eyes (happy squint)
    const eyeL = this.add.rectangle(-3, -13, 4, 2, 0x222222);
    const eyeR = this.add.rectangle(3, -13, 4, 2, 0x222222);
    // Big smile
    const mouth = this.add.rectangle(0, -9, 6, 2, 0xcc6644);
    // Hair (spiky)
    const hair1 = this.add.rectangle(-4, -21, 5, 6, 0xffaa22);
    const hair2 = this.add.rectangle(0, -23, 5, 8, 0xffaa22);
    const hair3 = this.add.rectangle(4, -21, 5, 6, 0xffaa22);
    // Legs
    const legL = this.add.rectangle(-5, 18, 7, 8, 0x3344aa);
    const legR = this.add.rectangle(5, 18, 7, 8, 0x3344aa);
    // Sneakers
    const shoeL = this.add.rectangle(-5, 24, 8, 5, 0xeeeeee);
    const shoeR = this.add.rectangle(5, 24, 8, 5, 0xeeeeee);
    // Star badge on hoodie
    this.add.text(0, 2, '⭐', { fontSize: '6px' }).setOrigin(0.5);

    container.add([body, head, eyeL, eyeR, mouth, hair1, hair2, hair3, legL, legR, shoeL, shoeR]);
    container.setDepth(4);

    // Label
    this.add.text(x, y - 40, 'Радик', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ff8844',
    }).setOrigin(0.5).setDepth(4);

    // Speech bubble hint
    const bubble = this.add.text(x, y - 55, '💬', {
      fontSize: '10px',
    }).setOrigin(0.5).setDepth(4);

    this.tweens.add({
      targets: bubble,
      y: y - 60,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    return container;
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

  update(_time: number, delta: number) {
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

    // Radik idle bob
    this.radikBobTime += delta;
    this.radikContainer.y = (540 - 88) + Math.sin(this.radikBobTime * 0.003) * 2;

    const px = this.player.x;
    this.nearDoor = null;
    this.nearRadik = false;

    // Door zones
    const doors = [
      { x: 120, range: 45, scene: 'LibraryScene', label: 'библиотеку' },
      { x: 340, range: 45, scene: 'LectureRoomScene', label: 'лекционную' },
      { x: 560, range: 45, scene: 'LabScene', label: 'лабораторию' },
      { x: 780, range: 45, scene: 'DeanScene', label: 'деканат' },
    ];

    for (const d of doors) {
      if (px > d.x - d.range && px < d.x + d.range) {
        this.nearDoor = d.scene;
        this.promptText.setText(`[E] Войти в ${d.label}`);
        this.promptText.setX(d.x);
        this.promptText.setVisible(true);
        break;
      }
    }

    // Radik zone
    if (!this.nearDoor && px > 460 && px < 540) {
      this.nearRadik = true;
      this.promptText.setText('[E] Поговорить с Радиком');
      this.promptText.setX(500);
      this.promptText.setVisible(true);
    }

    if (!this.nearDoor && !this.nearRadik) {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.e)) {
      if (this.nearDoor) {
        this.scene.start(this.nearDoor);
      } else if (this.nearRadik) {
        const cb = this.registry.get('onTalkRadik');
        if (cb) cb();
      }
    }
  }
}
