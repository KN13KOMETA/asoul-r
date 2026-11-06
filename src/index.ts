// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import pino from "pino";
import { divide } from "@/math.js";

const logger = pino();

logger.info("Check github actions");

const res = divide(10, 2);

res.match(
  (v) => logger.info(`Value is ${v}`),
  (e) => logger.error(e),
);
