// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Logger } from "pino";
import { errAsync, okAsync, ResultAsync } from "resultar";
import z from "zod";
import { validateDiscordToken } from "@/validate/discord/token.js";

const zenvBase = {
  DISCORD_BOT_TOKEN: z
    .string()
    .refine(async (v) => (await validateDiscordToken(v)).isOk()),
  DISCORD_APPLICATION_ID: z.string(),
};

const zenv = z.discriminatedUnion("NODE_ENV", [
  z.object({
    NODE_ENV: z.literal("development"),
    DISCORD_GUILD_ID: z.string(),
    ...zenvBase,
  }),
  z.object({
    NODE_ENV: z.literal("production").default("production"),
    ...zenvBase,
  }),
]);
export type Zenv = z.infer<typeof zenv>;

export const parseEnvConfig = (
  env: NodeJS.ProcessEnv,
): ResultAsync<Zenv, z.ZodError<Zenv>> => {
  return ResultAsync.fromSafePromise(zenv.safeParseAsync(env)).andThen((cfg) =>
    cfg.success ? okAsync(cfg.data) : errAsync(cfg.error),
  );
};

export const parseEnvConfigOrExit = async (
  logger: Logger,
  env: NodeJS.ProcessEnv,
): Promise<Zenv> => {
  const cfg = await zenv.safeParseAsync(env);

  if (!cfg.success) {
    logger.error(cfg.error);
    process.exit(1);
  }

  return cfg.data;
};
