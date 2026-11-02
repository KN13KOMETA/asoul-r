// SPDX-FileCopyrightText: 2023-2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  APIEmbedField,
  EmbedBuilder,
  Locale,
  SlashCommandBuilder,
} from "discord.js";
import { ICommand } from "../types/ICommand.js";

const command: ICommand = {
  data: new SlashCommandBuilder()
    .setName("flip")
    .setDescription("Heads or tails")
    .setNameLocalization("ru", "монета")
    .setDescriptionLocalization("ru", "Орел или решка"),
  fun: async (inter) => {
    const isUp = Math.random() < 0.5 ? true : false;

    const embed = new EmbedBuilder()
      .setColor(isUp ? 0x66ff66 : 0xffff66)
      .setTimestamp(Date.now())
      .setFooter({
        text: inter.user.tag,
        iconURL: inter.user.displayAvatarURL({ size: 32 }),
      });

    if (inter.locale == Locale.Russian)
      if (isUp) embed.setTitle("Выпала решка");
      else embed.setTitle("Выпал орел");
    else if (isUp) embed.setTitle("Tail fell out");
    else embed.setTitle("Head fell out");

    inter.reply({ embeds: [embed] });
  },
};

export default command;
