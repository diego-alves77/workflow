const fs = require('fs');
const path = require('path')
let moment = require('moment')

// File Paths
const flowFile = path.join(process.cwd(),'/processing/flow.json');
const flowCounterFile = path.join(process.cwd(),'/processing/flow_counter.json');
const targetTimeFile = path.join(process.cwd(),'/processing/target_time.json');
const timePausedFile = path.join(process.cwd(),'/processing/time_paused.json');
const turnoverTokenFile = path.join(process.cwd(),'/processing/turnover_token.json');
const tasksFile = path.join(process.cwd(),'/processing/tasks.json');

var audio1 = new Audio("../sounds/computerbeep_75.mp3");
var audio2 = new Audio("../sounds/alert13.mp3");

const goal = document.getElementById("goal");
const inputOption = document.getElementById("input-option")
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const endBtn = document.getElementById("end-btn")
const tokenBtn = document.getElementById("token-btn")
const submitBtn = document.getElementById("submit")
const note = document.getElementById("note")
const report = document.getElementById("report")
const form = document.getElementById("health-form")

// To close when end.
const remote = require('electron').remote
let currentWindow = remote.getCurrentWindow()

startBtn.addEventListener("click", startNewTask);
endBtn.addEventListener("click",finishDay)
submitBtn.addEventListener("click", healthLog);
tokenBtn.addEventListener("click", useTurnoverToken)

let wasPaused = false;
let activeSetIntervalID = undefined;

inputOption.addEventListener('change', (event) => {
   let resultStr = `Input mode switched to ${event.target.value}.`;
   logTask(resultStr)
});

function twoDigit(value) {
  // Formats a number into a string with 2 digits, for time display.

  //console.log('The value in twoDigit is:');
  //console.log(value);
  //console.log(typeof value);

  let result;

  if (value<10) {
    //console.log('Entered 1.');
    result = "0" + value.toString();
  } else {
    //console.log('Entered 2.');
    result = value.toString();
  }
  return result;
}

function installCountdown(after) {

  //console.log('Command rcv to set countdown timer for:')
  //console.log(after.format('DD MM YYYY, hh:mm:ss'));

  //console.log('Was paused?')
  //console.log(wasPaused)

  // Update the count down every 1 second:
  var x = setInterval(function() {

    // Externalizes x:
    activeSetIntervalID = x;

    let now = moment();

    //console.log('Now is exactly:')
    //console.log(now.format());

    // Find the distance between now and the count down date
    var distance = after.diff(now);

    //console.log('The distance (ms) is currently:')
    //console.log(distance)

    // Time calculations for days, hours, minutes and seconds
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    document.getElementById("timer").innerHTML = twoDigit(hours) + ":" + twoDigit(minutes) + ":" + twoDigit(seconds)
    // If the count down is over, write some text
    if (distance<0) {
      clearInterval(x);
      updateTurnover();
      updateTotalTasks()
      reportStatus()

      // Resets the was paused, now for another cycle:
      wasPaused = false;

      document.getElementById("timer").innerHTML = "FINISHED";
      disableBtn(pauseBtn);
      pauseBtn.removeEventListener("click", pauseTask);

      // See if it is the last task of the day:
      let flowCounter = loadCounter()
      let flowArray = loadFlow()
      let flowCycles = flowArray[0]

      if (flowCounter === (Number(flowCycles)+1)) {
        //console.log("End day.")
        logTask("End day.")
      } else  {
        // Keeps going.
        enableBtn(startBtn);
        startBtn.addEventListener("click", startNewTask);
      }
      // Play complete sound.
      audio2.play()

    }
  }, 1000);

}

function enableBtn(btnElement) {
  btnElement.disabled = false;
  btnElement.style.backgroundColor = "black";
  btnElement.style.color = "white";
}

function disableBtn(btnElement) {
  btnElement.disabled = true;
  btnElement.style.backgroundColor = "lightgray";
  btnElement.style.color = "black";
}

function startNewTask() {

  //console.log('START PRESSED')

  disableBtn(startBtn);
  startBtn.removeEventListener("click", startNewTask);
  enableBtn(pauseBtn);
  pauseBtn.addEventListener("click", pauseTask);

  // Loads the tasklist and the current task:
  let flowCyclesArray = loadFlow();
  let flowCycles = flowCyclesArray[0];
  let flow = flowCyclesArray[1];
  let lastTaskCount = loadCounter();

  // Increments task, but only if is not paused:
  if (wasPaused) {
    //console.log('It was indeed paused before.')

    logTask("Task resumed.");

    // Toggles was paused
    let isPaused = false

    // Resumes current task:
    let currentTaskCount = lastTaskCount;

    //console.log('We will do this task now:')
    //console.log(currentTaskCount)

    // Reads target time from file, that was supposed to be
    let timeForBlastJSON2 = fs.readFileSync(targetTimeFile);
    let timeForBlastJSON2Str = JSON.parse(timeForBlastJSON2);

    let oldTimeForBlast = moment(timeForBlastJSON2Str["toBlast"]);

    // Reads the time that the pause happened:
    let pausedTimeJSON2 = fs.readFileSync(timePausedFile);
    let pausedTimeJSONStr2 = JSON.parse(pausedTimeJSON2);

    let pausedTime2 = moment(pausedTimeJSONStr2["pausedTime"]);

    // Delay is:
    let rightNow2 = moment()

    //console.log('Now is exactly:')
    //console.log(rightNow2.format('DD MM YYYY, hh:mm:ss'))
    //console.log('The program was paused in:')
    //console.log(pausedTime2.format('DD MM YYYY, hh:mm:ss'))

    let delay_ms = rightNow2.diff(pausedTime2)
    let delay_s = delay_ms/1000

    //console.log('The delay in the pause was in seconds:')
    //console.log(delay_s)

    let newTimeForBlast = oldTimeForBlast.add(delay_s,'seconds')

    //console.log("The time for installing the next countdown is:")
    //console.log(newTimeForBlast.format('DD MM YYYY, hh:mm:ss'));

    // For consecutive pauses, we need to update this blast time:
    let newTimeForBlastStr = newTimeForBlast.format();
    let newTimeForBlastJSON = { "toBlast":newTimeForBlastStr }
    // Saves that time for reset in file;
    newTimeForBlastJSON = JSON.stringify(newTimeForBlastJSON) ;
    fs.writeFileSync(targetTimeFile,newTimeForBlastJSON) ;

    // Starts the countdown, tick tick tick....
    installCountdown(newTimeForBlast);

  } else {
    //console.log('It was not paused before.')

    // Increases the counter of task;
    updateCounter();

    let currentTaskCount = lastTaskCount;

    //console.log('We will do this task now:')
    //console.log(currentTaskCount)

    // Finds the time that countdown should end:
    let minutesToGo = flow[currentTaskCount][1]
    let timeForBlast = moment().add(minutesToGo,'minutes');
    let timeForBlastStr = timeForBlast.format();
    let timeForBlastJSON = { "toBlast":timeForBlastStr }
    // Saves that time for reset in file;
    timeForBlastJSON = JSON.stringify(timeForBlastJSON) ;
    fs.writeFileSync(targetTimeFile,timeForBlastJSON) ;

    //console.log("The time for installing the next countdown is:")
    //console.log(timeForBlast.format());

    // Starts the countdown, tick tick tick....
    installCountdown(timeForBlast);

    //Writes task to goal area:
    goal.innerHTML = flow[currentTaskCount][0];

    logTask(flow[currentTaskCount][0]);

  }

}

function logTask(task) {

  var inputOptionStr = inputOption.options[inputOption.selectedIndex].text;

  let nowStr = moment().format("DD_MM_YYYY");

  let logfile = path.join(process.cwd(),'/logs/' + nowStr + '.txt')

  let rightNowSTr = moment().format("MMMM Do YYYY h:mm:ss a");

  let toWrite = rightNowSTr + " " + inputOptionStr +  " " + task + "\n"

  fs.appendFile(logfile, toWrite, function (err) {
    if (err) throw err;
      console.log('ERROR: Unable to write on log file.');
  });

}

function healthLog() {

  //console.log('Entered healthLog function.')

  let nowStr = moment().format("DD_MM_YYYY");

  let logfile = path.join(process.cwd(),'/healthlogs/' + nowStr + '.txt')

  let rightNowSTr = moment().format("MMMM DD YYYY, h:mm:ss a");

  let toWrite = rightNowSTr + " " + note.value + "\n"

  fs.appendFile(logfile, toWrite, function (err) {
    if (err) throw err;
      console.log('ERROR: Unable to log in health log file.');
  });

  // Consumes the text in the input.
  form.reset()

}

function pauseTask() {

  //console.log('PAUSE PRESSED')

  disableBtn(pauseBtn);
  pauseBtn.removeEventListener("click", pauseTask);
  enableBtn(startBtn);
  startBtn.addEventListener("click", startNewTask);

  //console.log("Killing setInterval() of ID:")
  //console.log(activeSetIntervalID)

  clearInterval(activeSetIntervalID)

  // Toggle was paused, indicating that the flow was paused:
  wasPaused = true;

  // Register the time it stopped.
  // The difference from this time to now should be added to the target countdown
  // timer when resumed.
  let pausedTime1 = moment();
  let pausedTimeStr1 = pausedTime1.format();
  let pausedTimeJSON1= { "pausedTime":pausedTimeStr1 }
  // Saves that time for reset in file;
  pausedTimeJSON1 = JSON.stringify(pausedTimeJSON1) ;
  fs.writeFileSync(timePausedFile,pausedTimeJSON1) ;

  //console.log("Registered the stopped time as:")
  //console.log(pausedTime1.format('DD MM YYYY, hh:mm:ss'));

  logTask("Task paused.");
}

function loadFlow() {
  // Loads Flow:
  let flowJSON = fs.readFileSync(flowFile);
  let flowObject = JSON.parse(flowJSON);

  return [flowObject["flowCycles"],flowObject["flow"]];
}

function loadCounter() {
  // Loads Flow Counter:
  let flowCounterJSON = fs.readFileSync(flowCounterFile);
  let flowCounter = JSON.parse(flowCounterJSON);

  return flowCounter["flowCounter"];
}

function loadTurnover() {
  // Loads Turnover Counter:
  let turnoverJSON = fs.readFileSync(turnoverTokenFile);
  let turnover = JSON.parse(turnoverJSON);

  let tasks = turnover["tasks"]
  let tokensFloat = turnover["tokensFloat"]
  let tokensInt = turnover["tokensInt"]

  return [tasks, tokensFloat, tokensInt]
}

function loadTotalTasks() {
  // Loads Flow Counter:
  let totalTasksJSON = fs.readFileSync(tasksFile);
  let totalTasks = JSON.parse(totalTasksJSON);

  return totalTasks["totalTasks"];
}

async function fullDisable() {
  disableBtn(startBtn);
  startBtn.removeEventListener("click", startNewTask);
  disableBtn(pauseBtn);
  pauseBtn.removeEventListener("click", pauseTask);
  disableBtn(endBtn);
  endBtn.removeEventListener("click",finishDay);
  disableBtn(tokenBtn);
  tokenBtn.removeEventListener("click",useTurnoverToken);

  report.innerHTML = "Program complete. Shutdown is imminent."

  // Waits 3 sec:
  await sleep(2000);

  // Close the window.
  currentWindow.close()
}

function updateCounter() {

  let flowCounter = loadCounter();

  let flowArray = loadFlow();
  let flowCycles = flowArray[0];


  //console.log('We are updating the flow counter to:')
  //console.log(flowCounter)
  //console.log('It will reset when it reaches one more than:')
  //console.log(flowCycles)

  flowCounter = flowCounter + 1;

  if (flowCounter === (Number(flowCycles)+1)) {
    // Resets to one;
    flowCounter = 1;

    // Program has run its course, it is time to go to bed:
    fullDisable();
  }

  let flowCounterJSON = {"flowCounter":flowCounter} ;
  flowCounterJSON = JSON.stringify(flowCounterJSON) ;
  fs.writeFileSync(flowCounterFile,flowCounterJSON) ;
}

function updateTurnover() {
  let turoverArray = loadTurnover();

  let tasks = turoverArray[0]
  let tokensFloat = turoverArray[1]
  let tokensInt = turoverArray[2]

  //console.log('We are updating turnover token counter:')
  //console.log('Current values are:')
  //console.log(tasks)
  //console.log(typeof tasks)
  //console.log(tokensFloat)
  //console.log(typeof tokensFloat)
  //console.log(tokensInt)
  //console.log(typeof tokensInt)

  tasks = tasks + 1;

  tokensFloat = tokensFloat + (1/85);

  tokensInt = Math.round(tokensFloat);

  let turnoverJSON = {"tasks":tasks,"tokensFloat":tokensFloat,"tokensInt":tokensInt} ;
  turnoverJSON = JSON.stringify(turnoverJSON) ;
  fs.writeFileSync(turnoverTokenFile,turnoverJSON) ;
}

function updateTotalTasks() {
  let totalTasks = loadTotalTasks();

  totalTasks = totalTasks + 1;

  let totalTasksJSON = {"totalTasks":totalTasks} ;
  totalTasksJSON = JSON.stringify(totalTasksJSON) ;

  fs.writeFileSync(tasksFile,totalTasksJSON) ;
}

function useTurnoverToken() {

  // Confirmation Dialog code comes here.
  // TO-DO.

  let status;

  // Load turnover tokens:
  let turoverArray = loadTurnover();

  let tasks = turoverArray[0]
  let tokensFloat = turoverArray[1]
  let tokensInt = turoverArray[2]

  //console.log('Attempting to use turnover token:')
  //console.log('Current values are:')
  //console.log(tasks)
  //console.log(typeof tasks)
  //console.log(tokensFloat)
  //console.log(typeof tokensFloat)
  //console.log(tokensInt)
  //console.log(typeof tokensInt)

  if (tokensInt >= 1) {

    status = true;

    //console.log('You have enough tokens to use, using it.')

    tasks = tasks - 85;

    tokensFloat = tokensFloat - 1.000;

    tokensInt = Math.round(tokensFloat);

    let turnoverJSON = {"tasks":tasks,"tokensFloat":tokensFloat,"tokensInt":tokensInt} ;
    turnoverJSON = JSON.stringify(turnoverJSON) ;
    fs.writeFileSync(turnoverTokenFile,turnoverJSON) ;

    //console.log('New turnover token values are:')
    //console.log('Current values are:')
    //console.log(tasks)
    //console.log(typeof tasks)
    //console.log(tokensFloat)
    //console.log(typeof tokensFloat)
    //console.log(tokensInt)
    //console.log(typeof tokensInt)

    logTask("Cha-ching! Turnover token applied.")

  } else {

    status == false;

    //console.log("Sorry, you do not have enough tokens to spare.")

    //console.log('New turnover token values are:')
    //console.log('Current values are:')
    //console.log(tasks)
    //console.log(typeof tasks)
    //console.log(tokensFloat)
    //console.log(typeof tokensFloat)
    //console.log(tokensInt)
    //console.log(typeof tokensInt)

  }

  reportUseOFToken(status)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function reportUseOFToken(status){

  if (status) {
    report.innerHTML = "Token applied, have fun!"
  } else {
    report.innerHTML = "Sorry, you do not have enough tokens."
  }

  // Waits 3 sec:
  await sleep(3000);

  reportStatus();
}

function reportStatus() {
  let turoverArray = loadTurnover();

  let tasks = turoverArray[0]
  let tokensFloat = turoverArray[1]
  let tokensInt = turoverArray[2]

  let totalTasks = loadTotalTasks()

  report.innerHTML = "    You have " + tokensInt + " turnover tokens avaiable.\n    You have worked on " + totalTasks + " tasks.\n    Keep it up!"
}

function finishDay() {

  let flowCounter = 1

  let flowCounterJSON = {"flowCounter":flowCounter} ;
  flowCounterJSON = JSON.stringify(flowCounterJSON) ;
  fs.writeFileSync(flowCounterFile,flowCounterJSON) ;

  reportFinishedDay()

  //console.log("Killing setInterval() of ID:")
  //console.log(activeSetIntervalID)

  // Stops Counter
  clearInterval(activeSetIntervalID)

  timer.innerHTML = "00:00:00"

  fullDisable()
}

async function reportFinishedDay(){

  report.innerHTML = "Finishing day, good work champs."

  // Waits 3 sec:
  await sleep(3000);

  reportStatus();
}

// Reports at start:
reportStatus()

// Greeting sound:
audio1.play()

// Known Bugs
// Timer skips a few seconds when paused.
