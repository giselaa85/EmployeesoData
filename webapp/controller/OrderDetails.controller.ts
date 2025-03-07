import Controller from "sap/ui/core/mvc/Controller";
import History from "sap/ui/core/routing/History";
import UIComponent from "sap/ui/core/UIComponent";
import { Button$PressEvent } from "sap/m/Button";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Signature from "../control/Signature";
import Context from "sap/ui/model/Context";
import ObjectListItem from "sap/m/ObjectListItem";
import CustomListItem from "sap/m/CustomListItem";
import Bar from "sap/m/Bar";
import Label from "sap/m/Label";
import ObjectStatus from "sap/m/ObjectStatus";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import MessageBox from "sap/m/MessageBox";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Component from "../Component";

/**
 * @namespace logaligroup.logali.controller
 */

export default class App extends Controller {
    public onInit(): void | undefined {
        const oRouter = UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails")?.attachPatternMatched(this._onObjectMatched, this);
    }

    public onBack(oEvent: Button$PressEvent): void | undefined {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();
        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        }
        else {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain");
        }
    }

    private _onObjectMatched(oEvent: Route$PatternMatchedEvent) {
        const args = oEvent.getParameter("arguments") as any;
        //Clear signature every time it is navigated to Detail View        
        const oSignature: Signature = this.getView()?.byId("signature") as Signature;
        oSignature.clear();
        this.getView()?.bindElement({
            path: "/Orders(" + args.OrderID + ")",
            model: "odataNorthwind"
        })
    }

    public onClearSignature(): void {
        const oSignature: Signature = this.getView()?.byId("signature") as Signature;
        oSignature.clear();
    }

    public factoryOrderDetails(listId: number, oContext: Context) {
        const contextObject = oContext.getObject();
        contextObject.Currency = "EUR";
        const unitsInStock = oContext.getModel()?.getProperty("/Products(" + contextObject.ProductID + ")/UnitsInStock");
        if (contextObject.Quantity <= unitsInStock) {
            const objectListItem = new ObjectListItem({
                title: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
                number: "{parts: [{path: 'odataNorthwind>UnitPrice'},{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency', formatOptions: {showMeasure:false}}",
                numberUnit: "{odataNorthwind>Currency}"
            });
            return objectListItem;
        }
        else {
            const customListItem = new CustomListItem({
                content: [
                    new Bar({
                        contentLeft: new Label({ text: "{odataNorthwind>/Products(" + contextObject.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                        contentMiddle: new ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObject.ProductID + ")/UnitsInStock}", state: "Error" }),
                        contentRight: new Label({ text: "{parts: [{path: 'odataNorthwind>UnitPrice'},{path: 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}" })
                    })
                ]

            });
            return customListItem;
        }

    }

    public onSaveSignature(oEvent: Button$PressEvent): void {
        debugger;
        const oSignature: Signature = this.getView()?.byId("signature") as Signature;
               const oResourceModel = <ResourceBundle>(
                   (<ResourceModel>(
                       this.getOwnerComponent()?.getModel("i18n")
                   ))?.getResourceBundle()
               );
        let signaturePng:string;
        if(! oSignature.isFill() ){
            MessageBox.error(oResourceModel.getText("fillSignature") || "Please Sign the Order");
        }
        else {
            signaturePng = oSignature.getSignature().replace("data:image/png;base64,","");
            let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind")?.getObject();
            let body = {
                OrderId : oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("OrderID").toString(),
                SapId : Component.SapId,
                EmployeeId : oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("EmployeeID").toString(),
                MimeType : "image/png",
                MediaContent: signaturePng
            };
            const incidenceModel: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;
            incidenceModel.create("/SignatureSet", body, {
                success: () => {
                    MessageBox.information(oResourceModel.getText("signatureSaved") || "Signature successfully saved.");
                },
                error: () => {
                    MessageBox.error(oResourceModel.getText("signatureNotSaved") || "Signature not Saved");
                }
            });
        } 
    }

}
