// SPDX-FileCopyrightText: 2023-2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ActivityOptions } from "discord.js"

export interface IConfig {
	token: string,
	applicationId: string,
	godList: string[],
	statusSwitchInterval: number,
	statusList: ActivityOptions[],
	coasdb: {
		url: string,
		adminList: string[]
	}
}
