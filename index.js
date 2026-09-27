const mineflayer = require('mineflayer');
const fs = require('fs');
const { keep_alive } = require("./keep_alive");

// Render'ın kapanmaması için Express web sunucusunu başlatıyoruz
keep_alive();

let rawdata = fs.readFileSync('config.json');
let data = JSON.parse(rawdata);

var lasttime = -1;
var moving = 0;
var connected = 0;
var actions = ['forward', 'back', 'left', 'right'];
var lastaction;
var pi = 3.14159;
var moveinterval = 2; // 2 saniye hareket aralığı
var maxrandom = 5; // Rastgele eklenen süre (0-5 sn)

var host = data["ip"] || "FeslegenPlusSMP.aternos.me";
var port = data["port"] || 55024;
var username = data["name"] || "AternosGuard";

var bot = mineflayer.createBot({
  host: host,
  port: port,
  username: username,
  version: false // Sürümü otomatik tespit eder
});

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

bot.on('login', function () {
  console.log("Sunucuya giriş yapıldı:", username);
});

bot.on('spawn', function () {
  console.log("Bot oyunda doğdu!");
  connected = 1;
});

bot.on('time', function () {
  if (connected < 1) {
    return;
  }
  if (lasttime < 0) {
    lasttime = bot.time.age;
  } else {
    var randomadd = Math.random() * maxrandom * 20;
    var interval = moveinterval * 20 + randomadd;
    if (bot.time.age - lasttime > interval) {
      if (moving == 1) {
        bot.setControlState(lastaction, false);
        moving = 0;
        lasttime = bot.time.age;
      } else {
        var yaw = Math.random() * pi - (0.5 * pi);
        var pitch = Math.random() * pi - (0.5 * pi);
        bot.look(yaw, pitch, false);
        lastaction = actions[Math.floor(Math.random() * actions.length)];
        bot.setControlState(lastaction, true);
        moving = 1;
        lasttime = bot.time.age;
        bot.activateItem();
      }
    }
  }
});

// Çökmeleri engellemek için hata yakalayıcılar
bot.on('error', function (err) {
  console.log('Bot Hatası:', err);
});

bot.on('end', function (reason) {
  console.log('Bağlantı koptu:', reason);
  connected = 0;
});
