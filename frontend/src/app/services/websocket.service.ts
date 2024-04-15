import { Injectable } from '@angular/core';
import {catchError, map, Observable, retry, tap, throwError} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {Command, Telemetry} from "./telemetry.domain";
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  //subject = webSocket<Telemetry | Command>('ws://localhost:8080');
  subject = webSocket<Telemetry | Command>('wss://lf.tanneberger.me/websocket');
  //subject = webSocket<Telemetry | Command>("ws://127.0.0.1:8080")

  public sub(): Observable<Telemetry | Command> {
    return this.subject;
  }

  public send(command: Command) {
    this.subject.next(command);
  }
}
