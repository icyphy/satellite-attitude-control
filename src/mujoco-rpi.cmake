include_directories(/home/agent-k/mujoco-3.1.1/include)

find_package (Threads)

find_library(MUJOCO_LIBRARY NAMES mujoco HINTS /home/agent-k/mujoco-3.1.1/lib NO_DEFAULT_PATH)
if(NOT MUJOCO_LIBRARY)
  message(FATAL_ERROR "MuJoCo library not found")
endif()

target_link_libraries(${LF_MAIN_TARGET} PUBLIC ${CMAKE_THREAD_LIBS_INIT} ${MUJOCO_LIBRARY})