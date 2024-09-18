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
          packages.lf-frontend-fsw24 = pkgs.callPackage ./pkgs/frontend.nix {
            mkPnpmPackage = pnpm2nix.packages."${system}".mkPnpmPackage;
            src = ./projects/fsw24/frontend/.;
          };
          packages.lf-frontend-tcrs24 = pkgs.callPackage ./pkgs/frontend.nix {
            mkPnpmPackage = pnpm2nix.packages."${system}".mkPnpmPackage;
            src = ./projects/tcrs24/frontend/.;
          };
        })) // {

      overlays.default = (final: prev: {
        lf-frontend-tcrs24 = self.packages."${prev.system}".lf-frontend-tcrs24;
        lf-frontend-fsw24 = self.packages."${prev.system}".lf-frontend-fsw24;
        lf-backend = self.packages."${prev.system}".lf-backend;
      });

      nixosModules = rec {
        backend = import ./nixos-module/backend.nix;
        default = backend;
      };
    };
}
