// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import pino from "pino";
import { parseEnvConfigOrExit } from "@/config/env.js";
import { divide } from "@/math.js";
import { m } from "@/paraglide/messages.js";

const logger = pino();
const env = await parseEnvConfigOrExit(logger, process.env);

logger.level = env.NODE_ENV === "development" ? "debug" : "info";
logger.info(`Logger level is set to ${logger.level}`);

if (env.NODE_ENV === "development") {
  logger.info(`Deploying commands to guild with id ${env.DISCORD_GUILD_ID}`);
  await import("@/discord/deploy-commands.js");
}

logger.info(m.example_message({ username: "Username" }));

const res = divide(10, 2);

res.match(
  (ok) => logger.info(`Value is ${ok}`),
  (err) => logger.error(err),
);
