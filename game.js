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
  if (playtestToggle) playtestToggle.checked = false;
  const keys = { left: false, right: false, jump: false, down: false };
  const worldEnd = 4300;
  const shopX = 2500;
  const hillStart = shopX + 340;
  // If an older cached page is missing the menu, never leave the game frozen.
  let started = !mainMenu || !playButton;
  let paused = false;
  let health = 3;
  let shapes = 0;
  let bladeDamage = 1, sharpeningLevel = 0, lanceSpeed = 430, speedLevel = 0, shopPopupOpen = false;
  let playtesting = false;
  let insideShop = false, shopReturnX = 0, shopReturnCamera = 0, shopReturnCameraY = 0;
  let shopDoorBroken = false, shopkeeperFleeing = false, shopkeeperHidden = false;
  let shopkeeperFleeX = 0, shopkeeperFleeY = 0, doorDebris = [];
  let width = 0, height = 0, ratio = 1, groundY = 0, lastTime = 0, cameraX = 0, cameraY = 0;
  let enemies = [], nextEnemyX = 650, hillNextEnemyX = hillStart + 260;
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

  function groundAt(worldX) {
    const climb = Math.max(0, Math.min(175, (worldX - hillStart) * .12));
    return groundY - climb;
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
    return {
      x, spawnX: x, zone, radius: 34, speed: 65 + Math.random() * 35,
      rotation: 0, aggro: 0, health: 3, bladeTouching: false,
      lastComboAttack: -1, hitFlash: 0, respawnTimer: 0, alive: true,
      inShop: false, shopX: 0
    };
  }

  function breakShopDoor() {
    if (shopDoorBroken) return;
    shopDoorBroken = true;
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
    if (!shopkeeperFleeing && !shopkeeperHidden) {
      shopkeeperFleeing = true;
      // Begin at the shopkeeper's actual interior position so there is no teleport.
      shopkeeperFleeX = width * .76;
      shopkeeperFleeY = 0;
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

    // While the player is inside, the nearest outside circle attacks the entrance.
    if (closestOutside) {
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
      const direction = Math.sign(man.x - enemy.shopX) || 1;
      const speed = enemy.speed * 1.25;
      enemy.shopX += direction * speed * dt;
      enemy.shopX = Math.max(enemy.radius, Math.min(width - enemy.radius, enemy.shopX));
      enemy.rotation += direction * speed * dt / enemy.radius;
      enemy.aggro = Math.min(1, enemy.aggro + dt * 1.5);
      const enemyY = groundY - enemy.radius;
      const horizontal = Math.abs(man.x - enemy.shopX) < man.width / 2 + enemy.radius - 3;
      const vertical = man.y + man.height / 2 > enemyY - enemy.radius &&
        man.y - man.height / 2 < enemyY + enemy.radius;
      if (horizontal && vertical && man.hitTime <= 0) {
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

    if (shopkeeperFleeing) {
      const hatchX = width * .9;
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
    shopDoorBroken = false;
    shopkeeperFleeing = false;
    shopkeeperHidden = false;
    shopkeeperFleeX = 0;
    shopkeeperFleeY = 0;
    doorDebris = [];
    shopPopupOpen = false;
    nextEnemyX = 650;
    hillNextEnemyX = hillStart + 260;
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
    keys.left = keys.right = keys.jump = keys.down = false;
    Object.assign(man, {
      x: 210, y: groundAt(210) - man.height / 2, vx: 0, vy: 0,
      grounded: true, coyote: 0, jumpBuffer: 0, hitTime: 0, throwTime: 0, throwAngle: 0
    });
    document.body.classList.remove('targeting');
    if (shopPopup) shopPopup.classList.add('hidden');
    if (comboHud) comboHud.classList.add('hidden');
    updateHealth();
    updateShapes();
  }

  function pauseGame() {
    if (!started) return;
    started = false;
    paused = true;
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

  function toggleShop() {
    if (!started || attack.active || attack.drawing) return;
    if (insideShop) {
      if (shopPopupOpen) {
        shopPopupOpen = false;
        if (shopPopup) shopPopup.classList.add('hidden');
        return;
      }
      const keeperX = width * .76;
      if (!shopkeeperFleeing && !shopkeeperHidden && Math.abs(man.x - keeperX) < 145) {
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
    if (man.grounded || man.y === 0) man.y = groundAt(man.x) - man.height / 2;
  }

  function update(dt) {
    if (!started) return;
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
        const bladeGround = groundAt(attack.bladeX);
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

    if (attack.drawing) {
      // Controls are disabled, but existing momentum and gravity continue in slow motion.
      if (playtesting) {
        man.x += man.vx * worldDt;
        man.y += man.vy * worldDt;
        man.vx *= Math.pow(.12, worldDt);
        man.vy *= Math.pow(.12, worldDt);
        man.y = Math.max(man.height / 2, Math.min(groundAt(man.x) - man.height / 2, man.y));
      } else {
        const wasGrounded = man.grounded;
        man.vx *= Math.pow(man.grounded ? .0004 : .06, worldDt);
        man.vy += 1850 * worldDt;
        man.x += man.vx * worldDt;
        man.y += man.vy * worldDt;
        const floor = groundAt(man.x) - man.height / 2;
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
        man.y = Math.max(man.height / 2, Math.min(groundAt(man.x) - man.height / 2, man.y));
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
          man.vy = -700; man.grounded = false; man.coyote = 0; man.jumpBuffer = 0;
        }
        if (!keys.jump && man.vy < -220) man.vy += 1350 * movementDt;
        man.vy += 1850 * movementDt;
        man.x += man.vx * movementDt; man.y += man.vy * movementDt;
        const floor = groundAt(man.x) - man.height / 2;
        if (man.y >= floor || (wasGrounded && man.vy >= 0)) {
          man.y = floor; man.vy = 0; man.grounded = true;
        }
        else man.grounded = false;
      }
      man.runTime += Math.abs(man.vx) * movementDt * .038;
    }
    if (insideShop) {
      updateShopRaid(worldDt);
      man.x = Math.max(65, Math.min(width - 65, man.x));
      cameraX = 0;
      cameraY = 0;
      return;
    }
    man.x = Math.max(cameraX + man.width, Math.min(worldEnd - man.width, man.x));
    const cameraTarget = Math.min(
      Math.max(0, man.x - width * .36),
      Math.max(0, worldEnd - width)
    );
    cameraX += (cameraTarget - cameraX) * Math.min(1, worldDt * 5);
    const basePlayerY = groundY - man.height / 2;
    const cameraYTarget = Math.min(0, man.y - basePlayerY);
    cameraY += (cameraYTarget - cameraY) * Math.min(1, worldDt * 3.5);

    const enemySpawnLimit = Math.min(cameraX + width + 500, shopX - 520);
    while (nextEnemyX < enemySpawnLimit) {
      enemies.push(makeEnemy(nextEnemyX, 'before'));
      nextEnemyX += 470 + Math.random() * 360;
    }
    const hillEnemyLimit = Math.min(cameraX + width + 500, worldEnd - 180);
    while (hillNextEnemyX < hillEnemyLimit) {
      enemies.push(makeEnemy(hillNextEnemyX, 'hill'));
      hillNextEnemyX += 390 + Math.random() * 250;
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
          enemy.alive = true;
        }
        return;
      }
      // Circles that crossed the doorway now belong to the interior scene.
      if (enemy.inShop) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - worldDt);
      const pursuitDirection = Math.sign(man.x - enemy.x);
      const inAggroRange = Math.abs(man.x - enemy.x) < 520;
      if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + worldDt * .85);
      else enemy.aggro = Math.max(0, enemy.aggro - worldDt * .45);
      if (inAggroRange) {
        const pursuitSpeed = enemy.speed * (.65 + enemy.aggro * .55);
        enemy.x += pursuitDirection * pursuitSpeed * worldDt;
        enemy.rotation += pursuitDirection * pursuitSpeed * worldDt / enemy.radius;
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
      particle.x += particle.vx * worldDt;
      particle.y += particle.vy * worldDt;
      particle.vy += 900 * worldDt;
      particle.life -= worldDt;
    });
    splats = splats.filter(particle => particle.life > 0);

    damagePopups.forEach(popup => {
      popup.y += popup.vy * worldDt;
      popup.life -= worldDt;
    });
    damagePopups = damagePopups.filter(popup => popup.life > 0);

    shapeDrops.forEach(drop => {
      if (drop.collected) return;
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
    shapeDrops = shapeDrops.filter(drop => !drop.collected && drop.x > cameraX - 150);

    doorDebris.forEach(piece => {
      piece.x += piece.vx * worldDt;
      piece.y += piece.vy * worldDt;
      piece.vy += 900 * worldDt;
      piece.rotation += piece.spin * worldDt;
      piece.life -= worldDt;
    });
    doorDebris = doorDebris.filter(piece => piece.life > 0);
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

  function drawEnemies() {
    enemies.forEach(enemy => {
      if (!enemy.alive || enemy.inShop) return;
      const x = enemy.x - cameraX;
      const y = groundAt(enemy.x) - enemy.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(enemy.rotation);
      const red = Math.round(17 + (225 - 17) * enemy.aggro);
      const green = Math.round(130 + (42 - 130) * enemy.aggro);
      const blue = Math.round(59 + (42 - 59) * enemy.aggro);
      ctx.strokeStyle = enemy.hitFlash > 0 ? '#ffffff' : `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawDropsAndSplats() {
    splats.forEach(particle => {
      ctx.globalAlpha = Math.min(1, particle.life * 2);
      ctx.fillStyle = '#df3030';
      ctx.beginPath();
      ctx.arc(particle.x - cameraX, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    shapeDrops.forEach(drop => {
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
    ctx.fillStyle = '#3a2518';
    ctx.fillRect(x + 20, baseY, 108, 14);
    ctx.fillStyle = '#78c9f4';
    ctx.fillRect(x + 164, baseY - 150, 91, 94);
    ctx.strokeRect(x + 164, baseY - 150, 91, 94);
    // Stickman shopkeeper inside the window until the raid begins.
    if (!shopDoorBroken && !shopkeeperFleeing && !shopkeeperHidden) {
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
    if (!shopkeeperFleeing && !shopkeeperHidden) {
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
      ctx.fillStyle = shopkeeperHidden ? '#3b281c' : '#080808';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(hatchX, groundY - 3, 48, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (shopkeeperHidden) {
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

    if (shopkeeperFleeing) {
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

    drawInteriorEnemies();
  }

  function drawInteriorEnemies() {
    enemies.forEach(enemy => {
      if (!enemy.alive || !enemy.inShop) return;
      ctx.save();
      ctx.translate(enemy.shopX, groundY - enemy.radius);
      ctx.rotate(enemy.rotation);
      const red = Math.round(17 + (225 - 17) * enemy.aggro);
      const green = Math.round(130 + (42 - 130) * enemy.aggro);
      const blue = Math.round(59 + (42 - 59) * enemy.aggro);
      ctx.strokeStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.stroke();
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

  function draw() {
    ctx.fillStyle = '#78c9f4'; ctx.fillRect(0, 0, width, height);
    if (insideShop) {
      drawShopInterior();
      drawMan();
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
    if (event.key === 'Escape') {
      event.preventDefault();
      pauseGame();
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

  canvas.addEventListener('pointerdown', event => {
    if (!started || insideShop || attack.active) return;
    const manScreenX = man.x - cameraX;
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
  resize(); requestAnimationFrame(frame);
})();
