const volumeSlider = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const testFireButton = document.getElementById("test-fire");

function playGunShot(){
    const gunshot = new Audio("sounds/shotgun_2.wav");
    gunshot.volume = volumeSlider.value / 100;
    gunshot.play();
}

document.addEventListener("keydown", function(event){
    console.log(event.key);
    playGunShot();
});

volumeSlider.addEventListener("input", function(){
    volumeValue.textContent = `${volumeSlider.value}%`;
})

testFireButton.addEventListener("click", function(){
    playGunShot();
})