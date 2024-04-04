
typedef struct {
    uint32_t size;
    uint32_t descriptor;
    char* message;
} TcpMessage;

inline bool has_little_endian() {
  unsigned int x = 1;
  char *c = (char*) &x;
  if ((int)*c == 1) {
    return true;
  }
  return false;
};

#define REVERSE_UINT32(n) ((uint32_t) ((((n) & 0xFF) << 24) | \
                                          (((n) & 0xFF00) << 8) | \
                                          (((n) & 0xFF0000) >> 8) | \
                                          (((n) & 0xFF000000) >> 24)))

uint32_t convert_if_necessary(uint32_t value) {
    if (has_little_endian()) {
        return REVERSE_UINT32(value);
    }
    return value;
};

