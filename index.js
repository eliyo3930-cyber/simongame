var buttonColors = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var buttons = document.querySelectorAll(".btn");
var levelTitle = document.querySelector("#level-title");

function playSound(name) {
    var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
}
function animatePress(color) {
    var button = document.getElementById(color);
    button.classList.add("pressed");

    setTimeout(function () {
        button.classList.remove("pressed");
    }, 100);
}
function startOver() {
    level = 0;
    gamePattern = [];
    userClickedPattern = [];
    started = false;
}
function nextSequence() {
    userClickedPattern = [];
    level++;
    levelTitle.textContent = "Level " + level;

    var randomNumber = Math.floor(Math.random() * 4);
    var randomColor = buttonColors[randomNumber];
    gamePattern.push(randomColor);

    setTimeout(function () {
        animatePress(randomColor);
        playSound(randomColor);
    }, 300);
}
function checkAnswer(currentLevel) {
    if (gamePattern[currentLevel] == userClickedPattern[currentLevel]) {
        if (userClickedPattern.length == gamePattern.length) {
            setTimeout(nextSequence, 1000);
        }
    } else {
        playSound("wrong");
        levelTitle.textContent = "Game Over, Press A to Restart";
        document.body.classList.add("game-over");

        setTimeout(function () {
            document.body.classList.remove("game-over");
        }, 200);

        startOver();
    }
}
levelTitle.textContent = "Press A to Start";
document.addEventListener("keydown", function (event) {
    if (started == false && (event.key == "a" || event.key == "A")) {
        started = true;
        nextSequence();
    }
});
for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
        if (started == false) {
            return;
        }

        var color = this.id;
        userClickedPattern.push(color);
        playSound(color);
        animatePress(color);
        checkAnswer(userClickedPattern.length - 1);
    });
}