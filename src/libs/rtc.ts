const config = {
  iceServers: [
    { 'url': 'stun:127.0.0.1:6120' }
  ],
  iceCandidatePoolSize: 10,
}

export default class GameChannel {
  _rtc = new RTCPeerConnection(config)
  _dataChannel

  constructor(
    room: string
  ) {
    this._dataChannel = this._rtc.createDataChannel(room)

    this._dataChannel.addEventListener('open', () => console.log('Data channel open'))
    this._dataChannel.addEventListener('close', () => console.log('Data channel closed'))
  }

  onEvent<T = any>(eventName: keyof RTCDataChannelEventMap, callback: (ev: Event | MessageEvent<T>) => void) {
    this._dataChannel.addEventListener(eventName, callback)
  }

  send(message: string) {
    console.log('send', message)
    this._dataChannel.send(message)
  }
}
