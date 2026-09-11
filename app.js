const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const testFireButton = document.getElementById("test-fire");
const weaponSelector = document.getElementById("weapon");

//Mapping sound path for each weapon
const weapons = {
    machinegun : "sounds/machine_gun1.mp3",
    shotgun1 : "sounds/shotgun_1.wav",
    shotgun2 : "sounds/shotgun_2.mp3"
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

document.addEventListener("keydown", function(event){
    console.log(event.key);
    playGunShot(selectedWeapon);
});

volumeSlider.addEventListener("input", function(){
    volumeValue.textContent = `${volumeSlider.value}%`;
})

testFireButton.addEventListener("click", function(){
    playGunShot(selectedWeapon);
})

weaponSelector.addEventListener("change", function(event){
    selectedWeapon = event.target.value;
    console.log(selectedWeapon);
})