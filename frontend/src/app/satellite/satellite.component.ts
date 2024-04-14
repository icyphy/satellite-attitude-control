import {Component, AfterViewInit, ElementRef, Input, OnInit, ViewChild, OnDestroy} from '@angular/core';
import * as THREE from "three";
import {WebSocketService} from "../services/websocket.service";
import {Telemetry} from "../services/telemetry.domain";
import URDFLoader, {URDFRobot} from 'urdf-loader';
import {LoadingManager} from "three";
import {error} from "@angular/compiler-cli/src/transformers/util";

@Component({
  selector: 'app-cube',
  standalone: true,
  templateUrl: './satellite.component.html',
  styleUrl: './satellite.component.scss'
})
export class SatelliteComponent implements OnInit, OnDestroy, AfterViewInit{
  constructor(private websocketService: WebSocketService) { }

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('xrot')
  private xrotRef!: ElementRef;
  @ViewChild('yrot')
  private yrotRef!: ElementRef;
  @ViewChild('zrot')
  private zrotRef!: ElementRef;

  @ViewChild('xpos')
  private xposRef!: ElementRef;
  @ViewChild('ypos')
  private yposRef!: ElementRef;
  @ViewChild('zpos')
  private zposRef!: ElementRef;
  @ViewChild('time')
  private timeRef!: ElementRef;

  @Input() public framePeriod: number = 0.025;

  @Input() public rotationDeltaX: number = 0.0;
  @Input() public rotationDeltaY: number = 0.0;
  @Input() public rotationDeltaZ: number = 0.0;

  @Input() public size: number = 20.0;

  @Input() public cameraZ: number = 400.0;
  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;

  private clock!: THREE.Clock;
  private startTime!: number;

  private animation: [[number, number, number]] = [[0, 0, 0]];

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private manager = new LoadingManager();
  private loader = new URDFLoader( this.manager );

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshBasicMaterial()
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private satellite!: URDFRobot;
  private createScene() {
    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0xFFFFFF);
    //this.scene.add(this.cube);
    this.loader.load(
      'assets/model.urdf',                    // The path to the URDF within the package OR absolute
      satellite => {
        console.log("loading robot");
        this.satellite = satellite;
        this.scene.add( satellite );
      },
      progress => {
        console.log("progress:", progress)
      },
      error => {
        console.log("error: ", error)
      }
    );
    //this.scene.add(this.cube);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    );
    this.camera.position.z = this.cameraZ;
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private rotateSatellite() {
    if (this.satellite !== undefined) {
      if (this.animation.length > 0) {
        let first = this.animation[0];
        this.animation.shift();

        if(first == undefined) {
          return;
        }

        this.satellite.rotation.x = first[0];
        this.satellite.rotation.y = first[1];
        this.satellite.rotation.z = first[2];

      }
      //this.satellite.rotation.x += this.rotationDeltaX;
      //this.satellite.rotation.y += this.rotationDeltaY;
      //this.satellite.rotation.z += this.rotationDeltaZ;
    }
  }

  private renderingLoop() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.websocketService.sub().subscribe((receivedMessage: Telemetry) => {
      let animation: [[number, number, number]] = [[this.satellite.rotation.x, this.satellite.rotation.y, this.satellite.rotation.z]];
      let current_x = this.satellite.rotation.x;
      let current_y = this.satellite.rotation.y;
      let current_z = this.satellite.rotation.z;

      for (let i = 1; i < 15; i++) {
        let step_x = current_x + (receivedMessage.yaw - current_x) * (i / 15.0);
        let step_y = current_y + (receivedMessage.pitch - current_y) * (i / 15.0);
        let step_z = current_z + (receivedMessage.roll - current_z) * (i / 15.0);
        animation.push([step_x, step_y, step_z]);
      }

      this.animation = animation;
      this.xrotRef.nativeElement.innerText = receivedMessage.vel_yaw;
      this.yrotRef.nativeElement.innerText = receivedMessage.vel_pitch;
      this.zrotRef.nativeElement.innerText = receivedMessage.vel_roll;
      this.xposRef.nativeElement.innerText = receivedMessage.yaw;
      this.yposRef.nativeElement.innerText = receivedMessage.pitch;
      this.zposRef.nativeElement.innerText = receivedMessage.roll;
      this.timeRef.nativeElement.innerText = receivedMessage.time;

      //this.satellite.rotation.x = receivedMessage.yaw;
      //this.satellite.rotation.y = receivedMessage.pitch;
      //this.satellite.rotation.z = receivedMessage.roll;
      //this.rotationDeltaX = receivedMessage.vel_yaw * this.framePeriod;
      //this.rotationDeltaY = receivedMessage.vel_pitch * this.framePeriod;
      //this.rotationDeltaZ = receivedMessage.vel_roll * this.framePeriod;
    });
    this.clock = new THREE.Clock();
    this.clock.start();
    this.startTime = this.clock.getElapsedTime();

    let component: SatelliteComponent = this;
    (function render() {
      requestAnimationFrame(render);
      let currentTime = component.clock.getElapsedTime();
      //console.log(currentTime, component.startTime, currentTime - component.startTime);
      if (currentTime - component.startTime > component.framePeriod) {
        component.rotateSatellite();
        component.renderer.render(component.scene, component.camera);
        component.startTime += component.framePeriod;
      }
    }());
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.renderingLoop();
  }
  ngOnInit(): void {
  }
  ngOnDestroy() {
  }
}
