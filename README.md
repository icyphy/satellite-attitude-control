# Satellite Altitude Control (Reaction Wheel) using Lingua Franca

**Contact:** <tassilo.tanneberger@tu-dresden.de> <shaokai@berkeley.edu>

This uses the mujoco simulator to demonstrate the static scheduler.

### Installation

1. Install
   [MuJoCo](https://mujoco.org).

    Make sure that the MuJoCo dynamic libraries and header files are in the
    compiler search path (e.g., `usr/local/lib` and `usr/local/include`). This
    step can be done if you follow the [build from source
    instructions](https://mujoco.readthedocs.io/en/3.1.1/programming/index.html#building-from-source).

2. Install [GLFW](https://www.glfw.org).
    
3. Adjust `src/mujoco.cmake` accordingly.

    On some platforms, you might need to adjust this cmake file so that the
    dependencies can be located.

    For example, here is one possible version
    ```
    # My mujoco/mujoco.h is in /usr/local/include.
    include_directories(/usr/local/include)

    find_package (Threads)

    find_library(MUJOCO_LIBRARY NAMES mujoco PATHS /usr/local/lib/libmujoco.dylib /usr/local/lib/libmujoco.3.1.1.dylib)
    if(NOT MUJOCO_LIBRARY)
    message(FATAL_ERROR "MuJoCo library not found")
    endif()

    find_library(GLFW_LIBRARY NAMES glfw PATHS /usr/local/Cellar/glfw/3.3.9/lib/libglfw.dylib /usr/local/Cellar/glfw/3.3.9/lib/libglfw.3.dylib /usr/local/Cellar/glfw/3.3.9/lib/libglfw.3.3.dylib)
    if(NOT GLFW_LIBRARY)
    message(FATAL_ERROR "Glfw library not found")
    endif()

    target_link_libraries(${LF_MAIN_TARGET} ${CMAKE_THREAD_LIBS_INIT} ${MUJOCO_LIBRARY} ${GLFW_LIBRARY})
    ```

4. Compile the LF program using `lfc-dev`.
    ```
    lfc-dev src/ReactionWheel.lf
    ```
