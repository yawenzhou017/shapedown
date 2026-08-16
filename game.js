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
  if (playtestToggle) playtestToggle.checked = false;
  const keys = { left: false, right: false, jump: false, down: false };
  const worldEnd = 3200;
  const shopX = worldEnd - 400;
  // If an older cached page is missing the menu, never leave the game frozen.
  let started = !mainMenu || !playButton;
  let paused = false;
  let health = 3;
  let shapes = 0;
  let playtesting = false;
  let insideShop = false, shopReturnX = 0, shopReturnCamera = 0;
  let width = 0, height = 0, ratio = 1, groundY = 0, lastTime = 0, cameraX = 0;
  let enemies = [], nextEnemyX = 650, splats = [], shapeDrops = [], damagePopups = [];
  const attack = {
    drawing: false, active: false, path: [], index: 0, visible: 0,
    length: 0, maxLength: 900, intersections: 0, spin: 0, kills: 0, id: 0,
    bladeX: 0, bladeY: 0, bladeAngle: 0, thrown: false, landed: false,
    throwVx: 0, throwVy: 0, throwTime: 0, directionCharge: 0,
    lastDirX: 1, lastDirY: 0, comboTriggered: false
  };
  const combo = { timer: 0, slowTime: 0, zoomTime: 0, zoomDuration: .85 };
  const man = {
    x: 210, y: 0, vx: 0, vy: 0, width: 46, height: 108,
    grounded: true, coyote: 0, jumpBuffer: 0, runTime: 0, idleTime: 0,
    facing: 1, hitTime: 0
  };

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
    shapes = 0;
    cameraX = 0;
    enemies = [];
    splats = [];
    shapeDrops = [];
    damagePopups = [];
    insideShop = false;
    nextEnemyX = 650;
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
    combo.timer = 0;
    combo.slowTime = 0;
    combo.zoomTime = 0;
    keys.left = keys.right = keys.jump = keys.down = false;
    Object.assign(man, {
      x: 210, y: groundY - man.height / 2, vx: 0, vy: 0,
      grounded: true, coyote: 0, jumpBuffer: 0, hitTime: 0
    });
    document.body.classList.remove('targeting');
    if (comboHud) comboHud.classList.add('hidden');
    updateHealth();
    updateShapes();
  }

  function pauseGame() {
    if (!started) return;
    started = false;
    paused = true;
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
      insideShop = false;
      man.x = shopReturnX;
      man.y = groundY - man.height / 2;
      man.vx = 0;
      man.vy = 0;
      cameraX = shopReturnCamera;
      return;
    }
    const doorX = shopX + 74;
    if (Math.abs(man.x - doorX) > 135) return;
    insideShop = true;
    shopReturnX = man.x;
    shopReturnCamera = cameraX;
    man.x = width * .32;
    man.y = groundY - man.height / 2;
    man.vx = 0;
    man.vy = 0;
    cameraX = 0;
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
    if (man.grounded || man.y === 0) man.y = groundY - man.height / 2;
  }

  function update(dt) {
    if (!started) return;
    if (combo.timer > 0) {
      combo.timer = Math.max(0, combo.timer - dt);
      if (combo.timer === 0 && comboHud) comboHud.classList.add('hidden');
    }
    combo.slowTime = Math.max(0, combo.slowTime - dt);
    combo.zoomTime = Math.max(0, combo.zoomTime - dt);
    const movementDt = combo.slowTime > 0 ? dt * .22 : dt;
    const worldDt = attack.drawing ? dt * .16 : movementDt;
    man.idleTime += movementDt;
    man.hitTime = Math.max(0, man.hitTime - worldDt);
    attack.visible = Math.max(0, attack.visible - dt);
    const bladeAttackingThisFrame = attack.active;
    if (attack.active) {
      if (attack.thrown) {
        attack.throwVy += 1250 * dt;
        attack.bladeX += attack.throwVx * dt;
        attack.bladeY += attack.throwVy * dt;
        attack.bladeAngle = Math.atan2(attack.throwVy, attack.throwVx);
        attack.throwTime -= dt;
        const tipY = attack.bladeY + Math.sin(attack.bladeAngle) * 96;
        const hitGround = attack.bladeX <= worldEnd && tipY >= groundY;
        const bladeScreenX = attack.bladeX - cameraX;
        const outsideView = bladeScreenX < -220 || bladeScreenX > width + 220 ||
          attack.bladeY < -220 || attack.bladeY > height + 220;
        if (hitGround) {
          attack.bladeY -= tipY - groundY;
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
        let travel = 560 * dt;
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
          const throwSpeed = 560;
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
        man.y = Math.max(man.height / 2, Math.min(groundY - man.height / 2, man.y));
      } else {
        man.vx *= Math.pow(man.grounded ? .0004 : .06, worldDt);
        man.vy += 1850 * worldDt;
        man.x += man.vx * worldDt;
        man.y += man.vy * worldDt;
        const floor = groundY - man.height / 2;
        if (man.y >= floor) { man.y = floor; man.vy = 0; man.grounded = true; }
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
        man.y = Math.max(man.height / 2, Math.min(groundY - man.height / 2, man.y));
        man.grounded = false;
        man.coyote = 0;
        man.jumpBuffer = 0;
      } else {
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
        const floor = groundY - man.height / 2;
        if (man.y >= floor) { man.y = floor; man.vy = 0; man.grounded = true; }
        else man.grounded = false;
      }
      man.runTime += Math.abs(man.vx) * movementDt * .038;
    }
    if (insideShop) {
      man.x = Math.max(65, Math.min(width - 65, man.x));
      cameraX = 0;
      return;
    }
    man.x = Math.max(cameraX + man.width, Math.min(worldEnd - man.width, man.x));
    const cameraTarget = Math.min(
      Math.max(0, man.x - width * .36),
      Math.max(0, worldEnd - width)
    );
    cameraX += (cameraTarget - cameraX) * Math.min(1, worldDt * 5);

    const enemySpawnLimit = Math.min(cameraX + width + 500, shopX - 180);
    while (nextEnemyX < enemySpawnLimit) {
      enemies.push({
        x: nextEnemyX,
        radius: 34,
        speed: 28 + Math.random() * 34,
        rotation: 0,
        aggro: 0,
        health: 3,
        bladeTouching: false,
        lastComboAttack: -1,
        hitFlash: 0,
        alive: true
      });
      nextEnemyX += 470 + Math.random() * 360;
    }

    enemies.forEach(enemy => {
      if (!enemy.alive) return;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - worldDt);
      const pursuitDirection = Math.sign(man.x - enemy.x);
      const inAggroRange = Math.abs(man.x - enemy.x) < 520;
      if (inAggroRange) enemy.aggro = Math.min(1, enemy.aggro + worldDt * .85);
      else enemy.aggro = Math.max(0, enemy.aggro - worldDt * .45);
      const pursuitSpeed = enemy.speed * (.55 + enemy.aggro * .75);
      enemy.x += pursuitDirection * pursuitSpeed * worldDt;
      enemy.x = Math.min(shopX - 100, enemy.x);
      enemy.rotation += pursuitDirection * pursuitSpeed * worldDt / enemy.radius;

      const enemyY = groundY - enemy.radius;
      const horizontal = Math.abs(man.x - enemy.x) < man.width / 2 + enemy.radius - 3;
      const vertical = man.y + man.height / 2 > enemyY - enemy.radius &&
        man.y - man.height / 2 < enemyY + enemy.radius;
      const bladeHit = bladeAttackingThisFrame &&
        Math.hypot(attack.bladeX - enemy.x, attack.bladeY - enemyY) < enemy.radius + 58;

      if (bladeHit && !enemy.bladeTouching) {
        if (enemy.lastComboAttack !== attack.id) {
          enemy.lastComboAttack = attack.id;
          attack.kills++;
        }
        const damage = 1;
        enemy.health -= damage;
        enemy.hitFlash = .16;
        damagePopups.push({ x: enemy.x, y: enemyY - enemy.radius - 12, vy: -55, life: .75, damage });
        if (enemy.health <= 0) {
          enemy.alive = false;
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
    enemies = enemies.filter(enemy => enemy.alive && enemy.x > cameraX - 150);

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
      if (drop.y > groundY - 16) { drop.y = groundY - 16; drop.vy = 0; drop.vx *= .85; }
      if (Math.hypot(man.x - drop.x, man.y - drop.y) < 72) {
        drop.collected = true;
        shapes++;
        updateShapes();
      }
    });
    shapeDrops = shapeDrops.filter(drop => !drop.collected && drop.x > cameraX - 150);
    if (!attack.drawing && !attack.active && attack.visible <= 0) attack.path = [];
  }

  function limb(x1, y1, x2, y2, thickness = 6) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness; ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.stroke();
  }

  function drawMan() {
    const x = man.x - cameraX, y = man.y;
    const speed = Math.min(1, Math.abs(man.vx) / 270);
    const moving = Math.abs(man.vx) > 8;
    let legs = moving && man.grounded ? Math.sin(man.runTime) * 20 * speed : 0;
    let arms = moving && man.grounded ? Math.sin(man.runTime + Math.PI) * 18 * speed : 0;
    let bounce = moving && man.grounded ? Math.abs(Math.sin(man.runTime)) * 2.5 : Math.sin(man.idleTime * 3) * 1.2;
    if (!man.grounded) {
      legs = man.vy < 0 ? 11 : -7; arms = -13;
    }
    const lean = man.facing * speed * 5;
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

    const leftHandX = x - man.facing * 13 + arms * man.facing;
    const rightHandX = x + man.facing * 15 - arms * man.facing;
    const leftElbowX = (shoulderX + leftHandX) / 2 - 5 * man.facing;
    const rightElbowX = (shoulderX + rightHandX) / 2 + 5 * man.facing;
    limb(shoulderX, shoulderY + 3, leftElbowX, y - 1 - bounce);
    limb(leftElbowX, y - 1 - bounce, leftHandX, y + 7 - bounce);
    limb(shoulderX, shoulderY + 3, rightElbowX, y - 3 - bounce);
    limb(rightElbowX, y - 3 - bounce, rightHandX, y + 4 - bounce);

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
      const x = enemy.x - cameraX;
      const y = groundY - enemy.radius;
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
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeRect(-10, -10, 20, 20);
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
    const baseY = groundY;
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

    ctx.fillStyle = '#111';
    ctx.fillRect(x + 38, baseY - 132, 72, 132);
    ctx.fillStyle = '#78c9f4';
    ctx.fillRect(x + 164, baseY - 150, 91, 94);
    ctx.strokeRect(x + 164, baseY - 150, 91, 94);
    ctx.fillStyle = '#111';
    ctx.font = '900 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SHOP', x + 150, baseY - 225);

    // Stickman shopkeeper inside the window.
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
    ctx.fillStyle = '#8c5c35';
    for (let x = 0; x < width; x += 90) ctx.fillRect(x, groundY, 5, height - groundY);

    ctx.fillStyle = '#4a2c1c';
    ctx.fillRect(width * .62, groundY - 122, width * .3, 122);
    ctx.fillStyle = '#efcf91';
    ctx.fillRect(width * .62, groundY - 122, width * .3, 18);
    ctx.fillStyle = '#111';
    ctx.font = '900 34px Arial';
    ctx.fillText('SHAPE SHOP', 44, 64);
    ctx.font = '700 20px Arial';
    ctx.fillText('E  EXIT', 48, 102);

    const keeperX = width * .76;
    const keeperY = groundY - 180;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(keeperX, keeperY - 35, 16, 0, Math.PI * 2);
    ctx.moveTo(keeperX, keeperY - 19);
    ctx.lineTo(keeperX, keeperY + 34);
    ctx.moveTo(keeperX, keeperY - 5);
    ctx.lineTo(keeperX - 28, keeperY + 15);
    ctx.moveTo(keeperX, keeperY - 5);
    ctx.lineTo(keeperX + 28, keeperY + 15);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(width * .68 + i * 58, groundY - 90);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#ffd23f';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.fillRect(-10, -10, 20, 20);
      ctx.strokeRect(-10, -10, 20, 20);
      ctx.restore();
    }
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
    if (!attack.active && combo.zoomTime <= 0) return;
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
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-bladeScreenX, -attack.bladeY);
    }
    const groundWidth = Math.max(0, Math.min(width, worldEnd - cameraX));
    ctx.fillStyle = '#58a84f'; ctx.fillRect(0, groundY, groundWidth, height - groundY);
    ctx.fillStyle = '#2f7d3b'; ctx.fillRect(0, groundY, groundWidth, 11);

    // Small marks in the grass make the endless ground's movement readable.
    ctx.strokeStyle = '#3e913e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const spacing = 125;
    const offset = -(cameraX % spacing);
    for (let x = offset - spacing; x < groundWidth; x += spacing) {
      const variation = Math.abs(Math.floor((x + cameraX) / spacing) % 3);
      const y = groundY + 42 + variation * 24;
      ctx.beginPath();
      ctx.moveTo(x, y + 8);
      ctx.lineTo(x + 7, y - 3);
      ctx.moveTo(x + 7, y - 3);
      ctx.lineTo(x + 14, y + 8);
      ctx.stroke();
    }
    if (attack.drawing) {
      ctx.fillStyle = 'rgba(4, 12, 20, .58)';
      ctx.fillRect(0, 0, width, height);
    }
    drawEnemies();
    drawDropsAndSplats();
    drawShop();
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
    return {
      x: Math.min(worldEnd, screenX + cameraX),
      y: Math.min(groundY, screenY)
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
    if (Math.hypot(event.clientX - manScreenX, event.clientY - man.y) > 76) return;
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
    if (!playtesting && attack.intersections + crossings > 3) return;
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
      const firstTarget = attack.path[1];
      const firstDistance = Math.hypot(firstTarget.x - attack.bladeX, firstTarget.y - attack.bladeY) || 1;
      attack.lastDirX = (firstTarget.x - attack.bladeX) / firstDistance;
      attack.lastDirY = (firstTarget.y - attack.bladeY) / firstDistance;
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
  addEventListener('blur', () => { keys.left = keys.right = keys.jump = keys.down = false; });
  addEventListener('resize', resize);
  resize(); requestAnimationFrame(frame);
})();
