import { MitronPeer } from './call-dash.domain';
import { SignalingService, SignalMessage } from './../shared/signaling.service';
import { Component, OnInit, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import SimplePeer from 'simple-peer';

@Component({
  selector: 'app-call-dash',
  templateUrl: './call-dash.component.html',
  styleUrls: ['./call-dash.component.scss']
})
export class CallDashComponent implements OnInit {

  roomName: string = '';
  mitronPeers: Array<MitronPeer> = new Array();

  @ViewChild('myVideo') myVideo: ElementRef<HTMLVideoElement> | any;

  @ViewChildren('peerVideo') peerVideos: QueryList<ElementRef<HTMLVideoElement>> | any;

  constructor(
    private signalingService: SignalingService,
    private actRt: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.roomName = this.actRt.snapshot.queryParams['roomName']

    navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 }, audio: true })
      .then(stream => {

        this.myVideo.nativeElement.srcObject = stream
        this.myVideo.nativeElement.play()

        this.signalingService.connect()

        this.signalingService.onConnect(() => {

          console.log(`My Socket Id ${this.signalingService.socketId}`)

          this.signalingService.requestForJoiningRoom({ roomName: this.roomName })

          this.signalingService.onRoomParticipants((participants: any) => {
            console.log(`${this.signalingService.socketId} - On Room Participants`)
            console.log(participants)

            //this.signalingService.sendOfferSignal({ signalData: { type: 'offer', sdp: 'kldjfdfkgjdkjk' }, callerId: this.signalingService.socketId, calleeId: participants.find(id => id != this.signalingService.socketId) })
            this.initilizePeersAsCaller(participants, stream)
          })

          this.signalingService.onOffer((msg: any) => {
            this.initilizePeersAsCallee(msg, stream)
          })

          this.signalingService.onAnswer((msg: any) => {
            console.log(`${this.signalingService.socketId} - You got Answer from ${msg.calleeId}`)
            const mitronPeer: any = this.mitronPeers.find((mitronPeer: any) => mitronPeer.peerId === msg.calleeId)
            mitronPeer.peer.signal(msg.signalData)
          })

          this.signalingService.onRoomLeft((socketId: any) => {
            this.mitronPeers = this.mitronPeers.filter(mitronPeer => socketId != mitronPeer.peerId)
          })
        })
      })
      .catch(err => {
        console.log(err)
      });
  }

  initilizePeersAsCaller(participants: Array<string>, stream: MediaStream) {
    const participantsExcludingMe = participants.filter(id => id != this.signalingService.socketId)
    participantsExcludingMe.forEach(peerId => {

      const peer: SimplePeer.Instance = new SimplePeer({
        initiator: true,
        trickle: false,
        stream
      })

      peer.on('signal', (signal: any) => {
        console.log(`${this.signalingService.socketId} Caller Block ${signal}`)
        this.signalingService.sendOfferSignal({ signalData: signal, callerId: this.signalingService.socketId, calleeId: peerId })
      })

      // peer.on('stream', stream => {
      //   this.peerVideos.first.nativeElement.srcObject = stream
      //   this.peerVideos.first.nativeElement.play()
      // })
      this.mitronPeers.push({ peerId: peerId, peer: peer })
    })
  }

  initilizePeersAsCallee(msg: SignalMessage | any, stream: MediaStream) {
    console.log(`${this.signalingService.socketId} You have an offer from ${msg.callerId}`)
    // this.signalingService.sendAnswerSignal({ signalData: msg.signalData, callerId: msg.callerId })

    const peer: SimplePeer.Instance = new SimplePeer({
      initiator: false,
      trickle: false,
      stream
    })

    peer.on('signal', (signal: any) => {
      console.log(`${this.signalingService.socketId} Callee Block ${signal}`)
      this.signalingService.sendAnswerSignal({ signalData: signal, callerId: msg.callerId })
    })

    peer.signal(msg.signalData)
    this.mitronPeers.push({ peerId: msg.callerId, peer: peer })
  }
}
