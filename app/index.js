require("dotenv").config();
const puppeteer = require("puppeteer-core");
const prompt = require("prompt-sync")();
const fs = require("fs");
const moment = require("moment");
const accounts = require("./accounts.json");
const editJsonFile = require("edit-json-file");
let file = editJsonFile("accounts.json");

function getKeywords(file) {
  try {
    const data = fs.readFileSync(file, "utf8");
    const arr = data.split(/\r?\n/);
    return arr;
  } catch (err) {
    console.log(err);
  }
}

function getIdKeywords(value) {
  let arr = [];
  while (arr.length < value) {
    let r = Math.floor(Math.random() * 524) + 1;
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateAndSaveAccount(file, index, point) {
  const accountData = {
    ...file.toObject().data[index],
    point: point,
    lastRun: moment().format(),
  };

  file.toObject().data[index] = accountData;
  file.save();
}

console.log(`⏳ Loading base keywords...`);
const keywords = getKeywords("keywords.txt");
(async () => {
  console.log("🔒 Loading accounts...");
  if (accounts.data.length === 0) {
    console.log("❌ Tidak ada akun yang pada file accounts.json");
    process.exit();
  }
  console.log(`📌 Total ${accounts.data.length} accounts loaded!\n`);
  for (let i = 0; i < accounts.data.length; i++) {
    let dateNow = moment(new Date());
    let dateAcc =
      accounts.data[i].lastRun ||
      moment(new Date()).subtract(1, "days").subtract(1, "hours");
    let result = dateNow.diff(dateAcc, "minutes");

    if (result >= 1440 || dateAcc === undefined) {
      const browser = await puppeteer.launch({
        executablePath: process.env.EDGE_PATH,
        headless: false,
      });

      const context = await browser.createIncognitoBrowserContext();
      const page = await context.newPage();

      // login email
      console.log(`⏳ Proses akun ke-[${i + 1}] ${accounts.data[i].email}`);
      console.log(`😾 Point : ${accounts.data[i].point}`);

      await page.goto("https://outlook.live.com/owa/?nlp=1", {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector("#i0116");
      await delay(1000);
      console.log("✅ Menginput email...");
      await page.type("#i0116", accounts.data[i].email, { delay: 100 });

      await page.waitForSelector("#idSIButton9");
      await page.click("#idSIButton9");
      await delay(1000);
      console.log("✅ Menginput password...");
      await page.type("#i0118", accounts.data[i].pass, { delay: 100 });

      await delay(200);
      await page.click("#idSIButton9");
      await delay(1000);

      // check if login failed
      // const loginFailed = await page.evaluate(async () => {
      //   return document.querySelector("#passwordError").innerText;
      // });

      const loginFailed = () => {
        if (!document.querySelector("#passwordError").innerText) {
          continue;
        }
        return loginFailed;
      }
      }

      if (loginFailed) {
        console.log(`❌ SKIP! ${loginFailed}`);
        await browser.close();
        continue;
      }
      console.log("✅ Login berhasil!");

      await delay(1000);
      // stay signed in #idBtn_Back no #idSIButton9 yes

      // mulai search
      console.log("⏳ Memproses bot rewards...");
      console.log(`😾 Akun level ${accounts.data[i].level}`);
      // check account level
      if (accounts.data[i].level === 2) {
        console.log("📄 Getting random keywords...");
        const idKeywords = getIdKeywords(55);
        console.log("🦾 Doing desktop search rewards");
        console.log("⏳ Loading bing web...");
        await page.goto("https://bing.com", {
          waitUntil: "networkidle2",
        });
        await page.waitForSelector("#sb_form_q");
        await page.type("#sb_form_q", keywords[idKeywords[0]], { delay: 100 });
        await page.keyboard.press("Enter");
        for (let i = 0; i <= 34; i++) {
          console.log(`[${i}] memakai keyword ${keywords[idKeywords[i]]}`);
          await page.waitForSelector("#sb_form_q");
          await delay(1000);
          // metode 3 klik
          const input = await page.$("#sb_form_q");
          await input.click({ clickCount: 3 });
          await delay(1000);
          await input.type(keywords[idKeywords[i]], { delay: 100 });
          await page.keyboard.press("Enter");
        }
        console.log("🦾 Doing mobile search rewards");
        console.log("⏳ Loading bing web...");
        await page.setUserAgent(process.env.MOBILE_UA);
        await page.goto("https://bing.com", {
          waitUntil: "networkidle2",
        });
        await page.waitForSelector("#sb_form_q");
        await page.type("#sb_form_q", keywords[idKeywords[35]], { delay: 100 });
        await page.keyboard.press("Enter");
        for (let i = 35; i <= 54; i++) {
          console.log(`[${i}] memakai keyword ${keywords[idKeywords[i]]}`);
          await page.waitForSelector("#sb_form_q");
          await delay(1000);
          // metode 3 klik
          const input = await page.$("#sb_form_q");
          await input.click({ clickCount: 3 });
          await delay(1000);
          await input.type(keywords[idKeywords[i]], { delay: 100 });
          await page.keyboard.press("Enter");
        }
        // get new point
        await page.setUserAgent(process.env.PC_UA);
        await page.goto("https://bing.com", {
          waitUntil: "networkidle2",
        });
        await page.waitForSelector("#id_rc");
        const point = await page.evaluate(async () => {
          return document.getElementById("id_rc").innerText;
        });
        console.log(`🎁 Point terakhir ${point}`);
        console.log("✅ Proses akun telah selesai");

        await updateAndSaveAccount(file, i, point);
        prompt("❓ sudah reset data?");
        await browser.close();
      } else {
        console.log("📄 Getting random keywords...");
        const idKeywords = getIdKeywords(13);
        console.log("⏳ Membuka web bing...");
        await page.goto("https://bing.com", {
          waitUntil: "networkidle2",
        });
        await page.waitForSelector("#sb_form_q");
        await page.type("#sb_form_q", keywords[0], { delay: 100 });
        await page.keyboard.press("Enter");
        for (let i = 0; i < 13; i++) {
          console.log(`[${i}] memakai keyword ${keywords[idKeywords[i]]}`);
          await page.waitForSelector("#sb_form_q");
          await delay(1000);
          // metode 3 klik
          const input = await page.$("#sb_form_q");
          await input.click({ clickCount: 3 });
          await delay(1000);
          await input.type(keywords[idKeywords[i]], { delay: 100 });
          await page.keyboard.press("Enter");
        }
        // get new point
        await page.setUserAgent(process.env.PC_UA);
        await page.goto("https://bing.com", {
          waitUntil: "networkidle2",
        });
        await page.waitForSelector("#id_rc");
        const point = await page.evaluate(async () => {
          return document.getElementById("id_rc").innerText;
        });
        console.log(`🎁 Point terakhir ${point}`);
        console.log("✅ Proses akun telah selesai");

        await updateAndSaveAccount(file, i, point);
        prompt("❓ Sudah reset data?");
        await browser.close();
      }
    } else {
      console.log(`❌ Akun sudah digarap dalam 24jam terakhir`);
      console.log(`⏳ Tunggu ${result / 60 - 24} jam lagi`);
    }
  }
  console.log("\n💯 Semua proses selesai");
})();
