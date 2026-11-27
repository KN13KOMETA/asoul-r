// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from "node:path";
import { Bot } from "@/discord/bot.js";
import { env } from "@/env.js";
import { createFileLogger, getLoggerLevel, setLoggerLevel } from "@/logger.js";
import { loadDiscordBotModules } from "./discord/bot/module.js";

const flogger = createFileLogger(import.meta.filename);

setLoggerLevel(env.NODE_ENV === "development" ? "debug" : "info");
flogger.info(
  { logger: { level: getLoggerLevel() } },
  "Logger level is set up.",
);

if (env.NODE_ENV === "development") {
  flogger.info(
    { discord: { guildId: env.DISCORD_GUILD_ID } },
    "Deploying commands to discord guild.",
  );
  await import("@/discord/deploy-commands.js");
}

const bot = new Bot();

const botModulesDir = path.join(import.meta.dirname, "./discord/bot/modules/");
(await loadDiscordBotModules(botModulesDir, true)).match(
  async (botModules) => {
    flogger.info(
      { bot: { modules: [...botModules.keys()] } },
      "Found bot modules:",
    );
    (await bot.executeModules(botModules)).match(
      () => {},
      (err) => {
        flogger.error(err);
        process.exit(1);
      },
    );
  },
  (err) => {
    flogger.error(err);
    process.exit(1);
  },
);

(await bot.start()).match(
  () => {},
  (err) => {
    flogger.error(err);
    process.exit(1);
  },
);
