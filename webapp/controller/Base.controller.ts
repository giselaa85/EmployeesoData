import Controller from "sap/ui/core/mvc/Controller";
import { ActionItem$PressEvent } from "sap/m/table/columnmenu/ActionItem";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace logaligroup.logali.controller
 */


export default class Base extends Controller {
    public onInit(): void {

    }
    public toOrderDetails(oEvent: ActionItem$PressEvent): void | undefined {
        const orderID = oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("OrderID")
        const oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("RouteOrderDetails",
            {
                OrderID: orderID
            }
        )
    }
}
