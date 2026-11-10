_: {
  perSystem = {
    pkgs,
    config,
    ...
  }: {
    devShells.dev = pkgs.mkShell {
      inputsFrom = [config.devShells.default];

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
