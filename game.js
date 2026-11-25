(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const mainMenu = document.querySelector('#mainMenu');
  const playButton = document.querySelector('#playButton');
  const menuTitle = mainMenu && mainMenu.querySelector('h1');
  const healthHud = document.querySelector('#healthHud');
  const bubbleHud = document.querySelector('#bubbleHud');
  const shapeHud = document.querySelector('#shapeHud');
  const comboHud = document.querySelector('#comboHud');
  const playtestToggle = document.querySelector('#playtestToggle');
  const pauseButton = document.querySelector('#pauseButton');
  const shopPopup = document.querySelector('#shopPopup');
  const upgradeButton = document.querySelector('#upgradeButton');
  const damageLabel = document.querySelector('#damageLabel');
  const shopClose = document.querySelector('#shopClose');
  const inventoryScreen = document.querySelector('#inventoryScreen');
  const armorSlot = document.querySelector('#armorSlot');
  const storageSlots = Array.from(document.querySelectorAll('[data-storage-slot]'));
  const teleportScreen = document.querySelector('#teleportScreen');
  const teleportButtons = document.querySelectorAll('[data-teleport]');
  if (playtestToggle) playtestToggle.checked = true;
  const keys = { left: false, right: false, jump: false, down: false };
  const shopX = 2500;
  const hillStart = shopX + 340;
  const hillTopX = 5100;
  const firstHillRun = hillTopX - hillStart;
  const summitClimb = firstHillRun * .27;
  const boulderHillStartX = hillTopX + firstHillRun;
  const boulderHillWidth = firstHillRun * .45;
  const boulderHillHeight = summitClimb * .58;
  const boulderHillCount = 5;
  const townStartX = boulderHillStartX + boulderHillWidth * boulderHillCount;
  const townEndX = townStartX + 3800;
  const mountainStartX = townEndX + 260;
  const mountainWidth = 3900;
  const mountainEndX = mountainStartX + mountainWidth;
  const mountainHeight = 1650;
  const mountainEntranceX = mountainStartX + 190;
  const mountainMineWallX = mountainEntranceX + 190;
  const mountainWallHalfWidth = 58;
  const kingdomStartX = mountainEndX + 360;
  const kingdomEndX = kingdomStartX + 2850;
  const kingdomCastleWallX = kingdomStartX + 900;
  const kingdomMoatStartX = kingdomStartX + 500;
  const kingdomMoatEndX = kingdomCastleWallX - 200;
  const kingdomMoatDepth = 170;
  const barracksX = kingdomCastleWallX + 700;
  const worldEnd = kingdomEndX + 320;
  const bossRoomStartX = 5700;
  const bossRoomEndX = 6650;
  const bossRoomExpandedEndX = 7180;
  const bossExitDoorX = bossRoomExpandedEndX - 72;
  const treasureRoomLeftX = 55;
  const treasureChestX = 175;
  const treasureGateX = 390;
  const mountainMineWidth = bossRoomExpandedEndX + 140;
  const bossGateX = bossRoomStartX + 35;
  const bossGateHalfWidth = 38;
  const bossRoomHeight = 590;
  const bossRoomExpandedHeight = 720;
  const mountainMineLevelGap = 330;
  const mountainMineLevelCount = 3;
  const mountainMineShafts = [
    { x: 900, top: 0, bottom: 1 }, { x: 1640, top: 1, bottom: 2 },
    { x: 2440, top: 0, bottom: 1 }, { x: 3270, top: 1, bottom: 2 },
    { x: 4140, top: 0, bottom: 1 }
  ];
  const townBuildings = [
    { offset: 430, width: 390, height: 255, color: '#7a7770', roof: '#47433f' },
    { offset: 930, width: 320, height: 330, color: '#83705f', roof: '#443a34' },
    { offset: 1370, width: 460, height: 275, color: '#686d6b', roof: '#343938' },
    { offset: 1950, width: 350, height: 360, color: '#776858', roof: '#40362e' },
    { offset: 2440, width: 430, height: 290, color: '#6c6964', roof: '#383633' },
    { offset: 3010, width: 360, height: 325, color: '#766956', roof: '#3d352d' }
  ];
  const cloakHouseIndex = 2;
  const mineX = boulderHillStartX + boulderHillWidth * 1.28;
  const mineWorldWidth = 9000;
  const mineLevelGap = 360;
  const mineLevelCount = 4;
  const mineShafts = [
    { x: 820, top: 0, bottom: 1 }, { x: 1760, top: 1, bottom: 2 },
    { x: 2680, top: 0, bottom: 1 }, { x: 3520, top: 2, bottom: 3 },
    { x: 4550, top: 1, bottom: 2 }, { x: 5480, top: 0, bottom: 1 },
    { x: 6420, top: 2, bottom: 3 }, { x: 7280, top: 1, bottom: 2 },
    { x: 8180, top: 0, bottom: 1 }, { x: 8620, top: 2, bottom: 3 }
  ];
  // If an older cached page is missing the menu, never leave the game frozen.
  let started = !mainMenu || !playButton;
  let paused = false;
  let teleportOpen = false;
  let inventoryOpen = false;
  let health = 3;
  let healthRegenTimer = 0;
  let damageFlash = 0;
  let damageShakeUntil = 0, damageShakeStrength = 0;
  let breathBubbles = 5, breathTimer = 0, playerInWater = false;
  let shapes = 0;
  let bladeDamage = 1, sharpeningLevel = 0, shopPopupOpen = false;
  const lanceSpeed = 430;
  let playtesting = false;
  let insideShop = false, shopReturnX = 0, shopReturnCamera = 0, shopReturnCameraY = 0;
  let insideMine = false, mineReturnX = 0, mineReturnCamera = 0, mineReturnCameraY = 0;
  let insideMountainMine = false;
  let insideKingdom = false;
  let insideBarracks = false, barracksReturnX = 0, barracksReturnCamera = 0;
  let mountainMineReturnX = 0, mountainMineReturnCamera = 0, mountainMineReturnCameraY = 0;
  let mountainMineLevel = 0, mountainMineClimb = null, bossGateClosed = false;
  let bossPhaseTwo = false, bossPhaseThree = false;
  let bossFightStarted = false, bossFightComplete = false;
  let bossPhaseTitleTimer = 0, bossPhaseTitle = 0;
  let insideTownHouse = false, townHouseIndex = 0;
  let townHouseReturnX = 0, townHouseReturnCamera = 0, townHouseReturnCameraY = 0;
  let cloakChestOpened = false, cloakOwned = false, hasCloak = false, cloakPickupTimer = 0;
  let cloakStorageIndex = 0;
  let armorChestOpened = false, armorOwned = false, hasArmor = false, armorStorageIndex = 1;
  let treasureKeyOwned = false, keyStorageIndex = 2, treasureGateUnlocked = false, armorBlockTimer = 0;
  let bowChestOpened = false, bowOwned = false, bowStorageIndex = 0;
  let bowReload = 0, arrows = [];
  const bowAim = { drawing: false, startX: 0, startY: 0, x: 0, y: 0 };
  const arrowSpeed = 920, arrowGravity = 720, bowReloadDuration = 2;
  let dashTime = 0, dashCooldown = 0, dashDirection = 1;
  let mineLevel = 0, mineClimb = null;
  let shopDoorBroken = false, shopDoorBoarded = true;
  let shopkeeperFleeing = false, shopkeeperReturning = false, shopkeeperHidden = false;
  let shopkeeperFleeX = 0, shopkeeperFleeY = 0, shopSafeTimer = 0, doorDebris = [];
  let width = 0, height = 0, ratio = 1, groundY = 0, lastTime = 0, cameraX = 0, cameraY = 0;
  let enemies = [], nextEnemyX = 650, hillNextEnemyX = hillStart + 260;
  let kingdomNextEnemyX = kingdomCastleWallX + 380, kingdomSpawnIndex = 0;
  let kingdomGuardsSpawned = false;
  let mineEnemies = [], mineDrops = [], mineDamagePopups = [];
  let bossParticles = [], bossDamagePopups = [], bossProjectiles = [], bossFloaters = [];
  let diameterShots = [];
  let mountainMiners = [], mountainMinerPopups = [], mountainMinerDrops = [];
  let boulderNextEnemyX = boulderHillStartX + boulderHillWidth * .35;
  let wasInPlains = false, plainsTitleTimer = 0;
  let wasInBoulderHills = false, boulderTitleTimer = 0;
  let wasInTown = false, townTitleTimer = 0;
  let wasInKingdom = false, kingdomTitleTimer = 0;
  let drawbridgeHealth = 5, drawbridgeLowering = 0, drawbridgeLastAttack = -1;
  let drawbridgeBreakTime = 0, drawbridgeDebris = [], ambushTriggered = false;
  let ambushTitleTimer = 0;
  let barracksWaveTriggered = false;
  let barracksGarrisonQueue = [], barracksDeployTimer = 0;
  let splats = [], shapeDrops = [], damagePopups = [];
  let deathDrops = [];
  const attack = {
    drawing: false, active: false, path: [], index: 0, visible: 0,
    length: 0, maxLength: 900, intersections: 0, spin: 0, kills: 0, id: 0,
    bladeX: 0, bladeY: 0, bladeAngle: 0, thrown: false, landed: false,
    throwVx: 0, throwVy: 0, throwTime: 0, directionCharge: 0,
    lastDirX: 1, lastDirY: 0, comboTriggered: false, launchDelay: 0
  };
  const combo = { timer: 0, slowTime: 0, zoomTime: 0, zoomDuration: .85 };
  const playtestSword = { time: 0, duration: .36, cooldown: 0, hit: false };
  const man = {
    x: 210, y: 0, vx: 0, vy: 0, width: 46, height: 108,
    grounded: true, coyote: 0, jumpBuffer: 0, runTime: 0, idleTime: 0,
    facing: 1, hitTime: 0, throwTime: 0, throwAngle: 0
  };
  const mountainBoss = {
    x: bossRoomEndX - 177, radius: 76, maxHealth: 50, health: 50, alive: true, aggro: 0,
    rotation: 0, lineAngle: Math.PI, hitFlash: 0, bladeTouching: false,
    lastComboAttack: -1, chargeTimer: 12, chargeTime: 0, chargeDirection: -1,
    shotTimer: 30, burstShots: 0, burstTimer: 0, floaterTimer: 11
  };
  const diameterBoss = {
    x: bossRoomExpandedEndX - 130, y: 0, radius: 76,
    maxHealth: 75, health: 75, alive: false, vx: 0, vy: 0,
    rotation: 0, hitFlash: 0, bladeTouching: false, grounded: false,
    jumpTimer: 2.4, lastComboAttack: -1,
    chargeTimer: 7, chargeTime: 0, chargeDirection: -1, shotTimer: 30
  };
  const circumferenceBoss = {
    x: (bossRoomStartX + bossRoomExpandedEndX) / 2, y: 0, radius: 76,
    maxHealth: 100, health: 100, alive: false, vx: 0, vy: 0, grounded: false,
    rotation: 0, hitFlash: 0, bladeTouching: false, lastComboAttack: -1,
    shotTimer: 12, burstShots: 0, burstTimer: 0, diameterTimer: 18, floaterTimer: 15
  };

  function currentBossRoomEndX() {
    return bossPhaseTwo ? bossRoomExpandedEndX : bossRoomEndX;
  }

  function currentBossRoomHeight() {
    return bossPhaseTwo ? bossRoomExpandedHeight : bossRoomHeight;
  }

  function healPlayerToMax() {
    health = 3;
    updateHealth();
  }

  function announceBossPhase(phase) {
    bossPhaseTitle = phase;
    bossPhaseTitleTimer = 3.2;
  }

  function groundAt(worldX) {
    if (worldX <= hillTopX) {
      const climb = Math.max(0, (worldX - hillStart) * .27);
      return groundY - climb;
    }
    if (worldX >= townStartX) {
      if (worldX >= mountainStartX && worldX <= mountainEndX) {
        const progress = (worldX - mountainStartX) / mountainWidth;
        return groundY - Math.sin(progress * Math.PI) * mountainHeight;
      }
      return groundY;
    }
    if (worldX < boulderHillStartX) {
      const descent = (worldX - hillTopX) / firstHillRun;
      return groundY - summitClimb * (1 + Math.cos(Math.PI * descent)) / 2;
    }
    const distanceIntoBoulderHills = worldX - boulderHillStartX;
    const hillHeight = boulderHillHeight *
      (1 - Math.cos(Math.PI * 2 * distanceIntoBoulderHills / boulderHillWidth)) / 2;
    return groundY - hillHeight;
  }

  function mineFloorAt(x, level = mineLevel) {
    return groundY - 8 + level * mineLevelGap +
      Math.sin(x / 310 + level * 1.7) * 46 + Math.sin(x / 105 + level) * 13;
  }

  function mountainMineFloorAt(x, level = mountainMineLevel) {
    if (x >= bossRoomStartX) return groundY + 18;
    return groundY - 4 + level * mountainMineLevelGap +
      Math.sin(x / 360 + level * 1.4) * 52 + Math.sin(x / 117 + level) * 16;
  }

  function activeGroundAt(x) {
    if (insideMountainMine) return mountainMineFloorAt(x);
    if (insideMine) return mineFloorAt(x);
    if (insideTownHouse) return groundY;
    if (insideBarracks) return groundY;
    if (insideKingdom && x >= kingdomMoatStartX && x <= kingdomMoatEndX) {
      return drawbridgeLowering >= .98 ? groundY : groundY + kingdomMoatDepth;
    }
    return groundAt(x);
  }

  function playerNear(x, y, distance) {
    return Math.hypot(man.x - x, man.y - y) <= distance;
  }

  function nearestMineLevel(floorAt, levelCount) {
    const feetY = man.y + man.height / 2;
    let closestLevel = 0;
    let closestDistance = Infinity;
    for (let level = 0; level < levelCount; level++) {
      const distance = Math.abs(feetY - floorAt(man.x, level));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLevel = level;
      }
    }
    return closestLevel;
  }

  function interiorBounds() {
    const left = 24;
    const roomWidth = Math.min(width - left * 2, Math.max(680, Math.min(980, width * .78)));
    const right = left + roomWidth;
    const wallTop = Math.max(155, groundY - 410);
    return { left, right, width: roomWidth, wallTop, roofPeak: Math.max(38, wallTop - 115) };
  }

  function interiorPoint(ratio) {
    const room = interiorBounds();
    return room.left + room.width * ratio;
  }

  function cloakChestX() {
    const room = interiorBounds();
    return Math.min(room.right - 105, Math.max(room.left + 250, interiorPoint(.58)));
  }

  function startCloakDash() {
    if (!started || teleportOpen || inventoryOpen || shopPopupOpen || mineClimb || !hasCloak ||
      dashCooldown > 0 || attack.drawing) return;
    dashDirection = man.facing || 1;
    dashTime = .2;
    dashCooldown = .72;
    man.vx = dashDirection * 1050;
    if (!playtesting) man.vy = Math.min(man.vy, -45);
    man.grounded = false;
  }

  function makeMineEnemy(x, level) {
    return {
      x, radius: 34, speed: 78 + Math.random() * 22, health: 3,
      rotation: 0, aggro: 0, alive: true, bladeTouching: false,
      lastComboAttack: -1, hitFlash: 0, miner: true, level
    };
  }

  function resetMine() {
    mineEnemies = [
      [520, 0], [1180, 1], [1650, 1], [2200, 2], [2850, 0],
      [3340, 2], [3890, 3], [4380, 1], [4930, 2], [5650, 1],
      [6120, 2], [6760, 3], [7350, 1], [7840, 2], [8420, 0], [8750, 3]
    ].map(([x, level]) => makeMineEnemy(x, level));
    mineDrops = [];
    mineDamagePopups = [];
    mineLevel = 0;
    mineClimb = null;
  }

  function resetMountainBoss() {
    bossPhaseTwo = false;
    bossPhaseThree = false;
    bossFightStarted = false;
    bossFightComplete = false;
    bossPhaseTitleTimer = 0;
    bossPhaseTitle = 0;
    Object.assign(mountainBoss, {
      x: bossRoomEndX - 177, health: 50, alive: true, aggro: 0, rotation: 0,
      lineAngle: Math.PI, hitFlash: 0, bladeTouching: false, lastComboAttack: -1,
      chargeTimer: 12, chargeTime: 0, chargeDirection: -1,
      shotTimer: 30, burstShots: 0, burstTimer: 0, floaterTimer: 11
    });
    Object.assign(diameterBoss, {
      x: bossRoomExpandedEndX - 130, y: 0, health: 75, alive: false,
      vx: 0, vy: 0, rotation: 0, hitFlash: 0, bladeTouching: false,
      grounded: false, jumpTimer: 2.4, lastComboAttack: -1,
      chargeTimer: 7, chargeTime: 0, chargeDirection: -1, shotTimer: 30
    });
    Object.assign(circumferenceBoss, {
      x: (bossRoomStartX + bossRoomExpandedEndX) / 2, y: 0,
      health: 100, alive: false, vx: 0, vy: 0, grounded: false,
      rotation: 0, hitFlash: 0, bladeTouching: false, lastComboAttack: -1,
      shotTimer: 12, burstShots: 0, burstTimer: 0, diameterTimer: 18, floaterTimer: 15
    });
    bossParticles = [];
    bossDamagePopups = [];
    bossProjectiles = [];
    bossFloaters = [];
    diameterShots = [];
    mountainMiners = [
      [620, 0], [1220, 1], [1810, 2], [2180, 0],
      [2790, 1], [3540, 2], [3980, 1], [4450, 0], [720, 2]
    ].map(([x, level]) => makeMineEnemy(x, level));
    Object.assign(mountainMiners[mountainMiners.length - 1], {
      guard: true, health: 5, speed: 92
    });
    mountainMinerPopups = [];
    mountainMinerDrops = [];
    mountainMineLevel = 0;
    mountainMineClimb = null;
    bossGateClosed = false;
    treasureKeyOwned = false;
    keyStorageIndex = 2;
    treasureGateUnlocked = false;
  }

  function beginBossPhaseTwo() {
    if (bossPhaseTwo) return;
    bossPhaseTwo = true;
    healPlayerToMax();
    announceBossPhase(2);
    mountainBoss.health = mountainBoss.maxHealth;
    mountainBoss.hitFlash = .5;
    mountainBoss.shotTimer = 30;
    mountainBoss.burstShots = 0;
    mountainBoss.burstTimer = 0;
    const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
    Object.assign(diameterBoss, {
      x: bossRoomExpandedEndX - diameterBoss.radius - 30,
      y: roomFloor - diameterBoss.radius - 360,
      health: diameterBoss.maxHealth, alive: true,
      vx: -330, vy: -80, rotation: 0, hitFlash: .45,
      bladeTouching: false, grounded: false, jumpTimer: 2.6,
      lastComboAttack: -1, chargeTimer: 7, chargeTime: 0,
      chargeDirection: -1, shotTimer: 30
    });
  }

  function beginBossPhaseThree() {
    if (bossPhaseThree) return;
    bossPhaseThree = true;
    healPlayerToMax();
    announceBossPhase(3);
    mountainBoss.health = mountainBoss.maxHealth;
    mountainBoss.alive = true;
    mountainBoss.hitFlash = .6;
    diameterBoss.health = diameterBoss.maxHealth;
    diameterBoss.alive = true;
    diameterBoss.hitFlash = .6;
    const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
    Object.assign(circumferenceBoss, {
      x: (bossRoomStartX + bossRoomExpandedEndX) / 2,
      y: roomFloor - circumferenceBoss.radius - 330,
      health: circumferenceBoss.maxHealth, alive: true,
      vx: 0, vy: -40, grounded: false, rotation: 0, hitFlash: .7,
      bladeTouching: false, lastComboAttack: -1,
      shotTimer: 10, burstShots: 0, burstTimer: 0, diameterTimer: 16, floaterTimer: 13
    });
  }

  function tryBeginBossPhaseThree() {
    if (bossPhaseTwo && !bossPhaseThree && mountainBoss.health <= 10 && diameterBoss.health <= 10) {
      beginBossPhaseThree();
    }
  }

  function lockRadiusAtPhaseTwoThreshold() {
    mountainBoss.health = 10;
    mountainBoss.chargeTime = 0;
    mountainBoss.burstShots = 0;
    mountainBoss.x = currentBossRoomEndX() - mountainBoss.radius - 95;
    bossProjectiles = bossProjectiles.filter(projectile => projectile.owner !== 'radius');
    bossFloaters = bossFloaters.filter(floater => floater.owner !== 'radius');
  }

  function lockDiameterAtPhaseTwoThreshold() {
    diameterBoss.health = 10;
    diameterBoss.chargeTime = 0;
    diameterBoss.x = Math.max(
      bossGateX + bossGateHalfWidth + diameterBoss.radius,
      currentBossRoomEndX() - diameterBoss.radius - 284
    );
    diameterBoss.y = mountainMineFloorAt(bossRoomStartX, 0) - diameterBoss.radius;
    diameterBoss.vx = 0;
    diameterBoss.vy = 0;
    diameterBoss.grounded = true;
    diameterShots = diameterShots.filter(shot => shot.owner !== 'diameter');
    bossProjectiles = bossProjectiles.filter(projectile => projectile.owner !== 'diameter');
  }

  function applyBossDamage(target, amount, auraCanBlock = false) {
    let blocked = false;
    if (auraCanBlock && circumferenceBoss.alive && Math.random() < .3) {
      amount = Math.max(0, amount - 1);
      blocked = true;
    }
    target.health -= amount;
    return { amount, blocked };
  }

  function splitDiameterShot(shot) {
    if (shot.split) return;
    shot.split = true;
    const travelAngle = Math.atan2(shot.vy, shot.vx);
    [-1, 1].forEach(direction => {
      const angle = travelAngle + direction * .82;
      bossProjectiles.push({
        x: shot.x + Math.cos(angle) * 18,
        y: shot.y + Math.sin(angle) * 18,
        vx: Math.cos(angle) * 285,
        vy: Math.sin(angle) * 180 - 330,
        radius: 34, life: 14, health: 3, rotation: 0,
        hitFlash: 0, bladeTouching: false, grounded: false, owner: shot.owner || 'diameter'
      });
    });
  }

  function throwPose(progress) {
    const p = Math.max(0, Math.min(1, progress));
    const q = 1 - p;
    const dirX = Math.cos(man.throwAngle);
    const dirY = Math.sin(man.throwAngle);
    return {
      handX: q * q * (-dirX * 27) + 2 * q * p * (dirX * 10) + p * p * (dirX * 54),
      handY: q * q * -36 + 2 * q * p * -61 + p * p * (dirY * 54 - 4),
      elbowX: q * q * (-dirX * 5) + 2 * q * p * (dirX * 19) + p * p * (dirX * 35),
      elbowY: q * q * -46 + 2 * q * p * -45 + p * p * (dirY * 30 - 2)
    };
  }

  function makeEnemy(x, zone) {
    const rocky = zone === 'boulder';
    const wallGuard = zone === 'kingdom-guard-square' || zone === 'kingdom-guard-rhombus';
    const square = zone === 'kingdom' || zone === 'kingdom-guard-square';
    const rhombus = zone === 'kingdom-rhombus' || zone === 'kingdom-guard-rhombus';
    return {
      x, spawnX: x, zone, rocky, square, rhombus, wallGuard,
      radius: rhombus ? 40 : square ? 38 : 34,
      speed: rocky ? 195 + Math.random() * 45 : square ? 90 + Math.random() * 30 : 65 + Math.random() * 35,
      rockSeed: Math.random() * Math.PI * 2,
      rollDirection: 0, rollCooldown: 0, rushBoostTimer: 0,
      chargeTimer: 1.1 + Math.random() * 1.7, chargeTime: 0, chargeDirection: 0,
      rotation: 0, aggro: 0, health: 3, bladeTouching: false,
      lastComboAttack: -1, hitFlash: 0, respawnTimer: 0, alive: true,
      inShop: false, shopX: 0
    };
  }

  function enemyWorldY(enemy, x = enemy.x) {
    const swimming = (enemy.square || enemy.rhombus) &&
      x >= kingdomMoatStartX && x <= kingdomMoatEndX;
    if (swimming) {
      return groundY + 5 + Math.sin(performance.now() * .006 + enemy.rockSeed) * 10;
    }
    return groundAt(x) - enemy.radius;
  }

  function breakShopDoor() {
    if (shopDoorBroken && !shopDoorBoarded) return;
    shopDoorBroken = true;
    shopDoorBoarded = false;
    const doorX = shopX + 74;
    for (let i = 0; i < 16; i++) {
      doorDebris.push({
        x: doorX + (Math.random() - .5) * 60,
        y: groundAt(doorX) - 75 + (Math.random() - .5) * 90,
        vx: (Math.random() - .5) * 280,
        vy: -120 - Math.random() * 240,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - .5) * 10,
        life: 1.2 + Math.random() * .5
      });
    }
  }

  function sendEnemyIntoShop(enemy) {
    if (enemy.inShop) return;
    breakShopDoor();
    enemy.inShop = true;
    enemy.shopX = 48;
    enemy.rotation = 0;
    shopSafeTimer = 0;
    shopPopupOpen = false;
    if (shopPopup) shopPopup.classList.add('hidden');
    if (shopkeeperReturning) {
      // Turn around from the exact recovery position when another raid begins.
      shopkeeperReturning = false;
      shopkeeperFleeing = true;
    } else if (!shopkeeperFleeing && !shopkeeperHidden) {
      shopkeeperFleeing = true;
      // Begin at the shopkeeper's actual interior position so there is no teleport.
      shopkeeperFleeX = interiorPoint(.76);
      shopkeeperFleeY = 0;
    }
  }

  function updateShopkeeperState(dt) {
    const hatchX = interiorPoint(.9);
    const keeperPostX = interiorPoint(.76);
    if (shopkeeperFleeing) {
      if (shopkeeperFleeX < hatchX) {
        shopkeeperFleeX = Math.min(hatchX, shopkeeperFleeX + 150 * dt);
      } else {
        shopkeeperFleeY += 180 * dt;
        if (shopkeeperFleeY >= 115) {
          shopkeeperFleeing = false;
          shopkeeperHidden = true;
        }
      }
    }

    const circleStillInside = enemies.some(enemy => enemy.alive && enemy.inShop);
    if (circleStillInside) {
      shopSafeTimer = 0;
    } else if (shopkeeperHidden && !shopkeeperReturning) {
      shopSafeTimer += dt;
      if (shopSafeTimer >= 5) {
        shopkeeperHidden = false;
        shopkeeperReturning = true;
        shopkeeperFleeX = hatchX;
        shopkeeperFleeY = 115;
      }
    }

    if (shopkeeperReturning) {
      if (shopkeeperFleeY > 0) {
        shopkeeperFleeY = Math.max(0, shopkeeperFleeY - 180 * dt);
      } else {
        shopkeeperFleeX = Math.max(keeperPostX, shopkeeperFleeX - 150 * dt);
        if (shopkeeperFleeX <= keeperPostX) {
          shopkeeperFleeX = keeperPostX;
          shopkeeperReturning = false;
          shopDoorBoarded = true;
          shopSafeTimer = 0;
        }
      }
    }
  }

  function updateShopRaid(dt) {
    const doorX = shopX + 74;
    let closestOutside = null;
    let closestDistance = Infinity;
    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.inShop) return;
      const distance = Math.abs(enemy.x - doorX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestOutside = enemy;
      }
    });

    const circleAlreadyInside = enemies.some(enemy => enemy.alive && enemy.inShop);
    const recovering = !circleAlreadyInside &&
      (shopkeeperFleeing || shopkeeperHidden || shopkeeperReturning);

    // During recovery, outside circles wait until the keeper has boarded the doorway.
    if (closestOutside && !recovering) {
      const direction = Math.sign(doorX - closestOutside.x) || 1;
      const speed = closestOutside.speed * 1.2;
      closestOutside.aggro = Math.min(1, closestOutside.aggro + dt * 1.2);
      closestOutside.x += direction * speed * dt;
      closestOutside.rotation += direction * speed * dt / closestOutside.radius;
      if (Math.abs(closestOutside.x - doorX) < closestOutside.radius + 24) {
        sendEnemyIntoShop(closestOutside);
      }
    }

    enemies.forEach(enemy => {
      if (!enemy.alive || !enemy.inShop) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      const enemyY = groundY - enemy.radius;
      const inSight = enemy.shopX + enemy.radius >= 0 &&
        enemy.shopX - enemy.radius <= width &&
        enemyY - cameraY + enemy.radius >= 0 &&
        enemyY - cameraY - enemy.radius <= height;
      if (!inSight) {
        enemy.aggro = 0;
        enemy.bladeTouching = false;
        return;
      }
      const direction = Math.sign(man.x - enemy.shopX) || 1;
      const speed = enemy.speed * 1.25;
      enemy.shopX += direction * speed * dt;
      const room = interiorBounds();
      enemy.shopX = Math.max(room.left + enemy.radius,
        Math.min(room.right - enemy.radius, enemy.shopX));
      enemy.rotation += direction * speed * dt / enemy.radius;
      enemy.aggro = Math.min(1, enemy.aggro + dt * 1.5);
      const horizontal = Math.abs(man.x - enemy.shopX) < man.width / 2 + enemy.radius - 3;
      const vertical = man.y + man.height / 2 > enemyY - enemy.radius &&
        man.y - man.height / 2 < enemyY + enemy.radius;
      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - enemy.shopX, attack.bladeY - enemyY) < enemy.radius + 58;
      if (bladeHit && !enemy.bladeTouching) {
        if (enemy.lastComboAttack !== attack.id) {
          enemy.lastComboAttack = attack.id;
          attack.kills++;
        }
        enemy.health -= bladeDamage;
        enemy.aggro = 1;
        enemy.hitFlash = .16;
        damagePopups.push({
          x: enemy.shopX, y: enemyY - enemy.radius - 12,
          vy: -55, life: .75, damage: bladeDamage, insideShop: true
        });
        if (enemy.health <= 0) {
          enemy.alive = false;
          enemy.respawnTimer = 0;
          splatInteriorEnemy(enemy, enemyY);
          if (attack.kills >= 3) {
            if (!attack.comboTriggered) {
              triggerCombo(attack.kills);
              attack.comboTriggered = true;
            } else if (comboHud) {
              comboHud.textContent = `COMBO x${attack.kills}`;
            }
          }
        }
      }
      enemy.bladeTouching = bladeHit;
      if (enemy.alive && horizontal && vertical && !attack.drawing && man.hitTime <= 0) {
        const knockbackDirection = Math.sign(man.x - enemy.shopX) || 1;
        man.vx = knockbackDirection * 440;
        man.vy = -330;
        man.hitTime = 1;
        damagePlayer();
      }
    });

    splats.forEach(particle => {
      if (!particle.insideShop) return;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 900 * dt;
      particle.life -= dt;
    });
    splats = splats.filter(particle => !particle.insideShop || particle.life > 0);

    damagePopups.forEach(popup => {
      if (!popup.insideShop) return;
      popup.y += popup.vy * dt;
      popup.life -= dt;
    });
    damagePopups = damagePopups.filter(popup => !popup.insideShop || popup.life > 0);

    shapeDrops.forEach(drop => {
      if (!drop.insideShop || drop.collected) return;
      drop.vy += 1100 * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      const floor = groundY - 16;
      if (drop.y > floor) {
        drop.y = floor;
        drop.vy = 0;
        drop.vx *= .85;
      }
      if (Math.hypot(man.x - drop.x, man.y - drop.y) < 72) {
        drop.collected = true;
        shapes++;
        updateShapes();
      }
    });
    shapeDrops = shapeDrops.filter(drop => !drop.insideShop || !drop.collected);

    updateShopkeeperState(dt);
  }

  function updateMineClimb(dt) {
    if (!insideMine || playtesting || attack.drawing) return false;
    if (!mineClimb) {
      const shaft = mineShafts.find(item =>
        playerNear(item.x, mineFloorAt(item.x, mineLevel) - man.height / 2, 82) &&
        ((keys.down && mineLevel === item.top) || (keys.jump && mineLevel === item.bottom)));
      if (!shaft) return false;
      const targetLevel = mineLevel === shaft.top ? shaft.bottom : shaft.top;
      mineClimb = { x: shaft.x, targetLevel };
      man.jumpBuffer = 0;
      man.vx = 0;
      man.vy = 0;
      man.grounded = false;
    }
    man.x += (mineClimb.x - man.x) * Math.min(1, dt * 12);
    const targetY = mineFloorAt(mineClimb.x, mineClimb.targetLevel) - man.height / 2;
    const direction = Math.sign(targetY - man.y);
    man.y += direction * 245 * dt;
    man.vx = 0;
    man.vy = 0;
    if (Math.abs(targetY - man.y) < 8) {
      mineLevel = mineClimb.targetLevel;
      man.x = mineClimb.x;
      man.y = targetY;
      man.grounded = true;
      mineClimb = null;
    }
    return true;
  }

  function updateMountainMineClimb(dt) {
    if (!insideMountainMine || playtesting || attack.drawing) return false;
    if (!mountainMineClimb) {
      const shaft = mountainMineShafts.find(item =>
        playerNear(item.x, mountainMineFloorAt(item.x, mountainMineLevel) - man.height / 2, 82) &&
        ((keys.down && mountainMineLevel === item.top) ||
          (keys.jump && mountainMineLevel === item.bottom)));
      if (!shaft) return false;
      const targetLevel = mountainMineLevel === shaft.top ? shaft.bottom : shaft.top;
      mountainMineClimb = { x: shaft.x, targetLevel };
      man.jumpBuffer = 0;
      man.vx = 0;
      man.vy = 0;
      man.grounded = false;
    }
    man.x += (mountainMineClimb.x - man.x) * Math.min(1, dt * 12);
    const targetY = mountainMineFloorAt(mountainMineClimb.x, mountainMineClimb.targetLevel) - man.height / 2;
    const direction = Math.sign(targetY - man.y);
    man.y += direction * 245 * dt;
    man.vx = 0;
    man.vy = 0;
    if (Math.abs(targetY - man.y) < 8) {
      mountainMineLevel = mountainMineClimb.targetLevel;
      man.x = mountainMineClimb.x;
      man.y = targetY;
      man.grounded = true;
      mountainMineClimb = null;
    }
    return true;
  }

  function updateMine(dt) {
    mineEnemies.forEach(enemy => {
      if (!enemy.alive) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      const enemyY = mineFloorAt(enemy.x, enemy.level) - enemy.radius;
      const screenX = enemy.x - cameraX;
      const screenY = enemyY - cameraY;
      const inSight = screenX + enemy.radius >= 0 && screenX - enemy.radius <= width &&
        screenY + enemy.radius >= 0 && screenY - enemy.radius <= height;
      const sharesTunnel = enemy.level === mineLevel || Math.abs(man.y - enemyY) < 140;
      const inAggroRange = inSight && !mineClimb && sharesTunnel &&
        (Math.abs(man.x - enemy.x) < 680 || enemy.aggro > .8);
      if (!inSight) enemy.aggro = 0;
      else if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + dt * .9);
      else enemy.aggro = Math.max(0, enemy.aggro - dt * .55);
      if (inAggroRange) {
        const direction = Math.sign(man.x - enemy.x) || 1;
        const speed = enemy.speed * (.7 + enemy.aggro * .55);
        enemy.x += direction * speed * dt;
        enemy.rotation += direction * speed * dt / enemy.radius;
      }

      const currentY = mineFloorAt(enemy.x, enemy.level) - enemy.radius;
      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - enemy.x, attack.bladeY - currentY) < enemy.radius + 58;
      if (bladeHit && !enemy.bladeTouching) {
        if (enemy.lastComboAttack !== attack.id) {
          enemy.lastComboAttack = attack.id;
          attack.kills++;
        }
        enemy.health -= bladeDamage;
        enemy.aggro = 1;
        enemy.hitFlash = .16;
        mineDamagePopups.push({
          x: enemy.x, y: currentY - enemy.radius - 12,
          vy: -55, life: .75, damage: bladeDamage
        });
        if (enemy.health <= 0) {
          enemy.alive = false;
          mineDrops.push({
            x: enemy.x, y: currentY, vy: -260, collected: false, level: enemy.level
          });
          if (attack.kills >= 3 && !attack.comboTriggered) {
            triggerCombo(attack.kills);
            attack.comboTriggered = true;
          }
        }
      }
      enemy.bladeTouching = bladeHit;

      const horizontal = Math.abs(man.x - enemy.x) < man.width / 2 + enemy.radius - 3;
      const vertical = man.y + man.height / 2 > currentY - enemy.radius &&
        man.y - man.height / 2 < currentY + enemy.radius;
      if (enemy.alive && !mineClimb && horizontal && vertical &&
        !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - enemy.x) || -1) * 440;
        man.vy = -330;
        man.hitTime = 1;
        damagePlayer();
      }
    });

    mineDrops.forEach(drop => {
      if (drop.collected) return;
      drop.vy += 1100 * dt;
      drop.y += drop.vy * dt;
      const floor = mineFloorAt(drop.x, drop.level) - 16;
      if (drop.y > floor) { drop.y = floor; drop.vy = 0; }
      if (drop.level === mineLevel && Math.hypot(man.x - drop.x, man.y - drop.y) < 72) {
        drop.collected = true;
        shapes++;
        updateShapes();
      }
    });
    mineDrops = mineDrops.filter(drop => !drop.collected);
    mineDamagePopups.forEach(popup => {
      popup.y += popup.vy * dt;
      popup.life -= dt;
    });
    mineDamagePopups = mineDamagePopups.filter(popup => popup.life > 0);
  }

  function updateMountainMine(dt) {
    mountainMiners.forEach(enemy => {
      if (!enemy.alive) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      const enemyY = mountainMineFloorAt(enemy.x, enemy.level) - enemy.radius;
      const inSight = Math.abs(enemy.x - man.x) < width * .75 &&
        Math.abs(enemyY - man.y) < height * .7;
      const inAggroRange = inSight && !mountainMineClimb && enemy.level === mountainMineLevel &&
        (Math.abs(man.x - enemy.x) < 620 || enemy.aggro > .8);
      if (!inSight) enemy.aggro = 0;
      else if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + dt * .95);
      else enemy.aggro = Math.max(0, enemy.aggro - dt * .5);
      if (inAggroRange) {
        const direction = Math.sign(man.x - enemy.x) || 1;
        const speed = enemy.speed * (.72 + enemy.aggro * .6);
        enemy.x += direction * speed * dt;
        enemy.rotation += direction * speed * dt / enemy.radius;
      }
      const currentY = mountainMineFloorAt(enemy.x, enemy.level) - enemy.radius;
      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - enemy.x, attack.bladeY - currentY) < enemy.radius + 58;
      if (bladeHit && !enemy.bladeTouching) {
        enemy.health -= bladeDamage;
        enemy.aggro = 1;
        enemy.hitFlash = .16;
        mountainMinerPopups.push({
          x: enemy.x, y: currentY - enemy.radius - 12, vy: -55, life: .75, damage: bladeDamage
        });
        if (enemy.health <= 0) {
          enemy.alive = false;
          mountainMinerDrops.push({
            x: enemy.x, y: currentY, vy: -250, level: enemy.level,
            collected: false, kind: enemy.guard ? 'key' : 'shape'
          });
        }
      }
      enemy.bladeTouching = bladeHit;
      const touching = Math.abs(man.x - enemy.x) < man.width / 2 + enemy.radius - 3 &&
        man.y + man.height / 2 > currentY - enemy.radius &&
        man.y - man.height / 2 < currentY + enemy.radius;
      if (enemy.alive && touching && !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - enemy.x) || -1) * 440;
        man.vy = -330;
        man.hitTime = 1;
        damagePlayer();
      }
    });
    mountainMinerDrops.forEach(drop => {
      if (drop.collected) return;
      drop.vy += 1100 * dt;
      drop.y += drop.vy * dt;
      const floor = mountainMineFloorAt(drop.x, drop.level) - 16;
      if (drop.y > floor) { drop.y = floor; drop.vy = 0; }
      if (drop.level === mountainMineLevel && Math.hypot(man.x - drop.x, man.y - drop.y) < 72) {
        drop.collected = true;
        if (drop.kind === 'key') {
          keyStorageIndex = firstFreeStorageIndex();
          treasureKeyOwned = true;
          updateInventoryUI();
        }
        else {
          shapes++;
          updateShapes();
        }
      }
    });
    mountainMinerDrops = mountainMinerDrops.filter(drop => !drop.collected);
    mountainMinerPopups.forEach(popup => {
      popup.y += popup.vy * dt;
      popup.life -= dt;
    });
    mountainMinerPopups = mountainMinerPopups.filter(popup => popup.life > 0);

    const boss = mountainBoss;
    const fightAlive = boss.alive || diameterBoss.alive || circumferenceBoss.alive;
    const auraSpeed = circumferenceBoss.alive ? 1.35 : 1;
    const gateRoomEdge = bossGateX + bossGateHalfWidth + man.width / 2;
    if (fightAlive && mountainMineLevel === 0 && man.x >= gateRoomEdge) {
      bossGateClosed = true;
      if (!bossFightStarted) {
        bossFightStarted = true;
        announceBossPhase(1);
      }
    }
    if (!fightAlive) bossGateClosed = false;
    if (boss.alive) {
      boss.hitFlash = Math.max(0, boss.hitFlash - dt);
      const radiusLocked = bossPhaseTwo && !bossPhaseThree && boss.health <= 10;
      if (radiusLocked) {
        boss.x = currentBossRoomEndX() - boss.radius - 95;
        boss.chargeTime = 0;
        boss.burstShots = 0;
      }
      const playerInRoom = bossGateClosed && mountainMineLevel === 0;
      if (playerInRoom) boss.aggro = Math.min(1, boss.aggro + dt * .72);
      else boss.aggro = Math.max(0, boss.aggro - dt * .4);
      const aimY = man.y - (mountainMineFloorAt(boss.x) - boss.radius);
      boss.lineAngle = Math.atan2(aimY, man.x - boss.x);
      if (playerInRoom && !radiusLocked) {
        boss.chargeTimer -= dt;
        boss.floaterTimer -= dt;
        if (boss.burstShots > 0) boss.burstTimer -= dt;
        else boss.shotTimer -= dt;
        if (boss.floaterTimer <= 0) {
          if (bossFloaters.length === 0 && boss.chargeTime <= 0) {
            const bossCenterY = mountainMineFloorAt(boss.x) - boss.radius;
            for (let i = 0; i < 3; i++) {
              bossFloaters.push({
                x: boss.x - 115 - i * 16, y: bossCenterY + (i - 1) * 78,
                radius: 30, health: 1, rotation: Math.random() * Math.PI * 2,
                spin: (Math.random() - .5) * 3.4,
                turnTimer: .45 + Math.random() * .9,
                hitFlash: 0, bladeTouching: false, alive: true, owner: 'radius'
              });
            }
          }
          boss.floaterTimer = 16 + Math.random() * 7;
        }
        if (boss.chargeTime > 0) {
          const chargeSpeed = 680 * auraSpeed;
          boss.x += boss.chargeDirection * chargeSpeed * dt;
          boss.rotation += boss.chargeDirection * chargeSpeed * dt / boss.radius;
          boss.chargeTime = Math.max(0, boss.chargeTime - dt);
        } else {
          // RADIUS spends most of the fight retreating to the far wall.
          const waitingX = currentBossRoomEndX() - boss.radius - 95;
          const retreatDirection = Math.sign(waitingX - boss.x);
          const retreatSpeed = Math.abs(waitingX - boss.x) > 12 ? 145 * auraSpeed : 0;
          boss.x += retreatDirection * retreatSpeed * dt;
          boss.rotation += retreatDirection * retreatSpeed * dt / boss.radius;
          if (boss.chargeTimer <= 0) {
            boss.chargeDirection = Math.sign(man.x - boss.x) || -1;
            boss.chargeTime = .9;
            boss.chargeTimer = 12 + Math.random() * 6;
          }
        }
        if (boss.shotTimer <= 0 && boss.burstShots === 0) {
          boss.burstShots = 3;
          boss.burstTimer = 0;
        }
        if (boss.burstShots > 0 && boss.burstTimer <= 0 && boss.chargeTime <= 0) {
          const shotAngle = boss.lineAngle;
          bossProjectiles.push({
            x: boss.x + Math.cos(shotAngle) * (boss.radius + 42),
            y: mountainMineFloorAt(boss.x) - boss.radius + Math.sin(shotAngle) * (boss.radius + 42),
            vx: Math.cos(shotAngle) * 275 * auraSpeed,
            vy: Math.sin(shotAngle) * 275 * auraSpeed - 190 * auraSpeed,
            radius: 29, life: 14, health: 3, rotation: 0,
            hitFlash: 0, bladeTouching: false, grounded: false, owner: 'radius'
          });
          boss.burstShots--;
          if (boss.burstShots > 0) boss.burstTimer = .3;
          else boss.shotTimer = 30;
        }
      }
      boss.x = Math.max(bossRoomStartX + boss.radius,
        Math.min(currentBossRoomEndX() - boss.radius, boss.x));

      const currentY = mountainMineFloorAt(boss.x) - boss.radius;
      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - boss.x, attack.bladeY - currentY) < boss.radius + 62;
      if (bladeHit && !boss.bladeTouching && !radiusLocked) {
        if (boss.lastComboAttack !== attack.id) {
          boss.lastComboAttack = attack.id;
          attack.kills++;
        }
        const hit = applyBossDamage(boss, bladeDamage, true);
        boss.aggro = 1;
        boss.hitFlash = .18;
        bossDamagePopups.push({
          x: boss.x, y: currentY - boss.radius - 15, vy: -62, life: .85,
          damage: hit.amount, blocked: hit.blocked
        });
        if (!bossPhaseTwo && boss.health <= 10) {
          beginBossPhaseTwo();
        } else if (bossPhaseTwo && !bossPhaseThree) {
          if (boss.health <= 10) lockRadiusAtPhaseTwoThreshold();
          tryBeginBossPhaseThree();
        } else if (boss.health <= 0) {
          boss.alive = false;
          for (let i = 0; i < 42; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 430;
            bossParticles.push({
              x: boss.x, y: currentY, vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 170, life: .8 + Math.random() * .9,
              size: 7 + Math.random() * 15
            });
          }
          shapes += 20;
          updateShapes();
        }
      }
      boss.bladeTouching = bladeHit;

      const horizontal = Math.abs(man.x - boss.x) < man.width / 2 + boss.radius - 5;
      const vertical = man.y + man.height / 2 > currentY - boss.radius &&
        man.y - man.height / 2 < currentY + boss.radius;
      if (boss.alive && !radiusLocked && horizontal && vertical &&
        !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - boss.x) || -1) * 720;
        man.vy = -460;
        man.hitTime = 1.15;
        damagePlayer(1, true);
      }
    }

    const diameter = diameterBoss;
    if (diameter.alive) {
      diameter.hitFlash = Math.max(0, diameter.hitFlash - dt);
      const diameterLocked = bossPhaseTwo && !bossPhaseThree && diameter.health <= 10;
      const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
      const floorY = roomFloor - diameter.radius;
      const leftWall = bossGateX + bossGateHalfWidth + diameter.radius;
      const rightWall = currentBossRoomEndX() - diameter.radius - 14;
      if (!diameterLocked) {
      diameter.shotTimer -= dt;
      if (diameter.shotTimer <= 0) {
        const baseAngle = Math.atan2(man.y - diameter.y, man.x - diameter.x);
        for (let i = 0; i < 3; i++) {
          // Wide random spread makes this powerful volley intentionally inaccurate.
          const angle = baseAngle + (i - 1) * .25 + (Math.random() - .5) * .48;
          const shotSpeed = (720 + Math.random() * 90) * auraSpeed;
          diameterShots.push({
            x: diameter.x + Math.cos(angle) * (diameter.radius + 32),
            y: diameter.y + Math.sin(angle) * (diameter.radius + 32),
            vx: Math.cos(angle) * shotSpeed,
            vy: Math.sin(angle) * shotSpeed,
            radius: 22, rotation: angle, life: 7, split: false, owner: 'diameter'
          });
        }
        diameter.shotTimer = 30;
      }

      if (diameter.chargeTime > 0 && diameter.grounded) {
        diameter.vx = diameter.chargeDirection * 650 * auraSpeed;
        diameter.chargeTime = Math.max(0, diameter.chargeTime - dt);
        if (diameter.chargeTime <= 0) diameter.chargeTimer = 9 + Math.random() * 5;
      } else if (diameter.grounded) {
        diameter.chargeTimer -= dt;
        diameter.jumpTimer -= dt;
        diameter.vx *= Math.pow(.08, dt);
        if (diameter.chargeTimer <= 0) {
          diameter.chargeDirection = Math.sign(man.x - diameter.x) || -1;
          diameter.chargeTime = .8;
          diameter.vx = diameter.chargeDirection * 650 * auraSpeed;
        } else if (diameter.jumpTimer <= 0) {
          diameter.vx = (Math.sign(man.x - diameter.x) || -1) * 390 * auraSpeed;
          diameter.vy = -670 * auraSpeed;
          diameter.grounded = false;
          diameter.jumpTimer = 2.8 + Math.random() * 1.4;
        }
      } else {
        diameter.vy += 1500 * dt;
      }
      diameter.x += diameter.vx * dt;
      diameter.y += diameter.vy * dt;
      diameter.rotation += diameter.vx * dt / diameter.radius;

      if (diameter.x < leftWall) {
        diameter.x = leftWall;
        diameter.vx = Math.abs(diameter.vx) * .55;
        diameter.chargeTime = 0;
      } else if (diameter.x > rightWall) {
        diameter.x = rightWall;
        diameter.vx = -Math.abs(diameter.vx) * .55;
        diameter.chargeTime = 0;
      }
      if (diameter.y >= floorY) {
        diameter.y = floorY;
        diameter.vy = 0;
        diameter.grounded = true;
      }
      } else {
        diameter.x = Math.max(leftWall, rightWall - 270);
        diameter.y = floorY;
        diameter.vx = 0;
        diameter.vy = 0;
        diameter.chargeTime = 0;
        diameter.grounded = true;
      }

      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - diameter.x, attack.bladeY - diameter.y) < diameter.radius + 62;
      if (bladeHit && !diameter.bladeTouching && !diameterLocked) {
        if (diameter.lastComboAttack !== attack.id) {
          diameter.lastComboAttack = attack.id;
          attack.kills++;
        }
        const hit = applyBossDamage(diameter, bladeDamage, true);
        diameter.hitFlash = .18;
        bossDamagePopups.push({
          x: diameter.x, y: diameter.y - diameter.radius - 15,
          vy: -62, life: .85, damage: hit.amount, blocked: hit.blocked
        });
        if (!bossPhaseThree) {
          if (diameter.health <= 10) lockDiameterAtPhaseTwoThreshold();
          tryBeginBossPhaseThree();
        } else if (diameter.health <= 0) {
          diameter.alive = false;
          for (let i = 0; i < 42; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 430;
            bossParticles.push({
              x: diameter.x, y: diameter.y,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 170,
              life: .8 + Math.random() * .9, size: 7 + Math.random() * 15,
              diameter: true
            });
          }
          shapes += 20;
          updateShapes();
        }
      }
      diameter.bladeTouching = bladeHit;

      const touchingPlayer = diameter.alive &&
        Math.hypot(man.x - diameter.x, man.y - diameter.y) < diameter.radius + man.width * .55;
      if (touchingPlayer && !diameterLocked && !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - diameter.x) || -1) * 700;
        man.vy = -440;
        man.hitTime = 1.1;
        damagePlayer(1, true);
      }
    }

    const circumference = circumferenceBoss;
    if (circumference.alive) {
      circumference.hitFlash = Math.max(0, circumference.hitFlash - dt);
      circumference.shotTimer -= dt;
      circumference.diameterTimer -= dt;
      circumference.floaterTimer -= dt;
      if (circumference.burstShots > 0) circumference.burstTimer -= dt;

      const aimAngle = Math.atan2(man.y - circumference.y, man.x - circumference.x);
      if (circumference.shotTimer <= 0 && circumference.burstShots === 0) {
        circumference.burstShots = 3;
        circumference.burstTimer = 0;
      }
      if (circumference.burstShots > 0 && circumference.burstTimer <= 0) {
        bossProjectiles.push({
          x: circumference.x + Math.cos(aimAngle) * (circumference.radius + 38),
          y: circumference.y + Math.sin(aimAngle) * (circumference.radius + 38),
          vx: Math.cos(aimAngle) * 275,
          vy: Math.sin(aimAngle) * 275 - 190,
          radius: 29, life: 14, health: 3, rotation: 0,
          hitFlash: 0, bladeTouching: false, grounded: false, owner: 'circumference'
        });
        circumference.burstShots--;
        if (circumference.burstShots > 0) circumference.burstTimer = .3;
        else circumference.shotTimer = 30;
      }
      if (circumference.diameterTimer <= 0) {
        for (let i = 0; i < 3; i++) {
          const angle = aimAngle + (i - 1) * .25 + (Math.random() - .5) * .48;
          const shotSpeed = 720 + Math.random() * 90;
          diameterShots.push({
            x: circumference.x + Math.cos(angle) * (circumference.radius + 32),
            y: circumference.y + Math.sin(angle) * (circumference.radius + 32),
            vx: Math.cos(angle) * shotSpeed, vy: Math.sin(angle) * shotSpeed,
            radius: 22, rotation: angle, life: 7, split: false, owner: 'circumference'
          });
        }
        circumference.diameterTimer = 30;
      }
      if (circumference.floaterTimer <= 0) {
        if (bossFloaters.length === 0) {
          for (let i = 0; i < 3; i++) {
            bossFloaters.push({
              x: circumference.x - 105 - i * 14,
              y: circumference.y + (i - 1) * 72,
              radius: 28, health: 1, rotation: Math.random() * Math.PI * 2,
              spin: (Math.random() - .5) * 3.4, turnTimer: .45 + Math.random() * .9,
              hitFlash: 0, bladeTouching: false, alive: true, owner: 'circumference'
            });
          }
        }
        circumference.floaterTimer = 20;
      }

      const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
      circumference.vy += 1250 * dt;
      circumference.y += circumference.vy * dt;
      const floorY = roomFloor - circumference.radius;
      if (circumference.y >= floorY) {
        circumference.y = floorY;
        circumference.vy = 0;
        circumference.grounded = true;
      }
      circumference.rotation += dt * .7;

      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - circumference.x, attack.bladeY - circumference.y) <
          circumference.radius + 62;
      if (bladeHit && !circumference.bladeTouching) {
        if (circumference.lastComboAttack !== attack.id) {
          circumference.lastComboAttack = attack.id;
          attack.kills++;
        }
        circumference.health -= bladeDamage;
        circumference.hitFlash = .18;
        bossDamagePopups.push({
          x: circumference.x, y: circumference.y - circumference.radius - 15,
          vy: -62, life: .85, damage: bladeDamage
        });
        if (circumference.health <= 0) {
          circumference.alive = false;
          for (let i = 0; i < 48; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 160 + Math.random() * 450;
            bossParticles.push({
              x: circumference.x, y: circumference.y,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 180,
              life: .8 + Math.random() * .9, size: 7 + Math.random() * 15
            });
          }
          shapes += 30;
          updateShapes();
        }
      }
      circumference.bladeTouching = bladeHit;
      const touchingPlayer = Math.hypot(man.x - circumference.x, man.y - circumference.y) <
        circumference.radius + man.width * .55;
      if (touchingPlayer && !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - circumference.x) || -1) * 680;
        man.vy = -430;
        man.hitTime = 1.05;
        damagePlayer();
      }
    }

    diameterShots.forEach(shot => {
      if (shot.split) return;
      shot.vy += 480 * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.rotation += (Math.hypot(shot.vx, shot.vy) / shot.radius) * dt;
      shot.life -= dt;

      const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
      const leftWall = bossGateX + bossGateHalfWidth + shot.radius;
      const rightWall = currentBossRoomEndX() - shot.radius - 14;
      const ceiling = roomFloor - currentBossRoomHeight() + shot.radius;
      const floor = roomFloor - shot.radius;
      const hitArena = shot.x <= leftWall || shot.x >= rightWall ||
        shot.y <= ceiling || shot.y >= floor;
      const hitPlayer = Math.hypot(shot.x - man.x, shot.y - man.y) <
        shot.radius + man.width * .55;
      const hitBlade = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - shot.x, attack.bladeY - shot.y) < shot.radius + 55;

      if (hitPlayer && man.hitTime <= 0) {
        man.vx = (Math.sign(shot.vx) || -1) * 560;
        man.vy = -330;
        man.hitTime = .95;
        damagePlayer(1, shot.owner === 'diameter');
      }
      if (hitArena || hitPlayer || hitBlade) splitDiameterShot(shot);
    });
    diameterShots = diameterShots.filter(shot => !shot.split && shot.life > 0);

    if (!boss.alive) {
      bossFloaters = bossFloaters.filter(floater => floater.owner !== 'radius');
    }
    if (!boss.alive && !diameter.alive && !circumference.alive) {
      bossProjectiles = [];
      diameterShots = [];
    }

    bossFloaters.forEach(floater => {
      if (!floater.alive) return;
      floater.hitFlash = Math.max(0, floater.hitFlash - dt);
      floater.turnTimer -= dt;
      if (floater.turnTimer <= 0) {
        floater.spin = (Math.random() - .5) * 3.8;
        floater.turnTimer = .4 + Math.random() * 1.1;
      }
      floater.rotation += floater.spin * dt;
      const floatSpeed = 118;
      floater.x += Math.cos(floater.rotation) * floatSpeed * dt;
      floater.y += Math.sin(floater.rotation) * floatSpeed * dt;

      const roomFloor = mountainMineFloorAt(bossRoomStartX, 0);
      const leftWall = bossGateX + bossGateHalfWidth + floater.radius;
      const rightWall = currentBossRoomEndX() - floater.radius - 14;
      const ceiling = roomFloor - currentBossRoomHeight() + floater.radius;
      const floor = roomFloor - floater.radius;
      if (floater.x < leftWall) {
        floater.x = leftWall;
        floater.rotation = Math.PI - floater.rotation;
      }
      if (floater.x > rightWall) {
        floater.x = rightWall;
        floater.rotation = Math.PI - floater.rotation;
      }
      if (floater.y < ceiling) {
        floater.y = ceiling;
        floater.rotation = -floater.rotation;
      }
      if (floater.y > floor) {
        floater.y = floor;
        floater.rotation = -floater.rotation;
      }

      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - floater.x, attack.bladeY - floater.y) < floater.radius + 58;
      if (bladeHit && !floater.bladeTouching) {
        floater.health -= bladeDamage;
        floater.hitFlash = .16;
        bossDamagePopups.push({
          x: floater.x, y: floater.y - floater.radius - 10,
          vy: -55, life: .75, damage: bladeDamage
        });
        if (floater.health <= 0) {
          floater.alive = false;
          for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const particleSpeed = 90 + Math.random() * 230;
            bossParticles.push({
              x: floater.x, y: floater.y,
              vx: Math.cos(angle) * particleSpeed,
              vy: Math.sin(angle) * particleSpeed - 80,
              life: .45 + Math.random() * .45, size: 4 + Math.random() * 7
            });
          }
        }
      }
      floater.bladeTouching = bladeHit;

      const touchingPlayer = floater.alive &&
        Math.hypot(floater.x - man.x, floater.y - man.y) < floater.radius + man.width * .55;
      if (touchingPlayer && !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - floater.x) || -1) * 470;
        man.vy = -280;
        man.hitTime = .9;
        damagePlayer(1, floater.owner === 'radius');
      }
    });
    bossFloaters = bossFloaters.filter(floater => floater.alive);

    bossProjectiles.forEach(projectile => {
      projectile.hitFlash = Math.max(0, projectile.hitFlash - dt);
      projectile.vy += 1050 * dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      projectile.rotation += projectile.vx * dt / projectile.radius;

      const projectileFloor = mountainMineFloorAt(projectile.x, 0) - projectile.radius;
      const projectileCeiling = mountainMineFloorAt(bossRoomStartX, 0) -
        currentBossRoomHeight() + projectile.radius;
      if (projectile.y < projectileCeiling) {
        projectile.y = projectileCeiling;
        projectile.vy = Math.abs(projectile.vy) * .7;
      }
      if (projectile.y >= projectileFloor) {
        projectile.y = projectileFloor;
        if (projectile.vy > 230) projectile.vy *= -.22;
        else { projectile.vy = 0; projectile.grounded = true; }
      } else {
        projectile.grounded = false;
      }

      const projectileLeftWall = bossGateClosed ? bossGateX + bossGateHalfWidth + projectile.radius : bossRoomStartX;
      const projectileRightWall = currentBossRoomEndX() - projectile.radius - 14;
      if (projectile.x < projectileLeftWall) {
        projectile.x = projectileLeftWall;
        projectile.vx = Math.abs(projectile.vx) * .65;
      } else if (projectile.x > projectileRightWall) {
        projectile.x = projectileRightWall;
        projectile.vx = -Math.abs(projectile.vx) * .65;
      }

      if (projectile.grounded) {
        const chaseDirection = Math.sign(man.x - projectile.x) || -1;
        projectile.vx += chaseDirection * 520 * dt;
        projectile.vx = Math.max(-155, Math.min(155, projectile.vx));
        projectile.vx *= Math.pow(.72, dt);
      }

      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - projectile.x, attack.bladeY - projectile.y) < projectile.radius + 58;
      if (bladeHit && !projectile.bladeTouching) {
        projectile.health -= bladeDamage;
        projectile.hitFlash = .16;
        bossDamagePopups.push({
          x: projectile.x, y: projectile.y - projectile.radius - 12,
          vy: -55, life: .75, damage: bladeDamage
        });
        if (projectile.health <= 0) {
          projectile.life = 0;
          for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 90 + Math.random() * 230;
            bossParticles.push({
              x: projectile.x, y: projectile.y,
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 80,
              life: .45 + Math.random() * .45, size: 4 + Math.random() * 7,
              green: true
            });
          }
          shapes++;
          updateShapes();
        }
      }
      projectile.bladeTouching = bladeHit;

      const touchingPlayer = Math.hypot(projectile.x - man.x, projectile.y - man.y) <
        projectile.radius + man.width * .55;
      if (touchingPlayer && man.hitTime <= 0) {
        man.vx = (Math.sign(projectile.vx) || -1) * 510;
        man.vy = -300;
        man.hitTime = .9;
        damagePlayer(1, projectile.owner === 'radius' || projectile.owner === 'diameter');
      }
      if (projectile.y < groundY - 850 || projectile.y > groundY + 150) projectile.life = 0;
    });
    bossProjectiles = bossProjectiles.filter(projectile => projectile.life > 0);

    if (bossPhaseThree && !bossFightComplete && !boss.alive &&
      !diameter.alive && !circumference.alive) {
      bossFightComplete = true;
      bossGateClosed = false;
      bossProjectiles = [];
      bossFloaters = [];
      diameterShots = [];
      healPlayerToMax();
      announceBossPhase(4);
    }

    bossParticles.forEach(particle => {
      particle.vy += 1150 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
    });
    bossParticles = bossParticles.filter(particle => particle.life > 0);
    bossDamagePopups.forEach(popup => {
      popup.y += popup.vy * dt;
      popup.life -= dt;
    });
    bossDamagePopups = bossDamagePopups.filter(popup => popup.life > 0);
  }

  function updateHealth() {
    if (!healthHud) return;
    if (playtesting) {
      healthHud.setAttribute('aria-label', 'Infinite health');
      healthHud.innerHTML = '<span class="infinite">∞</span>';
      return;
    }
    healthHud.setAttribute('aria-label', `${health} health`);
    healthHud.innerHTML = [0, 1, 2]
      .map(index => `<span class="${index >= health ? 'lost' : ''}">♥</span>`)
      .join('');
  }

  function updateBreathHud() {
    if (!bubbleHud) return;
    const visible = started && (playerInWater || breathBubbles < 5);
    bubbleHud.classList.toggle('hidden', !visible);
    bubbleHud.setAttribute('aria-label', `${breathBubbles} air bubbles`);
    bubbleHud.innerHTML = visible ? '<span></span>'.repeat(breathBubbles) : '';
  }

  function updateBreathing(dt) {
    const overMoat = insideKingdom && man.x >= kingdomMoatStartX && man.x <= kingdomMoatEndX;
    const standingOnBridge = drawbridgeLowering >= .98 &&
      man.y + man.height / 2 <= groundY + 18;
    const nowInWater = overMoat && !standingOnBridge &&
      man.y + man.height / 2 > groundY + 16;
    if (nowInWater !== playerInWater) {
      playerInWater = nowInWater;
      breathTimer = 0;
    }
    breathTimer += dt;
    while (breathTimer >= 1) {
      breathTimer -= 1;
      if (playerInWater) {
        if (breathBubbles > 0) breathBubbles--;
        else damagePlayer(1);
      } else if (breathBubbles < 5) {
        breathBubbles++;
      } else {
        breathTimer = 0;
        break;
      }
    }
    updateBreathHud();
  }

  function triggerDrawbridgeBreak() {
    if (ambushTriggered) return;
    ambushTriggered = true;
    drawbridgeBreakTime = .9;
    ambushTitleTimer = 2.4;
    for (let i = 0; i < 24; i++) {
      drawbridgeDebris.push({
        x: kingdomCastleWallX + (Math.random() - .5) * 55,
        y: groundY - 25 - Math.random() * 360,
        vx: (Math.random() - .5) * 390,
        vy: -100 - Math.random() * 380,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - .5) * 11,
        width: 10 + Math.random() * 26,
        height: 5 + Math.random() * 9,
        life: 1.1 + Math.random() * .8
      });
    }
    for (let i = 0; i < 6; i++) {
      const zone = i % 2 === 0 ? 'kingdom' : 'kingdom-rhombus';
      const enemy = makeEnemy(kingdomCastleWallX + 85 + (i % 5) * 42, zone);
      enemy.aggro = 1;
      enemy.ambush = true;
      enemy.noRespawn = true;
      enemy.rushBoostTimer = 3.2;
      enemy.chargeTimer = .2 + (i % 5) * .09;
      enemies.push(enemy);
    }
  }

  function triggerBarracksWave() {
    if (barracksWaveTriggered) return;
    barracksWaveTriggered = true;
    barracksGarrisonQueue = [
      'kingdom', 'kingdom', 'kingdom-rhombus', 'kingdom'
    ];
    barracksDeployTimer = 0;
  }

  function updateBarracksDeployment(dt) {
    if (!insideKingdom || barracksGarrisonQueue.length === 0) return;
    barracksDeployTimer -= dt;
    if (barracksDeployTimer > 0) return;
    const zone = barracksGarrisonQueue.shift();
    const enemy = makeEnemy(barracksX + 12, zone);
    enemy.aggro = 1;
    enemy.rushBoostTimer = 3;
    if (enemy.rhombus) enemy.chargeTimer = .2;
    enemies.push(enemy);
    barracksDeployTimer = .16;
  }

  function updateKingdomCastle(dt) {
    if (!insideKingdom) return;
    if (drawbridgeHealth <= 0) {
      drawbridgeLowering = Math.min(1, drawbridgeLowering + dt * .72);
    }
    drawbridgeBreakTime = Math.max(0, drawbridgeBreakTime - dt);
    drawbridgeDebris.forEach(piece => {
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.vy += 1050 * dt;
      piece.rotation += piece.spin * dt;
      piece.life -= dt;
    });
    drawbridgeDebris = drawbridgeDebris.filter(piece => piece.life > 0);
    const bladeHit = drawbridgeHealth > 0 && attack.active &&
      attack.launchDelay <= 0 && man.throwTime <= 0 &&
      Math.abs(attack.bladeX - kingdomCastleWallX) < 92 &&
      attack.bladeY > groundY - 300 && attack.bladeY < groundY + 24;
    if (!bladeHit || drawbridgeLastAttack === attack.id) return;
    drawbridgeLastAttack = attack.id;
    const damage = Math.min(drawbridgeHealth, bladeDamage);
    drawbridgeHealth = Math.max(0, drawbridgeHealth - bladeDamage);
    damagePopups.push({
      x: kingdomCastleWallX, y: groundY - 250, vy: -55,
      life: .75, damage
    });
    if (drawbridgeHealth <= 0) {
      drawbridgeLowering = Math.max(drawbridgeLowering, .01);
      triggerDrawbridgeBreak();
    }
  }

  function fireBowArrow(directionX, directionY) {
    if (!bowOwned || bowReload > 0) return;
    const distance = Math.hypot(directionX, directionY);
    if (distance < 12) return;
    const dirX = directionX / distance;
    const dirY = directionY / distance;
    arrows.push({
      x: man.x, y: man.y - 18,
      vx: dirX * arrowSpeed,
      vy: dirY * arrowSpeed,
      angle: Math.atan2(dirY, dirX), life: 3,
      scene: currentSceneKey()
    });
    bowReload = bowReloadDuration;
    if (Math.abs(directionX) > 1) man.facing = Math.sign(directionX);
  }

  function updateArrows(dt) {
    bowReload = Math.max(0, bowReload - dt);
    arrows.forEach(arrow => {
      if (arrow.scene !== currentSceneKey()) {
        arrow.life = 0;
        return;
      }
      arrow.vy += arrowGravity * dt;
      arrow.x += arrow.vx * dt;
      arrow.y += arrow.vy * dt;
      arrow.angle = Math.atan2(arrow.vy, arrow.vx);
      arrow.life -= dt;
      if (arrow.scene === 'kingdom' || arrow.scene === 'world' || arrow.scene === 'shop') {
        for (const enemy of enemies) {
          const interiorTarget = arrow.scene === 'shop';
          if (!enemy.alive || enemy.inShop !== interiorTarget) continue;
          const enemyX = interiorTarget ? enemy.shopX : enemy.x;
          const enemyY = interiorTarget ? groundY - enemy.radius : enemyWorldY(enemy);
          if (Math.hypot(arrow.x - enemyX, arrow.y - enemyY) > enemy.radius + 18) continue;
          enemy.health -= 1;
          enemy.hitFlash = .16;
          enemy.aggro = 1;
          damagePopups.push({
            x: enemyX, y: enemyY - enemy.radius - 12,
            vy: -55, life: .75, damage: 1, insideShop: interiorTarget
          });
          if (enemy.health <= 0) {
            enemy.alive = false;
            enemy.respawnTimer = 0;
            if (interiorTarget) splatInteriorEnemy(enemy, enemyY);
            else splatEnemy(enemy, enemyY);
          }
          arrow.life = 0;
          break;
        }
      }
      const floor = activeGroundAt(arrow.x);
      if (arrow.y >= floor || arrow.x < 0 || arrow.x > worldEnd) arrow.life = 0;
    });
    arrows = arrows.filter(arrow => arrow.life > 0);
  }

  function updateShapes() {
    if (!shapeHud) return;
    shapeHud.setAttribute('aria-label', `${shapes} shapes`);
    const count = shapeHud.querySelector('b');
    if (count) count.textContent = shapes;
  }

  function damagePlayer(amount = 1, auraCanBoost = false) {
    if (playtesting || !started) return;
    if (auraCanBoost && circumferenceBoss.alive && Math.random() < .3) amount++;
    if (hasArmor && Math.random() < .5) {
      armorBlockTimer = 1;
      amount--;
      if (amount <= 0) return;
    }
    health -= amount;
    healthRegenTimer = 0;
    damageFlash = 1;
    damageShakeUntil = performance.now() + 220;
    damageShakeStrength = Math.min(10, 5 + amount * 2);
    updateHealth();
    if (health <= 0) gameOver();
  }

  function slashHitsTarget(x, y, radius = 0) {
    const forward = (x - man.x) * man.facing;
    return forward >= -35 - radius && forward <= 235 + radius &&
      Math.abs(y - man.y) <= 120 + radius && Math.hypot(x - man.x, y - man.y) <= 270 + radius;
  }

  function burstBossFromSlash(target, y, reward) {
    target.health = 0;
    target.alive = false;
    for (let i = 0; i < 46; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 450;
      bossParticles.push({
        x: target.x, y, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 180, life: .8 + Math.random() * .9,
        size: 7 + Math.random() * 15
      });
    }
    bossDamagePopups.push({ x: target.x, y: y - target.radius - 15, vy: -62, life: .85, damage: '∞' });
    shapes += reward;
    updateShapes();
  }

  function performPlaytestSwordHit() {
    if (!playtesting) return;
    if (insideShop) {
      enemies.forEach(enemy => {
        if (!enemy.alive || !enemy.inShop) return;
        const y = groundY - enemy.radius;
        if (!slashHitsTarget(enemy.shopX, y, enemy.radius)) return;
        enemy.alive = false;
        enemy.respawnTimer = 0;
        splatInteriorEnemy(enemy, y);
        damagePopups.push({
          x: enemy.shopX, y: y - enemy.radius - 12, vy: -55,
          life: .75, damage: '∞', insideShop: true
        });
      });
      return;
    }
    if (insideMine) {
      mineEnemies.forEach(enemy => {
        if (!enemy.alive) return;
        const y = mineFloorAt(enemy.x, enemy.level) - enemy.radius;
        if (!slashHitsTarget(enemy.x, y, enemy.radius)) return;
        enemy.health = 0;
        enemy.alive = false;
        mineDrops.push({ x: enemy.x, y, vy: -260, collected: false, level: enemy.level });
        mineDamagePopups.push({ x: enemy.x, y: y - enemy.radius - 12, vy: -55, life: .75, damage: '∞' });
      });
      return;
    }
    if (insideMountainMine) {
      mountainMiners.forEach(enemy => {
        if (!enemy.alive) return;
        const y = mountainMineFloorAt(enemy.x, enemy.level) - enemy.radius;
        if (!slashHitsTarget(enemy.x, y, enemy.radius)) return;
        enemy.health = 0;
        enemy.alive = false;
        mountainMinerDrops.push({
          x: enemy.x, y, vy: -250, level: enemy.level,
          collected: false, kind: enemy.guard ? 'key' : 'shape'
        });
        mountainMinerPopups.push({ x: enemy.x, y: y - enemy.radius - 12, vy: -55, life: .75, damage: '∞' });
      });

      const radiusY = mountainMineFloorAt(mountainBoss.x) - mountainBoss.radius;
      if (mountainBoss.alive && slashHitsTarget(mountainBoss.x, radiusY, mountainBoss.radius)) {
        if (!bossPhaseTwo) beginBossPhaseTwo();
        else if (!bossPhaseThree) {
          lockRadiusAtPhaseTwoThreshold();
          mountainBoss.hitFlash = .3;
          tryBeginBossPhaseThree();
        } else burstBossFromSlash(mountainBoss, radiusY, 20);
      }
      if (diameterBoss.alive && slashHitsTarget(diameterBoss.x, diameterBoss.y, diameterBoss.radius)) {
        if (!bossPhaseThree) {
          lockDiameterAtPhaseTwoThreshold();
          diameterBoss.hitFlash = .3;
          tryBeginBossPhaseThree();
        } else burstBossFromSlash(diameterBoss, diameterBoss.y, 20);
      }
      if (circumferenceBoss.alive &&
        slashHitsTarget(circumferenceBoss.x, circumferenceBoss.y, circumferenceBoss.radius)) {
        burstBossFromSlash(circumferenceBoss, circumferenceBoss.y, 30);
      }
      bossFloaters.forEach(floater => {
        if (floater.alive && slashHitsTarget(floater.x, floater.y, floater.radius)) floater.alive = false;
      });
      bossProjectiles.forEach(projectile => {
        if (slashHitsTarget(projectile.x, projectile.y, projectile.radius)) projectile.life = 0;
      });
      diameterShots.forEach(shot => {
        if (!shot.split && slashHitsTarget(shot.x, shot.y, shot.radius)) shot.split = true;
      });
      return;
    }

    if (insideKingdom && drawbridgeHealth > 0 &&
      slashHitsTarget(kingdomCastleWallX, groundY - 105, 110)) {
      drawbridgeHealth = 0;
      drawbridgeLowering = Math.max(drawbridgeLowering, .01);
      triggerDrawbridgeBreak();
      damagePopups.push({
        x: kingdomCastleWallX, y: groundY - 250, vy: -55,
        life: .75, damage: '∞'
      });
    }

    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.inShop) return;
      const y = enemyWorldY(enemy);
      if (!slashHitsTarget(enemy.x, y, enemy.radius)) return;
      enemy.health = 0;
      enemy.alive = false;
      enemy.respawnTimer = 0;
      splatEnemy(enemy, y);
      damagePopups.push({ x: enemy.x, y: y - enemy.radius - 12, vy: -55, life: .75, damage: '∞' });
    });
  }

  function startPlaytestSwordSlash() {
    if (!started || !playtesting || paused || teleportOpen || inventoryOpen || shopPopupOpen ||
      playtestSword.cooldown > 0) return;
    playtestSword.time = playtestSword.duration;
    playtestSword.cooldown = .24;
    playtestSword.hit = false;
  }

  function currentSceneKey() {
    if (insideBarracks) return 'barracks';
    if (insideKingdom) return 'kingdom';
    if (insideMountainMine) return 'mountain-mine';
    if (insideMine) return 'mine';
    if (insideTownHouse) return `house-${townHouseIndex}`;
    if (insideShop) return 'shop';
    return 'world';
  }

  function deathDropFloor(drop) {
    if (drop.scene === 'mountain-mine') return mountainMineFloorAt(drop.x, drop.level);
    if (drop.scene === 'mine') return mineFloorAt(drop.x, drop.level);
    if (drop.scene === 'shop' || drop.scene === 'barracks' || drop.scene.startsWith('house-')) return groundY;
    return groundAt(drop.x);
  }

  function addDeathDrop(kind, amount, offset) {
    const drop = {
      kind, amount, scene: currentSceneKey(), level: insideMountainMine ? mountainMineLevel : mineLevel,
      x: man.x + offset, y: man.y - 8, vx: offset * 2.7 + (Math.random() - .5) * 90,
      vy: -260 - Math.random() * 150, expiresAt: performance.now() + 120000
    };
    deathDrops.push(drop);
    return drop;
  }

  function dropPlayerInventory() {
    if (shapes > 0) {
      for (let i = 0; i < shapes; i++) {
        const angle = i * 2.399963;
        const spread = Math.min(62, 12 + Math.sqrt(i) * 7);
        const drop = addDeathDrop('shapes', 1, Math.cos(angle) * spread);
        drop.vx += Math.cos(angle) * (75 + Math.min(165, Math.sqrt(i) * 18));
        drop.vy -= Math.abs(Math.sin(angle)) * 105;
      }
    }
    if (cloakOwned) addDeathDrop('cloak', 1, -34);
    if (armorOwned) addDeathDrop('armor', 1, 0);
    if (treasureKeyOwned) addDeathDrop('key', 1, 22);
    if (bowOwned) addDeathDrop('bow', 1, 28);
    if (sharpeningLevel > 0) addDeathDrop('sharpening', sharpeningLevel, 34);
    shapes = 0;
    cloakOwned = false;
    hasCloak = false;
    armorOwned = false;
    hasArmor = false;
    treasureKeyOwned = false;
    bowOwned = false;
    sharpeningLevel = 0;
    bladeDamage = 1;
    updateShapes();
    updateInventoryUI();
    updateShopPopup();
  }

  function updateDeathDrops(dt) {
    const now = performance.now();
    deathDrops.forEach(drop => {
      drop.vy += 1050 * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      const floor = deathDropFloor(drop) - 15;
      if (drop.y >= floor) {
        drop.y = floor;
        drop.vy = 0;
        drop.vx *= Math.pow(.025, dt);
      }
      if (drop.scene !== currentSceneKey() || Math.hypot(drop.x - man.x, drop.y - man.y) > 62) return;
      drop.collected = true;
      if (drop.kind === 'shapes') shapes += drop.amount;
      if (drop.kind === 'cloak') {
        const storageIndex = firstFreeStorageIndex();
        cloakOwned = true;
        hasCloak = false;
        cloakStorageIndex = storageIndex;
      }
      if (drop.kind === 'armor') {
        const storageIndex = firstFreeStorageIndex();
        armorOwned = true;
        hasArmor = false;
        armorStorageIndex = storageIndex;
      }
      if (drop.kind === 'key') {
        keyStorageIndex = firstFreeStorageIndex();
        treasureKeyOwned = true;
      }
      if (drop.kind === 'bow') {
        bowStorageIndex = firstFreeStorageIndex();
        bowOwned = true;
      }
      if (drop.kind === 'sharpening') {
        sharpeningLevel += drop.amount;
        bladeDamage = 1 + sharpeningLevel;
      }
      updateShapes();
      updateInventoryUI();
      updateShopPopup();
    });
    deathDrops = deathDrops.filter(drop => !drop.collected && drop.expiresAt > now);
  }

  function splatEnemy(enemy, enemyY) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 260;
      splats.push({
        x: enemy.x, y: enemyY, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100, life: .55 + Math.random() * .45,
        size: 4 + Math.random() * 8
      });
    }
    shapeDrops.push({ x: enemy.x, y: enemyY, vx: (Math.random() - .5) * 90, vy: -260, collected: false });
  }

  function splatInteriorEnemy(enemy, enemyY) {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 260;
      splats.push({
        x: enemy.shopX, y: enemyY, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100, life: .55 + Math.random() * .45,
        size: 4 + Math.random() * 8, insideShop: true
      });
    }
    shapeDrops.push({
      x: enemy.shopX, y: enemyY, vx: (Math.random() - .5) * 90,
      vy: -260, collected: false, insideShop: true
    });
  }

  function resetGame() {
    playtesting = Boolean(playtestToggle && playtestToggle.checked);
    const now = performance.now();
    const preserveMountainMine = deathDrops.some(drop =>
      drop.scene === 'mountain-mine' && drop.expiresAt > now);
    health = 3;
    healthRegenTimer = 0;
    damageFlash = 0;
    damageShakeUntil = 0;
    damageShakeStrength = 0;
    breathBubbles = 5;
    breathTimer = 0;
    playerInWater = false;
    cameraX = 0;
    cameraY = 0;
    enemies = [];
    splats = [];
    shapeDrops = [];
    damagePopups = [];
    insideShop = false;
    insideMine = false;
    insideMountainMine = false;
    insideKingdom = false;
    insideBarracks = false;
    insideTownHouse = false;
    townHouseIndex = 0;
    cloakChestOpened = deathDrops.some(drop => drop.kind === 'cloak' && drop.expiresAt > now);
    cloakOwned = false;
    hasCloak = false;
    cloakStorageIndex = 0;
    armorChestOpened = deathDrops.some(drop => drop.kind === 'armor' && drop.expiresAt > now);
    armorOwned = false;
    hasArmor = false;
    armorStorageIndex = 1;
    armorBlockTimer = 0;
    bowChestOpened = deathDrops.some(drop => drop.kind === 'bow' && drop.expiresAt > now);
    bowOwned = false;
    bowStorageIndex = 0;
    bowReload = 0;
    arrows = [];
    bowAim.drawing = false;
    cloakPickupTimer = 0;
    dashTime = 0;
    dashCooldown = 0;
    dashDirection = 1;
    playtestSword.time = 0;
    playtestSword.cooldown = 0;
    playtestSword.hit = false;
    resetMine();
    if (preserveMountainMine) bossGateClosed = false;
    else resetMountainBoss();
    shopDoorBroken = false;
    shopDoorBoarded = true;
    shopkeeperFleeing = false;
    shopkeeperReturning = false;
    shopkeeperHidden = false;
    shopkeeperFleeX = 0;
    shopkeeperFleeY = 0;
    shopSafeTimer = 0;
    doorDebris = [];
    shopPopupOpen = false;
    nextEnemyX = 650;
    hillNextEnemyX = hillStart + 260;
    boulderNextEnemyX = boulderHillStartX + boulderHillWidth * .35;
    kingdomNextEnemyX = kingdomCastleWallX + 380;
    kingdomSpawnIndex = 0;
    kingdomGuardsSpawned = false;
    drawbridgeHealth = 5;
    drawbridgeLowering = 0;
    drawbridgeLastAttack = -1;
    drawbridgeBreakTime = 0;
    drawbridgeDebris = [];
    ambushTriggered = false;
    ambushTitleTimer = 0;
    barracksWaveTriggered = false;
    barracksGarrisonQueue = [];
    barracksDeployTimer = 0;
    wasInPlains = false;
    plainsTitleTimer = 0;
    wasInBoulderHills = false;
    boulderTitleTimer = 0;
    wasInTown = false;
    townTitleTimer = 0;
    wasInKingdom = false;
    kingdomTitleTimer = 0;
    attack.drawing = false;
    attack.active = false;
    attack.path = [];
    attack.index = 0;
    attack.visible = 0;
    attack.kills = 0;
    attack.bladeX = 0;
    attack.bladeY = 0;
    attack.thrown = false;
    attack.landed = false;
    attack.throwVx = 0;
    attack.throwVy = 0;
    attack.directionCharge = 0;
    attack.comboTriggered = false;
    attack.launchDelay = 0;
    combo.timer = 0;
    combo.slowTime = 0;
    combo.zoomTime = 0;
    teleportOpen = false;
    inventoryOpen = false;
    keys.left = keys.right = keys.jump = keys.down = false;
    Object.assign(man, {
      x: 210, y: groundAt(210) - man.height / 2, vx: 0, vy: 0,
      grounded: true, coyote: 0, jumpBuffer: 0, hitTime: 0, throwTime: 0, throwAngle: 0
    });
    document.body.classList.remove('targeting');
    if (shopPopup) shopPopup.classList.add('hidden');
    if (comboHud) comboHud.classList.add('hidden');
    if (teleportScreen) teleportScreen.classList.add('hidden');
    if (inventoryScreen) inventoryScreen.classList.add('hidden');
    updateInventoryUI();
    updateHealth();
    updateBreathHud();
    updateShapes();
  }

  function pauseGame() {
    if (!started) return;
    started = false;
    paused = true;
    teleportOpen = false;
    inventoryOpen = false;
    if (teleportScreen) teleportScreen.classList.add('hidden');
    if (inventoryScreen) inventoryScreen.classList.add('hidden');
    shopPopupOpen = false;
    if (shopPopup) shopPopup.classList.add('hidden');
    if (attack.drawing) {
      attack.drawing = false;
      attack.path = [];
      document.body.classList.remove('targeting');
    }
    bowAim.drawing = false;
    if (menuTitle) menuTitle.textContent = 'SHAPEDOWN';
    if (playButton) playButton.textContent = 'RESUME';
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (pauseButton) pauseButton.classList.add('hidden');
    if (bubbleHud) bubbleHud.classList.add('hidden');
  }

  function setTeleportOpen(open) {
    if (open && (!started || !playtesting)) return;
    if (open) {
      inventoryOpen = false;
      if (inventoryScreen) inventoryScreen.classList.add('hidden');
    }
    teleportOpen = open;
    if (teleportScreen) teleportScreen.classList.toggle('hidden', !open);
    keys.left = keys.right = keys.jump = keys.down = false;
    if (open && attack.drawing) {
      attack.drawing = false;
      attack.path = [];
      document.body.classList.remove('targeting');
    }
    if (open) bowAim.drawing = false;
  }

  function itemInArmorSlot() {
    if (cloakOwned && hasCloak) return 'cloak';
    if (armorOwned && hasArmor) return 'armor';
    return null;
  }

  function itemInStorageSlot(index) {
    if (cloakOwned && !hasCloak && cloakStorageIndex === index) return 'cloak';
    if (armorOwned && !hasArmor && armorStorageIndex === index) return 'armor';
    if (treasureKeyOwned && keyStorageIndex === index) return 'key';
    if (bowOwned && bowStorageIndex === index) return 'bow';
    return null;
  }

  function firstFreeStorageIndex() {
    for (let index = 0; index < storageSlots.length; index++) {
      if (!itemInStorageSlot(index)) return index;
    }
    return 0;
  }

  function setItemStored(item, index) {
    if (item === 'cloak') {
      hasCloak = false;
      cloakStorageIndex = index;
      dashTime = 0;
    } else if (item === 'armor') {
      hasArmor = false;
      armorStorageIndex = index;
    } else if (item === 'bow') {
      bowStorageIndex = index;
    } else {
      keyStorageIndex = index;
    }
  }

  function setItemEquipped(item) {
    if (item === 'cloak') hasCloak = true;
    else if (item === 'armor') hasArmor = true;
  }

  function moveInventoryItem(item, targetIsArmor, targetIndex = -1) {
    if ((item === 'key' || item === 'bow') && targetIsArmor) return;
    const sourceIsArmor = itemInArmorSlot() === item;
    const sourceIndex = sourceIsArmor ? -1 :
      item === 'cloak' ? cloakStorageIndex : item === 'armor' ? armorStorageIndex :
        item === 'bow' ? bowStorageIndex : keyStorageIndex;
    const targetItem = targetIsArmor ? itemInArmorSlot() : itemInStorageSlot(targetIndex);
    if (targetItem === item) return;
    if (targetIsArmor) {
      if (targetItem) {
        if (sourceIndex < 0) return;
        setItemStored(targetItem, sourceIndex);
      }
      setItemEquipped(item);
    } else {
      if (targetItem) {
        if (sourceIsArmor && (targetItem === 'key' || targetItem === 'bow')) {
          setItemStored(targetItem, firstFreeStorageIndex());
        } else if (sourceIsArmor) setItemEquipped(targetItem);
        else setItemStored(targetItem, sourceIndex);
      }
      setItemStored(item, targetIndex);
    }
    updateInventoryUI();
  }

  function setInventorySlotItem(slot, item, equipped = false) {
    const isEquipped = Boolean(item && equipped);
    slot.classList.toggle('locked', !item);
    slot.classList.toggle('occupied', Boolean(item));
    slot.classList.toggle('equipped', isEquipped);
    slot.classList.toggle('item-cloak', item === 'cloak');
    slot.classList.toggle('item-armor', item === 'armor');
    slot.classList.toggle('item-key', item === 'key');
    slot.classList.toggle('item-bow', item === 'bow');
    slot.draggable = Boolean(item);
    slot.dataset.item = item || '';
    const name = item === 'cloak' ? 'Brown cloak' : item === 'armor' ? 'Guard armor' :
      item === 'key' ? 'Cage key' : item === 'bow' ? 'Bow' : 'Empty';
    slot.setAttribute('aria-label', `${name}${isEquipped ? ' equipped' : ''} in ${equipped ? 'armor' : 'storage'} slot`);
  }

  function updateInventoryUI() {
    if (armorSlot) setInventorySlotItem(armorSlot, itemInArmorSlot(), true);
    storageSlots.forEach((slot, index) => setInventorySlotItem(slot, itemInStorageSlot(index), false));
  }

  function setInventoryOpen(open) {
    if (open && !started) return;
    inventoryOpen = open;
    if (inventoryScreen) inventoryScreen.classList.toggle('hidden', !open);
    if (open) {
      teleportOpen = false;
      if (teleportScreen) teleportScreen.classList.add('hidden');
      updateInventoryUI();
      bowAim.drawing = false;
    }
    keys.left = keys.right = keys.jump = keys.down = false;
    if (open && attack.drawing) {
      attack.drawing = false;
      attack.path = [];
      document.body.classList.remove('targeting');
    }
  }

  function teleportTo(region) {
    if (!playtesting) return;
    shopPopupOpen = false;
    if (shopPopup) shopPopup.classList.add('hidden');
    insideShop = false;
    insideMine = false;
    insideMountainMine = false;
    insideKingdom = false;
    insideBarracks = false;
    insideTownHouse = false;
    mineClimb = null;
    attack.drawing = false;
    attack.active = false;
    attack.thrown = false;
    attack.landed = false;
    attack.path = [];
    document.body.classList.remove('targeting');

    if (region === 'mountain-mine') {
      mountainMineReturnX = mountainEntranceX;
      mountainMineReturnCamera = Math.max(0, mountainEntranceX - width * .36);
      mountainMineReturnCameraY = Math.min(0, groundAt(mountainEntranceX) - groundY);
      insideMountainMine = true;
      mountainMineLevel = 0;
      mountainMineClimb = null;
      man.x = bossRoomStartX - 620;
      man.y = mountainMineFloorAt(man.x) - man.height / 2;
      cameraX = Math.max(0, man.x - width * .36);
      cameraY = man.y - (groundY - man.height / 2);
    } else if (region === 'deep-mine') {
      mineReturnX = mineX;
      mineReturnCamera = Math.max(0, Math.min(worldEnd - width, mineX - width * .36));
      mineReturnCameraY = Math.min(0, groundAt(mineX) - (groundY - man.height / 2));
      insideMine = true;
      mineLevel = 2;
      man.x = 4800;
      man.y = mineFloorAt(man.x, mineLevel) - man.height / 2;
      cameraX = Math.max(0, Math.min(mineWorldWidth - width, man.x - width * .36));
      cameraY = man.y - (groundY - man.height / 2);
    } else {
      const destinations = {
        start: 210,
        shop: shopX + 74,
        boulder: hillTopX + 130,
        mine: mineX - 90,
        town: townStartX + 260,
        kingdom: kingdomStartX + 180
      };
      man.x = Object.prototype.hasOwnProperty.call(destinations, region) ? destinations[region] : 210;
      insideKingdom = region === 'kingdom';
      man.y = groundAt(man.x) - man.height / 2;
      cameraX = Math.max(0, Math.min(worldEnd - width, man.x - width * .36));
      cameraY = man.y - (groundY - man.height / 2);
    }
    man.vx = 0;
    man.vy = 0;
    man.grounded = true;
    man.hitTime = 0;
    setTeleportOpen(false);
  }

  function toggleShop() {
    if (!started || attack.active || attack.drawing || bowAim.drawing) return;
    if (insideBarracks) {
      const chestX = interiorPoint(.72);
      if (!bowChestOpened && playerNear(chestX, groundY - man.height / 2, 125)) {
        bowChestOpened = true;
        bowOwned = true;
        bowStorageIndex = firstFreeStorageIndex();
        updateInventoryUI();
        return;
      }
      if (!playerNear(90, groundY - man.height / 2, 120)) return;
      insideBarracks = false;
      man.x = barracksReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = barracksReturnCamera;
      cameraY = 0;
      return;
    }
    if (insideMountainMine) {
      const bossExitY = mountainMineFloorAt(bossExitDoorX, 0) - man.height / 2;
      if (bossFightComplete && mountainMineLevel === 0 &&
        playerNear(bossExitDoorX, bossExitY, 145)) {
        insideMountainMine = false;
        insideKingdom = true;
        man.x = kingdomStartX + 180;
        man.y = groundAt(man.x) - man.height / 2;
        man.vx = 0;
        man.vy = 0;
        man.grounded = true;
        cameraX = Math.max(0, Math.min(worldEnd - width, man.x - width * .36));
        cameraY = 0;
        wasInKingdom = true;
        kingdomTitleTimer = 3.8;
        return;
      }
      const gateY = mountainMineFloorAt(treasureGateX, 2) - man.height / 2;
      const treasureChestY = mountainMineFloorAt(treasureChestX, 2) - man.height / 2;
      if (mountainMineLevel === 2 && !treasureGateUnlocked &&
        playerNear(treasureGateX, gateY, 125)) {
        if (treasureKeyOwned) {
          treasureGateUnlocked = true;
          treasureKeyOwned = false;
          updateInventoryUI();
        }
        return;
      }
      if (mountainMineLevel === 2 && treasureGateUnlocked && !armorChestOpened &&
        playerNear(treasureChestX, treasureChestY, 130)) {
        const storageIndex = firstFreeStorageIndex();
        armorChestOpened = true;
        armorOwned = true;
        hasArmor = false;
        armorStorageIndex = storageIndex;
        updateInventoryUI();
        return;
      }
      const exitY = mountainMineFloorAt(105, 0) - man.height / 2;
      if (mountainMineLevel !== 0 || mountainMineClimb || !playerNear(105, exitY, 125)) return;
      insideMountainMine = false;
      man.x = mountainMineReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = mountainMineReturnCamera;
      cameraY = mountainMineReturnCameraY;
      return;
    }
    if (insideTownHouse) {
      if (townHouseIndex === cloakHouseIndex && !cloakChestOpened &&
        playerNear(cloakChestX(), groundY - man.height / 2, 125)) {
        const storageIndex = firstFreeStorageIndex();
        cloakChestOpened = true;
        cloakOwned = true;
        hasCloak = false;
        cloakStorageIndex = storageIndex;
        cloakPickupTimer = 3.2;
        updateInventoryUI();
        return;
      }
      if (!playerNear(90, groundY - man.height / 2, 120)) return;
      insideTownHouse = false;
      man.x = townHouseReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = townHouseReturnCamera;
      cameraY = townHouseReturnCameraY;
      return;
    }
    if (insideMine) {
      const exitY = mineFloorAt(105, 0) - man.height / 2;
      if (mineLevel !== 0 || mineClimb || !playerNear(105, exitY, 125)) return;
      insideMine = false;
      man.x = mineReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = mineReturnCamera;
      cameraY = mineReturnCameraY;
      return;
    }
    if (insideShop) {
      if (shopPopupOpen) {
        shopPopupOpen = false;
        if (shopPopup) shopPopup.classList.add('hidden');
        return;
      }
      const keeperX = interiorPoint(.76);
      if (!shopkeeperFleeing && !shopkeeperReturning && !shopkeeperHidden &&
        playerNear(keeperX, groundY - man.height / 2, 145)) {
        shopPopupOpen = true;
        updateShopPopup();
        if (shopPopup) shopPopup.classList.remove('hidden');
        return;
      }
      if (!playerNear(90, groundY - man.height / 2, 120)) return;
      insideShop = false;
      man.x = shopReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = shopReturnCamera;
      cameraY = shopReturnCameraY;
      return;
    }
    if (insideKingdom && playerNear(barracksX, groundY - man.height / 2, 145)) {
      insideBarracks = true;
      barracksReturnX = man.x;
      barracksReturnCamera = cameraX;
      man.x = interiorPoint(.28);
      man.y = groundY - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = 0;
      cameraY = 0;
      return;
    }
    if (playerNear(mineX, groundAt(mineX) - man.height / 2, 145)) {
      insideMine = true;
      mineReturnX = man.x;
      mineReturnCamera = cameraX;
      mineReturnCameraY = cameraY;
      man.x = 115;
      mineLevel = 0;
      mineClimb = null;
      man.y = mineFloorAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = 0;
      cameraY = 0;
      return;
    }
    if (playerNear(mountainEntranceX, groundAt(mountainEntranceX) - man.height / 2, 150)) {
      insideMountainMine = true;
      mountainMineLevel = 0;
      mountainMineClimb = null;
      mountainMineReturnX = man.x;
      mountainMineReturnCamera = cameraX;
      mountainMineReturnCameraY = cameraY;
      man.x = 120;
      man.y = mountainMineFloorAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = 0;
      cameraY = 0;
      return;
    }
    let nearbyHouse = -1;
    let nearbyHouseDistance = Infinity;
    townBuildings.forEach((building, index) => {
      const doorX = townStartX + building.offset + building.width * .68 + 39;
      const distance = Math.hypot(man.x - doorX,
        man.y - (groundAt(doorX) - man.height / 2));
      if (distance < nearbyHouseDistance) {
        nearbyHouse = index;
        nearbyHouseDistance = distance;
      }
    });
    if (nearbyHouse >= 0 && nearbyHouseDistance < 135) {
      insideTownHouse = true;
      townHouseIndex = nearbyHouse;
      townHouseReturnX = man.x;
      townHouseReturnCamera = cameraX;
      townHouseReturnCameraY = cameraY;
      man.x = interiorPoint(.32);
      man.y = groundY - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = 0;
      cameraY = 0;
      return;
    }
    const doorX = shopX + 74;
    if (!playerNear(doorX, groundAt(doorX) - man.height / 2, 135)) return;
    insideShop = true;
    shopReturnX = man.x;
    shopReturnCamera = cameraX;
    shopReturnCameraY = cameraY;
    man.x = interiorPoint(.32);
    man.y = groundAt(shopX) - man.height / 2;
    man.vx = 0;
    man.vy = 0;
    cameraX = 0;
    cameraY = 0;
  }

  function updateShopPopup() {
    const cost = 50 + sharpeningLevel * 25;
    if (damageLabel) damageLabel.textContent = `CURRENT DAMAGE: ${bladeDamage}`;
    if (upgradeButton) {
      upgradeButton.textContent = playtesting ? 'SHARPEN — FREE' : `SHARPEN — ${cost} SHAPES`;
    }
  }

  function buySharpening() {
    const cost = 50 + sharpeningLevel * 25;
    if (!playtesting && shapes < cost) {
      if (upgradeButton) upgradeButton.textContent = `NEED ${cost - shapes} MORE SHAPES`;
      return;
    }
    if (!playtesting) shapes -= cost;
    sharpeningLevel++;
    bladeDamage++;
    updateShapes();
    updateShopPopup();
  }

  function triggerCombo(count) {
    combo.timer = 1.35;
    combo.slowTime = .7;
    combo.zoomTime = combo.zoomDuration;
    if (comboHud) {
      comboHud.textContent = `COMBO x${count}`;
      comboHud.classList.add('hidden');
      void comboHud.offsetWidth;
      comboHud.classList.remove('hidden');
    }
  }

  function gameOver() {
    if (!started) return;
    dropPlayerInventory();
    started = false;
    paused = false;
    if (menuTitle) menuTitle.textContent = 'GAME OVER';
    if (playButton) playButton.textContent = 'RETRY';
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (healthHud) healthHud.classList.add('hidden');
    if (bubbleHud) bubbleHud.classList.add('hidden');
    if (shapeHud) shapeHud.classList.add('hidden');
    if (comboHud) comboHud.classList.add('hidden');
    if (pauseButton) pauseButton.classList.add('hidden');
  }

  function resize() {
    ratio = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth; height = innerHeight; groundY = height * .78;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (man.grounded || man.y === 0) man.y = activeGroundAt(man.x) - man.height / 2;
  }

  function update(dt) {
    if (!started) return;
    if (teleportOpen || inventoryOpen) return;
    if (!playtesting && health < 3) {
      healthRegenTimer += dt;
      if (healthRegenTimer >= 20) {
        health = Math.min(3, health + 1);
        healthRegenTimer = 0;
        updateHealth();
      }
    } else {
      healthRegenTimer = 0;
    }
    damageFlash = Math.max(0, damageFlash - dt * 2.8);
    armorBlockTimer = Math.max(0, armorBlockTimer - dt);
    bossPhaseTitleTimer = Math.max(0, bossPhaseTitleTimer - dt);
    kingdomTitleTimer = Math.max(0, kingdomTitleTimer - dt);
    ambushTitleTimer = Math.max(0, ambushTitleTimer - dt);
    playtestSword.cooldown = Math.max(0, playtestSword.cooldown - dt);
    if (playtestSword.time > 0) {
      playtestSword.time = Math.max(0, playtestSword.time - dt);
      if (!playtestSword.hit && playtestSword.time <= playtestSword.duration * .62) {
        playtestSword.hit = true;
        performPlaytestSwordHit();
      }
    }
    updateDeathDrops(dt);
    boulderTitleTimer = Math.max(0, boulderTitleTimer - dt);
    plainsTitleTimer = Math.max(0, plainsTitleTimer - dt);
    townTitleTimer = Math.max(0, townTitleTimer - dt);
    updateArrows(dt);
    if (insideShop && shopPopupOpen) {
      man.vx = 0;
      man.vy = 0;
      updateShopRaid(dt);
      return;
    }
    if (combo.timer > 0) {
      combo.timer = Math.max(0, combo.timer - dt);
      if (combo.timer === 0 && comboHud) comboHud.classList.add('hidden');
    }
    combo.slowTime = Math.max(0, combo.slowTime - dt);
    combo.zoomTime = Math.max(0, combo.zoomTime - dt);
    const movementDt = combo.slowTime > 0 ? dt * .22 : dt;
    const worldDt = attack.drawing ? dt * .16 : movementDt;
    const previousManX = man.x;
    man.idleTime += movementDt;
    man.throwTime = Math.max(0, man.throwTime - dt);
    man.hitTime = Math.max(0, man.hitTime - worldDt);
    cloakPickupTimer = Math.max(0, cloakPickupTimer - dt);
    dashCooldown = Math.max(0, dashCooldown - dt);
    dashTime = Math.max(0, dashTime - dt);
    attack.visible = Math.max(0, attack.visible - dt);
    const bladeAttackingThisFrame = attack.active;
    if (attack.active) {
      if (attack.launchDelay > 0) {
        attack.launchDelay = Math.max(0, attack.launchDelay - dt);
        const p = Math.max(0, Math.min(1, 1 - man.throwTime / .52));
        const pose = throwPose(p);
        attack.bladeX = man.x + pose.handX;
        attack.bladeY = man.y + pose.handY;
      } else if (attack.thrown) {
        attack.throwVy += 1250 * dt;
        attack.bladeX += attack.throwVx * dt;
        attack.bladeY += attack.throwVy * dt;
        attack.bladeAngle = Math.atan2(attack.throwVy, attack.throwVx);
        attack.throwTime -= dt;
        const tipY = attack.bladeY + Math.sin(attack.bladeAngle) * 96;
        const bladeGround = activeGroundAt(attack.bladeX);
        const hitGround = attack.bladeX <= worldEnd && tipY >= bladeGround;
        const bladeScreenX = attack.bladeX - cameraX;
        const outsideView = bladeScreenX < -220 || bladeScreenX > width + 220 ||
          attack.bladeY < -220 || attack.bladeY > height + 220;
        if (hitGround) {
          attack.bladeY -= tipY - bladeGround;
          attack.throwVx = 0;
          attack.throwVy = 0;
          attack.throwTime = .45;
          attack.thrown = false;
          attack.landed = true;
        } else if (outsideView || attack.throwTime <= 0) {
          attack.active = false;
          attack.thrown = false;
          attack.visible = 0;
        }
      } else if (attack.landed) {
        attack.throwTime -= dt;
        if (attack.throwTime <= 0) {
          attack.active = false;
          attack.landed = false;
          attack.visible = 0;
        }
      } else {
        let travel = lanceSpeed * dt;
        while (travel > 0 && attack.index < attack.path.length) {
          const target = attack.path[attack.index];
          const dx = target.x - attack.bladeX, dy = target.y - attack.bladeY;
          const distance = Math.hypot(dx, dy);
          const dirX = dx / distance, dirY = dy / distance;
          const moved = Math.min(distance, travel);
          const alignment = dirX * attack.lastDirX + dirY * attack.lastDirY;
          attack.directionCharge = alignment > .93 ? attack.directionCharge + moved : moved;
          attack.lastDirX = dirX;
          attack.lastDirY = dirY;
          attack.bladeAngle = Math.atan2(dy, dx);
          if (distance <= travel) {
            attack.bladeX = target.x; attack.bladeY = target.y; travel -= distance; attack.index++;
          } else {
            attack.bladeX += dirX * travel;
            attack.bladeY += dirY * travel;
            travel = 0;
          }
        }
        if (attack.index >= attack.path.length) {
          const throwSpeed = lanceSpeed;
          attack.throwVx = attack.lastDirX * throwSpeed;
          attack.throwVy = attack.lastDirY * throwSpeed;
          attack.throwTime = 1.6;
          attack.thrown = true;
          attack.landed = false;
          attack.path = [];
          if (attack.kills >= 3) {
            triggerCombo(attack.kills);
            attack.comboTriggered = true;
          }
        }
      }
    }

    updateKingdomCastle(dt);
    updateBarracksDeployment(dt);

    const climbingMine = insideMountainMine ?
      updateMountainMineClimb(movementDt) : updateMineClimb(movementDt);
    if (climbingMine) {
      man.runTime += movementDt * 7;
    } else if (dashTime > 0) {
      const wasGrounded = man.grounded;
      man.vx = dashDirection * 1050;
      man.x += man.vx * movementDt;
      if (playtesting) {
        man.y += man.vy * movementDt;
        man.vy *= Math.pow(.08, movementDt);
        man.grounded = false;
      } else {
        man.vy += 1200 * movementDt;
        man.y += man.vy * movementDt;
        const floor = activeGroundAt(man.x) - man.height / 2;
        if (man.y >= floor || (wasGrounded && man.vy >= 0 && floor - man.y < 32)) {
          man.y = floor;
          man.vy = 0;
          man.grounded = true;
        } else {
          man.grounded = false;
        }
      }
      man.runTime += Math.abs(man.vx) * movementDt * .045;
    } else if (attack.drawing) {
      // Controls are disabled, but existing momentum and gravity continue in slow motion.
      if (playtesting) {
        man.x += man.vx * worldDt;
        man.y += man.vy * worldDt;
        man.vx *= Math.pow(.12, worldDt);
        man.vy *= Math.pow(.12, worldDt);
      } else {
        const wasGrounded = man.grounded;
        man.vx *= Math.pow(man.grounded ? .0004 : .06, worldDt);
        man.vy += 1850 * worldDt;
        man.x += man.vx * worldDt;
        man.y += man.vy * worldDt;
        const floor = activeGroundAt(man.x) - man.height / 2;
        if (man.y >= floor || (wasGrounded && man.vy >= 0 && floor - man.y < 32)) {
          man.y = floor; man.vy = 0; man.grounded = true;
        }
        else man.grounded = false;
      }
      man.runTime += Math.abs(man.vx) * worldDt * .038;
    } else {
      const direction = Number(keys.right) - Number(keys.left);
      if (playtesting) {
        const verticalDirection = Number(keys.down) - Number(keys.jump);
        const blend = Math.min(1, movementDt * 8);
        man.vx += (direction * 430 - man.vx) * blend;
        man.vy += (verticalDirection * 430 - man.vy) * blend;
        if (direction) man.facing = direction;
        man.x += man.vx * movementDt;
        man.y += man.vy * movementDt;
        man.grounded = false;
        man.coyote = 0;
        man.jumpBuffer = 0;
      } else {
        const wasGrounded = man.grounded;
        if (direction) {
          man.vx += direction * (man.grounded ? 1750 : 950) * movementDt;
          man.facing = direction;
        } else {
          man.vx *= Math.pow(man.grounded ? .0004 : .06, movementDt);
        }
        man.vx = Math.max(-390, Math.min(390, man.vx));
        man.coyote = man.grounded ? .11 : Math.max(0, man.coyote - movementDt);
        man.jumpBuffer = Math.max(0, man.jumpBuffer - movementDt);
        if (man.jumpBuffer > 0 && man.coyote > 0) {
          man.vy = -840; man.grounded = false; man.coyote = 0; man.jumpBuffer = 0;
        }
        if (!keys.jump && man.vy < -220) man.vy += 1350 * movementDt;
        man.vy += 1850 * movementDt;
        man.x += man.vx * movementDt; man.y += man.vy * movementDt;
        const floor = activeGroundAt(man.x) - man.height / 2;
        if (man.y >= floor || (wasGrounded && man.vy >= 0 && floor - man.y < 32)) {
          man.y = floor; man.vy = 0; man.grounded = true;
        }
        else man.grounded = false;
      }
      man.runTime += Math.abs(man.vx) * movementDt * .038;
    }
    updateBreathing(dt);
    if (!started) return;
    if (playtesting && insideMountainMine) {
      mountainMineLevel = nearestMineLevel(mountainMineFloorAt, mountainMineLevelCount);
    } else if (playtesting && insideMine) {
      mineLevel = nearestMineLevel(mineFloorAt, mineLevelCount);
    }
    if (insideMountainMine) {
      updateMountainMine(worldDt);
      if (bossGateClosed && mountainMineLevel === 0) {
        man.x = Math.max(bossGateX + bossGateHalfWidth + man.width / 2, man.x);
      }
      if (mountainMineLevel === 0 && man.x >= bossRoomStartX - 100) {
        man.x = Math.min(currentBossRoomEndX() - man.width / 2 - 14, man.x);
      }
      if (!treasureGateUnlocked) {
        const cageFloor = mountainMineFloorAt(treasureGateX, 2);
        const cageTop = cageFloor - 230;
        const overlapsCageHeight = man.y + man.height / 2 > cageTop &&
          man.y - man.height / 2 < cageFloor;
        if (overlapsCageHeight && man.x < treasureGateX + man.width / 2 + 22) {
          man.x = treasureGateX + man.width / 2 + 22;
        }
      }
      if (!playtesting && mountainMineLevel !== 0) {
        man.x = Math.min(bossRoomStartX - 90, man.x);
        if (man.grounded) man.y = mountainMineFloorAt(man.x, mountainMineLevel) - man.height / 2;
      }
      man.x = Math.max(60, Math.min(mountainMineWidth - 60, man.x));
      const mountainMineCameraTarget = Math.min(
        Math.max(0, man.x - width * .36),
        Math.max(0, mountainMineWidth - width)
      );
      cameraX += (mountainMineCameraTarget - cameraX) * Math.min(1, worldDt * 5);
      const mountainMineBaseY = groundY - man.height / 2;
      const mountainMineCameraTargetY = man.y - mountainMineBaseY;
      cameraY += (mountainMineCameraTargetY - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    if (insideMine) {
      updateMine(worldDt);
      man.x = Math.max(60, Math.min(mineWorldWidth - 60, man.x));
      const mineCameraTarget = Math.min(
        Math.max(0, man.x - width * .36),
        Math.max(0, mineWorldWidth - width)
      );
      cameraX += (mineCameraTarget - cameraX) * Math.min(1, worldDt * 5);
      const mineBaseY = groundY - man.height / 2;
      const mineCameraTargetY = man.y - mineBaseY;
      cameraY += (mineCameraTargetY - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    if (insideTownHouse) {
      const room = interiorBounds();
      man.x = Math.max(room.left + 41, Math.min(room.right - 41, man.x));
      cameraX = 0;
      const interiorBaseY = groundY - man.height / 2;
      const interiorCameraTarget = man.y - interiorBaseY;
      cameraY += (interiorCameraTarget - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    if (insideBarracks) {
      const room = interiorBounds();
      man.x = Math.max(room.left + 41, Math.min(room.right - 41, man.x));
      cameraX = 0;
      const interiorBaseY = groundY - man.height / 2;
      cameraY += (man.y - interiorBaseY - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    if (insideShop) {
      updateShopRaid(worldDt);
      const room = interiorBounds();
      man.x = Math.max(room.left + 41, Math.min(room.right - 41, man.x));
      cameraX = 0;
      const interiorBaseY = groundY - man.height / 2;
      const interiorCameraTarget = man.y - interiorBaseY;
      cameraY += (interiorCameraTarget - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    const mountainBarrierHalfWidth = mountainWallHalfWidth + man.width / 2;
    if (insideKingdom) {
      const closedGateLimit = kingdomCastleWallX - man.width / 2 - 10;
      if (drawbridgeLowering < .98 && previousManX <= closedGateLimit && man.x > closedGateLimit) {
        man.x = closedGateLimit;
        man.vx = Math.min(0, man.vx);
      }
      man.x = Math.max(kingdomStartX + man.width, Math.min(kingdomEndX - man.width, man.x));
      if (drawbridgeLowering >= .98 && man.x > kingdomCastleWallX + 55) {
        triggerBarracksWave();
      }
    } else if (previousManX < mountainMineWallX && man.x >= mountainMineWallX) {
      man.x = mountainMineWallX - mountainBarrierHalfWidth;
      man.vx = Math.min(0, man.vx);
    }
    man.x = Math.max(cameraX + man.width, Math.min(worldEnd - man.width, man.x));
    const cameraTarget = Math.min(
      Math.max(0, man.x - width * .36),
      Math.max(0, worldEnd - width)
    );
    cameraX += (cameraTarget - cameraX) * Math.min(1, worldDt * 5);
    const basePlayerY = groundY - man.height / 2;
    const cameraYTarget = man.y - basePlayerY;
    cameraY += (cameraYTarget - cameraY) * Math.min(1, worldDt * 3.5);
    const inPlains = man.x < hillStart;
    if (inPlains && !wasInPlains) plainsTitleTimer = 3.4;
    wasInPlains = inPlains;
    const inBoulderHills = man.x >= hillTopX - 90 && man.x < townStartX;
    if (inBoulderHills && !wasInBoulderHills) {
      boulderTitleTimer = 3.4;
    }
    wasInBoulderHills = inBoulderHills;
    const inTown = man.x >= townStartX && man.x < townEndX;
    if (inTown && !wasInTown) townTitleTimer = 3.4;
    wasInTown = inTown;
    const inKingdom = insideKingdom;
    if (inKingdom && !wasInKingdom) kingdomTitleTimer = 3.8;
    wasInKingdom = inKingdom;

    const enemySpawnLimit = Math.min(cameraX + width + 500, shopX - 520);
    while (nextEnemyX < enemySpawnLimit) {
      enemies.push(makeEnemy(nextEnemyX, 'before'));
      nextEnemyX += 470 + Math.random() * 360;
    }
    const hillEnemyLimit = Math.min(cameraX + width + 500, hillTopX - 180);
    while (hillNextEnemyX < hillEnemyLimit) {
      enemies.push(makeEnemy(hillNextEnemyX, 'hill'));
      hillNextEnemyX += 390 + Math.random() * 250;
    }
    const boulderEnemyLimit = Math.min(cameraX + width + 650, townStartX - 220);
    while (boulderNextEnemyX < boulderEnemyLimit) {
      enemies.push(makeEnemy(boulderNextEnemyX, 'boulder'));
      boulderNextEnemyX += 1100 + Math.random() * 400;
    }
    if (insideKingdom) {
      if (!kingdomGuardsSpawned) {
        enemies.push(
          makeEnemy(kingdomMoatEndX + 65, 'kingdom-guard-square'),
          makeEnemy(kingdomMoatEndX + 140, 'kingdom-guard-square')
        );
        kingdomGuardsSpawned = true;
      }
      const kingdomEnemyLimit = Math.min(cameraX + width + 500, kingdomEndX - 180);
      while (kingdomNextEnemyX < kingdomEnemyLimit) {
        const zone = kingdomSpawnIndex % 2 === 0 ? 'kingdom' : 'kingdom-rhombus';
        enemies.push(makeEnemy(kingdomNextEnemyX, zone));
        kingdomSpawnIndex++;
        kingdomNextEnemyX += 430 + Math.random() * 260;
      }
    }

    enemies.forEach(enemy => {
      if (!enemy.alive) {
        if (enemy.noRespawn) return;
        const spawnScreenX = enemy.spawnX - cameraX;
        const spawnScreenY = enemyWorldY(enemy, enemy.spawnX) - cameraY;
        const spawnOutsideView = spawnScreenX < -80 || spawnScreenX > width + 80 ||
          spawnScreenY < -80 || spawnScreenY > height + 80;
        enemy.respawnTimer = spawnOutsideView ? enemy.respawnTimer + worldDt : 0;
        if (enemy.respawnTimer >= 5) {
          enemy.x = enemy.spawnX;
          enemy.health = 3;
          enemy.aggro = 0;
          enemy.hitFlash = 0;
          enemy.bladeTouching = false;
          enemy.respawnTimer = 0;
          enemy.inShop = false;
          enemy.shopX = 0;
          enemy.rollDirection = 0;
          enemy.rollCooldown = 0;
          enemy.rushBoostTimer = 0;
          enemy.chargeTimer = 1.1 + Math.random() * 1.7;
          enemy.chargeTime = 0;
          enemy.chargeDirection = 0;
          enemy.alive = true;
        }
        return;
      }
      // Circles that crossed the doorway now belong to the interior scene.
      if (enemy.inShop) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - worldDt);
      enemy.rollCooldown = Math.max(0, enemy.rollCooldown - worldDt);
      enemy.rushBoostTimer = Math.max(0, enemy.rushBoostTimer - worldDt);
      enemy.chargeTimer = Math.max(0, enemy.chargeTimer - worldDt);
      enemy.chargeTime = Math.max(0, enemy.chargeTime - worldDt);
      const sightX = enemy.x - cameraX;
      const sightY = enemyWorldY(enemy) - cameraY;
      const inSight = sightX + enemy.radius >= 0 && sightX - enemy.radius <= width &&
        sightY + enemy.radius >= 0 && sightY - enemy.radius <= height;
      if (!inSight) {
        enemy.aggro = 0;
        enemy.rollDirection = 0;
        enemy.rollCooldown = 0;
      }
      let pursuitDirection = Math.sign(man.x - enemy.x);
      const inAggroRange = enemy.rushBoostTimer > 0 || (inSight &&
        (Math.abs(man.x - enemy.x) < (enemy.rocky ? 1350 : 520) || enemy.aggro > .8));
      if (enemy.rocky && inAggroRange && !enemy.rollDirection && enemy.rollCooldown <= 0) {
        enemy.rollDirection = pursuitDirection || -1;
      }
      if (enemy.rocky && enemy.rollDirection) pursuitDirection = enemy.rollDirection;
      if (enemy.rhombus && inAggroRange && enemy.chargeTime <= 0 && enemy.chargeTimer <= 0) {
        enemy.chargeDirection = pursuitDirection || -1;
        enemy.chargeTime = .55;
        enemy.chargeTimer = 2.4 + Math.random() * 1.8;
      }
      if (enemy.rhombus && enemy.chargeTime > 0) pursuitDirection = enemy.chargeDirection;
      if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + worldDt * .85);
      else enemy.aggro = Math.max(0, enemy.aggro - worldDt * .45);
      if ((inAggroRange && (!enemy.rocky || enemy.rollCooldown <= 0)) ||
        (enemy.rocky && enemy.rollDirection)) {
        const previousEnemyX = enemy.x;
        const step = pursuitDirection * 8;
        const downhill = step ? Math.max(0, (groundAt(enemy.x + step) - groundAt(enemy.x)) / 8) : 0;
        let pursuitSpeed = enemy.rhombus ? (enemy.chargeTime > 0 ? 790 : 48) :
          enemy.speed * (.65 + enemy.aggro * .55) * (enemy.rocky ? 1.15 + downhill * .8 : 1);
        if (enemy.rushBoostTimer > 0) pursuitSpeed *= 2.15;
        if ((enemy.square || enemy.rhombus) && enemy.x >= kingdomMoatStartX &&
          enemy.x <= kingdomMoatEndX) pursuitSpeed *= .72;
        enemy.x += pursuitDirection * pursuitSpeed * worldDt;
        if (enemy.square || enemy.rhombus) {
          if (drawbridgeLowering < .98) {
            if (previousEnemyX < kingdomCastleWallX && enemy.x >= kingdomCastleWallX - enemy.radius) {
              enemy.x = kingdomCastleWallX - enemy.radius;
            } else if (previousEnemyX > kingdomCastleWallX &&
              enemy.x <= kingdomCastleWallX + enemy.radius) {
              enemy.x = kingdomCastleWallX + enemy.radius;
            }
          }
          enemy.x = Math.max(kingdomStartX + enemy.radius,
            Math.min(kingdomEndX - enemy.radius, enemy.x));
        }
        if (!enemy.square && !enemy.rhombus) {
          enemy.rotation += pursuitDirection * pursuitSpeed * worldDt / enemy.radius;
        }
        const rolledPast = enemy.rollDirection < 0 ? enemy.x < man.x : enemy.x > man.x;
        if (enemy.rocky && rolledPast && Math.abs(enemy.x - man.x) > 250) {
          enemy.rollDirection = 0;
          enemy.rollCooldown = 2.5;
        }
      }
      const enemyY = enemyWorldY(enemy);
      const horizontal = Math.abs(man.x - enemy.x) < man.width / 2 + enemy.radius - 3;
      const vertical = man.y + man.height / 2 > enemyY - enemy.radius &&
        man.y - man.height / 2 < enemyY + enemy.radius;
      const bladeHit = bladeAttackingThisFrame && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - enemy.x, attack.bladeY - enemyY) < enemy.radius + 58;

      if (bladeHit && !enemy.bladeTouching) {
        if (enemy.lastComboAttack !== attack.id) {
          enemy.lastComboAttack = attack.id;
          attack.kills++;
        }
        const damage = bladeDamage;
        enemy.health -= damage;
        enemy.aggro = 1;
        enemy.hitFlash = .16;
        damagePopups.push({ x: enemy.x, y: enemyY - enemy.radius - 12, vy: -55, life: .75, damage });
        if (enemy.health <= 0) {
          enemy.alive = false;
          enemy.respawnTimer = 0;
          splatEnemy(enemy, enemyY);
          if ((attack.thrown || attack.path.length === 0) && attack.kills >= 3) {
            if (!attack.comboTriggered) {
              triggerCombo(attack.kills);
              attack.comboTriggered = true;
            } else if (comboHud) {
              comboHud.textContent = `COMBO x${attack.kills}`;
            }
          }
        }
      }
      enemy.bladeTouching = bladeHit;
      if (enemy.alive && horizontal && vertical && !attack.drawing && man.hitTime <= 0) {
          const knockbackDirection = Math.sign(man.x - enemy.x) || -1;
          man.vx = knockbackDirection * 440;
          man.vy = -330;
          man.hitTime = 1;
          damagePlayer(enemy.rhombus && Math.random() < .5 ? 2 : 1);
      }
    });

    splats.forEach(particle => {
      if (particle.insideShop) return;
      particle.x += particle.vx * worldDt;
      particle.y += particle.vy * worldDt;
      particle.vy += 900 * worldDt;
      particle.life -= worldDt;
    });
    splats = splats.filter(particle => particle.insideShop || particle.life > 0);

    damagePopups.forEach(popup => {
      if (popup.insideShop) return;
      popup.y += popup.vy * worldDt;
      popup.life -= worldDt;
    });
    damagePopups = damagePopups.filter(popup => popup.insideShop || popup.life > 0);

    shapeDrops.forEach(drop => {
      if (drop.collected || drop.insideShop) return;
      drop.vy += 1100 * worldDt;
      drop.x += drop.vx * worldDt;
      drop.y += drop.vy * worldDt;
      const dropGround = groundAt(drop.x) - 16;
      if (drop.y > dropGround) { drop.y = dropGround; drop.vy = 0; drop.vx *= .85; }
      if (Math.hypot(man.x - drop.x, man.y - drop.y) < 72) {
        drop.collected = true;
        shapes++;
        updateShapes();
      }
    });
    shapeDrops = shapeDrops.filter(drop => drop.insideShop || (!drop.collected && drop.x > cameraX - 150));

    doorDebris.forEach(piece => {
      piece.x += piece.vx * worldDt;
      piece.y += piece.vy * worldDt;
      piece.vy += 900 * worldDt;
      piece.rotation += piece.spin * worldDt;
      piece.life -= worldDt;
    });
    doorDebris = doorDebris.filter(piece => piece.life > 0);
    updateShopkeeperState(worldDt);
    if (!attack.drawing && !attack.active && attack.visible <= 0) attack.path = [];
  }

  function limb(x1, y1, x2, y2, thickness = 6) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.stroke();
  }

  function drawMan() {
    const x = man.x - cameraX, y = man.y;
    const throwProgress = man.throwTime > 0 ? 1 - man.throwTime / .52 : 0;
    const throwSwing = Math.sin(Math.min(1, throwProgress) * Math.PI / 2);
    const speed = Math.min(1, Math.abs(man.vx) / 270);
    const moving = Math.abs(man.vx) > 8;
    let legs = moving && man.grounded ? Math.sin(man.runTime) * 20 * speed : 0;
    let arms = moving && man.grounded ? Math.sin(man.runTime + Math.PI) * 18 * speed : 0;
    let bounce = moving && man.grounded ? Math.abs(Math.sin(man.runTime)) * 2.5 : Math.sin(man.idleTime * 3) * 1.2;
    if (!man.grounded) {
      legs = man.vy < 0 ? 11 : -7; arms = -13;
    }
    const lean = man.facing * (speed * 5 + throwSwing * 6);
    const hipX = x + lean, hipY = y + 17 - bounce;
    const shoulderX = x + lean * .45, shoulderY = y - 14 - bounce;
    let swordAngle = man.facing > 0 ? -.32 : Math.PI + .32;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.32, 1.32);
    ctx.translate(-x, -y);
    if (hasCloak) {
      const flutter = Math.sin(man.runTime * 1.7) * 5;
      const dashTrail = dashTime > 0 ? 34 : 0;
      ctx.fillStyle = '#704526';
      ctx.strokeStyle = '#2d1a0e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - man.facing * 5, y - 17 - bounce);
      ctx.quadraticCurveTo(
        x - man.facing * (25 + dashTrail), y + 3 + flutter,
        x - man.facing * (32 + dashTrail), y + 38
      );
      ctx.lineTo(x + man.facing * 9, y + 30);
      ctx.lineTo(x + man.facing * 7, y - 13 - bounce);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b37a42';
      ctx.beginPath();
      ctx.arc(x + man.facing * 2, y - 14 - bounce, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x + lean * .18, y - 31 - bounce, 13, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    ctx.stroke();
    limb(shoulderX, shoulderY, hipX, hipY, 7);

    let leftHandX = x - man.facing * 13 + arms * man.facing;
    let rightHandX = x + man.facing * 15 - arms * man.facing;
    let leftHandY = y + 7 - bounce;
    let rightHandY = y + 4 - bounce;
    let leftElbowX = (shoulderX + leftHandX) / 2 - 5 * man.facing;
    let rightElbowX = (shoulderX + rightHandX) / 2 + 5 * man.facing;
    let leftElbowY = y - 1 - bounce;
    let rightElbowY = y - 3 - bounce;
    let heldBowAngle = man.facing > 0 ? 0 : Math.PI;
    const holdingBow = bowOwned && man.throwTime <= 0 &&
      !(playtesting && playtestSword.time > 0);
    if (man.throwTime > 0) {
      const p = Math.max(0, Math.min(1, throwProgress));
      const pose = throwPose(p);
      leftHandX = x - man.facing * 25;
      leftHandY = y + 10 - bounce;
      rightHandX = x + pose.handX;
      rightHandY = y + pose.handY - bounce;
      leftElbowX = x - man.facing * 12;
      leftElbowY = y - 2 - bounce;
      rightElbowX = x + pose.elbowX;
      rightElbowY = y + pose.elbowY - bounce;
    }
    if (playtesting && playtestSword.time > 0) {
      const slashProgress = 1 - playtestSword.time / playtestSword.duration;
      const easedSlash = .5 - Math.cos(slashProgress * Math.PI) * .5;
      const rightFacingAngle = -2.15 + easedSlash * 2.75;
      swordAngle = man.facing > 0 ? rightFacingAngle : Math.PI - rightFacingAngle;
      rightHandX = shoulderX + Math.cos(swordAngle) * 31;
      rightHandY = shoulderY + Math.sin(swordAngle) * 31;
      rightElbowX = shoulderX + Math.cos(swordAngle - man.facing * .5) * 18;
      rightElbowY = shoulderY + Math.sin(swordAngle - man.facing * .5) * 18;
    }
    if (holdingBow) {
      const pullX = bowAim.startX - bowAim.x;
      const pullY = bowAim.startY - bowAim.y;
      if (bowAim.drawing && Math.hypot(pullX, pullY) > 1) {
        heldBowAngle = Math.atan2(pullY, pullX);
      }
      const dirX = Math.cos(heldBowAngle);
      const dirY = Math.sin(heldBowAngle);
      leftHandX = shoulderX + dirX * 35;
      leftHandY = shoulderY + dirY * 35 + 4;
      leftElbowX = shoulderX + dirX * 18 - dirY * 7;
      leftElbowY = shoulderY + dirY * 18 + dirX * 7;
      const pullDistance = bowAim.drawing ? 22 : 5;
      rightHandX = shoulderX - dirX * pullDistance;
      rightHandY = shoulderY - dirY * pullDistance + 4;
      rightElbowX = shoulderX - dirX * 10 + dirY * 12;
      rightElbowY = shoulderY - dirY * 10 - dirX * 12;
    }
    limb(shoulderX, shoulderY + 3, leftElbowX, leftElbowY);
    limb(leftElbowX, leftElbowY, leftHandX, leftHandY);
    limb(shoulderX, shoulderY + 3, rightElbowX, rightElbowY);
    limb(rightElbowX, rightElbowY, rightHandX, rightHandY);
    if (holdingBow) {
      ctx.save();
      ctx.translate(leftHandX, leftHandY);
      ctx.rotate(heldBowAngle);
      ctx.strokeStyle = '#b87a3e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 27, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.strokeStyle = '#eee6ce';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -27);
      ctx.lineTo(bowAim.drawing ? -22 : -5, 0);
      ctx.lineTo(0, 27);
      ctx.stroke();
      ctx.restore();
    }

    const leftFootX = x - 17 + legs;
    const rightFootX = x + 17 - legs;
    const kneeLift = Math.abs(Math.sin(man.runTime)) * 7 * speed;
    const leftKneeX = hipX - 7 + legs * .48;
    const rightKneeX = hipX + 7 - legs * .48;
    limb(hipX, hipY, leftKneeX, y + 26 - kneeLift, 7);
    limb(leftKneeX, y + 26 - kneeLift, leftFootX, y + 40, 7);
    limb(hipX, hipY, rightKneeX, y + 26 + kneeLift * .25, 7);
    limb(rightKneeX, y + 26 + kneeLift * .25, rightFootX, y + 40, 7);
    limb(leftFootX, y + 40, leftFootX + 8 * man.facing, y + 40);
    limb(rightFootX, y + 40, rightFootX + 8 * man.facing, y + 40);
    if (hasArmor) {
      ctx.fillStyle = '#8d989b';
      ctx.strokeStyle = '#30383a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(shoulderX - 18, shoulderY - 3);
      ctx.lineTo(shoulderX + 18, shoulderY - 3);
      ctx.lineTo(hipX + 14, hipY + 7);
      ctx.lineTo(hipX - 14, hipY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#d7e0e2';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY + 1);
      ctx.lineTo(hipX, hipY + 2);
      ctx.stroke();
    }
    if (playtesting && playtestSword.time > 0) {
      ctx.save();
      ctx.translate(rightHandX, rightHandY);
      ctx.rotate(swordAngle);
      ctx.shadowColor = 'rgba(125, 230, 255, .9)';
      ctx.shadowBlur = playtestSword.time > 0 ? 18 : 8;
      ctx.fillStyle = '#eafcff';
      ctx.strokeStyle = '#112b35';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(5, -7);
      ctx.lineTo(90, -4);
      ctx.lineTo(108, 0);
      ctx.lineTo(90, 4);
      ctx.lineTo(5, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#d6a72d';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(3, -15);
      ctx.lineTo(3, 15);
      ctx.stroke();
      ctx.strokeStyle = '#25180e';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-22, 0);
      ctx.stroke();
      ctx.fillStyle = '#d6a72d';
      ctx.beginPath();
      ctx.arc(-26, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    if (armorBlockTimer > 0) {
      drawBrokenSwordIcon(x, y - 81, .65, Math.min(1, armorBlockTimer * 2.5));
    }
  }

  function drawBrokenSwordIcon(x, y, scale = 1, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.rotate(-.58);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // Hilt and the lower half of the snapped sword.
      ctx.strokeStyle = '#111718';
      ctx.fillStyle = '#8a5a2f';
      ctx.lineWidth = 4;
      ctx.fillRect(-5, 12, 10, 23);
      ctx.strokeRect(-5, 12, 10, 23);
      ctx.beginPath();
      ctx.moveTo(-16, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();
      ctx.fillStyle = '#d7e0e2';
      ctx.beginPath();
      ctx.moveTo(-7, 11);
      ctx.lineTo(-6, -14);
      ctx.lineTo(1, -8);
      ctx.lineTo(7, -17);
      ctx.lineTo(7, 11);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // The separated blade tip leaves a clear jagged break between the pieces.
      ctx.translate(8, -13);
      ctx.rotate(.18);
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(-5, -23);
      ctx.lineTo(1, -39);
      ctx.lineTo(7, -23);
      ctx.lineTo(7, -10);
      ctx.lineTo(1, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
  }

  function drawEnemyBody(enemy) {
    if (enemy.rhombus) {
      const red = Math.round(17 + (225 - 17) * enemy.aggro);
      const green = Math.round(130 + (42 - 130) * enemy.aggro);
      const blue = Math.round(59 + (42 - 59) * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = enemy.chargeTime > 0 ? 10 : 8;
      ctx.lineJoin = 'round';
      const pointDirection = enemy.chargeTime > 0 ?
        -(enemy.chargeDirection || 1) : -(Math.sign(man.x - enemy.x) || 1);
      ctx.save();
      ctx.scale(pointDirection, 1);
      ctx.beginPath();
      ctx.moveTo(-enemy.radius, -enemy.radius * .55);
      ctx.lineTo(enemy.radius * .55, -enemy.radius * .55);
      ctx.lineTo(enemy.radius, enemy.radius);
      ctx.lineTo(-enemy.radius * .55, enemy.radius);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (enemy.square) {
      const red = Math.round(17 + (225 - 17) * enemy.aggro);
      const green = Math.round(130 + (42 - 130) * enemy.aggro);
      const blue = Math.round(59 + (42 - 59) * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      const side = enemy.radius * 1.55;
      ctx.strokeRect(-side / 2, -side / 2, side, side);
      return;
    }
    if (enemy.rocky) {
      const red = Math.round(92 + 128 * enemy.aggro);
      const green = Math.round(86 - 34 * enemy.aggro);
      const blue = Math.round(75 - 29 * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 8;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * Math.PI * 2;
        const radius = enemy.radius * (.87 + .13 * Math.sin(i * 4.7 + enemy.rockSeed));
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      return;
    }
    const red = Math.round(17 + (225 - 17) * enemy.aggro);
    const green = Math.round(130 + (42 - 130) * enemy.aggro);
    const blue = Math.round(59 + (42 - 59) * enemy.aggro);
    ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : `rgb(${red}, ${green}, ${blue})`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawEnemies() {
    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.inShop) return;
      const x = enemy.x - cameraX;
      const y = enemyWorldY(enemy);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(enemy.rotation);
      drawEnemyBody(enemy);
      ctx.restore();
      const swimming = (enemy.square || enemy.rhombus) &&
        enemy.x >= kingdomMoatStartX && enemy.x <= kingdomMoatEndX;
      if (swimming) {
        ctx.save();
        ctx.fillStyle = 'rgba(35, 126, 174, .62)';
        ctx.fillRect(x - enemy.radius - 8, groundY + 4,
          enemy.radius * 2 + 16, Math.max(0, y + enemy.radius - groundY));
        ctx.strokeStyle = '#91d9f2';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - enemy.radius - 8, groundY + 5);
        ctx.quadraticCurveTo(x, groundY - 1, x + enemy.radius + 8, groundY + 5);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  function drawDropsAndSplats() {
    splats.forEach(particle => {
      if (particle.insideShop) return;
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = '#df3030';
      ctx.beginPath();
      ctx.arc(particle.x - cameraX, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    shapeDrops.forEach(drop => {
      if (drop.insideShop) return;
      ctx.save();
      ctx.translate(drop.x - cameraX, drop.y);
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.fillRect(-2, -9, 18, 18);
      ctx.strokeRect(-2, -9, 18, 18);
      ctx.beginPath();
      ctx.arc(-9, -2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -16);
      ctx.lineTo(20, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    damagePopups.forEach(popup => {
      if (popup.insideShop) return;
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = 'italic 900 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`-${popup.damage}`, popup.x - cameraX, popup.y);
      ctx.fillText(`-${popup.damage}`, popup.x - cameraX, popup.y);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  function drawInteriorEffects() {
    splats.forEach(particle => {
      if (!particle.insideShop) return;
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = '#df3030';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    shapeDrops.forEach(drop => {
      if (!drop.insideShop) return;
      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.fillRect(-2, -9, 18, 18);
      ctx.strokeRect(-2, -9, 18, 18);
      ctx.beginPath();
      ctx.arc(-9, -2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -16);
      ctx.lineTo(20, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    damagePopups.forEach(popup => {
      if (!popup.insideShop) return;
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = 'italic 900 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`-${popup.damage}`, popup.x, popup.y);
      ctx.fillText(`-${popup.damage}`, popup.x, popup.y);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  function drawDoorBoards(centerX, centerY, boardWidth) {
    const offsets = [-42, 0, 42];
    offsets.forEach((offset, index) => {
      ctx.save();
      ctx.translate(centerX, centerY + offset);
      ctx.rotate(index % 2 ? -.08 : .08);
      ctx.fillStyle = '#9b6438';
      ctx.strokeStyle = '#2b180e';
      ctx.lineWidth = 4;
      ctx.fillRect(-boardWidth / 2, -12, boardWidth, 24);
      ctx.strokeRect(-boardWidth / 2, -12, boardWidth, 24);
      ctx.fillStyle = '#b9b9b9';
      ctx.beginPath();
      ctx.arc(-boardWidth * .35, 0, 3, 0, Math.PI * 2);
      ctx.arc(boardWidth * .35, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawShop() {
    const x = shopX - cameraX;
    const baseY = groundAt(shopX);
    ctx.fillStyle = '#efcf91';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 6;
    ctx.fillRect(x, baseY - 210, 300, 210);
    ctx.strokeRect(x, baseY - 210, 300, 210);
    ctx.fillStyle = '#9a4e2f';
    ctx.beginPath();
    ctx.moveTo(x - 24, baseY - 205);
    ctx.lineTo(x + 150, baseY - 310);
    ctx.lineTo(x + 324, baseY - 205);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Exterior door, frame, handle, and front step.
    ctx.fillStyle = '#24150f';
    ctx.fillRect(x + 28, baseY - 146, 92, 146);
    if (!shopDoorBroken) {
      ctx.fillStyle = '#744326';
      ctx.fillRect(x + 38, baseY - 136, 72, 136);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 5;
      ctx.strokeRect(x + 38, baseY - 136, 72, 136);
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(x + 96, baseY - 67, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Jagged scraps left in the frame after a circle smashes through.
      ctx.fillStyle = '#744326';
      ctx.beginPath();
      ctx.moveTo(x + 38, baseY);
      ctx.lineTo(x + 38, baseY - 136);
      ctx.lineTo(x + 54, baseY - 110);
      ctx.lineTo(x + 47, baseY - 72);
      ctx.lineTo(x + 62, baseY - 43);
      ctx.lineTo(x + 55, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 110, baseY);
      ctx.lineTo(x + 110, baseY - 136);
      ctx.lineTo(x + 94, baseY - 104);
      ctx.lineTo(x + 104, baseY - 70);
      ctx.lineTo(x + 91, baseY - 29);
      ctx.lineTo(x + 96, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (shopDoorBoarded) drawDoorBoards(x + 74, baseY - 68, 96);
    ctx.fillStyle = '#3a2518';
    ctx.fillRect(x + 20, baseY, 108, 14);
    ctx.fillStyle = '#78c9f4';
    ctx.fillRect(x + 164, baseY - 150, 91, 94);
    ctx.strokeRect(x + 164, baseY - 150, 91, 94);
    // Stickman shopkeeper inside the window until the raid begins.
    if (!shopkeeperFleeing && !shopkeeperReturning && !shopkeeperHidden) {
      ctx.beginPath();
      ctx.arc(x + 210, baseY - 122, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x + 210, baseY - 110);
      ctx.lineTo(x + 210, baseY - 76);
      ctx.moveTo(x + 210, baseY - 99);
      ctx.lineTo(x + 192, baseY - 85);
      ctx.moveTo(x + 210, baseY - 99);
      ctx.lineTo(x + 228, baseY - 85);
      ctx.stroke();
    }

    ctx.textAlign = 'start';
    if (playerNear(shopX + 74, baseY - man.height / 2, 135)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  ENTER', x + 74, baseY - 152);
      ctx.fillText('E  ENTER', x + 74, baseY - 152);
      ctx.textAlign = 'start';
    }
  }

  function drawInteriorShell(wallColor, floorColor, roofColor) {
    const room = interiorBounds();
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, cameraY, width, height);

    ctx.fillStyle = wallColor;
    ctx.fillRect(room.left, room.wallTop, room.width, groundY - room.wallTop);
    ctx.fillStyle = floorColor;
    ctx.fillRect(room.left, groundY, room.width, height - groundY - cameraY);

    // A visible cutaway roof caps the smaller interior.
    ctx.fillStyle = roofColor;
    ctx.strokeStyle = '#17120f';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(room.left - 15, room.wallTop + 15);
    ctx.lineTo(room.left + room.width / 2, room.roofPeak);
    ctx.lineTo(room.right + 15, room.wallTop + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#201813';
    ctx.lineWidth = 9;
    ctx.strokeRect(room.left, room.wallTop, room.width, groundY - room.wallTop);
    ctx.beginPath();
    ctx.moveTo(room.left, groundY);
    ctx.lineTo(room.right, groundY);
    ctx.stroke();
    return room;
  }

  function drawShopInterior() {
    const room = drawInteriorShell('#d9b978', '#6f4529', '#5d3825');

    // Interior exit door. It can only be smashed while the player is in here.
    ctx.fillStyle = '#24150f';
    ctx.fillRect(34, groundY - 154, 112, 154);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 5;
    if (!shopDoorBroken) {
      ctx.fillStyle = '#744326';
      ctx.fillRect(44, groundY - 144, 92, 144);
      ctx.strokeRect(44, groundY - 144, 92, 144);
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(120, groundY - 70, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#744326';
      ctx.beginPath();
      ctx.moveTo(44, groundY);
      ctx.lineTo(44, groundY - 144);
      ctx.lineTo(61, groundY - 112);
      ctx.lineTo(53, groundY - 71);
      ctx.lineTo(67, groundY - 32);
      ctx.lineTo(61, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(136, groundY);
      ctx.lineTo(136, groundY - 144);
      ctx.lineTo(119, groundY - 108);
      ctx.lineTo(128, groundY - 72);
      ctx.lineTo(114, groundY - 31);
      ctx.lineTo(120, groundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (shopDoorBoarded) drawDoorBoards(90, groundY - 72, 112);
    if (playerNear(90, groundY - man.height / 2, 120)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  EXIT', 90, groundY - 170);
      ctx.fillText('E  EXIT', 90, groundY - 170);
      ctx.textAlign = 'start';
    }
    if (!shopkeeperFleeing && !shopkeeperReturning && !shopkeeperHidden) {
      const keeperX = interiorPoint(.76);
      const keeperY = groundY - 66;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(keeperX, keeperY - 42, 16, 0, Math.PI * 2);
      ctx.moveTo(keeperX, keeperY - 26);
      ctx.lineTo(keeperX, keeperY + 28);
      ctx.moveTo(keeperX, keeperY - 12);
      ctx.lineTo(keeperX - 28, keeperY + 10);
      ctx.moveTo(keeperX, keeperY - 12);
      ctx.lineTo(keeperX + 28, keeperY + 10);
      ctx.moveTo(keeperX, keeperY + 28);
      ctx.lineTo(keeperX - 22, keeperY + 62);
      ctx.moveTo(keeperX, keeperY + 28);
      ctx.lineTo(keeperX + 22, keeperY + 62);
      ctx.stroke();

      if (playerNear(keeperX, groundY - man.height / 2, 145)) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 20px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('BLACKSMITH', keeperX, keeperY - 106);
        ctx.fillText('BLACKSMITH', keeperX, keeperY - 106);
        ctx.font = '900 25px Arial';
        ctx.strokeText('E  INTERACT', keeperX, keeperY - 78);
        ctx.fillText('E  INTERACT', keeperX, keeperY - 78);
        ctx.textAlign = 'start';
      }
    }

    if (shopDoorBroken) {
      const hatchX = interiorPoint(.9);
      const hatchOpen = shopkeeperFleeing || shopkeeperReturning;
      ctx.fillStyle = hatchOpen ? '#080808' : '#3b281c';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(hatchX, groundY - 3, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (!hatchOpen) {
        ctx.strokeStyle = '#8b5a34';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(hatchX - 39, groundY - 7);
        ctx.lineTo(hatchX + 39, groundY - 7);
        ctx.moveTo(hatchX, groundY - 13);
        ctx.lineTo(hatchX, groundY + 2);
        ctx.stroke();
      }
    }

    if (shopkeeperFleeing || shopkeeperReturning) {
      const keeperX = shopkeeperFleeX;
      const stride = Math.sin(performance.now() * .025) * 18;
      const keeperY = shopkeeperFleeY;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(keeperX, groundY - 108 + keeperY, 16, 0, Math.PI * 2);
      ctx.moveTo(keeperX, groundY - 92 + keeperY);
      ctx.lineTo(keeperX + 5, groundY - 38 + keeperY);
      ctx.moveTo(keeperX + 1, groundY - 78 + keeperY);
      ctx.lineTo(keeperX + 25, groundY - 62 - stride * .25 + keeperY);
      ctx.moveTo(keeperX + 1, groundY - 78 + keeperY);
      ctx.lineTo(keeperX - 20, groundY - 58 + stride * .25 + keeperY);
      ctx.moveTo(keeperX + 5, groundY - 38 + keeperY);
      ctx.lineTo(keeperX + 22 + stride, groundY + keeperY);
      ctx.moveTo(keeperX + 5, groundY - 38 + keeperY);
      ctx.lineTo(keeperX - 16 - stride, groundY + keeperY);
      ctx.stroke();
    }

  }

  function drawBarracksInterior() {
    const room = drawInteriorShell('#756b5a', '#3d352c', '#3f382f');
    ctx.fillStyle = '#171412';
    ctx.fillRect(34, groundY - 154, 112, 154);
    ctx.strokeStyle = '#090807';
    ctx.lineWidth = 6;
    ctx.strokeRect(34, groundY - 154, 112, 154);

    ctx.strokeStyle = '#332a22';
    ctx.lineWidth = 10;
    for (let x = interiorPoint(.38); x < interiorPoint(.62); x += 72) {
      ctx.beginPath();
      ctx.moveTo(x, groundY - 225);
      ctx.lineTo(x, groundY - 45);
      ctx.moveTo(x - 28, groundY - 196);
      ctx.lineTo(x + 28, groundY - 196);
      ctx.moveTo(x - 28, groundY - 82);
      ctx.lineTo(x + 28, groundY - 82);
      ctx.stroke();
    }

    const chestX = interiorPoint(.72);
    ctx.fillStyle = bowChestOpened ? '#4a3020' : '#80532c';
    ctx.strokeStyle = '#19110c';
    ctx.lineWidth = 7;
    ctx.fillRect(chestX - 68, groundY - 78, 136, 78);
    ctx.strokeRect(chestX - 68, groundY - 78, 136, 78);
    if (!bowChestOpened) {
      ctx.beginPath();
      ctx.arc(chestX, groundY - 78, 68, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d8b34e';
      ctx.fillRect(chestX - 9, groundY - 53, 18, 25);
    }

    const nearExit = playerNear(90, groundY - man.height / 2, 120);
    const nearChest = !bowChestOpened && playerNear(chestX, groundY - man.height / 2, 125);
    if (nearExit || nearChest) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      const labelX = nearChest ? chestX : 90;
      const labelY = nearChest ? groundY - 145 : groundY - 175;
      const label = nearChest ? 'E  OPEN CHEST' : 'E  EXIT';
      ctx.strokeText(label, labelX, labelY);
      ctx.fillText(label, labelX, labelY);
      ctx.textAlign = 'start';
    }
  }

  function drawTownHouseInterior() {
    const building = townBuildings[townHouseIndex] || townBuildings[0];
    const room = drawInteriorShell(building.color, '#3d342c', building.roof);

    // The same doorway is used to return to the street.
    ctx.fillStyle = '#171412';
    ctx.fillRect(34, groundY - 154, 112, 154);
    ctx.strokeStyle = '#090807';
    ctx.lineWidth = 6;
    ctx.strokeRect(34, groundY - 154, 112, 154);
    ctx.fillStyle = '#4c4035';
    ctx.fillRect(45, groundY - 143, 90, 143);
    ctx.strokeRect(45, groundY - 143, 90, 143);
    ctx.fillStyle = '#afa16f';
    ctx.beginPath();
    ctx.arc(119, groundY - 69, 6, 0, Math.PI * 2);
    ctx.fill();

    // Boarded window and old wall damage make each room feel abandoned.
    const windowX = interiorPoint(.73);
    const windowY = Math.max(room.wallTop + 100, groundY - 205);
    ctx.fillStyle = '#111719';
    ctx.fillRect(windowX - 70, windowY - 58, 140, 116);
    ctx.strokeStyle = '#262321';
    ctx.lineWidth = 7;
    ctx.strokeRect(windowX - 70, windowY - 58, 140, 116);
    ctx.save();
    ctx.translate(windowX, windowY);
    ctx.rotate(.24);
    ctx.fillStyle = '#765137';
    ctx.fillRect(-91, -9, 182, 18);
    ctx.rotate(-.48);
    ctx.fillRect(-91, -9, 182, 18);
    ctx.restore();

    ctx.strokeStyle = '#3a332e';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(interiorPoint(.38), room.wallTop);
    ctx.lineTo(interiorPoint(.4), room.wallTop + 73);
    ctx.lineTo(interiorPoint(.36), room.wallTop + 122);
    ctx.lineTo(interiorPoint(.42), room.wallTop + 181);
    ctx.lineTo(interiorPoint(.39), Math.min(groundY, room.wallTop + 239));
    ctx.stroke();
    ctx.fillStyle = '#29231f';
    for (let i = 0; i < 6; i++) {
      const rubbleX = interiorPoint(.43) + i * 26 + (townHouseIndex % 2) * 10;
      const rubbleSize = 8 + (i * 7 + townHouseIndex * 3) % 17;
      ctx.fillRect(rubbleX, groundY - rubbleSize, rubbleSize + 10, rubbleSize);
    }

    if (townHouseIndex === cloakHouseIndex) {
      const chestX = cloakChestX();
      const chestY = groundY - 58;
      ctx.strokeStyle = '#1b120a';
      ctx.lineWidth = 6;
      ctx.fillStyle = '#8a5226';
      ctx.fillRect(chestX - 61, chestY, 122, 58);
      ctx.strokeRect(chestX - 61, chestY, 122, 58);
      ctx.fillStyle = '#d2a13d';
      ctx.fillRect(chestX - 8, chestY, 16, 58);
      ctx.strokeRect(chestX - 8, chestY, 16, 58);
      if (cloakChestOpened) {
        ctx.fillStyle = '#6b3d20';
        ctx.save();
        ctx.translate(chestX - 58, chestY - 2);
        ctx.rotate(-.42);
        ctx.fillRect(0, -37, 122, 37);
        ctx.strokeRect(0, -37, 122, 37);
        ctx.restore();
      } else {
        ctx.fillStyle = '#a8662e';
        ctx.beginPath();
        ctx.moveTo(chestX - 61, chestY);
        ctx.quadraticCurveTo(chestX, chestY - 55, chestX + 61, chestY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d2a13d';
        ctx.fillRect(chestX - 8, chestY - 31, 16, 34);
        ctx.strokeRect(chestX - 8, chestY - 31, 16, 34);
        if (playerNear(chestX, groundY - man.height / 2, 125)) {
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 5;
          ctx.font = '900 24px Arial';
          ctx.textAlign = 'center';
          ctx.strokeText('E  OPEN', chestX, chestY - 73);
          ctx.fillText('E  OPEN', chestX, chestY - 73);
          ctx.textAlign = 'start';
        }
      }
    }

    if (cloakPickupTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, cloakPickupTimer * 2);
      ctx.textAlign = 'center';
      ctx.font = `1000 ${Math.min(48, room.width * .065)}px Arial`;
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#2d1a0e';
      ctx.fillStyle = '#d39a5d';
      const messageX = room.left + room.width / 2;
      const messageY = room.wallTop + 75;
      ctx.strokeText('CLOAK FOUND', messageX, messageY);
      ctx.fillText('CLOAK FOUND', messageX, messageY);
      ctx.font = '900 20px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeText('PRESS Q TO EQUIP IT', messageX, messageY + 42);
      ctx.fillText('PRESS Q TO EQUIP IT', messageX, messageY + 42);
      ctx.restore();
    }

    if (playerNear(90, groundY - man.height / 2, 120)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  EXIT', 90, groundY - 172);
      ctx.fillText('E  EXIT', 90, groundY - 172);
      ctx.textAlign = 'start';
    }
  }

  function drawInteriorEnemies() {
    enemies.forEach(enemy => {
      if (!enemy.alive || !enemy.inShop) return;
      ctx.save();
      ctx.translate(enemy.shopX, groundY - enemy.radius);
      ctx.rotate(enemy.rotation);
      drawEnemyBody(enemy);
      ctx.restore();
    });
  }

  function drawDoorDebris() {
    doorDebris.forEach(piece => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, piece.life * 2);
      ctx.translate(piece.x - cameraX, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = '#744326';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.fillRect(-8, -15, 16, 30);
      ctx.strokeRect(-8, -15, 16, 30);
      ctx.restore();
    });
  }

  function drawMineEntrance() {
    const x = mineX - cameraX;
    if (x < -220 || x > width + 220) return;
    const floor = groundAt(mineX);
    // Side-profile rock face: the tunnel runs rightward into the mountain.
    ctx.fillStyle = '#4e493d';
    ctx.strokeStyle = '#302d27';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 105, floor + 8);
    ctx.lineTo(x - 91, floor - 124);
    ctx.lineTo(x - 36, floor - 206);
    ctx.lineTo(x + 72, floor - 235);
    ctx.lineTo(x + 174, floor - 176);
    ctx.lineTo(x + 205, floor + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // The offset trapezoid and receding beams make the opening face left, not outward.
    ctx.fillStyle = '#15120f';
    ctx.strokeStyle = '#3a2a1d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x - 88, floor);
    ctx.lineTo(x - 88, floor - 112);
    ctx.lineTo(x + 112, floor - 157);
    ctx.lineTo(x + 144, floor - 122);
    ctx.lineTo(x + 144, floor);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#785237';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 72, floor);
    ctx.lineTo(x - 72, floor - 120);
    ctx.moveTo(x - 72, floor - 120);
    ctx.lineTo(x + 132, floor - 120);
    ctx.stroke();

    // Rails disappear into the tunnel to reinforce the sideways direction.
    ctx.strokeStyle = '#a39c90';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 96, floor - 5);
    ctx.lineTo(x + 139, floor - 33);
    ctx.moveTo(x - 93, floor - 19);
    ctx.lineTo(x + 139, floor - 48);
    ctx.stroke();
    if (playerNear(mineX, floor - man.height / 2, 145)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  ENTER MINE', x + 40, floor - 260);
      ctx.fillText('E  ENTER MINE', x + 40, floor - 260);
    }
    ctx.textAlign = 'start';
  }

  function drawMineInterior() {
    ctx.fillStyle = '#17130f';
    ctx.fillRect(0, cameraY, width, height);

    // Four long horizontal tunnel levels.
    for (let level = 0; level < mineLevelCount; level++) {
      ctx.fillStyle = '#090807';
      ctx.beginPath();
      for (let sx = 0; sx <= width; sx += 24) {
        const wx = cameraX + sx;
        const ceiling = mineFloorAt(wx, level) - 275 - Math.sin(wx / 180 + level) * 22;
        if (sx === 0) ctx.moveTo(sx, ceiling);
        else ctx.lineTo(sx, ceiling);
      }
      for (let sx = width; sx >= 0; sx -= 24) {
        ctx.lineTo(sx, mineFloorAt(cameraX + sx, level));
      }
      ctx.closePath();
      ctx.fill();

      // Rails follow every level, making each branch readable and traversable.
      ctx.strokeStyle = '#938d82';
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let sx = 0; sx <= width; sx += 18) {
        const y = mineFloorAt(cameraX + sx, level) - 7;
        if (sx === 0) ctx.moveTo(sx, y);
        else ctx.lineTo(sx, y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#815a3a';
      ctx.lineWidth = 12;
      for (let wx = Math.floor(cameraX / 410) * 410; wx < cameraX + width + 410; wx += 410) {
        const x = wx - cameraX;
        const floor = mineFloorAt(wx, level);
        const ceiling = floor - 250;
        ctx.beginPath();
        ctx.moveTo(x - 52, floor);
        ctx.lineTo(x - 52, ceiling);
        ctx.lineTo(x + 52, ceiling);
        ctx.lineTo(x + 52, floor);
        ctx.stroke();
      }
    }

    // Vertical shafts physically join the levels. W climbs up and S climbs down.
    mineShafts.forEach(shaft => {
      const x = shaft.x - cameraX;
      if (x < -100 || x > width + 100) return;
      const topY = mineFloorAt(shaft.x, shaft.top) - 235;
      const bottomY = mineFloorAt(shaft.x, shaft.bottom);
      ctx.fillStyle = '#080706';
      ctx.fillRect(x - 54, topY, 108, bottomY - topY);
      ctx.strokeStyle = '#6f4b30';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(x - 30, topY);
      ctx.lineTo(x - 30, bottomY);
      ctx.moveTo(x + 30, topY);
      ctx.lineTo(x + 30, bottomY);
      for (let y = topY + 18; y < bottomY; y += 34) {
        ctx.moveTo(x - 30, y);
        ctx.lineTo(x + 30, y);
      }
      ctx.stroke();
      if (!mineClimb &&
        playerNear(shaft.x, mineFloorAt(shaft.x, mineLevel) - man.height / 2, 90) &&
        (mineLevel === shaft.top || mineLevel === shaft.bottom)) {
        const promptY = mineFloorAt(shaft.x, mineLevel) - 170;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 22px Arial';
        ctx.textAlign = 'center';
        const label = mineLevel === shaft.top ? 'S  CLIMB DOWN' : 'W  CLIMB UP';
        ctx.strokeText(label, x, promptY);
        ctx.fillText(label, x, promptY);
      }
    });
    ctx.textAlign = 'start';

    // Additional diagonal dead ends and ore chambers make the network less uniform.
    const chambers = [
      [1320, 0, -260], [2310, 2, 280], [3160, 1, -300], [5080, 3, 300],
      [5940, 1, -250], [6920, 2, 280], [7780, 0, -290], [8530, 3, -230]
    ];
    chambers.forEach(([wx, level, dx]) => {
      const x = wx - cameraX;
      const y = mineFloorAt(wx, level) - 125;
      ctx.strokeStyle = '#090807';
      ctx.lineWidth = 105;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y - 150);
      ctx.stroke();
      ctx.strokeStyle = '#6b513c';
      ctx.lineWidth = 7;
      ctx.stroke();
    });

    // Exit gate at the mine mouth.
    const exitX = 105 - cameraX;
    const exitFloor = mineFloorAt(105, 0);
    ctx.fillStyle = '#080706';
    ctx.strokeStyle = '#785237';
    ctx.lineWidth = 10;
    ctx.fillRect(exitX - 58, exitFloor - 145, 116, 145);
    ctx.strokeRect(exitX - 58, exitFloor - 145, 116, 145);
    if (mineLevel === 0 && playerNear(105, exitFloor - man.height / 2, 125)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  EXIT', exitX, exitFloor - 165);
      ctx.fillText('E  EXIT', exitX, exitFloor - 165);
      ctx.textAlign = 'start';
    }
  }

  function drawMineEnemies() {
    mineEnemies.forEach(enemy => {
      if (!enemy.alive) return;
      const x = enemy.x - cameraX;
      const y = mineFloorAt(enemy.x, enemy.level) - enemy.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(enemy.rotation);
      const red = Math.round(17 + 208 * enemy.aggro);
      const green = Math.round(130 - 88 * enemy.aggro);
      const blue = Math.round(59 - 17 * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#fff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(-enemy.rotation);
      ctx.fillStyle = '#e2a72c';
      ctx.strokeStyle = '#3b2914';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -enemy.radius + 5, 23, Math.PI, 0);
      ctx.lineTo(28, -enemy.radius + 7);
      ctx.lineTo(-28, -enemy.radius + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff3a5';
      ctx.beginPath();
      ctx.arc(0, -enemy.radius - 10, 6, 0, Math.PI * 2);
      ctx.fill();

      // Calm miners repeatedly swing a pickaxe; aggroed miners hold it ready.
      const mining = enemy.aggro < .15;
      const miningPhase = performance.now() * .007 + enemy.x * .018;
      const pickaxeAngle = mining ? -.65 + (Math.sin(miningPhase) + 1) * .7 : -.25;
      ctx.save();
      ctx.translate(18, -2);
      ctx.rotate(pickaxeAngle);
      ctx.strokeStyle = '#87552f';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(59, 0);
      ctx.stroke();
      ctx.strokeStyle = '#b8c0c2';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(50, -17);
      ctx.quadraticCurveTo(62, 0, 50, 18);
      ctx.stroke();
      ctx.restore();
      if (mining && pickaxeAngle > .62) {
        ctx.strokeStyle = '#ffd56a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(69, 27); ctx.lineTo(80, 32);
        ctx.moveTo(67, 31); ctx.lineTo(73, 43);
        ctx.moveTo(72, 24); ctx.lineTo(84, 20);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawMineEffects() {
    mineDrops.forEach(drop => {
      ctx.save();
      ctx.translate(drop.x - cameraX, drop.y);
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    mineDamagePopups.forEach(popup => {
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = 'italic 900 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`-${popup.damage}`, popup.x - cameraX, popup.y);
      ctx.fillText(`-${popup.damage}`, popup.x - cameraX, popup.y);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  function mapNoise(value) {
    const noise = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
    return noise - Math.floor(noise);
  }

  function drawGroundDetails(groundWidth) {
    // Sparse clusters use irregular offsets and sway independently in the wind.
    const grassSpacing = 310;
    const firstGrassCell = Math.floor((cameraX - grassSpacing) / grassSpacing) * grassSpacing;
    const windTime = performance.now() * .0017;
    for (let cellX = firstGrassCell; cellX < cameraX + groundWidth + grassSpacing; cellX += grassSpacing) {
      const worldX = cellX + 35 + mapNoise(cellX * .019) * 215;
      if (worldX >= townStartX - 40) continue;
      const x = worldX - cameraX;
      const y = groundAt(worldX);
      const noise = mapNoise(worldX * .017);
      const sway = Math.sin(windTime + worldX * .014) * (4 + noise * 3);
      ctx.strokeStyle = noise > .5 ? '#2f7738' : '#3f873e';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 1);
      ctx.quadraticCurveTo(x - 8, y - 8, x - 10 + sway, y - 17 - noise * 8);
      ctx.moveTo(x, y + 1);
      ctx.quadraticCurveTo(x, y - 10, x + sway, y - 23 - noise * 9);
      ctx.moveTo(x + 5, y + 1);
      ctx.quadraticCurveTo(x + 8, y - 7, x + 11 + sway, y - 14 - noise * 7);
      ctx.stroke();
    }

    // Subtle marks remain inside the existing ground shape.
    const firstMark = Math.floor(cameraX / 105) * 105;
    for (let worldX = firstMark; worldX < cameraX + groundWidth + 105; worldX += 105) {
      const x = worldX - cameraX;
      const y = groundAt(worldX);
      const noise = mapNoise(worldX * .017);
      ctx.strokeStyle = noise > .5 ? 'rgba(37, 111, 48, .48)' : 'rgba(95, 145, 67, .5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 12, y + 24 + noise * 18);
      ctx.lineTo(x + 12 + noise * 14, y + 18 + noise * 18);
      ctx.stroke();
      ctx.fillStyle = 'rgba(39, 103, 44, .24)';
      ctx.beginPath();
      ctx.ellipse(x + 28, y + 55 + noise * 24, 9 + noise * 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMountain() {
    const left = mountainStartX - cameraX;
    const right = mountainEndX - cameraX;
    if (left > width + 300 || right < -300) return;
    ctx.fillStyle = '#555b59';
    ctx.strokeStyle = '#292e2d';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(left, groundY);
    for (let worldX = mountainStartX; worldX <= mountainEndX; worldX += 45) {
      ctx.lineTo(worldX - cameraX, groundAt(worldX));
    }
    ctx.lineTo(right, groundY);
    ctx.lineTo(right, height + Math.abs(cameraY) + 1900);
    ctx.lineTo(left, height + Math.abs(cameraY) + 1900);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fine cracks add texture directly to the existing mountain face.
    ctx.strokeStyle = 'rgba(39, 45, 44, .46)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      const worldX = mountainStartX + 130 + i * 205;
      const x = worldX - cameraX;
      const y = groundAt(worldX) + 40 + mapNoise(i * 3.7) * 130;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y + 24);
      ctx.lineTo(x + 1, y + 45);
      ctx.lineTo(x + 16, y + 68);
      ctx.stroke();
    }

    // Broad rock bands emphasize the mountain's height while scrolling vertically.
    ctx.strokeStyle = '#3e4543';
    ctx.lineWidth = 7;
    for (let band = 1; band <= 6; band++) {
      const bandY = groundY - band * 220;
      const halfSpan = mountainWidth * (.48 - band * .055);
      ctx.beginPath();
      ctx.moveTo(mountainStartX + mountainWidth / 2 - halfSpan - cameraX, bandY + 35);
      ctx.quadraticCurveTo(
        mountainStartX + mountainWidth / 2 - cameraX, bandY - 45,
        mountainStartX + mountainWidth / 2 + halfSpan - cameraX, bandY + 25
      );
      ctx.stroke();
    }

    const entranceX = mountainEntranceX - cameraX;
    const entranceY = groundAt(mountainEntranceX);
    ctx.fillStyle = '#080b0b';
    ctx.beginPath();
    ctx.moveTo(entranceX - 62, entranceY);
    ctx.lineTo(entranceX - 62, entranceY - 104);
    ctx.arc(entranceX, entranceY - 104, 62, Math.PI, 0);
    ctx.lineTo(entranceX + 62, entranceY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#181b1a';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = '#8a633b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(entranceX - 70, entranceY);
    ctx.lineTo(entranceX - 70, entranceY - 113);
    ctx.moveTo(entranceX + 70, entranceY);
    ctx.lineTo(entranceX + 70, entranceY - 113);
    ctx.moveTo(entranceX - 78, entranceY - 116);
    ctx.lineTo(entranceX + 78, entranceY - 116);
    ctx.stroke();
    if (playerNear(mountainEntranceX, entranceY - man.height / 2, 150)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  ENTER', entranceX, entranceY - 165);
      ctx.fillText('E  ENTER', entranceX, entranceY - 165);
      ctx.textAlign = 'start';
    }

    // This wall ends the normal overworld path immediately after the mine entrance.
    const wallX = mountainMineWallX - cameraX;
    if (wallX > -180 && wallX < width + 180) {
      const wallBottom = groundAt(mountainMineWallX);
      const wallTop = Math.min(wallBottom - 760, cameraY - 180);
      const wallWidth = mountainWallHalfWidth * 2;
      ctx.fillStyle = '#626966';
      ctx.strokeStyle = '#272d2b';
      ctx.lineWidth = 10;
      ctx.fillRect(wallX - mountainWallHalfWidth, wallTop, wallWidth, wallBottom - wallTop);
      ctx.strokeRect(wallX - mountainWallHalfWidth, wallTop, wallWidth, wallBottom - wallTop);

      ctx.strokeStyle = '#3d4441';
      ctx.lineWidth = 5;
      for (let y = wallBottom - 48; y > wallTop; y -= 58) {
        ctx.beginPath();
        ctx.moveTo(wallX - mountainWallHalfWidth, y);
        ctx.lineTo(wallX + mountainWallHalfWidth, y);
        ctx.stroke();
        const seamX = wallX + ((Math.floor((wallBottom - y) / 58) % 2) ? -18 : 22);
        ctx.beginPath();
        ctx.moveTo(seamX, y);
        ctx.lineTo(seamX, Math.max(wallTop, y - 58));
        ctx.stroke();
      }
      ctx.fillStyle = '#737b77';
      ctx.strokeStyle = '#272d2b';
      ctx.lineWidth = 7;
      ctx.fillRect(wallX - mountainWallHalfWidth - 10, wallTop, wallWidth + 20, 34);
      ctx.strokeRect(wallX - mountainWallHalfWidth - 10, wallTop, wallWidth + 20, 34);
    }
  }

  function drawQuadrilateralKingdom() {
    const left = kingdomStartX - cameraX;
    const right = kingdomEndX - cameraX;
    if (left > width + 350 || right < -350) return;

    ctx.fillStyle = '#58a84f';
    ctx.fillRect(left, groundY, kingdomEndX - kingdomStartX,
      Math.max(height, cameraY + height + 2000 - groundY));
    ctx.strokeStyle = '#2f7d3b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(left, groundY);
    ctx.lineTo(right, groundY);
    ctx.stroke();

    // A deep moat separates the mountain exit from the kingdom's castle wall.
    const moatLeft = kingdomMoatStartX - cameraX;
    const moatRight = kingdomMoatEndX - cameraX;
    const moatWidth = moatRight - moatLeft;
    ctx.fillStyle = '#1f6f9f';
    ctx.fillRect(moatLeft, groundY + 2, moatWidth, kingdomMoatDepth + 95);
    ctx.fillStyle = '#318fc1';
    ctx.fillRect(moatLeft, groundY + 2, moatWidth, 28);
    ctx.strokeStyle = '#91d9f2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let x = moatLeft; x <= moatRight; x += 24) {
      const y = groundY + 9 + Math.sin((x + performance.now() * .09) / 21) * 3;
      if (x === moatLeft) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#315b43';
    ctx.beginPath();
    ctx.moveTo(moatLeft - 30, groundY);
    ctx.lineTo(moatLeft + 34, groundY + kingdomMoatDepth + 30);
    ctx.lineTo(moatLeft - 30, groundY + kingdomMoatDepth + 30);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(moatRight + 30, groundY);
    ctx.lineTo(moatRight - 34, groundY + kingdomMoatDepth + 30);
    ctx.lineTo(moatRight + 30, groundY + kingdomMoatDepth + 30);
    ctx.closePath();
    ctx.fill();

    // The mine emerges through a rectangular exit in the mountain's far side.
    ctx.fillStyle = '#555b59';
    ctx.strokeStyle = '#292e2d';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(left - 620, groundY);
    ctx.lineTo(left - 620, groundY - 920);
    ctx.lineTo(left + 120, groundY - 390);
    ctx.lineTo(left + 185, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const exitX = left + 75;
    ctx.fillStyle = '#070b0a';
    ctx.strokeStyle = '#1d2321';
    ctx.lineWidth = 8;
    ctx.fillRect(exitX - 62, groundY - 160, 124, 160);
    ctx.strokeRect(exitX - 62, groundY - 160, 124, 160);
    ctx.strokeStyle = '#8a633b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(exitX - 70, groundY);
    ctx.lineTo(exitX - 70, groundY - 170);
    ctx.moveTo(exitX + 70, groundY);
    ctx.lineTo(exitX + 70, groundY - 170);
    ctx.moveTo(exitX - 78, groundY - 174);
    ctx.lineTo(exitX + 78, groundY - 174);
    ctx.stroke();

    // Castle wall and its drawbridge gate.
    const wallX = kingdomCastleWallX - cameraX;
    const wallTop = groundY - 520;
    const wallRight = wallX + 340;
    ctx.fillStyle = '#747a76';
    ctx.strokeStyle = '#282e2c';
    ctx.lineWidth = 9;
    ctx.fillRect(wallX - 76, wallTop, wallRight - wallX + 76, 520);
    ctx.strokeRect(wallX - 76, wallTop, wallRight - wallX + 76, 520);

    ctx.fillStyle = '#858c87';
    for (let x = wallX - 88; x < wallRight + 16; x += 92) {
      ctx.fillRect(x, wallTop - 54, 58, 58);
      ctx.strokeRect(x, wallTop - 54, 58, 58);
    }
    ctx.strokeStyle = 'rgba(42, 48, 46, .55)';
    ctx.lineWidth = 4;
    for (let y = wallTop + 52, row = 0; y < groundY; y += 56, row++) {
      ctx.beginPath();
      ctx.moveTo(wallX - 72, y);
      ctx.lineTo(wallRight - 4, y);
      ctx.stroke();
      for (let x = wallX - 72 + (row % 2 ? 48 : 0); x < wallRight; x += 96) {
        ctx.beginPath();
        ctx.moveTo(x, y - 55);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    const doorwayWidth = 154;
    const doorwayHeight = 238;
    ctx.fillStyle = '#090d0c';
    ctx.fillRect(wallX - doorwayWidth / 2, groundY - doorwayHeight,
      doorwayWidth, doorwayHeight);
    ctx.strokeStyle = '#242a28';
    ctx.lineWidth = 9;
    ctx.strokeRect(wallX - doorwayWidth / 2, groundY - doorwayHeight,
      doorwayWidth, doorwayHeight);

    const bridgeLength = kingdomCastleWallX - kingdomMoatStartX + 18;
    ctx.save();
    const breakJolt = drawbridgeBreakTime > 0 ? drawbridgeBreakTime / .9 : 0;
    ctx.translate(
      wallX + Math.sin(performance.now() * .11) * 10 * breakJolt,
      groundY - 4 + Math.cos(performance.now() * .14) * 7 * breakJolt
    );
    ctx.rotate(-Math.PI / 2 - drawbridgeLowering * Math.PI / 2 +
      Math.sin(performance.now() * .08) * .055 * breakJolt);
    ctx.fillStyle = '#754323';
    ctx.strokeStyle = '#2f1b10';
    ctx.lineWidth = 8;
    ctx.fillRect(0, -55, bridgeLength, 110);
    ctx.strokeRect(0, -55, bridgeLength, 110);
    ctx.strokeStyle = '#aa7140';
    ctx.lineWidth = 4;
    for (let x = 34; x < bridgeLength; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x, -51);
      ctx.lineTo(x, 51);
      ctx.stroke();
    }
    ctx.strokeStyle = '#313735';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(12, -45);
    ctx.lineTo(bridgeLength - 12, -45);
    ctx.moveTo(12, 45);
    ctx.lineTo(bridgeLength - 12, 45);
    ctx.stroke();

    const damageMarks = 5 - drawbridgeHealth;
    ctx.strokeStyle = '#21110b';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    for (let i = 0; i < damageMarks; i++) {
      const markX = 70 + i * 67;
      const markY = i % 2 ? 28 : -24;
      ctx.beginPath();
      ctx.moveTo(markX - 28, markY - 20);
      ctx.lineTo(markX - 7, markY - 4);
      ctx.lineTo(markX - 20, markY + 17);
      ctx.lineTo(markX + 20, markY + 31);
      ctx.stroke();
    }
    ctx.restore();

    drawbridgeDebris.forEach(piece => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, piece.life * 1.7);
      ctx.translate(piece.x - cameraX, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = '#754323';
      ctx.strokeStyle = '#2f1b10';
      ctx.lineWidth = 3;
      ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      ctx.strokeRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      ctx.restore();
    });

    const barracksScreenX = barracksX - cameraX;
    ctx.fillStyle = '#746b5c';
    ctx.strokeStyle = '#27231e';
    ctx.lineWidth = 8;
    ctx.fillRect(barracksScreenX - 210, groundY - 260, 430, 260);
    ctx.strokeRect(barracksScreenX - 210, groundY - 260, 430, 260);
    ctx.fillStyle = '#3f382f';
    ctx.beginPath();
    ctx.moveTo(barracksScreenX - 240, groundY - 260);
    ctx.lineTo(barracksScreenX, groundY - 390);
    ctx.lineTo(barracksScreenX + 250, groundY - 260);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1a1714';
    ctx.fillRect(barracksScreenX - 66, groundY - 168, 132, 168);
    ctx.strokeRect(barracksScreenX - 66, groundY - 168, 132, 168);
    if (!barracksWaveTriggered || barracksGarrisonQueue.length > 0) {
      ctx.strokeStyle = '#11823b';
      ctx.lineWidth = 6;
      ctx.strokeRect(barracksScreenX - 43, groundY - 72, 42, 42);
      ctx.save();
      ctx.translate(barracksScreenX + 30, groundY - 51);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-21, -21, 42, 42);
      ctx.restore();
    }
    ctx.strokeStyle = '#9d7443';
    ctx.lineWidth = 10;
    for (let x = -145; x <= 145; x += 72) {
      ctx.beginPath();
      ctx.moveTo(barracksScreenX + x, groundY - 238);
      ctx.lineTo(barracksScreenX + x, groundY - 188);
      ctx.stroke();
    }
    if (playerNear(barracksX, groundY - man.height / 2, 145)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 25px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  ENTER', barracksScreenX, groundY - 190);
      ctx.fillText('E  ENTER', barracksScreenX, groundY - 190);
      ctx.textAlign = 'start';
    }

  }

  function drawMountainMineInterior() {
    ctx.fillStyle = '#111615';
    ctx.fillRect(0, cameraY - 1200, width, height + 2400);
    const startX = Math.max(0, cameraX - 120);
    const endX = Math.min(mountainMineWidth, cameraX + width + 120);
    const tunnelEnd = Math.min(endX, bossRoomStartX);
    for (let level = 0; level < mountainMineLevelCount; level++) {
      if (tunnelEnd <= startX) break;
      ctx.fillStyle = level === mountainMineLevel ? '#35413e' : '#29312f';
      ctx.beginPath();
      for (let x = startX; x <= tunnelEnd; x += 28) {
        const floor = mountainMineFloorAt(x, level);
        const ceiling = floor - 285 - Math.sin(x / 240 + level) * 30;
        if (x === startX) ctx.moveTo(x - cameraX, ceiling);
        else ctx.lineTo(x - cameraX, ceiling);
      }
      for (let x = tunnelEnd; x >= startX; x -= 28) {
        ctx.lineTo(x - cameraX, mountainMineFloorAt(x, level));
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#171d1c';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(startX - cameraX, mountainMineFloorAt(startX, level));
      for (let x = startX + 28; x <= tunnelEnd; x += 28) {
        ctx.lineTo(x - cameraX, mountainMineFloorAt(x, level));
      }
      ctx.stroke();
    }

    // Timber supports through the tunnel.
    ctx.strokeStyle = '#795330';
    ctx.lineWidth = 12;
    for (let level = 0; level < mountainMineLevelCount; level++) {
      for (let x = 480; x < bossRoomStartX - 180; x += 620) {
        if (x < startX - 120 || x > endX + 120) continue;
        const floor = mountainMineFloorAt(x, level);
        const ceiling = floor - 285 - Math.sin(x / 240 + level) * 30;
        ctx.beginPath();
        ctx.moveTo(x - cameraX - 48, floor);
        ctx.lineTo(x - cameraX - 48, ceiling + 18);
        ctx.moveTo(x - cameraX + 48, floor);
        ctx.lineTo(x - cameraX + 48, ceiling + 18);
        ctx.moveTo(x - cameraX - 62, ceiling + 25);
        ctx.lineTo(x - cameraX + 62, ceiling + 25);
        ctx.stroke();
      }
    }

    // Ladder shafts connect the mine's three winding levels.
    mountainMineShafts.forEach(shaft => {
      if (shaft.x < startX - 100 || shaft.x > endX + 100) return;
      const topY = mountainMineFloorAt(shaft.x, shaft.top) - 55;
      const bottomY = mountainMineFloorAt(shaft.x, shaft.bottom);
      ctx.fillStyle = '#1a201f';
      ctx.fillRect(shaft.x - cameraX - 58, topY, 116, bottomY - topY);
      ctx.strokeStyle = '#93683d';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(shaft.x - cameraX - 25, topY);
      ctx.lineTo(shaft.x - cameraX - 25, bottomY);
      ctx.moveTo(shaft.x - cameraX + 25, topY);
      ctx.lineTo(shaft.x - cameraX + 25, bottomY);
      for (let y = topY + 18; y < bottomY; y += 34) {
        ctx.moveTo(shaft.x - cameraX - 25, y);
        ctx.lineTo(shaft.x - cameraX + 25, y);
      }
      ctx.stroke();
      if (playerNear(shaft.x,
        mountainMineFloorAt(shaft.x, mountainMineLevel) - man.height / 2, 90) &&
        (mountainMineLevel === shaft.top || mountainMineLevel === shaft.bottom)) {
        const promptY = mountainMineFloorAt(shaft.x, mountainMineLevel) - 125;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 20px Arial';
        ctx.textAlign = 'center';
        const prompt = mountainMineLevel === shaft.top ? 'S  CLIMB DOWN' : 'W  CLIMB UP';
        ctx.strokeText(prompt, shaft.x - cameraX, promptY);
        ctx.fillText(prompt, shaft.x - cameraX, promptY);
        ctx.textAlign = 'start';
      }
    });

    // The tunnel opens into a tall underground boss chamber.
    const roomLeft = bossRoomStartX - cameraX;
    const activeRoomEnd = currentBossRoomEndX();
    const activeRoomHeight = currentBossRoomHeight();
    const roomRight = activeRoomEnd - cameraX;
    const roomFloor = mountainMineFloorAt(bossRoomStartX);
    ctx.fillStyle = '#303836';
    ctx.fillRect(roomLeft, roomFloor - activeRoomHeight, roomRight - roomLeft, activeRoomHeight);
    ctx.strokeStyle = '#707b77';
    ctx.lineWidth = 14;
    ctx.strokeRect(roomLeft, roomFloor - activeRoomHeight, roomRight - roomLeft, activeRoomHeight);
    ctx.strokeStyle = '#222927';
    ctx.lineWidth = 22;
    [bossRoomStartX + 145, activeRoomEnd - 145].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x - cameraX, roomFloor);
      ctx.lineTo(x - cameraX, roomFloor - activeRoomHeight + 85);
      ctx.stroke();
    });
    const gateScreenX = bossGateX - cameraX;
    ctx.strokeStyle = '#171a19';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(gateScreenX - bossGateHalfWidth, roomFloor);
    ctx.lineTo(gateScreenX - bossGateHalfWidth, roomFloor - activeRoomHeight + 18);
    ctx.moveTo(gateScreenX + bossGateHalfWidth, roomFloor);
    ctx.lineTo(gateScreenX + bossGateHalfWidth, roomFloor - activeRoomHeight + 18);
    ctx.stroke();
    if (bossGateClosed) {
      ctx.strokeStyle = '#68706d';
      ctx.lineWidth = 8;
      for (const offset of [-27, -9, 9, 27]) {
        ctx.beginPath();
        ctx.moveTo(gateScreenX + offset, roomFloor - activeRoomHeight + 30);
        ctx.lineTo(gateScreenX + offset, roomFloor);
        ctx.stroke();
      }
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(gateScreenX - 35, roomFloor - activeRoomHeight * .72);
      ctx.lineTo(gateScreenX + 35, roomFloor - activeRoomHeight * .72);
      ctx.moveTo(gateScreenX - 35, roomFloor - activeRoomHeight * .28);
      ctx.lineTo(gateScreenX + 35, roomFloor - activeRoomHeight * .28);
      ctx.stroke();
    }

    if (bossPhaseTwo) {
      const exitDoorX = bossExitDoorX - cameraX;
      const exitDoorTop = roomFloor - 184;
      ctx.lineWidth = 10;
      ctx.strokeStyle = bossFightComplete ? '#d6b34c' : '#555e5b';
      ctx.fillStyle = bossFightComplete ? '#070b0a' : '#242b29';
      ctx.fillRect(exitDoorX - 52, exitDoorTop, 104, 184);
      ctx.strokeRect(exitDoorX - 52, exitDoorTop, 104, 184);
      if (!bossFightComplete) {
        ctx.strokeStyle = '#69736f';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(exitDoorX - 42, exitDoorTop + 28);
        ctx.lineTo(exitDoorX + 42, roomFloor - 28);
        ctx.moveTo(exitDoorX + 42, exitDoorTop + 28);
        ctx.lineTo(exitDoorX - 42, roomFloor - 28);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#f0cf63';
        ctx.lineWidth = 4;
        ctx.strokeRect(exitDoorX - 38, exitDoorTop + 16, 76, 152);
        if (mountainMineLevel === 0 &&
          playerNear(bossExitDoorX, roomFloor - man.height / 2, 145)) {
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 5;
          ctx.font = '900 20px Arial';
          ctx.textAlign = 'center';
          ctx.strokeText('E  ENTER THE QUADRILATERAL KINGDOM', exitDoorX, exitDoorTop - 22);
          ctx.fillText('E  ENTER THE QUADRILATERAL KINGDOM', exitDoorX, exitDoorTop - 22);
          ctx.textAlign = 'start';
        }
      }
    }

    // The armor chest sits in a barred cage at the far-left end of the bottom tunnel.
    const cageFloor = mountainMineFloorAt(treasureGateX, 2);
    const cageTop = cageFloor - 230;
    const treasureLeft = treasureRoomLeftX - cameraX;
    const treasureGateScreenX = treasureGateX - cameraX;
    ctx.strokeStyle = '#626e69';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(treasureLeft, cageFloor);
    ctx.lineTo(treasureLeft, cageTop);
    ctx.lineTo(treasureGateScreenX, cageTop);
    ctx.stroke();
    ctx.lineWidth = 6;
    for (let x = treasureRoomLeftX + 38; x < treasureGateX - 34; x += 46) {
      ctx.beginPath();
      ctx.moveTo(x - cameraX, cageTop);
      ctx.lineTo(x - cameraX, mountainMineFloorAt(x, 2));
      ctx.stroke();
    }
    if (!treasureGateUnlocked) {
      ctx.strokeStyle = '#b4a67c';
      ctx.lineWidth = 8;
      for (const offset of [-22, -7, 8, 23]) {
        ctx.beginPath();
        ctx.moveTo(treasureGateScreenX + offset, cageTop);
        ctx.lineTo(treasureGateScreenX + offset, cageFloor);
        ctx.stroke();
      }
      ctx.fillStyle = '#d1b84f';
      ctx.strokeStyle = '#332b12';
      ctx.lineWidth = 4;
      ctx.fillRect(treasureGateScreenX - 15, cageFloor - 115, 30, 35);
      ctx.strokeRect(treasureGateScreenX - 15, cageFloor - 115, 30, 35);
    }
    const chestScreenX = treasureChestX - cameraX;
    const chestFloor = mountainMineFloorAt(treasureChestX, 2);
    ctx.fillStyle = '#80502a';
    ctx.strokeStyle = '#24160d';
    ctx.lineWidth = 6;
    ctx.fillRect(chestScreenX - 62, chestFloor - 72, 124, 72);
    ctx.strokeRect(chestScreenX - 62, chestFloor - 72, 124, 72);
    ctx.save();
    ctx.translate(chestScreenX, chestFloor - 72);
    ctx.rotate(armorChestOpened ? -1.05 : 0);
    ctx.fillStyle = '#9b6535';
    ctx.fillRect(-62, -32, 124, 32);
    ctx.strokeRect(-62, -32, 124, 32);
    ctx.restore();
    ctx.fillStyle = '#d1b84f';
    ctx.fillRect(chestScreenX - 9, chestFloor - 56, 18, 22);
    if (mountainMineLevel === 2) {
      let prompt = '';
      let promptX = treasureGateScreenX;
      if (!treasureGateUnlocked &&
        playerNear(treasureGateX, cageFloor - man.height / 2, 125)) {
        prompt = treasureKeyOwned ? 'E  UNLOCK' : 'LOCKED — FIND THE KEY';
      } else if (treasureGateUnlocked && !armorChestOpened &&
        playerNear(treasureChestX, chestFloor - man.height / 2, 130)) {
        prompt = 'E  OPEN';
        promptX = chestScreenX;
      }
      if (prompt) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 22px Arial';
        ctx.textAlign = 'center';
        const promptY = promptX === chestScreenX ? chestFloor - 120 : cageTop - 20;
        ctx.strokeText(prompt, promptX, promptY);
        ctx.fillText(prompt, promptX, promptY);
        ctx.textAlign = 'start';
      }
    }

    const exitFloor = mountainMineFloorAt(105, 0);
    ctx.fillStyle = '#090c0b';
    ctx.strokeStyle = '#795330';
    ctx.lineWidth = 9;
    ctx.fillRect(40 - cameraX, exitFloor - 150, 130, 150);
    ctx.strokeRect(40 - cameraX, exitFloor - 150, 130, 150);
    if (mountainMineLevel === 0 && playerNear(105, exitFloor - man.height / 2, 125)) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  EXIT', 105 - cameraX, exitFloor - 170);
      ctx.fillText('E  EXIT', 105 - cameraX, exitFloor - 170);
      ctx.textAlign = 'start';
    }
  }

  function drawMountainBoss() {
    const boss = mountainBoss;
    if (!boss.alive) return;
    const x = boss.x - cameraX;
    const y = mountainMineFloorAt(boss.x) - boss.radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(boss.lineAngle);
    ctx.strokeStyle = boss.hitFlash > 0 ? '#fff' : '#11823b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.stroke();
    // One center-to-edge radius line turns as the otherwise normal circle rolls.
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(boss.radius, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawDiameterBoss() {
    const boss = diameterBoss;
    if (!boss.alive) return;
    ctx.save();
    ctx.translate(boss.x - cameraX, boss.y);
    ctx.rotate(boss.rotation);
    ctx.strokeStyle = boss.hitFlash > 0 ? '#fff' : '#11823b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.stroke();
    // DIAMETER has a complete edge-to-edge line through its center.
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-boss.radius, 0);
    ctx.lineTo(boss.radius, 0);
    ctx.stroke();
    ctx.restore();
  }

  function drawCircumferenceBoss() {
    const boss = circumferenceBoss;
    if (!boss.alive) return;
    ctx.save();
    ctx.translate(boss.x - cameraX, boss.y);
    ctx.rotate(boss.rotation);
    ctx.strokeStyle = boss.hitFlash > 0 ? '#fff' : '#11823b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius - 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawMountainMiners() {
    mountainMiners.forEach(enemy => {
      if (!enemy.alive) return;
      const x = enemy.x - cameraX;
      const y = mountainMineFloorAt(enemy.x, enemy.level) - enemy.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(enemy.rotation);
      const red = Math.round(17 + 208 * enemy.aggro);
      const green = Math.round(130 - 88 * enemy.aggro);
      const blue = Math.round(59 - 17 * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#fff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.rotate(-enemy.rotation);
      ctx.fillStyle = '#d5a32f';
      ctx.strokeStyle = '#332512';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -enemy.radius + 5, 22, Math.PI, 0);
      ctx.lineTo(27, -enemy.radius + 7);
      ctx.lineTo(-27, -enemy.radius + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (enemy.guard) {
        ctx.fillStyle = '#8a5a2f';
        ctx.strokeStyle = '#392313';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(-29, 10, 22, 29, -.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-41, -12);
        ctx.lineTo(-20, -16);
        ctx.stroke();
      }
      const mining = enemy.aggro < .15;
      const phase = performance.now() * .007 + enemy.x * .02;
      ctx.save();
      ctx.translate(18, -2);
      ctx.rotate(mining ? -.65 + (Math.sin(phase) + 1) * .7 : -.2);
      ctx.strokeStyle = '#87552f';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(58, 0);
      ctx.stroke();
      ctx.strokeStyle = '#b8c0c2';
      ctx.beginPath();
      ctx.moveTo(49, -17);
      ctx.quadraticCurveTo(62, 0, 49, 17);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    });
  }

  function drawMountainMinerEffects() {
    mountainMinerDrops.forEach(drop => {
      if (drop.kind === 'key') {
        ctx.save();
        ctx.translate(drop.x - cameraX, drop.y);
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(-10, 0, 10, 0, Math.PI * 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(25, 0);
        ctx.lineTo(25, 10);
        ctx.moveTo(15, 0);
        ctx.lineTo(15, 8);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = '#ffd23f';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(drop.x - cameraX, drop.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
    mountainMinerPopups.forEach(popup => {
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = 'italic 900 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`-${popup.damage}`, popup.x - cameraX, popup.y);
      ctx.fillText(`-${popup.damage}`, popup.x - cameraX, popup.y);
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  function drawBossHealthBar() {
    if ((!mountainBoss.alive && !diameterBoss.alive && !circumferenceBoss.alive) ||
      man.x < bossRoomStartX - 420) return;
    const bosses = [];
    if (mountainBoss.alive) bosses.push([mountainBoss, 'RADIUS', '#11823b']);
    if (diameterBoss.alive) bosses.push([diameterBoss, 'DIAMETER', '#11823b']);
    if (circumferenceBoss.alive) bosses.push([circumferenceBoss, 'CIRCUMFERENCE', '#11823b']);
    const barWidth = Math.min(680, width - 70);
    const barHeight = 25;
    const x = (width - barWidth) / 2;
    ctx.save();
    bosses.forEach(([boss, label, color], index) => {
      const y = 58 + index * 72;
      const healthRatio = Math.max(0, boss.health / boss.maxHealth);
      ctx.textAlign = 'center';
      ctx.font = '1000 27px Arial';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#fff';
      ctx.strokeText(label, width / 2, y - 14);
      ctx.fillText(label, width / 2, y - 14);
      ctx.fillStyle = '#171b1a';
      ctx.lineWidth = 6;
      ctx.fillRect(x, y, barWidth, barHeight);
      ctx.strokeRect(x, y, barWidth, barHeight);
      ctx.fillStyle = color;
      ctx.fillRect(x + 4, y + 4, (barWidth - 8) * healthRatio, barHeight - 8);
      ctx.font = '900 15px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${Math.max(0, boss.health)} / ${boss.maxHealth}`, width / 2, y + 19);
    });
    ctx.restore();
  }

  function drawMountainBossEffects() {
    diameterShots.forEach(shot => {
      ctx.save();
      ctx.translate(shot.x - cameraX, shot.y);
      ctx.rotate(shot.rotation);
      ctx.strokeStyle = '#11823b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, shot.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-shot.radius, 0);
      ctx.lineTo(shot.radius, 0);
      ctx.stroke();
      ctx.restore();
    });
    bossFloaters.forEach(floater => {
      ctx.save();
      ctx.translate(floater.x - cameraX, floater.y);
      ctx.rotate(floater.rotation);
      ctx.strokeStyle = floater.hitFlash > 0 ? '#fff' : '#11823b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, floater.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(floater.radius, 0);
      ctx.stroke();
      ctx.restore();
    });
    bossProjectiles.forEach(projectile => {
      ctx.strokeStyle = projectile.hitFlash > 0 ? '#fff' : '#11823b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(projectile.x - cameraX, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    bossParticles.forEach(particle => {
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = '#11823b';
      ctx.beginPath();
      ctx.arc(particle.x - cameraX, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    bossDamagePopups.forEach(popup => {
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      if (popup.blocked) {
        drawBrokenSwordIcon(popup.x - cameraX - (popup.damage > 0 ? 24 : 0), popup.y - 5,
          .5, Math.min(1, popup.life * 2.5));
      }
      if (popup.damage > 0) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.font = 'italic 1000 42px Arial';
        ctx.textAlign = 'center';
        const damageX = popup.x - cameraX + (popup.blocked ? 24 : 0);
        ctx.strokeText(`-${popup.damage}`, damageX, popup.y);
        ctx.fillText(`-${popup.damage}`, damageX, popup.y);
      }
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  function drawAbandonedTown() {
    const townX = townStartX - cameraX;
    const townWidth = townEndX - townStartX;
    if (townX > width + 400 || townX + townWidth < -400) return;

    // Dusty town ground laid over the grass.
    ctx.fillStyle = '#756b5b';
    ctx.fillRect(townX, groundY - 5, townWidth, height - groundY + 10);
    ctx.strokeStyle = '#413b34';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(townX, groundY);
    ctx.lineTo(townX + townWidth, groundY);
    ctx.stroke();

    // Small cracks are texture on the existing road, not additional map objects.
    ctx.strokeStyle = 'rgba(61, 55, 48, .38)';
    ctx.lineWidth = 3;
    for (let worldX = townStartX + 90; worldX < townEndX; worldX += 185) {
      const x = worldX - cameraX;
      if (x < -50 || x > width + 50) continue;
      const y = groundY + 30 + mapNoise(worldX * .02) * 75;
      ctx.beginPath();
      ctx.moveTo(x - 13, y);
      ctx.lineTo(x, y + 7);
      ctx.lineTo(x + 11, y - 2);
      ctx.stroke();
    }

    townBuildings.forEach((building, index) => {
      const x = townX + building.offset;
      if (x > width + 500 || x + building.width < -500) return;
      const top = groundY - building.height;
      ctx.fillStyle = building.color;
      ctx.strokeStyle = '#262321';
      ctx.lineWidth = 7;
      ctx.fillRect(x, top, building.width, building.height);
      ctx.strokeRect(x, top, building.width, building.height);

      ctx.strokeStyle = 'rgba(35, 31, 28, .22)';
      ctx.lineWidth = 3;
      for (let sidingY = top + 48; sidingY < groundY; sidingY += 52) {
        ctx.beginPath();
        ctx.moveTo(x + 5, sidingY);
        ctx.lineTo(x + building.width - 5, sidingY + (index % 2 ? 4 : -3));
        ctx.stroke();
      }

      // Uneven, partially collapsed roofline.
      ctx.strokeStyle = '#262321';
      ctx.lineWidth = 7;
      ctx.fillStyle = building.roof;
      ctx.beginPath();
      ctx.moveTo(x - 20, top + 8);
      ctx.lineTo(x + building.width * .22, top - 50 - (index % 2) * 22);
      ctx.lineTo(x + building.width * .52, top - 24);
      ctx.lineTo(x + building.width * .76, top - 58 + (index % 3) * 12);
      ctx.lineTo(x + building.width + 24, top + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      const doorX = x + building.width * .68;
      ctx.fillStyle = '#211d1a';
      ctx.fillRect(doorX, groundY - 128, 78, 128);
      ctx.strokeRect(doorX, groundY - 128, 78, 128);
      const doorWorldX = townStartX + building.offset + building.width * .68 + 39;
      if (playerNear(doorWorldX, groundY - man.height / 2, 135)) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 24px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('E  ENTER', doorX + 39, groundY - 148);
        ctx.fillText('E  ENTER', doorX + 39, groundY - 148);
        ctx.textAlign = 'start';
      }

      // Hollow black windows with crossed boards.
      [x + 72, x + building.width * .45].forEach((windowX, windowIndex) => {
        const windowY = top + 82 + windowIndex * 18;
        ctx.fillStyle = '#17191a';
        ctx.fillRect(windowX - 38, windowY - 34, 76, 68);
        ctx.strokeRect(windowX - 38, windowY - 34, 76, 68);
        ctx.save();
        ctx.translate(windowX, windowY);
        ctx.rotate(windowIndex ? -.32 : .28);
        ctx.fillStyle = '#8c603b';
        ctx.fillRect(-52, -7, 104, 14);
        ctx.restore();
      });

      // Wall cracks.
      ctx.strokeStyle = '#3d3935';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + building.width * .3, top + 8);
      ctx.lineTo(x + building.width * .34, top + 58);
      ctx.lineTo(x + building.width * .29, top + 91);
      ctx.lineTo(x + building.width * .36, top + 129);
      ctx.stroke();
    });
  }

  function drawAttackPath() {
    if (attack.path.length < 2 || (!attack.drawing && !attack.active)) return;
    ctx.strokeStyle = '#147df5';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const firstIndex = attack.active ? attack.index : 1;
    if (attack.active) ctx.moveTo(attack.bladeX - cameraX, attack.bladeY);
    else ctx.moveTo(attack.path[0].x - cameraX, attack.path[0].y);
    for (let i = firstIndex; i < attack.path.length; i++) {
      ctx.lineTo(attack.path[i].x - cameraX, attack.path[i].y);
    }
    ctx.stroke();
  }

  function drawBlade() {
    if ((!attack.active && combo.zoomTime <= 0) || attack.launchDelay > 0 || man.throwTime > 0) return;
    const x = attack.bladeX - cameraX;
    const y = attack.bladeY;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(attack.bladeAngle);
    ctx.shadowColor = '#147df5';
    ctx.shadowBlur = 13;
    ctx.strokeStyle = '#07141b';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-28, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();
    ctx.strokeStyle = '#f4fbff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-27, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
    ctx.fillStyle = '#f4fbff';
    ctx.strokeStyle = '#07141b';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(4, -15);
    ctx.lineTo(96, 0);
    ctx.lineTo(4, 15);
    ctx.lineTo(14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#147df5';
    ctx.fillRect(3, -7, 7, 14);
    ctx.restore();
  }

  function drawBowAimAndArrows() {
    if (bowOwned && bowReload > 0) {
      ctx.save();
      const barWidth = 76;
      const barX = man.x - cameraX - barWidth / 2;
      const barY = man.y - 91;
      ctx.fillStyle = 'rgba(12, 10, 8, .8)';
      ctx.fillRect(barX - 4, barY - 4, barWidth + 8, 16);
      ctx.fillStyle = '#4f4130';
      ctx.fillRect(barX, barY, barWidth, 8);
      ctx.fillStyle = '#f1d27a';
      ctx.fillRect(barX, barY, barWidth * (1 - bowReload / bowReloadDuration), 8);
      ctx.strokeStyle = '#15100b';
      ctx.lineWidth = 3;
      ctx.strokeRect(barX, barY, barWidth, 8);
      ctx.restore();
    }
    if (bowAim.drawing) {
      const pullX = bowAim.startX - bowAim.x;
      const pullY = bowAim.startY - bowAim.y;
      const pullLength = Math.hypot(pullX, pullY);
      ctx.save();
      ctx.strokeStyle = '#f1d27a';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 9]);
      ctx.beginPath();
      const startX = man.x;
      const startY = man.y - 18;
      ctx.moveTo(startX - cameraX, startY);
      if (pullLength >= 1) {
        const vx = pullX / pullLength * arrowSpeed;
        const vy = pullY / pullLength * arrowSpeed;
        for (let t = .08; t <= 1.55; t += .08) {
          const x = startX + vx * t;
          const y = startY + vy * t + .5 * arrowGravity * t * t;
          ctx.lineTo(x - cameraX, y);
          if (y >= activeGroundAt(x)) break;
        }
      }
      ctx.stroke();
      ctx.restore();
    }
    arrows.forEach(arrow => {
      if (arrow.scene !== currentSceneKey()) return;
      ctx.save();
      ctx.translate(arrow.x - cameraX, arrow.y);
      ctx.rotate(arrow.angle);
      ctx.strokeStyle = '#3a2415';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(25, 0);
      ctx.stroke();
      ctx.fillStyle = '#d9dde0';
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.lineTo(19, -7);
      ctx.lineTo(19, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawBoulderTitle() {
    if (boulderTitleTimer <= 0) return;
    const elapsed = 3.4 - boulderTitleTimer;
    const alpha = Math.min(1, elapsed * 2.2, boulderTitleTimer * 1.15);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height / 2);
    ctx.textAlign = 'center';
    const titleSize = Math.min(104, Math.max(54, width * .095));
    ctx.font = `1000 ${titleSize}px Arial`;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#17110d';
    ctx.fillStyle = '#d5c3a0';
    ctx.strokeText('BOULDER HILLS', 0, 0);
    ctx.fillText('BOULDER HILLS', 0, 0);
    ctx.restore();
  }

  function drawPlainsTitle() {
    if (plainsTitleTimer <= 0) return;
    const elapsed = 3.4 - plainsTitleTimer;
    const alpha = Math.min(1, elapsed * 2.2, plainsTitleTimer * 1.15);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height / 2);
    ctx.textAlign = 'center';
    const titleSize = Math.min(104, Math.max(54, width * .095));
    ctx.font = `1000 ${titleSize}px Arial`;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#183819';
    ctx.fillStyle = '#d8efb0';
    ctx.strokeText('PLAINS', 0, 0);
    ctx.fillText('PLAINS', 0, 0);
    ctx.restore();
  }

  function drawTownTitle() {
    if (townTitleTimer <= 0) return;
    const elapsed = 3.4 - townTitleTimer;
    const alpha = Math.min(1, elapsed * 2.2, townTitleTimer * 1.15);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height / 2);
    ctx.textAlign = 'center';
    const titleSize = Math.min(100, Math.max(48, width * .085));
    ctx.font = `1000 ${titleSize}px Arial`;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#171513';
    ctx.fillStyle = '#b9ad98';
    ctx.strokeText('ABANDONED TOWN', 0, 0);
    ctx.fillText('ABANDONED TOWN', 0, 0);
    ctx.restore();
  }

  function drawKingdomTitle() {
    if (kingdomTitleTimer <= 0) return;
    const elapsed = 3.8 - kingdomTitleTimer;
    const alpha = Math.min(1, elapsed * 2.2, kingdomTitleTimer * 1.05);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height / 2);
    ctx.textAlign = 'center';
    const titleSize = Math.min(92, Math.max(42, width * .075));
    ctx.font = `1000 ${titleSize}px Arial`;
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#201c17';
    ctx.fillStyle = '#e1bf59';
    ctx.strokeText('QUADRILATERAL KINGDOM', 0, 0);
    ctx.fillText('QUADRILATERAL KINGDOM', 0, 0);
    ctx.restore();
  }

  function drawAmbushTitle() {
    if (ambushTitleTimer <= 0) return;
    const elapsed = 2.4 - ambushTitleTimer;
    const alpha = Math.min(1, elapsed * 5, ambushTitleTimer * 1.5);
    const pulse = 1 + Math.sin(elapsed * 12) * .045;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height * .38);
    ctx.scale(pulse, pulse);
    ctx.textAlign = 'center';
    ctx.font = `1000 ${Math.min(142, Math.max(72, width * .13))}px Arial`;
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#160606';
    ctx.fillStyle = '#ed3b32';
    ctx.strokeText('AMBUSH!', 0, 0);
    ctx.fillText('AMBUSH!', 0, 0);
    ctx.restore();
  }

  function drawBossPhaseTitle() {
    if (bossPhaseTitleTimer <= 0) return;
    const elapsed = 3.2 - bossPhaseTitleTimer;
    const alpha = Math.min(1, elapsed * 2.8, bossPhaseTitleTimer * 1.2);
    const phaseNames = {
      1: ['PHASE 1', 'RADIUS'],
      2: ['PHASE 2', 'RADIUS + DIAMETER'],
      3: ['PHASE 3', 'RADIUS + DIAMETER + CIRCUMFERENCE'],
      4: ['PHASE 3 COMPLETE', 'THE QUADRILATERAL KINGDOM IS OPEN']
    };
    const label = phaseNames[bossPhaseTitle];
    if (!label) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(width / 2, height * .48);
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.fillStyle = bossPhaseTitle === 4 ? '#e1bf59' : '#fff';
    ctx.lineWidth = 12;
    ctx.font = `1000 ${Math.min(90, Math.max(52, width * .08))}px Arial`;
    ctx.strokeText(label[0], 0, 0);
    ctx.fillText(label[0], 0, 0);
    ctx.font = `900 ${Math.min(34, Math.max(20, width * .028))}px Arial`;
    ctx.lineWidth = 7;
    ctx.strokeText(label[1], 0, 50);
    ctx.fillText(label[1], 0, 50);
    ctx.restore();
  }

  function drawDeathDrops() {
    const scene = currentSceneKey();
    deathDrops.forEach(drop => {
      if (drop.scene !== scene || drop.expiresAt <= performance.now()) return;
      const screenX = (scene === 'world' || scene === 'kingdom' ||
        scene === 'mine' || scene === 'mountain-mine') ?
        drop.x - cameraX : drop.x;
      ctx.save();
      ctx.translate(screenX, drop.y);
      ctx.globalAlpha = Math.min(1, (drop.expiresAt - performance.now()) / 10000);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#111';
      if (drop.kind === 'shapes') {
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(-2, -9, 18, 18);
        ctx.strokeRect(-2, -9, 18, 18);
        ctx.beginPath();
        ctx.arc(-9, -2, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(7, -16);
        ctx.lineTo(20, 8);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (drop.kind === 'cloak') {
        ctx.fillStyle = '#704526';
        ctx.beginPath();
        ctx.moveTo(-12, -17);
        ctx.lineTo(12, -17);
        ctx.lineTo(20, 17);
        ctx.lineTo(0, 10);
        ctx.lineTo(-20, 17);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (drop.kind === 'armor') {
        ctx.fillStyle = '#8d989b';
        ctx.strokeStyle = '#30383a';
        ctx.beginPath();
        ctx.moveTo(-20, -17);
        ctx.lineTo(-7, -10);
        ctx.lineTo(7, -10);
        ctx.lineTo(20, -17);
        ctx.lineTo(25, 2);
        ctx.lineTo(16, 15);
        ctx.lineTo(-16, 15);
        ctx.lineTo(-25, 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (drop.kind === 'key') {
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(-9, 0, 9, 0, Math.PI * 2);
        ctx.moveTo(0, 0);
        ctx.lineTo(24, 0);
        ctx.lineTo(24, 9);
        ctx.moveTo(14, 0);
        ctx.lineTo(14, 7);
        ctx.stroke();
      } else if (drop.kind === 'bow') {
        ctx.strokeStyle = '#b87a3e';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(-4, 0, 24, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
        ctx.strokeStyle = '#eee6ce';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-4, -24);
        ctx.lineTo(-4, 24);
        ctx.stroke();
      } else {
        ctx.rotate(-.35);
        ctx.fillStyle = '#d8e3e8';
        ctx.fillRect(-18, -4, 25, 8);
        ctx.strokeRect(-18, -4, 25, 8);
        ctx.beginPath();
        ctx.moveTo(7, -10);
        ctx.lineTo(25, 0);
        ctx.lineTo(7, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      if (drop.kind !== 'shapes' && drop.amount > 1) {
        ctx.rotate(drop.kind === 'sharpening' ? .35 : 0);
        ctx.font = '900 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 4;
        ctx.strokeText(`x${drop.amount}`, 0, -25);
        ctx.fillText(`x${drop.amount}`, 0, -25);
      }
      ctx.restore();
    });
  }

  function drawDamageFlash() {
    if (damageFlash <= 0) return;
    const edgeX = Math.min(190, width * .22);
    const edgeY = Math.min(150, height * .2);
    const alpha = Math.min(.78, damageFlash * .78);
    ctx.save();
    let gradient = ctx.createLinearGradient(0, 0, edgeX, 0);
    gradient.addColorStop(0, `rgba(220, 0, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(220, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, edgeX, height);
    gradient = ctx.createLinearGradient(width, 0, width - edgeX, 0);
    gradient.addColorStop(0, `rgba(220, 0, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(220, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(width - edgeX, 0, edgeX, height);
    gradient = ctx.createLinearGradient(0, 0, 0, edgeY);
    gradient.addColorStop(0, `rgba(220, 0, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(220, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, edgeY);
    gradient = ctx.createLinearGradient(0, height, 0, height - edgeY);
    gradient.addColorStop(0, `rgba(220, 0, 0, ${alpha})`);
    gradient.addColorStop(1, 'rgba(220, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - edgeY, width, edgeY);
    ctx.restore();
  }

  function applyDamageShake() {
    const remaining = damageShakeUntil - performance.now();
    if (remaining <= 0) return;
    const power = remaining / 220;
    const time = performance.now();
    ctx.translate(
      Math.sin(time * .095) * damageShakeStrength * power,
      Math.cos(time * .123) * damageShakeStrength * power
    );
  }

  function draw() {
    ctx.fillStyle = '#78c9f4';
    ctx.fillRect(0, 0, width, height);
    if (insideMountainMine) {
      ctx.save();
      applyDamageShake();
      if (combo.zoomTime > 0) {
        const progress = 1 - combo.zoomTime / combo.zoomDuration;
        const zoom = 1 + Math.sin(progress * Math.PI) * .85;
        const bladeScreenX = attack.bladeX - cameraX;
        const bladeScreenY = attack.bladeY - cameraY;
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-bladeScreenX, -bladeScreenY);
      }
      ctx.translate(0, -cameraY);
      drawMountainMineInterior();
      if (attack.drawing) {
        ctx.fillStyle = 'rgba(3, 6, 6, .64)';
        ctx.fillRect(0, cameraY, width, height);
      }
      drawMountainMiners();
      drawMountainMinerEffects();
      drawMountainBoss();
      drawDiameterBoss();
      drawCircumferenceBoss();
      drawMountainBossEffects();
      drawAttackPath();
      drawBlade();
      drawDeathDrops();
      drawMan();
      ctx.restore();
      drawBossHealthBar();
      drawDamageFlash();
      return;
    }
    if (insideMine) {
      ctx.save();
      applyDamageShake();
      if (combo.zoomTime > 0) {
        const progress = 1 - combo.zoomTime / combo.zoomDuration;
        const zoom = 1 + Math.sin(progress * Math.PI) * .85;
        const bladeScreenX = attack.bladeX - cameraX;
        const bladeScreenY = attack.bladeY - cameraY;
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-bladeScreenX, -bladeScreenY);
      }
      ctx.translate(0, -cameraY);
      drawMineInterior();
      if (attack.drawing) {
        ctx.fillStyle = 'rgba(4, 8, 10, .62)';
        ctx.fillRect(0, cameraY, width, height);
      }
      drawMineEnemies();
      drawMineEffects();
      drawAttackPath();
      drawBlade();
      drawDeathDrops();
      drawMan();
      ctx.restore();
      drawDamageFlash();
      return;
    }
    if (insideBarracks) {
      ctx.save();
      applyDamageShake();
      ctx.translate(0, -cameraY);
      drawBarracksInterior();
      if (attack.drawing) {
        ctx.fillStyle = 'rgba(4, 8, 10, .62)';
        ctx.fillRect(0, cameraY, width, height);
      }
      drawAttackPath();
      drawBlade();
      drawBowAimAndArrows();
      drawDeathDrops();
      drawMan();
      ctx.restore();
      drawDamageFlash();
      return;
    }
    if (insideTownHouse) {
      ctx.save();
      applyDamageShake();
      if (combo.zoomTime > 0) {
        const progress = 1 - combo.zoomTime / combo.zoomDuration;
        const zoom = 1 + Math.sin(progress * Math.PI) * .85;
        const bladeScreenY = attack.bladeY - cameraY;
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-attack.bladeX, -bladeScreenY);
      }
      ctx.translate(0, -cameraY);
      drawTownHouseInterior();
      if (attack.drawing) {
        ctx.fillStyle = 'rgba(4, 8, 10, .62)';
        ctx.fillRect(0, cameraY, width, height);
      }
      drawAttackPath();
      drawBlade();
      drawDeathDrops();
      drawMan();
      ctx.restore();
      drawDamageFlash();
      return;
    }
    if (insideShop) {
      ctx.save();
      applyDamageShake();
      if (combo.zoomTime > 0) {
        const progress = 1 - combo.zoomTime / combo.zoomDuration;
        const zoom = 1 + Math.sin(progress * Math.PI) * .85;
        const bladeScreenY = attack.bladeY - cameraY;
        ctx.translate(width / 2, height / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-attack.bladeX, -bladeScreenY);
      }
      ctx.translate(0, -cameraY);
      drawShopInterior();
      if (attack.drawing) {
        ctx.fillStyle = 'rgba(4, 12, 20, .58)';
        ctx.fillRect(0, cameraY, width, height);
      }
      drawInteriorEnemies();
      drawInteriorEffects();
      drawAttackPath();
      drawBlade();
      drawBowAimAndArrows();
      drawDeathDrops();
      drawMan();
      ctx.restore();
      drawDamageFlash();
      return;
    }
    ctx.save();
    applyDamageShake();
    if (combo.zoomTime > 0) {
      const progress = 1 - combo.zoomTime / combo.zoomDuration;
      const zoom = 1 + Math.sin(progress * Math.PI) * .85;
      const bladeScreenX = attack.bladeX - cameraX;
      const bladeScreenY = attack.bladeY - cameraY;
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-bladeScreenX, -bladeScreenY);
    }
    ctx.translate(0, -cameraY);
    const groundWidth = Math.max(0, Math.min(width, worldEnd - cameraX));
    const groundBottom = cameraY + height + 2000;
    ctx.fillStyle = '#58a84f';
    ctx.beginPath();
    ctx.moveTo(0, groundBottom);
    ctx.lineTo(0, groundAt(cameraX));
    for (let x = 20; x <= groundWidth; x += 20) ctx.lineTo(x, groundAt(cameraX + x));
    ctx.lineTo(groundWidth, groundAt(cameraX + groundWidth));
    ctx.lineTo(groundWidth, groundBottom);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2f7d3b';
    ctx.lineWidth = 11;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, groundAt(cameraX));
    for (let x = 20; x <= groundWidth; x += 20) ctx.lineTo(x, groundAt(cameraX + x));
    ctx.lineTo(groundWidth, groundAt(cameraX + groundWidth));
    ctx.stroke();
    drawGroundDetails(groundWidth);
    if (insideKingdom) {
      drawQuadrilateralKingdom();
    } else {
      drawMountain();
      drawAbandonedTown();
      drawMineEntrance();
    }
    if (attack.drawing) {
      ctx.fillStyle = 'rgba(4, 12, 20, .58)';
      ctx.fillRect(0, cameraY, width, height);
    }
    if (!insideKingdom) drawShop();
    drawEnemies();
    drawDoorDebris();
    drawDropsAndSplats();
    drawAttackPath();
    drawBlade();
    drawBowAimAndArrows();
    drawDeathDrops();
    drawMan();
    ctx.restore();
    drawBoulderTitle();
    drawPlainsTitle();
    drawTownTitle();
    drawKingdomTitle();
    drawAmbushTitle();
    drawDamageFlash();
  }

  function frame(time) {
    const dt = Math.min(.033, (time - lastTime) / 1000 || 0); lastTime = time;
    update(dt); draw(); requestAnimationFrame(frame);
  }

  function setKey(key, down) {
    keys[key] = down;
    if (key === 'jump' && down) man.jumpBuffer = .13;
  }
  const map = {
    ArrowLeft:'left', a:'left', A:'left', ArrowRight:'right', d:'right', D:'right',
    ArrowUp:'jump', w:'jump', W:'jump', ' ':'jump', ArrowDown:'down', s:'down', S:'down'
  };
  addEventListener('keydown', event => {
    if ((event.key === 'z' || event.key === 'Z') && !event.repeat) {
      if (started && playtesting) {
        event.preventDefault();
        startPlaytestSwordSlash();
      }
      return;
    }
    if ((event.key === 'q' || event.key === 'Q') && !event.repeat) {
      if (started) {
        event.preventDefault();
        setInventoryOpen(!inventoryOpen);
      }
      return;
    }
    if ((event.key === 't' || event.key === 'T') && !event.repeat) {
      if (started && playtesting) {
        event.preventDefault();
        setTeleportOpen(!teleportOpen);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (inventoryOpen) setInventoryOpen(false);
      else if (teleportOpen) setTeleportOpen(false);
      else pauseGame();
      return;
    }
    if (teleportOpen || inventoryOpen) {
      event.preventDefault();
      return;
    }
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
      toggleShop();
      return;
    }
    const key = map[event.key];
    if (key) { event.preventDefault(); setKey(key, true); }
  });
  addEventListener('keyup', event => { const key = map[event.key]; if (key) setKey(key, false); });
  function pointerPosition(event) {
    const screenX = Math.max(0, Math.min(width, event.clientX));
    const screenY = Math.max(0, Math.min(height, event.clientY));
    if (insideShop || insideTownHouse || insideBarracks) {
      const room = interiorBounds();
      return {
        x: Math.max(room.left, Math.min(room.right, screenX)),
        y: Math.max(room.wallTop, Math.min(groundY, screenY + cameraY))
      };
    }
    if (insideMountainMine) {
      const mountainMineWorldX = Math.min(mountainMineWidth, screenX + cameraX);
      return {
        x: mountainMineWorldX,
        y: Math.min(mountainMineFloorAt(mountainMineWorldX), screenY + cameraY)
      };
    }
    if (insideMine) {
      const mineWorldX = Math.min(mineWorldWidth, screenX + cameraX);
      return {
        x: mineWorldX,
        y: Math.min(mineFloorAt(mineWorldX), screenY + cameraY)
      };
    }
    const worldX = Math.min(worldEnd, screenX + cameraX);
    return {
      x: worldX,
      y: Math.min(groundAt(worldX), screenY + cameraY)
    };
  }

  function segmentsIntersect(a, b, c, d) {
    const rX = b.x - a.x, rY = b.y - a.y;
    const sX = d.x - c.x, sY = d.y - c.y;
    const denominator = rX * sY - rY * sX;
    if (Math.abs(denominator) < .0001) return false;
    const cax = c.x - a.x, cay = c.y - a.y;
    const t = (cax * sY - cay * sX) / denominator;
    const u = (cax * rY - cay * rX) / denominator;
    return t > .001 && t < .999 && u > .001 && u < .999;
  }

  function newIntersectionCount(point) {
    const path = attack.path;
    if (path.length < 3) return 0;
    const start = path[path.length - 1];
    let count = 0;
    // Skip the immediately adjacent segment, which shares the start point.
    for (let i = 0; i < path.length - 2; i++) {
      if (segmentsIntersect(start, point, path[i], path[i + 1])) count++;
    }
    return count;
  }

  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('pointerdown', event => {
    if (event.button === 2) {
      event.preventDefault();
      startCloakDash();
      return;
    }
    if (event.button !== 0) return;
    if (!started || attack.active || shopPopupOpen || mineClimb || teleportOpen || inventoryOpen) return;
    const manScreenX = (insideShop || insideTownHouse || insideBarracks) ? man.x : man.x - cameraX;
    const manScreenY = man.y - cameraY;
    const pointerDistance = Math.hypot(event.clientX - manScreenX, event.clientY - manScreenY);
    if (bowOwned && bowReload <= 0 && pointerDistance > 76) {
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      const point = pointerPosition(event);
      bowAim.drawing = true;
      bowAim.startX = point.x;
      bowAim.startY = point.y;
      bowAim.x = point.x;
      bowAim.y = point.y;
      return;
    }
    if (pointerDistance > 76) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    attack.drawing = true;
    document.body.classList.add('targeting');
    attack.visible = 1;
    attack.length = 0;
    attack.intersections = 0;
    attack.kills = 0;
    attack.path = [{ x: man.x, y: man.y }];
  });

  canvas.addEventListener('pointermove', event => {
    if (bowAim.drawing) {
      const point = pointerPosition(event);
      bowAim.x = point.x;
      bowAim.y = point.y;
      return;
    }
    if (!attack.drawing) return;
    let point = pointerPosition(event);
    const last = attack.path[attack.path.length - 1];
    let segmentLength = Math.hypot(point.x - last.x, point.y - last.y);
    if (segmentLength < 9) return;
    if (!playtesting) {
      const remainingLength = attack.maxLength - attack.length;
      if (remainingLength <= 0) return;
      if (segmentLength > remainingLength) {
        point = {
          x: last.x + (point.x - last.x) / segmentLength * remainingLength,
          y: last.y + (point.y - last.y) / segmentLength * remainingLength
        };
        segmentLength = remainingLength;
      }
    }
    const crossings = newIntersectionCount(point);
    if (!playtesting && attack.intersections + crossings > 2) return;
    attack.path.push(point);
    attack.length += segmentLength;
    attack.intersections += crossings;
  });

  function finishAttack(event) {
    if (bowAim.drawing) {
      const point = pointerPosition(event);
      bowAim.drawing = false;
      fireBowArrow(bowAim.startX - point.x, bowAim.startY - point.y);
      return;
    }
    if (!attack.drawing) return;
    attack.drawing = false;
    document.body.classList.remove('targeting');
    if (attack.path.length > 1) {
      attack.active = true;
      attack.id++;
      attack.index = 1;
      attack.spin = 0;
      attack.bladeX = attack.path[0].x;
      attack.bladeY = attack.path[0].y;
      attack.thrown = false;
      attack.landed = false;
      attack.directionCharge = 0;
      attack.comboTriggered = false;
      attack.launchDelay = .52;
      const firstTarget = attack.path[1];
      const firstDistance = Math.hypot(firstTarget.x - attack.bladeX, firstTarget.y - attack.bladeY) || 1;
      attack.lastDirX = (firstTarget.x - attack.bladeX) / firstDistance;
      attack.lastDirY = (firstTarget.y - attack.bladeY) / firstDistance;
      attack.bladeAngle = Math.atan2(attack.lastDirY, attack.lastDirX);
      man.throwAngle = attack.bladeAngle;
      if (Math.abs(attack.lastDirX) > .05) man.facing = Math.sign(attack.lastDirX);
      man.throwTime = .52;
    } else {
      attack.path = [];
    }
  }
  canvas.addEventListener('pointerup', finishAttack);
  canvas.addEventListener('pointercancel', () => {
    bowAim.drawing = false;
    if (attack.drawing) {
      attack.drawing = false;
      attack.path = [];
      document.body.classList.remove('targeting');
    }
  });
  if (playButton && mainMenu) {
    playButton.addEventListener('click', () => {
      if (paused) {
        playtesting = Boolean(playtestToggle && playtestToggle.checked);
        if (!playtesting) setTeleportOpen(false);
        updateHealth();
      } else {
        resetGame();
      }
      started = true;
      paused = false;
      mainMenu.classList.add('hidden');
      if (healthHud) healthHud.classList.remove('hidden');
      if (shapeHud) shapeHud.classList.remove('hidden');
      if (pauseButton) pauseButton.classList.remove('hidden');
      updateBreathHud();
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    });
  }
  if (pauseButton) pauseButton.addEventListener('click', pauseGame);
  let inventoryDragItem = null;
  const allInventorySlots = (armorSlot ? [armorSlot] : []).concat(storageSlots);
  allInventorySlots.forEach(slot => {
    slot.addEventListener('dragstart', event => {
      const item = slot.dataset.item;
      if (!item) {
        event.preventDefault();
        return;
      }
      inventoryDragItem = item;
      slot.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item);
    });
    slot.addEventListener('dragend', () => {
      inventoryDragItem = null;
      allInventorySlots.forEach(item => item.classList.remove('dragging', 'drag-target'));
    });
    slot.addEventListener('dragover', event => {
      if (!inventoryDragItem) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      slot.classList.add('drag-target');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-target'));
    slot.addEventListener('drop', event => {
      if (!inventoryDragItem) return;
      event.preventDefault();
      moveInventoryItem(inventoryDragItem, slot === armorSlot,
        slot === armorSlot ? -1 : Number(slot.dataset.storageSlot));
      inventoryDragItem = null;
      allInventorySlots.forEach(item => item.classList.remove('dragging', 'drag-target'));
    });
    slot.addEventListener('click', () => {
      const item = slot.dataset.item;
      if (!item) return;
      if (item === 'key' || item === 'bow') return;
      if (slot === armorSlot) {
        moveInventoryItem(item, false, firstFreeStorageIndex());
      } else {
        moveInventoryItem(item, true);
      }
    });
  });
  teleportButtons.forEach(button => {
    button.addEventListener('click', () => teleportTo(button.dataset.teleport));
  });
  if (upgradeButton) upgradeButton.addEventListener('click', buySharpening);
  if (shopClose) {
    shopClose.addEventListener('click', () => {
      shopPopupOpen = false;
      if (shopPopup) shopPopup.classList.add('hidden');
    });
  }
  addEventListener('blur', () => { keys.left = keys.right = keys.jump = keys.down = false; });
  addEventListener('resize', resize);
  updateInventoryUI();
  resize(); requestAnimationFrame(frame);
})();
