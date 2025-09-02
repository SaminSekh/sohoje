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
    .cmp-wrap{position:relative; width:214px; height:214px; margin:16px auto; font-family:system-ui,Segoe UI,Roboto,Arial;}
    .cmp-dial{position:absolute; inset:0; border-radius:50%; border:8px solid #dfdfdfff; box-shadow:0 4px 12px rgba(255, 162, 22, 1) inset;}
    .cmp-ring{position:absolute; inset:16px; border-radius:50%; border:2px dashed #0135c5ff;}
    .cmp-card{position:absolute; left:86%; font-weight:bold; font-size:14px;}
    .cmp-card.n{top:10px; transform:translateX(-280%);}
    .cmp-card.s{bottom:10px; transform:translateX(-225%);}
    .cmp-card.e{right:10px; top:49%; transform:translateY(-45%);}
    .cmp-card.w{left:-4px; top:42%; transform:translateY(-50%); rotate:270deg;}
    .cmp-ticks{position:absolute; inset:-1px; border-radius:50%;}
    .cmp-ticks div{position:absolute; left:50%; top:0; width:2px; height:12px; background:#94a3b8; transform-origin:50% 108px;}
    .cmp-ticks div.major{height:18px; background:#475569;}
    .cmp-needle{position:absolute; left:50%; top:50%; width:0; height:0; transform:translate(-50%, -50%);}
    .cmp-needle .north{position:absolute; left:-8px; top:-100px; width:16px; height:100px; background:linear-gradient(#56ff34, #0c9b2b); clip-path:polygon(50% 0,100% 100%,0 100%);}
    .cmp-cap{position:absolute; left:50%; top:50%; width:18px; height:18px; border-radius:50%; transform:translate(-50%, -50%); box-shadow:0 0 0 2px #111 inset;}
    .cmp-readout{margin-top:280px; text-align:center; font-size:14px; display:none;}
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


// Ramadan ###########################################################################


// Ramadan Widget JavaScript Code
async function getRamadanTimings(latitude, longitude, year) {
    try {
        // Ramadan start date calculation (approximate)
        const ramadanStart = await fetch(`https://api.aladhan.com/v1/gToH?date=01-09-${year}`);
        const ramadanData = await ramadanStart.json();
        
        if (ramadanData.code === 200) {
            const hijriMonth = ramadanData.data.hijri.month.number;
            const hijriDay = ramadanData.data.hijri.day;
            
            // If it's not Ramadan yet, calculate the start date
            if (hijriMonth !== 9) {
                const ramadanStartDate = new Date(ramadanData.data.gregorian.date);
                return {
                    ramadanStart: ramadanStartDate,
                    ramadanEnd: new Date(ramadanStartDate.getTime() + 29 * 24 * 60 * 60 * 1000),
                    daysUntilRamadan: Math.ceil((ramadanStartDate - new Date()) / (1000 * 60 * 60 * 24))
                };
            } else {
                // If Ramadan has already started
                const currentDay = parseInt(hijriDay);
                return {
                    ramadanStart: new Date(),
                    ramadanEnd: new Date(new Date().getTime() + (30 - currentDay) * 24 * 60 * 60 * 1000),
                    currentRoza: currentDay,
                    daysUntilRamadan: 0
                };
            }
        }
    } catch (error) {
        console.error('Error fetching Ramadan data:', error);
        // Fallback calculation if API fails
        const ramadanStartDate = new Date(year, 2, 23); // Approximate date
        return {
            ramadanStart: ramadanStartDate,
            ramadanEnd: new Date(ramadanStartDate.getTime() + 29 * 24 * 60 * 60 * 1000),
            daysUntilRamadan: Math.ceil((ramadanStartDate - new Date()) / (1000 * 60 * 60 * 24))
        };
    }
}

async function getPrayerTimes(latitude, longitude, date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    try {
        const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=2`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.length > 0) {
            const dayData = data.data[day - 1];
            
            if (!dayData || !dayData.timings) {
                throw new Error('Invalid data structure from API');
            }
            
            return {
                sehri: dayData.timings.Fajr,
                iftar: dayData.timings.Maghrib,
                date: dayData.date.readable
            };
        } else {
            throw new Error('Invalid response from prayer time API');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        // Fallback times
        return {
            sehri: '04:45',
            iftar: '18:30',
            date: date.toLocaleDateString('bn-BD')
        };
    }
}

function updateRamadanCountdown(ramadanData) {
    const now = new Date();
    const timeUntilRamadan = ramadanData.ramadanStart - now;
    
    if (timeUntilRamadan <= 0) {
        // Ramadan has started
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            status: 'started',
            currentRoza: ramadanData.currentRoza || 1
        };
    } else {
        // Countdown to Ramadan
        const days = Math.floor(timeUntilRamadan / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeUntilRamadan % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilRamadan % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilRamadan % (1000 * 60)) / 1000);
        
        return {
            days,
            hours,
            minutes,
            seconds,
            status: 'counting',
            currentRoza: 0
        };
    }
}

function formatTime(timeStr) {
    if (!timeStr) return '--:--';
    
    try {
        const [time, period] = timeStr.split(' ');
        if (!time) return '--:--';
        
        const [hours, minutes] = time.split(':');
        if (!hours || !minutes) return '--:--';
        
        return `${hours}:${minutes}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '--:--';
    }
}

function generateCalendar(ramadanStart, currentRoza) {
    const calendar = [];
    const startDate = new Date(ramadanStart);
    
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dayOfWeek = currentDate.toLocaleDateString('bn-BD', { weekday: 'short' });
        const dayOfMonth = currentDate.getDate();
        const month = currentDate.toLocaleDateString('bn-BD', { month: 'short' });
        
        calendar.push({
            roza: i + 1,
            date: `${dayOfMonth} ${month}`,
            day: dayOfWeek,
            isToday: currentRoza === i + 1,
            isPast: currentRoza > i + 1
        });
    }
    
    return calendar;
}

async function updateRamadanUI(ramadanData, prayerTimes, location) {
    const countdown = updateRamadanCountdown(ramadanData);
    const calendar = generateCalendar(ramadanData.ramadanStart, countdown.currentRoza);
    
    const ramadanDiv = document.querySelector('.Ramadan');
    if (!ramadanDiv) {
        console.error('Ramadan div not found in DOM');
        return;
    }
    
    // Format Ramadan start and end dates
    const startDate = ramadanData.ramadanStart.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const endDate = ramadanData.ramadanEnd.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Create UI HTML
    ramadanDiv.innerHTML = `
        <div style="background: var(--datebg); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); color: var(--text); text-align: center; max-width: 600px; margin: 0 auto;">
            <h2 style="margin-top: 0; margin-bottom: 15px; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.1); color: var(--text);">রমজান ক্যালেন্ডার</h2>
            <p style="margin-bottom: 5px; opacity: 0.9;">স্থান: ${location || 'লোড হচ্ছে...'}</p>
            
            ${countdown.status === 'counting' ? `
                <div style="background: var(--card); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: var(--text);;">রমজান শুরু হতে বাকি</h3>
                    <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 10px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700;">${countdown.days}</div>
                            <div>দিন</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700;">${countdown.hours}</div>
                            <div>ঘণ্টা</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; font-weight: 700;">${countdown.minutes}</div>
                            <div>মিনিট</div>
                        </div>
                    </div>
                    <p>রমজান শুরু: ${startDate}</p>
                </div>
            ` : `
                <div style="background: var(--card);padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: var(--text);;">আজকের রোজা: ${countdown.currentRoza}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-weight: 600; margin-bottom: 5px;">সেহরি</div>
                            <div style="font-size: 1.5em; font-weight: 700;">${formatTime(prayerTimes.sehri)}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-weight: 600; margin-bottom: 5px;">ইফতার</div>
                            <div style="font-size: 1.5em; font-weight: 700;">${formatTime(prayerTimes.iftar)}</div>
                        </div>
                    </div>
                    <p style="margin-top: 10px; margin-bottom: 0;">আজ: ${prayerTimes.date}</p>
                </div>
            `}
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text);;">রমজান সময়সূচী</h3>
                <p>রমজান শুরু: ${startDate} | রমজান শেষ: ${endDate}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: var(--text);;">রমজান ক্যালেন্ডার</h3>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; max-height: 300px; overflow-y: auto;">
                    ${calendar.map(day => `
                        <div style="padding: 10px; border-radius: 8px; text-align: center; 
                            ${day.isToday ? 'background: var(--date);' : 
                              day.isPast ? 'background: rgba(130, 255, 228, 0.2);' : 'background: var(--card);'}">
                            <div style="font-size: 0.9em; font-weight: ${day.isToday ? '700' : '500'};">${day.roza}</div>
                            <div style="font-size: 0.8em;">${day.date}</div>
                            <div style="font-size: 0.7em;">${day.day}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <button id="ramadanLocationToggle" style="background: var(--card); border: none; padding: 8px 15px; border-radius: 5px; color: var(--text);; cursor: pointer;">
                    অবস্থান পরিবর্তন
                </button>
            </div>
            
            <div id="ramadanLocationSelector" style="display: none; margin-top: 15px; background: var(--card); padding: 15px; border-radius: 10px;">
                <h3 style="margin-top: 0; color: var(--text);;">অবস্থান সিলেক্ট করুন</h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button id="ramadanAutoDetectBtn" style="flex: 1; background: #4CAF50; border: none; padding: 8px; border-radius: 5px; color: white; cursor: pointer;">
                        অটো ডিটেক্ট
                    </button>
                    <button id="ramadanManualSelectBtn" style="flex: 1; background: #2196F3; border: none; padding: 8px; border-radius: 5px; color: white; cursor: pointer;">
                        ম্যানুয়াল সিলেক্ট
                    </button>
                </div>
                
                <div id="ramadanManualInput" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="ramadanCityInput" placeholder="শহরের নাম" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                        <input type="text" id="ramadanCountryInput" placeholder="দেশের নাম" style="padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                    </div>
                    <button id="ramadanSearchLocationBtn" style="background: #FF9800; border: none; padding: 8px 15px; border-radius: 5px; color: white; cursor: pointer; width: 100%;">
                        খুঁজুন
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const toggleBtn = document.getElementById('ramadanLocationToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const selector = document.getElementById('ramadanLocationSelector');
            if (selector) {
                selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    const autoDetectBtn = document.getElementById('ramadanAutoDetectBtn');
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener('click', function() {
            localStorage.removeItem('ramadanLocation');
            initializeRamadanWidget();
        });
    }
    
    const manualSelectBtn = document.getElementById('ramadanManualSelectBtn');
    if (manualSelectBtn) {
        manualSelectBtn.addEventListener('click', function() {
            const manualInput = document.getElementById('ramadanManualInput');
            if (manualInput) {
                manualInput.style.display = 'block';
            }
        });
    }
    
    const searchBtn = document.getElementById('ramadanSearchLocationBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', async function() {
            const cityInput = document.getElementById('ramadanCityInput');
            const countryInput = document.getElementById('ramadanCountryInput');
            
            if (cityInput && countryInput) {
                const city = cityInput.value;
                const country = countryInput.value;
                
                if (city && country) {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', ' + country)}&accept-language=bn`);
                        const data = await response.json();
                        
                        if (data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lng = parseFloat(data[0].lon);
                            const locationName = data[0].display_name;
                            
                            localStorage.setItem('ramadanLocation', JSON.stringify({
                                latitude: lat,
                                longitude: lng,
                                name: locationName
                            }));
                            
                            initializeRamadanWidget();
                        } else {
                            alert('স্থানটি খুঁজে পাওয়া যায়নি।');
                        }
                    } catch (error) {
                        console.error('Error fetching location:', error);
                        alert('স্থান খোঁজার过程中 সমস্যা হয়েছে।');
                    }
                } else {
                    alert('শহর এবং দেশের নাম দিন।');
                }
            }
        });
    }
}

async function getLocationName(latitude, longitude) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=bn`);
        const data = await response.json();
        return data.display_name || 'আপনার অবস্থান';
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'আপনার অবস্থান';
    }
}

async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    // Default to Dhaka, Bangladesh if location access is denied
                    console.error('Error getting location, using default (Dhaka)');
                    resolve({ latitude: 23.8103, longitude: 90.4125 });
                },
                { timeout: 10000 }
            );
        }
    });
}

async function initializeRamadanWidget() {
    try {
        let latitude, longitude, locationName;
        const currentYear = new Date().getFullYear();
        
        // Get saved location or use current location
        const savedLocation = localStorage.getItem('ramadanLocation');
        
        if (savedLocation) {
            try {
                const locationData = JSON.parse(savedLocation);
                latitude = locationData.latitude;
                longitude = locationData.longitude;
                locationName = locationData.name;
            } catch (e) {
                console.error('Error parsing saved location:', e);
                localStorage.removeItem('ramadanLocation');
                const coords = await getUserLocation();
                latitude = coords.latitude;
                longitude = coords.longitude;
                locationName = await getLocationName(latitude, longitude);
            }
        } else {
            // Auto detect location
            const coords = await getUserLocation();
            latitude = coords.latitude;
            longitude = coords.longitude;
            locationName = await getLocationName(latitude, longitude);
        }
        
        // Get Ramadan data
        const ramadanData = await getRamadanTimings(latitude, longitude, currentYear);
        
        // Get today's prayer times
        const today = new Date();
        const prayerTimes = await getPrayerTimes(latitude, longitude, today);
        
        // Update UI
        updateRamadanUI(ramadanData, prayerTimes, locationName);
        
        // Update countdown every minute if Ramadan hasn't started
        if (ramadanData.daysUntilRamadan > 0) {
            setInterval(async () => {
                const updatedRamadanData = await getRamadanTimings(latitude, longitude, currentYear);
                const updatedPrayerTimes = await getPrayerTimes(latitude, longitude, new Date());
                updateRamadanUI(updatedRamadanData, updatedPrayerTimes, locationName);
            }, 60000);
        }
        
    } catch (error) {
        console.error('Error initializing Ramadan widget:', error);
        const ramadanDiv = document.querySelector('.Ramadan');
        if (ramadanDiv) {
            ramadanDiv.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #d32f2f; background: rgba(211, 47, 47, 0.1); border-radius: 10px;">
                    রমজান উইজেট লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।
                </div>
            `;
        }
    }
}

// Initialize the widget when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRamadanWidget);
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
        const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=${method}`);
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 200 && data.data && data.data.length > 0) {
            const todayData = data.data[today - 1];
            
            if (!todayData || !todayData.timings) {
                throw new Error('Invalid data structure from API');
            }
            
            return {
                fajr: todayData.timings.Fajr || '05:00 (AM)',
                dhuhr: todayData.timings.Dhuhr || '12:00 (PM)',
                asr: todayData.timings.Asr || '15:30 (PM)',
                maghrib: todayData.timings.Maghrib || '18:00 (PM)',
                isha: todayData.timings.Isha || '19:30 (PM)',
                sunrise: todayData.timings.Sunrise || '06:00 (AM)',
                sunset: todayData.timings.Sunset || '18:00 (PM)',
                date: todayData.date?.readable || new Date().toLocaleDateString('bn-BD')
            };
        } else {
            throw new Error('Invalid response from prayer time API');
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        
        // Fallback prayer times in case of API failure
        return {
            fajr: '05:00 (AM)',
            dhuhr: '12:00 (PM)',
            asr: '15:30 (PM)',
            maghrib: '18:00 (PM)',
            isha: '19:30 (PM)',
            sunrise: '06:00 (AM)',
            sunset: '18:00 (PM)',
            date: new Date().toLocaleDateString('bn-BD')
        };
    }
}

// সময় ফরম্যাট করার ফাংশন (24h থেকে 12h) - আরও robust version
function formatTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
        return '--:-- --';
    }
    
    try {
        // যদি সময় ইতিমধ্যে ফরম্যাট করা থাকে
        if (timeStr.includes('(') && timeStr.includes(')')) {
            return timeStr;
        }
        
        const [time, period] = timeStr.split(' ');
        if (!time) return '--:-- --';
        
        const [hours, minutes] = time.split(':');
        if (!hours || !minutes) return '--:-- --';
        
        return `${hours}:${minutes} ${period || ''}`.trim();
    } catch (error) {
        console.error('Error formatting time:', error, timeStr);
        return '--:-- --';
    }
}

// সময় স্ট্রিং থেকে মিনিটে রূপান্তর - আরও robust version
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    
    try {
        // যদি সময় ইতিমধ্যে ফরম্যাট করা থাকে
        let timePart = timeStr;
        if (timeStr.includes('(') && timeStr.includes(')')) {
            timePart = timeStr.split('(')[0].trim();
        }
        
        const [time, period] = timePart.split(' ');
        if (!time) return 0;
        
        let [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        
        // 12-hour to 24-hour conversion
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    } catch (error) {
        console.error('Error converting time to minutes:', error, timeStr);
        return 0;
    }
}

// পরবর্তী নামাজ এবং কাউন্টডাউন গণনা
function getNextPrayerAndCountdown(prayerTimes) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday
    
    const prayers = [
        { name: 'ফজর', time: prayerTimes.fajr, key: 'fajr' },
        { name: 'যোহর', time: prayerTimes.dhuhr, key: 'dhuhr' },
        { name: 'আসর', time: prayerTimes.asr, key: 'asr' },
        { name: 'মাগরিব', time: prayerTimes.maghrib, key: 'maghrib' },
        { name: 'ইশা', time: prayerTimes.isha, key: 'isha' }
    ];
    
    // নামাজের সময় মিনিটে রূপান্তর
    const prayerMinutes = prayers.map(prayer => {
        return {
            name: prayer.name,
            key: prayer.key,
            minutes: timeToMinutes(prayer.time),
            formattedTime: formatTime(prayer.time)
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
            name: 'ফজর',
            key: 'fajr',
            minutes: prayerMinutes[0].minutes + 24 * 60, // পরের দিন
            formattedTime: prayerMinutes[0].formattedTime
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
    const jummahDate = nextFriday.toLocaleDateString('bn-BD', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return {
        currentPrayer: currentPrayer ? currentPrayer.name : null,
        currentPrayerTime: currentPrayer ? prayerTimes[currentPrayer.key] : null,
        nextPrayer: nextPrayer.name,
        nextPrayerTime: nextPrayer.formattedTime,
        countdown: `${hoursRemaining} ঘণ্টা ${minutesRemaining} মিনিট`,
        isJummah: currentDay === 5, // Friday
        jummahDate: jummahDate,
        jummahTime: formatTime(prayerTimes.dhuhr) // জুমার সময় সাধারণত যোহরের সময় অনুসারে
    };
}

// UI আপডেট করার ফাংশন
function updatePrayerTimeUI(prayerTimes, location, methodName) {
    const nextPrayerInfo = getNextPrayerAndCountdown(prayerTimes);
    
    const prayTimeDiv = document.querySelector('.prayTime');
    if (!prayTimeDiv) {
        console.error('PrayTime div not found in DOM');
        return;
    }
    
    prayTimeDiv.innerHTML = `
        <div style="background: rgb(147 147 147 / 10%); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); color: white; text-align: center; max-width: 600px; margin: 0 auto;">
            <h2 style="margin-top: 0; margin-bottom: 15px; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); color: var(--text);">নামাজের সময়সূচী</h2>
            <p style="margin-bottom: 5px; opacity: 0.9; color: var(--text);">স্থান: ${location || 'লোড হচ্ছে...'}</p>
            <p style="margin-bottom: 15px; opacity: 0.9; color: var(--text);">পদ্ধতি: ${methodName || 'ইসলামিক সোসাইটি'} | তারিখ: ${prayerTimes.date}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
                <!-- বর্তমান নামাজ সেকশন -->
                <div class="smallDivs" style="background: var(--card); padding: 15px; border-radius: 10px; grid-column: span 1;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">${nextPrayerInfo.currentPrayer ? 'বর্তমান নামাজ' : 'পরবর্তী নামাজ'}</div>
                    <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px; color: var(--text);">
                        ${nextPrayerInfo.currentPrayer || nextPrayerInfo.nextPrayer}
                    </div>
                    ${nextPrayerInfo.currentPrayer ? 
                        `<div style="font-size: 1.1em; color: var(--text);">সময়: ${formatTime(nextPrayerInfo.currentPrayerTime)}</div>` : 
                        `<div style="font-size: 1.1em; color: var(--text);">${nextPrayerInfo.nextPrayerTime}, বাকি: ${nextPrayerInfo.countdown}</div>`
                    }
                </div>
                
                <!-- পরবর্তী নামাজ সেকশন -->
                <div style="background: var(--card); padding: 15px; border-radius: 10px; grid-column: span 1;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">পরবর্তী নামাজ</div>
                    <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px; color: var(--text);">
                        ${nextPrayerInfo.nextPrayer}
                    </div>
                    <div style="font-size: 1.1em; color: var(--text);">সময়: ${nextPrayerInfo.nextPrayerTime}</div>
                    <div style="font-size: 1.1em; color: var(--text);">বাকি: ${nextPrayerInfo.countdown}</div>
                </div>
                
                <!-- জুমার নামাজ সেকশন -->
                ${nextPrayerInfo.isJummah ? `
                    <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 15px; border-radius: 10px; grid-column: span 2;">
                        <div style="font-weight: 600; margin-bottom: 8px;">আজ জুম্মার দিন</div>
                        <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px;">জুম্মার নামাজ</div>
                        <div style="font-size: 1.1em;">সময়: ${nextPrayerInfo.jummahTime}</div>
                        <div style="font-size: 1.1em;">স্থান: স্থানীয় মসজিদ</div>
                    </div>
                ` : `
                    <div class="jumaDiv" style="padding: 15px; border-radius: 10px; grid-column: span 2;">
                        <div style="font-weight: 600; margin-bottom: 8px;">পরবর্তী জুম্মা</div>
                        <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px;">${nextPrayerInfo.jummahDate}</div>
                        <div style="font-size: 1.1em;">সময়: ${nextPrayerInfo.jummahTime}</div>
                        <div style="font-size: 1.1em;">বাকি: ${(nextPrayerInfo.isJummah ? 0 : (5 - new Date().getDay() + 7) % 7)} দিন</div>
                    </div>
                `}

                <!-- নিয়মিত নামাজের সময়সূচী -->
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ফজর</div>
                    <div style="color: var(--text);">${formatTime(prayerTimes.fajr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">যোহর${nextPrayerInfo.isJummah ? ' (জুমআ)' : ''}</div>
                    <div style="color: var(--text);">${formatTime(prayerTimes.dhuhr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">আসর</div>
                    <div style="color: var(--text);">${formatTime(prayerTimes.asr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">মাগরিব</div>
                    <div style="color: var(--text);">${formatTime(prayerTimes.maghrib)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px; grid-column: span 2;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ইশা</div>
                    <div style="color: var(--text);">${formatTime(prayerTimes.isha)}</div>
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
    const toggleBtn = document.getElementById('locationToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            const selector = document.getElementById('locationSelector');
            if (selector) {
                selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    const autoDetectBtn = document.getElementById('autoDetectBtn');
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener('click', function() {
            localStorage.removeItem('selectedLocation');
            localStorage.removeItem('selectedMethod');
            initializePrayerTimeWidget();
        });
    }
    
    const manualSelectBtn = document.getElementById('manualSelectBtn');
    if (manualSelectBtn) {
        manualSelectBtn.addEventListener('click', function() {
            const manualInput = document.getElementById('manualInput');
            if (manualInput) {
                manualInput.style.display = 'block';
            }
        });
    }
    
    const searchBtn = document.getElementById('searchLocationBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', async function() {
            const cityInput = document.getElementById('cityInput');
            const countryInput = document.getElementById('countryInput');
            
            if (cityInput && countryInput) {
                const city = cityInput.value;
                const country = countryInput.value;
                
                if (city && country) {
                    try {
                        // OpenCage API এর বিকল্প হিসেবে Nominatim (OpenStreetMap) ব্যবহার করা হচ্ছে
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', ' + country)}&accept-language=bn`);
                        const data = await response.json();
                        
                        if (data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lng = parseFloat(data[0].lon);
                            const locationName = data[0].display_name;
                            
                            // লোকেশন স্টোরেজে সেভ করা
                            localStorage.setItem('selectedLocation', JSON.stringify({
                                latitude: lat,
                                longitude: lng,
                                name: locationName
                            }));
                            
                            // নির্বাচিত পদ্ধতি
                            const methodSelect = document.getElementById('calculationMethod');
                            const method = methodSelect ? methodSelect.value : '2';
                            localStorage.setItem('selectedMethod', method);
                            
                            initializePrayerTimeWidget();
                        } else {
                            alert('স্থানটি খুঁজে পাওয়া যায়নি।');
                        }
                    } catch (error) {
                        console.error('Error fetching location:', error);
                        alert('স্থান খোঁজার过程中 সমস্যা হয়েছে।');
                    }
                } else {
                    alert('শহর এবং দেশের নাম দিন।');
                }
            }
        });
    }
}

// ব্যবহারকারীর লোকেশন পাওয়ার ফাংশন
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Geolocation is not supported by your browser');
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    // Default to Dhaka, Bangladesh if location access is denied
                    console.error('Error getting location, using default (Dhaka)');
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
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=bn`);
        const data = await response.json();
        return data.display_name || 'আপনার অবস্থান';
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'আপনার অবস্থান';
    }
}

// গণনা পদ্ধতির নাম
function getMethodName(methodCode) {
    const methods = {
        '1': 'মুসলিম ওয়ার্ল্ড লীগ',
        '2': 'ইসলামিক সোসাইটি অব নর্থ আমেরিকা',
        '3': 'মিশরীয় জেনারেল অথরিটি',
        '4': 'উম্ম আল-কুরা বিশ্ববিদ্যালয়',
        '5': 'কুয়েত',
        '7': 'কাতার',
        '8': 'সিঙ্গাপুর',
        '9': 'ইরান'
    };
    return methods[methodCode] || 'ইসলামিক সোসাইটি অব নর্থ আমেরিকা';
}

// মূল ফাংশন
async function initializePrayerTimeWidget() {
    try {
        let latitude, longitude, locationName, method;
        
        // লোকেশন স্টোরেজ থেকে লোড করা
        const savedLocation = localStorage.getItem('selectedLocation');
        const savedMethod = localStorage.getItem('selectedMethod');
        
        if (savedLocation) {
            // সেভ করা লোকেশন ব্যবহার
            try {
                const locationData = JSON.parse(savedLocation);
                latitude = locationData.latitude;
                longitude = locationData.longitude;
                locationName = locationData.name;
                method = savedMethod || '2';
            } catch (e) {
                console.error('Error parsing saved location:', e);
                localStorage.removeItem('selectedLocation');
                const coords = await getUserLocation();
                latitude = coords.latitude;
                longitude = coords.longitude;
                locationName = await getLocationName(latitude, longitude);
                method = '2';
            }
        } else {
            // অটো ডিটেক্ট
            const coords = await getUserLocation();
            latitude = coords.latitude;
            longitude = coords.longitude;
            locationName = await getLocationName(latitude, longitude);
            method = '2';
        }
        
        // নামাজের সময় পাওয়া
        const prayerTimes = await getPrayerTimes(latitude, longitude, method);
        
        if (prayerTimes) {
            // UI আপডেট
            updatePrayerTimeUI(prayerTimes, locationName, getMethodName(method));
            
            // প্রতি মিনিটে কাউন্টডাউন আপডেট
            setInterval(async () => {
                const updatedPrayerTimes = await getPrayerTimes(latitude, longitude, method);
                if (updatedPrayerTimes) {
                    updatePrayerTimeUI(updatedPrayerTimes, locationName, getMethodName(method));
                }
            }, 60000);
        } else {
            const prayTimeDiv = document.querySelector('.prayTime');
            if (prayTimeDiv) {
                prayTimeDiv.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #d32f2f; background: #2b2a2aff; border-radius: 10px;">
                        নামাজের সময় লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error initializing prayer time widget:', error);
        const prayTimeDiv = document.querySelector('.prayTime');
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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePrayerTimeWidget);
} else {
    initializePrayerTimeWidget();
}



//Quran ###############################################################################################################

(async function(){
  const container = document.querySelector(".quranApp");
  if(!container) return;

  // API BASE
  const BASE = "https://api.alquran.cloud/v1";
  const AR_EDITION = "quran-uthmani";
  const BN_EDITION = "bn.bengali";

  // উপলব্ধ কারীদের তালিকা
  const reciters = [
    {code:"ar.alafasy", name:"Mishary Rashid Alafasy"},
    {code:"ar.abdulbasitmurattal", name:"Abdul Basit (Murattal)"},
    {code:"ar.abdulbasitmujawwad", name:"Abdul Basit (Mujawwad)"},
    {code:"ar.husary", name:"Mahmoud Khalil Al-Husary"},
    {code:"ar.hudhaify", name:"Ali Al-Hudhaify"},
    {code:"ar.mahermuaiqly", name:"Maher Al-Muaiqly"},
    {code:"ar.minshawimurattal", name:"Minshawi (Murattal)"},
    {code:"ar.minshawimujawwad", name:"Minshawi (Mujawwad)"}
  ];

  // Surah list আনব
  container.innerHTML = '<div class="loader">সূরা তালিকা লোড হচ্ছে...</div>';
  let surahs = [];
  try {
    const res = await fetch(`${BASE}/surah`);
    const data = await res.json();
    surahs = data.data || [];
  } catch(e) {
    container.innerHTML = `<div class="loader">সূরা লোড করতে সমস্যা: ${e.message}</div>`;
    return;
  }

  // UI তৈরি
  container.innerHTML = `
    <h2>কুরআন</h2>
    <div class="controls">
      <label class="TopTitt">সূরা: 
        <select id="surahSelect"></select>
      </label>
      <label class="TopTitt">আয়াত (শুরু): 
        <select id="ayahFrom"></select>
      </label>
      <label class="TopTitt">আয়াত (শেষ): 
        <select id="ayahTo"></select>
      </label>
      <label class="TopTitt">কারী: 
        <select id="reciterSelect"></select>
      </label>
      <button id="loadBtn">দেখাও</button>
    </div>
    <div id="output"></div>
  `;

  const surahSelect = container.querySelector("#surahSelect");
  const ayahFrom = container.querySelector("#ayahFrom");
  const ayahTo = container.querySelector("#ayahTo");
  const reciterSelect = container.querySelector("#reciterSelect");
  const output = container.querySelector("#output");
  const loadBtn = container.querySelector("#loadBtn");

  // Surah options ভর
  surahs.forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s.number;
    opt.textContent = `${s.number}. ${s.englishName} (${s.name})`;
    surahSelect.appendChild(opt);
  });

  // Reciter options ভর
  reciters.forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r.code;
    opt.textContent = r.name;
    reciterSelect.appendChild(opt);
  });
  reciterSelect.value = "ar.alafasy"; // default Mishary

  // যখন সূরা বদলাবে তখন আয়াত সংখ্যা বদলাবে
  const populateAyahs = ()=>{
    ayahFrom.innerHTML="";
    ayahTo.innerHTML="";
    const surahNum = surahSelect.value;
    const surah = surahs.find(s=>s.number==surahNum);
    if(!surah) return;
    for(let i=1;i<=surah.numberOfAyahs;i++){
      let opt1 = document.createElement("option");
      opt1.value=i; opt1.textContent=i;
      ayahFrom.appendChild(opt1);

      let opt2 = document.createElement("option");
      opt2.value=i; opt2.textContent=i;
      ayahTo.appendChild(opt2);
    }
    ayahTo.value=surah.numberOfAyahs;
  };
  surahSelect.addEventListener("change", populateAyahs);
  populateAyahs();

  // আয়াত দেখানোর ফাংশন
  loadBtn.addEventListener("click", async ()=>{
    const surahNum = surahSelect.value;
    const from = parseInt(ayahFrom.value);
    const to = parseInt(ayahTo.value);
    const reciter = reciterSelect.value;

    output.innerHTML = '<div class="loader">লোড হচ্ছে...</div>';
    try {
      const [arRes, bnRes, audioRes] = await Promise.all([
        fetch(`${BASE}/surah/${surahNum}/${AR_EDITION}`).then(r=>r.json()),
        fetch(`${BASE}/surah/${surahNum}/${BN_EDITION}`).then(r=>r.json()),
        fetch(`${BASE}/surah/${surahNum}/${reciter}`).then(r=>r.json())
      ]);

      const arAyahs = arRes.data.ayahs;
      const bnAyahs = bnRes.data.ayahs;
      const audioAyahs = audioRes.data.ayahs;

      let html = "";
      for(let i=from-1;i<to;i++){
        const ar = arAyahs[i];
        const bn = bnAyahs[i];
        const au = audioAyahs[i];
        html += `
          <div class="verse">
            <div class="ar">${ar.text} <span style="font-size:12px;color:#888;">(${ar.numberInSurah})</span></div>
            <div class="bn">${bn?bn.text:"<em>বাংলা অনুবাদ নেই</em>"}</div>
            <audio controls data-idx="${i}" src="${au.audio}"></audio>
          </div>
        `;
      }
      output.innerHTML = html;

      // অডিও সিকোয়েন্সিয়াল প্লে
      const audios = output.querySelectorAll("audio");
      audios.forEach((audio, idx)=>{
        audio.addEventListener("ended", ()=>{
          const next = audios[idx+1];
          if(next){
            next.play();
            next.scrollIntoView({behavior:"smooth", block:"center"});
          }
        });
      });

    } catch(err) {
      output.innerHTML = `<div class="loader">ত্রুটি: ${err.message}</div>`;
    }
  });
})();



//Hadis #################################################################################################



document.addEventListener('DOMContentLoaded', function() {
  const container = document.querySelector(".Hadis");
  if (!container) return;

  // UI তৈরি করুন
  container.innerHTML = `
    <h2>হাদিস ভিউয়ার</h2>
    <div class="controls">
      <label>কিতাব:
        <select id="bookSelect">
          <option value="bukhari">সহীহ বুখারী</option>
          <option value="muslim">সহীহ মুসলিম</option>
          <option value="tirmidhi">সুনান আত-তিরমিজী</option>
          <option value="abudawud">সুনান আবু দাউদ</option>
          <option value="nasai">সুনান আন-নাসাঈ</option>
          <option value="ibnmajah">সুনান ইবনে মাজাহ</option>
          <option value="riyadussalihin">রিয়াদুস সালিহীন</option>
        </select>
      </label>
      <label>হাদিস নম্বর:
        <input type="number" id="hadithNumber" value="1" min="1" max="7000">
        <div class="arrow-buttons">
          <button id="decrementBtn" title="হাদিস নম্বর কমান"><i class="fa fa-arrow-left"></i></button>
          <button id="incrementBtn" title="হাদিস নম্বর বাড়ান"><i class="fa fa-arrow-right"></i></button>
        </div>
      </label>
      <button id="loadBtn">হাদিস লোড করুন</button>
    </div>
    <div id="output" class="output"></div>
  `;

  // স্টাইল যোগ করুন
  const style = document.createElement('style');
  style.textContent = `
    .Hadis {
      max-width: 850px;
      margin: 20px auto;
      font-family: 'Noto Sans Bengali', 'SolaimanLipi', sans-serif;
      line-height: 1.6;
      padding: 6px;
      background: var(--bg);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
    .Hadis h2 {
      font-size: 22px;
      margin-bottom: 15px;
      color: var(--text);
      text-align: center;
      padding-bottom: 10px;
      border-bottom: 2px solid #eee;
      background: var(--datebg);
    }
    .Hadis .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
      justify-content: center;
      align-items: center;
    }
    .Hadis .controls .fa {
      color: var(--text);
    }
    .Hadis label {
      font-size: 0.8rem;
      font-weight: bold;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .Hadis select, .Hadis input {
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #ccc;
      background: var(--card);
      font-family: inherit;
      color: var(--text);
    }
    .Hadis input[type="number"] {
      width: 100px;
    }
    .Hadis .arrow-buttons {
      display: flex;
      flex-direction: row;
      gap: 10px;
      margin-bottom: 12px;
    }
    .Hadis .arrow-buttons button {
      padding: 5px 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: var(--datebg);
      color: var(--text);
      font-size: 14px;
      line-height: 1;
      transition: background 0.3s;
    }
    .Hadis .arrow-buttons button:hover {
      background: var(--card);
    }
    .Hadis button#loadBtn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      background: #4caf50;
      color: var(--text);
      font-size: 15px;
      font-weight: bold;
      transition: background 0.3s;
    }
    .Hadis button#loadBtn:hover {
      background: #3d8b40;
    }
    .Hadis .output {
      margin-top: 20px;
    }
    .Hadis .hadith {
      margin: 15px 0;
      padding: 15px;
      border-radius: 8px;
      background: var(--bg);
      color: var(--text);
      border-left: 4px solid #4caf50;
    }
    .Hadis .hadith .ar {
      font-size: 20px;
      direction: rtl;
      text-align: right;
      margin-bottom: 10px;
      font-family: 'Scheherazade New', 'Lateef', serif;
      line-height: 1.8;
      color: var(--text);
    }
    .Hadis .hadith .transliteration {
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--text);
      font-style: italic;
    }
    .Hadis .hadith .bn_transliteration {
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--text);
      font-style: italic;
      background: var(--datebg);
      padding: 8px;
      border-radius: 4px;
    }
    .Hadis .hadith .bn_translation {
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--text);
      line-height: 1.6;
      background: var(--datebg);
      padding: 8px;
      border-radius: 4px;
    }
    .Hadis .hadith .meta {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #ddd;
    }
    .Hadis .loader {
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 18px;
    }
    .Hadis .error {
      color: #d32f2f;
      padding: 15px;
      text-align: center;
      background: #ffebee;
      border-radius: 8px;
      margin: 10px 0;
    }
    @media (max-width: 600px) {
      .Hadis .controls {
        flex-direction: column;
        align-items: stretch;
      }
      .Hadis .arrow-buttons {
        flex-direction: row;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);

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
        name: 'fawazahmed0/hadith-api',
        bookMapping: {
          'bukhari': 'bukhari',
          'muslim': 'muslim',
          'tirmidhi': 'tirmidhi',
          'abudawud': 'abudawud',
          'nasai': 'nasai',
          'ibnmajah': 'ibnmajah',
          'riyadussalihin': 'riyadussalihin'
        },
        getUrls: (book, number) => ({
          arabic: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${book}/${number}.json`,
          bengali: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ben-${book}/${number}.json`
        }),
        parseData: (arabicData, bengaliData) => ({
          hadithArabic: arabicData.hadiths[0]?.text || 'আরবি উপলব্ধ নয়',
          hadithBengali: bengaliData.hadiths[0]?.text || 'বাংলা উপলব্ধ নয়',
          transliteration: 'উচ্চারণ উপলব্ধ নয়'
        })
      },
      {
        name: 'alQuranBD/Bangla-Hadith-api',
        bookMapping: {
          'bukhari': 'bukhari',
          'muslim': 'muslim',
          'tirmidhi': 'tirmidi',
          'abudawud': 'abuDaud',
          'nasai': 'nasai',
          'ibnmajah': 'ibnMajah',
          'riyadussalihin': 'riyadusSalihin'
        },
        getUrls: (book, number) => ({
          combined: `https://alquranbd.com/api/hadith/${book}/${number}`
        }),
        parseData: (data) => {
          const hadith = data[0] || {};
          return {
            hadithArabic: hadith.hadithArabic || 'আরবি উপলব্ধ নয়',
            hadithBengali: hadith.hadithBengali || 'বাংলা উপলব্ধ নয়',
            transliteration: hadith.hadithEnglish || 'উচ্চারণ উপলব্ধ নয়'
          };
        }
      },
      {
        name: 'RakibRahman/hadith-api',
        bookMapping: {
          'bukhari': 'bukhari',
          'muslim': 'muslim',
          'tirmidhi': 'tirmidhi',
          'abudawud': 'abudawud',
          'nasai': 'nasai',
          'ibnmajah': 'ibnmajah',
          'riyadussalihin': 'riyadussalihin'
        },
        getUrls: (book, number) => ({
          combined: `https://bn-hadith-api.herokuapp.com/hadiths/${book}/${number}`
        }),
        parseData: (data) => ({
          hadithArabic: data.hadithArabic || 'আরবি উপলব্ধ নয়',
          hadithBengali: data.hadith || 'বাংলা উপলব্ধ নয়',
          transliteration: data.hadithEnglish || 'উচ্চারণ উপলব্ধ নয়'
        })
      }
    ];

    let hadithData = null;
    let source = '';

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
            fetch(urls.bengali)
          ]);
          if (!arabicResponse.ok || !bengaliResponse.ok) throw new Error(`${api.name} ত্রুটি`);
          const [arabicData, bengaliData] = await Promise.all([
            arabicResponse.json(),
            bengaliResponse.json()
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
      output.innerHTML = '<div class="error">কোনো API থেকে হাদিস পাওয়া যায়নি। দয়া করে অন্য নম্বর চেষ্টা করুন।</div>';
    }
  }

  // হাদিস প্রদর্শন ফাংশন
  function displayHadith(hadithData, book, hadithNumber, source) {
    if (!hadithData) {
      output.innerHTML = '<div class="error">হাদিস লোড করতে সমস্যা হয়েছে</div>';
      return;
    }
    
    const bookNames = {
      'bukhari': 'সহীহ বুখারী',
      'muslim': 'সহীহ মুসলিম',
      'tirmidhi': 'সুনান আত-তিরমিজী',
      'abudawud': 'সুনান আবু দাউদ',
      'nasai': 'সুনান আন-নাসাঈ',
      'ibnmajah': 'সুনান ইবনে মাজাহ',
      'riyadussalihin': 'রিয়াদুস সালিহীন'
    };
    
    const bnTransliteration = hadithData.transliteration || 'বাংলা উচ্চারণ উপলব্ধ নয়';
    const bnTranslation = hadithData.hadithBengali || 'বাংলা অর্থ উপলব্ধ নয়';
    
    const html = `
      <div class="hadith">
        <div class="ar">${hadithData.hadithArabic || ''}</div>
        <div class="transliteration">${bnTransliteration}</div>
        <div class="bn_transliteration">বাংলা উচ্চারণ: ${bnTransliteration}</div>
        <div class="bn_translation">বাংলা অর্থ: ${bnTranslation}</div>
        <div class="meta">
          <strong>হাদিস নম্বর:</strong> ${hadithNumber} | 
          <strong>কিতাব:</strong> ${bookNames[book] || book} | 
          <strong>সোর্স:</strong> ${source} (GitHub)
        </div>
      </div>
    `;
    
    output.innerHTML = html;
  }

  // তীর বোতামের জন্য ফাংশন
  function updateHadithNumber(change) {
    let currentNumber = parseInt(hadithNumberInput.value) || 1;
    currentNumber = Math.max(1, currentNumber + change);
    hadithNumberInput.value = currentNumber;
    loadHadith();
  }

  // ইভেন্ট লিসেনার যোগ করুন
  loadBtn.addEventListener('click', loadHadith);
  incrementBtn.addEventListener('click', () => updateHadithNumber(1));
  decrementBtn.addEventListener('click', () => updateHadithNumber(-1));

  // প্রথমবার পেজ লোড হলে হাদিস লোড করুন
  setTimeout(loadHadith, 500);
});