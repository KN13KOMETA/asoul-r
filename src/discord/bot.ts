// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import {
  createTaggedError,
  errAsync,
  okAsync,
  ResultAsync,
  ResultTask,
  tryResultAsync,
} from "resultar";
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

export type BotModule = (data: BotData) => Promise<void>;
export type BotModuleCollection = Collection<string, BotModule>;

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
    modules: BotModuleCollection,
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

  static loadModules(
    modulesDir: string,
  ): ResultAsync<BotModuleCollection, DiscordBotError> {
    if (!existsSync(modulesDir) || !statSync(modulesDir).isDirectory()) {
      return errAsync(
        new DiscordBotError({
          reason: "path does not exists or not a directory",
        }),
      );
    }

    flogger.debug({ modulesDir });

    const getTasksRecursive = (dir: string) =>
      readdirSync(dir).flatMap(
        (p): ResultTask<{ name: string; f: BotModule }, DiscordBotError>[] => {
          const pfull = path.join(dir, p);
          flogger.debug({ pfull });
          if (statSync(pfull).isDirectory()) return getTasksRecursive(pfull);

          if (!p.endsWith(".ts") && !p.endsWith(".js")) return [];

          return [
            ResultTask.fromResultAsync(() =>
              ResultAsync.fromPromise<unknown, DiscordBotError>(
                import(pfull),
                (err) =>
                  new DiscordBotError({
                    reason: `failed to load module "${p}".`,
                    cause: err,
                  }),
              ).andThen((module) => {
                if (
                  !(
                    typeof module === "object" &&
                    module !== null &&
                    "default" in module &&
                    typeof module.default === "function" &&
                    module.default.length === 1
                  )
                ) {
                  return DiscordBotError.err({
                    reason: `module "${p}" must export default function`,
                  });
                }

                const relativePath = path.relative(modulesDir, pfull);
                const moduleName = relativePath.slice(
                  0,
                  -path.extname(relativePath).length,
                );

                return okAsync({
                  name: moduleName,
                  f: module.default as BotModule,
                });
              }),
            ),
          ];
        },
      );

    const tasks = getTasksRecursive(modulesDir);

    return ResultAsync.fromSafePromise(
      ResultTask.runPromise(ResultTask.all(tasks)),
    ).map((modules) =>
      modules.reduce(
        (p, v) => p.set(v.name, v.f),
        new Collection() satisfies BotModuleCollection,
      ),
    );
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
