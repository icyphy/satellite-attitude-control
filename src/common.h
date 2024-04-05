#pragma once

#ifndef COMMON_H
#define COMMON_H

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

typedef struct {
    double angular_momentum;
    double angle;
    unsigned long time;
} Telemetry;

typedef struct {
    int client;
    TcpMessage message;
} MessageFromClient;


#endif //COMMON_H