{ stdenv, pkgs, lib, fetchFromGitHub, reactor-cpp, ... }:
stdenv.mkDerivation {
  name = "alarm-clock";
  version = "0.0.1";

  src = ./..;
  
  depsBuildBuild = with pkgs; [
    pkg-config
  ];

  nativeBuildInputs = with pkgs; [
    meson
    ninja
    pkg-config
    wayland-scanner
    glslang
  ];

  buildInputs = with pkgs; [ 
    which 
    gcc 
    cmake
    git 
    mujoco 
    jdk17_headless 
    freeglut
    xorg.libX11
    xorg.libXext
    xorg.libXcursor
    xorg.xrandr
    xorg.libXrandr
    xorg.libXinerama
    xorg.libXi
    #xorg.xinput
    #xorg.xf86inputvmmouse
    #libGL
    libGLU
    mesa
    wayland
    wayland-protocols
    vulkan-loader
    libxkbcommon
    libdecor
    glfw
    glfw2
    glfw-wayland
  ];

  configurePhase = ''
    echo "Test"
  '';

  buildPhase = ''
    export LD_LIBRARY_PATH="/run/opengl-driver/lib:/run/opengl-driver-32/lib";
    echo "Starting compiling"
    mkdir -p include/reactor-cpp/
    cp -r ${reactor-cpp}/include/reactor-cpp/* include/reactor-cpp/
    ${pkgs.lingua-franca}/bin/lfc --external-runtime-path ${reactor-cpp}/ ./src/MujocoSimulator.lf
  '';

  installPhase = ''
    mkdir -p $out/bin
    cp -r ./bin/* $out/bin
  '';
}

