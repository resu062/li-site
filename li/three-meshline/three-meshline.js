import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

import * as THREE from '../../lib/threejs/three.module.js';
import { MeshLine, MeshLineMaterial } from '../../lib/threejs/THREE.MeshLine.js';
import { OrbitControls } from '../../lib/threejs/OrbitControls.js';
//import Stats from '../../lib/threejs/stats.module.js';
import '../monitor/monitor.js';

customElements.define('li-three-meshline', class LiThreeMeshline extends LiElement {
    static get properties() {
        return {
            speed: { type: Number, default: 45 },
        }
    }
    render() {
        return html`
            <canvas id="canvas"></canvas>
            <li-monitor></li-monitor>
        `;
    }

    firstUpdated() {
        super.firstUpdated();

        window.addEventListener('resize', () => this.onWindowResize());

        this.container = this.$id.canvas;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
        //this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 );
        this.camera.position.set(100, 10, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: this.container });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();

        this.colors = [
            0x50514f,
            0xff0000,
            0xf4f1bb,
            0x9bc1bc,
            0x5ca4a9,
            //0xe6ebe0,
            //0xf0b67f,
            0xfe5f55,
            //0xd6d1b1,
            //0xc7efcf,
            //0xeef5db,
            //0x50514f,
            //0xf25f5c,
            //0xffe066,
            0x247ba0,
            0x70c1b3,
        ];

        this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.graph = new THREE.Object3D();
        this.scene.add(this.graph);

        //this.stats = new Stats();
        //this.stats.showPanel(0);
        //document.body.appendChild(this.stats.dom);

        this.init();
        this.animate();
        this.onWindowResize();
    }

    makeLine(geo, c, w) {
        const g = new MeshLine();
        g.setGeometry(geo);
        const material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(this.colors[c]),
            opacity: 1,
            resolution: this.resolution,
            sizeAttenuation: false,
            lineWidth: w || 10,
        });
        const mesh = new THREE.Mesh(g.geometry, material);
        this.graph.add(mesh);
    }

    init() {
        this.createLines();
    }

    createLines() {
        let z = -20;
        for (let i = 0; i < 6; i++) {
            let line = new Float32Array(600);
            for (let j = 0; j < 200 * 3; j += 3) {
                line[j] = -30 + .1 * j;
                if (i === 0) line[j + 1] = 5 * Math.sin(.01 * j);
                if (i === 1) line[j + 1] = 5 * Math.cos(.02 * j);
                if (i === 2) line[j + 1] = 5 * Math.sin(.01 * j) * Math.cos(.005 * j);
                if (i === 3) line[j + 1] = .02 * j + 5 * Math.sin(.01 * j) * Math.cos(.005 * j);
                if (i === 4) line[j + 1] = Math.exp(.005 * j);
                if (i === 5) line[j + 1] = -(5 - j/30) * Math.cos(.08 * j) + j/30 - 10;
                line[j + 2] = z;
            }
            z += 10;
            this.makeLine(line, i + 1, 10);
        }

        let s = 0;
        let arr = [-30, -30, -30, 30, -30, -30, -30, -30, -30, -30, 30, -30, -30, -30, -30, -30, -30, 30];
        for (let i = 0; i < 3; i++) {
            let line = new THREE.BufferGeometry();
            line.vertices = [];
            for (let j = 0; j < 1; j++) {
                line.vertices.push(new THREE.Vector3(arr[s], arr[s+1], arr[s+2]));
                line.vertices.push(new THREE.Vector3([arr[s+3]], arr[s+4], arr[s+5]));
            }
            s += 6;
            this.makeLine(line, 0, 1);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight; // this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        //this.stats.begin();
        this.controls.update();
        this.graph.rotation.y += this.speed / 100 * this.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
        //this.stats.end();
        //this.stats.update();
        requestAnimationFrame(() => this.animate());
    }
});