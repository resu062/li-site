import { LiElement, html, css } from '../../li.js';


import * as THREE from '../../lib/threejs/three.module.js';
import { OrbitControls } from '../../lib/threejs/OrbitControls.js';

import { Line2 } from '../../lib/threejs/lines/Line2.js';
import { LineMaterial } from '../../lib/threejs/lines/LineMaterial.js';
import { LineGeometry } from '../../lib/threejs/lines/LineGeometry.js';

import '../monitor/monitor.js';

customElements.define('li-three-line2', class LiThreeLine2 extends LiElement {
    static get properties() {
        return {
            showMonitor: { type: Boolean, default: true, save: true },
            rotate: { type: Boolean, default: true, save: true },
            speed: { type: Number, default: 45 },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 30 },
            z: { type: Number, default: 10 },
            step: { type: Number, default: 10 },
            linewidth: { type: Number, default: 5 }
        }
    }

    updated(changedProperties) {
        let update = false;
        changedProperties.forEach((oldValue, propName) => {
            update = ['x', 'y', 'z', 'step', 'linewidth'].includes(propName);
            //console.log(`${propName} changed. oldValue: ${oldValue}, newValue: ${this[propName]}`);
        });
        if (update) this.updateGraph();
    }

    render() {
        return html`
            <canvas id="canvas"></canvas>
            ${this.showMonitor ? html`<li-monitor></li-monitor>` : html``}
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this.init();
    }
    
    init() {
        window.addEventListener('resize', () => this.onWindowResize());
        this.container = this.$id.canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
        this.camera.position.set(100, 10, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: this.container });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.clock = new THREE.Clock();
        this.colors = [
            //0x50514f,
            0x0080ff,
            0xff0000,
            0xf4f1bb,
            0x9bc1bc,
            0x5ca4a9,
            0xfe5f55,
            0x247ba0,
            0x70c1b3,
        ];
    }

    updateGraph() {
        if (this.graph) this.scene.remove(this.graph);
        this.graph = new THREE.Object3D();
        this.createLines();
        this.scene.add(this.graph);
        this.createLines();
        this.animate();
        this.onWindowResize();
    }

    makeLine(points, c, w) {
        const positions = [];
        const colors = [];
        const spline = new THREE.CatmullRomCurve3(points);
        const divisions = Math.round(6 * points.length);
        const point = new THREE.Vector3();
        const color = new THREE.Color();
        for (let i = 0, l = divisions; i < l; i++) {
            const t = i / l;
            spline.getPoint(t, point);
            positions.push(point.x, point.y, point.z);
            color.set(this.colors[c])
            if (c === 0) color.setHSL(t, 1.0, 0.5);
            colors.push(color.r, color.g, color.b);
        }
        const geometry = new LineGeometry();
        geometry.setPositions(positions);
        geometry.setColors(colors);
        const matLine = new LineMaterial({
            color: 0xffffff,
            linewidth: w || 5,
            vertexColors: true,
            resolution:  new THREE.Vector2(window.innerWidth, window.innerHeight),
            dashed: false
        });
        const line = new Line2(geometry, matLine);
        line.computeLineDistances();
        line.scale.set(1, 1, 1);
        this.graph.add(line);
    }

    createLines() {
        let x = -((Number(-this.x) || 0) + 30);
        let y = Number(this.y - 30) || 0;
        let z = Number(this.z - 30) || 0;
        for (let i = 0; i < 6; i++) {
            let line = new Float32Array(600);
            let points = [];
            for (let j = 0; j < 200 * 3; j += 3) {
                line[j] = x + .1 * j;
                if (i === 0) line[j + 1] = y + 5 * Math.sin(.01 * j);
                if (i === 1) line[j + 1] = y + 5 * Math.cos(.02 * j);
                if (i === 2) line[j + 1] = y + 5 * Math.sin(.01 * j) * Math.cos(.005 * j);
                if (i === 3) line[j + 1] = y + .02 * j + 5 * Math.sin(.01 * j) * Math.cos(.005 * j);
                if (i === 4) line[j + 1] = y + Math.exp(.005 * j);
                if (i === 5) line[j + 1] = y + -(5 - j / 30) * Math.cos(.08 * j) + j / 30 - 10;
                line[j + 2] = z + Number(this.step) * i;
                points.push(new THREE.Vector3(line[j], line[j + 1], line[j + 2]));
            }
            this.makeLine(points, i + 1, Number(this.linewidth || 10));
        }

        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-30, 5, -30),
            new THREE.Vector3(-25, 0, -30),
            new THREE.Vector3(-20, -5, -30),
            new THREE.Vector3(-15, 0, -30),
            new THREE.Vector3(-10, 0, -30),
            new THREE.Vector3(-5, 5, -30),
            new THREE.Vector3(0, 0, -30),
            new THREE.Vector3(5, -5, -30),
            new THREE.Vector3(10, 0, -30),
            new THREE.Vector3(15, 0, -30),
            new THREE.Vector3(20, 5, -30),
            new THREE.Vector3(25, 0, -30),
            new THREE.Vector3(30, -5, -30),
        ]);
        const points = curve.getPoints(50);
        this.makeLine(points, 0, Number(this.linewidth || 10));

        this.makeLine(new THREE.CatmullRomCurve3([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(30, -30, -30)]).getPoints(), 6, 1);
        this.makeLine(new THREE.CatmullRomCurve3([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(-30, 30, -30)]).getPoints(), 6, 1);
        this.makeLine(new THREE.CatmullRomCurve3([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(-30, -30, 30)]).getPoints(), 6, 1);
        //this.graph.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(30, -30, -30)]), new THREE.LineBasicMaterial({ color: 0x0080ff })));
        //this.graph.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(-30, 30, -30)]), new THREE.LineBasicMaterial({ color: 0x0080ff })));
        //this.graph.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-30, -30, -30), new THREE.Vector3(-30, -30, 30)]), new THREE.LineBasicMaterial({ color: 0x0080ff })));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight; // this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.controls.update();
        if (this.rotate) this.scene.rotation.y += this.speed / 100 * this.clock.getDelta();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
});