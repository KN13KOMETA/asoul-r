// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { SlashCommandBuilder } from "discord.js";
import { ResultAsync } from "resultar";
import { type DiscordCommand, DiscordCommandError } from "@/discord/command.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  execute: (interaction) =>
    ResultAsync.fromPromise(
      interaction.reply("Pong!"),
      (err) =>
        new DiscordCommandError({ reason: "Failed to reply.", cause: err }),
    ).map(() => null),
} satisfies DiscordCommand;
