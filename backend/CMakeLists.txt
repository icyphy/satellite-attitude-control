cmake_minimum_required(VERSION 3.26)
project(backend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(THREADS_PREFER_PTHREAD_FLAG ON)

#set(CMAKE_CXX_FLAGS "-O3 -Wall -Wextra")

include(FindPkgConfig)
include_directories(/usr/local/include)

find_package (Threads REQUIRED)
find_package(nlohmann_json 3.11 REQUIRED)
#find_package(gRPC CONFIG REQUIRED)
#find_package(prometheus-cpp CONFIG REQUIRED)
#find_package(Protobuf REQUIRED)
#pkg_check_modules(CURLPP REQUIRED curlpp)

#target_link_libraries( funnel PRIVATE
#        protobuf::libprotobuf
#        gRPC::grpc++
#        prometheus-cpp::pull
#        ${CURLPP_LDFLAGS}
#        ${PROTOBUF_LIBRARIES}
#)

add_executable(backend
        src/main.cpp
        src/common.cpp
        src/broadcast_server.cpp
        src/broadcast_server.h)

target_link_libraries(backend PUBLIC Threads::Threads nlohmann_json::nlohmann_json)
