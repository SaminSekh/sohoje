// Sidebar toggle (mobile)
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const menuCloseBtns = document.querySelectorAll(".menuClose");

// Open / Toggle
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // নিজের ক্লিক bubble না হোক
  sidebar.classList.toggle("open");
});

// Close (for all close buttons)
menuCloseBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sidebar.classList.remove("open");
  });
});

// Click outside to close
document.addEventListener("click", (e) => {
  if (
    sidebar.classList.contains("open") && // মেনু খোলা আছে
    !sidebar.contains(e.target) && // ক্লিক সাইডবারের ভেতরে নয়
    e.target !== menuBtn // মেনু বোতামে নয়
  ) {
    sidebar.classList.remove("open");
  }
});

// Theme toggle with localStorage
const themeBtn = document.getElementById("themeBtn");
const themeLabel = document.getElementById("themeLabel");

function setTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  themeLabel.textContent = mode === "dark" ? "লাইট" : "ডার্ক";
}

const saved = localStorage.getItem("theme");
setTheme(
  saved ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light")
);

themeBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "light" ? "dark" : "light");
});


// লেখা চলা   ###################################################

let runningFont = document.getElementById("runFont");
runningFont.innerText =
  " রাব্বি জিদনি ইলমা 💎 রাব্বি জিদনি ইলমা 💎 রাব্বি জিদনি ইলমা 💎 আল্লাহই যথেষ্ট : ‘হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল, নিমাল মাওলা ওয়া নিমান নাসির।’ 💎 ";

// Accessible Accordion ###################################################
const headers = document.querySelectorAll(".accordion-header");

headers.forEach((btn) => {
  btn.addEventListener("click", () => togglePanel(btn));
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePanel(btn);
    }
  });
});

function togglePanel(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panelId = btn.getAttribute("aria-controls");
  const panel = document.getElementById(panelId);

  // শুধুমাত্র ক্লিক করা আইটেমটি টগল করুন
  btn.setAttribute("aria-expanded", String(!expanded));
  panel.classList.toggle("open");

  // Smooth scroll into view when opened on mobile
  if (!expanded) {
    setTimeout(() => {
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 200);
  }
}

// শেয়ার কন্টেন্ট  ###################################################

document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".dua-card");

  items.forEach((item) => {
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
      shareIcon.addEventListener("click", async function () {
        // accordion-item এর লেখাগুলি (HTML বাদ দিয়ে, লাইন মেইনটেন করে)
        const textContent = item.innerText.trim();

        // সাইট লিংক শেষে যোগ করা
        const shareText = `${textContent}\n\nআরো এমন তথ্য ও হাদিস পেতে ভিজিট করুন:\n${window.location.href}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: document.title,
              text: shareText,
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
  clickDiv.addEventListener("click", function () {
    clickCount++;
    if (clickCount === 5) {
      hiddenDiv.style.display = "block";
    }
  });
}

//app shortcut          ###################################################
// Service Worker রেজিস্টার
if ("serviceWorker" in navigator) {
  // Determine correct path to sw.js based on current location
  const isSubPage = window.location.pathname.includes('/pages/');
  const swPath = isSubPage ? '../sw.js' : 'sw.js';

  navigator.serviceWorker
    .register(swPath)
    .then(() => console.log("✅ Service Worker Registered: " + swPath))
    .catch((err) => console.log("❌ SW Registration Failed", err));
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Initially hide the install button if not supported immediately
if (installBtn) {
  installBtn.style.display = "none";
}

// Install prompt event ধরার জন্য
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // বাটন দেখাও
  if (installBtn) {
    installBtn.style.display = "flex";
  }
});

// বাটনে ক্লিক করলে prompt দেখাবে
if (installBtn) {
  installBtn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("✅ User accepted install");
          installBtn.style.display = "none";
        } else {
          console.log("❌ User dismissed install");
        }
        deferredPrompt = null;
      });
    } else {
      // Fallback message for iOS or others
      alert("এই অ্যাপটি আপনার ডিভাইসে ইন্সটল করতে ব্রাউজার মেনু থেকে 'Add to Home Screen' সিলেক্ট করুন।");
    }
  });
}

// Hide button if already installed
window.addEventListener("appinstalled", () => {
  if (installBtn) {
    installBtn.style.display = "none";
  }
  console.log("✅ PWA installed");
});

// JavaScript code for Premium Qibla Compass ###################################################

(() => {
  const mountId = "compasQ";
  const root = document.getElementById(mountId);
  if (!root) return;

  const MECCA = { lat: 21.4225, lng: 39.8262 };

  const style = document.createElement("style");
  style.textContent = `
    .qibla-wrapper {
      position: relative;
      width: 100%;
      max-width: 850px;
      margin: 20px auto;
      background: var(--card);
      border-radius: 30px;
      padding: 40px 20px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      text-align: center;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    .qibla-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 5px;
    }

    .qibla-subtitle {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 30px;
    }

    .compass-container {
      position: relative;
      width: 280px;
      height: 280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .compass-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
      border: 8px solid var(--border);
      box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
    }

    .compass-dial-v2 {
      position: absolute;
      width: 100%;
      height: 100%;
      transition: transform 0.2s cubic-bezier(0.1, 0, 0.3, 1);
      will-change: transform;
    }

    .direction-mark {
      position: absolute;
      font-weight: 800;
      font-size: 1.2rem;
      color: var(--text);
    }

    .mark-n { top: 15px; left: 50%; transform: translateX(-50%); color: #ef4444; }
    .mark-e { right: 15px; top: 50%; transform: translateY(-50%); }
    .mark-s { bottom: 15px; left: 50%; transform: translateX(-50%); }
    .mark-w { left: 15px; top: 50%; transform: translateY(-50%); }

    .needle-v2 {
      position: absolute;
      width: 16px;
      height: 100%;
      z-index: 10;
      pointer-events: none;
    }

    .needle-top {
      position: absolute;
      top: 20%;
      left: 0;
      width: 0;
      height: 30%;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 80px solid #ef4444;
    }

    .needle-bottom {
      position: absolute;
      bottom: 20%;
      left: 0;
      width: 0;
      height: 30%;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 80px solid var(--muted);
      opacity: 0.5;
    }
    
    .center-cap {
      position: absolute;
      width: 24px;
      height: 24px;
      background: var(--text);
      border-radius: 50%;
      border: 4px solid var(--card);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      z-index: 11;
    }

    .kaaba-pointer {
      position: absolute;
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
      z-index: 5;
    }

    .kaaba-icon-v2 {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 45px;
      height: 45px;
      background: url('https://cdn-icons-png.flaticon.com/512/10203/10203988.png') no-repeat center;
      background-size: contain;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    }

    .qibla-stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 30px;
    }

    .qibla-stat-box {
      background: var(--card);
      padding: 15px 25px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }

    .stat-val-v2 {
      display: block;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--accent);
    }

    .stat-label-v2 {
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .qibla-btn-v2 {
      margin-top: 30px;
      background: var(--banner-grad);
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 100px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
      transition: all 0.3s ease;
    }

    .qibla-btn-v2:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4);
    }

    .status-note {
      margin-top: 15px;
      font-size: 0.85rem;
      color: var(--muted);
    }

    @media (max-width: 600px) {
      .compass-container { width: 240px; height: 240px; }
      .qibla-stats { gap: 15px; }
    }
  `;
  document.head.appendChild(style);

  container = document.createElement("div");
  container.className = "qibla-wrapper";
  container.innerHTML = `
    <div class="qibla-title">কিবলা কম্পাস</div>
    <div class="qibla-subtitle">আপনার অবস্থানের সঠিক কিবলা জানুন</div>
    
    <div class="compass-container">
      <div class="compass-bg"></div>
      <div class="compass-dial-v2" id="v2Dial">
        <div class="direction-mark mark-n">N</div>
        <div class="direction-mark mark-e">E</div>
        <div class="direction-mark mark-s">S</div>
        <div class="direction-mark mark-w">W</div>
      </div>
      <div class="kaaba-pointer" id="v2Kaaba">
        <div class="kaaba-icon-v2"></div>
      </div>
      <div class="needle-v2">
        <div class="needle-top"></div>
        <div class="needle-bottom"></div>
      </div>
      <div class="center-cap"></div>
    </div>

    <div class="qibla-stats">
      <div class="qibla-stat-box">
        <span class="stat-val-v2" id="v2Heading">--.-°</span>
        <span class="stat-label-v2">হেডিং</span>
      </div>
      <div class="qibla-stat-box">
        <span class="stat-val-v2" id="v2Qibla">--.-°</span>
        <span class="stat-label-v2">কিবলা</span>
      </div>
    </div>

    <button class="qibla-btn-v2" id="v2StartBtn">কম্পাস চালু করুন</button>
    <div class="status-note" id="v2Note">সঠিক দিক জানতে লোকেশন ও কম্পাস পারমিশন দিন</div>
  `;
  root.appendChild(container);

  const dial = container.querySelector("#v2Dial");
  const kaaba = container.querySelector("#v2Kaaba");
  const headingEl = container.querySelector("#v2Heading");
  const qiblaEl = container.querySelector("#v2Qibla");
  const noteEl = container.querySelector("#v2Note");
  const startBtn = container.querySelector("#v2StartBtn");

  let qiblaAngle = null;
  let currentHeading = 0;

  function calculateQibla(lat, lng) {
    const phiK = (MECCA.lat * Math.PI) / 180;
    const lambdaK = (MECCA.lng * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda = (lng * Math.PI) / 180;
    const q = Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
    return ((q * 180) / Math.PI + 360) % 360;
  }

  function updateV2(heading) {
    currentHeading = heading;
    dial.style.transform = `rotate(${-heading}deg)`;
    if (qiblaAngle !== null) {
      kaaba.style.transform = `rotate(${qiblaAngle - heading}deg)`;
      qiblaEl.textContent = qiblaAngle.toFixed(1) + "°";
    }
    headingEl.textContent = heading.toFixed(1) + "°";
  }

  async function syncLoc() {
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(p => res(p.coords), e => rej(e)));
      qiblaAngle = calculateQibla(pos.latitude, pos.longitude);
      noteEl.textContent = "আপনার লোকেশন অনুযায়ী কিবলা সেট করা হয়েছে।";
    } catch (e) {
      qiblaAngle = calculateQibla(23.8103, 90.4125); // Default Dhaka
      noteEl.textContent = "ডিফল্ট হিসেবে ঢাকা সেট করা হয়েছে।";
    }
  }

  const handleMotion = (e) => {
    let heading = null;
    if (e.webkitCompassHeading !== undefined) heading = e.webkitCompassHeading;
    else if (e.absolute === true || e.absolute === undefined) heading = (360 - e.alpha) % 360;
    if (heading !== null) updateV2(heading);
  };

  const startV2 = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') {
          window.addEventListener('deviceorientation', handleMotion, true);
          startBtn.style.display = "none";
        }
      } catch (e) { noteEl.textContent = "পারমিশন এরর!"; }
    } else {
      window.addEventListener('deviceorientationabsolute', handleMotion, true);
      window.addEventListener('deviceorientation', handleMotion, true);
      startBtn.style.display = "none";
    }
  };

  startBtn.addEventListener("click", startV2);
  syncLoc();
})();

// Ramadan ###########################################################################

async function initializeRamadanWidget() {
  const container = document.getElementById("ramadanWidget");
  if (!container) return;

  try {
    let latitude, longitude, locationName, method;

    // Reuse location from localStorage if available
    const savedLocation = localStorage.getItem("selectedLocation");
    const savedMethod = localStorage.getItem("selectedMethod");

    if (savedLocation) {
      const locationData = JSON.parse(savedLocation);
      latitude = locationData.latitude;
      longitude = locationData.longitude;
      locationName = locationData.name;
    } else {
      const coords = await getUserLocation();
      latitude = coords.latitude;
      longitude = coords.longitude;
      locationName = await getLocationName(latitude, longitude);
    }
    method = savedMethod || "2";

    // Get current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let hijriYear;
    try {
      // Fetch current Hijri date to get current Hijri year
      const response = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(now.getTime() / 1000)}?latitude=${latitude}&longitude=${longitude}&method=${method}`);
      const data = await response.json();

      if (data.code !== 200) throw new Error("API Error");

      const todayHijri = data.data.date.hijri;
      hijriYear = parseInt(todayHijri.year);

      // If current hijri month is > 9 (Ramadan), it means Ramadan of this year passed
      if (parseInt(todayHijri.month.number) > 9) {
        hijriYear += 1;
      }
    } catch (e) {
      console.warn("Hijri detection failed, using approximate year:", e);
      // Fallback: If current time is early 2026, Hijri year is likely 1447
      hijriYear = (year === 2026) ? 1447 : 1446;
    }

    // Fetch the calendar for the 9th Hijri month (Ramadan)
    // Using correct endpoint: hijriCalendar
    const ramadanRes = await fetch(`https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/9?latitude=${latitude}&longitude=${longitude}&method=${method}`);
    const ramadanData = await ramadanRes.json();

    if (ramadanData.code !== 200) {
      throw new Error(`Ramadan API Error: ${ramadanData.data || 'Status ' + ramadanData.code}`);
    }

    renderRamadanUI(ramadanData.data, locationName, hijriYear);
  } catch (error) {
    console.error("Ramadan Error:", error);
    container.innerHTML = `<div class="loader" style="color:var(--text);">রমজানের সময়সূচী লোড করা সম্ভব হয়নি। <br><small>${error.message}</small><br><br><button onclick="initializeRamadanWidget()" style="background:var(--accent); border:none; color:white; padding:8px 15px; border-radius:8px; cursor:pointer;">পুনরায় চেষ্টা করুন</button></div>`;
  }
}

function renderRamadanUI(days, location, hijriYear) {
  const container = document.getElementById("ramadanWidget");
  if (!container) return;

  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  let todayData = null;
  let tableRows = "";

  days.forEach((day, index) => {
    const isToday = day.date.gregorian.date === todayStr;
    if (isToday) todayData = day;

    const sehri = day.timings.Fajr.split(" ")[0];
    const iftar = day.timings.Maghrib.split(" ")[0];

    // Convert to Bengali Numbers
    const bnDate = toBengaliNumber(day.date.gregorian.day);
    const bnMonth = getBengaliMonthName(day.date.gregorian.month.number);
    const bnWeekday = getBengaliWeekdayName(day.date.gregorian.weekday.en);
    const bnSehri = toBengaliTime(sehri);
    const bnIftar = toBengaliTime(iftar);

    tableRows += `
      <tr class="${isToday ? 'today' : ''}">
        <td>${toBengaliNumber(index + 1)}</td>
        <td>
          ${bnDate} ${bnMonth}
          <span class="date-bn">${bnWeekday}</span>
        </td>
        <td>${bnSehri}</td>
        <td>${bnIftar}</td>
      </tr>
    `;
  });

  // Calculate countdown if today is in Ramadan
  let currentStatusHTML = "";
  if (todayData) {
    currentStatusHTML = `
      <div class="current-status">
        <div class="status-card">
          <span class="status-label">আজকের সেহরি</span>
          <span class="status-time">${toBengaliTime(todayData.timings.Fajr.split(" ")[0])}</span>
        </div>
        <div class="status-card">
          <span class="status-label">আজকের ইফতার</span>
          <span class="status-time">${toBengaliTime(todayData.timings.Maghrib.split(" ")[0])}</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="ramadan-header">
      <h2>পবিত্র রমজান ${toBengaliNumber(hijriYear)}</h2>
      <p>স্থান: ${location}</p>
      ${currentStatusHTML}
      <div style="margin-top: 15px;">
        <button id="ramadanLocationToggle" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); padding: 8px 15px; border-radius: 20px; color: white; cursor: pointer; font-size: 0.85rem; backdrop-filter: blur(5px);">
          🌍 অবস্থান পরিবর্তন করুন
        </button>
      </div>
    </div>
    <div id="ramadanLocationSelector" style="display: none; margin-bottom: 25px; background: var(--card); padding: 20px; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow);">
      <h3 style="margin-top: 0; color: var(--text); font-size: 1.1rem; margin-bottom: 15px;">লোকেশন সেট করুন</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <button id="ramadanAutoDetect" style="flex: 1; background: #22c55e; border: none; padding: 10px; border-radius: 12px; color: white; cursor: pointer; font-weight: 600;">
              অটো ডিটেক্ট
          </button>
          <button id="ramadanManualBtn" style="flex: 1; background: #0ea5e9; border: none; padding: 10px; border-radius: 12px; color: white; cursor: pointer; font-weight: 600;">
              ম্যানুয়াল লিখুন
          </button>
      </div>
      
      <div id="ramadanManualInput" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <input type="text" id="ramadanCity" placeholder="শহর (যেমন: Dhaka)" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
              <input type="text" id="ramadanCountry" placeholder="দেশ (যেমন: Bangladesh)" style="padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
          </div>
          <button id="ramadanSearchBtn" style="background: var(--banner-grad); border: none; padding: 10px; border-radius: 12px; color: white; cursor: pointer; width: 100%; font-weight: 600;">
              খুঁজুন ও সেট করুন
          </button>
      </div>
    </div>
    <div class="ramadan-table-container">
      <table class="ramadan-table">
        <thead>
          <tr>
            <th>রোজা</th>
            <th>তারিখ</th>
            <th>সেহরি</th>
            <th>ইফতার</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  // Attach Event Listeners for Location
  const toggleBtn = document.getElementById("ramadanLocationToggle");
  const selector = document.getElementById("ramadanLocationSelector");
  const autoBtn = document.getElementById("ramadanAutoDetect");
  const manualBtn = document.getElementById("ramadanManualBtn");
  const manualInput = document.getElementById("ramadanManualInput");
  const searchBtn = document.getElementById("ramadanSearchBtn");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      selector.style.display = selector.style.display === "none" ? "block" : "none";
      selector.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  if (autoBtn) {
    autoBtn.addEventListener("click", () => {
      localStorage.removeItem("selectedLocation");
      initializeRamadanWidget();
    });
  }

  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      manualInput.style.display = "block";
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const city = document.getElementById("ramadanCity").value;
      const country = document.getElementById("ramadanCountry").value;
      if (city && country) {
        try {
          searchBtn.innerText = "খোঁজা হচ্ছে...";
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ", " + country)}&accept-language=bn`);
          const data = await res.json();
          if (data.length > 0) {
            const loc = {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon),
              name: data[0].display_name
            };
            localStorage.setItem("selectedLocation", JSON.stringify(loc));
            initializeRamadanWidget();
          } else {
            alert("দুঃখিত, এই স্থানটি খুঁজে পাওয়া যায়নি।");
            searchBtn.innerText = "খুঁজুন ও সেট করুন";
          }
        } catch (e) {
          alert("লোকেশন সেট করতে সমস্যা হয়েছে।");
          searchBtn.innerText = "খুঁজুন ও সেট করুন";
        }
      } else {
        alert("শহর এবং দেশের নাম উভয়ই লিখুন।");
      }
    });
  }
}

function toBengaliNumber(n) {
  const bn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().split("").map(d => (/\d/.test(d) ? bn[parseInt(d)] : d)).join("");
}

function toBengaliTime(timeStr) {
  if (!timeStr) return "--:--";
  // Use existing formatTime if available, or simple conversion
  const formatted = typeof formatTime === 'function' ? formatTime(timeStr) : timeStr;

  // Replace AM/PM with Bengali
  let result = formatted.replace("AM", "এএম").replace("PM", "পিএম");
  return toBengaliNumber(result);
}

function getBengaliMonthName(m) {
  const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
  return months[parseInt(m) - 1];
}

function getBengaliWeekdayName(w) {
  const days = {
    "Monday": "সোমবার",
    "Tuesday": "মঙ্গলবার",
    "Wednesday": "বুধবার",
    "Thursday": "বৃহস্পতিবার",
    "Friday": "শুক্রবার",
    "Saturday": "শনিবার",
    "Sunday": "রবিবার"
  };
  return days[w] || w;
}

// Initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeRamadanWidget);
} else {
  initializeRamadanWidget();
}

// pray time ###########################################################################

// Prayer Time API থেকে নামাজের সময় পাওয়ার ফাংশন
async function getPrayerTimes(latitude, longitude, method = 2) {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const today = date.getDate();

  // API থেকে নামাজের সময় পাওয়া
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 200 && data.data && data.data.length > 0) {
      const todayData = data.data[today - 1];

      if (!todayData || !todayData.timings) {
        throw new Error("Invalid data structure from API");
      }

      return {
        fajr: todayData.timings.Fajr || "05:00 (AM)",
        dhuhr: todayData.timings.Dhuhr || "12:00 (PM)",
        asr: todayData.timings.Asr || "15:30 (PM)",
        maghrib: todayData.timings.Maghrib || "18:00 (PM)",
        isha: todayData.timings.Isha || "19:30 (PM)",
        sunrise: todayData.timings.Sunrise || "06:00 (AM)",
        sunset: todayData.timings.Sunset || "18:00 (PM)",
        date:
          todayData.date?.readable || new Date().toLocaleDateString("bn-BD"),
      };
    } else {
      throw new Error("Invalid response from prayer time API");
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error);

    // Fallback prayer times in case of API failure
    return {
      fajr: "05:00 (AM)",
      dhuhr: "12:00 (PM)",
      asr: "15:30 (PM)",
      maghrib: "18:00 (PM)",
      isha: "19:30 (PM)",
      sunrise: "06:00 (AM)",
      sunset: "18:00 (PM)",
      date: new Date().toLocaleDateString("bn-BD"),
    };
  }
}

// সময় ফরম্যাট করার ফাংশন (24h থেকে 12h) - আরও robust version
function formatTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    return "--:-- --";
  }

  try {
    // যদি সময় ইতিমধ্যে ফরম্যাট করা থাকে
    if (timeStr.includes("(") && timeStr.includes(")")) {
      return timeStr;
    }

    const [time, period] = timeStr.split(" ");
    if (!time) return "--:-- --";

    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) return "--:-- --";

    return `${hours}:${minutes} ${period || ""}`.trim();
  } catch (error) {
    console.error("Error formatting time:", error, timeStr);
    return "--:-- --";
  }
}

// সময় স্ট্রিং থেকে মিনিটে রূপান্তর - আরও robust version
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  try {
    // যদি সময় ইতিমধ্যে ফরম্যাট করা থাকে
    let timePart = timeStr;
    if (timeStr.includes("(") && timeStr.includes(")")) {
      timePart = timeStr.split("(")[0].trim();
    }

    const [time, period] = timePart.split(" ");
    if (!time) return 0;

    let [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;

    // 12-hour to 24-hour conversion
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error converting time to minutes:", error, timeStr);
    return 0;
  }
}

// পরবর্তী নামাজ এবং কাউন্টডাউন গণনা
function getNextPrayerAndCountdown(prayerTimes) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday

  const prayers = [
    { name: "ফজর", time: prayerTimes.fajr, key: "fajr" },
    { name: "যোহর", time: prayerTimes.dhuhr, key: "dhuhr" },
    { name: "আসর", time: prayerTimes.asr, key: "asr" },
    { name: "মাগরিব", time: prayerTimes.maghrib, key: "maghrib" },
    { name: "ইশা", time: prayerTimes.isha, key: "isha" },
  ];

  // নামাজের সময় মিনিটে রূপান্তর
  const prayerMinutes = prayers.map((prayer) => {
    return {
      name: prayer.name,
      key: prayer.key,
      minutes: timeToMinutes(prayer.time),
      formattedTime: formatTime(prayer.time),
    };
  });

  // বর্তমানে চলমান নামাজ খুঁজে বের করা
  let currentPrayer = null;
  for (let i = 0; i < prayerMinutes.length; i++) {
    const current = prayerMinutes[i];
    const next = prayerMinutes[i + 1];

    if (next) {
      if (currentTime >= current.minutes && currentTime < next.minutes) {
        currentPrayer = current;
        break;
      }
    } else {
      // শেষ নামাজ (ইশা) থেকে পরদিন ফজর পর্যন্ত
      if (currentTime >= current.minutes) {
        currentPrayer = current;
      }
    }
  }

  // পরবর্তী নামাজ খুঁজে বের করা
  let nextPrayer = null;
  for (const prayer of prayerMinutes) {
    if (prayer.minutes > currentTime) {
      nextPrayer = prayer;
      break;
    }
  }

  // যদি সব নামাজ হয়ে গিয়ে থাকে, তাহলে পরের দিনের ফজর দেখাবে
  if (!nextPrayer) {
    nextPrayer = {
      name: "ফজর",
      key: "fajr",
      minutes: prayerMinutes[0].minutes + 24 * 60, // পরের দিন
      formattedTime: prayerMinutes[0].formattedTime,
    };
  }

  // কাউন্টডাউন গণনা
  const timeRemaining = nextPrayer.minutes - currentTime;
  const hoursRemaining = Math.floor(timeRemaining / 60);
  const minutesRemaining = timeRemaining % 60;

  // জুমার দিনের তারিখ বের করা
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  const jummahDate = nextFriday.toLocaleDateString("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    currentPrayer: currentPrayer ? currentPrayer.name : null,
    currentPrayerTime: currentPrayer ? prayerTimes[currentPrayer.key] : null,
    nextPrayer: nextPrayer.name,
    nextPrayerTime: nextPrayer.formattedTime,
    countdown: `${hoursRemaining} ঘণ্টা ${minutesRemaining} মিনিট`,
    isJummah: currentDay === 5, // Friday
    jummahDate: jummahDate,
    jummahTime: formatTime(prayerTimes.dhuhr), // জুমার সময় সাধারণত যোহরের সময় অনুসারে
  };
}

// UI আপডেট করার ফাংশন
function updatePrayerTimeUI(prayerTimes, location, methodName) {
  const nextPrayerInfo = getNextPrayerAndCountdown(prayerTimes);

  const prayTimeDiv = document.querySelector(".prayTime");
  if (!prayTimeDiv) {
    console.error("PrayTime div not found in DOM");
    return;
  }

  prayTimeDiv.innerHTML = `
        <div style="background: rgb(147 147 147 / 10%); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); color: white; text-align: center; max-width: 850px; margin: 0 auto;">
            <h2 style="margin-top: 0; margin-bottom: 15px; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); color: var(--text);">নামাজের সময়সূচী</h2>
            <p style="margin-bottom: 5px; opacity: 0.9; color: var(--text);">স্থান: ${location || "লোড হচ্ছে..."
    }</p>
            <p style="margin-bottom: 15px; opacity: 0.9; color: var(--text);">পদ্ধতি: ${methodName || "ইসলামিক সোসাইটি"
    } | তারিখ: ${prayerTimes.date}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <!-- বর্তমান নামাজ সেকশন -->
                <div class="smallDivs" style="background: var(--card); padding: 15px; border-radius: 10px; grid-column: span 1;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">${nextPrayerInfo.currentPrayer
      ? "বর্তমান নামাজ"
      : "পরবর্তী নামাজ"
    }</div>
                    <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px; color: var(--text);">
                        ${nextPrayerInfo.currentPrayer ||
    nextPrayerInfo.nextPrayer
    }
                    </div>
                    ${nextPrayerInfo.currentPrayer
      ? `<div style="font-size: 1.1em; color: var(--text);">সময়: ${formatTime(
        nextPrayerInfo.currentPrayerTime
      )}</div>`
      : `<div style="font-size: 1.1em; color: var(--text);">${nextPrayerInfo.nextPrayerTime}, বাকি: ${nextPrayerInfo.countdown}</div>`
    }
                </div>
                
                <!-- পরবর্তী নামাজ সেকশন -->
                <div style="background: var(--card); padding: 15px; border-radius: 10px; grid-column: span 1;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">পরবর্তী নামাজ</div>
                    <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px; color: var(--text);">
                        ${nextPrayerInfo.nextPrayer}
                    </div>
                    <div style="font-size: 1.1em; color: var(--text);">সময়: ${nextPrayerInfo.nextPrayerTime
    }</div>
                    <div style="font-size: 1.1em; color: var(--text);">বাকি: ${nextPrayerInfo.countdown
    }</div>
                </div>
                
                <!-- জুমার নামাজ সেকশন -->
                ${nextPrayerInfo.isJummah
      ? `
                    <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 15px; border-radius: 10px; grid-column: span 2;">
                        <div style="font-weight: 600; margin-bottom: 8px;">আজ জুম্মার দিন</div>
                        <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px;">জুম্মার নামাজ</div>
                        <div style="font-size: 1.1em;">সময়: ${nextPrayerInfo.jummahTime}</div>
                        <div style="font-size: 1.1em;">স্থান: স্থানীয় মসজিদ</div>
                    </div>
                `
      : `
                    <div class="jumaDiv" style="padding: 15px; border-radius: 10px; grid-column: span 2;">
                        <div style="font-weight: 600; margin-bottom: 8px;">পরবর্তী জুম্মা</div>
                        <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px;">${nextPrayerInfo.jummahDate
      }</div>
                        <div style="font-size: 1.1em;">সময়: ${nextPrayerInfo.jummahTime
      }</div>
                        <div style="font-size: 1.1em;">বাকি: ${nextPrayerInfo.isJummah
        ? 0
        : (5 - new Date().getDay() + 7) % 7
      } দিন</div>
                    </div>
                `
    }

                <!-- নিয়মিত নামাজের সময়সূচী -->
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ফজর</div>
                    <div style="color: var(--text);">${formatTime(
      prayerTimes.fajr
    )}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">যোহর${nextPrayerInfo.isJummah ? " (জুমআ)" : ""
    }</div>
                    <div style="color: var(--text);">${formatTime(
      prayerTimes.dhuhr
    )}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">আসর</div>
                    <div style="color: var(--text);">${formatTime(
      prayerTimes.asr
    )}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">মাগরিব</div>
                    <div style="color: var(--text);">${formatTime(
      prayerTimes.maghrib
    )}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px; grid-column: span 2;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ইশা</div>
                    <div style="color: var(--text);">${formatTime(
      prayerTimes.isha
    )}</div>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <button id="locationToggle" style="background: var(--card); border: none; padding: 8px 15px; border-radius: 5px; color: var(--text); cursor: pointer;">
                    অবস্থান পরিবর্তন
                </button>
            </div>
            
            <div id="locationSelector" style="display: none; margin-top: 15px; background: var(--card); padding: 15px; border-radius: 10px;">
                <h3 style="margin-top: 0; color: var(--text);">অবস্থান সিলেক্ট করুন</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="autoDetectBtn" style="flex: 1; background: #4CAF50; border: none; padding: 8px; border-radius: 5px; color: white; cursor: pointer;">
                        অটো ডিটেক্ট
                    </button>
                    <button id="manualSelectBtn" style="flex: 1; background: #2196F3; border: none; padding: 8px; border-radius: 5px; color: white; cursor: pointer;">
                        ম্যানুয়াল সিলেক্ট
                    </button>
                </div>
                
                <div id="manualInput" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="cityInput" placeholder="শহরের নাম" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                        <input type="text" id="countryInput" placeholder="দেশের নাম" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                    </div>
                    <button id="searchLocationBtn" style="background: #FF9800; border: none; padding: 8px 15px; border-radius: 5px; color: white; cursor: pointer; width: 100%;">
                        খুঁজুন
                    </button>
                </div>
                
                <div id="methodSelector" style="margin-top: 10px;">
                    <label for="calculationMethod" style="color: var(--text); display: block; margin-bottom: 5px;">গণনা পদ্ধতি:</label>
                    <select id="calculationMethod" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                        <option value="2">ইসলামিক সোসাইটি অব নর্থ আমেরিকা (ISNA)</option>
                        <option value="1">মুসলিম ওয়ার্ল্ড লীগ (MWL)</option>
                        <option value="3">মিশরীয় জেনারেল অথরিটি অব সার্ভে</option>
                        <option value="4">উম্ম আল-কুরা বিশ্ববিদ্যালয়, মক্কা</option>
                        <option value="5">কুয়েত</option>
                        <option value="7">কাতার</option>
                        <option value="8">সিঙ্গাপুর</option>
                        <option value="9">ইরান</option>
                    </select>
                </div>
            </div>
        </div>
    `;

  // ইভেন্ট লিসেনার যোগ করা
  const toggleBtn = document.getElementById("locationToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const selector = document.getElementById("locationSelector");
      if (selector) {
        selector.style.display =
          selector.style.display === "none" ? "block" : "none";
      }
    });
  }

  const autoDetectBtn = document.getElementById("autoDetectBtn");
  if (autoDetectBtn) {
    autoDetectBtn.addEventListener("click", function () {
      localStorage.removeItem("selectedLocation");
      localStorage.removeItem("selectedMethod");
      initializePrayerTimeWidget();
    });
  }

  const manualSelectBtn = document.getElementById("manualSelectBtn");
  if (manualSelectBtn) {
    manualSelectBtn.addEventListener("click", function () {
      const manualInput = document.getElementById("manualInput");
      if (manualInput) {
        manualInput.style.display = "block";
      }
    });
  }

  const searchBtn = document.getElementById("searchLocationBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", async function () {
      const cityInput = document.getElementById("cityInput");
      const countryInput = document.getElementById("countryInput");

      if (cityInput && countryInput) {
        const city = cityInput.value;
        const country = countryInput.value;

        if (city && country) {
          try {
            // OpenCage API এর বিকল্প হিসেবে Nominatim (OpenStreetMap) ব্যবহার করা হচ্ছে
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                city + ", " + country
              )}&accept-language=bn`
            );
            const data = await response.json();

            if (data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              const locationName = data[0].display_name;

              // লোকেশন স্টোরেজে সেভ করা
              localStorage.setItem(
                "selectedLocation",
                JSON.stringify({
                  latitude: lat,
                  longitude: lng,
                  name: locationName,
                })
              );

              // নির্বাচিত পদ্ধতি
              const methodSelect = document.getElementById("calculationMethod");
              const method = methodSelect ? methodSelect.value : "2";
              localStorage.setItem("selectedMethod", method);

              initializePrayerTimeWidget();
            } else {
              alert("স্থানটি খুঁজে পাওয়া যায়নি।");
            }
          } catch (error) {
            console.error("Error fetching location:", error);
            alert("স্থান খোঁজার过程中 সমস্যা হয়েছে।");
          }
        } else {
          alert("শহর এবং দেশের নাম দিন।");
        }
      }
    });
  }
}

// ব্যবহারকারীর লোকেশন পাওয়ার ফাংশন
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Default to Dhaka, Bangladesh if location access is denied
          console.error("Error getting location, using default (Dhaka)");
          resolve({ latitude: 23.8103, longitude: 90.4125 });
        },
        { timeout: 10000 } // 10 seconds timeout
      );
    }
  });
}

// লোকেশনের নাম পাওয়ার ফাংশন (Reverse Geocoding)
async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=bn`
    );
    const data = await response.json();
    return data.display_name || "আপনার অবস্থান";
  } catch (error) {
    console.error("Error getting location name:", error);
    return "আপনার অবস্থান";
  }
}

// গণনা পদ্ধতির নাম
function getMethodName(methodCode) {
  const methods = {
    1: "মুসলিম ওয়ার্ল্ড লীগ",
    2: "ইসলামিক সোসাইটি অব নর্থ আমেরিকা",
    3: "মিশরীয় জেনারেল অথরিটি",
    4: "উম্ম আল-কুরা বিশ্ববিদ্যালয়",
    5: "কুয়েত",
    7: "কাতার",
    8: "সিঙ্গাপুর",
    9: "ইরান",
  };
  return methods[methodCode] || "ইসলামিক সোসাইটি অব নর্থ আমেরিকা";
}

// মূল ফাংশন
async function initializePrayerTimeWidget() {
  try {
    let latitude, longitude, locationName, method;

    // লোকেশন স্টোরেজ থেকে লোড করা
    const savedLocation = localStorage.getItem("selectedLocation");
    const savedMethod = localStorage.getItem("selectedMethod");

    if (savedLocation) {
      // সেভ করা লোকেশন ব্যবহার
      try {
        const locationData = JSON.parse(savedLocation);
        latitude = locationData.latitude;
        longitude = locationData.longitude;
        locationName = locationData.name;
        method = savedMethod || "2";
      } catch (e) {
        console.error("Error parsing saved location:", e);
        localStorage.removeItem("selectedLocation");
        const coords = await getUserLocation();
        latitude = coords.latitude;
        longitude = coords.longitude;
        locationName = await getLocationName(latitude, longitude);
        method = "2";
      }
    } else {
      // অটো ডিটেক্ট
      const coords = await getUserLocation();
      latitude = coords.latitude;
      longitude = coords.longitude;
      locationName = await getLocationName(latitude, longitude);
      method = "2";
    }

    // নামাজের সময় পাওয়া
    const prayerTimes = await getPrayerTimes(latitude, longitude, method);

    if (prayerTimes) {
      // UI আপডেট
      updatePrayerTimeUI(prayerTimes, locationName, getMethodName(method));

      // প্রতি মিনিটে কাউন্টডাউন আপডেট
      setInterval(async () => {
        const updatedPrayerTimes = await getPrayerTimes(
          latitude,
          longitude,
          method
        );
        if (updatedPrayerTimes) {
          updatePrayerTimeUI(
            updatedPrayerTimes,
            locationName,
            getMethodName(method)
          );
        }
      }, 60000);
    } else {
      const prayTimeDiv = document.querySelector(".prayTime");
      if (prayTimeDiv) {
        prayTimeDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #d32f2f; background: #2b2a2aff; border-radius: 10px;">
                        নামাজের সময় লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।
                    </div>
                `;
      }
    }
  } catch (error) {
    console.error("Error initializing prayer time widget:", error);
    const prayTimeDiv = document.querySelector(".prayTime");
    if (prayTimeDiv) {
      prayTimeDiv.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #d32f2f; background: #363434ff; border-radius: 10px;">
                    নামাজের সময় লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।
                </div>
            `;
    }
  }
}

// পেজ লোড হলে উইজেট শুরু করুন
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePrayerTimeWidget);
} else {
  initializePrayerTimeWidget();
}

//Quran ###############################################################################################################
(async function () {
  const container = document.querySelector(".quranApp");
  if (!container) return;

  const BASE = "https://api.alquran.cloud/v1";
  const AR_EDITION = "quran-uthmani";
  const BN_EDITION = "bn.bengali";

  const reciters = [
    { code: "ar.alafasy", name: "Mishary Rashid Alafasy" },
    { code: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
    { code: "ar.abdulbasitmujawwad", name: "Abdul Basit (Mujawwad)" },
    { code: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
    { code: "ar.hudhaify", name: "Ali Al-Hudhaify" },
    { code: "ar.mahermuaiqly", name: "Maher Al-Muaiqly" },
    { code: "ar.minshawimurattal", name: "Minshawi (Murattal)" },
    { code: "ar.minshawimujawwad", name: "Minshawi (Mujawwad)" },
  ];

  let currentlyPlayingAudio = null;
  let surahs = [];
  let multiQueue = [];
  let currentQueueIndex = 0;
  let isPlaying = false;
  let sleepTimerInterval = null;
  let timerSecondsLeft = 0; // টাইমারের অবশিষ্ট সময় ট্র্যাক করার জন্য

  container.innerHTML = '<div class="loader">সূরা তালিকা লোড হচ্ছে...</div>';
  try {
    const res = await fetch(`${BASE}/surah`);
    const data = await res.json();
    surahs = data.data || [];
  } catch (e) {
    container.innerHTML = `<div class="loader">সূরা লোড করতে সমস্যা: ${e.message}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="quran-player-ui" id="quranControls">
      <div class="compact-header">
        <div class="header-reciter" style="flex:1;">
           <select id="reciterSelect" style="width: 90%; border:none; background:transparent; font-weight:700; color:var(--accent); font-size:0.85rem; padding:0; cursor:pointer; outline:none; font-family: inherit;"></select>
        </div>
        <div class="header-actions">
           <button id="hideBtn" class="mini-icon-btn" title="লুকান"><i class="fa fa-eye-slash"></i></button>
        </div>
      </div>

      <div class="controls-grid">
        <div class="input-group" id="singleSurahGroup">
          <label>সূরা নির্বাচন</label>
          <select id="surahSelect"></select>
        </div>
        
        <div class="input-group" id="ayahFromGroup">
          <label>শুরু আয়াত</label>
          <select id="ayahFrom"></select>
        </div>
        
        <div class="input-group" id="ayahToGroup">
          <label>শেষ আয়াত</label>
          <select id="ayahTo"></select>
        </div>

        <div id="multiSurahGroup" class="input-group" style="display:none; grid-column: 1 / -1; width: 100%;">
          <label>পছন্দের সূরাগুলো সিলেক্ট করুন</label>
          <div class="multi-surah-list" id="multiSurahList"></div>
        </div>
      </div>

      <div class="input-group checkbox-group compact-inline-checkboxes" style="margin-top:10px;">
        <label class="checkbox-label"><input type="checkbox" id="multiMode"> একাধিক সূরা</label>
        <label class="checkbox-label"><input type="checkbox" id="continuousPlayback"> একসাথে দেখুন</label>
        <label class="checkbox-label"><input type="checkbox" id="playTranslation"> অর্থসহ শুনুন</label>
        
        <!-- Inline Timer -->
        <div class="timer-section" style="display: flex; align-items: center; gap: 5px; margin-left: 5px; border-left: 1px solid var(--border); padding-left: 10px; border-top:none; margin-top:0; padding-top:0;">
          <label style="margin:0; font-size:1rem;">⏱️</label>
          <input type="number" id="sleepTimer" class="sleep-timer-input" placeholder="0" min="1" style="width: 50px !important; height: 22px !important; font-size: 0.75rem !important;">
          <div id="timerStatus" class="timer-status" style="display:none; margin-left:5px;">
            <span id="timerCountdown" style="font-size:0.75rem; font-weight:bold;"></span>
            <button id="cancelTimer" class="player-btn stop-timer-btn" style="height:20px !important; padding:0 5px !important; font-size:0.65rem !important; min-width:auto;">X</button>
          </div>
        </div>
      </div>

      <div class="action-bar compact-actions">
        <button id="loadBtn" class="player-btn play-pause-btn">
          আয়াত দেখুন
        </button>
        <button id="playPauseBtn" class="player-btn play-pause-btn" style="display:none;">
          <i class="fa fa-play" id="playPauseIcon"></i> <span id="playPauseText"></span>
        </button>
      </div>
    </div>

    <div id="minimizedDot" class="minimized-dot" style="display: none;" title="Show Controls">
      <i class="fa fa-sliders"></i>
    </div>
    
    <div id="output"></div>
  `;


  const sleepTimerInput = container.querySelector("#sleepTimer");
  const timerStatus = container.querySelector("#timerStatus");
  const timerCountdown = container.querySelector("#timerCountdown");
  const cancelTimerBtn = container.querySelector("#cancelTimer");

  const surahSelect = container.querySelector("#surahSelect");
  const ayahFrom = container.querySelector("#ayahFrom");
  const ayahTo = container.querySelector("#ayahTo");
  const reciterSelect = container.querySelector("#reciterSelect");
  const multiMode = container.querySelector("#multiMode");
  const continuousPlayback = container.querySelector("#continuousPlayback");
  const playTranslation = container.querySelector("#playTranslation");
  const output = container.querySelector("#output");
  const loadBtn = container.querySelector("#loadBtn");
  const playPauseBtn = container.querySelector("#playPauseBtn");
  const playPauseIcon = container.querySelector("#playPauseIcon");
  const playPauseText = container.querySelector("#playPauseText");
  const hideBtn = container.querySelector("#hideBtn");
  const minimizedDot = container.querySelector("#minimizedDot");
  const quranControls = container.querySelector("#quranControls");
  const multiSurahList = container.querySelector("#multiSurahList");

  surahs.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.number;
    opt.textContent = `${s.number}. ${s.englishName} (${s.name})`;
    surahSelect.appendChild(opt);

    const mItem = document.createElement("div");
    mItem.className = "multi-surah-item";
    mItem.innerHTML = `
      <label>
        <input type="checkbox" value="${s.number}"> 
        <span>${s.number}. ${s.englishName}</span>
      </label>
      <div class="ayah-range-mini">
        <input type="number" class="mini-from" value="1" min="1" max="${s.numberOfAyahs}">
        <span>-</span>
        <input type="number" class="mini-to" value="${s.numberOfAyahs}" min="1" max="${s.numberOfAyahs}">
      </div>
    `;
    multiSurahList.appendChild(mItem);

    const checkbox = mItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) mItem.classList.add('active');
      else mItem.classList.remove('active');
    });
  });

  reciters.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.code;
    opt.textContent = r.name;
    reciterSelect.appendChild(opt);
  });
  reciterSelect.value = "ar.alafasy";

  multiMode.addEventListener("change", () => {
    const isMulti = multiMode.checked;
    container.querySelector("#singleSurahGroup").style.display = isMulti ? "none" : "flex";
    container.querySelector("#multiSurahGroup").style.display = isMulti ? "flex" : "none";
    // Hide global ayah selectors in multi mode since they are now per-surah
    container.querySelector("#ayahFromGroup").style.display = isMulti ? "none" : "flex";
    container.querySelector("#ayahToGroup").style.display = isMulti ? "none" : "flex";
    multiSurahList.style.display = isMulti ? "block" : "none";
  });

  // মাল্টি-সুরা লিস্টে ক্লিক করলে আয়াতের ড্রপডাউন আপডেট হবে (সুবিধা স্বরূপ)
  multiSurahList.addEventListener("change", (e) => {
    if (e.target.tagName === "INPUT" && e.target.checked) {
      const sNum = e.target.value;
      const surah = surahs.find(s => s.number == sNum);
      if (surah) {
        populateAyahSelectors(surah);
      }
    }
  });

  const populateAyahSelectors = (surah) => {
    const prevFrom = ayahFrom.value;
    const prevTo = ayahTo.value;
    ayahFrom.innerHTML = ""; ayahTo.innerHTML = "";
    for (let i = 1; i <= surah.numberOfAyahs; i++) {
      ayahFrom.add(new Option(i, i));
      ayahTo.add(new Option(i, i));
    }
    // Restore previous values if they fit
    if (prevFrom && parseInt(prevFrom) <= surah.numberOfAyahs) ayahFrom.value = prevFrom;
    if (prevTo && parseInt(prevTo) <= surah.numberOfAyahs) ayahTo.value = prevTo;
    else ayahTo.value = surah.numberOfAyahs;
  };

  const populateAyahs = () => {
    const sValue = surahSelect.value;
    if (!sValue) return;
    const surah = surahs.find(s => s.number == sValue);
    if (surah) populateAyahSelectors(surah);
  };
  surahSelect.addEventListener("change", populateAyahs);
  populateAyahs();

  const speakBengali = (text) => {
    return new Promise((resolve) => {
      const cleanText = text.replace(/\(\d+\)/g, '').trim();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const bnVoice = voices.find(v => v.lang.toLowerCase().includes('bn'));
        if (bnVoice) {
          utterance.voice = bnVoice; utterance.lang = 'bn-BD'; utterance.rate = 0.9;
          utterance.onend = () => resolve();
          utterance.onerror = () => useFallbackTTS(cleanText).then(resolve);
          window.speechSynthesis.speak(utterance);
          setTimeout(resolve, 15000);
          return;
        }
      }
      useFallbackTTS(cleanText).then(resolve);
    });
  };

  const useFallbackTTS = (text) => new Promise(res => {
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob`);
    audio.onended = res; audio.onerror = res; audio.play().catch(res);
    setTimeout(res, 12000);
  });

  const shareAyah = (ar, bn, sN, aN) => {
    const text = `সূরা ${sN}, আয়াত ${aN}:\n\n${ar}\n\n${bn}\n\n- সহজে ডট ইন\n${window.location.href}`;
    if (navigator.share) navigator.share({ title: 'কুরআন মজিদ', text }).catch(() => copyText(text));
    else copyText(text);
  };
  const copyText = (t) => {
    const el = document.createElement('textarea'); el.value = t; document.body.appendChild(el);
    el.select(); document.execCommand('copy'); document.body.removeChild(el);
    alert('কপি করা হয়েছে!');
  };

  async function loadAndShowSurah(sNum, from = 1, to = null, autoPlay = false) {
    const reciter = reciterSelect.value;
    const isTrans = playTranslation.checked;
    const isCont = continuousPlayback.checked;

    const surahInfo = surahs.find(s => s.number == sNum);
    output.innerHTML = `<div class="loader">সূরা ${surahInfo ? surahInfo.englishName : sNum} লোড হচ্ছে...</div>`;

    try {
      const [arRes, bnRes, auRes] = await Promise.all([
        fetch(`${BASE}/surah/${sNum}/${AR_EDITION}`).then(r => r.json()),
        fetch(`${BASE}/surah/${sNum}/${BN_EDITION}`).then(r => r.json()),
        fetch(`${BASE}/surah/${sNum}/${reciter}`).then(r => r.json())
      ]);

      const arA = arRes.data.ayahs, bnA = bnRes.data.ayahs, auA = auRes.data.ayahs;
      let html = `<div style="text-align:center; margin-bottom:20px;"><h3>সূরা ${arRes.data.englishName} (${arRes.data.name})</h3></div>`;

      // Handle potential undefined values for 'from' and 'to'
      const startIdx = (from && !isNaN(from)) ? from : 1;
      const endIdx = (to && !isNaN(to)) ? to : arA.length;

      if (isCont) {
        let arT = "", bnT = ""; const auU = [];
        for (let i = startIdx - 1; i < endIdx; i++) {
          if (!arA[i] || !auA[i]) continue;
          arT += arA[i].text + " ";
          bnT += (bnA[i] ? bnA[i].text : "") + " ";
          auU.push(auA[i].audio);
        }
        html += `<div class="verse"><div class="ar">${arT}</div><div class="bn">${bnT}</div><audio id="q-audio" controls style="width:100%"></audio></div>`;
        output.innerHTML = html;
        const audio = document.getElementById("q-audio");
        let idx = 0;
        if (auU.length > 0) {
          audio.src = auU[0];
          audio.onplay = () => { currentlyPlayingAudio = audio; };
          audio.onended = async () => {
            if (isTrans && bnA[startIdx - 1 + idx]) await speakBengali(bnA[startIdx - 1 + idx].text);
            idx++;
            if (idx < auU.length) {
              audio.src = auU[idx];
              audio.play().catch(() => { });
            } else handleSurahEnded();
          };
          if (autoPlay) audio.play().catch(() => { });
        }
      } else {
        for (let i = startIdx - 1; i < endIdx; i++) {
          if (!arA[i] || !auA[i]) continue;
          html += `
            <div id="v-${i}" class="verse">
              <div class="ar">${arA[i].text} <small>(${arA[i].numberInSurah})</small></div>
              <div class="bn">${bnA[i] ? bnA[i].text : ""}</div>
              <audio data-idx="${i}" src="${auA[i].audio}" controls style="width:100%"></audio>
            </div>
          `;
        }
        output.innerHTML = html;
        const adds = output.querySelectorAll("audio");
        if (adds.length > 0) {
          adds.forEach(a => {
            a.onplay = () => {
              if (currentlyPlayingAudio && currentlyPlayingAudio !== a) currentlyPlayingAudio.pause();
              currentlyPlayingAudio = a;
            };
            a.onended = async () => {
              if (isTrans && bnA[a.dataset.idx]) await speakBengali(bnA[a.dataset.idx].text);
              const nextIdx = parseInt(a.dataset.idx) + 1;
              const next = output.querySelector(`audio[data-idx="${nextIdx}"]`);
              if (next) {
                next.scrollIntoView({ behavior: "smooth", block: "center" });
                next.play().catch(() => { });
              } else handleSurahEnded();
            };
          });
          if (autoPlay) adds[0].play().catch(() => { });
        }
        if (autoPlay) { isPlaying = true; updatePlayPauseUI(); }
      }
    } catch (e) {
      console.error(e);
      output.innerHTML = "Error: " + e.message;
    }
  }

  function handleSurahEnded() {
    if (multiMode.checked) {
      currentQueueIndex++;
      if (currentQueueIndex < multiQueue.length) {
        const item = multiQueue[currentQueueIndex];
        loadAndShowSurah(item.sNum, item.from, item.to, true); // autoPlay true যাতে পরের সূরা নিজে থেকেই বাজে
      } else {
        isPlaying = false; updatePlayPauseUI();
        currentlyPlayingAudio = null;
      }
    } else {
      isPlaying = false; updatePlayPauseUI();
    }
  }

  loadBtn.addEventListener("click", () => {
    if (multiMode.checked) {
      multiQueue = Array.from(multiSurahList.querySelectorAll(".multi-surah-item")).filter(item => {
        return item.querySelector('input[type="checkbox"]').checked;
      }).map(item => {
        return {
          sNum: item.querySelector('input[type="checkbox"]').value,
          from: parseInt(item.querySelector('.mini-from').value) || 1,
          to: parseInt(item.querySelector('.mini-to').value) || null
        };
      });

      if (multiQueue.length === 0) { alert("অন্তত একটি সূরা সিলেক্ট করুন"); return; }
      currentQueueIndex = 0;
      loadAndShowSurah(multiQueue[0].sNum, multiQueue[0].from, multiQueue[0].to, false);
    } else {
      loadAndShowSurah(surahSelect.value, parseInt(ayahFrom.value), parseInt(ayahTo.value), false);
    }
    isPlaying = false; updatePlayPauseUI();
  });

  function updatePlayPauseUI() {
    playPauseIcon.className = isPlaying ? "fa fa-pause" : "fa fa-play";
    playPauseBtn.classList.toggle('playing', isPlaying);
    playPauseBtn.style.display = "flex";
  }

  // Timer Logic
  function startSleepTimer(minutesOrSeconds, isMinutes = true) {
    if (sleepTimerInterval) clearInterval(sleepTimerInterval);

    if (isMinutes) {
      timerSecondsLeft = minutesOrSeconds * 60;
    } else {
      timerSecondsLeft = minutesOrSeconds;
    }

    if (timerSecondsLeft <= 0) return;

    timerStatus.style.display = "flex";
    sleepTimerInput.style.display = "none";
    updateTimerDisplay(timerSecondsLeft);

    sleepTimerInterval = setInterval(() => {
      if (!isPlaying) return; // প্লে না থাকলে কাউন্টডাউন হবে না

      timerSecondsLeft--;
      updateTimerDisplay(timerSecondsLeft);

      if (timerSecondsLeft <= 0) {
        stopPlaybackAndTimer();
      }
    }, 1000);
  }

  function updateTimerDisplay(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    timerCountdown.textContent = timeStr;
  }

  function stopPlaybackAndTimer() {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
    timerSecondsLeft = 0; // সময় রিসেট
    timerStatus.style.display = "none";
    sleepTimerInput.style.display = "block";
    sleepTimerInput.value = "";
    if (currentlyPlayingAudio) {
      currentlyPlayingAudio.pause();
      isPlaying = false;
      updatePlayPauseUI();
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    alert("স্লিপ টাইমার শেষ হয়েছে। তিলাওয়াত বন্ধ করা হয়েছে।");
  }

  cancelTimerBtn.addEventListener("click", () => {
    clearInterval(sleepTimerInterval);
    sleepTimerInterval = null;
    timerStatus.style.display = "none";
    sleepTimerInput.style.display = "block"; // ইনপুট বক্স পুনরায় দেখানো
    sleepTimerInput.value = "";
  });

  playPauseBtn.addEventListener("click", () => {
    // যদি টাইমার আগে থেকে সেট করা থাকে কিন্তু না চলে থাকে, তবে শুরু করুন
    if (!sleepTimerInterval && sleepTimerInput.value && !isNaN(parseInt(sleepTimerInput.value))) {
      startSleepTimer(parseInt(sleepTimerInput.value));
    }

    if (!currentlyPlayingAudio) {
      const firstAudio = output.querySelector("audio");
      if (firstAudio) {
        firstAudio.play().catch(() => { });
        isPlaying = true;
        updatePlayPauseUI();
      }
      return;
    }
    if (isPlaying) {
      currentlyPlayingAudio.pause();
      isPlaying = false;
      if (window.speechSynthesis) window.speechSynthesis.pause();
    } else {
      currentlyPlayingAudio.play().catch(() => { });
      isPlaying = true;
      if (window.speechSynthesis) window.speechSynthesis.resume();
    }
    updatePlayPauseUI();
  });

  hideBtn.addEventListener("click", () => { quranControls.style.display = "none"; minimizedDot.style.display = "flex"; });
  minimizedDot.addEventListener("click", () => { quranControls.style.display = "grid"; minimizedDot.style.display = "none"; });

})();

//Hadis #################################################################################################

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".Hadis");
  if (!container) return;

  // UI তৈরি করুন
  container.innerHTML = `
    <h2>হাদিস ভিউয়ার</h2>
    <div class="controls">
      <div class="input-group">
        <label>কিতাব</label>
        <select id="bookSelect">
          <option value="bukhari">সহীহ বুখারী</option>
          <option value="muslim">সহীহ মুসলিম</option>
          <option value="tirmidhi">সুনান আত-তিরমিজী</option>
          <option value="abudawud">সুনান আবু দাউদ</option>
          <option value="nasai">সুনান আন-নাসাঈ</option>
          <option value="ibnmajah">সুনান ইবনে মাজাহ</option>
          <option value="riyadussalihin">রিয়াদুস সালিহীন</option>
        </select>
      </div>

      <div class="input-group hadith-num-group">
        <label>হাদিস নম্বর</label>
        <div class="num-controls">
          <button id="decrementBtn" title="কমান"><i class="fa fa-chevron-left"></i></button>
          <input type="number" id="hadithNumber" value="1" min="1" max="7000">
          <button id="incrementBtn" title="বাড়ান"><i class="fa fa-chevron-right"></i></button>
        </div>
      </div>

      <button id="loadBtn" class="primary-btn">হাদিস দেখুন</button>
    </div>
    <div id="output" class="output"></div>
  `;

  const bookSelect = container.querySelector("#bookSelect");
  const hadithNumberInput = container.querySelector("#hadithNumber");
  const output = container.querySelector("#output");
  const loadBtn = container.querySelector("#loadBtn");
  const incrementBtn = container.querySelector("#incrementBtn");
  const decrementBtn = container.querySelector("#decrementBtn");

  // হাদিস লোড ফাংশন
  async function loadHadith() {
    const book = bookSelect.value;
    const hadithNumber = hadithNumberInput.value;

    output.innerHTML = '<div class="loader">হাদিস লোড হচ্ছে...</div>';

    // API ম্যাপিং এবং URL কনফিগারেশন
    const apiConfigs = [
      {
        name: "fawazahmed0/hadith-api",
        bookMapping: {
          bukhari: "bukhari",
          muslim: "muslim",
          tirmidhi: "tirmidhi",
          abudawud: "abudawud",
          nasai: "nasai",
          ibnmajah: "ibnmajah",
          riyadussalihin: "riyadussalihin",
        },
        getUrls: (book, number) => ({
          arabic: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}/${number}.json`,
          bengali: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${book}/${number}.json`,
        }),
        parseData: (arabicData, bengaliData) => ({
          hadithArabic: arabicData.hadiths[0]?.text || "আরবি উপলব্ধ নয়",
          hadithBengali: bengaliData.hadiths[0]?.text || "বাংলা উপলব্ধ নয়",
          transliteration: " ",
        }),
      },
      {
        name: "alQuranBD/Bangla-Hadith-api",
        bookMapping: {
          bukhari: "bukhari",
          muslim: "muslim",
          tirmidhi: "tirmidi",
          abudawud: "abuDaud",
          nasai: "nasai",
          ibnmajah: "ibnMajah",
          riyadussalihin: "riyadusSalihin",
        },
        getUrls: (book, number) => ({
          combined: `https://alquranbd.com/api/hadith/${book}/${number}`,
        }),
        parseData: (data) => {
          const hadith = data[0] || {};
          return {
            hadithArabic: hadith.hadithArabic || "আরবি উপলব্ধ নয়",
            hadithBengali: hadith.hadithBengali || "বাংলা উপলব্ধ নয়",
            transliteration: hadith.hadithEnglish || "উচ্চারণ উপলব্ধ নয়",
          };
        },
      },
      {
        name: "RakibRahman/hadith-api",
        bookMapping: {
          bukhari: "bukhari",
          muslim: "muslim",
          tirmidhi: "tirmidhi",
          abudawud: "abudawud",
          nasai: "nasai",
          ibnmajah: "ibnmajah",
          riyadussalihin: "riyadussalihin",
        },
        getUrls: (book, number) => ({
          combined: `https://bn-hadith-api.herokuapp.com/hadiths/${book}/${number}`,
        }),
        parseData: (data) => ({
          hadithArabic: data.hadithArabic || "আরবি উপলব্ধ নয়",
          hadithBengali: data.hadith || "বাংলা উপলব্ধ নয়",
          transliteration: data.hadithEnglish || "উচ্চারণ উপলব্ধ নয়",
        }),
      },
    ];

    let hadithData = null;
    let source = "";

    // API-গুলোর উপর লুপ করে চেষ্টা করুন
    for (const api of apiConfigs) {
      try {
        const mappedBook = api.bookMapping[book] || book;
        const urls = api.getUrls(mappedBook, hadithNumber);

        if (urls.combined) {
          // alQuranBD এবং RakibRahman-এর জন্য single fetch
          const response = await fetch(urls.combined);
          if (!response.ok) throw new Error(`${api.name} ত্রুটি`);
          const data = await response.json();
          if (data && (Array.isArray(data) ? data.length > 0 : data.hadith)) {
            hadithData = api.parseData(data);
            source = api.name;
            break;
          }
        } else {
          // fawazahmed0-এর জন্য dual fetch
          const [arabicResponse, bengaliResponse] = await Promise.all([
            fetch(urls.arabic),
            fetch(urls.bengali),
          ]);
          if (!arabicResponse.ok || !bengaliResponse.ok)
            throw new Error(`${api.name} ত্রুটি`);
          const [arabicData, bengaliData] = await Promise.all([
            arabicResponse.json(),
            bengaliResponse.json(),
          ]);
          if (arabicData.hadiths && bengaliData.hadiths) {
            hadithData = api.parseData(arabicData, bengaliData);
            source = api.name;
            break;
          }
        }
      } catch (error) {
        console.warn(`${api.name} থেকে ত্রুটি:`, error);
        continue; // পরবর্তী API চেষ্টা করুন
      }
    }

    if (hadithData) {
      displayHadith(hadithData, book, hadithNumber, source);
    } else {
      output.innerHTML =
        '<div class="error">কোনো API থেকে হাদিস পাওয়া যায়নি। দয়া করে অন্য নম্বর চেষ্টা করুন।</div>';
    }
  }

  // হাদিস প্রদর্শন ফাংশন
  function displayHadith(hadithData, book, hadithNumber, source) {
    if (!hadithData) {
      output.innerHTML =
        '<div class="error">হাদিস লোড করতে সমস্যা হয়েছে</div>';
      return;
    }

    const bookNames = {
      bukhari: "সহীহ বুখারী",
      muslim: "সহীহ মুসলিম",
      tirmidhi: "সুনান আত-তিরমিজী",
      abudawud: "সুনান আবু দাউদ",
      nasai: "সুনান আন-নাসাঈ",
      ibnmajah: "সুনান ইবনে মাজাহ",
      riyadussalihin: "রিয়াদুস সালিহীন",
    };

    const bnTransliteration =
      hadithData.transliteration || "বাংলা উচ্চারণ উপলব্ধ নয়";
    const bnTranslation = hadithData.hadithBengali || "বাংলা অর্থ উপলব্ধ নয়";

    const html = `
    <div class="hadith">
      <div class="ar">${hadithData.hadithArabic || ""}</div>
      <div class="transliteration">${bnTransliteration}</div>
      <!--div class="bn_transliteration">বাংলা উচ্চারণ: ${bnTransliteration}</div-->
      <div class="bn_translation">বাংলা অর্থ: ${bnTranslation}</div>
      <div class="meta">
        <strong>হাদিস নম্বর:</strong> ${hadithNumber} | 
        <strong>কিতাব:</strong> ${bookNames[book] || book} | 
        <strong>সোর্স:</strong> ${source} (GitHub)
      </div>
      <button id="shareBtn" style="margin-top:10px;padding:6px 12px;border:none;border-radius:6px;background:#4caf50;color:white;cursor:pointer;">শেয়ার করুন</button>
    </div>
  `;

    output.innerHTML = html;

    // শেয়ার বাটনের ইভেন্ট হ্যান্ডলার
    const shareBtn = document.getElementById("shareBtn");
    shareBtn.addEventListener("click", () => {
      const siteUrl = window.location.href;
      const shareText = `
হাদিস নম্বর: ${hadithNumber}
কিতাব: ${bookNames[book] || book}

${hadithData.hadithArabic || ""}
.................................................................................................... ${bnTransliteration}
বাংলা অর্থ: ${bnTranslation}

এরকম আরো হাদিস পেতে : ${siteUrl}
    `;
      if (navigator.share) {
        navigator.share({
          title: `${bookNames[book] || book} - হাদিস`,
          text: shareText
        }).catch(err => {
          console.log("শেয়ারিং এ সমস্যা:", err);
          copyToClipboard(shareText);
        });
      } else {
        copyToClipboard(shareText);
      }
    });
  }

  // ক্লিপবোর্ডে কপি ফাংশন
  function copyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    alert("হাদিস ক্লিপবোর্ডে কপি করা হয়েছে! এখন আপনি শেয়ার করতে পারেন।");
  }


  // তীর বোতামের জন্য ফাংশন
  function updateHadithNumber(change) {
    let currentNumber = parseInt(hadithNumberInput.value) || 1;
    currentNumber = Math.max(1, currentNumber + change);
    hadithNumberInput.value = currentNumber;
    loadHadith();
  }

  // ইভেন্ট লিসেনার যোগ করুন
  loadBtn.addEventListener("click", loadHadith);
  incrementBtn.addEventListener("click", () => updateHadithNumber(1));
  decrementBtn.addEventListener("click", () => updateHadithNumber(-1));

  // প্রথমবার পেজ লোড হলে হাদিস লোড করুন
  setTimeout(loadHadith, 500);
});



// Share functionality
document.getElementById('ShareSite').addEventListener('click', async (e) => {
  e.preventDefault();

  if (navigator.share) {
    const shareMessage =
      "আমি একটা সাইট লিংক দিচ্ছি এখান থেকে একদম সহজে ধাপে ধাপে ইসলামিক শিক্ষা নেওয়া যাবে। এখানে কিভাবে নামাজ পড়তে হবে সহজে লেখা আছে - সাথে আমল, হাদিস, জীবনে কিভাবে চলা উচিত ইত্যাদি দেওয়া আছে। এছাড়া এখান থেক কুর-আন পড়া ও শোনাও যাবে। সাইট লিঙ্কটি : " + window.location.href;
    try {
      await navigator.share({
        title: "Great Restaurant!",
        text: shareMessage
      });
      console.log("Thanks for sharing!");
    } catch (err) {
      console.error("Share failed:", err);
    }
  } else {
    alert("Sharing is not supported on this browser.");
  }
});

// Desktop Horizontal Scroll support for topBar2
const navBars = document.querySelectorAll(".topBar2");
navBars.forEach(navBar => {
  navBar.addEventListener("wheel", (evt) => {
    // Only intercept if the user is scrolling vertically on the bar OR horizontally
    if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX)) {
      evt.preventDefault();
      navBar.scrollLeft += evt.deltaY;
    }
  }, { passive: false });
});
// Scroll to Top/Bottom logic
const topBtn = document.getElementById('scrollToTop');
const bottomBtn = document.getElementById('scrollToBottom');

if (topBtn) {
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (bottomBtn) {
  bottomBtn.addEventListener('click', () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });
}

/* Gaza Slider Logic */
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('#gazaSlider .slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4000);
  }
});
