/*
 * Scan AR on 8th Wall. The camera looks for one of the works' pictures
 * (configured as Image Targets in the 8th Wall console, named by slug). When a
 * picture is found, the work's real-size model (/ar/<slug>.glb, already in
 * metres and standing upright) is placed on it in WORLD space, so 8th Wall's
 * world tracking keeps it anchored there even after the picture leaves view.
 * It stays until "Remove · scan another". Pinch to resize.
 *
 * The three scripts and the console setup are described in index.html.
 */
(function () {
  "use strict";

  var scene = document.querySelector("a-scene");
  var placed = document.getElementById("placed");
  var model = document.getElementById("model");
  var elTitle = document.getElementById("title");
  var elArtist = document.getElementById("artist");
  var elStatus = document.getElementById("status");
  var bottom = document.getElementById("bottom");

  var WORKS = [];
  var active = null; // the work shown now, or null while scanning
  var isPlaced = false; // a work is standing in the room
  var scaleMul = 1; // the visitor's pinch resize

  function setStatus(s) {
    elStatus.textContent = s || "";
    elStatus.style.display = s ? "block" : "none";
  }
  function showControls(w) {
    elTitle.textContent = w.title;
    elArtist.textContent = w.artist;
    setStatus("");
    bottom.style.display = "block";
  }
  function hideControls() {
    elTitle.textContent = "";
    elArtist.textContent = "";
    bottom.style.display = "none";
  }

  // Load the curated works (slug, console target name, real-size model, size).
  fetch("./works.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (w) {
      WORKS = w;
      if (window.XR8 && XR8.XrController) configureTargets();
    })
    .catch(function () {
      setStatus("Couldn't load the works list.");
    });

  function configureTargets() {
    try {
      XR8.XrController.configure({
        imageTargets: WORKS.map(function (w) {
          return w.name;
        }),
      });
    } catch (e) {
      /* configured again on realityready below */
    }
  }

  // 8th Wall is ready: turn on the image targets and prompt the visitor.
  scene.addEventListener("realityready", function () {
    if (WORKS.length) configureTargets();
    setStatus("Point the camera at a work's picture on the floor");
  });

  // A picture was found: stand the work on it, in world space, and leave it
  // there. We deliberately do NOT listen for "xrimagelost" — world tracking
  // holds the work when the picture is gone.
  scene.addEventListener("xrimagefound", function (e) {
    onFound(e.detail);
  });

  function onFound(d) {
    if (isPlaced || !d) return;
    var w = find(d.name);
    if (!w) return;
    active = w;
    model.setAttribute("gltf-model", "url(" + w.ar + ")");

    // Stand it on the picture: the model is already upright and real-size, so
    // just move the world-space holder to the picture and turn it to face the
    // camera (the picture lies flat, so we keep the work's own up, not the
    // picture's tilt).
    var o = placed.object3D;
    o.position.set(d.position.x, d.position.y, d.position.z);
    var cam = scene.camera;
    o.rotation.set(
      0,
      Math.atan2(cam.position.x - d.position.x, cam.position.z - d.position.z),
      0,
    );
    scaleMul = 1;
    o.scale.setScalar(1);
    placed.setAttribute("visible", "true");
    isPlaced = true;
    showControls(w);
  }

  function find(name) {
    for (var i = 0; i < WORKS.length; i++) if (WORKS[i].name === name) return WORKS[i];
    return null;
  }

  // Remove the work and go back to scanning.
  document.getElementById("remove").addEventListener("click", function () {
    isPlaced = false;
    active = null;
    scaleMul = 1;
    placed.setAttribute("visible", "false");
    model.removeAttribute("gltf-model");
    hideControls();
    setStatus("Point the camera at another picture");
  });

  // Pinch to resize the placed work.
  var pinch = null;
  function span(t) {
    var dx = t[0].clientX - t[1].clientX;
    var dy = t[0].clientY - t[1].clientY;
    return Math.hypot(dx, dy);
  }
  document.addEventListener(
    "touchstart",
    function (e) {
      if (isPlaced && e.touches.length === 2) pinch = { d: span(e.touches), s: scaleMul };
    },
    { passive: true },
  );
  document.addEventListener(
    "touchmove",
    function (e) {
      if (!pinch || e.touches.length !== 2) return;
      scaleMul = Math.min(6, Math.max(0.1, (pinch.s * span(e.touches)) / pinch.d));
      placed.object3D.scale.setScalar(scaleMul);
    },
    { passive: true },
  );
  document.addEventListener("touchend", function () {
    pinch = null;
  });
})();
