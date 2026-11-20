// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from "node:path";
import pino from "pino";

export const logger = pino();

export const createFileLogger = (filePath: string) =>
  logger.child({
    module: path.basename(
      path.relative(import.meta.dirname, filePath),
      path.extname(filePath),
    ),
  });
