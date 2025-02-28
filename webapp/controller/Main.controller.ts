/* eslint-disable no-console */
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import EventBus from "sap/ui/core/EventBus";
import Panel from "sap/m/Panel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import MessageToast from "sap/m/MessageToast";
import Component from "../Component";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Fragment from "sap/ui/core/Fragment";
import Control from "sap/ui/core/Control";


/**
 * @namespace logaligroup.logali.controller
 */

interface Incidence {
    IncidenceId: number,
    SapId:string,
    EmployeeId:string,
    CreationDate: Date,
    CreationDateX: boolean,
    Type: number,
    TypeX: boolean,
    Reason: string,
    ReasonX: boolean,
    _ValidateDate:boolean,
    CreationDateState:"Error"|"Information"|"None"|"Success"|"Warning",
    ReasonState:"Error"|"Information"|"None"|"Success"|"Warning"
}

export default class Main extends Controller {

    private _bus: EventBus;
    public _detailEmployeeView: View;

    public onBeforeRendering(): void | undefined {
        this._detailEmployeeView = this.getView()?.byId("detailEmployeeView") as View;
    }

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        const oView: View = this.getView() as View;
        const oJSONModelEmployee = new JSONModel();
        oJSONModelEmployee.loadData("./localService/mockdata/Employees.json")?.then(() => {
            oView.setModel(oJSONModelEmployee, "employee");
        })
            .catch((error) => {
                console.error("Error loading employee data", error);
            });

        const oJSONModelCountries = new JSONModel();
        oJSONModelCountries.loadData("./localService/mockdata/Countries.json")?.then(() => {
            oView.setModel(oJSONModelCountries, "country");
        })
            .catch((error) => {
                console.error("Error loading country data", error);
            });

        const oJSONModelConfig = new JSONModel(
            {
                visibleID: true,
                visibleName: true,
                visibleCountry: true,
                visibleCity: false,
                visibleBtnShowCity: true,
                visibleBtnHideCity: false
            }
        );
        oView.setModel(oJSONModelConfig, "jsonModelConfig");

        const oJSONModelLayout = new JSONModel();
        oJSONModelLayout.loadData("./localService/mockdata/Layout.json")?.then(() => {
            oView.setModel(oJSONModelLayout, "layout");
        })
            .catch((error) => {
                console.error("Error loading layout data", error);
            });

        this._bus = EventBus.getInstance();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._bus.subscribe("flexible", "showEmployee", (category: string, nameEvent: string, path: any) => {
            this.showEmployeeDetails(category, nameEvent, path);
        });
        this._bus.subscribe("incidence", "onSaveIncidence", (channelId: string, eventId: string, data: any) => {
            this.onSaveODataIncidence(channelId, eventId, data)
        }, this);
        this._bus.subscribe("incidence", "onDeleteIncidence", (channelId: string, eventId: string, data: any) => {
            this.onDeleteODataIncidence(channelId, eventId, data)
        }, this);

    }

    private showEmployeeDetails(category: string, nameEvent: string, path: { path: string }): void {
        const oDetailView: View = this.getView()?.byId("detailEmployeeView") as View;
        oDetailView.bindElement("odataNorthwind>" + path.path);
        const oView: View = this.getView() as View;
        const oModel: JSONModel = oView.getModel("layout") as JSONModel;
        oModel.setProperty("/ActiveKey", "TwoColumnsMidExpanded");


        const incidenceModel: JSONModel = new JSONModel([]);
        oDetailView.setModel(incidenceModel, "incidenceModel");
        const oPanel: Panel = oDetailView.byId("tableIncidence") as Panel;
        oPanel.removeAllContent();

        this.onReadODataIncidence(this._detailEmployeeView.getBindingContext("odataNorthwind")?.getObject().EmployeeID);

    }

    private onSaveODataIncidence(channelId: string, eventId: string, data: { incidenceRow: number }): void | undefined {
        const oResourceModel = <ResourceBundle>(
            (<ResourceModel>(
                this.getOwnerComponent()?.getModel("i18n")
            ))?.getResourceBundle()
        );
        const employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind")?.getObject().EmployeeID;
        const incidenceModel: ODataModel = this._detailEmployeeView.getModel("incidenceModel") as ODataModel;
        const incidenceContext = incidenceModel
        const incidenceModelData = incidenceModel.getProperty("/") as Incidence[];
        const index: number = data.incidenceRow;
        const incidenceData = incidenceModelData[index] as Incidence;
        if (typeof (incidenceData.IncidenceId) == "undefined") {
            const body = {
                SapId: Component.SapId,
                EmployeeId: employeeId.toString(),
                CreationDate: incidenceData.CreationDate,
                Type: incidenceData.Type,
                Reason: incidenceData.Reason
            };
            debugger;
            const incidenceModelCreate: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;

            incidenceModelCreate.create("/IncidentsSet", body, {
                success: () => {
                    MessageToast.show(oResourceModel.getText("odataSavedOK") || "");
                    this.onReadODataIncidence(employeeId.toString());
                },
                error: function (e: any) {
                    MessageToast.show(oResourceModel.getText("odataSavedNoOK") || "");
                }.bind(this)
            });
        }
        else if (incidenceData.CreationDateX || incidenceData.ReasonX || incidenceData.TypeX) {
            const body = {
                CreationDate: incidenceData.CreationDate,
                CreationDateX: incidenceData.CreationDateX,
                Type: incidenceData.Type,
                TypeX: incidenceData.TypeX,
                Reason: incidenceData.Reason,
                ReasonX: incidenceData.ReasonX
            };
            const incidenceModelUpdate: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;
            const updRoute = "/IncidentsSet(" +
                "IncidenceId='" + incidenceData.IncidenceId +
                "',SapId='" + Component.SapId +
                "',EmployeeId='" + employeeId.toString() + "')";
            debugger;
            incidenceModelUpdate.update(updRoute, body, {
                success: () => {
                    MessageToast.show(oResourceModel.getText("odataUpdateOK") || "");
                    this.onReadODataIncidence(employeeId.toString());
                },
                error: function (e: any) {
                    MessageToast.show(oResourceModel.getText("odataUpdateNoOK") || "");
                }.bind(this)
            });
        }
        else {
            MessageToast.show(oResourceModel.getText("odataNoChanges") || "");
        }
        debugger;
    }

    private onReadODataIncidence(employeeID: number) {
        const incidenceModelCreate: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;
        incidenceModelCreate.read("/IncidentsSet", {
            filters: [
                new Filter("SapId", FilterOperator.EQ, Component.SapId),
                new Filter("EmployeeId", FilterOperator.EQ, employeeID.toString())
            ],
            success: (data: any) => {
                const incidenceModel: JSONModel = this._detailEmployeeView.getModel("incidenceModel") as JSONModel;
                incidenceModel.setData(data.results);
                const oTableIncidence: Panel = this._detailEmployeeView?.byId("tableIncidence") as Panel;
                oTableIncidence.removeAllContent();
                debugger;
                data.results.forEach((incidence: any, index: number) => {
                    incidence._ValidateDate = true;
                    Fragment.load({
                        name: "logaligroup.logali.fragment.NewIncidence",
                        controller: this._detailEmployeeView?.getController()
                    }).then((newInc) => {
                        const newIncidence = newInc as Control;
                        this._detailEmployeeView.addDependent(newIncidence);
                        newIncidence.bindElement("incidenceModel>/" + index);
                        oTableIncidence.addContent(newIncidence);

                    }).catch((error) => {
                        console.error("Error loading fragment:", error);
                    });
                });
            },
            error: (e: any) => {
            }
        });
        //        
        // this._detailEmployeeView.setBusy(true);
        //         incidenceModelCreate.read("/IncidentsSet", {
        //             filters: [
        //                 new Filter("SapId", FilterOperator.EQ, Component.SapId),
        //                 new Filter("EmployeeId", FilterOperator.EQ, employeeID.toString())
        //             ],
        //             success: (data: any) => {
        //                 const incidenceModel: JSONModel = this._detailEmployeeView.getModel("incidenceModel") as JSONModel;
        //                 incidenceModel.setData(data.results);
        //                 const oTableIncidence: Panel = this._detailEmployeeView?.byId("tableIncidence") as Panel;
        //                 oTableIncidence.removeAllContent();

        //                 const fPromises = data.results.map((incidence: any, index: number) => {
        //                     return Fragment.load({
        //                         name: "logaligroup.logali.fragment.NewIncidence",
        //                         controller: this
        //                     }).then((newInc) => {
        //                         debugger;
        //                         const newIncidence = newInc as Control;
        //                         this._detailEmployeeView.addDependent(newIncidence);
        //                         newIncidence.bindElement("incidenceModel>/" + index);
        //                         oTableIncidence.addContent(newIncidence);
        //                     }).catch((error) => {
        //                         console.error("Error loading fragment:", error);
        //                     });
        //                 });

        //                 Promise.all(fPromises)
        //                     .then(() => {
        //                         this._detailEmployeeView.setBusy(false);
        //                     })
        //                     .catch((e: any) => {
        //                         this._detailEmployeeView.setBusy(false);
        //                     });
        //             },
        //             error:  (e: any) => {
        //                 this._detailEmployeeView.setBusy(false);
        //             } 
        //         });
    }

    private onDeleteODataIncidence(channelId: string, eventId: string, data: { incidenceRow: number }): void | undefined {
        const oResourceModel = <ResourceBundle>(
            (<ResourceModel>(
                this.getOwnerComponent()?.getModel("i18n")
            ))?.getResourceBundle()
        );
        const employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind")?.getObject().EmployeeID;
        const incidenceModel: ODataModel = this._detailEmployeeView.getModel("incidenceModel") as ODataModel;
        const incidenceContext = incidenceModel
        const incidenceData = incidenceModel.getProperty("/0") as Incidence;
        const incidenceModelUpdate: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;
        const deleteRoute = "/IncidentsSet(" +
            "IncidenceId='" + incidenceData.IncidenceId +
            "',SapId='" + Component.SapId +
            "',EmployeeId='" + employeeId.toString() + "')";
        incidenceModelUpdate.remove(deleteRoute, {
            success: () => {
                MessageToast.show(oResourceModel.getText("odataDeleteOK") || "");
                this.onReadODataIncidence(employeeId.toString());
            },
            error: function (e: any) {
                MessageToast.show(oResourceModel.getText("odataDeleteNoOK") || "");
            }.bind(this)
        });
    }

}
