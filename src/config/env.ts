// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import z from "zod";
import { validateDiscordToken } from "@/validate/discord/token.js";

export const zenv = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  DISCORD_BOT_TOKEN: z
    .string()
    .refine(async (v) => (await validateDiscordToken(v)).isOk()),
  DISCORD_APPLICATION_ID: z.string(),
});
