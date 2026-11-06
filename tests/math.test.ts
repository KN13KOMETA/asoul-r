// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, test } from "vitest";
import { divide } from "@/math.js";

describe("math/divide", () => {
  test("divides", () => {
    expect(divide(2, 1).isOk()).toBe(true);
    expect(divide(4, 2).isOk()).toBe(true);
  });

  test("does not divides by zero", () => {
    expect(divide(2, 0).isErr()).toBe(true);
  });
});
