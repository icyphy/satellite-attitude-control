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
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      rec {
        checks = packages;
        packages.backend = nixpkgs.legacyPackages.${system}.callPackage ./pkgs/backend.nix { };
        packages.frontend = nixpkgs.legacyPackages.${system}.callPackage ./pkgs/frontend.nix { 
          mkPnpmPackage = pnpm2nix.packages."${system}".mkPnpmPackage;
        };
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = (with packages.lf-mujoco; buildInputs ++ nativeBuildInputs);
        };
      }
    );
}
