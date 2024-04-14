{ mkPnpmPackage }:

mkPnpmPackage {
  src = ./../frontend/.;

  installInPlace = true;

  script = "build";

  installPhase = ''
    mkdir -p $out/html
    cp -r ./dist/groundstation-gui/browser/* $out/html/
  '';
}

