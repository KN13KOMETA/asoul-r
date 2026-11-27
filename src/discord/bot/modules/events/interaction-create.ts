// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Events, MessageFlags } from "discord.js";
import type { DiscordBotModule } from "@/discord/bot/module.js";
import { createFileLogger } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);

export default (async ({ localeStorage, client, commands }) => {
  // TODO: Rewrite this
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const commandLogger = flogger.child({ command: interaction.commandName });

    const command = commands.get(interaction.commandName);

    if (!command) {
      commandLogger.error(`Command not found.`);
      return;
    }

    const discordLocale = interaction.guildLocale || interaction.locale;

    await localeStorage.run(
      discordLocale,
      async () =>
        await command.execute(interaction).match(
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
}) satisfies DiscordBotModule;
