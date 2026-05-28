const fs = require("node:fs");
const path = require("node:path");

const keys = [
  "API_BASE_URL",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
  "AUTH_GITLAB_ID",
  "AUTH_GITLAB_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "AUTH_MICROSOFT_ENTRA_ID_ID",
  "AUTH_MICROSOFT_ENTRA_ID_ISSUER",
  "AUTH_MICROSOFT_ENTRA_ID_SECRET",
  "AUTH_OKTA_ID",
  "AUTH_OKTA_ISSUER",
  "AUTH_OKTA_SECRET",
  "AUTH_ONELOGIN_ID",
  "AUTH_ONELOGIN_ISSUER",
  "AUTH_ONELOGIN_SECRET",
  "AUTH_SECRET",
  "AUTH_URL",
];

const outputPath = path.join(
  process.cwd(),
  "src",
  "generated",
  "amplify-server-env.ts"
);

const lines = [
  "// Auto-generated during Amplify builds. Do not commit populated secrets.",
  "export const AMPLIFY_SERVER_ENV = {",
];

for (const key of keys) {
  const value = process.env[key];
  lines.push(`  ${key}: ${value ? JSON.stringify(value) : "undefined"},`);
}

lines.push("} as const;", "");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

const presentKeys = keys.filter((key) => Boolean(process.env[key]));
console.log(
  `[amplify-auth-env] generated ${path.relative(process.cwd(), outputPath)} with ${presentKeys.length}/${keys.length} keys`
);
