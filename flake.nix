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
        bashOptions = ["errexit" "pipefail"];
        text = let
          awkScript = pkgs.writeText "print_comments.awk" ''
            #!/usr/bin/awk -f

            # Prints todo comments in beautiful way
            # Use grep first to get todo comments

            BEGIN {
              FS = ":"

              longest_file = 0
              longest_line = 0
            }

            {
              # Add file name, line and comment into arrays
              file[NR - 1] = $1
              line[NR - 1] = $2
              comm[NR - 1] = $4

              # Set longest file name
              i = length(file[NR - 1])
              if (i > longest_file) longest_file = i;

              # Set longest line
              i = length(line[NR - 1])
              if (i > longest_line) longest_line = i;

              # Remove trailing space at comment start
              sub(/^ /, "", comm[NR - 1])
            }

            END {
              for (i = 0; i < NR; i++)
                printf "%-" longest_file "s:\x1B[36m%*s\x1B[0m: %s\n",
                  file[i], longest_line, line[i], comm[i]
            }
          '';
        in ''
          if [ -z "$1" ]; then
            echo 'Usage: note <word> - show all comments of the form "word: ..."' >&2
            exit 1
          fi

          rg -nH --hidden --no-ignore --ignore-file .noteignore "$1:" |
            awk -f ${awkScript}
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
      };
    });
  };
}
