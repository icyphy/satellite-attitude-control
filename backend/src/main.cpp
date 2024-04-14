#include <iostream>
#include <assert.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <cstdint>
#include <cstring>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <fcntl.h>
#include <optional>
#include <algorithm>

#include <vector>
#include <mutex>
#include <thread>

#include "common.h"
#include "broadcast_server.h"

class TcpServer {
private:
    int socket_ = 0;
    int current_client_ = 0;
    short port_ = 31812;
    const char* host_ = "0.0.0.0";

public:
    TcpServer() {
        struct sockaddr_in serv_addr;

        if ((socket_ = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
            std::cerr << "Socket creation error" << std::endl;
            exit(1);
        }

        // configure the socket to be non-blocking
        //fcntl(self->fd, F_SETFL, fcntl(self->fd, F_GETFL) | O_NONBLOCK);

        serv_addr.sin_family = AF_INET;
        serv_addr.sin_port = htons(port_);

        // turn human readable address into something the os can work with
        if (inet_pton(AF_INET, host_, &serv_addr.sin_addr) <= 0) {
            std::cerr << "Invalid address/ Address not supported" << std::endl;
            exit(1);
        }

        // bind the socket to that address
        if (bind(socket_, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0) {
            std::cerr << "Bind Failed" << std::endl;
            exit(1);
        }

        // start listening
        if (listen(socket_, 1) < 0) {
            std::cerr << "Listen Failed" << std::endl;
            exit(1);
        }
    }
    ~TcpServer() = default;
    void client_accept() {
        struct sockaddr_in address;
        socklen_t addrlen = sizeof(address);

        if ((current_client_ = accept(socket_, (struct sockaddr*)&address, &addrlen)) > 0) {
            std::cout << "accepted new connection id: %i sock: %i" << std::endl;
        } else {
            std::cerr << "failed ot accept new connection" << std::endl;
            //exit(EXIT_FAILURE);
        }
    }
    [[nodiscard]] auto receive() const -> std::optional<TcpMessage> {
        const size_t BUFFER_SIZE = 4096;
        char* data = static_cast<char *>(malloc(BUFFER_SIZE));
        uint32_t size, descriptor;
        int bytes_read;
        struct timeval timeout;
        timeout.tv_sec = 0;
        timeout.tv_usec = 1000;

        //int rv = select(client, &self->set, NULL, NULL, &timeout);

        /*if(rv == -1) {
            lf_print("error occured!");
            return;
        }

        if(rv == 0) {
            lf_print("timeout occured!");
            return;
        }*/

        if (read(current_client_, &size, sizeof(uint32_t)) > 4) {
            // problem less then 4 bytes read
            return std::nullopt;
        };

        size = convert_if_necessary(size);

        if (read(current_client_, &descriptor, sizeof(uint32_t)) > 4) {
            // problem less then 4 bytes read
            return std::nullopt;
        };

        descriptor = convert_if_necessary(descriptor);
        if (size >= BUFFER_SIZE) {
            std::cerr << "Invalid Size Received" << std::endl;
            return std::nullopt;
        }

        bytes_read = read(current_client_, data, size) < 0;
        if (bytes_read) {
            // problem returned -1
            return std::nullopt;
        };

        std::cout << "message with size %i and descriptor %i" << std::endl;

        assert(bytes_read != size); // missmatching amount of bytes read from what has been specified

        TcpMessage message;

        message.size = size;
        message.descriptor = descriptor;
        message.message = data;

        return std::optional<TcpMessage>{message};
    }
};

auto convert_to_telemetry(TcpMessage message) -> Telemetry  {
    Telemetry telemetry;

    if (message.size < sizeof(telemetry)) {
        std::cerr << "messages do not fit size:" << message.size << "/" << sizeof(telemetry) << std::endl;
    }

    memcpy(&telemetry, message.message, sizeof(Telemetry));
    return telemetry;
}

auto convert_telemetry_to_json(Telemetry telemetry) -> std::string {
    double yaw = telemetry.yaw;
    double pitch = telemetry.pitch;
    double roll = telemetry.roll;
    double vel_yaw = telemetry.vel_yaw;
    double vel_pitch = telemetry.vel_pitch;
    double vel_roll = telemetry.vel_roll;
    unsigned long time = telemetry.time;

    //lf_print("telemetry angle: %lf angular velocity: %lf time: %ld", angle, angular_momentum, time);

    char* message = static_cast<char *>(malloc(300));
    int size = sprintf(message, R"({"yaw": %lf, "pitch": %lf, "roll": %li, "vel_yaw": %lf, "vel_pitch": %lf, "vel_roll": %lf})",
                       yaw, pitch, roll, vel_yaw, vel_pitch, vel_roll, time);

    std::cout << "json: " << message << std::endl;

    return std::string(message, size);
}

int main() {
    std::cout << "Hello, World!" << std::endl;
    TcpServer server{};
    BroadcastServer websocket{};
    auto thread = std::thread([ObjectPtr = &websocket]() {
        ObjectPtr->run(8080);
    });
    auto active_listener_ = std::thread([ObjectPtr = &websocket] {
        ObjectPtr->process_messages();
    });
    while (true) {
        server.client_accept();

        while (true) {
            std::optional<TcpMessage> message = server.receive();
            if (!message.has_value()) {
                break;
            }

            Telemetry telemetry = convert_to_telemetry(message.value());
            std::string json_string = convert_telemetry_to_json(telemetry);
            websocket.send_message(json_string);
        }
    }
}
