// Sidebar toggle (mobile)
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const menuCloseBtns = document.querySelectorAll('.menuClose');

// Open / Toggle
menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close (for all close buttons)
menuCloseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});



    // Theme toggle with localStorage
    const themeBtn = document.getElementById('themeBtn');
    const themeLabel = document.getElementById('themeLabel');

    function setTheme(mode){
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      themeLabel.textContent = (mode === 'dark') ? 'লাইট' : ' ডার্ক ';
    }
    const saved = localStorage.getItem('theme');
    setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    themeBtn.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    });


    // লেখা চলা   ###################################################

let runningFont = document.getElementById("runFont")
runningFont.innerText = " রাব্বি জিদনি ইলমা 💎 রাব্বি জিদনি ইলমা 💎 রাব্বি জিদনি ইলমা 💎 আল্লাহই যথেষ্ট : ‘হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল, নিমাল মাওলা ওয়া নিমান নাসির।’ 💎 ";

// Accessible Accordion ###################################################
const headers = document.querySelectorAll('.accordion-header');

headers.forEach((btn) => {
  btn.addEventListener('click', () => togglePanel(btn));
  btn.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){ 
      e.preventDefault(); 
      togglePanel(btn); 
    }
  });
});

function togglePanel(btn){
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  const panelId = btn.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  // শুধুমাত্র ক্লিক করা আইটেমটি টগল করুন
  btn.setAttribute('aria-expanded', String(!expanded));
  panel.classList.toggle('open');

      // Smooth scroll into view when opened on mobile
      if(!expanded){
        setTimeout(()=>{ panel.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 200);
      }
    }

// শেয়ার কন্টেন্ট  ###################################################

document.addEventListener("DOMContentLoaded", function() {
  const items = document.querySelectorAll(".dua-card");

  items.forEach(item => {
    const refDiv = item.querySelector(".ref");

    if (refDiv) {
      // শেয়ার আইকন তৈরি
      const shareIcon = document.createElement("i");
      shareIcon.className = "fa fa-share-alt";
      shareIcon.style.marginLeft = "8px";
      shareIcon.style.cursor = "pointer";
      shareIcon.setAttribute("title", "শেয়ার করুন");

      // রেফ div এ বসানো
      refDiv.appendChild(shareIcon);

      // ক্লিক ইভেন্ট
      shareIcon.addEventListener("click", async function() {
        // accordion-item এর লেখাগুলি (HTML বাদ দিয়ে, লাইন মেইনটেন করে)
        const textContent = item.innerText.trim();

        // সাইট লিংক শেষে যোগ করা
        const shareText = `${textContent}\n\nআরো এমন তথ্য ও হাদিস পেতে ভিজিট করুন:\n${window.location.href}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: document.title,
              text: shareText
            });
          } catch (err) {
            console.log("শেয়ার বাতিল:", err);
          }
        } else {
          // fallback: ক্লিপবোর্ডে কপি করে দেয়া
          navigator.clipboard.writeText(shareText);
          alert("শেয়ার সাপোর্ট নেই, টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে।");
        }
      });
    }
  });
});

   // idenhi ivdi balvisi likki 10 arba   ###################################################

var clickCount = 0;
var clickDiv = document.getElementById("clickDiv");
var hiddenDiv = document.getElementById("hdn");

if (!clickDiv || !hiddenDiv) {
  console.error("Could not find clickDiv or hiddenDiv");
} else {
  clickDiv.addEventListener("click", function() {
    clickCount++;
    if (clickCount === 5) {
      hiddenDiv.style.display = "block";
    }
  });
}

          //app shortcut          ###################################################
// Service Worker রেজিস্টার
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../sw.js")
    .then(() => console.log("SW registered"))
    .catch(err => console.log("SW fail", err));
}


let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Install prompt event ধরার জন্য
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // বাটন দেখাও
  installBtn.style.display = 'inline-block';
});

// বাটনে ক্লিক করলে prompt দেখাবে
installBtn.addEventListener('click', () => {
  installBtn.style.display = 'none';
  deferredPrompt.prompt();

  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ User accepted install');
    } else {
      console.log('❌ User dismissed install');
    }
    deferredPrompt = null;
  });
});




// JavaScript code to create a dynamic Qibla compass inside #compasQ  ###################################################


(() => {
  const mountId = "compasQ"; // চাইলে বদলাতে পারেন
  const root = document.getElementById(mountId);
  if (!root) { console.error("#" + mountId + " not found"); return; }

  // ----- Inject minimal styles & structure via JS -----
  const style = document.createElement("style");
  style.textContent = `
    .cmp-wrap{position:relative; width:260px; height:260px; margin:16px auto; user-select:none; touch-action:none; font-family:system-ui,Segoe UI,Roboto,Arial;}
    .cmp-dial{position:absolute; inset:0; border-radius:999px; box-shadow:0 6px 20px rgba(0,0,0,.15) inset, 0 6px 20px rgba(0,0,0,.1); background:radial-gradient(circle at 50% 45%, #fff, #f3f4f6 60%, #e5e7eb); border:8px solid #e5e7eb;}
    .cmp-ring{position:absolute; inset:16px; border-radius:999px; border:2px dashed #c7cdd6;}
    .cmp-card{position:absolute; left:50%; top:10px; transform:translateX(-50%); font-weight:700; letter-spacing:.08em;}
    .cmp-card.n{top:12px}
    .cmp-card.s{top:auto; bottom:12px}
    .cmp-card.e{left:auto; right:12px; top:50%; transform:translateY(-50%)}
    .cmp-card.w{left:12px; top:50%; transform:translateY(-50%)}
    .cmp-ticks{position:absolute; inset:22px; border-radius:999px}
    .cmp-ticks div{position:absolute; left:50%; top:0; width:2px; height:12px; background:#9aa3af; transform-origin:50% 108px; opacity:.8}
    .cmp-ticks div.major{height:18px; background:#6b7280}
    .cmp-needle{position:absolute; left:50%; top:50%; width:0; height:0; transform-origin:50% 50%;}
    .cmp-needle .north, .cmp-needle .south{position:absolute; left:-8px; width:16px; height:110px; clip-path:polygon(50% 0, 100% 100%, 0 100%); transform:translate(-50%,-100%);}
    .cmp-needle .north{top:-6px; background:linear-gradient(#ef4444, #b91c1c)}
    .cmp-needle .south{top:6px; transform:rotate(180deg) translate(50%, 0); background:linear-gradient(#1f2937, #000)}
    .cmp-cap{position:absolute; left:50%; top:50%; width:18px; height:18px; border-radius:999px; transform:translate(-50%, -50%); background:#fff; box-shadow:0 0 0 2px #111 inset, 0 1px 6px rgba(0,0,0,.4)}
    .cmp-readout{margin-top:280px; text-align:center; font-size:14px; color:#111}
    .cmp-badge{display:inline-block; font-variant-numeric:tabular-nums; background:#f3f4f6; padding:.35rem .6rem; border-radius:.75rem; box-shadow: inset 0 0 0 1px #e5e7eb}
    .cmp-btn{display:inline-block; margin-top:8px; padding:.55rem .9rem; border-radius:.75rem; background:#111; color:#fff; cursor:pointer; font-size:14px}
    .cmp-note{font-size:12px; color:#6b7280; margin-top:6px}
    @media (max-width:360px){ .cmp-wrap{width:200px; height:200px} .cmp-readout{margin-top:216px} }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.className = "cmp-wrap";
  wrap.innerHTML = `
    <div class="cmp-dial"></div>
    <div class="cmp-ring"></div>
    <div class="cmp-card n">N</div>
    <div class="cmp-card e">E</div>
    <div class="cmp-card s">S</div>
    <div class="cmp-card w">W</div>
    <div class="cmp-ticks"></div>
    <div class="cmp-needle" aria-hidden="true">
      <div class="north"></div>
      <div class="south"></div>
    </div>
    <div class="cmp-cap"></div>
    <div class="cmp-readout">
      <div><span class="cmp-badge" id="cmpDeg">--.-°</span> <span class="cmp-badge" id="cmpDir">---</span></div>
      <div class="cmp-note" id="cmpNote">Enable motion/compass permission to start.</div>
      <div><button class="cmp-btn" id="cmpBtn" type="button" style="display:none">Enable Compass</button></div>
    </div>
  `;
  root.appendChild(wrap);

  // Degree ticks (every 10°, bold at 0/90/180/270)
  const ticks = wrap.querySelector(".cmp-ticks");
  for (let i = 0; i < 360; i += 10) {
    const t = document.createElement("div");
    t.style.transform = `rotate(${i}deg) translateX(-1px)`;
    if (i % 90 === 0) t.classList.add("major");
    ticks.appendChild(t);
  }

  const needle = wrap.querySelector(".cmp-needle");
  const degEl  = wrap.querySelector("#cmpDeg");
  const dirEl  = wrap.querySelector("#cmpDir");
  const noteEl = wrap.querySelector("#cmpNote");
  const btnEl  = wrap.querySelector("#cmpBtn");

  // Heading helpers
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const toDir = d => dirs[Math.round(d/22.5) % 16];
  const norm = d => (d % 360 + 360) % 360;

  // Screen orientation compensation
  const screenAngle = () => {
    const a = (screen.orientation && typeof screen.orientation.angle === "number")
      ? screen.orientation.angle
      : (window.orientation || 0);
    return Number(a) || 0; // 0, 90, 180, 270
  };

  // Simple low-pass filter for smoother motion
  let smooth = null;
  const smoothen = (val) => {
    const alpha = 0.15; // higher = more responsive, lower = smoother
    if (smooth === null) smooth = val;
    // handle wrap-around (e.g., 359 -> 1)
    const diff = ((val - smooth + 540) % 360) - 180;
    smooth = norm(smooth + diff * alpha);
    return smooth;
  };

  // Compute heading from generic DeviceOrientation (alpha, beta, gamma) if needed
  // (Fallback when no webkitCompassHeading; assumes alpha=0 points North in absolute mode)
  const computeHeadingFromAlpha = (alpha, absoluteFlag) => {
    if (alpha == null) return null;
    // Many browsers report alpha clockwise from device top. We want "compass heading" clockwise from North.
    // For most cases, heading ≈ alpha. Some prefer 360 - alpha; we’ll compensate using a quick sanity check by testing both.
    // Choose 360 - alpha so that increasing alpha when turning right yields increasing heading clockwise.
    let heading = 360 - alpha;
    heading = norm(heading - screenAngle()); // adjust for screen rotation
    return absoluteFlag === false ? null : norm(heading);
  };

  // Permission flow (iOS 13+ requires user gesture)
  const needsPermission =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function";

  const secureContext = location.protocol === "https:" || location.hostname === "localhost";

  const start = async () => {
    if (!secureContext) {
      noteEl.textContent = "Compass needs HTTPS or localhost.";
      btnEl.style.display = "none";
      return;
    }
    if (needsPermission) {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== "granted") {
          noteEl.textContent = "Permission denied. Tap to try again.";
          btnEl.style.display = "";
          return;
        }
      } catch {
        noteEl.textContent = "Permission request failed. Tap to retry.";
        btnEl.style.display = "";
        return;
      }
    }
    subscribe();
  };

  const onReading = (deg) => {
    const sm = smoothen(norm(deg));
    needle.style.transform = `translate(-50%, -50%) rotate(${sm}deg)`;
    degEl.textContent = sm.toFixed(1) + "°";
    dirEl.textContent = toDir(sm);
  };

  let subscribed = false;

  const handleDO = (e) => {
    // iOS Safari provides webkitCompassHeading (0=N, clockwise)
    let heading = (typeof e.webkitCompassHeading === "number") ? e.webkitCompassHeading : null;

    if (heading == null) {
      // Some browsers provide "compassHeading" on absolute events
      heading = (typeof e.compassHeading === "number") ? e.compassHeading : null;
    }

    if (heading == null) {
      // Try computing from alpha (absolute orientation)
      heading = computeHeadingFromAlpha(e.alpha, e.absolute);
    }

    if (heading != null && isFinite(heading)) {
      noteEl.textContent = "Pointing to magnetic North.";
      onReading(heading);
    } else {
      noteEl.textContent = "No compass data available on this device/browser.";
    }
  };

  const subscribe = () => {
    if (subscribed) return;
    subscribed = true;
    noteEl.textContent = "Calibrating… move your phone in a ∞ pattern.";
    // Prefer 'deviceorientationabsolute' if available
    const handler = (e) => handleDO(e);
    // Some browsers fire both; keep one listener each, handler is tolerant
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    // Update when screen rotates so heading remains true to world
    (screen.orientation || {}).addEventListener?.("change", () => {
      smooth = null; // reset smoothing to avoid jump
    });
  };

  // Show button only if permission API exists; otherwise start immediately
  if (needsPermission) {
    btnEl.style.display = "";
    btnEl.addEventListener("click", start, { passive:true });
  } else {
    start();
  }
})();

