/* eslint-disable no-console */
import Controller from "sap/ui/core/mvc/Controller";
import Panel from "sap/m/Panel";
import Fragment from "sap/ui/core/Fragment";
import JSONModel from "sap/ui/model/json/JSONModel";
import Control from "sap/ui/core/Control";
import formatter from "../model/formatter";
import { Icon$PressEvent } from "sap/ui/core/Icon";
import Context from "sap/ui/model/Context";
import EventBus from "sap/ui/core/EventBus";
import { DatePicker$ChangeEvent } from "sap/m/DatePicker";
import { TextField$ChangeEvent } from "sap/ui/commons/TextField";
import { InputBase$ChangeEvent } from "sap/m/InputBase";
import { Select$ChangeEvent } from "sap/m/Select";
import MessageBox from "sap/m/MessageBox";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import { TextDirection } from "sap/ui/core/library";
import { ActionItem$PressEvent } from "sap/m/table/columnmenu/ActionItem";
import UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace logaligroup.logali.controller
 */
interface Incidence {
    index: number,
    IncidenceId?: number,
    SapId?: string,
    EmployeeId?: string,
    CreationDate?: Date,
    CreationDateX?: boolean,
    Type?: number,
    TypeX?: boolean,
    Reason?: string,
    ReasonX?: boolean,
    _ValidateDate: boolean,
    CreationDateState?: "Error" | "Information" | "None" | "Success" | "Warning",
    ReasonState?: "Error" | "Information" | "None" | "Success" | "Warning",
    EnabledSave: boolean,
    EnabledDelete: boolean
}

export default class EmployeeDetails extends Controller {
    public formatter = formatter;
    private _bus: EventBus;

    public onInit(): void {
        this._bus = EventBus.getInstance();
    }

    public onCreateIncidence(): void {
        const oTableIncidence: Panel = this.getView()?.byId("tableIncidence") as Panel;
        const incidenceModel: JSONModel = this.getView()?.getModel("incidenceModel") as JSONModel;
        const oData:
            Incidence[]
            = incidenceModel.getData() as
            Incidence[];
        const index: number = oData.length;
        oData.push({ index: index + 1, _ValidateDate: false, EnabledSave: false, EnabledDelete: false });
        Fragment.load({
            name: "logaligroup.logali.fragment.NewIncidence",
            controller: this
        }).then((newInc) => {
            const newIncidence = newInc as Control;
            incidenceModel.refresh();
            newIncidence.bindElement("incidenceModel>/" + index);
            oTableIncidence.addContent(newIncidence);
        }).catch((error) => {
            console.error("Error loading fragment:", error);
        });
    }

    public onDeleteIncidence(oEvent: Icon$PressEvent): void {
        const oResourceModel = <ResourceBundle>(
            (<ResourceModel>(
                this.getOwnerComponent()?.getModel("i18n")
            ))?.getResourceBundle()
        );

        const incidence = oEvent.getSource();
        const oContext: Context = incidence?.getBindingContext("incidenceModel") as Context;
        const oContextObj: Incidence = oContext.getObject() as Incidence;
        MessageBox.confirm(oResourceModel.getText("confirmDeleteIncidence") || "",
            {
                onClose: (oAction: "OK" | "CANCEL") => {
                    if (oAction === 'OK') {
                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: oContextObj.IncidenceId,
                            SapId: oContextObj.SapId,
                            EmployeeId: oContextObj.EmployeeId
                        });
                    }
                }
            });

        // 
        // Code to delete just locally
        // const rowIncidence = oEvent.getSource().getParent()?.getParent();
        // if (rowIncidence) {
        //     const oTableIncidence: Panel = this.getView()?.byId("tableIncidence") as Panel;

        //     const incidenceModel: JSONModel = this.getView()?.getModel("incidenceModel") as JSONModel;
        //     const oData: { index: number, date?: Date, status?: number }[]
        //         = incidenceModel.getData() as { index: number, date?: Date, status?: number }[];
        //     const oContextObj: Context = rowIncidence?.getBindingContext("incidenceModel") as Context;
        //     const sPath = oContextObj.getPath();
        //     const iIndex = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1));
        //     oData.splice(iIndex, 1);

        //     oData.forEach((oDataInc, index) => {
        //         oDataInc.index = index + 1;
        //     });

        //     incidenceModel.refresh();
        //     if (rowIncidence) {
        //         oTableIncidence.removeContent(rowIncidence as Control);
        //     }

        //     oTableIncidence.getContent().forEach((oTableLine, index) => {
        //         oTableLine.bindElement("incidenceModel>/" + index);
        //     });

        // }
    }

    public onSaveIncidence(oEvent: Icon$PressEvent): void | undefined {
        const incidence = oEvent.getSource().getParent()?.getParent();
        const incidenceRow: Context = incidence?.getBindingContext("incidenceModel") as Context;

        debugger;
        this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow?.getPath()?.toString().replace("/", "") });
    }

    public updateIncidenceCreationDate(oEvent: DatePicker$ChangeEvent): void | undefined {
        const incidence = oEvent.getSource();
        const oContext: Context = incidence?.getBindingContext("incidenceModel") as Context;
        const oContextObj: Incidence = oContext.getObject() as Incidence;
        if (oEvent.getSource().isValidValue()) {
            oContextObj._ValidateDate = true;
            oContextObj.CreationDateState = "None";
            oContextObj.CreationDateX = true;
        }
        else {
            const oResourceModel = <ResourceBundle>(
                (<ResourceModel>(
                    this.getOwnerComponent()?.getModel("i18n")
                ))?.getResourceBundle()
            );
            oContextObj._ValidateDate = false;
            oContextObj.CreationDateState = "Error";
            MessageBox.error(oResourceModel.getText("errorCreationDateValue") || "", {
                title: oResourceModel.getText("errorTitle"),
                styleClass: "",
                actions: MessageBox.Action.CLOSE,
                textDirection: TextDirection.Inherit
            });
        }

        if (oEvent.getSource().isValidValue() && oContextObj.Reason != '') {
            oContextObj.EnabledSave = true;
        }
        else {
            oContextObj.EnabledSave = false;
        }

        oContext.getModel().refresh();
    }

    public updateIncidenceReason(oEvent: InputBase$ChangeEvent): void | undefined {
        const incidence = oEvent.getSource();
        const oContext: Context = incidence?.getBindingContext("incidenceModel") as Context;
        const oContextObj: Incidence = oContext.getObject() as Incidence;
        if (oEvent.getSource().getValue()) {
            oContextObj.ReasonState = "None";
            oContextObj.ReasonX = true;
        }
        else {
            oContextObj.ReasonState = "Error";
        }
        if (oEvent.getSource().getValue() && oContextObj._ValidateDate) {
            oContextObj.EnabledSave = true;
        }
        else {
            oContextObj.EnabledSave = false;
        }
        oContext.getModel().refresh();

    }

    public updateIncidenceType(oEvent: Select$ChangeEvent): void | undefined {
        const incidence = oEvent.getSource();
        const oContext: Context = incidence?.getBindingContext("incidenceModel") as Context;
        const oContextObj: Incidence = oContext.getObject() as Incidence;
        oContextObj.TypeX = true;
        if (oContextObj.Reason && oContextObj._ValidateDate) {
            oContextObj.EnabledSave = true;
        }
        else {
            oContextObj.EnabledSave = false;
        }
        oContext.getModel().refresh();
    }

    public toOrderDetails(oEvent: ActionItem$PressEvent): void | undefined {
        const orderID = oEvent.getSource()?.getBindingContext("odataNorthwind")?.getProperty("OrderID")
        const oRouter = UIComponent.getRouterFor(this);
        debugger;
        oRouter.navTo("RouteOrderDetails",
            {
                OrderID: orderID
            }
        )
    }
}