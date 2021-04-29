import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('videoElement') videoElement: any;
  video: any;

  isPlaying = false;

  displayControls = true;

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    //this.video = this.videoElement.nativeElement;
  }

  start() {
    this.initCamera({ video: true, audio: false });
  }

  pause() {
    this.video.pause();
  }

  toggle() {
    this.video.controls = this.displayControls;
    this.displayControls = !this.displayControls;
  }

  resume() {
    this.video.play();
  }

  sound() {
    this.initCamera({ video: true, audio: true });
  }

  initCamera(config: any) {
    var browser = <any>navigator;

    browser.getUserMedia = (
      browser.getUserMedia       ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia    ||
      browser.msGetUserMedia);

    browser.mediaDevices.getUserMedia(config)
    .then((stream: any) => {
      this.video.srcObject = stream;
      this.video.play();
    })
    .catch((error: any) => alert(error));
  }
}