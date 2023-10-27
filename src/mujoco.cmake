find_package (Threads)
find_package (glfw)
find_package (mujoco)

target_link_libraries(${LF_MAIN_TARGET} ${CMAKE_THREAD_LIBS_INIT} mujoco glfw)
