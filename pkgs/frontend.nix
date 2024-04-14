{ mkPnpmPackage }:

mkPnpmPackage {
  src = ./../frontend/.;

  installInPlace = true;

  script = "build";

  installPhase = ''
    mkdir -p $out/html
    ls -alh ./dist/
    cp -r ./dist/lf/browser/* $out/html/
  '';
}

