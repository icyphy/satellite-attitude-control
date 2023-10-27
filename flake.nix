{
  description = "build script for the lingua-franca alarm clock";

  inputs = {
    utils.url = "github:numtide/flake-utils";
    reactor-cpp.url = "github:lf-lang/reactor-cpp";
  };

  outputs = inputs@{ self, utils, nixpkgs, reactor-cpp, ... }:
    utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      rec {
        checks = packages;
        packages.lf-mujoco = nixpkgs.legacyPackages.${system}.callPackage ./derivation.nix {
          reactor-cpp = reactor-cpp.packages."${system}".reactor-cpp;
        };
        packages.default = nixpkgs.legacyPackages.${system}.callPackage ./derivation.nix {
          reactor-cpp = reactor-cpp.packages."${system}".reactor-cpp;
        };
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = (with packages.lf-mujoco; buildInputs ++ nativeBuildInputs);
        };
      }
    );
}
