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




// pray time ###########################################################################

// Prayer Time API থেকে নামাজের সময় পাওয়ার ফাংশন
async function getPrayerTimes(latitude, longitude) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const today = date.getDate();
    
    // API থেকে নামাজের সময় পাওয়া
    try {
        const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await response.json();
        
        if (data.code === 200) {
            const todayData = data.data[today - 1];
            return {
                fajr: todayData.timings.Fajr,
                dhuhr: todayData.timings.Dhuhr,
                asr: todayData.timings.Asr,
                maghrib: todayData.timings.Maghrib,
                isha: todayData.timings.Isha
            };
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        return null;
    }
}

// সময় ফরম্যাট করার ফাংশন (24h থেকে 12h)
function formatTime(timeStr) {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes} ${period}`;
}

// পরবর্তী নামাজ এবং কাউন্টডাউন গণনা
function getNextPrayerAndCountdown(prayerTimes) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
        { name: 'ফজর', time: prayerTimes.fajr },
        { name: 'যোহর', time: prayerTimes.dhuhr },
        { name: 'আসর', time: prayerTimes.asr },
        { name: 'মাগরিব', time: prayerTimes.maghrib },
        { name: 'ইশা', time: prayerTimes.isha }
    ];
    
    // নামাজের সময় মিনিটে রূপান্তর
    const prayerMinutes = prayers.map(prayer => {
        const [time, period] = prayer.time.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        // 12-hour to 24-hour conversion
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        return {
            name: prayer.name,
            minutes: hours * 60 + minutes,
            formattedTime: formatTime(prayer.time)
        };
    });
    
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
            minutes: prayerMinutes[0].minutes + 24 * 60, // পরের দিন
            formattedTime: prayerMinutes[0].formattedTime
        };
    }
    
    // কাউন্টডাউন গণনা
    const timeRemaining = nextPrayer.minutes - currentTime;
    const hoursRemaining = Math.floor(timeRemaining / 60);
    const minutesRemaining = timeRemaining % 60;
    
    return {
        nextPrayer: nextPrayer.name,
        nextPrayerTime: nextPrayer.formattedTime,
        countdown: `${hoursRemaining} ঘণ্টা ${minutesRemaining} মিনিট`
    };
}

// UI আপডেট করার ফাংশন
function updatePrayerTimeUI(prayerTimes, location) {
    const nextPrayerInfo = getNextPrayerAndCountdown(prayerTimes);
    
    const prayTimeDiv = document.querySelector('.prayTime');
    prayTimeDiv.innerHTML = `
        <div style="background: rgb(147 147 147 / 10%); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); color: white; text-align: center; max-width: 400px; margin: 0 auto;">
            <h2 style="margin-top: 0; margin-bottom: 15px; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); color: var(--text);">নামাজের সময়সূচী</h2>
            <p style="margin-bottom: 20px; opacity: 0.9; color: var(--text);">স্থান: ${location}</p>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">

            <div style="background: var(--card); padding: 15px; border-radius: 10px; grid-column: span 2;">
                <div style="font-weight: 600; margin-bottom: 8px; color: var(--text);">পরবর্তী নামাজ</div>
                <div style="font-size: 1.2em; font-weight: 700; margin-bottom: 5px; color: var(--text);">${nextPrayerInfo.nextPrayer} - ${nextPrayerInfo.nextPrayerTime}</div>
                <div style="font-size: 1.1em; color: var(--text);">বাকি: ${nextPrayerInfo.countdown}</div>
            </div>

                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ফজর</div>
                    <div style= "color: var(--text);">${formatTime(prayerTimes.fajr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">যোহর</div>
                    <div style= "color: var(--text);">${formatTime(prayerTimes.dhuhr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">আসর</div>
                    <div style= "color: var(--text);">${formatTime(prayerTimes.asr)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">মাগরিব</div>
                    <div style= "color: var(--text);">${formatTime(prayerTimes.maghrib)}</div>
                </div>
                <div style="background: var(--card); padding: 12px; border-radius: 10px;">
                    <div style="font-weight: 600; margin-bottom: 5px; color: var(--text);">ইশা</div>
                    <div style= "color: var(--text);">${formatTime(prayerTimes.isha)}</div>
                </div>
            </div>
            
            
        </div>
    `;
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
                }
            );
        }
    });
}

// লোকেশনের নাম পাওয়ার ফাংশন (Reverse Geocoding)
async function getLocationName(latitude, longitude) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=bn`);
        const data = await response.json();
        return data.city || data.locality || 'আপনার অবস্থান';
    } catch (error) {
        console.error('Error getting location name:', error);
        return 'আপনার অবস্থান';
    }
}

// মূল ফাংশন
async function initializePrayerTimeWidget() {
    try {
        // ব্যবহারকারীর অবস্থান পাওয়া
        const { latitude, longitude } = await getUserLocation();
        
        // অবস্থানের নাম পাওয়া
        const locationName = await getLocationName(latitude, longitude);
        
        // নামাজের সময় পাওয়া
        const prayerTimes = await getPrayerTimes(latitude, longitude);
        
        if (prayerTimes) {
            // UI আপডেট
            updatePrayerTimeUI(prayerTimes, locationName);
            
            // প্রতি মিনিটে কাউন্টডাউন আপডেট
            setInterval(() => {
                updatePrayerTimeUI(prayerTimes, locationName);
            }, 60000);
        } else {
            document.querySelector('.prayTime').innerHTML = `
                <div style="text-align: center; padding: 20px; color: #d32f2f; background: #2b2a2aff; border-radius: 10px;">
                    নামাজের সময় লোড করতে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।
                </div>
            `;
        }
    } catch (error) {
        console.error('Error initializing prayer time widget:', error);
        document.querySelector('.prayTime').innerHTML = `
            <div style="text-align: center; padding: 20px; color: #d32f2f; background: #363434ff; border-radius: 10px;">
                নামাজের সময় লোড করতে সমস্যা হচ্ছে: ${error}
            </div>
        `;
    }
}

// পেজ লোড হলে উইজেট শুরু করুন
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePrayerTimeWidget);
} else {
    initializePrayerTimeWidget();
}
