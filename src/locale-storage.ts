// SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AsyncLocalStorage } from "node:async_hooks";
import {
  baseLocale,
  isLocale,
  overwriteGetLocale,
} from "@/paraglide/runtime.js";

export class LocaleStorage extends AsyncLocalStorage<string> {
  constructor() {
    super();

    // TODO: Look into defineCustomClientStrategy
    overwriteGetLocale(() => {
      let locale = this.getStore();

      if (typeof locale !== "string") return baseLocale;

      if (!isLocale(locale)) locale = locale.split("-")[0];
      if (!isLocale(locale)) return baseLocale;

      return locale;
    });
  }
}
