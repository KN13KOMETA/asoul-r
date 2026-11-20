// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import path from "node:path";
import pino, { type LevelWithSilentOrString } from "pino";

const logger = pino();

export const setLoggerLevel = (level: LevelWithSilentOrString) =>
  (logger.level = level);
export const getLoggerLevel = () => logger.level;

export const createFileLogger = (filePath: string) => {
  const relativePath = path.relative(import.meta.dirname, filePath);
  const moduleName = relativePath.slice(0, -path.extname(relativePath).length);

  return logger.child({ module: moduleName });
};
