# SPDX-FileCopyrightText: 2026 KN13KOMETA <kn13kometa@gmail.com>
#
# SPDX-License-Identifier: AGPL-3.0-or-later
{
  description = "Development Enviroment";

  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.zst";
    import-tree.url = "github:vic/import-tree";
    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake {inherit inputs;} (inputs.import-tree ./flake);
}
