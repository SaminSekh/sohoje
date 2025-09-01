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
  const mountId = "compasQ";
  const root = document.getElementById(mountId);
  if (!root) { console.error("#" + mountId + " not found"); return; }

  // ----- Style -----
  const style = document.createElement("style");
  style.textContent = `
    .cmp-wrap{position:relative; width:260px; height:260px; margin:16px auto; font-family:system-ui,Segoe UI,Roboto,Arial;}
    .cmp-dial{position:absolute; inset:0; border-radius:50%; background:#f9fafb; border:8px solid #e5e7eb; box-shadow:0 4px 12px rgba(0,0,0,.15) inset;}
    .cmp-ring{position:absolute; inset:16px; border-radius:50%; border:2px dashed #cbd5e1;}
    .cmp-card{position:absolute; left:80%; font-weight:bold; font-size:14px;}
    .cmp-card.n{top:10px; transform:translateX(-280%);}
    .cmp-card.s{bottom:10px; transform:translateX(-225%);}
    .cmp-card.e{right:10px; top:50%; transform:translateY(-45%);}
    .cmp-card.w{left:10px; top:50%; transform:translateY(-50%); rotate:260deg;}
    .cmp-ticks{position:absolute; inset:22px; border-radius:50%;}
    .cmp-ticks div{position:absolute; left:50%; top:0; width:2px; height:12px; background:#94a3b8; transform-origin:50% 108px;}
    .cmp-ticks div.major{height:18px; background:#475569;}
    .cmp-needle{position:absolute; left:50%; top:50%; width:0; height:0; transform:translate(-50%, -50%);}
    .cmp-needle .north{position:absolute; left:-8px; top:-100px; width:16px; height:100px; background:linear-gradient(#ef4444,#b91c1c); clip-path:polygon(50% 0,100% 100%,0 100%);}
    .cmp-cap{position:absolute; left:50%; top:50%; width:18px; height:18px; border-radius:50%; transform:translate(-50%, -50%); background:#fff; box-shadow:0 0 0 2px #111 inset;}
    .cmp-readout{margin-top:280px; text-align:center; font-size:14px;}
    .cmp-badge{display:inline-block; background:#f1f5f9; padding:.35rem .6rem; border-radius:.75rem; font-variant-numeric:tabular-nums;}
    .cmp-btn{display:inline-block; margin-top:8px; padding:.5rem .9rem; border-radius:.75rem; background:#111; color:#fff; cursor:pointer;}
    .cmp-note{font-size:12px; color:#6b7280; margin-top:6px;}
  `;
  document.head.appendChild(style);

  // ----- Structure -----
  const wrap = document.createElement("div");
  wrap.className = "cmp-wrap";
  wrap.innerHTML = `
    <div class="cmp-dial">
      <div class="cmp-ring"></div>
      <div class="cmp-card n">উত্তর</div>
      <div class="cmp-card e">পূর্ব</div>
      <div class="cmp-card s">দক্ষিন</div>
      <div class="cmp-card w"> <img src="https://cdn-icons-png.flaticon.com/512/10203/10203988.png" alt="" style="width: 30px;"></div></div>
      <div class="cmp-ticks"></div>
    </div>
    <div class="cmp-needle">
      <div class="north"></div>
    </div>
    <div class="cmp-cap"></div>
    <div class="cmp-readout">
      <div><span class="cmp-badge" id="cmpDeg">--.-°</span> <span class="cmp-badge" id="cmpDir">---</span></div>
      <div class="cmp-note" id="cmpNote">Enable motion/compass permission to start.</div>
      <div><button class="cmp-btn" id="cmpBtn" type="button" style="display:none">Enable Compass</button></div>
    </div>
  `;
  root.appendChild(wrap);

  // ----- Ticks -----
  const ticks = wrap.querySelector(".cmp-ticks");
  for (let i = 0; i < 360; i += 10) {
    const t = document.createElement("div");
    t.style.transform = `rotate(${i}deg) translateX(-1px)`;
    if (i % 90 === 0) t.classList.add("major");
    ticks.appendChild(t);
  }

  const dial   = wrap.querySelector(".cmp-dial");
  const ring   = wrap.querySelector(".cmp-ring");
  const ticksEl= wrap.querySelector(".cmp-ticks");
  const degEl  = wrap.querySelector("#cmpDeg");
  const dirEl  = wrap.querySelector("#cmpDir");
  const noteEl = wrap.querySelector("#cmpNote");
  const btnEl  = wrap.querySelector("#cmpBtn");

  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  const toDir = d => dirs[Math.round(d/22.5) % 16];
  const norm = d => (d % 360 + 360) % 360;

  let smooth = null;
  const smoothen = (val) => {
    const alpha = 0.15;
    if (smooth === null) smooth = val;
    const diff = ((val - smooth + 540) % 360) - 180;
    smooth = norm(smooth + diff * alpha);
    return smooth;
  };

  const onReading = (deg) => {
    const sm = smoothen(norm(deg));
    dial.style.transform   = `rotate(${-sm}deg)`;
    ring.style.transform   = `rotate(${-sm}deg)`;
    ticksEl.style.transform= `rotate(${-sm}deg)`;
    degEl.textContent = sm.toFixed(1) + "°";
    dirEl.textContent = toDir(sm);
  };

  // Heading helpers
  const screenAngle = () => {
    const a = (screen.orientation && typeof screen.orientation.angle === "number")
      ? screen.orientation.angle
      : (window.orientation || 0);
    return Number(a) || 0;
  };
  const computeHeadingFromAlpha = (alpha, absoluteFlag) => {
    if (alpha == null) return null;
    let heading = 360 - alpha;
    heading = norm(heading - screenAngle());
    return absoluteFlag === false ? null : norm(heading);
  };

  // Permission flow
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

  const handleDO = (e) => {
    let heading = (typeof e.webkitCompassHeading === "number") ? e.webkitCompassHeading : null;
    if (heading == null) heading = (typeof e.compassHeading === "number") ? e.compassHeading : null;
    if (heading == null) heading = computeHeadingFromAlpha(e.alpha, e.absolute);

    if (heading != null && isFinite(heading)) {
      noteEl.textContent = "Pointing to magnetic North.";
      onReading(heading);
    } else {
      noteEl.textContent = "";
    }
  };

  const subscribe = () => {
    window.addEventListener("deviceorientationabsolute", handleDO, true);
    window.addEventListener("deviceorientation", handleDO, true);
  };

  if (needsPermission) {
    btnEl.style.display = "";
    btnEl.addEventListener("click", start, { passive:true });
  } else {
    start();
  }
})();

