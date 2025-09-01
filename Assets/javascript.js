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
(function() {
    // Create the compass container
    const compasQ = document.getElementById('compasQ');
    if (!compasQ) return;
    
    // Clear any existing content
    compasQ.innerHTML = '';
    
    // Create compass container
    const compassContainer = document.createElement('div');
    compassContainer.style.position = 'relative';
    compassContainer.style.width = '300px';
    compassContainer.style.height = '300px';
    compassContainer.style.margin = '20px auto';
    compassContainer.style.borderRadius = '50%';
    compassContainer.style.backgroundColor = '#f5f5f5';
    compassContainer.style.boxShadow = '0 0 20px rgba(0,0,0,0.2), inset 0 0 20px rgba(0,0,0,0.1)';
    compassContainer.style.overflow = 'hidden';
    
    // Create compass face
    const compassFace = document.createElement('div');
    compassFace.style.position = 'absolute';
    compassFace.style.width = '100%';
    compassFace.style.height = '100%';
    compassFace.style.borderRadius = '50%';
    
    // Create center pin
    const centerPin = document.createElement('div');
    centerPin.style.position = 'absolute';
    centerPin.style.width = '20px';
    centerPin.style.height = '20px';
    centerPin.style.backgroundColor = '#8B4513';
    centerPin.style.borderRadius = '50%';
    centerPin.style.left = '50%';
    centerPin.style.top = '50%';
    centerPin.style.transform = 'translate(-50%, -50%)';
    centerPin.style.zIndex = '20';
    centerPin.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    centerPin.style.border = '3px solid #fff';
    
    // Create compass needle
    const compassNeedle = document.createElement('div');
    compassNeedle.style.position = 'absolute';
    compassNeedle.style.width = '4px';
    compassNeedle.style.height = '120px';
    compassNeedle.style.backgroundColor = '#e74c3c';
    compassNeedle.style.left = '50%';
    compassNeedle.style.top = '50%';
    compassNeedle.style.transformOrigin = 'bottom center';
    compassNeedle.style.transform = 'translate(-50%, -100%)';
    compassNeedle.style.zIndex = '10';
    compassNeedle.style.borderRadius = '2px 2px 0 0';
    
    // Create south part of needle
    const southNeedle = document.createElement('div');
    southNeedle.style.position = 'absolute';
    southNeedle.style.width = '4px';
    southNeedle.style.height = '120px';
    southNeedle.style.backgroundColor = '#2c3e50';
    southNeedle.style.left = '50%';
    southNeedle.style.top = '50%';
    southNeedle.style.transformOrigin = 'top center';
    southNeedle.style.transform = 'translate(-50%, 0%)';
    southNeedle.style.zIndex = '10';
    southNeedle.style.borderRadius = '0 0 2px 2px';
    
    // Create qibla indicator
    const qiblaIndicator = document.createElement('div');
    qiblaIndicator.style.position = 'absolute';
    qiblaIndicator.style.width = '6px';
    qiblaIndicator.style.height = '130px';
    qiblaIndicator.style.background = 'linear-gradient(to top, transparent, #27ae60 80%)';
    qiblaIndicator.style.left = '50%';
    qiblaIndicator.style.top = '50%';
    qiblaIndicator.style.transformOrigin = 'bottom center';
    qiblaIndicator.style.transform = 'translate(-50%, -100%)';
    qiblaIndicator.style.zIndex = '5';
    qiblaIndicator.style.opacity = '0.9';
    qiblaIndicator.style.borderRadius = '3px';
    
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
    
    // Create direction markers
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
        
        // Position the directions
        const rad = dir.angle * Math.PI / 180;
        const radius = 120;
        const center = 150;
        
        direction.style.left = (center + Math.sin(rad) * radius - 10) + 'px';
        direction.style.top = (center - Math.cos(rad) * radius - 10) + 'px';
        
        compassFace.appendChild(direction);
    });
    
    // Create info display
    const infoDisplay = document.createElement('div');
    infoDisplay.style.textAlign = 'center';
    infoDisplay.style.marginTop = '20px';
    infoDisplay.style.fontSize = '18px';
    infoDisplay.style.color = '#2c3e50';
    infoDisplay.style.fontWeight = '500';
    infoDisplay.innerHTML = 'Qibla Direction: Calculating...';
    
    // Create permission button
    const permissionButton = document.createElement('button');
    permissionButton.textContent = 'Enable Location Access';
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
    
    // Create status message
    const statusMessage = document.createElement('div');
    statusMessage.style.margin = '15px 0';
    statusMessage.style.padding = '10px';
    statusMessage.style.borderRadius = '8px';
    statusMessage.style.background = '#fff3cd';
    statusMessage.style.color = '#856404';
    statusMessage.textContent = 'Please allow location access to find Qibla direction';
    
    // Assemble the compass
    compassFace.appendChild(qiblaIndicator);
    compassFace.appendChild(compassNeedle);
    compassFace.appendChild(southNeedle);
    compassFace.appendChild(centerPin);
    compassContainer.appendChild(compassFace);
    compasQ.appendChild(compassContainer);
    compasQ.appendChild(infoDisplay);
    compasQ.appendChild(statusMessage);
    compasQ.appendChild(permissionButton);
    
    // Coordinates of the Kaaba in Mecca
    const mecca = {
        latitude: 21.4225,
        longitude: 39.8262
    };
    
    let currentPosition = null;
    let currentHeading = 0;
    let qiblaAngle = 0;
    
    // Calculate the direction to Mecca (Qibla) from current location
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
    
    // Calculate distance to Mecca
    function calculateDistance(lat, lng) {
        const R = 6371; // Earth's radius in km
        const dLat = (mecca.latitude - lat) * Math.PI / 180;
        const dLon = (mecca.longitude - lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(mecca.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }
    
    // Handle device orientation for compass functionality
    function handleOrientation(event) {
        if (currentPosition) {
            // Get compass heading
            if (event.alpha !== null) {
                currentHeading = 360 - event.alpha; // Convert to clockwise degrees from North
                
                // Apply compass correction for iOS devices
                if (event.webkitCompassHeading !== undefined) {
                    currentHeading = event.webkitCompassHeading;
                }
                
                // Update compass rotation
                compassContainer.style.transform = `rotate(${-currentHeading}deg)`;
                
                // Calculate angle to Qibla relative to current heading
                const relativeQiblaAngle = (qiblaAngle - currentHeading + 360) % 360;
                
                // Update Qibla indicator
                qiblaIndicator.style.transform = `translate(-50%, -100%) rotate(${relativeQiblaAngle}deg)`;
                
                // Update info display
                infoDisplay.innerHTML = `Heading: ${Math.round(currentHeading)}° | Qibla: ${Math.round(relativeQiblaAngle)}°`;
            }
        }
    }
    
    // Request location permission
    function requestLocation() {
        statusMessage.textContent = "Detecting your location...";
        statusMessage.style.background = "#d4edda";
        statusMessage.style.color = "#155724";
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    currentPosition = position;
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Calculate Qibla direction
                    qiblaAngle = calculateQiblaDirection(lat, lng);
                    
                    // Calculate distance to Mecca
                    const distance = calculateDistance(lat, lng);
                    infoDisplay.innerHTML = `Qibla: ${Math.round(qiblaAngle)}° | Distance: ${Math.round(distance)} km`;
                    
                    statusMessage.textContent = "Location detected successfully!";
                    
                    // Start listening to device orientation
                    if (window.DeviceOrientationEvent) {
                        window.addEventListener('deviceorientation', handleOrientation);
                        statusMessage.textContent += " Move your device to see the compass update.";
                    } else {
                        statusMessage.textContent = "Device orientation not supported on this device.";
                        statusMessage.style.background = "#f8d7da";
                        statusMessage.style.color = "#721c24";
                    }
                },
                function(error) {
                    statusMessage.textContent = "Error getting location: " + error.message;
                    statusMessage.style.background = "#f8d7da";
                    statusMessage.style.color = "#721c24";
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            statusMessage.textContent = "Geolocation is not supported by this browser.";
            statusMessage.style.background = "#f8d7da";
            statusMessage.style.color = "#721c24";
        }
    }
    
    // Add event listener to the permission button
    permissionButton.addEventListener('click', requestLocation);
    
    // Check if the device supports orientation events
    if (!window.DeviceOrientationEvent) {
        statusMessage.textContent = "Sorry, your device doesn't support compass functionality.";
        statusMessage.style.background = "#f8d7da";
        statusMessage.style.color = "#721c24";
    }
})();
