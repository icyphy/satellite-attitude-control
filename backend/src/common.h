#ifndef WEBSOCKET_PROXY_COMMON_H
#define WEBSOCKET_PROXY_COMMON_H

#include <stdbool.h>
#include <stdint.h>

typedef struct {
    uint32_t size;
    uint32_t descriptor;
    char* message;
} TcpMessage;

bool has_little_endian();

#define REVERSE_UINT32(n) ((uint32_t) ((((n) & 0xFF) << 24) | \
                                          (((n) & 0xFF00) << 8) | \
                                          (((n) & 0xFF0000) >> 8) | \
                                          (((n) & 0xFF000000) >> 24)))

uint32_t convert_if_necessary(uint32_t value);

uint32_t convert_to_host(uint32_t value);

typedef struct {
    double yaw;
    double pitch;
    double roll;
    double vel_yaw;
    double vel_pitch;
    double vel_roll;
    unsigned long time;
} Telemetry;

typedef struct {
    double yaw;
    double pitch;
    double roll;
    unsigned long time;
} SetPositionCommand;

typedef struct {
    unsigned long amount;
} RequestDataCommand;

typedef struct {
    int client;
    TcpMessage message;
} MessageFromClient;

class Command {
public:
    uint32_t descriptor = 0;
    SetPositionCommand set_position;
};

#endif //WEBSOCKET_PROXY_COMMON_H
