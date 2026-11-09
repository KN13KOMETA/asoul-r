// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { createTaggedError, errAsync, ResultAsync, ResultTask } from "resultar";
import { validateDiscordCommand } from "@/validate/discord/command.js";

export interface DiscordCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export class DiscordLoadCommandsError extends createTaggedError({
  name: "DiscordLoadCommandsError",
  message: "Discord Load Commands: $reason",
}) {}

export const discordLoadCommands = (
  fullpath: string,
): ResultAsync<DiscordCommand[], DiscordLoadCommandsError> => {
  if (!existsSync(fullpath) || !statSync(fullpath).isDirectory()) {
    return errAsync(
      new DiscordLoadCommandsError({
        reason: "path does not exists or not a directory",
      }),
    );
  }

  const tasks = readdirSync(fullpath)
    .filter((filename) => filename.endsWith(".ts") || filename.endsWith(".js"))
    .map((filename) =>
      ResultTask.fromResultAsync(() =>
        ResultAsync.fromPromise<unknown, DiscordLoadCommandsError>(
          import(path.join(fullpath, filename)),
          (err) =>
            new DiscordLoadCommandsError({
              reason: `failed to load module "${filename}".`,
              cause: err,
            }),
        ).andThen((module) => {
          if (
            !(
              typeof module === "object" &&
              module !== null &&
              "default" in module
            )
          ) {
            return DiscordLoadCommandsError.err({
              reason: `module "${filename}" must export default`,
            });
          }

          return validateDiscordCommand(module.default).mapErr(
            (err) =>
              new DiscordLoadCommandsError({
                reason: `failed to validate command "${filename}"`,
                cause: err,
              }),
          );
        }),
      ),
    );

  return ResultAsync.fromSafePromise(
    ResultTask.runPromise(ResultTask.all(tasks)),
  );
};
