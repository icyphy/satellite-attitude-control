{
  description = "build script for the lingua-franca alarm clock";

  inputs = {
    utils.url = "github:numtide/flake-utils";
    pnpm2nix = {
      url = "github:nzbr/pnpm2nix-nzbr";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs@{ self, utils, nixpkgs, pnpm2nix, ... }:
    (utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        rec {
          checks = packages;
          packages.lf-backend = pkgs.callPackage ./pkgs/backend.nix { };
          packages.lf-frontend = pkgs.callPackage ./pkgs/frontend.nix {
            mkPnpmPackage = pnpm2nix.packages."${system}".mkPnpmPackage;
          };
        })) // {

      overlays.default = (final: prev: {
        lf-website = self.packages."${prev.system}".lf-website;
        lf-backend = self.packages."${prev.system}".lf-backend;
      });

      nixosModules = rec {
        backend = import ./nixos-module/backend.nix;
        default = backend;
      };
    };
}
