// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { REST, Routes } from "discord.js";
import { ResultAsync } from "resultar";
import { parseEnvConfigOrExit } from "@/config/env.js";
import { commandsDir, discordLoadCommands } from "@/discord/command.js";
import { createFileLogger } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);
const env = await parseEnvConfigOrExit(flogger, process.env);

const commands = await discordLoadCommands(commandsDir).match(
  (ok) => ok,
  (err) => {
    flogger.error(err);
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
  flogger.error(respond.error);
  process.exit(1);
}

flogger.info(`Deployed ${commands.length} commands.`);
