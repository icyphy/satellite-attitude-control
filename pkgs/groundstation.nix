{pkgs, lib, config}: 
pkgs.stdenv.mkDerivation {
  name = "groundstation";
  src = ../.;
}
