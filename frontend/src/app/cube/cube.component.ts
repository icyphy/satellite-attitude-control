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
  templateUrl: './cube.component.html',
  styleUrl: './cube.component.scss'
})
export class CubeComponent implements OnInit, OnDestroy, AfterViewInit{
  constructor(private websocketService: WebSocketService) { }

  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @Input() public rotationSpeedX: number = 0.1;
  @Input() public rotationSpeedY: number = -0.1;
  @Input() public rotationSpeedZ: number = 0.2;

  @Input() public size: number = 20.0;
  @Input() public texture: string = "/assets/texture.jpg";

  @Input() public cameraZ: number = 400.0;
  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private manager = new LoadingManager();
  //private loader = new THREE.TextureLoader()
  private loader = new URDFLoader( this.manager );

  private geometry = new THREE.BoxGeometry(1, 1, 1);
  private material = new THREE.MeshBasicMaterial()
  private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private robo!: URDFRobot;
  private createScene() {
    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0xFFFFFF);
    //this.scene.add(this.cube);
    this.loader.load(
      'assets/model.urdf',                    // The path to the URDF within the package OR absolute
      robot => {
        console.log("loading robot");
        this.robo = robot;
        this.scene.add( robot );
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

  private animateCube() {
    if (this.robo !== undefined) {
      this.robo.rotation.x += this.rotationSpeedX;
      this.robo.rotation.y += this.rotationSpeedY;
      this.robo.rotation.z += this.rotationSpeedZ;
    }
  }

  private renderingLoop() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.websocketService.sub().subscribe((receivedMessage: Telemetry) => {
      console.log("received");
      this.robo.rotation.x = receivedMessage.yaw;
      this.robo.rotation.y = receivedMessage.pitch;
      this.robo.rotation.z = receivedMessage.roll;
      this.rotationSpeedX = receivedMessage.vel_yaw;
      this.rotationSpeedY = receivedMessage.vel_pitch;
      this.rotationSpeedZ = receivedMessage.vel_roll;
    });

    let component: CubeComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animateCube();
      component.renderer.render(component.scene, component.camera);
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
