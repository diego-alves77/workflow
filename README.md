# Work Flow

**Notice:** Due to large file binaries (150MB),  a  ready to use distribuition of this project is currently being hosted in
[GDrive Personal Cloud (.zip) (~150MB)](https://drive.google.com/drive/folders/1F0Ck-ceZIiXEoI9E5-4tHuZCM4Uyw2P6?usp=sharing)
I'm afraid GitHub's LFS is too daunting for me at my learning level.

###  TL-DR;

Work flow is a simple Electron project to control the flow of work, when to work and when to take a break.

To use it simply press Start and do your work. A countdown will decrease, and it will play a bleep when it is done.
You can pause it too. When your going to bed, press End Day.

In order to tailor to your routine, you will need to hack it (Skip to HACKING WORK FLOW section).

This project is released in MIT License.

###  LONG

Breaks are necessary to avoid long term complications such as Repetitive Strain Injuries (RSI), but it is
often easy to forget it or to dismiss it.

Electron is a framework that allows creating desktop apps with Web skills, knowledge of HTML, CSS, JavaScript, and so forth. It is really neat, but the distributions tend to be large, even for simple programs. This app is built on electron and electron-forge.

### INSTALLING WORK FLOW:


  FOR WINDOWS x64

The (.zip) in GDrive contains all files necessary to run workflow.
Simply download the folder (.zip) to a desired location, extract it and run workflow.exe.
You should see the program screen after a few moments.
Alteratively you can clone this repository.

USING THE CODE HOSTED HERE IN GITHUB

1. Install Node 6 (with npm), Git and electron-forge.
2. Create an electron-forge boilerplate
3. Use npm to install moments.js
4. Copy the files from GitHub repo into your project
5. You should be set to go.

You can customize Work Flow as you wish as per the MIT License. All that needs to be done is retain a copy of the license in final code.

HACKING WORK FLOW

Work Flow does not know your daily routine, you will need teach it.
There is a JSON file the folder you download from this repository:

    ./src/flow.json

It is like this:

    {
	    "flowCycles": 18,
	    "flow":{
			"1":["Warm-up",5],
			"2":["Work 1",50],
			"3":["Rest",20],
			...			
			"17":["Tai-Chi",15],
			"18":["END DAY",0.001],
		}
    }

I recommend editing this in [JSONlint](https://jsonlint.com/).

Replace the strings with the names of the tasks you do, in order, and the time in minutes you wish to spend in those activities. Include rests just as any other activity. A rule of thumb is to include a 10-20min break every hour or so.

The first parameter, "flowCycles" is always equal to the index of last task.  It is 18 in this case, as there are 18 tasks. It tells Work Flow when to loop over again. Placing a number greater than that will crash the program when it finishes the loop.


DETAILED USAGE:

The GUI contains 5 buttons:

####  Start!
Picks up the next task and starts a countdown timer for it. When the countdown reaches zero, you can start the next task.

####  Pause
Freezes the countdown. You can resume by pressing start again. Good for away from keyboard times.

#### End Day.
At any time you can end the day. That means you won't work anymore, and next day it will start the routine all over again.

#### Use Turnover Token!
This is for when you feel like working all night long. Turnover nights can be very productive, but are damaging to your health, so beware. This is a control scheme to minimize them. You earn a turnover token every **85 tasks** completed (including rests). Then you can use your turnover token to stay awake all night if you want, free from guilt.
The idea is that this will render them less often, more predictable, and hence less damaging. You can policy yourself "If I don't have a turnover token, I should not stay up." Save some tokens for when you really need them, say a deadline.

#### Submit
If you would like to make a short description of any pain or disconfort in work, write in the field and press the submit button. You can review the logs later.
[don't press ENTER in input, there is a current bug in the program that resets the application]

At the time of this work, I was experimenting with typing with my toes to rest the hands for a while and write documentations.  I included a selector for such. If you choose to use it, it will log the current mode of input.

#### LOGS
Work flow keeps a simple daily log in the ./logs/ and ./healthlogs/ folders registering the tasks completed and the number of breaks you took.

**It's needed to say**
Work flow does not connect to the internet, nor send any log away. We respect your privacy.


[Blog Coverage](https://randomthoughts162.wordpress.com/2020/06/13/work-flow/)
