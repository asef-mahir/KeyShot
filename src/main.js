const { listen } = window.__TAURI__.event;

const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const testFireButton = document.getElementById("test-fire");
const weaponSelector = document.getElementById("weapon");

//Mapping sound path for each weapon
const weapons = {
    machinegun : "assets/sounds/machine_gun1.mp3",
    shotgun1 : "assets/sounds/shotgun_1.wav",
    shotgun2 : "assets/sounds/shotgun_2.mp3"
}

//state: Defaults to the first option in the dropdown menu
let selectedWeapon = weaponSelector.value;   

function playGunShot(weaponKey){
    const soundpath = weapons[weaponKey];

    if(!soundpath){
        console.error(`Sound file for weapon ${weaponKey} not found.`);
        return;
    }
    const gunshot = new Audio(soundpath);
    gunshot.volume = volumeSlider.value / 100;
    gunshot.play();
}     

function triggerSound(){
    playGunShot(selectedWeapon);
}

// Handle keys while the KeyShot page has keyboard focus.
document.addEventListener("keydown", triggerSound);

// Handle global keys only while the KeyShot page is unfocused.
await listen("keyshot-keypress", () => {
    if (!document.hasFocus()) {
        triggerSound();
    }
});

volumeSlider.addEventListener("input", function(){
    volumeValue.textContent = `${volumeSlider.value}%`;
})

testFireButton.addEventListener("click", triggerSound)

weaponSelector.addEventListener("change", function(event){
    selectedWeapon = event.target.value;
})
