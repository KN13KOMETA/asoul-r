# SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
#
# SPDX-License-Identifier: AGPL-3.0-or-later
_: {
  perSystem = {pkgs, ...}: {
    packages.pnpm = pkgs.writeShellApplication {
      name = "pnpm";
      runtimeInputs = [pkgs.corepack];
      text = ''
        exec corepack pnpm "$@"
      '';
    };
  };
}
