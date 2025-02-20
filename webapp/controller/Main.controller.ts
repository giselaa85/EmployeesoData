/* eslint-disable no-console */
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import EventBus from "sap/ui/core/EventBus";
import Panel from "sap/m/Panel";

/**
 * @namespace logaligroup.logali.controller
 */
export default class Main extends Controller {
    private _bus: EventBus;
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

}