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
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Component from "../Component";
import UploadCollectionParameter, 
  { UploadCollection$BeforeUploadStartsEvent,
    UploadCollection$ChangeEvent, 
    UploadCollection$FileDeletedEvent, 
    UploadCollection$UploadCompleteEvent } from "sap/m/UploadCollection";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import UploadCollectionItem, { UploadCollectionItem$PressEvent } from "sap/m/UploadCollectionItem";

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
            model: "odataNorthwind",
            events: {
                dataReceived: (oData: any) => {
                    this._readSignatureFiles.bind(this)(oData.getParameter("data").OrderID, (oData.getParameter("data").EmployeeID));
                }
            }
        });
        // debugger;
        // const oView: View = this.getView() as View;
        // const oModel = oView.getModel("odataNorthwind") as ODataModel;
        // const oContext = oModel.getProperty("/Orders(" + args.OrderID + ")");
        // this._readSignature.bind(this)(oContext.OrderID, oContext.EmployeeID);

    }

    public _readSignatureFiles(OrderID: number, EmployeeID: number): void {
        // http://erp13.sap4practice.com:9037/sap/opu/odata/sap/YSAPUI5_SRV_01/SignatureSet/?$format=json        
        const oModel = this.getOwnerComponent()?.getModel("incidenceModel") as ODataModel;
        //Read Signature
        oModel?.read("/SignatureSet(OrderId='" + OrderID
            + "',SapId='" + Component.SapId
            + "',EmployeeId='" + EmployeeID + "')", {
            success: (data: any) => {
                const signature = this.getView()?.byId("signature") as Signature;
                if (data.MediaContent !== "") {
                    signature.setSignature("data:image/png;base64," + data.MediaContent);
                }
            },
            error: (data: any) => {
                console.error(data.responseText);
            }
        });

        //Read Files
        this.byId("uploadCollection")?.bindAggregation("items",
            {
                path: "incidenceModel>/FilesSet",
                filters: [
                   new Filter("OrderId",FilterOperator.EQ, OrderID),
                   new Filter("SapId",FilterOperator.EQ, Component.SapId),
                   new Filter("EmployeeId", FilterOperator.EQ, EmployeeID),
                ],
                template: new UploadCollectionItem({
                    documentId: "{incidenceModel>AttId}",
                    fileName: "{incidenceModel>FileName",
                    visibleEdit:false
                }).attachPress(this.downloadFile)
            });

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
        let signaturePng: string;
        if (!oSignature.isFill()) {
            MessageBox.error(oResourceModel.getText("fillSignature") || "Please Sign the Order");
        }
        else {
            signaturePng = oSignature.getSignature().replace("data:image/png;base64,", "");
            let objectOrder = oEvent.getSource().getBindingContext("odataNorthwind")?.getObject();
            let body = {
                OrderId: oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("OrderID").toString(),
                SapId: Component.SapId,
                EmployeeId: oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("EmployeeID").toString(),
                MimeType: "image/png",
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

    public onFileBeforeUpload(oEvent:UploadCollection$BeforeUploadStartsEvent){
        debugger;
        const filename:string|void = oEvent.getParameter("fileName")?.toString();
        interface ObjectContext {
            OrderID: string;
            EmployeeID: string;
        }
        const objectContext = oEvent.getSource().getBindingContext("odataNorthwind")?.getObject() as ObjectContext;
        const oCustomerHeaderSlug = new UploadCollectionParameter({
            name: "slug",
            value: objectContext?.OrderID + ";" + Component.SapId + ";" + objectContext?.EmployeeID + ";" + filename
        });
        const parameters = oEvent.getParameters();
        if (parameters) {
            if (parameters && parameters.addHeaderParameter) {
                parameters.addHeaderParameter(oCustomerHeaderSlug);
            }
        }    
        
      }
    
      public onFileChange(oEvent:UploadCollection$ChangeEvent){
        const oUploadCollection = oEvent.getSource();
        const oCustomerHeaderToken:UploadCollectionParameter= new UploadCollectionParameter({
            name: "x-csrf-token",
            value: (this.getView()?.getModel("incidenceModel") as ODataModel)?.getSecurityToken()
        });
        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
     }

     public onFileUploadComplete(oEvent:UploadCollection$UploadCompleteEvent){
       oEvent.getSource()?.getBinding("items")?.refresh();
     }

     public onFileDeleted(oEvent: UploadCollection$FileDeletedEvent){
        const oUploadCollection = oEvent.getSource();
        const sPath:string= oEvent.getParameter("item")?.getBindingContext("incidenceModel")?.getPath().toString() || "";
        (this.getView()?.getModel("incidenceModel") as ODataModel).remove(sPath, {
            success: () => {
                oUploadCollection.getBinding("items")?.refresh();
            },
            error: () => {

            }
        }
        )
     }

     public downloadFile(oEvent:UploadCollectionItem$PressEvent){
        const sPath:string= oEvent.getSource().getBindingContext("incidenceModel")?.getPath().toString() || "";
        window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value")
     }
}
