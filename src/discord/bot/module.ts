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
import { createFileLogger } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);

export class DiscordBotModuleError extends createTaggedError({
  name: "DiscordBotError",
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

  flogger.debug({ modulesDir });

  const getTasksRecursive = (dir: string) =>
    readdirSync(dir).flatMap(
      (
        p,
      ): ResultTask<
        { name: string; f: DiscordBotModule },
        DiscordBotModuleError
      >[] => {
        const pfull = path.join(dir, p);
        flogger.debug({ pfull });
        if (statSync(pfull).isDirectory()) return getTasksRecursive(pfull);

        if (!p.endsWith(".ts") && !p.endsWith(".js")) return [];

        return [
          ResultTask.fromResultAsync(() =>
            ResultAsync.fromPromise<unknown, DiscordBotModuleError>(
              import(pfull),
              (err) =>
                new DiscordBotModuleError({
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
                return DiscordBotModuleError.err({
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
                f: module.default as DiscordBotModule,
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
      new Collection() satisfies DiscordBotModuleCollection,
    ),
  );
};
