class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  preload() {

  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(600, 80, 'CHOCOLATE SEXY, LA AVENTURA', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const story = `
En una ciudad dominada por las VERBENAS...

Alvarito & Guille, los MC's chocolateros,
quieren ganarse su hueco en el mercado.

Las fans quieren su CARIÑO.
Los políticos su DINERO y ENCHUFES.
Los críticos quieren SUS BARRAS.

CHOCOLATE SEXY TE LO TRAE BIEN DURO!
`;

    const text = this.add.text(600, 700, story, {
      fontSize: '26px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: 220,
      duration: 12000,
      ease: 'Linear'
    });

    this.add.text(600, 420, '← → MOVER    |    1 CORAZÓN    |    2 DINERO    |    3 BARRAS', {
      fontSize: '22px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    this.add.text(600, 460, 'Haz click o pulsa una tecla para activar música', {
      fontSize: '20px',
      color: '#bbbbbb'
    }).setOrigin(0.5);

    this.add.text(600, 495, 'Pulsa ESPACIO para empezar', {
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      if (this.introMusic && this.introMusic.isPlaying) {
        this.introMusic.stop();
      }
      this.scene.start('GameScene');
    });
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('player_idle', 'assets/choco1.png');
    this.load.image('player_shoot', 'assets/choco2.png');

    this.load.image('note', 'assets/notas.png');
    this.load.image('heart', 'assets/cuore.png');
    this.load.image('money', 'assets/pasta.png');

    this.load.image('politico', 'assets/politico.png');
    this.load.image('grupis', 'assets/grupis.png');
    this.load.image('critico', 'assets/critico.png');

    this.load.image('bg', 'assets/background.png');

    this.load.audio('music', 'assets/music.mp3');
    this.load.audio('shot', 'assets/shot.wav');
  }

  create() {
    this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'bg');

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    player = this.physics.add.sprite(120, PLAYER_Y, 'player_idle');
    player.setScale(0.16);
    player.setOrigin(0.5, 1);
    player.body.allowGravity = false;
    player.setCollideWorldBounds(true);

    player.body.setSize(player.width * 0.45, player.height * 0.85);
    player.body.setOffset(player.width * 0.28, player.height * 0.12);

    this.cameras.main.startFollow(player, true, 0.08, 0.08);

    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    playerBullets = this.physics.add.group();
    enemies = this.physics.add.group();

    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: spawnPolitico,
      callbackScope: this
    });

    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: spawnGroupies,
      callbackScope: this
    });

    this.time.addEvent({
      delay: 7000,
      loop: true,
      callback: spawnCritico,
      callbackScope: this
    });

    this.physics.add.overlap(playerBullets, enemies, hitEnemy, null, this);
    this.physics.add.overlap(player, enemies, playerDies, null, this);

    ammoText = this.add.text(20, 20, '', {
      fontSize: '22px',
      fill: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 6 }
    });
    ammoText.setScrollFactor(0);

    gameOverText = this.add.text(600, 275, 'GAME OVER\nPulsa R para reiniciar', {
      fontSize: '42px',
      fill: '#ff4444',
      align: 'center',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setStroke('#000000', 6);
    gameOverText.setVisible(false);

    updateAmmoText();

    music = this.sound.add('music', {
      loop: true,
      volume: 0.5
    });

    if (!music.isPlaying) {
      music.play();
    }

    this.shotSound = this.sound.add('shot', {
      volume: 0.4
    });
  }

  update() {
    if (isGameOver) {
      if (rKey.isDown) {
        location.reload();
      }
      return;
    }

    player.setVelocityX(0);

    if (cursors.left.isDown) {
      player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      player.setVelocityX(200);
    }

    if (Phaser.Input.Keyboard.JustDown(key1) && canShoot) {
      currentWeapon = 'heart';
      shootProjectile.call(this);
    }

    if (Phaser.Input.Keyboard.JustDown(key2) && canShoot) {
      currentWeapon = 'money';
      shootProjectile.call(this);
    }

    if (Phaser.Input.Keyboard.JustDown(key3) && canShoot) {
      currentWeapon = 'note';
      shootProjectile.call(this);
    }

    if (Phaser.Input.Keyboard.JustDown(spaceKey) && canShoot) {
      shootProjectile.call(this);
    }

    playerBullets.getChildren().forEach(bullet => {
      if (bullet.x > WORLD_WIDTH + 100 || bullet.x < -100) {
        bullet.destroy();
      }
    });

    enemies.getChildren().forEach(enemy => {
      if (enemy.x < -200) {
        enemy.destroy();
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 550,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [IntroScene, GameScene]
};

const game = new Phaser.Game(config);

let player;
let cursors;
let spaceKey;
let key1, key2, key3, rKey;

let playerBullets;
let enemies;

let canShoot = true;
let currentWeapon = 'note';
let isGameOver = false;

let ammo = {
  heart: 10,
  money: 10,
  note: 10
};

let ammoText;
let gameOverText;
let music;

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 550;

const PLAYER_Y = 535;
const POLITICO_Y = 550;
const GROUPIES_Y = 520;
const CRITICO_Y = 550;

function shootProjectile() {
  if (ammo[currentWeapon] <= 0) {
    return;
  }

  ammo[currentWeapon] -= 1;
  updateAmmoText();

  canShoot = false;
  player.setTexture('player_shoot');

  const bullet = playerBullets.create(player.x + 55, player.y - 125, currentWeapon);

  if (!bullet || !bullet.texture || !bullet.texture.key) {
    canShoot = true;
    player.setTexture('player_idle');
    return;
  }

  if (this.shotSound) {
    this.shotSound.play();
  }

  bullet.setOrigin(0.5, 0.5);
  bullet.body.allowGravity = false;
  bullet.setVelocityX(420);
  bullet.weaponType = currentWeapon;

  if (currentWeapon === 'heart') {
    bullet.setScale(0.08);
  } else if (currentWeapon === 'money') {
    bullet.setScale(0.10);
  } else {
    bullet.setScale(0.10);
  }

  bullet.body.setSize(bullet.width * 0.6, bullet.height * 0.6, true);

  this.time.delayedCall(120, () => {
    if (player && player.active) {
      player.setTexture('player_idle');
    }
  });

  this.time.delayedCall(220, () => {
    canShoot = true;
  });
}

function spawnPolitico() {
  if (isGameOver) return;

  const enemy = enemies.create(WORLD_WIDTH, POLITICO_Y, 'politico');
  enemy.setScale(0.16);
  enemy.setOrigin(0.5, 1);
  enemy.body.allowGravity = false;
  enemy.setVelocityX(-120);

  enemy.enemyType = 'politico';

  enemy.body.setSize(enemy.width * 0.4, enemy.height * 0.85);
  enemy.body.setOffset(enemy.width * 0.3, enemy.height * 0.12);
}

function spawnGroupies() {
  if (isGameOver) return;

  const enemy = enemies.create(WORLD_WIDTH, GROUPIES_Y, 'grupis');
  enemy.setScale(0.16);
  enemy.setOrigin(0.5, 1);
  enemy.body.allowGravity = false;
  enemy.setVelocityX(-90);

  enemy.enemyType = 'grupis';

  enemy.body.setSize(enemy.width * 0.5, enemy.height * 0.85);
  enemy.body.setOffset(enemy.width * 0.25, enemy.height * 0.12);
}

function spawnCritico() {
  if (isGameOver) return;

  const enemy = enemies.create(WORLD_WIDTH, CRITICO_Y, 'critico');
  enemy.setScale(0.16);
  enemy.setOrigin(0.5, 1);
  enemy.body.allowGravity = false;
  enemy.setVelocityX(-110);

  enemy.enemyType = 'critico';

  enemy.body.setSize(enemy.width * 0.45, enemy.height * 0.85);
  enemy.body.setOffset(enemy.width * 0.28, enemy.height * 0.12);
}

function hitEnemy(bullet, enemy) {
  const correctHit =
    (bullet.weaponType === 'heart' && enemy.enemyType === 'grupis') ||
    (bullet.weaponType === 'money' && enemy.enemyType === 'politico') ||
    (bullet.weaponType === 'note' && enemy.enemyType === 'critico');

  bullet.destroy();

  if (correctHit) {
    ammo[bullet.weaponType] += 2;
    updateAmmoText();
    enemy.destroy();
  } else {
    enemy.setTint(0xff6666);

    setTimeout(() => {
      if (enemy.active) {
        enemy.clearTint();
      }
    }, 150);
  }
}

function playerDies(playerSprite, enemy) {
  if (isGameOver) return;

  isGameOver = true;

  playerSprite.setTint(0xff0000);
  playerSprite.setVelocityX(0);

  enemies.getChildren().forEach(e => {
    e.setVelocityX(0);
  });

  playerBullets.getChildren().forEach(b => {
    b.setVelocityX(0);
  });

  if (music && music.isPlaying) {
    music.stop();
  }

  gameOverText.setVisible(true);
}

function updateAmmoText() {
  ammoText.setText(`❤️ ${ammo.heart}    💸 ${ammo.money}    🎵 ${ammo.note}`);
}