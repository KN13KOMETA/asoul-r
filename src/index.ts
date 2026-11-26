// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Bot } from "@/discord/bot.js";
import { env } from "@/env.js";
import { createFileLogger, getLoggerLevel, setLoggerLevel } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);

setLoggerLevel(env.NODE_ENV === "development" ? "debug" : "info");
flogger
  .child({ logger: { level: getLoggerLevel() } })
  .info("Logger level is set up.");

if (env.NODE_ENV === "development") {
  flogger
    .child({ discord: { guildId: env.DISCORD_GUILD_ID } })
    .info("Deploying commands to discord guild.");
  await import("@/discord/deploy-commands.js");
}

const bot = new Bot();

(await bot.start()).match(
  () => {},
  (err) => {
    flogger.error(err);
    process.exit(1);
  },
);
