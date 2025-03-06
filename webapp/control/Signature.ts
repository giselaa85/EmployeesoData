import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import { MetadataOptions } from "sap/ui/core/Element";
import SignaturePad from "signature_pad";
// https://www.npmjs.com/package/ui5-tooling-modules
// npm install ui5-tooling-modules --save-dev
// npm install --save-dev signature_pad
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

    private metadata: MetadataOptions = {
        properties: {
            "width" : {
                type: "sap.ui.core.CSSSize",
                defaultValue: "400px"
            },
            "height" : {
                type: "sap.ui.core.CSSSize",
                defaultValue: "100px"
            },
            "bgcolor" : {
                type: "sap.ui.core.CSSColor",
                defaultValue: "white"
            }
        }
    }

    private _signaturePad:SignaturePad ;

    public onAfterRendering(oEvent: jQuery.Event): void | undefined {
        const oCanvas:HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
        try {
            this._signaturePad = new SignaturePad(oCanvas);
        } catch (error) {
            console.error(error);
        }
       

    }

    public clear():void{
        this._signaturePad.clear();
    }

    renderer = {
        apiVersion: 4,
        render: (oRm: RenderManager, oControl: Signature) => {
            oRm.openStart("div", oControl);
            oRm.openEnd();
            oRm.style("width", oControl.getProperty("width"));
            oRm.style("height", oControl.getProperty("height"));
            oRm.style("background-color", oControl.getProperty("bgcolor"));
            oRm.style("border", "1px solid black");
            oRm.openEnd();

            oRm.openStart("canvas", oControl);
            oRm.openEnd();
            oRm.style("width", oControl.getProperty("width"));
            oRm.style("height", oControl.getProperty("height"));
            oRm.openEnd();
            oRm.close("canvas");
            oRm.close("div");
        }
    };
}
