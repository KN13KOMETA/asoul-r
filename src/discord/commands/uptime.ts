// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Locale, SlashCommandBuilder } from "discord.js";
import { ResultAsync } from "resultar";
import { type DiscordCommand, DiscordCommandError } from "@/discord/command.js";
import { getSplitTime, SplitTimeTop } from "@/format/time.js";
import { m } from "@/paraglide/messages.js";
import { getLocale } from "@/paraglide/runtime.js";

export default {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription(
      m["commands.uptime.description"]({
        locale: "en",
      }),
    )
    .setDescriptionLocalizations({
      [Locale.Russian]: m["commands.uptime.description"]({ locale: "ru" }),
    }),
  execute: (_logger, interaction) =>
    ResultAsync.fromPromise(
      interaction.reply(
        m["commands.uptime.current"]({
          uptime: new Intl.DurationFormat(getLocale(), {
            style: "short",
          }).format(
            getSplitTime(
              SplitTimeTop.Days,
              Math.floor(process.uptime() * 1000),
            ),
          ),
        }),
      ),
      (err) =>
        new DiscordCommandError({ reason: "Failed to reply.", cause: err }),
    ).map(() => null),
} satisfies DiscordCommand;
