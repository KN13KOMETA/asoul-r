// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import convict, { type Config } from "convict";
import { type ActivityOptions, ActivityType } from "discord.js";
import configJson from "../config.json" with { type: "json" };

export interface IConfigDiscordBotStatus {
	activity: ActivityOptions;
	timer: number;
}

export interface IConfig {
	discord: {
		applicationID: string;
		bot: {
			token: string;
			status: IConfigDiscordBotStatus[];
		};
	};
}

const coerceStatusType = (v: unknown): ActivityType | null => {
	if (typeof v == "number") return v;

	switch (v) {
		case "Playing":
			return ActivityType.Playing;
		case "Streaming":
			return ActivityType.Streaming;
		case "Listening":
			return ActivityType.Listening;
		case "Watching":
			return ActivityType.Watching;
		case "Custom":
			return ActivityType.Custom;
		case "Competing":
			return ActivityType.Competing;
		default:
			return null;
	}
};

convict.addFormat({
	name: "discord-status-setup",
	validate: (v) => {
		if (!Array.isArray(v)) throw new Error("must be of type Array");

		for (const status of v) {
			if (typeof status != "object" || Array.isArray(status))
				throw new Error("each status must be of type object");
			if (typeof status.activity != "object" || Array.isArray(status.activity))
				throw new Error("each status must have a object 'activity'");

			// I has to call it here, because coerce is not called for some reason
			status.activity.type = coerceStatusType(status.activity.type);
			if (typeof status.activity.type != "number")
				throw new Error(
					`each status 'activity.type' must be ${[
						"Custom",
						"Playing",
						"Watching",
						"Listening",
						"Streaming",
						"Competing",
					].reduce((prev, cur, i, arr) => {
						if (i == 0) {
							return `"${cur}"`;
						}
						if (i + 1 == arr.length) {
							return `${prev} or "${cur}"`;
						}

						return `${prev}, "${cur}"`;
					}, "")}`,
				);

			if (typeof status.activity.name != "string")
				throw new Error("each status must have a string 'activity.name'");

			if (status.activity.state != null)
				if (typeof status.activity.state != "string")
					throw new Error("each status must have a string 'activity.state'");

			if (status.activity.url != null)
				if (typeof status.activity.url != "string")
					throw new Error("each status must have a string 'activity.url'");

			if (typeof status.timer != "number")
				throw new Error("each status must have a number 'timer'");
		}
	},
});

convict.addFormat({
	name: "source-array",
	validate: (sources, schema) => {
		if (!Array.isArray(sources)) {
			throw new Error("must be of type Array");
		}

		for (const source of sources) {
			convict(schema.children).load(source).validate();
		}
	},
});

// TODO: Validate snowflake id

const config = convict({
	discord: {
		applicationID: {
			doc: "Discord Application ID",
			format: String,
			default: null,
			env: "DISCORD_APPLICATION_ID",
			sensitive: true,
		},
		bot: {
			token: {
				doc: "Discord Bot Token",
				format: String,
				default: null,
				env: "DISCORD_BOT_TOKEN",
				sensitive: true,
			},
			status: {
				doc: "Discord Bot Statuses",
				format: "discord-status-setup",
				default: [],
			},
		},
	},
	coasdb: {
		url: {
			doc: "coasdb url",
			format: String,
			default: "http://127.0.0.1:13010",
		},
		adminList: {
			doc: "coasdb admin list",
			format: "source-array",
			default: [],
			children: {
				doc: "coasdb admin id",
				format: String,
				default: null,
			},
		},
	},
}) as unknown as Config<IConfig>;

config.load(configJson);
config.validate({ allowed: "strict" });

console.log(config.toString());

export default config;
