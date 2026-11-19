// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createTaggedError, ok, type Result } from "resultar";
import type { DiscordCommand } from "@/discord/command.js";

export class InvalidDiscordCommandError extends createTaggedError({
  name: "InvalidDiscordCommandError",
  message: "Invalid Discord Command: $reason",
}) {}

export const validateDiscordCommand = (
  command: unknown,
): Result<DiscordCommand, InvalidDiscordCommandError> => {
  if (typeof command !== "object" || command === null) {
    return InvalidDiscordCommandError.err({
      reason: "command must be a non-null object",
    });
  }
  if (
    !("data" in command) ||
    typeof command.data !== "object" ||
    command.data === null ||
    !("name" in command.data) ||
    typeof command.data.name !== "string" ||
    !("description" in command.data) ||
    typeof command.data?.description !== "string"
  ) {
    return InvalidDiscordCommandError.err({
      reason: "command.data must be valid Slash Command",
    });
  }
  if (!("execute" in command) || typeof command.execute !== "function") {
    return InvalidDiscordCommandError.err({
      reason: "command.execute must be a function",
    });
  }

  return ok(command as DiscordCommand);
};
