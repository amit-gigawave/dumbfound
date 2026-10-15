// Opens a public https:// address for the local dev server with ngrok, so a
// phone can scan the "View in AR" QR code and test AR (which needs https).
//
//   npm run dev                       (in another terminal — the site must be running)
//   npm run tunnel                    tunnel to http://localhost:3000
//   npm run tunnel -- --port 3100     if the site is on another port
//
// Settings in .env.local:
//   NGROK_AUTHTOKEN=...               required, from https://dashboard.ngrok.com/get-started/your-authtoken
//   NGROK_DOMAIN=name.ngrok-free.app  optional: your free permanent address
//                                     (https://dashboard.ngrok.com/domains). Without
//                                     it the address changes on every run.
//
// It also writes the tunnel address into NEXT_PUBLIC_SITE_URL in .env.local,
// which the QR code uses. Next reloads it by itself; refresh the page.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import ngrok from "@ngrok/ngrok";

const ENV_FILE = ".env.local";
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const args = process.argv.slice(2);
const portAt = args.indexOf("--port");
const port = Number(portAt > -1 ? args[portAt + 1] : 3000);

const authtoken = process.env.NGROK_AUTHTOKEN;
if (!authtoken) {
  console.error(
    `NGROK_AUTHTOKEN is not set. Copy your token from\n` +
      `  https://dashboard.ngrok.com/get-started/your-authtoken\n` +
      `and add this line to ${ENV_FILE}:\n  NGROK_AUTHTOKEN=<your token>`,
  );
  process.exit(1);
}

const domain = process.env.NGROK_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "");

let listener;
try {
  listener = await ngrok.forward({ addr: port, authtoken, ...(domain && { domain }) });
} catch (err) {
  console.error(`Could not open the tunnel: ${err.message}`);
  process.exit(1);
}
const url = listener.url();

const env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
const line = `NEXT_PUBLIC_SITE_URL=${url}`;
if (!env.split(/\r?\n/).includes(line)) {
  const updated = /^NEXT_PUBLIC_SITE_URL=.*$/m.test(env)
    ? env.replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, line)
    : `${env}${env && !env.endsWith("\n") ? "\n" : ""}${line}\n`;
  writeFileSync(ENV_FILE, updated);
  console.log(`Set ${line} in ${ENV_FILE}. Refresh the page so the QR code uses it.`);
}

console.log(`\nTunnel open: ${url}  →  http://localhost:${port}`);
if (!domain) console.log("Tip: set NGROK_DOMAIN in .env.local to keep the same address every time.");
console.log("Press Ctrl+C to close it.\n");

const close = async () => {
  await ngrok.disconnect();
  process.exit(0);
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
setInterval(() => {}, 1 << 30);
