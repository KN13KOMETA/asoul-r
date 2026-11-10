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
