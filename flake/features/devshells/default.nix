# SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
#
# SPDX-License-Identifier: AGPL-3.0-or-later
_: {
  perSystem = {
    pkgs,
    config,
    ...
  }: {
    devShells.default = pkgs.mkShell {
      packages = with pkgs; [
        git
        config.packages.note

        reuse
        biome
      ];
    };
  };
}
