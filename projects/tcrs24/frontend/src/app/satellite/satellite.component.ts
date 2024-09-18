import {
  Component,
  AfterViewInit,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
  ViewContainerRef
} from '@angular/core';
import * as THREE from "three";
import {WebSocketService} from "../services/websocket.service";
import {CommandFetchValue, CommandSetOrientation, Telemetry, UserInteraction} from "../services/telemetry.domain";
import URDFLoader, {URDFRobot} from 'urdf-loader';
import {LoadingManager} from "three";
import {ButtonComponent, TextFieldComponent} from "@feel/form";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {filter} from "rxjs";
import {NotificationService} from "@feel/notification";
import {CardComponent} from "../core/card/card.component";


@Component({
  selector: 'app-cube',
  standalone: true,
  templateUrl: './satellite.component.html',
  imports: [
    TextFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    CardComponent,
  ],
  styleUrl: './satellite.component.scss'
})
export class SatelliteComponent implements OnInit, OnDestroy, AfterViewInit{

  protected readonly form : FormGroup = new FormGroup({
    yaw: new FormControl<number | null>(0, [Validators.required]),
    pitch: new FormControl<number | null>(0, [Validators.required]),
    roll: new FormControl<number | null>(0, [Validators.required]),
  })

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

  private manager = new LoadingManager();
  private loader = new URDFLoader( this.manager );

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private satellite!: URDFRobot;

  constructor(
    private websocketService: WebSocketService,
    private readonly notificationService: NotificationService,
  ) {
  }

  private get canvas(): HTMLCanvasElement {
      return this.canvasRef.nativeElement;
  }

  private createScene() {
    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0xFFFFFF);
    // Add lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));  // Adjust intensity to suitable value
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
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
    }
  }

  private renderingLoop() {
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.websocketService
      .sub()
      .subscribe((receivedMessage: Telemetry | CommandFetchValue | CommandSetOrientation | UserInteraction) => {
        if("username" in receivedMessage) {
          this.notificationService.info("user: " + receivedMessage.username + " just entered a new attitude!");
        }

      if(!("vel_yaw" in receivedMessage) || !("vel_pitch" in receivedMessage) || !("vel_roll" in receivedMessage)) {
        return;
      }

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
  public submit() {
    if(!this.form.valid) {
      console.log("form is invalid");
      return;
    }

    console.log("form is valid");
    const form_data = this.form.getRawValue();

    console.log("sending to groundstation");
    this.websocketService.send({
      descriptor: 0,
      yaw: form_data.yaw,
      pitch: form_data.pitch,
      roll: form_data.roll,
    });
  }

  public fetchHistory() {
    this.websocketService.send({
      descriptor: 1,
      amount: 100,
    });
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
