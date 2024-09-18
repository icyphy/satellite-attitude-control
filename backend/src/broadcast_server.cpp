#ifndef FUNNEL_BROADCAST_SERVER_CPP
#define FUNNEL_BROADCAST_SERVER_CPP

#include "./broadcast_server.h"

#include <utility>
#include <vector>
#include <memory>
#include <iostream>
#include <algorithm>

#include <nlohmann/json.hpp>

BroadcastServer::BroadcastServer() noexcept {
    // setting the state of the broadcast_server to active
    kill_.store(false);

    // Initialize Asio Transport
    server_.init_asio();

    // Register handler callbacks
    server_.set_open_handler([this](auto &&PH1) { on_open(std::forward<decltype(PH1)>(PH1)); });
    server_.set_close_handler([this](auto &&PH1) { on_close(std::forward<decltype(PH1)>(PH1)); });
    server_.set_message_handler([this](auto &&PH1, auto &&PH2) {
        on_message(std::forward<decltype(PH1)>(PH1), std::forward<decltype(PH2)>(PH2));
    });

}

BroadcastServer::~BroadcastServer() noexcept {
    server_.reset();
}

void BroadcastServer::run(uint16_t port) noexcept {
    server_.listen(port);
    server_.start_accept();

    try {
        std::cout << "running server!" << std::endl;
        server_.run();
    } catch (const std::exception &e) {
        std::cout << e.what() << std::endl;
    }
}

void BroadcastServer::on_open(connection_hdl hdl) noexcept {
    {
        std::lock_guard<std::mutex> guard(action_lock_);
        actions_.push(action(SUBSCRIBE, std::move(hdl)));
    }
    action_condition_.notify_one();
}

void BroadcastServer::on_close(connection_hdl hdl) noexcept {
    {
        std::lock_guard<std::mutex> guard(action_lock_);
        actions_.push(action(UNSUBSCRIBE, std::move(hdl)));
    }
    action_condition_.notify_one();
}

void BroadcastServer::on_message(connection_hdl hdl, server::message_ptr msg) noexcept {
    // queue message up for sending by processing thread
    {
        std::lock_guard<std::mutex> guard(action_lock_);
        actions_.push(action(MESSAGE, std::move(hdl), std::move(msg)));
    }
    action_condition_.notify_one();
}

void BroadcastServer::process_messages() noexcept {
    while (not kill_) {
        std::unique_lock<std::mutex> lock(action_lock_);

        while (actions_.empty()) {
            action_condition_.wait(lock);
        }

        action a = actions_.front();
        actions_.pop();

        lock.unlock();

        if (a.type == SUBSCRIBE) {
            std::lock_guard<std::mutex> guard(connection_lock_);

            // add new connection to connection pool
            connections_.emplace_back(std::move(a.hdl));

            // execute the ReactionWheel Program with configurable ID
            // Save the connection with the ReactionWheel ID
            // When you Receive something from ReactionWheel with ID x you can proxy it to the corresponding websocket connection
            // and vice versa

        } else if (a.type == UNSUBSCRIBE) {
            std::lock_guard<std::mutex> guard(connection_lock_);

            const auto pos = std::find_if(connections_.begin(), connections_.end(), [&a](const Connection &ptr1) {
                return ptr1.hdl_.lock().get() == ((const std::weak_ptr<void> &) a.hdl).lock().get();
            });

            auto index = pos - std::begin(connections_);

            // after successfully searching the connection we remove it from the connection pool
            connections_.erase(std::begin(connections_) + index);

        } else if (a.type == MESSAGE) {
            std::string message = a.msg->get_payload();
            std::cout << "received: " << message << std::endl;
            auto result = nlohmann::json::parse(message);


            if (result.contains("descriptor")) {
                const auto conn = std::find_if(connections_.begin(), connections_.end(), [&a](const Connection &ptr1) {
                    return ptr1.hdl_.lock().get() == ((const std::weak_ptr<void> &) a.hdl).lock().get();
                });
                std::string message = R"({"username": ")" + conn->name_ + "\"}";
                this->send_message(message);
                if (result["descriptor"] == 0 && result.contains("yaw") && result.contains("pitch") && result.contains("roll")) {
                    auto* command_body = new SetPositionCommand[1];
                    command_body->yaw = result["yaw"];
                    command_body->pitch = result["pitch"];
                    command_body->roll = result["roll"];

                    Command command;
                    command.descriptor = 0;
                    command.set_position = command_body;

                    std::lock_guard<std::mutex> command_lock(command_lock_);
                    received_commands_.insert(received_commands_.begin(), command);
                } else if (result["descriptor"] == 1) {
                    auto* command_body = new RequestDataCommand[1];
                    command_body->amount = result["amount"];

                    Command command;
                    command.descriptor = 1;
                    command.request_data = command_body;

                    std::lock_guard<std::mutex> command_lock(command_lock_);
                    received_commands_.insert(received_commands_.begin(), command);
                } else {
                    std::cout << "user didn't specify all necessary values" << std::endl;
                };
            }
        } else {
            // undefined.
        }
    }
}

void BroadcastServer::send_message(const std::string &message) noexcept {
    // lock connection list and yeet the waypoint to all peers
    {
        std::lock_guard<std::mutex> guard(connection_lock_);
        std::cout <<"size(con):" << connections_.size() << "send:" << message << std::endl;
        //connection_list::iterator it;

        // we only send it to the connection with corresponding session id and not all connections

        for (auto &connection: connections_) {
            server_.send(connection.hdl_, message, websocketpp::frame::opcode::TEXT);
        }
    }
}

void BroadcastServer::kill() noexcept {
    kill_.store(true);
}

auto BroadcastServer::get_command() -> std::optional<Command> {
    std::lock_guard<std::mutex> lock(command_lock_);
    std::cout << "command queue:" << received_commands_.size() << std::endl;

    if (received_commands_.empty()) {
        return std::nullopt;
    } else {
        auto value = *received_commands_.end();
        received_commands_.pop_back();
        return value;
    }
}


#endif //FUNNEL_BROADCAST_SERVER_CPP
