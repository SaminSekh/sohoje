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
    majorTickLength: 20,
    minorTickLength: 10,
    font: '16px Arial',
    colors: {
        background: '#f5f5f5',
        circle: '#333',
        needle: 'red',
        north: '#d00',
        east: '#00d',
        south: '#0a0',
        west: '#d60',
        text: '#333'
    }
};

// কম্পাস কন্টেইনার তৈরি করুন
const compasContainer = document.getElementById('compasQ');
const canvas = document.createElement('canvas');
canvas.width = config.size;
canvas.height = config.size;
canvas.style.display = 'block';
canvas.style.margin = '0 auto';
compasContainer.appendChild(canvas);

const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = (canvas.width / 2) - config.circleWidth;

let currentHeading = 0;

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
    
    // ডিগ্রী এবং দিকনির্দেশ আঁকুন
    for (let i = 0; i < 360; i += 5) {
        const angle = (i - heading) * Math.PI / 180;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        // প্রধান টিক চিহ্ন (প্রতি 30 ডিগ্রী)
        if (i % 30 === 0) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = config.colors.circle;
            
            // টিক চিহ্ন আঁকুন
            ctx.beginPath();
            ctx.moveTo(centerX + sin * (radius - config.majorTickLength), centerY - cos * (radius - config.majorTickLength));
            ctx.lineTo(centerX + sin * radius, centerY - cos * radius);
            ctx.stroke();
            
            // দিকনির্দেশ লেবেল
            let direction = '';
            let color = config.colors.text;
            
            if (i === 0) {
                direction = 'N';
                color = config.colors.north;
            } else if (i === 90) {
                direction = 'E';
                color = config.colors.east;
            } else if (i === 180) {
                direction = 'S';
                color = config.colors.south;
            } else if (i === 270) {
                direction = 'W';
                color = config.colors.west;
            } else {
                direction = i.toString();
            }
            
            // লেবেল আঁকুন
            ctx.font = config.font;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(direction, centerX + sin * (radius - config.majorTickLength - 20), centerY - cos * (radius - config.majorTickLength - 20));
        } 
        // ছোট টিক চিহ্ন
        else {
            ctx.lineWidth = 1;
            ctx.strokeStyle = config.colors.circle;
            
            ctx.beginPath();
            ctx.moveTo(centerX + sin * (radius - config.minorTickLength), centerY - cos * (radius - config.minorTickLength));
            ctx.lineTo(centerX + sin * radius, centerY - cos * radius);
            ctx.stroke();
        }
    }
    
    // কম্পাস সুই আঁকুন
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 20);
    ctx.lineTo(centerX - 10, centerY);
    ctx.lineTo(centerX, centerY + 10);
    ctx.lineTo(centerX + 10, centerY);
    ctx.closePath();
    ctx.fillStyle = config.colors.needle;
    ctx.fill();
    
    // কেন্দ্রীয় বিন্দু আঁকুন
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = config.colors.circle;
    ctx.fill();
}

// ডিভাইস ওরিয়েন্টেশন শনাক্ত করুন
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        // কম্পাস হেডিং নিন (ডিগ্রীতে)
        if (event.alpha !== null) {
            currentHeading = event.alpha; // iOS এবং কিছু Android ডিভাইস
        } else if (event.webkitCompassHeading !== undefined) {
            currentHeading = event.webkitCompassHeading; // iOS WebKit
        }
        
        // কম্পাস আপডেট করুন
        drawCompass(currentHeading);
    }, false);
} else {
    // ডিভাইস ওরিয়েন্টেশন সাপোর্ট করে না
    ctx.font = '20px Arial';
    ctx.fillStyle = config.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('কম্পাস আপনার ডিভাইসে সাপোর্ট করে না', centerX, centerY);
}

// প্রথমবার কম্পাস আঁকুন
drawCompass(currentHeading);
