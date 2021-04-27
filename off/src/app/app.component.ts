import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'off';

  @ViewChild('videoElement') private videoElement: any;
  video: any;

  ngOnInit(): void {
    this.video = this.videoElement.nativeElement;
  }

  start() {
    this.initCamera({ video: true, audio: false });
  }

  sound() {
    this.initCamera({ video: true, audio: true });
  }

  private initCamera(config:any) {
    var browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    browser.mediaDevices.getUserMedia(config).then((stream: any) => {
      //this.video.src = window.URL.createObjectURL(stream);
      this.video.srcObject = stream;
      this.video.play();
    });
  }
}