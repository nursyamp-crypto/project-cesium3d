Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1OWIxY2Y3My1jNzcwLTQzOTktOWNiZi03MWY2OTA5NmYyMmYiLCJpZCI6MjQ3MTUyLCJpYXQiOjE3Mjg1NjEwOTl9.BahmuLOoyRDeVCCD7OF1BZ0Hb5kHV5DFVNvCTCqqdmA';

// Inisialisasi viewer Cesium (versi 1.116 ke atas)
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  animation: false,
  timeline: false,
});

// Tambahkan titik di Jakarta
viewer.entities.add({
  name: "Monas, Jakarta",
  position: Cesium.Cartesian3.fromDegrees(106.8272, -6.1754, 0),
  point: { pixelSize: 10, color: Cesium.Color.RED },
  label: {
    text: "Monas, Jakarta",
    font: "14pt sans-serif",
    fillColor: Cesium.Color.WHITE,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
  },
});

// Arahkan kamera ke lokasi tersebut
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(106.8272, -6.1754, 5000),
});

// === Data Model Proyek ===
const projects = [
  {
    name: "Model Putra",
    uri: "./model/model_putra.glb",
    position: Cesium.Cartesian3.fromDegrees(106.8272, -6.1754, 30),
    info: {
      title: "🏗️ Gedung Putra",
      lokasi: "Jakarta",
      tahun: "2025",
      luas: "5.200 m²",
      struktur: "Beton Bertulang"
    }
  },
  {
    name: "Model Putra-2",
    uri: "./model/model_putra_2.glb",
    position: Cesium.Cartesian3.fromDegrees(112.7508, -7.2575, 35),
    info: {
      title: "🏫 Gedung Kampus",
      lokasi: "Surabaya",
      tahun: "2024",
      luas: "8.100 m²",
      struktur: "Baja + Beton"
    }
  }
];

// === Tambahkan semua model ke globe ===
const entities = [];
for (const proj of projects) {
  const model = viewer.entities.add({
    name: proj.name,
    position: proj.position,
    model: {
      uri: proj.uri,
      scale: 1.0,
      minimumPixelSize: 64
    }
  });
  model.info = proj.info; // tambahkan data info ke entity
  entities.push(model);
}

// Fokuskan kamera ke model
viewer.flyTo(entities[0]);

// === Navigasi Lokasi (dengan animasi halus) ===
function flyToLocation(lon, lat, height, duration = 3.0) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    duration: duration, // detik animasi
    easingFunction: Cesium.EasingFunction.QUADRATIC_OUT, // gaya gerak halus
  });
}

document.getElementById("gotoJakarta").onclick = () => {
  flyToLocation(106.8272, -6.1754, 5000);
};

document.getElementById("gotoBali").onclick = () => {
  flyToLocation(115.1889, -8.4095, 5000);
};

document.getElementById("gotoSurabaya").onclick = () => {
  flyToLocation(112.7508, -7.2575, 5000);
};

// === Popup Info ===
  const infoBox = document.getElementById("infoBox");
  const infoTitle = document.getElementById("infoTitle");
  const infoDesc = document.getElementById("infoDesc");

  let activeEntity = null;

// === Variabel global untuk efek glow ===
let glowTime = 0; // waktu animasi
let glowActiveModel = null;

// === Event klik model (dengan dynamic glow) ===
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (click) {
  const picked = viewer.scene.pick(click.position);

  // Reset semua model ke warna normal
  for (const entity of entities) {
    if (entity.model) {
      entity.model.color = Cesium.Color.WHITE;
      entity.model.silhouetteColor = Cesium.Color.TRANSPARENT;
      entity.model.silhouetteSize = 0;
    }
  }

  if (Cesium.defined(picked) && picked.id && picked.id.info) {
    activeEntity = picked.id;
    glowActiveModel = activeEntity.model; // model yang akan berdenyut
    glowTime = 0; // reset animasi

    const data = activeEntity.info;

    // === Highlight awal ===
    activeEntity.model.silhouetteColor = Cesium.Color.fromCssColorString("#00FFF2");
    activeEntity.model.silhouetteSize = 4.0;

    // === Tampilkan Popup ===
    infoTitle.textContent = data.title;
    infoDesc.innerHTML = `
      📍 Lokasi: ${data.lokasi}<br>
      📅 Tahun: ${data.tahun}<br>
      📐 Luas: ${data.luas}<br>
      🧱 Struktur: ${data.struktur}
    `;
    infoBox.style.display = "block";
  } else {
    // Klik area kosong
    activeEntity = null;
    glowActiveModel = null;
    infoBox.style.display = "none";
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// === Animasi Dynamic Glow (dipanggil setiap frame) ===
viewer.scene.postRender.addEventListener(function () {
  // Update posisi popup
  if (activeEntity) {
    const position = activeEntity.position.getValue(Cesium.JulianDate.now());
    const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      position
    );

    if (Cesium.defined(canvasPosition)) {
      infoBox.style.left = canvasPosition.x + 15 + "px";
      infoBox.style.top = canvasPosition.y - 60 + "px";
    }
  }

  // Efek glow berdenyut halus
  if (glowActiveModel) {
    glowTime += 0.06; // kecepatan animasi
    const intensity = 0.9 + Math.sin(glowTime) * 0.6; // dari 0.2 → 1.0
    const baseColor = Cesium.Color.fromCssColorString("#00FFD1");
    glowActiveModel.color = new Cesium.Color(
      baseColor.red * intensity,
      baseColor.green * intensity,
      baseColor.blue * intensity,
      1.0
    );
  }
});

// === Update posisi popup agar menempel ke model ===
viewer.scene.postRender.addEventListener(function () {
  if (activeEntity) {
    const position = activeEntity.position.getValue(Cesium.JulianDate.now());
    const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      position
    );

    if (Cesium.defined(canvasPosition)) {
      infoBox.style.left = canvasPosition.x + 15 + "px";
      infoBox.style.top = canvasPosition.y - 60 + "px";
    }
  }
});


// ganti 123456 dengan Asset ID dari Cesium ion
Cesium.Cesium3DTileset.fromIonAssetId(4115447).then(function(tileset) {
  viewer.scene.primitives.add(tileset);
  viewer.zoomTo(tileset);
});

