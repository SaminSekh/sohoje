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
    // Create the compass container
    const compasQ = document.getElementById('compasQ');
    
    // Create compass elements
    const compassContainer = document.createElement('div');
    compassContainer.style.position = 'relative';
    compassContainer.style.width = '300px';
    compassContainer.style.height = '300px';
    compassContainer.style.margin = '20px auto';
    compassContainer.style.borderRadius = '50%';
    compassContainer.style.backgroundColor = '#f0f0f0';
    compassContainer.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
    
    // Create compass face
    const compassFace = document.createElement('div');
    compassFace.style.position = 'absolute';
    compassFace.style.width = '100%';
    compassFace.style.height = '100%';
    compassFace.style.borderRadius = '50%';
    compassFace.style.background = 'radial-gradient(circle, #fff 60%, #eaeaea 100%)';
    
    // Create compass directions
    const directions = ['N', 'E', 'S', 'W'];
    directions.forEach((dir, index) => {
        const direction = document.createElement('div');
        direction.textContent = dir;
        direction.style.position = 'absolute';
        direction.style.fontWeight = 'bold';
        direction.style.fontSize = '18px';
        direction.style.color = dir === 'N' ? 'red' : '#333';
        
        // Position the directions
        const angle = index * 90;
        const rad = angle * Math.PI / 180;
        const radius = 120;
        const center = 150;
        
        direction.style.left = (center + Math.sin(rad) * radius - 10) + 'px';
        direction.style.top = (center - Math.cos(rad) * radius - 10) + 'px';
        
        compassFace.appendChild(direction);
    });
    
    // Create qibla indicator
    const qiblaIndicator = document.createElement('div');
    qiblaIndicator.style.position = 'absolute';
    qiblaIndicator.style.width = '4px';
    qiblaIndicator.style.height = '40px';
    qiblaIndicator.style.backgroundColor = 'green';
    qiblaIndicator.style.left = '50%';
    qiblaIndicator.style.top = '50%';
    qiblaIndicator.style.transformOrigin = 'bottom center';
    qiblaIndicator.style.transform = 'translate(-50%, -100%)';
    qiblaIndicator.style.zIndex = '10';
    
    // Create compass needle
    const compassNeedle = document.createElement('div');
    compassNeedle.style.position = 'absolute';
    compassNeedle.style.width = '4px';
    compassNeedle.style.height = '120px';
    compassNeedle.style.backgroundColor = 'red';
    compassNeedle.style.left = '50%';
    compassNeedle.style.top = '50%';
    compassNeedle.style.transformOrigin = 'bottom center';
    compassNeedle.style.transform = 'translate(-50%, -100%)';
    
    // Create center pin
    const centerPin = document.createElement('div');
    centerPin.style.position = 'absolute';
    centerPin.style.width = '20px';
    centerPin.style.height = '20px';
    centerPin.style.backgroundColor = '#333';
    centerPin.style.borderRadius = '50%';
    centerPin.style.left = '50%';
    centerPin.style.top = '50%';
    centerPin.style.transform = 'translate(-50%, -50%)';
    centerPin.style.zIndex = '20';
    centerPin.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    
    // Create degree markers
    for (let i = 0; i < 36; i++) {
        const marker = document.createElement('div');
        const angle = i * 10;
        const rad = angle * Math.PI / 180;
        const length = i % 9 === 0 ? 20 : 10;
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
        
        compassFace.appendChild(marker);
    }
    
    // Create info display
    const infoDisplay = document.createElement('div');
    infoDisplay.style.textAlign = 'center';
    infoDisplay.style.marginTop = '20px';
    infoDisplay.style.fontSize = '18px';
    infoDisplay.innerHTML = 'Qibla Direction: Calculating...';
    
    // Assemble the compass
    compassFace.appendChild(qiblaIndicator);
    compassFace.appendChild(compassNeedle);
    compassFace.appendChild(centerPin);
    compassContainer.appendChild(compassFace);
    compasQ.appendChild(compassContainer);
    compasQ.appendChild(infoDisplay);
    
    // Simulate compass functionality
    // In a real implementation, you would use device orientation API
    let currentHeading = 0;
    const qiblaAngle = 45; // Example angle - this would be calculated based on user's location
    
    function updateCompass() {
        // Simulate compass movement
        currentHeading = (currentHeading + 1) % 360;
        
        // Rotate the needle
        compassNeedle.style.transform = `translate(-50%, -100%) rotate(${currentHeading}deg)`;
        
        // Calculate the angle to Qibla
        const angleToQibla = (qiblaAngle - currentHeading + 360) % 360;
        
        // Update the info display
        infoDisplay.innerHTML = `Heading: ${currentHeading}° | Qibla: ${angleToQibla}°`;
        
        // Request the next animation frame
        requestAnimationFrame(updateCompass);
    }
    
    // Start the compass animation
    updateCompass();
});
