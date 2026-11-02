// SPDX-FileCopyrightText: 2023-2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ChatInputCommandInteraction, Client, Collection, StringSelectMenuInteraction } from "discord.js";
import { IButtonInteraction } from "./ICommand.js";

export class EClient extends Client {
	public cmdList: Collection<string, (inter: ChatInputCommandInteraction) => void> = new Collection();
	public btnList: Collection<string, (einter: IButtonInteraction) => void> = new Collection();
	public sltList: Collection<string, (inter: StringSelectMenuInteraction) => void> = new Collection();
}
