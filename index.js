const MAX_WIDTH = 0.35;
const MIN_WIDTH = 0.175;
var currentWidth = MAX_WIDTH;
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update
});
var player;
var cursors;
var platforms;
var platformsArray;
var gameStarted = false;

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('lava', 'assets/lava.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
}

var platforms;

function create() {
  function createPlatform(x, y) {
    platformsArray[i] = platforms.create(x, y, "ground");
    platformsArray[i].body.immovable = true;
    platformsArray[i].body.checkCollision.left = false;
    platformsArray[i].body.checkCollision.right = false;
    platformsArray[i].body.checkCollision.down = false;
  }

  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  A simple background for our game
  game.add.sprite(0, 0, 'sky');
  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();
  //  We will enable physics for any object that is created in this group
  platforms.enableBody = true;

  platformsArray = [];
  // Here we create the ground.
  for (var i = 0; i < 4; i++) {
    createPlatform(32 + Math.random() * (game.world.width - 64 - 400 * MAX_WIDTH), (i + 0.5) * 600 / 5 - 32 / 2);
    platformsArray[i].scale.setTo(MAX_WIDTH, 1);
  }
  createPlatform(0, (i + 0.5) * 600 / 5 - 32 / 2);
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platformsArray[i].scale.setTo(2, 1);

  // The player and its settings
  player = game.add.sprite((game.world.width - 32) / 2, game.world.height - 150, 'dude');

  //  We need to enable physics on the player
  game.physics.arcade.enable(player);

  //  Player physics properties. Give the little guy a slight bounce.
  player.body.gravity.y = 300;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  cursors = game.input.keyboard.createCursorKeys();
  game.add.sprite(0, game.world.height - 16, 'lava');
  //walls
  walls = game.add.group();
  walls.enableBody = true;
  var leftWall = walls.create(0, 0, "ground");
  leftWall.scale.setTo(32 / 400, 600 / 32);
  leftWall.body.immovable = true;
  var rightWall = walls.create(game.world.width - 32, 0, "ground");
  rightWall.scale.setTo(32 / 400, 600 / 32);
  rightWall.body.immovable = true;
}



function update() {
  var speed = player.body.velocity.x;
  if (gameStarted) {
    currentWidth *= 0.99999;
    for (var platform of platformsArray) {
      platform.position.y++;
      if (player.position.y < 0) {
        platform.position.y -= player.position.y
      }
      if (game.world.height < platform.position.y) {
        platform.position.x = 32 + Math.random() * (game.world.width - 64 - 400 * MAX_WIDTH);
        platform.position.y = -32;
        platform.scale.setTo(currentWidth, 1);
      }
    }
  }
  if (player.position.y < 0) {
    player.position.y = 0;
  }
  if (game.physics.arcade.collide(player, walls)) player.body.velocity.x = -speed;
  if (!player.body.touching.up) {
    var hitPlatform = game.physics.arcade.collide(player, platforms);
  }
  player.body.velocity.x *= 0.975;

  if (cursors.left.isDown) {
    //  Move to the left
    player.body.velocity.x = Math.max(-300, player.body.velocity.x - 10);

    player.animations.play('left');
  }
  if (cursors.right.isDown) {
    //  Move to the right
    player.body.velocity.x = Math.min(300, player.body.velocity.x + 10);

    player.animations.play('right');
  }
  if (cursors.left.isDown && cursors.right.isDown || !cursors.left.isDown && !cursors.right.isDown) {
    //  Stand still
    player.animations.stop();
    player.frame = 4;
  }

  //  Allow the player to jump if they are touching the ground.
  if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
    player.body.velocity.y = -350;
    gameStarted = true;
  }
}