// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import {
  createTaggedError,
  ResultAsync,
  ResultTask,
  tryResultAsync,
} from "resultar";
import type { DiscordBotModuleCollection } from "@/discord/bot/module.js";
import {
  commandsDir,
  type DiscordCommandCollection,
  type DiscordLoadCommandsError,
  discordLoadCommands,
} from "@/discord/command.js";
import { env } from "@/env.js";
import { LocaleStorage } from "@/locale-storage.js";
import { createFileLogger } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);

export class DiscordBotError extends createTaggedError({
  name: "DiscordBotError",
  message: "Discord Bot: $reason",
}) {}

export interface BotData {
  localeStorage: LocaleStorage;
  client: Client;
  commands: DiscordCommandCollection;
}

export class Bot {
  #data: BotData;

  constructor() {
    this.#data = {
      localeStorage: new LocaleStorage(),
      client: new Client({ intents: [GatewayIntentBits.Guilds] }),
      commands: new Collection(),
    };
  }

  #loadCommands(): ResultAsync<null, DiscordLoadCommandsError> {
    return discordLoadCommands(commandsDir).map((commands) => {
      for (const command of commands)
        this.#data.commands.set(command.data.name, command);
      return null;
    });
  }

  executeModules(
    modules: DiscordBotModuleCollection,
  ): ResultAsync<null, DiscordBotError> {
    const tasks: ResultTask<null, DiscordBotError>[] = modules.map(
      (module, moduleName) =>
        ResultTask.fromResultAsync(() =>
          tryResultAsync(
            module(this.#data),
            (err) =>
              new DiscordBotError({
                reason: `Failed to execute module ${moduleName}`,
                cause: err,
              }),
          ).map(() => null),
        ),
    );

    return ResultAsync.fromSafePromise(
      ResultTask.runPromise(ResultTask.all(tasks)),
    ).map(() => null);
  }

  start(): ResultAsync<null, DiscordBotError> {
    this.#data.client.once(Events.ClientReady, (readyClient) =>
      flogger.info(`Logged in as ${readyClient.user.tag}`),
    );

    const tasks: ResultTask<null, DiscordBotError>[] = [];

    // Add command loading task
    tasks.push(
      ResultTask.fromResultAsync(() =>
        this.#loadCommands().mapErr(
          (err) =>
            new DiscordBotError({
              reason: "Failed to load commands.",
              cause: err,
            }),
        ),
      ),
    );

    // Add client login task
    tasks.push(
      ResultTask.fromResultAsync(() =>
        ResultAsync.fromPromise(
          this.#data.client.login(env.DISCORD_BOT_TOKEN),
          (err) =>
            new DiscordBotError({ reason: "Failed to login.", cause: err }),
        ).map(() => null),
      ),
    );

    return ResultAsync.fromSafePromise(
      ResultTask.runPromise(
        ResultTask.forEach(tasks, (task) => task, { concurrency: 1 }),
      ),
    ).map(() => null);
  }
}
