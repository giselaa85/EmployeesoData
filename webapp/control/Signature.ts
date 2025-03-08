import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
// import { MetadataOptions } from "sap/ui/core/Element";
import SignaturePad from "signature_pad";

// https://www.npmjs.com/package/ui5-tooling-modules
// npm install ui5-tooling-modules --save-dev
// npm install --save-dev signature_pad
// https://github.com/szimek/signature_pad?tab=readme-ov-file
//Agregar en el archivo ui5.yaml
// customMiddleware:
// - name: ui5-tooling-modules-middleware       Agregar esta línea
//   afterMiddleware: compression               Agregar esta línea 
// - name: fiori-tools-proxy
//   afterMiddleware: ui5-tooling-modules-middleware  Cambiar esta línea
//
// builder:
//   customTasks:
//     - name: ui5-tooling-modules-task     Agregar esta línea
//       afterTask: replaceVersion          Agregar esta línea
//     - name: ui5-tooling-transpile-task
//       afterTask: replaceVersion

/**
 * @namespace logaligroup.logali.control
 */

//
//  Para poder hacer uso del control desde un controlador es necesario instalar 
// la siguiente librería @ui5/ts-interface-generator, para ello puedes ejecutar el siguiente comando:
// npm install --save-dev @ui5/ts-interface-generator
// Seguidamente, debes escuchar todos los cambios realizados en dicho control, con el siguiente comando:
// npx @ui5/ts-interface-generator --watch
// Posteriormente, debes realizar los siguientes ajustes para poder ejecutar tu código correctamente:
//     constructor(idOrSettings?: string | $ProductRatingSettings);
//     constructor(id?: string, settings?: $ProductRatingSettings);
//     constructor(id?: string, settings?: $ProductRatingSettings) { super(id, settings); }
// https://www.npmjs.com/package/@ui5/ts-interface-generator
// https://www.youtube.com/watch?v=nIsZof4Hdmg&ab_channel=LogaliGroup

export default class Signature extends Control {

    // private metadata: MetadataOptions = {
    //     properties: {
    //         "width" : {
    //             type: "sap.ui.core.CSSSize",
    //             defaultValue: 400
    //         },
    //         "height" : {
    //             type: "sap.ui.core.CSSSize",
    //             defaultValue: 100
    //         },
    //         "bgcolor" : {
    //             type: "sap.ui.core.CSSColor",
    //             defaultValue: "white"
    //         }
    //     }
    // }
    
    private properties = {
        "width": 400,
        "height": 100,
        "bgcolor": "rgb(255, 255, 255)",
        "minWidth": 2,
        "maxWidth": 3,
        "penColor": "rgb(4, 31, 75)"
    }

    private _signaturePad: SignaturePad;
    private _signaturePadfill: boolean;

    public onAfterRendering(oEvent: jQuery.Event): void | undefined {
        const oCanvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
        if (!oCanvas) {
            console.error("Canvas element not found.");
            return;
        }
        oCanvas.width = this.properties.width;
        oCanvas.height = this.properties.height;
        oCanvas.style.backgroundColor = this.properties.bgcolor;

        this._signaturePadfill = false;
        oCanvas.addEventListener("pointerdown", () => {
            this._signaturePadfill = true;
        });

        oCanvas.addEventListener("mousedown", () => {
            debugger;
            this._signaturePadfill = true;
        });

        try {
            this._signaturePad = new SignaturePad(oCanvas);
            this._signaturePad.minWidth = this.properties.minWidth;
            this._signaturePad.maxWidth = this.properties.maxWidth;
            this._signaturePad.penColor = this.properties.penColor;
            this._signaturePad.backgroundColor = this.properties.bgcolor;
        } catch (error) {
            console.error(error);
        }

    }

    public clear(): void {
        this._signaturePad.clear();
        this._signaturePadfill = false;
    }

    public isFill(): boolean {
        debugger;
        return this._signaturePadfill;
    }

    public getSignature(): string {
        return this._signaturePad.toDataURL();
    }

    public setSignature(signature: string) {
        this._signaturePad.fromDataURL(signature);
    }

    renderer = {
        apiVersion: 4,
        render: (oRm: RenderManager, oControl: Signature) => {
            oRm.openStart("div", oControl);
            // oRm.style("minwidth", oControl.getProperty("width"));
            // oRm.style("minheight", oControl.getProperty("height"));
            // oRm.style("background-color", oControl.getProperty("bgcolor"));
            // oRm.style("border", "1px solid black");
            oRm.openEnd();

            oRm.openStart("canvas", oControl);
            // oRm.style("minwidth", oControl.getProperty("width"));
            // oRm.style("minheight", oControl.getProperty("height"));
            oRm.openEnd();
            oRm.close("canvas");
            oRm.close("div");
        }
    };
}
