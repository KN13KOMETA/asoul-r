// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { createTaggedError, ResultAsync, ResultTask } from "resultar";
import type { Zenv } from "@/config/env.js";
import {
  commandsDir,
  type DiscordCommand,
  type DiscordLoadCommandsError,
  discordLoadCommands,
} from "@/discord/command.js";
import { LocaleStorage } from "@/locale-storage.js";
import { createFileLogger } from "@/logger.js";

const logger = createFileLogger(import.meta.filename);

export class DiscordBotError extends createTaggedError({
  name: "DiscordBotError",
  message: "Discord Bot: $reason",
}) {}

export class Bot {
  #env: Zenv;
  #localeStorage: LocaleStorage;
  #client: Client;
  #commands: Collection<string, DiscordCommand> = new Collection();

  constructor(env: Zenv) {
    this.#env = env;
    this.#localeStorage = new LocaleStorage();
    this.#client = new Client({ intents: [GatewayIntentBits.Guilds] });
  }

  #loadCommands(): ResultAsync<null, DiscordLoadCommandsError> {
    return discordLoadCommands(commandsDir).map((commands) => {
      for (const command of commands)
        this.#commands.set(command.data.name, command);
      return null;
    });
  }

  start(): ResultAsync<null, DiscordBotError> {
    this.#client.once(Events.ClientReady, (readyClient) =>
      logger.info(`Logged in as ${readyClient.user.tag}`),
    );

    // TODO: Rewrite this
    this.#client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const commandLogger = logger.child({ command: interaction.commandName });

      const command = this.#commands.get(interaction.commandName);

      if (!command) {
        commandLogger.error(`Command not found.`);
        return;
      }

      const discordLocale = interaction.guildLocale || interaction.locale;

      await this.#localeStorage.run(
        discordLocale,
        async () =>
          await command.execute(commandLogger, interaction).match(
            () => {},
            async (err) => {
              commandLogger.error(err);
              if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                  content: "There was an error while executing this command!",
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                await interaction.reply({
                  content: "There was an error while executing this command!",
                  flags: MessageFlags.Ephemeral,
                });
              }
            },
          ),
      );
    });

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
          this.#client.login(this.#env.DISCORD_BOT_TOKEN),
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
