let player;
let pathway;
let oxygen;
let rpDec;
let coin;
let coinCount = 0;
let rockCount = 0;
let farmCompleted = false;
let farmUnlocked = false;
let chest;
let backg;
let rpQues;
let decB2;
let decBQ2;
let cdQues;
let farmImg;
let quesOne;
let gameOverText2;
let decline2Active = false;
let restart;
let backgroundMusic;
let missionHint;
let missionHintBg;

// Shield variables
let shieldActive = false;
let shieldQuestion;
let gameEnded = false;

// NASA variables
let nasaText;
let solarClass = "X3.9";
let solarDate = "2024-05-10";
let nasaStatus = "Historical NASA event";
let nasaSolarEvent = null;
let stormDifficulty = "NORMAL";
let oxygenInterval = 1000;
let nasaWarning;
let sepCount = "--";
let cmeCount = "--";

let cmeActive = false;
let cmePending = false;
let cmeCanChoose = false;
let cmeQuestion;

// =============================
// SETUP
// =============================

function preload() {
    backgroundMusic = loadSound(
        "https://codehs.com/uploads/f961ab6a31e06f83ab111e1bb277ae4b"
    );
    coinSoundEffect = loadSound(
        "https://codehs.com/uploads/20cb354029c688ff9357b7c268619b6f"
    );
    decisionSoundEffect = loadSound(
        "https://codehs.com/uploads/0066fab12f78cf344647d52d836c3f36"
    );
}

function setup() {
    new Canvas(450, 450);
    world.gravity.y = 0;

    setupPlayerSprites();
    oxygenBar();
    oxygenBarFunction();
    coins();
    createChest();
    backGround();
    decisionRP();
    rockSamples();
    farmButton();
    missionMessage();

    carbonDioxide();
    carbonDioxideBar();

    // NASA display
    createNASADisplay();
    getNASASpaceWeather();

    quesOne = new Sprite();
    quesOne.width = 250;
    quesOne.height = 20;
    quesOne.color = "purple";
    quesOne.y = 320;
    quesOne.x = 190;
    quesOne.layer = 0;
    quesOne.textSize = 15;
    quesOne.text = "Explore and Collect Rock Samples!";
    quesOne.collider = "none";
    quesOne.textColor = "white";

    player.x = 200;
    player.y = 200;

    gameOverText2 = new Sprite();
    gameOverText2.color = "black";
    gameOverText2.stroke = "black";
    gameOverText2.width = 230;
    gameOverText2.height = 40;
    gameOverText2.x = 130;
    gameOverText2.y = 420;
    gameOverText2.textColor = "white";
    gameOverText2.textSize = 12;
    gameOverText2.text = "W A S D or Arrow Keys to move player";

    rover = new Sprite();
    rover.rotationLock = true;
    rover.collider = "none";
    rover.layer = 99;
    rover.width = 1590;
    rover.height = 205;

    rover.scale = 0.15;
    rover.x = 50;
    rover.y = 232;

    roverImg = loadImg(
        "https://codehs.com/uploads/86e2ce9768386cbc531adbeaf9df893b"
    );

    rover.img = roverImg;
}

// =============================
// DRAW
// =============================

function draw() {
    clear();
    background("#4361ee");

    if (gameEnded) {
        if (restart && restart.mouse.presses()) {
            restartGame();
        }
        return;
    }

    if (kb.pressing("up")) {
        player.y -= 5;
    }

    if (kb.pressing("down")) {
        player.y += 5;
    }

    if (kb.pressing("left")) {
        player.x -= 5;
        player.mirror.x = true;
    }

    if (kb.pressing("right")) {
        player.x += 5;
        player.mirror.x = false;
    }

    startGameMusic();

    if (player.overlaps(chest)) {
        coinCount += 1;
        coinSoundEffect.play();
        coinText.text = coinCount;

        chest.x = Math.floor(Math.random() * 300) + 50;
        chest.y = Math.floor(Math.random() * 300) + 50;

        oxygenDis.width -= 10;

        if (oxygenDis.width <= 10) {
            gameOver();
            return;
        }

        checkMissionComplete();
    }

    if (player.overlaps(rpQues) || player.overlaps(rpDec)) {
        decisionSoundEffect.play();
        oxygenDis.width -= 50;
        rockCount += 10;
        rock.text = rockCount;

        rpQues.remove();
        rpDec.remove();
        quesOne.remove();

        unlockFarm();
        showMissionHint("Start farming");
        checkMissionComplete();
    }

    if (farmUnlocked && (player.overlaps(farm) || player.overlaps(farmText))) {
        decisionSoundEffect.play();
        farmImg = new Sprite();

        ImgFarm = loadImg(
            "https://codehs.com/uploads/4fc2114b672ef262b40ca020b548eb65"
        );

        farmImg.img = ImgFarm;
        farmImg.scale = 0.7;
        farmImg.x = 335;
        farmImg.y = 265;
        farmImg.layer = 0;

        farm.remove();
        farmText.remove();

        hideMissionHint();

        if (cmePending && !cmeActive) {
            createCMEWarning();
        } else {
            showCarbonChoice();
        }
    }

    if (
        decline2Active &&
        !cmeActive &&
        (player.overlaps(decB2) || player.overlaps(decBQ2))
    ) {
        decisionSoundEffect.play();
        coinCount -= 5;
        coinText.text = coinCount;

        ImgFarm = loadImg(
            "https://codehs.com/uploads/87b2ca992faa3a6e942355f44d960788"
        );

        farmImg.img = ImgFarm;

        cdQues.remove();
        cdDec.remove();
        decB2.remove();
        decBQ2.remove();
        quesTwo.remove();

        gameOverFood();
        return;
    }

    if (
        decline2Active &&
        !cmeActive &&
        (player.overlaps(cdQues) || player.overlaps(cdDec))
    ) {
        decisionSoundEffect.play();
        carbonDis.width -= 50;

        cdQues.remove();
        cdDec.remove();
        decB2.remove();
        decBQ2.remove();
        quesTwo.remove();

        decline2Active = false;

        farmCompleted = true;
        showMissionHint("Collect 5 coins!");
        checkMissionComplete();
    }

    // =============================
    // SOLAR FLARE SHIELD DECISION
    // =============================

    if (shieldActive && (player.overlaps(dsQues) || player.overlaps(dsDec))) {
        decisionSoundEffect.play();

        dsQues.remove();
        dsDec.remove();
        decB3.remove();
        decBQ3.remove();
        shieldQuestion.remove();

        shieldActive = false;

        unlockFarm();

        nasaStatus = "Shield activated!";
        updateNASADisplay();
    }

    if (shieldActive && (player.overlaps(decB3) || player.overlaps(decBQ3))) {
        decisionSoundEffect.play();
        shieldActive = false;
        gameOverFlare();
        return;
    }

    // =============================
    // CME WARNING AND DECISION
    // =============================

    if (cmeActive) {
        // Player must move away before choosing
        if (!cmeCanChoose) {
            if (!player.overlaps(dcDec) && !player.overlaps(decB4)) {
                cmeCanChoose = true;
            }
        }

        // Protect the farm
        if (
            cmeCanChoose &&
            (player.overlaps(dcQues) || player.overlaps(dcDec))
        ) {
            decisionSoundEffect.play();

            dcQues.remove();
            dcDec.remove();
            decB4.remove();
            decBQ4.remove();
            cmeQuestion.remove();

            cmeActive = false;

            console.log("Farm protection activated!");

            showCarbonChoice();
        }

        // Decline protection
        else if (
            cmeCanChoose &&
            (player.overlaps(decB4) || player.overlaps(decBQ4))
        ) {
            decisionSoundEffect.play();

            cmeActive = false;

            gameOverCME();
            return;
        }
    }
}

// =============================
// PLAYER
// =============================

function setupPlayerSprites() {
    player = new Sprite();

    player.rotationLock = true;
    player.collider = "none";
    player.bounciness = 0;
    player.layer = 10;
    player.debug = false;
    player.width = 15;
    player.height = 5;

    player.scale = 0.5;

    playerImg = loadImg(
        "https://codehs.com/uploads/43335b3d1173364e141ea08176f00e9c"
    );

    player.img = playerImg;
}

// =============================
// OXYGEN BAR
// =============================

function oxygenBar() {
    oxygen = new Sprite();
    oxygen.rotationLock = true;
    oxygen.collider = "none";
    oxygen.layer = 11;
    oxygen.width = 100;
    oxygen.height = 15;

    oxygen.scale = 0.1;
    oxygen.x = 120;
    oxygen.y = 20;

    oxygenImg = loadImg(
        "https://codehs.com/uploads/fef9692b39d7933ddac75bed24679d07"
    );

    oxygen.img = oxygenImg;
}
// ==================================
// OXYGEN BAR
// ==================================
function oxygenBarFunction() {
    oxygenDis = new Sprite();
    oxygenDis.rotationLock = true;
    oxygenDis.collider = "none";
    oxygenDis.layer = 23;
    oxygenDis.width = 1590;
    oxygenDis.height = 205;
    oxygenDis.color = "cyan";
    oxygenDis.scale = 0.1;
    oxygenDis.x = 135;
    oxygenDis.y = 22;
}

// =============================
// CARBON DIOXIDE BAR
// =============================

function carbonDioxide() {
    carbonDis = new Sprite();
    carbonDis.rotationLock = true;
    carbonDis.collider = "none";
    carbonDis.layer = 23;
    carbonDis.width = 1590;
    carbonDis.height = 205;
    carbonDis.color = "cyan";
    carbonDis.scale = 0.1;
    carbonDis.x = 135;
    carbonDis.y = 62;
}
// ==================================
// CARBON DIOXIDE BAR/IMG
// ==================================
function carbonDioxideBar() {
    carbon = new Sprite();
    carbon.rotationLock = true;
    carbon.collider = "none";
    carbon.layer = 11;
    carbon.width = 100;
    carbon.height = 15;

    carbon.scale = 0.25;
    carbon.x = 120;
    carbon.y = 60;

    carbonImg = loadImg(
        "https://codehs.com/uploads/6d94d9a6e618395187b397be8e1afd49"
    );

    carbon.img = carbonImg;
}

// =============================
// CHEST
// =============================

function createChest() {
    chest = new Sprite();
    chest.rotationLock = true;
    chest.collider = "none";
    chest.layer = 9;
    chest.width = 1590;
    chest.height = 205;

    chest.scale = 0.1;
    chest.x = 135;
    chest.y = 122;

    chestImg = loadImg(
        "https://codehs.com/uploads/67d59069c6585bafe235f25afaee8dd6"
    );

    chest.img = chestImg;
}

// =============================
// COINS
// =============================

function coins() {
    coinText = new Sprite();
    coinText.rotationLock = true;
    coinText.color = "yellow";
    coinText.stroke = "skyblue";
    coinText.width = 48;
    coinText.height = 25;
    coinText.y = 22;
    coinText.x = 415;
    coinText.textSize = 15;
    coinText.text = "0";
    coinText.collider = "none";

    coinTxt = new Sprite();

    coinTxt.width = 0;
    coinTxt.height = 0;
    coinTxt.y = 22;
    coinTxt.x = 360;
    coinTxt.textSize = 15;
    coinTxt.text = "Coins: ";
    coinTxt.collider = "none";
    coinTxt.textColor = "white";
}

// =============================
// ROCK SAMPLES
// =============================

function rockSamples() {
    rock = new Sprite();
    rock.rotationLock = true;
    rock.color = "green";
    rock.stroke = "skyblue";
    rock.width = 48;
    rock.height = 25;
    rock.y = 50;
    rock.x = 415;
    rock.textSize = 15;
    rock.text = "";
    rock.collider = "none";
    rock.textColor = "white";

    rockText = new Sprite();

    rockText.width = 0;
    rockText.height = 0;
    rockText.y = 50;
    rockText.x = 330;
    rockText.textSize = 15;
    rockText.text = "Rock samples: ";
    rockText.collider = "none";
    rockText.textColor = "white";
}

// =============================
// EXPLORE DECISION
// =============================

function decisionRP() {
    rpDec = new Sprite();
    rpDec.rotationLock = true;
    rpDec.collider = "none";
    rpDec.layer = 0;
    rpDec.width = 790;
    rpDec.height = 405;
    rpDec.color = "cyan";
    rpDec.scale = 0.1;
    rpDec.x = 135;
    rpDec.y = 360;

    rpQues = new Sprite();

    rpQues.width = 0;
    rpQues.height = 0;
    rpQues.x = 135;
    rpQues.y = 360;
    rpQues.textSize = 15;
    rpQues.layer = 0;
    rpQues.text = "Explore!";
    rpQues.collider = "none";
    rpQues.textColor = "black";
}

// =============================
// CARBON DECISION
// =============================

function decisionCarbon() {
    cdDec = new Sprite();
    cdDec.rotationLock = true;
    cdDec.collider = "none";
    cdDec.layer = 0;
    cdDec.width = 790;
    cdDec.height = 405;
    cdDec.color = "cyan";
    cdDec.scale = 0.1;
    cdDec.x = 135;
    cdDec.y = 360;

    cdQues = new Sprite();

    cdQues.width = 0;
    cdQues.height = 0;
    cdQues.x = 135;
    cdQues.y = 360;
    cdQues.textSize = 15;
    cdQues.layer = 0;
    cdQues.text = "Give C02";
    cdQues.collider = "none";
    cdQues.textColor = "black";
}

// =============================
// SHIELD DECISION
// =============================

function decisionShield() {
    dsDec = new Sprite();
    dsDec.rotationLock = true;
    dsDec.collider = "none";
    dsDec.layer = 0;
    dsDec.width = 990;
    dsDec.height = 405;
    dsDec.color = "cyan";
    dsDec.scale = 0.1;
    dsDec.x = 135;
    dsDec.y = 360;

    dsQues = new Sprite();

    dsQues.width = 0;
    dsQues.height = 0;
    dsQues.x = 135;
    dsQues.y = 360;
    dsQues.textSize = 10;
    dsQues.layer = 0;
    dsQues.text = "Shield!";
    dsQues.collider = "none";
    dsQues.textColor = "black";
}

// =============================
// CME DECISION
// =============================

function decisionCME() {
    dcDec = new Sprite();
    dcDec.rotationLock = true;
    dcDec.collider = "none";
    dcDec.layer = 0;
    dcDec.width = 990;
    dcDec.height = 405;
    dcDec.color = "cyan";
    dcDec.scale = 0.1;
    dcDec.x = 135;
    dcDec.y = 360;

    dcQues = new Sprite();

    dcQues.width = 0;
    dcQues.height = 0;
    dcQues.x = 135;
    dcQues.y = 360;
    dcQues.textSize = 10;
    dcQues.layer = 0;
    dcQues.text = "Protect Farm!";
    dcQues.collider = "none";
    dcQues.textColor = "black";
}

// =============================
// SECOND DECLINE BUTTON
// =============================

function declineButton2() {
    decB2 = new Sprite();
    decB2.rotationLock = true;
    decB2.collider = "none";
    decB2.layer = 0;
    decB2.width = 790;
    decB2.height = 405;
    decB2.color = "cyan";
    decB2.scale = 0.1;
    decB2.x = 235;
    decB2.y = 360;

    decBQ2 = new Sprite();

    decBQ2.width = 0;
    decBQ2.height = 0;
    decBQ2.x = 235;
    decBQ2.y = 360;
    decBQ2.textSize = 15;
    decBQ2.layer = 0;
    decBQ2.text = "Decline";
    decBQ2.collider = "none";
    decBQ2.textColor = "black";
}

// =============================
// THIRD DECLINE BUTTON
// =============================

function declineButton3() {
    decB3 = new Sprite();
    decB3.rotationLock = true;
    decB3.collider = "none";
    decB3.layer = 0;
    decB3.width = 790;
    decB3.height = 405;
    decB3.color = "cyan";
    decB3.scale = 0.1;
    decB3.x = 235;
    decB3.y = 360;

    decBQ3 = new Sprite();

    decBQ3.width = 0;
    decBQ3.height = 0;
    decBQ3.x = 235;
    decBQ3.y = 360;
    decBQ3.textSize = 15;
    decBQ3.layer = 0;
    decBQ3.text = "Decline";
    decBQ3.collider = "none";
    decBQ3.textColor = "black";
}

// =============================
// FOURTH DECLINE BUTTON
// =============================

function declineButton4() {
    decB4 = new Sprite();
    decB4.rotationLock = true;
    decB4.collider = "none";
    decB4.layer = 0;
    decB4.width = 790;
    decB4.height = 405;
    decB4.color = "cyan";
    decB4.scale = 0.1;
    decB4.x = 235;
    decB4.y = 360;

    decBQ4 = new Sprite();

    decBQ4.width = 0;
    decBQ4.height = 0;
    decBQ4.x = 235;
    decBQ4.y = 360;
    decBQ4.textSize = 15;
    decBQ4.layer = 0;
    decBQ4.text = "Decline";
    decBQ4.collider = "none";
    decBQ4.textColor = "black";
}

// =============================
// GAME OVER: LACK OF OXYGEN
// =============================

function gameOver() {
    if (gameEnded) {
        return;
    }
    gameEnded = true;

    allSprites.remove();
    camera.x = 250;
    camera.y = 200;
    gameStart = true;

    gameOverText = new Sprite();
    gameOverText.color = "black";
    gameOverText.stroke = "black";
    gameOverText.width = 400;
    gameOverText.height = 400;
    gameOverText.x = camera.x;
    gameOverText.y = camera.y;
    gameOverText.textColor = "white";
    gameOverText.textSize = 20;
    gameOverText.text = "Game Over, died to lack of oxygen!";

    restartButton();
}

// =============================
// GAME OVER: LACK OF FOOD
// =============================

function gameOverFood() {
    if (gameEnded) {
        return;
    }
    gameEnded = true;

    allSprites.remove();
    camera.x = 250;
    camera.y = 200;
    gameStart = true;

    gameOverText2 = new Sprite();
    gameOverText2.color = "black";
    gameOverText2.stroke = "black";
    gameOverText2.width = 400;
    gameOverText2.height = 400;
    gameOverText2.x = camera.x;
    gameOverText2.y = camera.y;
    gameOverText2.textColor = "white";
    gameOverText2.textSize = 20;
    gameOverText2.text = "Game Over, died to lack of food!";
    restartButton();
}

// =============================
// GAME OVER: NO RADIATION SHIELD
// =============================

function gameOverFlare() {
    if (gameEnded) {
        return;
    }
    gameEnded = true;

    allSprites.remove();
    camera.x = 250;
    camera.y = 200;
    gameStart = true;

    gameOverText3 = new Sprite();
    gameOverText3.color = "black";
    gameOverText3.stroke = "black";
    gameOverText3.width = 400;
    gameOverText3.height = 400;
    gameOverText3.x = camera.x;
    gameOverText3.y = camera.y;
    gameOverText3.textColor = "white";
    gameOverText3.textSize = 20;
    gameOverText3.text = "Game Over, no radiation shield!";
    restartButton();
}

// =============================
// BACKGROUND
// =============================

function backGround() {
    backg = new Sprite();
    backg.rotationLock = true;
    backg.collider = "none";
    backg.layer = 0;
    backg.width = 1590;
    backg.height = 205;

    backg.scale = 1.5;
    backg.x = 135;
    backg.y = 122;

    backgImg = loadImg(
        "https://codehs.com/uploads/13ba1355a92a6ca0b0f0d8761486bb62"
    );

    backg.img = backgImg;
}

// =============================
// FARM
// =============================

function farmButton() {
    farm = new Sprite();
    farm.rotationLock = true;
    farm.collider = "none";
    farm.layer = 0;
    farm.width = 790;
    farm.height = 405;
    farm.color = "#5DC441";
    farm.scale = 0.1;
    farm.x = 415;
    farm.y = 260;

    farmText = new Sprite();
    farmText.width = 0;
    farmText.height = 0;
    farmText.x = 415;
    farmText.y = 260;
    farmText.textSize = 15;
    farmText.layer = 0;
    farmText.text = "Farm";
    farmText.collider = "none";
    farmText.textColor = "black";

    farm.visible = farmUnlocked;
    farmText.visible = farmUnlocked;
}

function unlockFarm() {
    if (farmUnlocked) {
        return;
    }

    farmUnlocked = true;
    farm.visible = true;
    farmText.visible = true;
}

// ==================================
// NASA DISPLAY
// ==================================

function createNASADisplay() {
    nasaText = new Sprite();

    nasaText.rotationLock = true;
    nasaText.collider = "none";
    nasaText.layer = 30;

    nasaText.width = 220;
    nasaText.height = 70;

    nasaText.x = 365;
    nasaText.y = 415;

    nasaText.color = "#14213d";
    nasaText.stroke = "#38bdf8";

    nasaText.textColor = "white";
    nasaText.textSize = 10;

    updateNASADisplay();
}

// ==================================
// UPDATE NASA DISPLAY
// ==================================

function updateNASADisplay() {
    if (!nasaText || nasaText.removed) {
        return;
    }

    nasaText.text =
        "NASA SPACE WEATHER DATA\n" +
        "FLR/SEP/CME: " +
        solarClass +
        "/" +
        sepCount +
        "/" +
        cmeCount +
        "\n" +
        "Date: " +
        solarDate;
}

// ==================================
// NASA SPACE WEATHER API
// ==================================

async function getNASASpaceWeather() {
    nasaStatus = "Connecting to NASA...";
    updateNASADisplay();

    let url =
        "DEMO_KEY" +
        "?startDate=" +
        getDateDaysAgo(59) +
        "&endDate=" +
        getDateDaysAgo(0);

    console.log("NASA URL:", url);

    try {
        let response = await fetch(url);

        console.log("NASA HTTP Status:", response.status);

        if (!response.ok) {
            let errorText = await response.text();
            console.log("NASA response:", errorText);

            throw new Error("HTTP " + response.status);
        }

        let events = await response.json();

        console.log("NASA events found:", events.length);

        if (!Array.isArray(events) || events.length === 0) {
            nasaStatus = "No recent solar flares";
            updateNASADisplay();
            return;
        }

        let randomIndex = Math.floor(Math.random() * events.length);

        let selected = events[randomIndex];

        nasaSolarEvent = selected;

        solarClass = selected.classType || "Unknown";
        solarDate = selected.beginTime.substring(0, 10);

        sepCount = "--";
        cmeCount = "--";
        updateNASADisplay();
        getNASAExtraWeather(selected.beginTime);

        nasaStatus = "NASA DATA LOADED!";

        setStormDifficulty();
        updateNASADisplay();

        // =============================
        // SOLAR FLARE WARNING
        // =============================

        /* flareStrength(solarClass) > flareStrength("M2.0")

        set above to true to give solar warning every time.
        */
        if (flareStrength(solarClass) > flareStrength("M2.0")) {
            console.log("WARNING! Solar flare detected!");

            nasaStatus = "WARNING! SOLAR FLARE DETECTED!";

            createNASAWarning();

            updateNASADisplay();

            // Separate solar flare question
            shieldQuestion = new Sprite();

            shieldQuestion.width = 320;
            shieldQuestion.height = 20;
            shieldQuestion.color = "purple";

            shieldQuestion.y = 320;
            shieldQuestion.x = 190;

            shieldQuestion.layer = 0;
            shieldQuestion.textSize = 12;

            shieldQuestion.text = "Solar flare! Activate your shield?";

            shieldQuestion.collider = "none";
            shieldQuestion.textColor = "white";

            // Create two decision buttons
            decisionShield();
            declineButton3();

            // Enable shield decision
            shieldActive = true;
        }

        console.log("Selected event:", selected);
    } catch (error) {
        console.log("NASA ERROR:", error.message);
        console.log(error.stack);

        nasaStatus = "NASA ERROR: " + error.message;

        updateNASADisplay();
    }
}

// ==================================
// GET DATE
// ==================================

function getDateDaysAgo(days) {
    let date = new Date();

    date.setUTCDate(date.getUTCDate() - days);

    return date.toISOString().substring(0, 10);
}

// ==================================
// COMPARE SOLAR FLARE STRENGTH
// ==================================

function flareStrength(classType) {
    if (!classType) return 0;

    let letter = classType.charAt(0);
    let number = parseFloat(classType.substring(1));

    if (isNaN(number)) return 0;

    let multiplier = 1;

    if (letter == "A") multiplier = 1;
    else if (letter == "B") multiplier = 10;
    else if (letter == "C") multiplier = 100;
    else if (letter == "M") multiplier = 1000;
    else if (letter == "X") multiplier = 10000;
    else return 0;

    return multiplier * number;
}

// ==================================
// SET STORM DIFFICULTY
// ==================================

function setStormDifficulty() {
    if (solarClass.startsWith("X")) {
        stormDifficulty = "HARD";
        oxygenInterval = 600;
    } else if (solarClass.startsWith("M")) {
        stormDifficulty = "MEDIUM";
        oxygenInterval = 850;
    } else {
        stormDifficulty = "EASY";
        oxygenInterval = 1200;
    }
}

// ==================================
// RESTART BUTTON
// ==================================

function restartButton() {
    restart = new Sprite();
    restart.width = 120;
    restart.height = 45;
    restart.x = 250;
    restart.y = 300;
    restart.color = "green";
    restart.textSize = 18;
    restart.layer = 999;
    restart.text = "Restart";
    restart.collider = "static";
    restart.textColor = "white";
}

// ==================================
// RESTART GAME
// ==================================

function restartGame() {
    cmeActive = false;
    cmePending = false;
    cmeCanChoose = false;
    allSprites.remove();

    gameEnded = false;
    decline2Active = false;
    shieldActive = false;

    coinCount = 0;
    rockCount = 0;
    farmCompleted = false;
    farmUnlocked = false;

    camera.x = 225;
    camera.y = 225;

    setupPlayerSprites();
    oxygenBar();
    oxygenBarFunction();
    coins();
    createChest();
    backGround();
    decisionRP();
    rockSamples();
    farmButton();
    missionMessage();

    carbonDioxide();
    carbonDioxideBar();

    createNASADisplay();

    quesOne = new Sprite();
    quesOne.width = 250;
    quesOne.height = 20;
    quesOne.color = "purple";
    quesOne.y = 320;
    quesOne.x = 190;
    quesOne.layer = 0;
    quesOne.textSize = 15;
    quesOne.text = "Explore and Collect Rock Samples!";
    quesOne.collider = "none";
    quesOne.textColor = "white";

    player.x = 200;
    player.y = 200;

    getNASASpaceWeather();

    gameOverText2 = new Sprite();
    gameOverText2.color = "black";
    gameOverText2.stroke = "black";
    gameOverText2.width = 230;
    gameOverText2.height = 40;
    gameOverText2.x = 130;
    gameOverText2.y = 420;
    gameOverText2.textColor = "white";
    gameOverText2.textSize = 12;
    gameOverText2.text = "W A S D or Arrow Keys to move player";
}

// ==================================
// MISSION COMPLETE
// ==================================

function missionComplete() {
    if (gameEnded) {
        return;
    }

    gameEnded = true;

    hideMissionHint();
    missionHint.remove();
    missionHintBg.remove();

    missionComp = new Sprite();

    missionComp.color = "black";
    missionComp.stroke = "black";
    missionComp.width = 900;
    missionComp.height = 900;
    missionComp.x = camera.x;
    missionComp.y = 120;
    missionComp.textColor = "white";
    missionComp.textSize = 15;
    missionComp.collider = "none";
    missionComp.text = "Great Job! You have successfully completed the game!";

    credits = new Sprite();
    credits.textColor = "white";
    credits.width = 0;
    credits.height = 0;
    credits.collider = "none";
    credits.textSize = 15;
    credits.text = "- Developed by Siddhant Aher, thanks for playing!";
    credits.y = 190;

    afterMath = new Sprite();
    afterMath.textColor = "white";
    afterMath.width = 0;
    afterMath.height = 0;
    afterMath.collider = "none";
    afterMath.textSize = 15;
    afterMath.text = " -- Returning to Earth! --";
    afterMath.y = 280;

    earth = new Sprite();
    earth.rotationLock = true;
    earth.collider = "none";
    earth.layer = 9999;
    earth.width = 1590;
    earth.height = 205;

    earth.scale = 0.8;
    earth.x = 345;
    earth.y = 392;

    earthImg = loadImg(
        "https://codehs.com/uploads/b04408e3a4b6c7cc0f48853f4fd46ac1"
    );

    earth.img = earthImg;

    restartButton();
    restart.y = 360;
    restart.x = camera.x;
}

// ==================================
// NASA WARNING TEXT
// ==================================

function createNASAWarning() {
    nasaWarning = new Sprite();

    nasaWarning.rotationLock = true;
    nasaWarning.collider = "none";
    nasaWarning.layer = 31;

    nasaWarning.width = 0;
    nasaWarning.height = 0;

    nasaWarning.x = 365;
    nasaWarning.y = 440;

    nasaWarning.textColor = "red";
    nasaWarning.textSize = 10;

    nasaWarning.text = "WARNING! SOLAR FLARE!";
}

// ==================================
// BACKGROUND GAME MUSIC
// ==================================

function startGameMusic() {
    if (backgroundMusic && backgroundMusic.isLoaded()) {
        if (!backgroundMusic.isPlaying()) {
            backgroundMusic.setVolume(0.3);
            backgroundMusic.loop();
        }
    }
}

// ==================================
// GET CME AND SEP
// ==================================

async function getNASAExtraWeather(flareDate) {
    let start = new Date(flareDate);
    let end = new Date(flareDate);

    start.setUTCDate(start.getUTCDate() - 25);
    end.setUTCDate(end.getUTCDate() + 25);

    let startDate = start.toISOString().substring(0, 10);
    let endDate = end.toISOString().substring(0, 10);

    let sepURL =
        "DEMO_KEY" +
        "?startDate=" +
        startDate +
        "&endDate=" +
        endDate;

    let cmeURL =
        "DEMO_KEY" +
        "?startDate=" +
        startDate +
        "&endDate=" +
        endDate;

    let newSEP = "N/A";
    let newCME = "N/A";

    // Get SEP data
    try {
        let response = await fetch(sepURL);

        if (response.ok) {
            let sepEvents = await response.json();

            newSEP = sepEvents.length;

            console.log("SEP events found: " + newSEP);
        } else {
            console.log("Could not get SEP data");
        }
    } catch (error) {
        console.log("SEP error: " + error.message);
    }

    // Get CME data
    try {
        let response = await fetch(cmeURL);

        if (response.ok) {
            let cmeEvents = await response.json();

            newCME = cmeEvents.length;

            console.log("CME events found: " + newCME);
        } else {
            console.log("Could not get CME data");
        }
    } catch (error) {
        console.log("CME error: " + error.message);
    }

    if (solarDate == flareDate.substring(0, 10)) {
        sepCount = newSEP;
        cmeCount = newCME;

        updateNASADisplay();

        if (typeof cmeCount == "number" && cmeCount > 150) {
            console.log("WARNING! High CME activity detected!");

            cmePending = true;
        }
    }
}

// ==================================
// GET CME WARNING
// ==================================

function createCMEWarning() {
    cmeQuestion = new Sprite();

    cmeQuestion.width = 320;
    cmeQuestion.height = 20;
    cmeQuestion.color = "red";

    cmeQuestion.y = 320;
    cmeQuestion.x = 190;

    cmeQuestion.layer = 0;
    cmeQuestion.textSize = 12;

    cmeQuestion.text = "High CME activity! Protect the farm?";

    cmeQuestion.collider = "none";
    cmeQuestion.textColor = "white";

    decisionCME();
    declineButton4();

    cmeActive = true;
    cmePending = false;
    cmeCanChoose = false;
}

// ==================================
// CME GAME OVER FUNCTION
// ==================================

function gameOverCME() {
    if (gameEnded) {
        return;
    }

    gameEnded = true;

    allSprites.remove();

    camera.x = 250;
    camera.y = 200;

    gameOverText4 = new Sprite();

    gameOverText4.color = "black";
    gameOverText4.stroke = "black";
    gameOverText4.width = 400;
    gameOverText4.height = 400;

    gameOverText4.x = camera.x;
    gameOverText4.y = camera.y;

    gameOverText4.textColor = "white";
    gameOverText4.textSize = 20;

    gameOverText4.text = "Game Over! CME damaged the farm!";

    restartButton();
}
// ==================================
// CO2 DECISION 
// ==================================
function showCarbonChoice() {
    decisionCarbon();

    quesTwo = new Sprite();
    quesTwo.width = 240;
    quesTwo.height = 20;
    quesTwo.color = "purple";
    quesTwo.y = 320;
    quesTwo.x = 190;
    quesTwo.layer = 0;
    quesTwo.textSize = 15;
    quesTwo.text = "Do you want to give CO2 to farm?";
    quesTwo.collider = "none";
    quesTwo.textColor = "white";

    declineButton2();
    decline2Active = true;
}

// =============================
// MISSION MESSAGE
// =============================

function missionMessage() {
    missionHintBg = new Sprite();
    missionHintBg.width = 220;
    missionHintBg.height = 34;
    missionHintBg.x = 225;
    missionHintBg.y = 342;
    missionHintBg.color = "black";
    missionHintBg.collider = "none";
    missionHintBg.layer = 29;
    missionHintBg.visible = false;

    missionHint = new Sprite();
    missionHint.width = 0;
    missionHint.height = 0;
    missionHint.x = 225;
    missionHint.y = 342;
    missionHint.textSize = 14;
    missionHint.textColor = "white";
    missionHint.collider = "none";
    missionHint.layer = 30;
    missionHint.text = "";
    missionHint.visible = false;
}
// ==================================
// TASKS/MESSAGE HINTS FOR PLAYER
// ==================================
function showMissionHint(message) {
    missionHint.text = message;
    missionHint.visible = true;
    missionHintBg.visible = true;
}
// ==================================
// HIDE THE MISION HINTS AS THE TASKS ARE DONE
// ==================================
function hideMissionHint() {
    missionHint.text = "";
    missionHint.visible = false;
    missionHintBg.visible = false;
}

// =============================
// MISSION OBJECTIVES
// =============================

function checkMissionComplete() {
    if (gameEnded) {
        return;
    }

    console.log("Rock samples: " + rockCount);
    console.log("Coins: " + coinCount);
    console.log("Farm completed: " + farmCompleted);

    if (rockCount >= 10 && coinCount >= 5 && farmCompleted) {
        missionComplete();
    }
}
