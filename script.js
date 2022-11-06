const pomodoroBtns = document.querySelectorAll('.button')
const pomodoroBtn = document.getElementById('pomodoro-btn')
const shortBreakBtn = document.getElementById('short-break-btn')
const longBreakBtn = document.getElementById('long-break-btn')
const startBtn = document.getElementById('start-btn')
const resetBtn = document.getElementById('reset-btn')
const countdownTimer = document.getElementById('countdown')
const addTaskBtn = document.getElementById('add-task-btn')
const addTaskForm = document.getElementById('task-form')
const cancelBtn = document.getElementById('cancel')
const pomodoroInput = document.getElementById('est-pomodoro')
const saveBtn = document.getElementById('save')
const audio = document.getElementById('audio')

let tasks = []
let minutes 
let seconds 
let pause 
let pomodoro = "pomodoro"
let pomodorosCompleted = 0
let selectedTaskElement

let array = ["minutes","seconds","pause","countdownTimer","pbutton"];
chrome.storage.sync.get(array,function(value){
    if(!chrome.runtime.error){
        console.log(value);

        if(value.minutes)
            minutes = value.minutes;
        else
            minutes = 25;

        if(value.seconds)
            seconds = value.seconds;
        else
            seconds = 60;

        if(value.countdownTimer)
            countdownTimer.innerHTML = value.countdownTimer;
        else
            countdownTimer.innerHTML = "25:00";

        if((value.pause) && (value.countdownTimer != "25:00")){
            pause = value.pause;
            startBtn.innerHTML = "start"
        }
        else if((!value.pause) && (value.countdownTimer != "25:00")){
            pause = value.pause;
            startBtn.innerHTML = "Pause"
            countdown() 
        }
        else
            pause = true;
            
        if (value.pbutton){
            if (value.pbutton == "shortBreakBtn"){
                shortBreakBtn.classList.add('selected');
            }
            else if (value.pbutton == "longBreakBtn"){
                longBreakBtn.classList.add('selected');
            }
            else {
                pomodoroBtn.classList.add('selected');
            }
        }
        else
            pomodoroBtn.classList.add('selected');
    }
});

// event listener for pomodoro buttons
document.addEventListener('click', e => {
    if(!e.target.matches('.button')) return

    // reset when pomodoro button selected
    pause = true
    seconds = 60
    startBtn.innerHTML = "Start"

    chrome.storage.sync.set({"pause": pause, "seconds": seconds},function(){
        if(!chrome.runtime.error){
            console.log("added target pomodoro");
        }
    })

    // only selected button has selected class
    pomodoroBtns.forEach(button => {
        button.classList.remove('selected')
    })
    e.target.classList.add('selected')

    let pbutton

    if (e.target.classList == shortBreakBtn.classList){
        pbutton = "shortBreakBtn"
    }
    else if (e.target.classList == longBreakBtn.classList){
        pbutton = "longBreakBtn"
    }
    else {
        pbutton = "pomodoroBtn"
    }

    chrome.storage.sync.set({"pbutton":pbutton},function(){
        if(!chrome.runtime.error){
            console.log("added target pomodoro");
        }
    })

    // set timer
    if(e.target.matches('#pomodoro-btn')) {
        countdownTimer.innerHTML = '25:00'
        pomodoro = "pomodoro"
        minutes = 25
        chrome.storage.sync.set({"minutes":minutes,"countdownTimer":"25:00"},function(){
            if(!chrome.runtime.error){
                console.log("added target pomodoro");
            }
        })
    } else if(e.target.matches('#short-break-btn')) {
        countdownTimer.innerHTML = '05:00'
        pomodoro = "short break"
        minutes = 5
        chrome.storage.sync.set({"minutes":minutes,"countdownTimer":"05:00"},function(){
            if(!chrome.runtime.error){
                console.log("added target pomodoro");
            }
        })
    } else if(e.target.matches('#long-break-btn')) {
        countdownTimer.innerHTML = '15:00'
        pomodoro = "long break"
        minutes = 15
        chrome.storage.sync.set({"minutes":minutes,"countdownTimer":"15:00"},function(){
            if(!chrome.runtime.error){
                console.log("added target pomodoro");
            }
        })
    }
})

// event listener for start button
startBtn.addEventListener('click', () => {
    // if countdown is paused, start/resume countdown, otherwise, pause countdown
    if (pause) {
        startBtn.innerHTML = "Pause"
        pause = false
        countdown()
        chrome.storage.sync.set({"pause":false},function(){
            if(!chrome.runtime.error){
                console.log("started");
            }
        })
    } else if (!pause) {
        startBtn.innerHTML = "Start"
        pause = true
        chrome.storage.sync.set({"pause":true},function(){
            if(!chrome.runtime.error){
                console.log("paused");
            }
        })
    }
})

// event listener for reset button
resetBtn.addEventListener('click', () => {
    minutes = 25
    pause = true
    pomodoro = "pomodoro"
    seconds = 60
    startBtn.innerHTML = "Start"
    countdownTimer.innerHTML = '25:00'

    let dict = {
        "minutes":25,
        "pause":true,
        "seconds":60,
        "countdownTimer":"25:00"
    }

    chrome.storage.sync.set(dict,function(){
        if(!chrome.runtime.error){
            console.log("paused");
        }
    })

})

// countdown function
function countdown() {
    // return if countdown is paused
    if(pause) return

    // set minutes and seconds
    let currentMins = minutes - 1
    seconds--
    let currentTimer = (currentMins < 10 ? "0" : "") + currentMins.toString() + ':' + (seconds < 10 ? "0" : "") + String(seconds)
    countdownTimer.innerHTML = currentTimer

    chrome.storage.sync.set({"seconds":seconds,"countdownTimer":currentTimer},function(){
        if(!chrome.runtime.error){
            console.log("started");
        }
    })
    // count down every second, when a minute is up, countdown one minute
    // when time reaches 0:00, reset
    if(seconds > 0) {
        setTimeout(countdown, 1000);
    } else if(currentMins > 0){
        seconds = 60
        minutes--
        chrome.storage.sync.set({"seconds":seconds,"minutes":minutes},function(){
            if(!chrome.runtime.error){
                console.log("started");
            }
        })
        countdown();           
    } else if(currentMins === 0) {
        audio.play()
        reset()        
    }
}

// reset function when countdown ends
function reset() {
    // set to start the next round    
    startBtn.innerHTML = "Start"
    pause = true

    pomodoroBtns.forEach(button => {
        button.classList.remove('selected')
    })

    // if current round is a break, set for pomodoro
    if (pomodoro === "short break" || pomodoro === "long break") {
        pomodoro = "pomodoro"
        countdownTimer.innerHTML = '25:00'
        minutes = 25
        pomodoroBtn.classList.add('selected')
        return
    }
}