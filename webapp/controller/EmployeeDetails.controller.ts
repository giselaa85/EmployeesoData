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

/**
 * @namespace logaligroup.logali.controller
 */
export default class EmployeeDetails extends Controller {
    public formatter = formatter;
    private _bus: EventBus;

    public onInit(): void {
     this._bus = EventBus.getInstance();
    }

    public onCreateIncidence(): void {
        const oTableIncidence: Panel = this.getView()?.byId("tableIncidence") as Panel;
        const incidenceModel: JSONModel = this.getView()?.getModel("incidenceModel") as JSONModel;
        const oData: { index: number, date?: Date, status?: number }[]
            = incidenceModel.getData() as { index: number, date?: Date, status?: number }[];
        const index: number = oData.length;
        oData.push({ index: index + 1 });
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
        const rowIncidence = oEvent.getSource().getParent()?.getParent();
        if (rowIncidence) {
            const oTableIncidence: Panel = this.getView()?.byId("tableIncidence") as Panel;

            const incidenceModel: JSONModel = this.getView()?.getModel("incidenceModel") as JSONModel;
            const oData: { index: number, date?: Date, status?: number }[]
                = incidenceModel.getData() as { index: number, date?: Date, status?: number }[];
            const oContextObj: Context = rowIncidence?.getBindingContext("incidenceModel") as Context;
            const sPath = oContextObj.getPath();
            const iIndex = parseInt(sPath.substring(sPath.lastIndexOf("/") + 1));
            oData.splice(iIndex, 1);

            oData.forEach((oDataInc, index) => {
                oDataInc.index = index + 1;
            });

            incidenceModel.refresh();
            if (rowIncidence) {
                oTableIncidence.removeContent(rowIncidence as Control);
            }

            oTableIncidence.getContent().forEach((oTableLine, index) => {
                oTableLine.bindElement("incidenceModel>/" + index);
            });

        }
    }

    public onSaveIncidence(oEvent: Icon$PressEvent): void | undefined{
        const incidence = oEvent.getSource().getParent()?.getParent();
        const incidenceRow:Context = incidence?.getBindingContext("incidenceModel") as Context;
     
        debugger;
        this._bus.publish("incidence", "onSaveIncidence", { incidenceRow : incidenceRow?.getPath()?.toString().replace("/","") });
    }
}