require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require("@whiskeysockets/baileys");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const { evaluate } = require("mathjs");
const sharp = require("sharp");
const fs = require("fs");

const BOT_NAME = process.env.BOT_NAME || "Bangcats Bot";
const PREFIX = process.env.PREFIX || "!";
const AUTO_GREETING = String(process.env.AUTO_GREETING || "true").toLowerCase() === "true";

const PROVINCES = {
  "aceh": { capital:"Banda Aceh", lat:5.5483, lon:95.3238, tz:"Asia/Jakarta", zone:"WIB" },
  "sumatera utara": { capital:"Medan", lat:3.5952, lon:98.6722, tz:"Asia/Jakarta", zone:"WIB" },
  "sumatera barat": { capital:"Padang", lat:-0.9471, lon:100.4172, tz:"Asia/Jakarta", zone:"WIB" },
  "riau": { capital:"Pekanbaru", lat:0.5071, lon:101.4478, tz:"Asia/Jakarta", zone:"WIB" },
  "kepulauan riau": { capital:"Tanjung Pinang", lat:0.9167, lon:104.4667, tz:"Asia/Jakarta", zone:"WIB" },
  "jambi": { capital:"Jambi", lat:-1.6101, lon:103.6131, tz:"Asia/Jakarta", zone:"WIB" },
  "sumatera selatan": { capital:"Palembang", lat:-2.9761, lon:104.7754, tz:"Asia/Jakarta", zone:"WIB" },
  "kepulauan bangka belitung": { capital:"Pangkalpinang", lat:-2.1316, lon:106.1169, tz:"Asia/Jakarta", zone:"WIB" },
  "bengkulu": { capital:"Bengkulu", lat:-3.7928, lon:102.2608, tz:"Asia/Jakarta", zone:"WIB" },
  "lampung": { capital:"Bandar Lampung", lat:-5.4292, lon:105.2610, tz:"Asia/Jakarta", zone:"WIB" },
  "dki jakarta": { capital:"Jakarta", lat:-6.2088, lon:106.8456, tz:"Asia/Jakarta", zone:"WIB" },
  "jawa barat": { capital:"Bandung", lat:-6.9175, lon:107.6191, tz:"Asia/Jakarta", zone:"WIB" },
  "banten": { capital:"Serang", lat:-6.1200, lon:106.1503, tz:"Asia/Jakarta", zone:"WIB" },
  "jawa tengah": { capital:"Semarang", lat:-6.9667, lon:110.4167, tz:"Asia/Jakarta", zone:"WIB" },
  "di yogyakarta": { capital:"Yogyakarta", lat:-7.7956, lon:110.3695, tz:"Asia/Jakarta", zone:"WIB" },
  "jawa timur": { capital:"Surabaya", lat:-7.2575, lon:112.7521, tz:"Asia/Jakarta", zone:"WIB" },
  "bali": { capital:"Denpasar", lat:-8.6500, lon:115.2167, tz:"Asia/Makassar", zone:"WITA" },
  "nusa tenggara barat": { capital:"Mataram", lat:-8.5833, lon:116.1167, tz:"Asia/Makassar", zone:"WITA" },
  "nusa tenggara timur": { capital:"Kupang", lat:-10.1772, lon:123.6070, tz:"Asia/Makassar", zone:"WITA" },
  "kalimantan barat": { capital:"Pontianak", lat:-0.0263, lon:109.3425, tz:"Asia/Pontianak", zone:"WIB" },
  "kalimantan tengah": { capital:"Palangka Raya", lat:-2.2096, lon:113.9213, tz:"Asia/Pontianak", zone:"WIB" },
  "kalimantan selatan": { capital:"Banjarmasin", lat:-3.3194, lon:114.5908, tz:"Asia/Makassar", zone:"WITA" },
  "kalimantan timur": { capital:"Samarinda", lat:-0.5022, lon:117.1536, tz:"Asia/Makassar", zone:"WITA" },
  "kalimantan utara": { capital:"Tanjung Selor", lat:2.8375, lon:117.3653, tz:"Asia/Makassar", zone:"WITA" },
  "sulawesi utara": { capital:"Manado", lat:1.4748, lon:124.8421, tz:"Asia/Makassar", zone:"WITA" },
  "gorontalo": { capital:"Gorontalo", lat:0.5435, lon:123.0568, tz:"Asia/Makassar", zone:"WITA" },
  "sulawesi tengah": { capital:"Palu", lat:-0.9000, lon:119.8707, tz:"Asia/Makassar", zone:"WITA" },
  "sulawesi barat": { capital:"Mamuju", lat:-2.6806, lon:118.8860, tz:"Asia/Makassar", zone:"WITA" },
  "sulawesi selatan": { capital:"Makassar", lat:-5.1477, lon:119.4327, tz:"Asia/Makassar", zone:"WITA" },
  "sulawesi tenggara": { capital:"Kendari", lat:-3.9985, lon:122.5120, tz:"Asia/Makassar", zone:"WITA" },
  "maluku": { capital:"Ambon", lat:-3.6954, lon:128.1814, tz:"Asia/Jayapura", zone:"WIT" },
  "maluku utara": { capital:"Sofifi", lat:0.7373, lon:127.5588, tz:"Asia/Jayapura", zone:"WIT" },
  "papua": { capital:"Jayapura", lat:-2.5916, lon:140.6690, tz:"Asia/Jayapura", zone:"WIT" },
  "papua barat": { capital:"Manokwari", lat:-0.8615, lon:134.0620, tz:"Asia/Jayapura", zone:"WIT" },
  "papua barat daya": { capital:"Sorong", lat:-0.8762, lon:131.2558, tz:"Asia/Jayapura", zone:"WIT" },
  "papua tengah": { capital:"Nabire", lat:-3.5097, lon:135.7522, tz:"Asia/Jayapura", zone:"WIT" },
  "papua pegunungan": { capital:"Wamena", lat:-4.0950, lon:138.9450, tz:"Asia/Jayapura", zone:"WIT" },
  "papua selatan": { capital:"Merauke", lat:-8.4932, lon:140.4018, tz:"Asia/Jayapura", zone:"WIT" }
};

const WEATHER_CODES = {
  0:"Cerah",
  1:"Sebagian cerah",
  2:"Berawan sebagian",
  3:"Mendung",
  45:"Berkabut",
  48:"Kabut beku",
  51:"Gerimis ringan",
  53:"Gerimis sedang",
  55:"Gerimis lebat",
  56:"Gerimis beku ringan",
  57:"Gerimis beku lebat",
  61:"Hujan ringan",
  63:"Hujan sedang",
  65:"Hujan lebat",
  66:"Hujan beku ringan",
  67:"Hujan beku lebat",
  71:"Salju ringan",
  73:"Salju sedang",
  75:"Salju lebat",
  77:"Butiran salju",
  80:"Hujan singkat ringan",
  81:"Hujan singkat sedang",
  82:"Hujan singkat lebat",
  85:"Hujan salju ringan",
  86:"Hujan salju lebat",
  95:"Badai petir",
  96:"Badai petir + hujan es ringan",
  99:"Badai petir + hujan es lebat"
};

const normalize = s => String(s || "")
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, " ").trim();

function findProvince(input) {
  const q = normalize(input);
  if (PROVINCES[q]) return [q, PROVINCES[q]];
  const aliases = {
    jakarta:"dki jakarta",
    jogja:"di yogyakarta",
    yogyakarta:"di yogyakarta",
    kepri:"kepulauan riau",
    babel:"kepulauan bangka belitung",
    sumut:"sumatera utara",
    sumbar:"sumatera barat",
    sumsel:"sumatera selatan",
    jabar:"jawa barat",
    jateng:"jawa tengah",
    jatim:"jawa timur",
    banten:"banten",
    kaltara:"kalimantan utara",
    kaltim:"kalimantan timur",
    kalteng:"kalimantan tengah",
    kalsel:"kalimantan selatan",
    kalbar:"kalimantan barat",
    sulut:"sulawesi utara",
    sulteng:"sulawesi tengah",
    sulsel:"sulawesi selatan",
    sultra:"sulawesi tenggara",
    sulbar:"sulawesi barat",
    malut:"maluku utara",
    papbar:"papua barat"
  };
  if (aliases[q]) return [aliases[q], PROVINCES[aliases[q]]];

  for (const [name, data] of Object.entries(PROVINCES)) {
    if (q === normalize(data.capital) || name.includes(q) || q.includes(name)) {
      return [name, data];
    }
  }
  return null;
}

function formatTime(tz) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: tz,
    weekday:"long", day:"2-digit", month:"long", year:"numeric",
    hour:"2-digit", minute:"2-digit", second:"2-digit",
    hour12:false
  }).format(new Date());
}

function provinceList() {
  const names = Object.keys(PROVINCES);
  return names.map((n,i) => `${String(i+1).padStart(2,"0")}. ${PROVINCES[n].capital} — ${title(n)} (${PROVINCES[n].zone})`).join("\n");
}

function title(s) {
  return s.split(" ").map(x => x.charAt(0).toUpperCase()+x.slice(1)).join(" ");
}

async function getWeather(data) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const res = await axios.get(url, {
    params: {
      latitude:data.lat, longitude:data.lon,
      current:"temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
      timezone:data.tz
    },
    timeout:10000
  });
  return res.data.current;
}

function menu() {
  return `╭━━━〔 🤖 ${BOT_NAME} 〕━━━╮
┃
┃ 👋 halo / hai
┃ 📋 ${PREFIX}menu
┃ 🕐 ${PREFIX}jam <provinsi>
┃ 🌤️ ${PREFIX}cuaca <provinsi>
┃ 📍 ${PREFIX}provinsi
┃ 🧮 ${PREFIX}hitung <rumus>
┃
┃ Contoh:
┃ ${PREFIX}jam Jawa Barat
┃ ${PREFIX}cuaca Jakarta
┃ ${PREFIX}hitung 25*4+10
╰━━━━━━━━━━━━━━━━━━━━╯`;
}

function greeting(name) {
  return `Halo ${name || "Kak"} 👋\nSelamat datang di *${BOT_NAME}*.\n\nKetik *${PREFIX}menu* untuk melihat fitur yang tersedia.`;
}

function safeCalculate(expr) {
  if (!expr || expr.length > 200) throw new Error("Rumus tidak valid.");
  // Kalkulator hanya menerima angka dan operator matematika dasar.
  if (!/^[0-9+\-*/().,%^ xX]+$/.test(expr)) throw new Error("Gunakan angka dan operator + - * / % ^ ( ).");
  const normalized = expr.replace(/[xX]/g, "*");
  const result = evaluate(normalized);
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Hasil tidak valid.");
  return result;
}


async function makeSticker(sock, jid, imageMessage, msgKey) {
  const buffer = await downloadMediaMessage(
    { key: msgKey, message: { imageMessage } },
    "buffer",
    {},
    {
      logger: P({ level: "silent" }),
      reuploadRequest: sock.updateMediaMessage
    }
  );

  const sticker = await sharp(buffer)
    .rotate()
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await sock.sendMessage(jid, { sticker, mimetype: "image/webp" });
}

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level:"silent" }),
    printQRInTerminal: false,
    browser: [BOT_NAME, "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\nScan QR berikut dari WhatsApp > Perangkat tertaut:\n");
      qrcode.generate(qr, { small:true });
    }
    if (connection === "open") console.log(`\n✅ ${BOT_NAME} terhubung.`);
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log("Koneksi terputus, mencoba menyambung kembali...");
        setTimeout(connect, 3000);
      } else {
        console.log("❌ Sesi logout. Hapus folder auth lalu jalankan lagi.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid;
    if (!jid || jid === "status@broadcast") return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption || "";

    const body = text.trim();
    const lower = normalize(body);
    const senderName = msg.pushName || "Kak";

    // Foto + caption "stiker".
    if (msg.message?.imageMessage && /^(stiker|sticker)$/i.test(body)) {
      try {
        await makeSticker(sock, jid, msg.message.imageMessage, msg.key);
      } catch (e) {
        console.error("Sticker error:", e?.message || e);
        await sock.sendMessage(jid, { text: "❌ Gagal membuat stiker dari foto tersebut." });
      }
      return;
    }

    // Balas foto lalu ketik "stiker".
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (/^(stiker|sticker)$/i.test(body) && quoted?.imageMessage) {
      try {
        await makeSticker(sock, jid, quoted.imageMessage, msg.key);
      } catch (e) {
        console.error("Sticker error:", e?.message || e);
        await sock.sendMessage(jid, { text: "❌ Gagal membuat stiker dari foto tersebut." });
      }
      return;
    }

    try {
      // Sapaan otomatis.
      if (AUTO_GREETING && /^(halo|hai|hi|hello|assalamualaikum|p|permisi|selamat pagi|selamat siang|selamat sore|selamat malam)[!. ]*$/i.test(body)) {
        await sock.sendMessage(jid, { text: greeting(senderName) });
        return;
      }

      // Tanpa prefix untuk perintah umum.
      if (lower === "menu" || lower === "help" || lower === "bantuan") {
        await sock.sendMessage(jid, {
          image: fs.readFileSync("./logo-menu.webp"),
          caption: menu()
        });
        return;
      }

      const cmdText = body.startsWith(PREFIX) ? body.slice(PREFIX.length).trim() : body;
      const parts = cmdText.split(/\s+/);
      const cmd = normalize(parts.shift());

      if (cmd === "menu" || cmd === "help" || cmd === "bantuan") {
        await sock.sendMessage(jid, {
          image: fs.readFileSync("./logo-menu.webp"),
          caption: menu()
        });
        return;
      }

      if (cmd === "provinsi" || cmd === "province" || cmd === "listprovinsi") {
        await sock.sendMessage(jid, { text: `🇮🇩 *38 PROVINSI INDONESIA*\n\n${provinceList()}` });
        return;
      }

      if (cmd === "jam" || cmd === "waktu") {
        const q = parts.join(" ");
        const found = findProvince(q);
        if (!found) {
          await sock.sendMessage(jid, { text:`Provinsi tidak ditemukan.\nContoh: *${PREFIX}jam Jawa Barat*\n\nKetik *${PREFIX}provinsi* untuk daftar 38 provinsi.` });
          return;
        }
        const [name,data] = found;
        await sock.sendMessage(jid, { text:
          `🕐 *WAKTU ${data.capital.toUpperCase()}*\n\n` +
          `Provinsi: ${title(name)}\n` +
          `Zona: ${data.zone}\n` +
          `Waktu: *${formatTime(data.tz)}*`
        });
        return;
      }

      if (cmd === "cuaca" || cmd === "weather") {
        const q = parts.join(" ");
        const found = findProvince(q);
        if (!found) {
          await sock.sendMessage(jid, { text:`Lokasi/provinsi tidak ditemukan.\nContoh: *${PREFIX}cuaca Jakarta*` });
          return;
        }
        const [name,data] = found;
        const w = await getWeather(data);
        const condition = WEATHER_CODES[w.weather_code] || `Kode cuaca ${w.weather_code}`;
        await sock.sendMessage(jid, { text:
          `🌤️ *CUACA ${data.capital.toUpperCase()}*\n\n` +
          `Provinsi: ${title(name)}\n` +
          `Kondisi: *${condition}*\n` +
          `Suhu: *${w.temperature_2m}°C*\n` +
          `Terasa: ${w.apparent_temperature}°C\n` +
          `Kelembapan: ${w.relative_humidity_2m}%\n` +
          `Angin: ${w.wind_speed_10m} km/jam\n\n` +
          `_Data cuaca: Open-Meteo_`
        });
        return;
      }

      if (cmd === "hitung" || cmd === "calc" || cmd === "calculator" || cmd === "kalkulator") {
        const expr = parts.join(" ").replace(/,/g, ".");
        try {
          const result = safeCalculate(expr);
          await sock.sendMessage(jid, { text:`🧮 *KALKULATOR*\n\n${expr} = *${result}*` });
        } catch (e) {
          await sock.sendMessage(jid, { text:`❌ Rumus tidak valid.\nContoh: *${PREFIX}hitung 25*4+10*` });
        }
        return;
      }

      if (body.startsWith(PREFIX)) {
        await sock.sendMessage(jid, { text:`❓ Perintah tidak dikenal.\nKetik *${PREFIX}menu* untuk melihat menu.` });
      }
    } catch (err) {
      console.error("Message error:", err?.message || err);
      await sock.sendMessage(jid, { text:"⚠️ Terjadi kesalahan saat memproses pesan. Silakan coba lagi." }).catch(()=>{});
    }
  });
}

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth");
connect().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
