const { spawn } = require("child_process");
const gradient = require("gradient-string");
const { retro } = gradient;
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

const axios = require("axios");
function runChildProcess() {
  const child = spawn("node", ["spawner.js"], {
    shell: true,
    stdio: "pipe",
  });

  child.stdout.on("data", (data) => {
    const output = retro(data.toString());
    process.stdout.write(output);
  });

  child.stderr.on("data", (data) => {
    const output = retro(data.toString());
    process.stderr.write(output);
  });

  child.on("close", (code) => {
    if (code === 69) {
      return;
    }
    console.log(`Cassidy exited with code ${code}`);
    if (code === 3 || code === 134 || code === 137) {
      console.log("Recalling Cassidy...");
      runChildProcess();
    }
  });
}

function runChildProcess2() {
  const child = spawn("node", ["setupAutoDis.js"], {
    shell: true,
    stdio: "pipe",
  });

  child.stdout.on("data", (data) => {
    const output = retro(data.toString());
    process.stdout.write(output);
  });

  child.stderr.on("data", (data) => {
    const output = retro(data.toString());
    process.stderr.write(output);
  });

  child.on("close", (code) => {
    if (code === 69) {
      return;
    }
    console.log(`Discord exited with code ${code}`);
    if (code === 3 || code === 134) {
      console.log("Recalling Discord...");
      runChildProcess2();
    }
  });
}

runChildProcess();
runChildProcess2();
setInterval?.(async () => {
  try {
    await axios.get(`http://localhost:3000`);
  } catch (err) {}
}, 10000);
