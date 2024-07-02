# Satellite Attitude Control (Reaction Wheel) using Lingua Franca

**Contact:** <tassilo.tanneberger@tu-dresden.de> <shaokai@berkeley.edu>

This uses the mujoco simulator to demonstrate the static scheduler.

### Installation

1. Install [Lingua Franca](https://github.com/lf-lang/lingua-franca). Make sure
   to switch to the `static-schedule` branch first.
    ```
    $ git clone git@github.com:lf-lang/lingua-franca.git
    $ cd lingua-franca
    $ git checkout static-schedule
    $ git submodule update --init --recursive
    $ ./gradlew assemble
    ```

2. Install
   [MuJoCo](https://mujoco.org).

    Make sure that the MuJoCo dynamic libraries and header files are in the
    compiler search path (e.g., `usr/local/lib` and `usr/local/include`). This
    step can be done if you follow the [build from source
    instructions](https://mujoco.readthedocs.io/en/3.1.1/programming/index.html#building-from-source).

3. Install [GLFW](https://www.glfw.org).
    
4. Adjust `src/mujoco.cmake` accordingly.

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

5. Compile the LF program using `lfc-dev`.
    ```
    lfc-dev src/ReactionWheel.lf
    ```

### Using Mocasin to Improve Execution Time and Energy

The following instructions describe the steps to compile and execute
`src/CompressFiles.lf` such that execution time and energy are enhanced under
the guidance of Mocasin.

1. Make sure Lingua Franca is installed (as described above) and switched to the
   `static-schedule` branch. 

2. Install [Mocasin](https://github.com/tud-ccc/mocasin)

3. In `src/CompressFiles.lf`, under the `scheduler` target property, make sure
   that `type` is set to `STATIC` and `static-scheduler` is set to `MOCASIN`. DO
   NOT set `mocasin-mapping` yet.
    ```LF
    scheduler: {
        type: STATIC,
        static-scheduler: MOCASIN,
        // mocasin-mapping: [
        //     "./mappings/mappings-opt-0.csv",
        //     "./mappings/mappings-subopt-1.csv",
        //     "./mappings/mappings-opt-2.csv",
        // ],
    },
    ```

4. Compile the program using `lfc-dev`.
    ```
    $ lfc-dev src/CompressFiles.lf
    ```
    If everything goes well, you should see
    ```
    --- Generating a static schedule
    lfc: info: SDF3 files generated. Please invoke `mocasin` to generate mappings and provide paths to them using the `mocasin-mapping` target property under `scheduler`. A sample mocasin command is `mocasin pareto_front graph=sdf3_reader trace=sdf3_reader platform=odroid sdf3.file=<abs_path_to_xml>`
    ```

5. Invoke `mocasin` to generate mappings. 
    In `src-gen/CompressFiles/mocasin/`, there should now be some XML files
    generated.
    ```
    $ cd src-gen/CompressFiles/mocasin/
    $ mocasin pareto_front graph=sdf3_reader trace=sdf3_reader platform=odroid sdf3.file=./sdf_frag_0.xml
    $ mocasin pareto_front graph=sdf3_reader trace=sdf3_reader platform=odroid sdf3.file=./sdf_frag_1.xml
    $ mocasin pareto_front graph=sdf3_reader trace=sdf3_reader platform=odroid sdf3.file=./sdf_frag_2.xml
    ```
    There should now be an `output/` directory under
    `src-gen/CompressFiles/mocasin/` with three `mappings.csv` inside.

6. Choose the best mapping.
    Open each `mappings.csv`, select your desired mapping by moving it to the
    first row, under the column headers.

7. Register the mappings in the LF program.
    Now, open `src/CompressFiles.lf` again and set the paths of the modified
    `mappings.csv` files under `mocasin-mapping`, for example:
    ```LF
    scheduler: {
        type: STATIC,
        static-scheduler: MOCASIN,
        mocasin-mapping: [
            "./mappings/mappings-opt-0.csv",
            "./mappings/mappings-subopt-1.csv",
            "./mappings/mappings-opt-2.csv",
        ],
    },
    ```

8. Invoke `lfc-dev` again.
    ```
    $ lfc-dev src/CompressFiles.lf
    ```
    If everything goes well, you should see the following
    ```
    [100%] Built target CompressFiles
    Install the project...
    -- Install configuration: "Debug"
    lfc: info: Compiled binary is in <path-to-satellite-altitude-control>/bin
    lfc: info: Code generation finished.
    ```

9. (Tricky) Identify which core a worker maps to.
    Open `src-gen/CompressFiles/graphs/dag_partitioned_frag_1.dot` (preferably
    visualize it using Graphviz) and see where each reaction is mapped. There
    should be a worker label within each reaction node. Also open the 2nd
    modified mapping (in the example, `./mappings/mappings-subopt-1.csv`, since
    it describes the periodic phase). In the mapping, see which core the
    reactions assigned to the same worker runs on. For example, if reaction A
    and B are both assigned to worker 0 in the dot file, and in the mapping CSV,
    both mapped to core 7, then we need to remember this mapping (A, B => Core
    7) for the later pinning step.

10. Now follow the instructions below to pin the workers to the right cores.

### Isolating CPUs and Pinning Threads on ODROID-XU4
Author: @axmmisaka

The following steps were taken:

## Isolating CPUs
1. Modify `boot.ini` in the first partition in the SD card. In `bootargs` add `isolcpus=2,3,4,5,6,7,8`. Note that CPU0 cannot be isolated. Verify by checking `cat /sys/devices/system/cpu/isolated`.
2. Modify `/etc/systemd/system.conf`, make sure `CPUAffinity=0 1`.
3. Note: Core 0-3 are little cores (Cortex-A7) and core 4-7 are big cores (Cortex-A15).

## Pinning Threads
Note that 
1. this ONLY work if the POSIX threading implementation is used. 
2. this is a non-portable solution and ONLY works with GCC.

1. Generate source by running the source generator.
2. Modify `src-gen/ProjectName/core/threaded/reactor_threaded.c`, as follows:
```diff
>   // Again, this assumes the use of glibc POSIX threads. This adds the utilities needed.
>   #define _GNU_SOURCE
    #include <assert.h>
    #include <signal.h>
    #include <string.h>
    #include <time.h>
>   #include <sched.h>
>   #include <pthread.h>
>   #include <unistd.h>
```
This pins worker threads to one or more cores:
```diff
    void* worker(void* arg) {
      environment_t *env = (environment_t* ) arg;

      assert(env != GLOBAL_ENVIRONMENT);

      lf_mutex_lock(&env->mutex);
      int worker_number = worker_thread_count++;
      LF_PRINT_LOG("Worker thread %d started.", worker_number);
973,992d968
>     cpu_set_t cpuset; CPU_ZERO(&cpuset);
>     CPU_SET(worker_number + 2 /* Or whichever core you want to use*/ , &cpuset);
>     /* You can also pin the thread to multiple cores, by adding more cores to the set.
>         CPU_SET(worker_number + 3 , &cpuset);
>     */
> 
>     pthread_t current_thread = pthread_self();
>     int rv = pthread_setaffinity_np(current_thread, sizeof(cpu_set_t), &cpuset);
> 
>     /* The following code could be used to verify which cores is the thread using. 
>         CPU_ZERO(&cpuset);
>         int aff = pthread_getaffinity_np(current_thread, sizeof(cpu_set_t), &cpuset);
>     */
> 
>     printf("I am worker thread %d using ", worker_number);
>     for (size_t j = 0; j < CPU_SETSIZE; ++j){ if (CPU_ISSET(j, &cpuset)) { printf(" %zu", j); }}
>     printf("\n");
>     lf_mutex_unlock(&env->mutex);
>     
```
And you can do similar things in `lf_reactor_c_main()` to pin the "main" thread.

3. After you finish, remake and run the executable.