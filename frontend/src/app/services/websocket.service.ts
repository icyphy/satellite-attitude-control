import { Injectable } from '@angular/core';
import {catchError, map, Observable, retry, tap, throwError} from "rxjs";
import {webSocket} from "rxjs/webSocket";
import {Telemetry} from "./telemetry.domain";
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {

  public sub(): Observable<Telemetry> {
    // return webSocket<Telemetry>("wss://lf.tanneberger.me/websocket")
    return webSocket<Telemetry>("ws://127.0.0.1:8080")
  }
}
