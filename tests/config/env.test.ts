// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { zenv } from "@/config/env.js";

describe("zenv", () => {
  test("error", () => {
    expect(zenv.safeParse({}).success).toBe(false);
  });

  test("valid", () => {
    expect(
      zenv.safeParse({ DISCORD_BOT_TOKEN: "z", DISCORD_APPLICATION_ID: "z" })
        .success,
    ).toBe(true);
  });
});
