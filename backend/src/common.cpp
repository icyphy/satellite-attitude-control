#include "common.h"

bool has_little_endian() {
    unsigned int x = 1;
    char *c = (char*) &x;
    if ((int)*c == 1) {
        return true;
    }
    return false;
};

uint32_t convert_if_necessary(uint32_t value) {
    if (has_little_endian()) {
        return REVERSE_UINT32(value);
    }
    return value;
};
