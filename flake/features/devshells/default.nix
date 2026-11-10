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

        nodejs
        config.packages.pnpm

        reuse
        biome
      ];
    };
  };
}
