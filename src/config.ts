// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import convict, { Config } from "convict";
import { ActivityType } from "discord.js";
import configJson from "../config.json" with { type: "json" };

export interface IConfig {
  discord: {
    applicationID: string;
    bot: {
      token: string;
      status: {
        interval: number;
        list: { name: string; type: ActivityType }[];
      };
    };
  };
  coasdb: {
    url: string;
    adminList: string[];
  };
}

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

convict.addFormat({
  name: "discord-status-type",
  validate: (v) => {
    if (v != null) return;

    throw new Error(
      `must be ${[
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
  },
  coerce: (v) => {
    let r = null;

    switch (v) {
      case "Custom": {
        r = ActivityType.Custom;
        break;
      }
      case "Playing": {
        r = ActivityType.Playing;
        break;
      }
      case "Watching": {
        r = ActivityType.Watching;
        break;
      }
      case "Listening": {
        r = ActivityType.Listening;
        break;
      }
      case "Streaming": {
        r = ActivityType.Streaming;
        break;
      }
      case "Competing": {
        r = ActivityType.Competing;
        break;
      }
    }

    return r;
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
        interval: {
          doc: "Discord Bot Status switch interval",
          format: "nat",
          default: 10,
        },
        list: {
          doc: "Discord Bot Statuses",
          format: "source-array",
          default: [],
          children: {
            name: {
              doc: "Discord Bot Status name",
              format: String,
              default: null,
            },
            type: {
              doc: "Discord Bot Status type",
              format: "discord-status-type",
              default: null,
            },
          },
        },
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
