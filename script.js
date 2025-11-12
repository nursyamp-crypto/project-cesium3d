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

// Menambahkan model 3D (GLB)
const position = Cesium.Cartesian3.fromDegrees(106.8272, -6.1754, 30); // posisi (Jakarta)
const heading = Cesium.Math.toRadians(0);
const pitch = 0;
const roll = 0;
const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

const model = viewer.entities.add({
  name: "Model Putra",
  position: position,
  orientation: orientation,
  model: {
    uri: "./model/model_putra.glb", // lokasi file model kamu
    scale: 1.0,                     // ubah kalau terlalu kecil/besar
    minimumPixelSize: 64,
  },
});

// Fokuskan kamera ke model
viewer.flyTo(model);

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
