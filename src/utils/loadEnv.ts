import fs from "fs";
import path from "path";

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  let loaded = false;
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const envConfig = fs.readFileSync(filePath, "utf-8");
        for (const line of envConfig.split(/\r?\n/)) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith("#")) continue;

          const match = trimmedLine.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Strip surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
        loaded = true;
      } catch (err) {
        console.error(`Error loading env file ${file}:`, err);
      }
    }
  }
  return loaded;
}

loadEnv();
