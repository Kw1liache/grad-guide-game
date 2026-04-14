import Phaser from 'phaser';

export class CorridorScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Image;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private keys!: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; e: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  private nearDoor: string | null = null;
  private nearRadik = false;
  private promptText!: Phaser.GameObjects.Text;
  private facingLeft = false;
  private radikContainer!: Phaser.GameObjects.Container;
  private radikBobTime = 0;
  private charId!: string;

  constructor() {
    super({ key: 'CorridorScene' });
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

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a1e2e);

    // Floor
    this.add.rectangle(w / 2, h - 30, w, 60, 0x2a2e3e);
    this.add.rectangle(w / 2, h - 58, w, 4, 0x3a3e4e);
    for (let x = 0; x < w; x += 48) {
      this.add.rectangle(x + 24, h - 30, 46, 58, (x / 48) % 2 === 0 ? 0x2d3142 : 0x2a2e3e);
    }

    // Walls & ceiling
    this.add.rectangle(w / 2, 40, w, 80, 0x252838);
    this.add.rectangle(w / 2, 80, w, 2, 0x3a3e4e);

    // Lamps
    for (let lx = 150; lx < w; lx += 200) {
      this.add.rectangle(lx, 82, 24, 4, 0x667788);
      this.add.rectangle(lx, 82, 20, 2, 0xaabbcc);
    }

    // Doors
    const doorPositions = [
      { x: 120, label: 'Библиотека', scene: 'LibraryScene', emoji: '📚', color: 0x5a4a3a },
      { x: 340, label: 'Лекционная', scene: 'LectureRoomScene', emoji: '🎓', color: 0x4a6a3a },
      { x: 560, label: 'Лаборатория', scene: 'LabScene', emoji: '🔬', color: 0x3a4a6a },
      { x: 780, label: 'Деканат', scene: 'DeanScene', emoji: '🏛️', color: 0x4a3a5a },
    ];

    doorPositions.forEach(dp => {
      this.add.rectangle(dp.x, h - 130, 80, 140, 0x1a1520);
      this.add.rectangle(dp.x, h - 130, 72, 132, dp.color);
      this.add.circle(dp.x + 28, h - 120, 4, 0xccaa44);
      this.add.rectangle(dp.x, h - 160, 30, 20, 0x223344);
      this.add.rectangle(dp.x, h - 160, 26, 16, 0x334455);
      this.add.text(dp.x, h - 215, dp.emoji, { fontSize: '12px' }).setOrigin(0.5);
      this.add.text(dp.x, h - 200, dp.label, {
        fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#66ff88',
      }).setOrigin(0.5);
    });

    // Windows
    [230, 450, 670].forEach(wx => {
      this.add.rectangle(wx, 160, 50, 45, 0x223355);
      this.add.rectangle(wx, 160, 46, 41, 0x334488);
      this.add.rectangle(wx, 160, 2, 41, 0x556688);
      this.add.rectangle(wx, 160, 46, 2, 0x556688);
    });

    // Poster
    this.add.rectangle(900, 170, 40, 55, 0xeecc44);
    this.add.text(900, 155, '📌', { fontSize: '10px' }).setOrigin(0.5);
    this.add.text(900, 175, 'ИРИТ', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);
    this.add.text(900, 188, 'РТФ', { fontSize: '5px', fontFamily: '"Press Start 2P"', color: '#333' }).setOrigin(0.5);

    // Plant
    this.add.rectangle(30, h - 85, 16, 30, 0x5a3a2a);
    this.add.circle(30, h - 108, 14, 0x33aa44);
    this.add.circle(24, h - 115, 8, 0x44bb55);
    this.add.circle(36, h - 112, 10, 0x55cc66);

    // Bench
    this.add.rectangle(920, h - 70, 50, 10, 0x554433);
    this.add.rectangle(900, h - 55, 5, 20, 0x443322);
    this.add.rectangle(940, h - 55, 5, 20, 0x443322);

    // Radik - robot cat in blue/cyan/white
    this.radikContainer = this.createRadik(500, h - 88);

    // Player sprite
    this.player = this.add.image(60, h - 100, 'player_right');
    this.player.setScale(0.08);
    this.player.setDepth(5);
    this.physics.add.existing(this.player);

    // Physics
    const ground = this.add.rectangle(w / 2, h - 60, w, 4);
    this.physics.add.existing(ground, true);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(300, 400);
    this.playerBody.setOffset(100, 60);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, ground);

    // Input
    this.keys = {
      a: this.input.keyboard!.addKey('A'),
      d: this.input.keyboard!.addKey('D'),
      e: this.input.keyboard!.addKey('E'),
      space: this.input.keyboard!.addKey('SPACE'),
      esc: this.input.keyboard!.addKey('ESC'),
    };

    this.promptText = this.add.text(w / 2, h - 250, '', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#ffcc44',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5).setDepth(10);

    const onVisit = this.registry.get('onVisitRoom');
    if (onVisit) onVisit('corridor');
  }

  private createRadik(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Robot cat body - blue/cyan
    const bodyMain = this.add.rectangle(0, 4, 20, 22, 0x2288cc);
    // Metallic belly
    const belly = this.add.rectangle(0, 8, 12, 10, 0xccddee);
    // Head - white/light blue
    const head = this.add.rectangle(0, -12, 18, 16, 0xddeeff);
    // Cat ears (triangular via rectangles)
    const earL = this.add.rectangle(-8, -23, 6, 8, 0x2288cc);
    const earR = this.add.rectangle(8, -23, 6, 8, 0x2288cc);
    // Inner ears - cyan
    const earLInner = this.add.rectangle(-8, -22, 3, 5, 0x44ddff);
    const earRInner = this.add.rectangle(8, -22, 3, 5, 0x44ddff);
    // Eyes - glowing cyan
    const eyeL = this.add.rectangle(-4, -13, 5, 4, 0x00ffff);
    const eyeR = this.add.rectangle(4, -13, 5, 4, 0x00ffff);
    // Pupils
    const pupilL = this.add.rectangle(-3, -13, 2, 3, 0x0066aa);
    const pupilR = this.add.rectangle(5, -13, 2, 3, 0x0066aa);
    // Nose - small triangle
    const nose = this.add.rectangle(0, -9, 3, 2, 0xff6688);
    // Whiskers (lines via thin rects)
    const whiskerL1 = this.add.rectangle(-12, -10, 8, 1, 0x99bbcc);
    const whiskerL2 = this.add.rectangle(-12, -7, 8, 1, 0x99bbcc);
    const whiskerR1 = this.add.rectangle(12, -10, 8, 1, 0x99bbcc);
    const whiskerR2 = this.add.rectangle(12, -7, 8, 1, 0x99bbcc);
    // Legs - metallic
    const legL = this.add.rectangle(-5, 18, 7, 8, 0x1a6699);
    const legR = this.add.rectangle(5, 18, 7, 8, 0x1a6699);
    // Paws - white
    const pawL = this.add.rectangle(-5, 24, 8, 5, 0xeeeeff);
    const pawR = this.add.rectangle(5, 24, 8, 5, 0xeeeeff);
    // Tail - curved blue
    const tail1 = this.add.rectangle(12, 0, 4, 6, 0x2288cc);
    const tail2 = this.add.rectangle(15, -4, 4, 6, 0x44aadd);
    const tail3 = this.add.rectangle(17, -9, 4, 4, 0x66ccff);
    // Antenna / tech detail on head
    const antenna = this.add.rectangle(0, -28, 2, 6, 0x99bbcc);
    const antennaTop = this.add.circle(0, -32, 2, 0x00ffff);
    // Circuit lines on body
    const circuit1 = this.add.rectangle(-4, 2, 1, 8, 0x44ddff);
    const circuit2 = this.add.rectangle(4, 6, 1, 6, 0x44ddff);

    container.add([
      bodyMain, belly, head, earL, earR, earLInner, earRInner,
      eyeL, eyeR, pupilL, pupilR, nose,
      whiskerL1, whiskerL2, whiskerR1, whiskerR2,
      legL, legR, pawL, pawR, tail1, tail2, tail3,
      antenna, antennaTop, circuit1, circuit2,
    ]);
    container.setDepth(4);

    // Label
    this.add.text(x, y - 45, 'Радик 🐱', {
      fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#44ddff',
    }).setOrigin(0.5).setDepth(4);

    // Speech bubble
    const bubble = this.add.text(x, y - 60, '💬', { fontSize: '10px' }).setOrigin(0.5).setDepth(4);
    this.tweens.add({
      targets: bubble, y: y - 65, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Eye glow pulse
    this.tweens.add({
      targets: [eyeL, eyeR], alpha: 0.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    return container;
  }

  update(_time: number, delta: number) {
    const uiOpen = this.registry.get('uiOpen');
    const body = this.playerBody;

    if (uiOpen) {
      body.setVelocityX(0);
      return;
    }

    const speed = 200;

    if (this.keys.a.isDown) {
      body.setVelocityX(-speed);
      if (!this.facingLeft) {
        this.player.setTexture('player_left');
        this.facingLeft = true;
      }
    } else if (this.keys.d.isDown) {
      body.setVelocityX(speed);
      if (this.facingLeft) {
        this.player.setTexture('player_right');
        this.facingLeft = false;
      }
    } else {
      body.setVelocityX(0);
    }

    if (this.keys.space.isDown && body.blocked.down) {
      body.setVelocityY(-400);
    }

    // ESC -> settings
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      const cb = this.registry.get('onOpenSettings');
      if (cb) cb();
      return;
    }

    // Radik bob
    this.radikBobTime += delta;
    this.radikContainer.y = (540 - 88) + Math.sin(this.radikBobTime * 0.003) * 2;

    const px = this.player.x;
    this.nearDoor = null;
    this.nearRadik = false;

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
