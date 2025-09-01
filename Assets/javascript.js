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


// কম্পাস কনফিগারেশন
const config = {
    size: 300,
    circleWidth: 10,
    colors: {
        background: '#f8f9fa',
        circle: '#343a40',
        needle: '#dc3545',
        north: '#dc3545',
        east: '#007bff',
        south: '#28a745',
        west: '#fd7e14',
        text: '#212529'
    }
};

// কম্পাস কন্টেইনার তৈরি করুন
const compasContainer = document.getElementById('compasQ');
compasContainer.style.display = 'flex';
compasContainer.style.flexDirection = 'column';
compasContainer.style.alignItems = 'center';
compasContainer.style.justifyContent = 'center';
compasContainer.style.padding = '20px';
compasContainer.style.fontFamily = 'Arial, sans-serif';

const canvas = document.createElement('canvas');
canvas.width = config.size;
canvas.height = config.size;
canvas.style.display = 'block';
canvas.style.margin = '0 auto';
canvas.style.borderRadius = '50%';
canvas.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
compasContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = (canvas.width / 2) - config.circleWidth;

let currentHeading = 0;

// ডিগ্রী থেকে দিক নির্ধারণ
function getDirectionName(degrees) {
    const directions = ['উত্তর', 'উত্তর-পূর্ব', 'পূর্ব', 'দক্ষিণ-পূর্ব', 'দক্ষিণ', 'দক্ষিণ-পশ্চিম', 'পশ্চিম', 'উত্তর-পশ্চিম'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

// কম্পাস আঁকুন
function drawCompass(heading) {
    // ক্যানভাস পরিষ্কার করুন
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // বাইরের বৃত্ত আঁকুন
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + config.circleWidth, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors.background;
    ctx.fill();
    ctx.strokeStyle = config.colors.circle;
    ctx.lineWidth = config.circleWidth;
    ctx.stroke();
    
    // অভ্যন্তরীণ বৃত্ত আঁকুন
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // প্রধান দিকনির্দেশ (N, E, S, W) আঁকুন
    const mainDirections = [
        { text: 'N', angle: 0, color: config.colors.north },
        { text: 'E', angle: 90, color: config.colors.east },
        { text: 'S', angle: 180, color: config.colors.south },
        { text: 'W', angle: 270, color: config.colors.west }
    ];
    
    mainDirections.forEach(dir => {
        const angle = (dir.angle - heading) * Math.PI / 180;
        const x = centerX + Math.sin(angle) * (radius - 40);
        const y = centerY - Math.cos(angle) * (radius - 40);
        
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = dir.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dir.text, x, y);
    });
    
    // ডিগ্রী চিহ্ন আঁকুন
    for (let i = 0; i < 360; i += 30) {
        if (i % 90 === 0) continue; // Skip main directions
        
        const angle = (i - heading) * Math.PI / 180;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        // টিক চিহ্ন
        ctx.beginPath();
        ctx.moveTo(centerX + sin * (radius - 20), centerY - cos * (radius - 20));
        ctx.lineTo(centerX + sin * radius, centerY - cos * radius);
        ctx.strokeStyle = config.colors.circle;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // ডিগ্রী সংখ্যা
        const x = centerX + sin * (radius - 55);
        const y = centerY - cos * (radius - 55);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = config.colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), x, y);
    }
    
    // স্থির সুই আঁকুন (সর্বদা উত্তর দিকে নির্দেশ করে)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 25);
    ctx.lineTo(centerX - 15, centerY);
    ctx.lineTo(centerX, centerY + 10);
    ctx.lineTo(centerX + 15, centerY);
    ctx.closePath();
    ctx.fillStyle = config.colors.needle;
    ctx.fill();
    
    // কেন্দ্রীয় বিন্দু আঁকুন
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors.circle;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // বর্তমান দিকনির্দেশ তথ্য প্রদর্শন
    ctx.font = '16px Arial';
    ctx.fillStyle = config.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`দিক: ${getDirectionName(heading)}`, centerX, centerY + 70);
    ctx.fillText(`ডিগ্রী: ${Math.round(heading)}°`, centerX, centerY + 95);
}

// ডিভাইস ওরিয়েন্টেশন শনাক্ত করুন
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        // কম্পাস হেডিং নিন (ডিগ্রীতে)
        if (event.alpha !== null) {
            // iOS এবং কিছু Android ডিভাইসের জন্য
            currentHeading = event.alpha;
        } else if (event.webkitCompassHeading !== undefined) {
            // iOS WebKit-এর জন্য
            currentHeading = event.webkitCompassHeading;
        }
        
        // কম্পাস আপডেট করুন
        drawCompass(currentHeading);
    }, false);
} else {
    // ডিভাইস ওরিয়েন্টেশন সাপোর্ট করে না
    ctx.font = '18px Arial';
    ctx.fillStyle = config.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('কম্পাস আপনার ডিভাইসে সাপোর্ট করে না', centerX, centerY);
}

// প্রথমবার কম্পাস আঁকুন
drawCompass(currentHeading);

// অনুমতি বাটন তৈরি করুন (iOS ডিভাইসের জন্য)
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'কম্পাস এক্সেস অনুমতি দিন';
    permissionButton.style.marginTop = '20px';
    permissionButton.style.padding = '10px 20px';
    permissionButton.style.background = '#007bff';
    permissionButton.style.color = 'white';
    permissionButton.style.border = 'none';
    permissionButton.style.borderRadius = '5px';
    permissionButton.style.cursor = 'pointer';
    permissionButton.style.fontSize = '16px';
    
    permissionButton.onclick = function() {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    permissionButton.style.display = 'none';
                    window.addEventListener('deviceorientation', function(event) {
                        if (event.webkitCompassHeading !== undefined) {
                            currentHeading = event.webkitCompassHeading;
                            drawCompass(currentHeading);
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Compass permission error:', error);
            });
    };
    
    compasContainer.appendChild(permissionButton);
}
