(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const mainMenu = document.querySelector('#mainMenu');
  const playButton = document.querySelector('#playButton');
  const menuTitle = mainMenu && mainMenu.querySelector('h1');
  const healthHud = document.querySelector('#healthHud');
  const shapeHud = document.querySelector('#shapeHud');
  const comboHud = document.querySelector('#comboHud');
  const playtestToggle = document.querySelector('#playtestToggle');
  const pauseButton = document.querySelector('#pauseButton');
  const shopPopup = document.querySelector('#shopPopup');
  const upgradeButton = document.querySelector('#upgradeButton');
  const damageLabel = document.querySelector('#damageLabel');
  const speedLabel = document.querySelector('#speedLabel');
  const speedButton = document.querySelector('#speedButton');
  const shopClose = document.querySelector('#shopClose');
  const inventoryScreen = document.querySelector('#inventoryScreen');
  const armorSlot = document.querySelector('#armorSlot');
  const storageSlots = Array.from(document.querySelectorAll('[data-storage-slot]'));
  const teleportScreen = document.querySelector('#teleportScreen');
  const teleportButtons = document.querySelectorAll('[data-teleport]');
  if (playtestToggle) playtestToggle.checked = false;
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
  const worldEnd = mountainEndX + 650;
  const mountainMineWidth = 6700;
  const bossRoomStartX = 5700;
  const bossRoomEndX = mountainMineWidth - 140;
  const bossGateX = bossRoomStartX + 35;
  const bossGateHalfWidth = 38;
  const bossRoomHeight = 560;
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
  let shapes = 0;
  let bladeDamage = 1, sharpeningLevel = 0, lanceSpeed = 430, speedLevel = 0, shopPopupOpen = false;
  let playtesting = false;
  let insideShop = false, shopReturnX = 0, shopReturnCamera = 0, shopReturnCameraY = 0;
  let insideMine = false, mineReturnX = 0, mineReturnCamera = 0, mineReturnCameraY = 0;
  let insideMountainMine = false;
  let mountainMineReturnX = 0, mountainMineReturnCamera = 0, mountainMineReturnCameraY = 0;
  let mountainMineLevel = 0, mountainMineClimb = null, bossGateClosed = false;
  let insideTownHouse = false, townHouseIndex = 0;
  let townHouseReturnX = 0, townHouseReturnCamera = 0, townHouseReturnCameraY = 0;
  let cloakChestOpened = false, cloakOwned = false, hasCloak = false, cloakPickupTimer = 0;
  let cloakStorageIndex = 0;
  let dashTime = 0, dashCooldown = 0, dashDirection = 1;
  let mineLevel = 0, mineClimb = null;
  let shopDoorBroken = false, shopDoorBoarded = true;
  let shopkeeperFleeing = false, shopkeeperReturning = false, shopkeeperHidden = false;
  let shopkeeperFleeX = 0, shopkeeperFleeY = 0, shopSafeTimer = 0, doorDebris = [];
  let width = 0, height = 0, ratio = 1, groundY = 0, lastTime = 0, cameraX = 0, cameraY = 0;
  let enemies = [], nextEnemyX = 650, hillNextEnemyX = hillStart + 260;
  let mineEnemies = [], mineDrops = [], mineDamagePopups = [];
  let bossParticles = [], bossDamagePopups = [], bossProjectiles = [];
  let mountainMiners = [], mountainMinerPopups = [], mountainMinerDrops = [];
  let boulderNextEnemyX = boulderHillStartX + boulderHillWidth * .35;
  let wasInBoulderHills = false, boulderTitleTimer = 0;
  let wasInTown = false, townTitleTimer = 0;
  let splats = [], shapeDrops = [], damagePopups = [];
  const attack = {
    drawing: false, active: false, path: [], index: 0, visible: 0,
    length: 0, maxLength: 900, intersections: 0, spin: 0, kills: 0, id: 0,
    bladeX: 0, bladeY: 0, bladeAngle: 0, thrown: false, landed: false,
    throwVx: 0, throwVy: 0, throwTime: 0, directionCharge: 0,
    lastDirX: 1, lastDirY: 0, comboTriggered: false, launchDelay: 0
  };
  const combo = { timer: 0, slowTime: 0, zoomTime: 0, zoomDuration: .85 };
  const man = {
    x: 210, y: 0, vx: 0, vy: 0, width: 46, height: 108,
    grounded: true, coyote: 0, jumpBuffer: 0, runTime: 0, idleTime: 0,
    facing: 1, hitTime: 0, throwTime: 0, throwAngle: 0
  };
  const mountainBoss = {
    x: bossRoomEndX - 177, radius: 92, maxHealth: 50, health: 50, alive: true, aggro: 0,
    rotation: 0, lineAngle: Math.PI, hitFlash: 0, bladeTouching: false,
    lastComboAttack: -1, chargeTimer: 4.8, chargeTime: 0, chargeDirection: -1,
    shotTimer: 1.2
  };

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
    return groundAt(x);
  }

  function cloakChestX() {
    return Math.min(width - 125, Math.max(260, width * .58));
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
    Object.assign(mountainBoss, {
      x: bossRoomEndX - 177, health: 50, alive: true, aggro: 0, rotation: 0,
      lineAngle: Math.PI, hitFlash: 0, bladeTouching: false, lastComboAttack: -1,
      chargeTimer: 4.8, chargeTime: 0, chargeDirection: -1, shotTimer: 1.2
    });
    bossParticles = [];
    bossDamagePopups = [];
    bossProjectiles = [];
    mountainMiners = [
      [620, 0], [1220, 1], [1810, 2], [2180, 0],
      [2790, 1], [3540, 2], [3980, 1], [4450, 0]
    ].map(([x, level]) => makeMineEnemy(x, level));
    mountainMinerPopups = [];
    mountainMinerDrops = [];
    mountainMineLevel = 0;
    mountainMineClimb = null;
    bossGateClosed = false;
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
    return {
      x, spawnX: x, zone, rocky, radius: 34,
      speed: rocky ? 195 + Math.random() * 45 : 65 + Math.random() * 35,
      rockSeed: Math.random() * Math.PI * 2,
      rollDirection: 0, rollCooldown: 0,
      rotation: 0, aggro: 0, health: 3, bladeTouching: false,
      lastComboAttack: -1, hitFlash: 0, respawnTimer: 0, alive: true,
      inShop: false, shopX: 0
    };
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
      shopkeeperFleeX = width * .76;
      shopkeeperFleeY = 0;
    }
  }

  function updateShopkeeperState(dt) {
    const hatchX = width * .9;
    const keeperPostX = width * .76;
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
      enemy.shopX = Math.max(enemy.radius, Math.min(width - enemy.radius, enemy.shopX));
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
        if (!playtesting) {
          health--;
          updateHealth();
          if (health <= 0) gameOver();
        }
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
      const shaft = mineShafts.find(item => Math.abs(man.x - item.x) < 62 &&
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
      const shaft = mountainMineShafts.find(item => Math.abs(man.x - item.x) < 62 &&
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
        if (!playtesting) {
          health--;
          updateHealth();
          if (health <= 0) gameOver();
        }
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
          mountainMinerDrops.push({ x: enemy.x, y: currentY, vy: -250, level: enemy.level, collected: false });
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
        if (!playtesting) {
          health--;
          updateHealth();
          if (health <= 0) gameOver();
        }
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
        shapes++;
        updateShapes();
      }
    });
    mountainMinerDrops = mountainMinerDrops.filter(drop => !drop.collected);
    mountainMinerPopups.forEach(popup => {
      popup.y += popup.vy * dt;
      popup.life -= dt;
    });
    mountainMinerPopups = mountainMinerPopups.filter(popup => popup.life > 0);

    const boss = mountainBoss;
    const gateRoomEdge = bossGateX + bossGateHalfWidth + man.width / 2;
    if (boss.alive && mountainMineLevel === 0 && man.x >= gateRoomEdge) bossGateClosed = true;
    if (!boss.alive) bossGateClosed = false;
    if (boss.alive) {
      boss.hitFlash = Math.max(0, boss.hitFlash - dt);
      const playerInRoom = bossGateClosed && mountainMineLevel === 0;
      if (playerInRoom) boss.aggro = Math.min(1, boss.aggro + dt * .72);
      else boss.aggro = Math.max(0, boss.aggro - dt * .4);
      const aimY = man.y - (mountainMineFloorAt(boss.x) - boss.radius);
      boss.lineAngle = Math.atan2(aimY, man.x - boss.x);
      if (playerInRoom) {
        boss.chargeTimer -= dt;
        boss.shotTimer -= dt;
        if (boss.chargeTime > 0) {
          const chargeSpeed = 680;
          boss.x += boss.chargeDirection * chargeSpeed * dt;
          boss.rotation += boss.chargeDirection * chargeSpeed * dt / boss.radius;
          boss.chargeTime = Math.max(0, boss.chargeTime - dt);
        } else {
          // RADIUS spends most of the fight retreating to the far wall.
          const waitingX = bossRoomEndX - boss.radius - 95;
          const retreatDirection = Math.sign(waitingX - boss.x);
          const retreatSpeed = Math.abs(waitingX - boss.x) > 12 ? 145 : 0;
          boss.x += retreatDirection * retreatSpeed * dt;
          boss.rotation += retreatDirection * retreatSpeed * dt / boss.radius;
          if (boss.chargeTimer <= 0) {
            boss.chargeDirection = Math.sign(man.x - boss.x) || -1;
            boss.chargeTime = .9;
            boss.chargeTimer = 4.8 + Math.random() * 2.2;
          }
        }
        if (boss.shotTimer <= 0 && boss.chargeTime <= 0) {
          const shotAngle = boss.lineAngle;
          bossProjectiles.push({
            x: boss.x + Math.cos(shotAngle) * (boss.radius + 42),
            y: mountainMineFloorAt(boss.x) - boss.radius + Math.sin(shotAngle) * (boss.radius + 42),
            vx: Math.cos(shotAngle) * 470,
            vy: Math.sin(shotAngle) * 470 - 360,
            radius: 24, life: 14, health: 3, rotation: 0,
            hitFlash: 0, bladeTouching: false, grounded: false
          });
          boss.shotTimer = 1.55 + Math.random() * .75;
        }
      }
      boss.x = Math.max(bossRoomStartX + boss.radius, Math.min(bossRoomEndX - boss.radius, boss.x));

      const currentY = mountainMineFloorAt(boss.x) - boss.radius;
      const bladeHit = attack.active && attack.launchDelay <= 0 && man.throwTime <= 0 &&
        Math.hypot(attack.bladeX - boss.x, attack.bladeY - currentY) < boss.radius + 62;
      if (bladeHit && !boss.bladeTouching) {
        if (boss.lastComboAttack !== attack.id) {
          boss.lastComboAttack = attack.id;
          attack.kills++;
        }
        boss.health -= bladeDamage;
        boss.aggro = 1;
        boss.hitFlash = .18;
        bossDamagePopups.push({
          x: boss.x, y: currentY - boss.radius - 15, vy: -62, life: .85, damage: bladeDamage
        });
        if (boss.health <= 0) {
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
      if (boss.alive && horizontal && vertical && !attack.drawing && man.hitTime <= 0) {
        man.vx = (Math.sign(man.x - boss.x) || -1) * 720;
        man.vy = -460;
        man.hitTime = 1.15;
        if (!playtesting) {
          health--;
          updateHealth();
          if (health <= 0) gameOver();
        }
      }
    }

    if (!boss.alive) bossProjectiles = [];
    bossProjectiles.forEach(projectile => {
      projectile.hitFlash = Math.max(0, projectile.hitFlash - dt);
      projectile.vy += 1050 * dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.life -= dt;
      projectile.rotation += projectile.vx * dt / projectile.radius;

      const projectileFloor = mountainMineFloorAt(projectile.x, 0) - projectile.radius;
      const projectileCeiling = mountainMineFloorAt(bossRoomStartX, 0) - bossRoomHeight + projectile.radius;
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
      const projectileRightWall = bossRoomEndX - projectile.radius - 14;
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
        if (!playtesting) {
          health--;
          updateHealth();
          if (health <= 0) gameOver();
        }
      }
      if (projectile.y < groundY - 850 || projectile.y > groundY + 150) projectile.life = 0;
    });
    bossProjectiles = bossProjectiles.filter(projectile => projectile.life > 0);

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

  function updateShapes() {
    if (!shapeHud) return;
    shapeHud.setAttribute('aria-label', `${shapes} shapes`);
    const count = shapeHud.querySelector('b');
    if (count) count.textContent = shapes;
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
    health = 3;
    cameraX = 0;
    cameraY = 0;
    enemies = [];
    splats = [];
    shapeDrops = [];
    damagePopups = [];
    insideShop = false;
    insideMine = false;
    insideMountainMine = false;
    insideTownHouse = false;
    townHouseIndex = 0;
    cloakChestOpened = false;
    cloakOwned = false;
    hasCloak = false;
    cloakStorageIndex = 0;
    cloakPickupTimer = 0;
    dashTime = 0;
    dashCooldown = 0;
    dashDirection = 1;
    resetMine();
    resetMountainBoss();
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
    wasInBoulderHills = false;
    boulderTitleTimer = 0;
    wasInTown = false;
    townTitleTimer = 0;
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
    if (menuTitle) menuTitle.textContent = 'SHAPEDOWN';
    if (playButton) playButton.textContent = 'RESUME';
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (pauseButton) pauseButton.classList.add('hidden');
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
  }

  function updateInventoryUI() {
    const cloakInArmor = cloakOwned && hasCloak;
    if (armorSlot) {
      armorSlot.classList.toggle('locked', !cloakInArmor);
      armorSlot.classList.toggle('occupied', cloakInArmor);
      armorSlot.classList.toggle('equipped', cloakInArmor);
      armorSlot.draggable = cloakInArmor;
      armorSlot.setAttribute('aria-label', cloakInArmor ? 'Brown cloak equipped in armor slot' : 'Empty armor slot');
    }
    storageSlots.forEach((slot, index) => {
      const containsCloak = cloakOwned && !hasCloak && cloakStorageIndex === index;
      slot.classList.toggle('locked', !containsCloak);
      slot.classList.toggle('occupied', containsCloak);
      slot.draggable = containsCloak;
      slot.setAttribute('aria-label', containsCloak ? 'Brown cloak in storage slot' : 'Empty storage slot');
    });
  }

  function setInventoryOpen(open) {
    if (open && !started) return;
    inventoryOpen = open;
    if (inventoryScreen) inventoryScreen.classList.toggle('hidden', !open);
    if (open) {
      teleportOpen = false;
      if (teleportScreen) teleportScreen.classList.add('hidden');
      updateInventoryUI();
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
        town: townStartX + 260
      };
      man.x = Object.prototype.hasOwnProperty.call(destinations, region) ? destinations[region] : 210;
      man.y = groundAt(man.x) - man.height / 2;
      cameraX = Math.max(0, Math.min(worldEnd - width, man.x - width * .36));
      cameraY = Math.min(0, man.y - (groundY - man.height / 2));
    }
    man.vx = 0;
    man.vy = 0;
    man.grounded = true;
    man.hitTime = 0;
    setTeleportOpen(false);
  }

  function toggleShop() {
    if (!started || attack.active || attack.drawing) return;
    if (insideMountainMine) {
      if (mountainMineLevel !== 0 || mountainMineClimb || Math.abs(man.x - 105) > 125) return;
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
        Math.abs(man.x - cloakChestX()) < 125) {
        cloakChestOpened = true;
        cloakOwned = true;
        hasCloak = false;
        cloakStorageIndex = 0;
        cloakPickupTimer = 3.2;
        updateInventoryUI();
        return;
      }
      if (Math.abs(man.x - 90) > 120) return;
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
      if (mineLevel !== 0 || mineClimb || Math.abs(man.x - 105) > 125) return;
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
      const keeperX = width * .76;
      if (!shopkeeperFleeing && !shopkeeperReturning && !shopkeeperHidden &&
        Math.abs(man.x - keeperX) < 145) {
        shopPopupOpen = true;
        updateShopPopup();
        if (shopPopup) shopPopup.classList.remove('hidden');
        return;
      }
      if (Math.abs(man.x - 90) > 120) return;
      insideShop = false;
      man.x = shopReturnX;
      man.y = groundAt(man.x) - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = shopReturnCamera;
      cameraY = shopReturnCameraY;
      return;
    }
    if (Math.abs(man.x - mineX) < 145) {
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
    if (Math.abs(man.x - mountainEntranceX) < 150) {
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
      const distance = Math.abs(man.x - doorX);
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
      man.x = width * .32;
      man.y = groundY - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = 0;
      cameraY = 0;
      return;
    }
    const doorX = shopX + 74;
    if (Math.abs(man.x - doorX) > 135) return;
    insideShop = true;
    shopReturnX = man.x;
    shopReturnCamera = cameraX;
    shopReturnCameraY = cameraY;
    man.x = width * .32;
    man.y = groundAt(shopX) - man.height / 2;
    man.vx = 0;
    man.vy = 0;
    cameraX = 0;
    cameraY = 0;
  }

  function updateShopPopup() {
    const cost = 50 + sharpeningLevel * 25;
    const speedCost = 30 + speedLevel * 10;
    if (damageLabel) damageLabel.textContent = `CURRENT DAMAGE: ${bladeDamage}`;
    if (speedLabel) speedLabel.textContent = `CURRENT SPEED: ${lanceSpeed}`;
    if (upgradeButton) {
      upgradeButton.textContent = playtesting ? 'SHARPEN — FREE' : `SHARPEN — ${cost} SHAPES`;
    }
    if (speedButton) {
      speedButton.textContent = playtesting ? 'TUNE SPEED — FREE' : `TUNE SPEED — ${speedCost} SHAPES`;
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

  function buySpeed() {
    const cost = 30 + speedLevel * 10;
    if (!playtesting && shapes < cost) {
      if (speedButton) speedButton.textContent = `NEED ${cost - shapes} MORE SHAPES`;
      return;
    }
    if (!playtesting) shapes -= cost;
    speedLevel++;
    lanceSpeed += 10;
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
    started = false;
    paused = false;
    if (menuTitle) menuTitle.textContent = 'GAME OVER';
    if (playButton) playButton.textContent = 'RETRY';
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (healthHud) healthHud.classList.add('hidden');
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
    boulderTitleTimer = Math.max(0, boulderTitleTimer - dt);
    townTitleTimer = Math.max(0, townTitleTimer - dt);
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
        if (man.y >= floor || (wasGrounded && man.vy >= 0)) {
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
        if (man.y >= floor || (wasGrounded && man.vy >= 0)) {
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
          man.vy = -735; man.grounded = false; man.coyote = 0; man.jumpBuffer = 0;
        }
        if (!keys.jump && man.vy < -220) man.vy += 1350 * movementDt;
        man.vy += 1850 * movementDt;
        man.x += man.vx * movementDt; man.y += man.vy * movementDt;
        const floor = activeGroundAt(man.x) - man.height / 2;
        if (man.y >= floor || (wasGrounded && man.vy >= 0)) {
          man.y = floor; man.vy = 0; man.grounded = true;
        }
        else man.grounded = false;
      }
      man.runTime += Math.abs(man.vx) * movementDt * .038;
    }
    if (insideMountainMine) {
      updateMountainMine(worldDt);
      if (bossGateClosed && mountainMineLevel === 0) {
        man.x = Math.max(bossGateX + bossGateHalfWidth + man.width / 2, man.x);
      }
      if (mountainMineLevel === 0 && man.x >= bossRoomStartX - 100) {
        man.x = Math.min(bossRoomEndX - man.width / 2 - 14, man.x);
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
      man.x = Math.max(65, Math.min(width - 65, man.x));
      cameraX = 0;
      const interiorBaseY = groundY - man.height / 2;
      const interiorCameraTarget = playtesting ? man.y - interiorBaseY :
        Math.min(0, man.y - interiorBaseY);
      cameraY += (interiorCameraTarget - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    if (insideShop) {
      updateShopRaid(worldDt);
      man.x = Math.max(65, Math.min(width - 65, man.x));
      cameraX = 0;
      const interiorBaseY = groundY - man.height / 2;
      const interiorCameraTarget = playtesting ? man.y - interiorBaseY :
        Math.min(0, man.y - interiorBaseY);
      cameraY += (interiorCameraTarget - cameraY) * Math.min(1, worldDt * 3.5);
      return;
    }
    man.x = Math.max(cameraX + man.width, Math.min(worldEnd - man.width, man.x));
    const cameraTarget = Math.min(
      Math.max(0, man.x - width * .36),
      Math.max(0, worldEnd - width)
    );
    cameraX += (cameraTarget - cameraX) * Math.min(1, worldDt * 5);
    const basePlayerY = groundY - man.height / 2;
    const cameraYTarget = playtesting ? man.y - basePlayerY : Math.min(0, man.y - basePlayerY);
    cameraY += (cameraYTarget - cameraY) * Math.min(1, worldDt * 3.5);
    const inBoulderHills = man.x >= hillTopX - 90 && man.x < townStartX;
    if (inBoulderHills && !wasInBoulderHills) {
      boulderTitleTimer = 3.4;
    }
    wasInBoulderHills = inBoulderHills;
    const inTown = man.x >= townStartX && man.x < townEndX;
    if (inTown && !wasInTown) townTitleTimer = 3.4;
    wasInTown = inTown;

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

    enemies.forEach(enemy => {
      if (!enemy.alive) {
        const spawnScreenX = enemy.spawnX - cameraX;
        const spawnScreenY = groundAt(enemy.spawnX) - enemy.radius - cameraY;
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
          enemy.alive = true;
        }
        return;
      }
      // Circles that crossed the doorway now belong to the interior scene.
      if (enemy.inShop) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - worldDt);
      enemy.rollCooldown = Math.max(0, enemy.rollCooldown - worldDt);
      const sightX = enemy.x - cameraX;
      const sightY = groundAt(enemy.x) - enemy.radius - cameraY;
      const inSight = sightX + enemy.radius >= 0 && sightX - enemy.radius <= width &&
        sightY + enemy.radius >= 0 && sightY - enemy.radius <= height;
      if (!inSight) {
        enemy.aggro = 0;
        enemy.rollDirection = 0;
        enemy.rollCooldown = 0;
      }
      let pursuitDirection = Math.sign(man.x - enemy.x);
      const inAggroRange = inSight &&
        (Math.abs(man.x - enemy.x) < (enemy.rocky ? 1350 : 520) || enemy.aggro > .8);
      if (enemy.rocky && inAggroRange && !enemy.rollDirection && enemy.rollCooldown <= 0) {
        enemy.rollDirection = pursuitDirection || -1;
      }
      if (enemy.rocky && enemy.rollDirection) pursuitDirection = enemy.rollDirection;
      if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + worldDt * .85);
      else enemy.aggro = Math.max(0, enemy.aggro - worldDt * .45);
      if ((inAggroRange && (!enemy.rocky || enemy.rollCooldown <= 0)) ||
        (enemy.rocky && enemy.rollDirection)) {
        const step = pursuitDirection * 8;
        const downhill = step ? Math.max(0, (groundAt(enemy.x + step) - groundAt(enemy.x)) / 8) : 0;
        const pursuitSpeed = enemy.speed * (.65 + enemy.aggro * .55) *
          (enemy.rocky ? 1.15 + downhill * .8 : 1);
        enemy.x += pursuitDirection * pursuitSpeed * worldDt;
        enemy.rotation += pursuitDirection * pursuitSpeed * worldDt / enemy.radius;
        const rolledPast = enemy.rollDirection < 0 ? enemy.x < man.x : enemy.x > man.x;
        if (enemy.rocky && rolledPast && Math.abs(enemy.x - man.x) > 250) {
          enemy.rollDirection = 0;
          enemy.rollCooldown = 2.5;
        }
      }
      const enemyY = groundAt(enemy.x) - enemy.radius;
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
          if (!playtesting) {
            health--;
            updateHealth();
            if (health <= 0) gameOver();
          }
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
    limb(shoulderX, shoulderY + 3, leftElbowX, leftElbowY);
    limb(leftElbowX, leftElbowY, leftHandX, leftHandY);
    limb(shoulderX, shoulderY + 3, rightElbowX, rightElbowY);
    limb(rightElbowX, rightElbowY, rightHandX, rightHandY);

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
    ctx.restore();
  }

  function drawEnemyBody(enemy) {
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
      const y = groundAt(enemy.x) - enemy.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(enemy.rotation);
      drawEnemyBody(enemy);
      ctx.restore();
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
    if (Math.abs(man.x - (shopX + 74)) < 135) {
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

  function drawShopInterior() {
    ctx.fillStyle = '#d9b978';
    ctx.fillRect(0, 0, width, groundY);
    ctx.fillStyle = '#6f4529';
    ctx.fillRect(0, groundY, width, height - groundY);

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
    if (Math.abs(man.x - 90) < 120) {
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
      const keeperX = width * .76;
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

      if (Math.abs(man.x - keeperX) < 145) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.font = '900 25px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText('E  INTERACT', keeperX, keeperY - 82);
        ctx.fillText('E  INTERACT', keeperX, keeperY - 82);
        ctx.textAlign = 'start';
      }
    }

    if (shopDoorBroken) {
      const hatchX = width * .9;
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

  function drawTownHouseInterior() {
    const building = townBuildings[townHouseIndex] || townBuildings[0];
    ctx.fillStyle = building.color;
    ctx.fillRect(0, 0, width, groundY);
    ctx.fillStyle = '#3d342c';
    ctx.fillRect(0, groundY, width, height - groundY);
    ctx.strokeStyle = '#201d1a';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

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
    const windowX = width * .73;
    const windowY = Math.max(120, groundY - 205);
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
    ctx.moveTo(width * .38, 0);
    ctx.lineTo(width * .4, 73);
    ctx.lineTo(width * .36, 122);
    ctx.lineTo(width * .42, 181);
    ctx.lineTo(width * .39, 239);
    ctx.stroke();
    ctx.fillStyle = '#29231f';
    for (let i = 0; i < 6; i++) {
      const rubbleX = width * .46 + i * 31 + (townHouseIndex % 2) * 14;
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
        if (Math.abs(man.x - chestX) < 125) {
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
      ctx.font = `1000 ${Math.min(48, width * .065)}px Arial`;
      ctx.lineWidth = 9;
      ctx.strokeStyle = '#2d1a0e';
      ctx.fillStyle = '#d39a5d';
      ctx.strokeText('CLOAK FOUND', width / 2, height * .25);
      ctx.fillText('CLOAK FOUND', width / 2, height * .25);
      ctx.font = '900 20px Arial';
      ctx.fillStyle = '#fff';
      ctx.strokeText('PRESS Q TO EQUIP IT', width / 2, height * .25 + 42);
      ctx.fillText('PRESS Q TO EQUIP IT', width / 2, height * .25 + 42);
      ctx.restore();
    }

    if (Math.abs(man.x - 90) < 120) {
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
    if (Math.abs(man.x - mineX) < 145) {
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
      if (!mineClimb && Math.abs(man.x - shaft.x) < 75 &&
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
    if (mineLevel === 0 && Math.abs(man.x - 105) < 125) {
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
    if (Math.abs(man.x - mountainEntranceX) < 150) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.font = '900 24px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText('E  ENTER', entranceX, entranceY - 165);
      ctx.fillText('E  ENTER', entranceX, entranceY - 165);
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
      if (Math.abs(man.x - shaft.x) < 85 &&
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
    const roomRight = bossRoomEndX - cameraX;
    const roomFloor = mountainMineFloorAt(bossRoomStartX);
    ctx.fillStyle = '#303836';
    ctx.fillRect(roomLeft, roomFloor - bossRoomHeight, roomRight - roomLeft, bossRoomHeight);
    ctx.strokeStyle = '#707b77';
    ctx.lineWidth = 14;
    ctx.strokeRect(roomLeft, roomFloor - bossRoomHeight, roomRight - roomLeft, bossRoomHeight);
    ctx.strokeStyle = '#222927';
    ctx.lineWidth = 22;
    [bossRoomStartX + 145, bossRoomEndX - 145].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x - cameraX, roomFloor);
      ctx.lineTo(x - cameraX, roomFloor - bossRoomHeight + 85);
      ctx.stroke();
    });
    const gateScreenX = bossGateX - cameraX;
    ctx.strokeStyle = '#171a19';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(gateScreenX - bossGateHalfWidth, roomFloor);
    ctx.lineTo(gateScreenX - bossGateHalfWidth, roomFloor - bossRoomHeight + 18);
    ctx.moveTo(gateScreenX + bossGateHalfWidth, roomFloor);
    ctx.lineTo(gateScreenX + bossGateHalfWidth, roomFloor - bossRoomHeight + 18);
    ctx.stroke();
    if (bossGateClosed) {
      ctx.strokeStyle = '#68706d';
      ctx.lineWidth = 8;
      for (const offset of [-27, -9, 9, 27]) {
        ctx.beginPath();
        ctx.moveTo(gateScreenX + offset, roomFloor - bossRoomHeight + 30);
        ctx.lineTo(gateScreenX + offset, roomFloor);
        ctx.stroke();
      }
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(gateScreenX - 35, roomFloor - bossRoomHeight * .72);
      ctx.lineTo(gateScreenX + 35, roomFloor - bossRoomHeight * .72);
      ctx.moveTo(gateScreenX - 35, roomFloor - bossRoomHeight * .28);
      ctx.lineTo(gateScreenX + 35, roomFloor - bossRoomHeight * .28);
      ctx.stroke();
    }

    const exitFloor = mountainMineFloorAt(105, 0);
    ctx.fillStyle = '#090c0b';
    ctx.strokeStyle = '#795330';
    ctx.lineWidth = 9;
    ctx.fillRect(40 - cameraX, exitFloor - 150, 130, 150);
    ctx.strokeRect(40 - cameraX, exitFloor - 150, 130, 150);
    if (Math.abs(man.x - 105) < 125) {
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
    const red = Math.round(32 + boss.aggro * 205);
    const green = Math.round(145 - boss.aggro * 102);
    const blue = Math.round(73 - boss.aggro * 39);
    ctx.strokeStyle = boss.hitFlash > 0 ? '#fff' : `rgb(${red}, ${green}, ${blue})`;
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
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(drop.x - cameraX, drop.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
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
    if (!mountainBoss.alive || man.x < bossRoomStartX - 420) return;
    const barWidth = Math.min(720, width - 70);
    const barHeight = 30;
    const x = (width - barWidth) / 2;
    const y = 68;
    const healthRatio = Math.max(0, mountainBoss.health / mountainBoss.maxHealth);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '1000 34px Arial';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#fff';
    ctx.strokeText('RADIUS', width / 2, y - 18);
    ctx.fillText('RADIUS', width / 2, y - 18);
    ctx.fillStyle = '#171b1a';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#d12e2e';
    ctx.fillRect(x + 4, y + 4, (barWidth - 8) * healthRatio, barHeight - 8);
    ctx.font = '900 17px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.max(0, mountainBoss.health)} / ${mountainBoss.maxHealth}`, width / 2, y + 22);
    ctx.restore();
  }

  function drawMountainBossEffects() {
    bossProjectiles.forEach(projectile => {
      ctx.strokeStyle = projectile.hitFlash > 0 ? '#fff' : '#11823b';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(projectile.x - cameraX, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    bossParticles.forEach(particle => {
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = particle.green ? '#11823b' : '#b92626';
      ctx.beginPath();
      ctx.arc(particle.x - cameraX, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    bossDamagePopups.forEach(popup => {
      ctx.globalAlpha = Math.min(1, popup.life * 2.5);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 6;
      ctx.font = 'italic 1000 42px Arial';
      ctx.textAlign = 'center';
      ctx.strokeText(`-${popup.damage}`, popup.x - cameraX, popup.y);
      ctx.fillText(`-${popup.damage}`, popup.x - cameraX, popup.y);
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

    townBuildings.forEach((building, index) => {
      const x = townX + building.offset;
      if (x > width + 500 || x + building.width < -500) return;
      const top = groundY - building.height;
      ctx.fillStyle = building.color;
      ctx.strokeStyle = '#262321';
      ctx.lineWidth = 7;
      ctx.fillRect(x, top, building.width, building.height);
      ctx.strokeRect(x, top, building.width, building.height);

      // Uneven, partially collapsed roofline.
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
      if (Math.abs(man.x - doorWorldX) < 135) {
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

  function draw() {
    ctx.fillStyle = '#78c9f4'; ctx.fillRect(0, 0, width, height);
    if (insideMountainMine) {
      ctx.save();
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
      drawMountainBossEffects();
      drawAttackPath();
      drawBlade();
      drawMan();
      ctx.restore();
      drawBossHealthBar();
      return;
    }
    if (insideMine) {
      ctx.save();
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
      drawMan();
      ctx.restore();
      return;
    }
    if (insideTownHouse) {
      ctx.save();
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
      drawMan();
      ctx.restore();
      return;
    }
    if (insideShop) {
      ctx.save();
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
      drawMan();
      ctx.restore();
      return;
    }
    ctx.save();
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
    ctx.fillStyle = '#58a84f';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, groundAt(cameraX));
    for (let x = 20; x <= groundWidth; x += 20) ctx.lineTo(x, groundAt(cameraX + x));
    ctx.lineTo(groundWidth, groundAt(cameraX + groundWidth));
    ctx.lineTo(groundWidth, height);
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

    // Small marks in the grass make the endless ground's movement readable.
    ctx.strokeStyle = '#3e913e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const spacing = 125;
    const offset = -(cameraX % spacing);
    for (let x = offset - spacing; x < groundWidth; x += spacing) {
      const variation = Math.abs(Math.floor((x + cameraX) / spacing) % 3);
      const y = groundAt(cameraX + x) + 42 + variation * 24;
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + 7, y - 3);
      ctx.moveTo(x + 7, y - 3);
      ctx.lineTo(x + 14, y + 8);
      ctx.stroke();
    }
    drawMountain();
    drawAbandonedTown();
    drawMineEntrance();
    if (attack.drawing) {
      ctx.fillStyle = 'rgba(4, 12, 20, .58)';
      ctx.fillRect(0, cameraY, width, height);
    }
    drawShop();
    drawEnemies();
    drawDoorDebris();
    drawDropsAndSplats();
    drawAttackPath();
    drawBlade();
    drawMan();
    ctx.restore();
    drawBoulderTitle();
    drawTownTitle();
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
    if (insideShop || insideTownHouse) {
      return { x: screenX, y: Math.min(groundY, screenY + cameraY) };
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
    const manScreenX = (insideShop || insideTownHouse) ? man.x : man.x - cameraX;
    const manScreenY = man.y - cameraY;
    if (Math.hypot(event.clientX - manScreenX, event.clientY - manScreenY) > 76) return;
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

  function finishAttack() {
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
  canvas.addEventListener('pointercancel', finishAttack);
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
      canvas.setAttribute('tabindex', '0');
      canvas.focus();
    });
  }
  if (pauseButton) pauseButton.addEventListener('click', pauseGame);
  let inventoryDragActive = false;
  const allInventorySlots = (armorSlot ? [armorSlot] : []).concat(storageSlots);
  allInventorySlots.forEach(slot => {
    slot.addEventListener('dragstart', event => {
      if (!slot.classList.contains('occupied')) {
        event.preventDefault();
        return;
      }
      inventoryDragActive = true;
      slot.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'brown-cloak');
    });
    slot.addEventListener('dragend', () => {
      inventoryDragActive = false;
      allInventorySlots.forEach(item => item.classList.remove('dragging', 'drag-target'));
    });
    slot.addEventListener('dragover', event => {
      if (!inventoryDragActive) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      slot.classList.add('drag-target');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-target'));
    slot.addEventListener('drop', event => {
      if (!inventoryDragActive || !cloakOwned) return;
      event.preventDefault();
      if (slot === armorSlot) {
        hasCloak = true;
      } else {
        hasCloak = false;
        dashTime = 0;
        cloakStorageIndex = Number(slot.dataset.storageSlot);
      }
      inventoryDragActive = false;
      allInventorySlots.forEach(item => item.classList.remove('dragging', 'drag-target'));
      updateInventoryUI();
    });
    slot.addEventListener('click', () => {
      if (!slot.classList.contains('occupied')) return;
      if (slot === armorSlot) {
        hasCloak = false;
        dashTime = 0;
      } else {
        hasCloak = true;
      }
      updateInventoryUI();
    });
  });
  teleportButtons.forEach(button => {
    button.addEventListener('click', () => teleportTo(button.dataset.teleport));
  });
  if (upgradeButton) upgradeButton.addEventListener('click', buySharpening);
  if (speedButton) speedButton.addEventListener('click', buySpeed);
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
