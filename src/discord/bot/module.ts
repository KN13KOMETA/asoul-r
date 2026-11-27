// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";
import {
  createTaggedError,
  errAsync,
  okAsync,
  ResultAsync,
  ResultTask,
} from "resultar";
import type { BotData } from "@/discord/bot.js";

export class DiscordBotModuleError extends createTaggedError({
  name: "DiscordBotModuleError",
  message: "Discord Bot Module: $reason",
}) {}

export type DiscordBotModule = (data: BotData) => Promise<void>;
export type DiscordBotModuleCollection = Collection<string, DiscordBotModule>;

export const loadDiscordBotModules = (
  modulesDir: string,
  recursive = false,
): ResultAsync<DiscordBotModuleCollection, DiscordBotModuleError> => {
  if (!existsSync(modulesDir) || !statSync(modulesDir).isDirectory()) {
    return errAsync(
      new DiscordBotModuleError({
        reason: "path does not exists or not a directory",
      }),
    );
  }

  const tasks = readdirSync(modulesDir, {
    recursive,
    encoding: "utf8",
  })
    .filter((filename) => filename.endsWith(".ts") || filename.endsWith(".js"))
    .map((filename) =>
      ResultTask.fromResultAsync(() =>
        ResultAsync.fromPromise<unknown, DiscordBotModuleError>(
          import(path.join(modulesDir, filename)),
          (err) =>
            new DiscordBotModuleError({
              reason: `failed to load module "${filename}".`,
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
            return DiscordBotModuleError.err({
              reason: `module "${filename}" must export default function`,
            });
          }

          return okAsync({
            name: filename,
            f: module.default as DiscordBotModule,
          });
        }),
      ),
    );

  return ResultAsync.fromSafePromise(
    ResultTask.runPromise(ResultTask.all(tasks)),
  ).map((modules) =>
    modules.reduce(
      (p, v) => p.set(v.name, v.f),
      new Collection() satisfies DiscordBotModuleCollection,
    ),
  );
};
