
export interface Telemetry {
  yaw: number,
  pitch: number,
  roll: number,
  vel_yaw: number,
  vel_pitch: number,
  vel_roll: number,
  time: number
}

export interface Command {
  yaw: number,
  pitch: number,
  roll: number,
  time: number
}
