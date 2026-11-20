// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Bot } from "@/discord/bot.js";
import { env } from "@/env.js";
import { createFileLogger, getLoggerLevel, setLoggerLevel } from "@/logger.js";
import { divide } from "@/math.js";
import { m } from "@/paraglide/messages.js";

const flogger = createFileLogger(import.meta.filename);

setLoggerLevel(env.NODE_ENV === "development" ? "debug" : "info");
flogger.info(`Logger level is set to ${getLoggerLevel()}`);

if (env.NODE_ENV === "development") {
  flogger.info(`Deploying commands to guild with id ${env.DISCORD_GUILD_ID}`);
  await import("@/discord/deploy-commands.js");
}

flogger.info(m.example_message({ username: "Username" }));

const res = divide(10, 2);

res.match(
  (ok) => flogger.info(`Value is ${ok}`),
  (err) => flogger.error(err),
);

const bot = new Bot();

(await bot.start()).match(
  () => {},
  (err) => {
    flogger.error(err);
    process.exit(1);
  },
);
