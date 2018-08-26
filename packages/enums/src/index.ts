export enum ServiceStatus {
  START = 0,
  STOP = 1,
  REMOVE = 2
}

export enum ActionTypes {
  DEFAULT = 0,
  SERVER_RECEIVE = 11,
  SERVER_SEND = 12,
  CLIENT_RECEIVE = 21,
  CLIENT_SEND = 22,
  USER_CLICK = 31,
}
