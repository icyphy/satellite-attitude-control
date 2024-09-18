
export interface Telemetry {
  yaw: number,
  pitch: number,
  roll: number,
  vel_yaw: number,
  vel_pitch: number,
  vel_roll: number,
  time: number
}

export interface CommandSetOrientation {
  descriptor: number,
  yaw: number,
  pitch: number,
  roll: number,
}

export interface CommandFetchValue {
  descriptor: number,
  amount: number
}

export interface UserInteraction {
  username: string
}
