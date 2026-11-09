// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from "node:path";
import { REST, Routes } from "discord.js";
import pino from "pino";
import { ResultAsync } from "resultar";
import { parseEnvConfigOrExit } from "@/config/env.js";
import { discordLoadCommands } from "@/discord/command.js";

const logger = pino();
const env = await parseEnvConfigOrExit(logger, process.env);

const commandsPath = path.join(import.meta.dirname, "commands");
const commands = await discordLoadCommands(commandsPath).match(
  (ok) => ok,
  (err) => {
    logger.error(err);
    process.exit(1);
  },
);

const rest = new REST().setToken(env.DISCORD_BOT_TOKEN);
const route =
  env.NODE_ENV === "development"
    ? Routes.applicationGuildCommands(
        env.DISCORD_APPLICATION_ID,
        env.DISCORD_GUILD_ID,
      )
    : Routes.applicationCommands(env.DISCORD_APPLICATION_ID);

const respond = await ResultAsync.fromPromise(
  rest.put(route, {
    body: commands.map((command) => command.data.toJSON()),
  }),
  (err) => err,
);

if (respond.isErr()) {
  logger.error(respond.error);
  process.exit(1);
}

logger.info(`Deployed ${commands.length} commands.`);
