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

/**
 * @namespace logaligroup.logali.controller
 */
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

        this._bus.subscribe("incidence", "onSaveIncidence", this.onSaveODataIncidence, this);

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

    }

    private onSaveODataIncidence(channelId, eventId, data): void | undefined {
        debugger;
        const oResourceModel = <ResourceBundle>(
            (<ResourceModel>(
                this.getOwnerComponent()?.getModel("i18n")
            ))?.getResourceBundle()
        );
        const employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind")?.getObject().EmployeeID;
        const incidenceModel: ODataModel = this._detailEmployeeView.getModel("incidenceModel") as ODataModel;
        const incidenceContext = incidenceModel
        const incidenceModelData = incidenceModel.getData();
        const incidenceData = incidenceModelData[data.incidenceRow];
        if (typeof (incidenceData.IncidenceId == "undefined")) {
            // SapId : this.getOwnerComponent()?.SapId,
            const body = {
                SapId: "gisela.agusti@gmail.com",
                EmployeeId: employeeId.toString(),
                CreationData: incidenceData.CreationDate,
                Type: incidenceData.Type,
                Reason: incidenceData.Reason
            };

            const newBody = {
                            SapId: "test@test.com",
                            EmployeeId: "112",
                            CreationDate: "2025-02-23T15:00:00",
                            Type: "1",
                            Reason: "reason"
                          };
          debugger;                          

            const incidenceModelCreate: ODataModel = this.getView()?.getModel("incidenceModel") as ODataModel;
 
            incidenceModelCreate.create("/IncidentsSet", body, {
                success: function () {
                    MessageToast.show(oResourceModel.getText("odataSavedOK") || "");
                }.bind(this),
                error: function (e: any) {
                    MessageToast.show(oResourceModel.getText("odataSavedNoOK") || "");
                }.bind(this)
            });
        }
        else {
            MessageToast.show(oResourceModel.getText("odataNoChanges") || "");
        }
        debugger;
 


    }
}