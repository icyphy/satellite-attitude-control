{stdenv, lib, pkg-config, cmake, openssl, websocketpp, asio}:
stdenv.mkDerivation {
  pname = "backend";
  version = "0.1.0";

  src = ./../backend/.;
  
  #phases = [ "unpackPhase" "buildPhase" "installPhase" ];

  buildPhase = ''
      cmake .
      make
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp backend $out/bin/
  '';

  nativeBuildInputs = [ pkg-config cmake];

  buildInputs = [ openssl websocketpp asio ];
}
