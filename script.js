import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

const floatDiv = document.getElementById("float");
const bgMusic = document.getElementById("bg-music");
const svgPath = floatDiv.querySelector("svg path");

floatDiv.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    svgPath.setAttribute("fill", "#EB7200");
  } else {
    bgMusic.pause();
    svgPath.setAttribute("fill", "#07E137");
  }
});

document.addEventListener("mousemove", (e) => {
  const spark = document.createElement("div");
  spark.classList.add("spark");

  spark.style.left = `${e.pageX}px`;
  spark.style.top = `${e.pageY}px`;

  document.body.appendChild(spark);

  gsap.to(spark, {
    x: (Math.random() - 0.5) * 30,
    y: (Math.random() - 0.5) * 30,
    scale: 0,
    opacity: 0,
    duration: 0.6,
    ease: "power1.out",
    onComplete: () => spark.remove(),
  });
});

//-------------------------------------------------------SEC 1----------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
camera.position.set(0, -1, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#webgl"),
  logarithmicDepthBuffer: true,
});
renderer.setSize(innerWidth, innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enableRotate = false;
controls.enableZoom = false;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
scene.add(new THREE.DirectionalLight(0xffffff, 0.8));

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load("models/man.glb", (gltf) => {
  const model = gltf.scene;
  model.updateMatrixWorld(true);

  let mesh;
  model.traverse((child) => {
    if (child.isMesh && !mesh) mesh = child;
  });

  const sampler = new MeshSurfaceSampler(mesh).build();

  const particleCount = 20000;
  const particles = new Float32Array(particleCount * 3);
  const tempPosition = new THREE.Vector3();

  for (let i = 0; i < particleCount; i++) {
    sampler.sample(tempPosition);
    particles[i * 3] = tempPosition.x;
    particles[i * 3 + 1] = tempPosition.y;
    particles[i * 3 + 2] = tempPosition.z;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particles, 3)
  );

  const textureLoader = new THREE.TextureLoader();
  const particleTexture = textureLoader.load(
    "https://threejs.org/examples/textures/sprites/circle.png"
  );

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01,
    precision: "highp",
    map: particleTexture,
    transparent: true,
    alphaTest: 0.5,
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  gsap.to(particleSystem.position, {
    y: "+=.2",
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
});

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const textElement = document.getElementById("intro1");
const textElement2 = document.getElementById("intro2");
const myselfText = document.getElementById("myselfText");
const myPart = document.getElementById("myPart");
const selfPart = document.getElementById("selfPart");
const canvas = renderer.domElement;

let scrollY = 0;
const minY = -1;
const maxY = -20;
const zoomScrollRange = 1500;

let currentY = minY;
const smoothing = 0.08;

const fadeInStart = 0;
const fadeInEnd = 30;
const fadeOutStart = 31;
const fadeOutEnd = 50;

const fadeStart = 400;
const fadeEnd = 1300;
const splitTrigger = 800;

let textShown = false;
let splitActive = false;
let fadeTriggered = false;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  console.log(scrollY);
  if (scrollY > 1400 && !fadeTriggered) {
    fadeTriggered = true;

    gsap.to(canvas, {
      opacity: 0,
      duration: 0.5,
    });
  }
  if (scrollY <= 1300 && fadeTriggered) {
    fadeTriggered = false;

    gsap.to(canvas, {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (scrollY <= 1500) {
    const progress = Math.min(scrollY / zoomScrollRange, 1);
    const targetY = minY + (maxY - minY) * progress;
    currentY += (targetY - currentY) * smoothing;
    camera.position.set(0, currentY, 0);
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);

  if (scrollY >= fadeInStart && scrollY <= fadeInEnd) {
    gsap.to([textElement, textElement2], {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  if (scrollY >= fadeOutStart && scrollY <= fadeOutEnd) {
    console.log("FADE OUT TRIGGERED");
    gsap.to([textElement, textElement2], {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }

  if (scrollY >= fadeStart && scrollY <= fadeEnd && !textShown) {
    console.log("YAAASSS");
    textShown = true;
    gsap.to(myselfText, { opacity: 1, duration: 0.5 });
  } else if ((scrollY < fadeStart || scrollY > fadeEnd) && textShown) {
    textShown = false;
    gsap.to(myselfText, { opacity: 0, duration: 0.5 });
  }

  if (scrollY > splitTrigger && !splitActive) {
    splitActive = true;
    gsap.to(myPart, { xPercent: -50, duration: 1 });
    gsap.to(selfPart, { xPercent: 50, duration: 1 });
    selfPart.classList.add("glow");
  } else if (scrollY <= splitTrigger && splitActive) {
    splitActive = false;
    gsap.to(myPart, { xPercent: 0, duration: 1 });
    gsap.to(selfPart, { xPercent: 0, duration: 1 });
    selfPart.classList.remove("glow");
  }
}

animate();

gsap.to("#spacer", {
  ease: "slow",
  scrollTrigger: {
    trigger: "#spacer",
    start: "top bottom",
    end: "top top",
    scrub: true,
    markers: false,
  },
});

gsap.utils.toArray(".not-word").forEach((el, i) => {
  gsap.to(el, {
    scale: 1,
    opacity: 1,
    ease: "none",
    delay: i * 1,
    scrollTrigger: {
      trigger: el,
      start: "top 90%",
      end: "top 20%",
      scrub: true,
    },
  });
});

function createBubble() {
  const wrapper = document.querySelector(".bubble-wrapper");
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  const x = Math.random() * window.innerWidth;
  const y = window.innerHeight + 50;
  const scale = Math.random() * 1.5 + 0.5;

  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  bubble.style.transform = `scale(${scale})`;

  wrapper.appendChild(bubble);

  gsap.to(bubble, {
    y: -window.innerHeight - 100,
    opacity: 1,
    duration: Math.random() * 10 + 4,
    ease: "power1.inOut",
    onComplete: () => bubble.remove(),
  });
}

ScrollTrigger.create({
  trigger: "#sec3",
  start: "top center",
  onEnter: () => {
    const interval = setInterval(createBubble, 200);
    ScrollTrigger.create({
      trigger: "#sec3",
      start: "bottom top",
      onEnterBack: () => clearInterval(interval),
      onLeave: () => clearInterval(interval),
    });
  },
});

const marquee = document.querySelector(".marquee-track");
const totalWidth = marquee.scrollWidth;

console.log(totalWidth);

const scrollDistance = totalWidth + window.innerWidth;

gsap.to(".marquee-track", {
  x: () => -(totalWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: "#sec3",
    start: "top top",
    end: `+=${scrollDistance}`,
    scrub: true,
    pin: true,
    anticipatePin: 1,
    markers: false,
  },
});

gsap.to(".hollow-text", {
  color: "transparent",
  opacity: 0,
  "-webkit-text-stroke": "1px white",
  scrollTrigger: {
    trigger: "#sec4",
    start: "top 20%",
    end: "bottom top",
    markers: false,
    scrub: true,
  },
});

function animationTextBounce(element) {
  const theText = document.querySelector(element);
  const originalText = theText.innerText.trim();

  const words = originalText.split(" ");

  let newHTML = "";
  words.forEach((word, wIndex) => {
    newHTML += `<span class="word">`;

    for (let i = 0; i < word.length; i++) {
      newHTML += `<span>${word[i]}</span>`;
    }
    newHTML += `</span>`;

    if (wIndex < words.length - 1) {
      newHTML += `<span class="space">&nbsp;</span>`;
    }
  });

  theText.innerHTML = newHTML;

  gsap.fromTo(
    `${element} .word span`,
    {
      opacity: 1,
      y: 50,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.5,
      stagger: 0.03,
      ease: "elastic.out(1.2, 0.5)",
      scrollTrigger: {
        trigger: element,
        start: "top 70%",
        toggleActions: "restart none none reverse",
      },
    }
  );
}
animationTextBounce("#bounceTxt");

gsap.to("#spacer2", {
  backgroundColor: "white",
  duration: 1,
  ease: "sine.inOut",
  scrollTrigger: {
    trigger: "#spacer2",
    start: "top center",
    end: "bottom center",
    toggleActions: "play none none reverse",
    markers: false,
  },
});

const words = gsap.utils.toArray(".rotating-word");
let current = 0;

function rotateWords() {
  const currentWord = words[current];
  const nextWord = words[(current + 1) % words.length];

  gsap.to(currentWord, {
    y: "-100%",
    opacity: 0,
    duration: 0.6,
    ease: "power2.in",
  });

  gsap.fromTo(
    nextWord,
    { y: "100%", opacity: 0 },
    { y: "0%", opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 }
  );

  current = (current + 1) % words.length;
}

gsap.to(".final", {
  opacity: 1,
  y: 0,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".rotating-container",
    start: "top 50%",
    toggleActions: "play none none reverse",
  },
});

rotateWords();
setInterval(rotateWords, 3000);

const images = gsap.utils.toArray(".parallax-img");

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#sec5",
    start: "top top",
    end: "+=5000",
    scrub: true,
    pin: true,
    markers: false,
  },
});

images.forEach((img, i) => {
  tl.fromTo(
    img,
    { opacity: 0, y: 100 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
    },
    i * 0.5
  );
});

const quoteEl = document.querySelector("#sec7 .quote");
const words2 = quoteEl.innerText.trim().split(" ");
quoteEl.innerHTML = words2
  .map((word2) => `<span class="word2">${word2}</span>`)
  .join(" ");

gsap.set(".word2", { opacity: 0, y: 20 });

gsap.to(".word2", {
  opacity: 1,
  y: 0,
  stagger: 0.1,
  duration: 1,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#sec7",
    start: "top top",
    toggleActions: "play none none reverse",
    markers: false,
  },
});
const circles = gsap.utils.toArray(".circle");

circles.forEach((circle) => {
  gsap.set(circle, {
    x: gsap.utils.random(0, window.innerWidth),
    y: gsap.utils.random(-100, -500),
    scale: gsap.utils.random(0.5, 1),
    opacity: gsap.utils.random(0.2, 0.6),
  });

  gsap.to(circle, {
    y: window.innerHeight + 1000,
    ease: "none",
    scrollTrigger: {
      trigger: "#sec8",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });
});

const textEl = document.querySelector(".crazy-text");
const chaosWords = textEl.innerText.split(" ");
textEl.innerHTML = chaosWords
  .map((word) => `<span class="word-chaos">${word} </span>`)
  .join("");

gsap.utils.toArray(".word-chaos").forEach((word, i) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#sec9",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  tl.fromTo(
    word,
    {
      opacity: 0,
      y: gsap.utils.random(-400, 400),
      x: gsap.utils.random(-150, 150),
      rotation: gsap.utils.random(-270, 270),
      scale: gsap.utils.random(0.3, 5),
    },
    {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      ease: "power4.out",
      duration: 1.5,
    }
  );
});

gsap.to(".cloud-left", {
  opacity: 1,
  x: 600,
  duration: 2,
  scrollTrigger: {
    trigger: "#sec10",
    start: "top 85%",
    scrub: true,
  },
});

gsap.to(".cloud-right", {
  opacity: 1,
  x: -600,
  duration: 2,
  scrollTrigger: {
    trigger: "#sec10",
    start: "top 85%",
    scrub: true,
  },
});

gsap.to([".cloud-left", ".cloud-right"], {
  x: -1000,
  duration: 3,
  scrollTrigger: {
    trigger: "#sec10",
    start: "top 60%",
    end: "top 30%",
    scrub: true,
  },
});

gsap.to(".dream-text", {
  opacity: 1,
  scale: 1,
  duration: 2,
  ease: "power2.out",
  scrollTrigger: {
    trigger: "#sec10",
    start: "top top",
    scrub: true,
  },
});


const flickerEl = document.querySelector(".flicker-text");
const words3 = flickerEl.textContent.trim().split(" ");
flickerEl.innerHTML = words3
  .map((w) => `<span class="word3">${w} </span>`)
  .join("");

gsap.utils.toArray(".word3").forEach((word, i) => {
  gsap.to(word, {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    ease: "power2.out",
    delay: gsap.utils.random(0, 0.6),
    duration: 0.3,
    scrollTrigger: {
      trigger: "#sec11",
      start: "top 70%",
      scrub: true,
    },
  });
});

gsap.to(".word3", {
  scale: 1.1,
  duration: 0.4,
  ease: "power1.inOut",
  yoyo: true,
  repeat: 1,
  scrollTrigger: {
    trigger: "#sec11",
    start: "top 50%",
    scrub: true,
  },
});

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: "#sec12",
    start: "top top",
    end: "+=1000",
    scrub: true,
    pin: true,
  },
});

tl2.to(
  "#dream",
  {
    opacity: 1,
    y: 0,
    duration: 1,
  },
  0
);

tl2.to(
  "#wish",
  {
    opacity: 1,
    rotateX: 0,
    scale: 1,
    duration: 1,
  },
  "+=0.5"
);

tl2.to(
  "#wish2",
  {
    opacity: 1,
    rotateX: 0,
    scale: 1,
    duration: 1,
  },
  "+=0.5"
);

tl2.to(
  ".repeat-line",
  {
    opacity: 1,
    duration: 1,
  },
  "+=0.8"
);
tl2.to(
  ".repeat-text",
  {
    x: "-100%",
    duration: 10,
    ease: "none",
  },
  "-=0.5"
);

gsap.utils.toArray(".truth-line").forEach((line, i) => {
  gsap.to(line, {
    opacity: 1,
    scale: 1,
    duration: 1.5,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#sec13",
      start: `top+=${i * 80} center`,
      scrub: true,
    },
  });
});

gsap.to(".truth-line:last-child", {
  scale: 1.1,
  duration: 0.6,
  ease: "power2.inOut",
  repeat: 1,
  yoyo: true,
  scrollTrigger: {
    trigger: ".truth-line:last-child",
    start: "top 60%",
    scrub: true,
  },
});

ScrollTrigger.create({
  trigger: ".spacerend",
  start: "top center",
  onEnter: () => {
    gsap.to(window, {
      scrollTo: "#sec1",
      duration: 2,
      ease: "power2.inOut",
    });
  },
});
