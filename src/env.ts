// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parseEnvConfigOrExit } from "@/config/env.js";
import { createFileLogger } from "@/logger.js";

const flogger = createFileLogger(import.meta.filename);

export const env = await parseEnvConfigOrExit(flogger, process.env);
