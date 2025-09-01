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
document.addEventListener('DOMContentLoaded', function() {
    const compasQ = document.getElementById('compasQ');
    if (!compasQ) return;
    
    // কম্পাস কন্টেইনার তৈরি
    const compassContainer = document.createElement('div');
    compassContainer.style.width = '300px';
    compassContainer.style.height = '300px';
    compassContainer.style.margin = '20px auto';
    compassContainer.style.position = 'relative';
    compassContainer.style.borderRadius = '50%';
    compassContainer.style.backgroundColor = '#f8f9fa';
    compassContainer.style.boxShadow = '0 0 15px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.1)';
    compassContainer.style.overflow = 'hidden';
    
    // স্থির কাটা তৈরি (উত্তর দিক নির্দেশক)
    const fixedNeedle = document.createElement('div');
    fixedNeedle.style.position = 'absolute';
    fixedNeedle.style.width = '4px';
    fixedNeedle.style.height = '130px';
    fixedNeedle.style.backgroundColor = '#e74c3c';
    fixedNeedle.style.left = '50%';
    fixedNeedle.style.top = '50%';
    fixedNeedle.style.transform = 'translate(-50%, -100%)';
    fixedNeedle.style.zIndex = '10';
    fixedNeedle.style.borderRadius = '2px 2px 0 0';
    
    // কাটার মাথা (ত্রিভুজাকার)
    const needleHead = document.createElement('div');
    needleHead.style.width = '0';
    needleHead.style.height = '0';
    needleHead.style.borderLeft = '10px solid transparent';
    needleHead.style.borderRight = '10px solid transparent';
    needleHead.style.borderBottom = '20px solid #e74c3c';
    needleHead.style.position = 'absolute';
    needleHead.style.left = '50%';
    needleHead.style.top = 'calc(50% - 130px)';
    needleHead.style.transform = 'translate(-50%, -100%)';
    needleHead.style.zIndex = '11';
    
    // কিবলা ইন্ডিকেটর তৈরি
    const qiblaIndicator = document.createElement('div');
    qiblaIndicator.style.position = 'absolute';
    qiblaIndicator.style.width = '6px';
    qiblaIndicator.style.height = '140px';
    qiblaIndicator.style.background = 'linear-gradient(to top, transparent, #27ae60 80%)';
    qiblaIndicator.style.left = '50%';
    qiblaIndicator.style.top = '50%';
    qiblaIndicator.style.transformOrigin = 'bottom center';
    qiblaIndicator.style.transform = 'translate(-50%, -100%)';
    qiblaIndicator.style.zIndex = '5';
    qiblaIndicator.style.opacity = '0.9';
    qiblaIndicator.style.borderRadius = '3px';
    
    // সেন্টার পিন তৈরি
    const centerPin = document.createElement('div');
    centerPin.style.position = 'absolute';
    centerPin.style.width = '24px';
    centerPin.style.height = '24px';
    centerPin.style.backgroundColor = '#8B4513';
    centerPin.style.borderRadius = '50%';
    centerPin.style.left = '50%';
    centerPin.style.top = '50%';
    centerPin.style.transform = 'translate(-50%, -50%)';
    centerPin.style.zIndex = '20';
    centerPin.style.boxShadow = '0 0 8px rgba(0,0,0,0.5)';
    centerPin.style.border = '3px solid #fff';
    
    // দিক নির্দেশক লেবেল (N, E, S, W)
    const directions = [
        { label: 'N', angle: 0, color: '#e74c3c' },
        { label: 'E', angle: 90, color: '#333' },
        { label: 'S', angle: 180, color: '#333' },
        { label: 'W', angle: 270, color: '#333' }
    ];
    
    directions.forEach(dir => {
        const direction = document.createElement('div');
        direction.textContent = dir.label;
        direction.style.position = 'absolute';
        direction.style.fontWeight = 'bold';
        direction.style.fontSize = '18px';
        direction.style.color = dir.color;
        direction.style.zIndex = '15';
        
        // দিক নির্দেশকগুলোর অবস্থান নির্ধারণ
        const rad = dir.angle * Math.PI / 180;
        const radius = 120;
        const center = 150;
        
        direction.style.left = (center + Math.sin(rad) * radius - 10) + 'px';
        direction.style.top = (center - Math.cos(rad) * radius - 10) + 'px';
        
        compassContainer.appendChild(direction);
    });
    
    // ডিগ্রী মার্কার তৈরি
    for (let i = 0; i < 36; i++) {
        if (i % 3 !== 0) continue; // প্রতি ৩০ ডিগ্রীতে একটি মার্কার
        
        const marker = document.createElement('div');
        const angle = i * 10;
        const rad = angle * Math.PI / 180;
        const length = i % 9 === 0 ? 20 : 12;
        const width = i % 9 === 0 ? 3 : 2;
        const color = i % 9 === 0 ? '#333' : '#666';
        
        marker.style.position = 'absolute';
        marker.style.width = width + 'px';
        marker.style.height = length + 'px';
        marker.style.backgroundColor = color;
        marker.style.left = '50%';
        marker.style.top = '15px';
        marker.style.transformOrigin = 'bottom center';
        marker.style.transform = `translate(-50%, 0%) rotate(${angle}deg)`;
        
        compassContainer.appendChild(marker);
    }
    
    // তথ্য প্রদর্শনের এলাকা
    const infoDisplay = document.createElement('div');
    infoDisplay.style.textAlign = 'center';
    infoDisplay.style.marginTop = '20px';
    infoDisplay.style.fontSize = '18px';
    infoDisplay.style.color = '#2c3e50';
    infoDisplay.style.fontWeight = '500';
    infoDisplay.innerHTML = 'কিবলা দিক: নির্ণয় করা হচ্ছে...';
    
    // লোকেশন এক্সেস বাটন
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'লোকেশন এক্সেস দিন';
    permissionButton.style.background = '#3498db';
    permissionButton.style.color = 'white';
    permissionButton.style.border = 'none';
    permissionButton.style.padding = '12px 20px';
    permissionButton.style.borderRadius = '30px';
    permissionButton.style.fontSize = '16px';
    permissionButton.style.cursor = 'pointer';
    permissionButton.style.marginTop = '15px';
    permissionButton.style.transition = 'background 0.3s';
    
    permissionButton.onmouseover = function() {
        this.style.background = '#2980b9';
    };
    
    permissionButton.onmouseout = function() {
        this.style.background = '#3498db';
    };
    
    // স্ট্যাটাস মেসেজ
    const statusMessage = document.createElement('div');
    statusMessage.style.margin = '15px 0';
    statusMessage.style.padding = '10px';
    statusMessage.style.borderRadius = '8px';
    statusMessage.style.background = '#fff3cd';
    statusMessage.style.color = '#856404';
    statusMessage.textContent = 'কিবলা দিক নির্ণয় করতে আপনার লোকেশন এক্সেস প্রয়োজন';
    
    // কম্পাস অ্যাসেম্বল করা
    compassContainer.appendChild(fixedNeedle);
    compassContainer.appendChild(needleHead);
    compassContainer.appendChild(qiblaIndicator);
    compassContainer.appendChild(centerPin);
    compasQ.appendChild(compassContainer);
    compasQ.appendChild(infoDisplay);
    compasQ.appendChild(statusMessage);
    compasQ.appendChild(permissionButton);
    
    // মক্কার স্থানাঙ্ক
    const mecca = {
        latitude: 21.4225,
        longitude: 39.8262
    };
    
    let currentPosition = null;
    let qiblaAngle = 0;
    
    // কিবলা দিক নির্ণয়
    function calculateQiblaDirection(lat, lng) {
        const phiK = mecca.latitude * Math.PI / 180.0;
        const lambdaK = mecca.longitude * Math.PI / 180.0;
        const phi = lat * Math.PI / 180.0;
        const lambda = lng * Math.PI / 180.0;
        
        const psi = 180.0 / Math.PI * Math.atan2(
            Math.sin(lambdaK - lambda),
            Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
        );
        
        return (psi + 360) % 360;
    }
    
    // কম্পাস রোটেট করার ফাংশন
    function rotateCompass(alpha) {
        if (currentPosition) {
            // কম্পাস রোটেশন আপডেট
            compassContainer.style.transform = `rotate(${-alpha}deg)`;
            
            // বর্তমান হেডিং相对于 কিবলা দিক
            const relativeQiblaAngle = (qiblaAngle - alpha + 360) % 360;
            
            // কিবলা ইন্ডিকেটর আপডেট
            qiblaIndicator.style.transform = `translate(-50%, -100%) rotate(${relativeQiblaAngle}deg)`;
            
            // তথ্য আপডেট
            infoDisplay.innerHTML = `কিবলা: ${Math.round(relativeQiblaAngle)}° দিকে (উত্তর থেকে)`;
        }
    }
    
    // ডিভাইস ওরিয়েন্টেশন হ্যান্ডলিং
    function handleOrientation(event) {
        if (event.alpha !== null) {
            // iOS ডিভাইসের জন্য কম্পাস কারেকশন
            if (event.webkitCompassHeading !== undefined) {
                rotateCompass(event.webkitCompassHeading);
            } else {
                rotateCompass(360 - event.alpha);
            }
        }
    }
    
    // লোকেশন অনুমতি চাওয়া
    function requestLocation() {
        statusMessage.textContent = "আপনার লোকেশন শনাক্ত করা হচ্ছে...";
        statusMessage.style.background = "#d4edda";
        statusMessage.style.color = "#155724";
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentPosition = position;
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // কিবলা দিক নির্ণয়
                    qiblaAngle = calculateQiblaDirection(lat, lng);
                    
                    infoDisplay.innerHTML = `কিবলা: ${Math.round(qiblaAngle)}° দিকে (উত্তর থেকে)`;
                    statusMessage.textContent = "লোকেশন শনাক্ত করা হয়েছে!";
                    
                    // ডিভাইস ওরিয়েন্টেশন শুনা শুরু করুন
                    if (window.DeviceOrientationEvent) {
                        window.addEventListener('deviceorientation', handleOrientation);
                        statusMessage.textContent += " কম্পাস আপডেট করতে ডিভাইস ঘোরান।";
                    } else {
                        statusMessage.textContent = "এই ডিভাইসে কম্পাস সাপোর্ট করে না।";
                        statusMessage.style.background = "#f8d7da";
                        statusMessage.style.color = "#721c24";
                    }
                },
                function(error) {
                    statusMessage.textContent = "লোকেশন পেতে সমস্যা: " + error.message;
                    statusMessage.style.background = "#f8d7da";
                    statusMessage.style.color = "#721c24";
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            statusMessage.textContent = "এই ব্রাউজারে জিওলোকেশন সাপোর্ট করে না।";
            statusMessage.style.background = "#f8d7da";
            statusMessage.style.color = "#721c24";
        }
    }
    
    // অনুমতি বাটনে ইভেন্ট লিসেনার যোগ
    permissionButton.addEventListener('click', requestLocation);
    
    // ডিভাইস ওরিয়েন্টেশন সাপোর্ট করে কিনা চেক
    if (!window.DeviceOrientationEvent) {
        statusMessage.textContent = "দুঃখিত, আপনার ডিভাইস কম্পাস ফাংশনালিটি সাপোর্ট করে না।";
        statusMessage.style.background = "#f8d7da";
        statusMessage.style.color = "#721c24";
    }
});
