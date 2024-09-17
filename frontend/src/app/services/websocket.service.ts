import { Injectable } from '@angular/core';
import {catchError, map, Observable, retry, tap, throwError} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {CommandFetchValue, CommandSetOrientation, Telemetry} from "./telemetry.domain";
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  //subject = webSocket<Telemetry | CommandFetchValue | CommandSetOrientation>('wss://fsw24.tanneberger.me/websocket');
  subject = webSocket<Telemetry | CommandFetchValue | CommandSetOrientation>('ws://localhost:8080');
  //subject = webSocket<Telemetry | Command>("ws://127.0.0.1:8080")

  public sub(): Observable<Telemetry | CommandFetchValue | CommandSetOrientation> {
    return this.subject;
  }

  public send(command: CommandFetchValue | CommandSetOrientation) {
    this.subject.next(command);
  }
}
