// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { REST, Routes } from "discord.js";
import { createTaggedError, ResultAsync } from "resultar";

export class InvalidDiscordTokenError extends createTaggedError({
  name: "InvalidDiscordTokenError",
  message: "Provided Discord token is invalid",
}) {}

export const validateDiscordToken = (
  token: string,
): ResultAsync<null, InvalidDiscordTokenError> => {
  const rest = new REST({ version: "10" }).setToken(token);
  const promise = rest.get(Routes.user("@me")).then(() => null);

  return ResultAsync.fromPromise(promise, () => new InvalidDiscordTokenError());
};
