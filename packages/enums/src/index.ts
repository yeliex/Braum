export enum ServiceStatus {
  START = 0,
  STOP = 1,
  REMOVE = 2
}

export enum ActionTypes {
  DEFAULT = 0,
  CLIENT_SEND = 11,
  SERVER_RECEIVE = 12,
  SERVER_SEND = 21,
  CLIENT_RECEIVE = 22,
  USER_CLICK = 31,
}
