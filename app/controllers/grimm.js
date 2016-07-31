grimm
  .controller('GameCtrl', function ($scope, $location, AuthFactory) {
    //creates a new game object and creates a canvas to display in the HTML 1000 * 500
    var game = new Phaser.Game(1000, 500, Phaser.AUTO, 'gameCanvas');

    //creates a new state for the game
    let lvl1 = {preload: preload, create: create,update: update, render: render};
    game.state.add('lvl1', lvl1);
    game.state.start('lvl1');


    //Loads all of the assets that will be used in the game
    function preload() {
      game.load.audio('backgroundMusic', ['assets/audio/Dungeon-Background.mp3']);
      game.load.audio('playerHurt', ['assets/audio/playerHurt.wav']);
      game.load.audio('playerLoss', ['assets/audio/youLose.wav']);
      game.load.audio('coinDing', ['assets/audio/coinSound.wav']);
      game.load.audio('winSound', ['assets/audio/winSound.mp3']);
      game.load.tilemap('basic_map', 'assets/maps/grimm_level1.json', null, Phaser.Tilemap.TILED_JSON);
      game.load.image('tileset', 'assets/tilesets/sheetbw.png');
      game.load.image('tileset2', 'assets/tilesets/nautical_tilesheetbw.png');
      game.load.image('tileset3', 'assets/tilesets/spikes.png');
      game.load.image('background', 'assets/backgrounds/bloodPattern1.png');
      game.load.image('saw', 'assets/sprites/Obstacle-2/Obstacle-2_000.png');
      game.load.image('enemyBullet', 'assets/dye/enemyBullet.png');
      game.load.image('pBullet', 'assets/sprites/playerBullet.png');
      game.load.spritesheet('fallingSpike', 'assets/tilesets/spikesCeiling.png', 35, 35);
      game.load.spritesheet('ninja', 'assets/sprites/ninja.png', 50, 50);
      game.load.spritesheet('coinSprite', 'assets/sprites/coin.png', 25, 25);
      game.load.spritesheet('gunSprite', 'assets/sprites/gunSprite.png', 70, 70);
      game.load.spritesheet('shroomSprite', 'assets/sprites/mushroom2.png', 35, 34);
      game.load.spritesheet('whiteSaws', 'assets/sprites/whiteSaws.png', 75, 75);
      game.load.spritesheet('redSaws', 'assets/sprites/redSaws.png', 75, 75);
      game.load.spritesheet('leverSprite', 'assets/sprites/laserSprite.png', 70, 70);
      game.load.spritesheet('stepSprite', 'assets/sprites/fallingStep.png', 35, 35);
    }

    let music;
    let hurtSound;
    let youLose;
    let ding;
    let youWin;
    let map;
    let p;
    let jumpTimer = 0;
    let cursors;
    let ground;
    let danger;
    let coinsGroup;
    let bullet;
    let bullets;
    let playerBullets;
    let playerBullet;
    let playerBulletTime = 0;
    let gunsGroup;
    let shroomGroup;
    let stillSawsGroup;
    let movingSawsGroup;
    let enemyCollision;
    let lever;
    let fallingStepsGroup;
    let timer;
    let timeText;
    let currentTime = 30;
    let score;
    let right = 16;
    let left = 22;
    let facing;
    let shoot;

    function create() {
      //All of the audio that will be in the game is created here so that it
      //can be called later
      music = game.add.audio('backgroundMusic');
      hurtSound = game.add.audio('playerHurt');
      youLose = game.add.audio('playerLoss');
      ding = game.add.audio('coinDing');
      ding.volume = 0.1;
      youWin = game.add.audio('winSound');

      //plays the main earie background music
      music.play();

      //  Enable Arcade physics and set score
      game.physics.startSystem(Phaser.Physics.ARCADE);
      score = 0;
      game.score = score;

      //bounds have been set equal to the canvas size so that the player can't
      //go screen
      game.world.setBounds(0, 0, 1000, 500);
      createLevel1();

      //sets tiles from 1 to 2500 to be collision tiles in each separate layer
      map.setCollisionBetween(1, 2500, true, 'platform');
      map.setCollisionBetween(1, 2500, true, 'dangerZone');
      map.setCollisionBetween(1, 2500, true, 'enemyCollision');

      //sets general game gravity on the y axis to be 600
      game.physics.arcade.gravity.y = 600;

      //creates all of the groups that need to be added to the game
      createCoinsGroup();

      createGunsGroup();

      createBullets();

      createPlayerBullets();

      createShroomGroup();

      createStillSaws();

      createMovingSaws();

      createLever();

      createFallingSteps();

      //  Adds player sprite
      p = game.add.sprite(100, 300, 'ninja');

      playerRun();

      // creates rectangular player body for physics engine
      game.physics.arcade.enable(p);

      //Sets the size of the collision box for the player
      p.body.setSize(28, 34, 8, 13);

      //World bounds are the same as canvas size so this prevents player
      //from going offscreen
      p.body.collideWorldBounds = true;
      // p.body.fixedRotation = true;
      p.body.damping = 0.5;

      camera();
      cursors = game.input.keyboard.createCursorKeys();
      shoot = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      timer = game.time.create();
      timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 30, playerDeath, this);
      timer.start();

      timeText = game.add.text(50, 50, `Current Time: ${currentTime}`, { fontSize: '32px', fill: '#FFF', align: 'right' });
      timeText.fixedToCamera = true;

      game.cameraLastX = game.camera.x;
      game.cameraLastY = game.camera.y;

      timer.loop(1000, () => currentTime--);
    }

    function update() {
      game.physics.arcade.collide(p, ground);
      game.physics.arcade.collide(p, danger, playerDeath);
      game.physics.arcade.collide(p, gunsGroup);
      game.physics.arcade.collide(coinsGroup, ground);
      game.physics.arcade.collide(shroomGroup, ground);
      game.physics.arcade.collide(shroomGroup, enemyCollision);
      game.physics.arcade.collide(stillSawsGroup, enemyCollision);
      game.physics.arcade.collide(movingSawsGroup, enemyCollision);
      game.physics.arcade.collide(lever, ground);
      game.physics.arcade.collide(p, fallingStepsGroup);
      game.physics.arcade.collide(fallingStepsGroup, enemyCollision);
      game.physics.arcade.overlap(p, bullet, bulletKill, null, this);
      game.physics.arcade.overlap(p, shroomGroup, playerDeath, null, this);
      game.physics.arcade.overlap(p, movingSawsGroup, playerDeath, null, this);
      game.physics.arcade.overlap(playerBullet, shroomGroup, shroomDeath, null, this);
      game.physics.arcade.overlap(playerBullet, bullets, enemyPlayerBulletKill, null, this);
      game.physics.arcade.overlap(p, coinsGroup, collectCoin, null, this);
      game.physics.arcade.overlap(p, lever, flipLever, null, this);

      gunsGroup.forEach(function(gun){
        if(gun.body.x - p.body.x <= 300) {
          gunFire(gun);
        }
      });
      gunsGroup.forEachAlive(function(bullet){
        if(bullet.body.y - game.cameraLastY <= 0) {
          bullet.kill();
        }
      });

      playerBullets.forEachAlive(function(playerBullet){
        // let distanceFromPlayer = 600;
        if(Math.abs(p.x - playerBullet.x) >= 300) {
          playerBullet.kill();
        }
      }, this);

      p.body.velocity.x = 0;

        /* actual movement */
      if (cursors.left.isDown) {
        p.body.velocity.x = -250;
        p.animations.play('left');
        facing = left;
      } else if (cursors.right.isDown) {
        p.body.velocity.x = 250;
        p.animations.play('right');
        facing = right;
      } else if ( facing === left){
        p.frame = left;
      } else{
        p.frame = right;
      }

      /* Player Firing Shots*/
      if (shoot.isDown) {
        playerFire();
      }

      if (cursors.up.isDown && p.body.onFloor() && game.time.now > jumpTimer) {
        p.body.velocity.y = -350;
        jumpTimer = game.time.now + 500;
      }

      shroomCollision();
      sawCollision();

      if(game.camera.x !== game.cameraLastX){
        game.background.tilePosition.x += 0.5 * (game.cameraLastX - game.camera.x);
        // game.background.tilePosition.y += 0.5 * (game.cameraLastX - game.camera.x);
        game.cameraLastX = game.camera.x;
      }

      timeClock();
    }

    function render() {
      // game.debug.text('Time: ' + parseFloat(this.game.time.totalElapsedSeconds()).toFixed(1), 32, 32);
        // game.debug.body(p);
        // game.debug.bodyInfo(p, 32, 320);
        // game.debug.body(bullets.children[0])


    }

    function camera() {
      game.background.fixedToCamera = true;
      game.camera.follow(p);
    }

    function playerRun() {
      p.animations.add('left', [22, 23, 24, 25, 26], 14, true);
      p.animations.add('right', [16, 17, 18, 19, 20, 21], 14, true);
    }

    function createLevel1() {
      game.background = game.add.tileSprite(0, 0, 1920, 1200, 'background');
      map = game.add.tilemap('basic_map');
      map.addTilesetImage('sheetbw', 'tileset');
      map.addTilesetImage('nautical_tilesheetbw', 'tileset2');
      map.addTilesetImage('spikes', 'tileset3');

      map.setCollisionByExclusion([1]);
      map.createLayer('background');
      danger = map.createLayer('dangerZone');
      ground = map.createLayer('platform');
      enemyCollision = map.createLayer('enemyCollision');
      enemyCollision.alpha = 0;

      ground.resizeWorld();
    }

    function createLever() {
      lever = game.add.group();
      lever.enableBody = true;
      map.createFromObjects('Enemy', 1482, 'leverSprite', 0, true, false, lever);
      lever.callAll('animations.add', 'animations', 'flip', [0, 1], 3, false);
    }

    function flipLever() {
      lever.callAll('animations.play', 'animations', 'flip');
      gameWin();
    }

    function gameWin() {
      youWin.play();
      youWin.fadeOut(4000);
      music.stop();
      hurtSound.stop();
      youLose.stop();
      ding.stop();
      score += 300;
      $scope.currentTime;
      $scope.$apply(function() { $location.path('/win'); });
    }

    function createCoinsGroup() {
      //  Here we create our coins group
      coinsGroup = game.add.group();
      coinsGroup.enableBody = true;

      //  And now we convert all of the Tiled objects with an ID of 1476 into sprites within the coins group
      map.createFromObjects('coins', 1475, 'coinSprite', 0, true, false, coinsGroup);

      //  Add animations to all of the coin sprites
      coinsGroup.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3], 8, true);
      coinsGroup.callAll('animations.play', 'animations', 'spin');
    }

    function collectCoin(p, coin) {
      ding.play();
      coin.kill();
      score += 10;
      currentTime += 2;
    }

    function createShroomGroup() {
      shroomGroup = game.add.group();
      shroomGroup.enableBody = true;

      map.createFromObjects('Enemy', 1474, 'shroomSprite', 0, true, false, shroomGroup);

      shroomGroup.forEach( (shroom) => {
        shroom.body.velocity.x = 100;
      });

      shroomGroup.callAll('animations.add', 'animations', 'eyes', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 5, true);
      shroomGroup.callAll('animations.play', 'animations', 'eyes');
    }

    function shroomCollision() {
      shroomGroup.forEach( (shroom) => {
        if (shroom.body.blocked.right) {
          shroom.body.velocity.x = -200;
        } else if (shroom.body.blocked.left) {
          shroom.body.velocity.x = 200;
        }
      });
    }

    function shroomDeath(bullet, shroom) {
      bullet.kill();
      shroom.kill();
      score += 20;
    }

    function createStillSaws() {
      stillSawsGroup = game.add.group();
      stillSawsGroup.enableBody = true;

      map.createFromObjects('Enemy', 773, 'whiteSaws', 0, true, false, stillSawsGroup);

      stillSawsGroup.forEach( (saw) => {
        saw.body.allowGravity = true;
      });

      stillSawsGroup.callAll('animations.add', 'animations', 'spin', [0, 1, 2], 10, true);
      stillSawsGroup.callAll('animations.play', 'animations', 'spin');
    }

    function createMovingSaws() {
      movingSawsGroup = game.add.group();
      movingSawsGroup.enableBody = true;

      map.createFromObjects('Enemy', 738, 'redSaws', 0, true, false, movingSawsGroup);

      movingSawsGroup.forEach( (saw) => {
        saw.body.velocity.y = 100;
        saw.body.velocity.x = 0;
        saw.body.allowGravity = false;
      });

      movingSawsGroup.callAll('animations.add', 'animations', 'spin', [0, 1, 2], 12, true);
      movingSawsGroup.callAll('animations.play', 'animations', 'spin');
    }

    function sawCollision() {
      movingSawsGroup.forEach( (saw) => {
        if (saw.body.blocked.up) {
          saw.body.velocity.y = 100;
        } else if (saw.body.blocked.down) {
          saw.body.velocity.y = -100;
        }
      });
    }

    function createFallingSteps() {
      fallingStepsGroup = game.add.group();
      fallingStepsGroup.enableBody = true;
      map.createFromObjects('dangerObjects', 181, 'stepSprite', 0, true, false, fallingStepsGroup);

      fallingStepsGroup.forEach(function (step) {
        step.body.allowGravity = false;
      });
    }

    function createGunsGroup() {
      //  Here we create our guns group
      gunsGroup = game.add.group();
      gunsGroup.enableBody = true;

      //  And now we convert all of the Tiled objects with an ID of 1476 into sprites within the coins group
      map.createFromObjects('dangerObjects', 1479, 'gunSprite', 0, true, false, gunsGroup);

      gunsGroup.forEach(function(gun){
        gun.body.allowGravity = false;
        gun.gunTime = 0;
        gun.outOfBoundsKill = true;
        gun.checkWorldBounds = true;
      });


      //  Add animations to all of the gun sprites
      gunsGroup.callAll('animations.add', 'animations', 'fire', [2, 3], 2, true);
      gunsGroup.callAll('animations.play', 'animations', 'fire');
    }

    function createBullets () {
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.createMultiple(100, 'enemyBullet');
      bullets.forEach(function(bullet){
        bullet.allowGravity = false;
        bullet.body.setSize(20, 20);
      });
      // bullets.setAll('anchor.x', 0.5);
      // bullets.setAll('anchor.y', 0.5);
      bullets.setAll('outOfBoundsKill', true);
      bullets.setAll('checkWorldBounds', true);
    }
    function createPlayerBullets () {
      playerBullets = game.add.group();
      playerBullets.enableBody = true;
      playerBullets.createMultiple(10, 'pBullet');
      playerBullets.forEach(function(playerBullet){
        playerBullet.allowGravity = true;
        playerBullet.body.setSize(30, 12);
      });
      // bullets.setAll('anchor.x', 0.5);
      // bullets.setAll('anchor.y', 0.5);
      playerBullets.setAll('outOfBoundsKill', true);
      playerBullets.setAll('checkWorldBounds', true);
    }

    function bulletKill() {
      hurtSound.play();
      bullet.kill();
      loseTime();
    }

    function enemyPlayerBulletKill() {
      bullet.kill();
      playerBullet.kill();
    }

    function gunFire (gun) {
      if (game.time.now > gun.gunTime)
      {
        bullet = bullets.getFirstExists(false);
        if (bullet) {
          bullet.anchor.setTo(0.5, 0.5);
          bullet.reset(gun.body.x +5, gun.body.y +20);
          gun.gunTime = game.time.now + 2000;
          game.physics.arcade.moveToObject(bullet, p, 500);
        }
      }
    }

    function playerFire() {
      if (game.time.now > playerBulletTime  && facing === right) {
        playerBullet = playerBullets.getFirstExists(false);
        if (playerBullet) {
          playerBullet.reset(p.x , p.y + 20);
          playerBullet.body.velocity.x = 600;
          playerBulletTime = game.time.now + 750;
        }
      } else if (game.time.now > playerBulletTime && facing === left) {
        playerBullet = playerBullets.getFirstExists(false);

        if (playerBullet) {
          playerBullet.reset(p.x , p.y + 20);
          playerBullet.body.velocity.x = -600;
          playerBulletTime = game.time.now + 750;
        }
      }
    }

    function loseTime() {
      if ( (currentTime - 10) >= 0) {
        currentTime -= 10;
      } else {
        playerDeath();
      }
    }

    function playerDeath() {
      youLose.play();
      p.body.y -= 75;
      p.kill();
      timer.stop();
      restartGame();
      currentTime = 30;
      score = 0;

    }

    function timeClock() {
      if (timer.running && currentTime > 0) {
        timeText.text = `Current Time: ${currentTime}`;
      }
      else {
        timeText.text = 'Your time ran out!';
        playerDeath();
      }
    }

    function restartGame() {
      game.state.start('lvl1');
    }

    $scope.go = function ( path ) {
      $location.path( path );
    };

    $scope.logout_user = () => {
      AuthFactory.logout();
      $location.path('/login');
    };

  });
