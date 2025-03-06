import Controller from "sap/ui/core/mvc/Controller";
import History from "sap/ui/core/routing/History";
import UIComponent from "sap/ui/core/UIComponent";
import { Button$PressEvent } from "sap/m/Button";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Signature from "../control/Signature";

/**
 * @namespace logaligroup.logali.controller
 */

export default class App extends Controller {
    public onInit(): void | undefined {
        const oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails")?.attachPatternMatched(this._onObjectMatched, this);
    }

    public onBack(oEvent:Button$PressEvent): void | undefined {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        if(sPreviousHash !== undefined){
            window.history.go(-1);            
        }
        else {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain");
        }
    }

    private _onObjectMatched(oEvent:Route$PatternMatchedEvent){
        const args = oEvent.getParameter("arguments") as any;
        //Clear signature every time it is navigated to Detail View        
        const oSignature:Signature    = this.getView()?.byId("signature") as Signature;
        oSignature.clear();
        this.getView()?.bindElement({
            path: "/Orders(" + args.OrderID + ")",
            model: "odataNorthwind"
        })
    }
 
    public onClearSignature():void{
        const oSignature:Signature    = this.getView()?.byId("signature") as Signature;
        oSignature.clear();
    }

}
