import Controller from "sap/ui/core/mvc/Controller";
import History from "sap/ui/core/routing/History";
import UIComponent from "sap/ui/core/UIComponent";
import { Button$PressEvent } from "sap/m/Button";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";

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
        this.getView()?.bindElement({
            path: "/Orders(" + args.OrderID + ")",
            model: "odataNorthwind"
        })
    }


}
