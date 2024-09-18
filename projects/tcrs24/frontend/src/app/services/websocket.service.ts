import { Injectable } from '@angular/core';
import {catchError, map, Observable, retry, tap, throwError} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {CommandFetchValue, CommandSetOrientation, Telemetry, UserInteraction} from "./telemetry.domain";
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  //subject = webSocket<Telemetry | CommandFetchValue | CommandSetOrientation | UserInteraction>('ws://localhost:8080');
  subject = webSocket<Telemetry | CommandFetchValue | CommandSetOrientation | UserInteraction>('wss://tcrs24.tanneberger.me/websocket');

  public sub(): Observable<Telemetry | CommandFetchValue | CommandSetOrientation | UserInteraction> {
    return this.subject;
  }

  public send(command: CommandFetchValue | CommandSetOrientation) {
    this.subject.next(command);
  }
}
