// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Result } from "resultar";
import { createTaggedError, ok } from "resultar";

export class DivisionByZeroError extends createTaggedError({
  name: "DivisionByZeroError",
  message: "Cannot divide $a by zero",
}) {}

export function divide(
  a: number,
  b: number,
): Result<number, DivisionByZeroError> {
  if (b === 0) {
    return DivisionByZeroError.err({ a });
  }
  return ok(a / b);
}
