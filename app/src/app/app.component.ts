import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AudioRecordingService } from './audio-recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements OnDestroy {

  @ViewChild('videoElement') videoElement: any;
  video: any;
  isPlaying = false;
  displayControls = true;
  isAudioRecording = false;
  isVideoRecording = false;
  audioRecordedTime;
  audioBlobUrl;
  audioBlob;
  audioName;
  audioStream: MediaStream;
  audioConf = { audio: true}
  videoConf = { video: { facingMode:"user", width: 320 }, audio: true}


  playAudio() {
    console.log('**** In Play Audio Function **** ');
    let audio = new Audio();
    audio.src = './static/Goodmorning_soft.mp3';
    audio.load();
    audio.play();
    // this.playAudio();
  }

  constructor(
    private ref: ChangeDetectorRef,
    private audioRecordingService: AudioRecordingService,
    private sanitizer: DomSanitizer,
    private httpClient: HttpClient
  ) {

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isAudioRecording = false;
      this.ref.detectChanges();
 });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.audioRecordedTime = time;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {
      this.audioBlob = data.blob;
      this.audioName = data.title;
      this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.ref.detectChanges();
    });
  }

  // ngOnInit() {
  //   this.video = this.videoElement.nativeElement;
  // }

  startAudioRecording() {
    if (!this.isAudioRecording) {
      this.isAudioRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortAudioRecording() {
    if (this.isAudioRecording) {
      this.isAudioRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopAudioRecording() {
    if (this.isAudioRecording) {
      this.audioRecordingService.stopRecording();
      this.isAudioRecording = false;
    }
  }

  clearAudioRecordedData() {
    this.audioBlobUrl = null;
  }

  downloadAudioRecordedData() {
    this._downloadFile(this.audioBlob, 'audio/wav', this.audioName);
  }

  saveAudioRecordedData() {
    let url = 'http://localhost:8080/save';
    // let url = 'https://tone-detect.cognitivebotics.in/save';
    // let url = 'https:// stage.cognitivebotics.in.s3.amazonaws.com/about-us/';
    const blob = new Blob([this.audioBlob], { type: 'audio/wav' });
    console.log(url, typeof(blob), this.audioName);
    let formData = new FormData();
    formData.append('file', blob, this.audioName);
    this.httpClient.post(url, formData).subscribe(data => {
      console.log("success",data);
    },err => {
      console.log("error", err);
    });
  }

  ngOnDestroy(): void {
    this.abortAudioRecording();
  }

  _downloadFile(data: any, type: string, filename: string): any {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    //this.video.srcObject = stream;
    //const url = data;
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
