// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import pino from "pino";
import { divide } from "@/math.js";
import { m } from "./paraglide/messages.js";

const logger = pino({
  level: process.env["NODE_ENV"] === "dev" ? "debug" : "info",
});

logger.info(`Logger level is set to ${logger.level}`);

logger.info("Check github actions");

logger.info(m.example_message({ username: "Username" }));

const res = divide(10, 2);

res.match(
  (v) => logger.info(`Value is ${v}`),
  (e) => logger.error(e),
);
