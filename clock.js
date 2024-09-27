const TOTAL_MINUTES_IN_CLOCK = 60 * 12;
const E = 0.001;

const canvas = document.getElementById("game");
canvas.width = 400;
canvas.height = 600;
const ctx = canvas.getContext("2d");

let lastTs = 0;
let hourHandAngle = 0;
let minuteHandAngle = Math.PI / 2;
let targetHourHandAngle = 0;
let targetMinuteHandAngle = Math.PI / 2;
let inputCursor = 0;
let currentTime = getRandomTime();
const input = ["", "", "", ""];

function lerp(curr, target, t) {
    return (target - curr) * t + curr;

}

function getRandomTime() {
    const hours = Math.floor(Math.random() * 12);
    const minutes = Math.floor(Math.random() * 60);

    return { hours, minutes };
}

function getHandsAngles(hours, minutes) {
    const hourAngle = ((hours * 60) + minutes) / TOTAL_MINUTES_IN_CLOCK * Math.PI * 2 - Math.PI / 2;
    const minuteAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;

    return {
        hours: hourAngle,
        minutes: minuteAngle
    }
}

function drawClockFace() {
    ctx.beginPath();
    ctx.arc(200, 200, 190, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(200, 200, 10, 0, 2 * Math.PI);
    ctx.fill();

    for (let i = 0; i < 12; i++) {
        const angle = (2 * Math.PI / 12) * i;
        const x = Math.cos(angle) * 160 + 200;
        const y = Math.sin(angle) * 160 + 200;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    for (let i = 0; i < 60; i++) {
        const angle = (2 * Math.PI / 60) * i;
        const x = Math.cos(angle) * 160 + 200;
        const y = Math.sin(angle) * 160 + 200;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawHand(angle, length) {
    ctx.beginPath();
    ctx.moveTo(200, 200);
    const x = Math.cos(angle) * length + 200;
    const y = Math.sin(angle) * length + 200;
    ctx.lineTo(x, y);
    ctx.stroke();
}


function drawHourHand() {
    drawHand(hourHandAngle, 100);
}

function drawMinuteHand() {
    drawHand(minuteHandAngle, 150);
}

function drawInput() {
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    const inputText = input.map((ch, index) => {
        if (!ch || index >= inputCursor) {
            return '_';
        } else {
            return ch;
        }
    });
    ctx.fillText(`${inputText[0]}${inputText[1]}:${inputText[2]}${inputText[3]}`, 200, 460);
}

function drawButton() {
    if (inputCursor < 4) {
        ctx.fillStyle = 'grey';
    } else {
        ctx.fillStyle = inputMatchesCurrentTime() ? 'green' : 'red';
    }
    ctx.fillRect(20, 500, 360, 60);

    ctx.fillStyle = 'white';

    ctx.font = "32px sans-serif";
    ctx.fillText("Enter", 200, 540);
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
}

function draw() {
    ctx.clearRect(0, 0, 400, 800);
    drawClockFace();
    drawHourHand();
    drawMinuteHand();
    drawInput();
    drawButton();
}

function update(dt) {
    hourHandAngle = lerp(hourHandAngle, targetHourHandAngle, dt * 4);
    minuteHandAngle = lerp(minuteHandAngle, targetMinuteHandAngle, dt * 4);
}

function tick(ts) {
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    update(dt);

    draw();

    requestAnimationFrame(tick);
}

function setNextTime() {
    currentTime = getRandomTime();
    const { hours, minutes } = currentTime;
    const { hours: hoursAngle, minutes: minutesAngle } = getHandsAngles(hours, minutes);

    targetHourHandAngle = hoursAngle;
    targetMinuteHandAngle = minutesAngle;
    inputCursor = 0;
}

function inputMatchesCurrentTime() {
    if (inputCursor < 4) {
        return false;
    }
    const digits = input.map(ch => parseInt(ch, 10))
    if (digits.some(digit => isNaN(digit))) {
        return false;
    }
    const hours = digits[0] * 10 + digits[1];
    const minutes = digits[2] * 10 + digits[3];
    if (hours > 12 || minutes > 60) {
        return false;
    }
    const currentHours = currentTime.hours === 0 ? 12 : currentTime.hours;
    if (hours !== currentHours || minutes !== currentTime.minutes) {
        return false;
    }
    return true;
}

(() => {
    requestAnimationFrame(tick);
    setNextTime();

    document.addEventListener('keydown', (evt) => {
        if(evt.code === 'Backspace') {
            inputCursor = Math.max(0, inputCursor - 1);
        } else if (evt.key <= '9' && evt.key >= '0') {
            if (inputCursor < 4) {
                input[inputCursor++] = evt.key;
            }
        }
    })

    document.addEventListener('keyup', (evt) => {
        if (evt.code === 'Enter' && inputMatchesCurrentTime()) {
            setNextTime();
        }
    })
})()
