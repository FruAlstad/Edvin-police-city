import * as THREE from "three";

const DISTRICT_INTERVAL_MS = 10_000;
const CITY_SIZE = 48;
const BLOCK = 6;

const DISTRICTS = [
  {
    name: "Downtown",
    sky: 0x0b1528,
    fog: 0x13253f,
    ground: 0x1a2438,
    building: [0x1a2f4a, 0x243a58, 0x152438],
    accent: 0x4a90ff,
    light: 0x6aa8ff,
    height: [4, 18],
  },
  {
    name: "Hamnen",
    sky: 0x0a1824,
    fog: 0x123040,
    ground: 0x0f2a34,
    building: [0x153848, 0x1a4050, 0x0d2430],
    accent: 0x3ecfcf,
    light: 0x5ee0e0,
    height: [2, 9],
  },
  {
    name: "Industri",
    sky: 0x1a1410,
    fog: 0x2a2218,
    ground: 0x221c14,
    building: [0x3a3020, 0x4a3824, 0x2a2218],
    accent: 0xd4923a,
    light: 0xffb060,
    height: [3, 12],
  },
  {
    name: "Neon District",
    sky: 0x12081a,
    fog: 0x1a0e28,
    ground: 0x140818,
    building: [0x2a1438, 0x241030, 0x1a0a22],
    accent: 0xff2880,
    light: 0x40dcff,
    height: [5, 16],
  },
  {
    name: "Förorten",
    sky: 0x1a2438,
    fog: 0x243048,
    ground: 0x2a3448,
    building: [0x3a4458, 0x364050, 0x222c3c],
    accent: 0xc8a064,
    light: 0xffd090,
    height: [1.5, 5],
  },
  {
    name: "Gamla stan",
    sky: 0x1c1410,
    fog: 0x2a1e18,
    ground: 0x2e2014,
    building: [0x4a3420, 0x523828, 0x3a2818],
    accent: 0xdc8c3c,
    light: 0xffc070,
    height: [2.5, 8],
  },
];

const CATALOG = {
  sweaters: [
    { id: "black-hoodie", name: "Black Hoodie", desc: "Classic street look", color: 0x1a1a1e, accent: 0x333338 },
    { id: "red-sweater", name: "Red Sweater", desc: "Bold knit", color: 0xa11818, accent: 0xc43a3a },
    { id: "striped-knit", name: "Striped Knit", desc: "Black & gray stripes", color: 0x2c3038, accent: 0x8a909c },
    { id: "camo-pullover", name: "Camo Pullover", desc: "Urban camo", color: 0x3a4530, accent: 0x6a7850 },
    { id: "neon-crew", name: "Neon Crew", desc: "Night-run vibes", color: 0x1a0a28, accent: 0xff2a8a },
  ],
  pants: [
    { id: "dark-jeans", name: "Dark Jeans", desc: "Slim fit denim", color: 0x1c2438 },
    { id: "cargo-pants", name: "Cargo Pants", desc: "Extra pockets", color: 0x4a4535 },
    { id: "track-pants", name: "Track Pants", desc: "Fast getaway", color: 0x101418, accent: 0xe11d2e },
    { id: "suit-pants", name: "Suit Pants", desc: "Clean heist style", color: 0x181818 },
    { id: "torn-jeans", name: "Torn Jeans", desc: "Rough edges", color: 0x3a4a68 },
  ],
  cap: [
    { id: "none", name: "No Cap", desc: "Bare head", color: 0x888888, none: true },
    { id: "baseball", name: "Baseball Cap", desc: "Low profile", color: 0x111111 },
    { id: "beanie", name: "Beanie", desc: "Warm and shady", color: 0x2a2a30 },
    { id: "bucket", name: "Bucket Hat", desc: "Street cover", color: 0x3a3020 },
  ],
  mask: [
    { id: "none", name: "No Mask", desc: "Open face", color: 0x888888, none: true, slot: "mask" },
    { id: "eye-mask", name: "Eye Mask", desc: "Classic bandit", color: 0x0a0a0c, slot: "mask" },
    { id: "bandit", name: "Bandit Mask", desc: "Half-face cover", color: 0x1a1a1e, slot: "mask" },
  ],
  weapons: [
    { id: "laser-pistol", name: "Laser Pistol", desc: "Fast & precise", color: 0x40dcff, slot: "weapon" },
    { id: "rpg", name: "RPG", desc: "Heavy rocket launcher", color: 0x6a7a40, slot: "weapon" },
    { id: "minigun", name: "Minigun", desc: "Spin-up chaos", color: 0x555860, slot: "weapon" },
  ],
};

CATALOG.other = [...CATALOG.mask, ...CATALOG.weapons];

const canvas = document.getElementById("game-canvas");
const startScreen = document.getElementById("start-screen");
const customizeScreen = document.getElementById("customize-screen");
const districtLabel = document.getElementById("district-label");
const hud = document.getElementById("hud");
const hudRole = document.getElementById("hud-role");
const hudDistrict = document.getElementById("hud-district");
const policeBtn = document.getElementById("btn-police");
const criminalBtn = document.getElementById("btn-criminal");
const itemGrid = document.getElementById("item-grid");
const panelTitle = document.getElementById("customize-panel-title");
const loadoutSummary = document.getElementById("loadout-summary");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);

const hemiLight = new THREE.HemisphereLight(0x8899bb, 0x223344, 0.55);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 120;
dirLight.shadow.camera.left = -60;
dirLight.shadow.camera.right = 60;
dirLight.shadow.camera.top = 60;
dirLight.shadow.camera.bottom = -60;
scene.add(dirLight);

const accentLight = new THREE.PointLight(0x4a90ff, 1.2, 80);
accentLight.position.set(0, 18, 0);
scene.add(accentLight);

const cityGroup = new THREE.Group();
scene.add(cityGroup);

const buildingBoxes = [];
let districtIndex = 0;
let mode = "menu"; // menu | customize | play
let role = null;
let player = null;
let previewRoot = null;
let activeCategory = "sweaters";

const loadout = {
  sweater: CATALOG.sweaters[0],
  pants: CATALOG.pants[0],
  cap: CATALOG.cap[0],
  mask: CATALOG.mask[1],
  weapon: CATALOG.weapons[0],
};

const keys = Object.create(null);
const look = { yaw: 0, pitch: -0.18 };
const menuCam = { angle: 0, radius: 42, height: 22 };

function clearCity() {
  while (cityGroup.children.length) {
    const child = cityGroup.children.pop();
    child.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
  }
  buildingBoxes.length = 0;
}

function buildDistrict(index) {
  clearCity();
  const d = DISTRICTS[index];
  scene.background = new THREE.Color(d.sky);
  scene.fog = new THREE.FogExp2(d.fog, 0.018);
  accentLight.color.setHex(d.light);
  hemiLight.color.setHex(d.fog);
  hemiLight.groundColor.setHex(d.ground);

  const groundGeo = new THREE.PlaneGeometry(CITY_SIZE * 2.2, CITY_SIZE * 2.2);
  const groundMat = new THREE.MeshStandardMaterial({
    color: d.ground,
    roughness: 0.92,
    metalness: 0.05,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  cityGroup.add(groundMesh);

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x0a0e14,
    roughness: 1,
    metalness: 0,
  });
  for (let i = -CITY_SIZE; i <= CITY_SIZE; i += BLOCK) {
    const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(CITY_SIZE * 2.2, 2.2), roadMat);
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.set(0, 0.02, i);
    roadZ.receiveShadow = true;
    cityGroup.add(roadZ);

    const roadX = new THREE.Mesh(new THREE.PlaneGeometry(2.2, CITY_SIZE * 2.2), roadMat);
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.set(i, 0.025, 0);
    roadX.receiveShadow = true;
    cityGroup.add(roadX);
  }

  const rng = mulberry32(1000 + index * 97);

  for (let x = -CITY_SIZE + BLOCK; x < CITY_SIZE; x += BLOCK) {
    for (let z = -CITY_SIZE + BLOCK; z < CITY_SIZE; z += BLOCK) {
      if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;
      if (rng() < 0.12) continue;

      const w = 2.2 + rng() * 2.4;
      const depth = 2.2 + rng() * 2.4;
      const h = d.height[0] + rng() * (d.height[1] - d.height[0]);
      const color = d.building[Math.floor(rng() * d.building.length)];

      const geo = new THREE.BoxGeometry(w, h, depth);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.75,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const px = x + (rng() - 0.5) * 1.2;
      const pz = z + (rng() - 0.5) * 1.2;
      mesh.position.set(px, h / 2, pz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      cityGroup.add(mesh);

      if (rng() > 0.35) {
        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.85, h * 0.7, depth * 0.85),
          new THREE.MeshBasicMaterial({
            color: d.accent,
            transparent: true,
            opacity: 0.08 + rng() * 0.1,
          })
        );
        glow.position.copy(mesh.position);
        cityGroup.add(glow);
      }

      buildingBoxes.push({
        minX: px - w / 2,
        maxX: px + w / 2,
        minZ: pz - depth / 2,
        maxZ: pz + depth / 2,
      });
    }
  }

  for (let i = 0; i < 18; i++) {
    const lx = (rng() - 0.5) * CITY_SIZE * 1.6;
    const lz = (rng() - 0.5) * CITY_SIZE * 1.6;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x222830, roughness: 0.6 })
    );
    pole.position.set(lx, 2, lz);
    pole.castShadow = true;
    cityGroup.add(pole);

    const lamp = new THREE.PointLight(d.light, 0.55, 14);
    lamp.position.set(lx, 4.1, lz);
    cityGroup.add(lamp);
  }

  setDistrictLabel(d.name);
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setDistrictLabel(name) {
  if (districtLabel) {
    districtLabel.style.opacity = "0";
    window.setTimeout(() => {
      districtLabel.textContent = name;
      districtLabel.style.opacity = "1";
    }, 280);
  }
  if (hudDistrict) hudDistrict.textContent = name;
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
      else child.material.dispose();
    }
  });
}

function makeWeaponMesh(weaponId) {
  const group = new THREE.Group();

  if (weaponId === "laser-pistol") {
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.16, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x222830, metalness: 0.6, roughness: 0.35 })
    );
    body.position.set(0.35, 0.95, 0.35);
    group.add(body);
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0x40dcff,
        emissive: 0x40dcff,
        emissiveIntensity: 1.2,
      })
    );
    glow.position.set(0.35, 0.98, 0.55);
    group.add(glow);
  } else if (weaponId === "rpg") {
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0x6a7a40, metalness: 0.4, roughness: 0.55 })
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0.55, 1.05, 0.25);
    group.add(tube);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.22, 10),
      new THREE.MeshStandardMaterial({ color: 0x333338, metalness: 0.5, roughness: 0.4 })
    );
    tip.rotation.z = -Math.PI / 2;
    tip.position.set(1.05, 1.05, 0.25);
    group.add(tip);
  } else {
    // minigun
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.7, 12),
      new THREE.MeshStandardMaterial({ color: 0x555860, metalness: 0.7, roughness: 0.3 })
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.55, 1.0, 0.28);
    group.add(barrel);
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0x2a2e36, metalness: 0.5, roughness: 0.45 })
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(0.25, 1.0, 0.28);
    group.add(drum);
  }

  return group;
}

function buildCriminalFigure(outfit) {
  const group = new THREE.Group();
  const sweater = outfit.sweater;
  const pants = outfit.pants;

  const hips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.32, 0.45, 4, 8),
    new THREE.MeshStandardMaterial({
      color: pants.color,
      roughness: 0.7,
      metalness: 0.1,
    })
  );
  hips.position.y = 0.7;
  hips.castShadow = true;
  hips.name = "pants";
  group.add(hips);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.36, 0.55, 4, 8),
    new THREE.MeshStandardMaterial({
      color: sweater.color,
      roughness: 0.65,
      metalness: 0.12,
      emissive: sweater.accent ?? 0x000000,
      emissiveIntensity: sweater.accent ? 0.08 : 0,
    })
  );
  torso.position.y = 1.25;
  torso.castShadow = true;
  torso.name = "sweater";
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xe8c8a8, roughness: 0.7 })
  );
  head.position.y = 1.9;
  head.castShadow = true;
  group.add(head);

  if (outfit.cap && !outfit.cap.none) {
    let cap;
    if (outfit.cap.id === "beanie") {
      cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: outfit.cap.color, roughness: 0.85 })
      );
      cap.position.y = 2.05;
    } else if (outfit.cap.id === "bucket") {
      cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.28, 0.18, 16),
        new THREE.MeshStandardMaterial({ color: outfit.cap.color, roughness: 0.8 })
      );
      cap.position.y = 2.08;
    } else {
      const capGroup = new THREE.Group();
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.29, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: outfit.cap.color, roughness: 0.7 })
      );
      dome.position.y = 2.05;
      const brim = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, 0.22),
        new THREE.MeshStandardMaterial({ color: outfit.cap.color, roughness: 0.7 })
      );
      brim.position.set(0, 2.0, 0.28);
      capGroup.add(dome, brim);
      cap = capGroup;
    }
    cap.name = "cap";
    group.add(cap);
  }

  if (outfit.mask && !outfit.mask.none) {
    if (outfit.mask.id === "eye-mask") {
      const mask = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.1, 0.08),
        new THREE.MeshStandardMaterial({ color: outfit.mask.color, roughness: 0.6 })
      );
      mask.position.set(0, 1.95, 0.24);
      mask.name = "mask";
      group.add(mask);
    } else {
      const mask = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.22, 0.1),
        new THREE.MeshStandardMaterial({ color: outfit.mask.color, roughness: 0.65 })
      );
      mask.position.set(0, 1.85, 0.24);
      mask.name = "mask";
      group.add(mask);
    }
  }

  if (outfit.weapon) {
    const weapon = makeWeaponMesh(outfit.weapon.id);
    weapon.name = "weapon";
    group.add(weapon);
  }

  return group;
}

function createPlayer(selectedRole, outfit = null) {
  if (player) {
    scene.remove(player);
    disposeObject(player);
    player = null;
  }

  let group;
  if (selectedRole === "criminal" && outfit) {
    group = buildCriminalFigure(outfit);
  } else {
    group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.7, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e4aaa, roughness: 0.55, metalness: 0.2 })
    );
    body.position.y = 1.05;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8c8a8, roughness: 0.7 })
    );
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.15, 0.55),
      new THREE.MeshStandardMaterial({
        color: 0x4a90ff,
        emissive: 0x4a90ff,
        emissiveIntensity: 0.4,
      })
    );
    badge.position.set(0, 1.15, 0.28);
    group.add(badge);
  }

  group.position.set(0, 0, 8);
  scene.add(group);
  player = group;
  look.yaw = Math.PI;
  look.pitch = -0.12;
}

function refreshPreview() {
  if (previewRoot) {
    scene.remove(previewRoot);
    disposeObject(previewRoot);
  }
  previewRoot = buildCriminalFigure(loadout);
  previewRoot.position.set(0, 0, 0);
  scene.add(previewRoot);
  updateLoadoutSummary();
}

function updateLoadoutSummary() {
  const map = {
    sweater: loadout.sweater?.name ?? "—",
    pants: loadout.pants?.name ?? "—",
    cap: loadout.cap?.name ?? "—",
    mask: loadout.mask?.name ?? "—",
    weapon: loadout.weapon?.name ?? "—",
  };
  loadoutSummary?.querySelectorAll("[data-slot]").forEach((el) => {
    el.textContent = map[el.dataset.slot] ?? "—";
  });
}

function slotForCategory(category, item) {
  if (item?.slot) return item.slot;
  if (category === "sweaters") return "sweater";
  if (category === "other") return item?.slot ?? "mask";
  return category;
}

function renderItemGrid(category) {
  activeCategory = category;
  panelTitle.textContent = category === "other" ? "other things" : category;
  document.querySelectorAll(".cat-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.category === category);
  });

  const items = CATALOG[category] ?? [];

  itemGrid.innerHTML = "";
  for (const item of items) {
    const slotKey = slotForCategory(category, item);
    const selected = loadout[slotKey]?.id === item.id;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `item-card${selected ? " is-selected" : ""}`;
    btn.innerHTML = `
      <span class="item-card__swatch" style="background: linear-gradient(135deg, #${item.color.toString(16).padStart(6, "0")}, #${(item.accent ?? item.color).toString(16).padStart(6, "0")})"></span>
      <span class="item-card__name">${item.name}</span>
      <span class="item-card__desc">${item.desc}</span>
    `;
    btn.addEventListener("click", () => {
      loadout[slotKey] = item;
      refreshPreview();
      renderItemGrid(category);
    });
    itemGrid.appendChild(btn);
  }
}

function openCustomize() {
  mode = "customize";
  window.PoliceCityUI?.showCustomize();
  canvas.classList.add("game-canvas--menu");
  canvas.classList.remove("game-canvas--play");
  refreshPreview();
  renderItemGrid("sweaters");
}

function closeCustomizeToMenu() {
  mode = "menu";
  window.PoliceCityUI?.hideCustomize();
  if (previewRoot) {
    scene.remove(previewRoot);
    disposeObject(previewRoot);
    previewRoot = null;
  }
}

window.openCriminalCustomize = openCustomize;
window.closeCriminalCustomize = closeCustomizeToMenu;

function collides(x, z, radius = 0.4) {
  for (const b of buildingBoxes) {
    if (
      x + radius > b.minX &&
      x - radius < b.maxX &&
      z + radius > b.minZ &&
      z - radius < b.maxZ
    ) {
      return true;
    }
  }
  const limit = CITY_SIZE * 1.05;
  return Math.abs(x) > limit || Math.abs(z) > limit;
}

function startGame(selectedRole) {
  role = selectedRole;
  mode = "play";
  document.body.classList.add("is-playing");
  document.body.classList.remove("is-customizing");
  canvas.classList.remove("game-canvas--menu");
  canvas.classList.add("game-canvas--play");
  startScreen.classList.add("is-hidden");
  customizeScreen.classList.add("is-hidden");
  document.getElementById("btn-customize-play")?.classList.add("is-hidden");
  hud.classList.remove("is-hidden");
  hudRole.textContent = selectedRole === "police" ? "POLICE" : "CRIMINAL";
  hudRole.dataset.role = selectedRole;

  if (previewRoot) {
    scene.remove(previewRoot);
    disposeObject(previewRoot);
    previewRoot = null;
  }

  createPlayer(selectedRole, selectedRole === "criminal" ? { ...loadout } : null);
  canvas.requestPointerLock?.();
}

function returnToMenu() {
  mode = "menu";
  role = null;
  document.body.classList.remove("is-playing", "is-customizing");
  canvas.classList.add("game-canvas--menu");
  canvas.classList.remove("game-canvas--play");
  startScreen.classList.remove("is-hidden");
  customizeScreen.classList.add("is-hidden");
  document.getElementById("btn-customize-play")?.classList.add("is-hidden");
  hud.classList.add("is-hidden");
  document.exitPointerLock?.();
  if (player) {
    scene.remove(player);
    disposeObject(player);
    player = null;
  }
  if (previewRoot) {
    scene.remove(previewRoot);
    disposeObject(previewRoot);
    previewRoot = null;
  }
}

function updateMenuCamera(dt) {
  menuCam.angle += dt * 0.12;
  const x = Math.cos(menuCam.angle) * menuCam.radius;
  const z = Math.sin(menuCam.angle) * menuCam.radius;
  camera.position.set(x, menuCam.height, z);
  camera.lookAt(0, 4, 0);
}

function updateCustomizeCamera(dt) {
  if (previewRoot) previewRoot.rotation.y += dt * 0.55;
  camera.position.set(2.8, 1.7, 4.2);
  camera.lookAt(0, 1.2, 0);
}

function updatePlay(dt) {
  if (!player) return;

  const speed = role === "police" ? 9 : 10.5;
  const forward = new THREE.Vector3(-Math.sin(look.yaw), 0, -Math.cos(look.yaw));
  const right = new THREE.Vector3(Math.cos(look.yaw), 0, -Math.sin(look.yaw));

  const move = new THREE.Vector3();
  if (keys.KeyW || keys.ArrowUp) move.add(forward);
  if (keys.KeyS || keys.ArrowDown) move.sub(forward);
  if (keys.KeyA || keys.ArrowLeft) move.sub(right);
  if (keys.KeyD || keys.ArrowRight) move.add(right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * dt);
    const nextX = player.position.x + move.x;
    const nextZ = player.position.z + move.z;
    if (!collides(nextX, player.position.z)) player.position.x = nextX;
    if (!collides(player.position.x, nextZ)) player.position.z = nextZ;
    player.rotation.y = look.yaw;
  }

  const camDist = 5.5;
  const camHeight = 2.4;
  const target = new THREE.Vector3(
    player.position.x + Math.sin(look.yaw) * camDist,
    player.position.y + camHeight + Math.sin(-look.pitch) * 2,
    player.position.z + Math.cos(look.yaw) * camDist
  );
  camera.position.lerp(target, 1 - Math.pow(0.001, dt));
  const lookAt = player.position.clone().add(new THREE.Vector3(0, 1.4, 0));
  lookAt.y += Math.sin(look.pitch) * 2;
  camera.lookAt(lookAt);
}

function rotateDistrict() {
  districtIndex = (districtIndex + 1) % DISTRICTS.length;
  const saved = player ? player.position.clone() : null;
  buildDistrict(districtIndex);
  if (saved && player) {
    player.position.copy(saved);
    if (collides(player.position.x, player.position.z, 0.6)) {
      player.position.set(0, 0, 8);
    }
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onResize);

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Escape") {
    if (mode === "play") returnToMenu();
    else if (mode === "customize") closeCustomizeToMenu();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

document.addEventListener("mousemove", (e) => {
  if (mode !== "play" || document.pointerLockElement !== canvas) return;
  look.yaw -= e.movementX * 0.0022;
  look.pitch -= e.movementY * 0.0018;
  look.pitch = Math.max(-0.9, Math.min(0.55, look.pitch));
});

canvas.addEventListener("click", () => {
  if (mode === "play") canvas.requestPointerLock?.();
});

policeBtn?.addEventListener("click", () => startGame("police"));

document.getElementById("btn-customize-play")?.addEventListener("click", () => {
  startGame("criminal");
});

document.querySelectorAll(".cat-btn").forEach((btn) => {
  btn.addEventListener("click", () => renderItemGrid(btn.dataset.category));
});

buildDistrict(0);
window.setInterval(rotateDistrict, DISTRICT_INTERVAL_MS);

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (mode === "menu") updateMenuCamera(dt);
  else if (mode === "customize") updateCustomizeCamera(dt);
  else updatePlay(dt);

  accentLight.intensity = 1.05 + Math.sin(now * 0.002) * 0.2;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
