{
  description = "Development Enviroment";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.zst";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    systems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forAllSystems = f: nixpkgs.lib.genAttrs systems (system: f nixpkgs.legacyPackages.${system});
  in {
    packages = forAllSystems (pkgs: {
      dk-pnpm = pkgs.writeShellApplication {
        name = "pnpm";
        runtimeInputs = [pkgs.corepack];
        text = ''
          exec corepack pnpm "$@"
        '';
      };
      dk-note = pkgs.writeShellApplication {
        name = "note";
        runtimeInputs = [pkgs.ripgrep pkgs.gawk];
        text = ''
          rg -nH --hidden --no-ignore --ignore-file .noteignore "$1:" |
            awk -f scripts/print_comments.awk
        '';
      };
    });

    devShells = forAllSystems (pkgs: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          git
          self.packages.${pkgs.stdenv.hostPlatform.system}.dk-note

          nodejs
          self.packages.${pkgs.stdenv.hostPlatform.system}.dk-pnpm

          reuse
          biome
        ];

        shellHook = ''
          pnpm i --frozen-lockfile
        '';
      };
    });
  };
}
