# SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
#
# SPDX-License-Identifier: AGPL-3.0-or-later
_: {
  perSystem = {
    pkgs,
    config,
    ...
  }: {
    devShells.dev = pkgs.mkShell {
      inputsFrom = [config.devShells.default];

      packages = with pkgs; [
        nodejs
        config.packages.pnpm
      ];

      shellHook = ''
        if [ -d node_modules/.bin ]; then
          rm -f node_modules/.bin/node
          ln -sf $(which node) node_modules/.bin/node
        fi

        export PNPM_HOME="$NIX_BUILD_TOP/.pnpm-home"

        pnpm i --frozen-lockfile
      '';
    };
  };
}
