import Controller from "sap/ui/core/mvc/Controller";
import Input from "sap/m/Input";
import Label from "sap/m/Label";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import Select from "sap/m/Select";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import CountryFormatter from "../model/CountryFormatter";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import ColumnListItem from "sap/m/ColumnListItem";
import Context from "sap/ui/model/Context";

/**
 * @namespace logaligroup.logali.controller
 */
export default class MainView extends Controller {

   public formatter = CountryFormatter;

   /*eslint-disable @typescript-eslint/no-empty-function*/
   public onInit(): void {
      const oView: View = this.getView() as View;
      const oRBundle: ResourceBundle =
         <ResourceBundle>(
            (<ResourceModel>(
               this.getOwnerComponent()?.getModel("i18n")
            ))?.getResourceBundle()
         );
      // const oJSON = {
      //    employeeId: "123456",
      //    countryKey: "UK",
      //    listCountry: [
      //       {
      //          key: oRBundle.getText("keyUS"),
      //          text: oRBundle.getText("valueUS")
      //       },
      //       {
      //          key: oRBundle.getText("keyUK"),
      //          text: oRBundle.getText("valueUK")
      //       },
      //       {
      //          key: oRBundle.getText("keyES"),
      //          text: oRBundle.getText("valueES")
      //       }
      //    ]
      // };
      // oJSONModel.setData(oJSON);
      // oView.setModel(oJSONModel, "employee");
      const oJSONModelEmployee = new JSONModel;
      oJSONModelEmployee.loadData("./localService/mockdata/Employees.json");
      oView.setModel(oJSONModelEmployee, "employee");

      const oJSONModelCountries = new JSONModel;
      oJSONModelCountries.loadData("./localService/mockdata/Countries.json");
      oView.setModel(oJSONModelCountries, "country");

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

      // this.onValidation();
   }

   public onValidation(): void {
      const oView: View = this.getView() as View;
      const oInput = this.getView()?.byId("inputEmployee") as Input;
      //    oInput.setDescription(oInput.getValue().length === 6 ? "OK": "Not OK");
      const oLabel = this.getView()?.byId("labelCountry") as Label;
      const oCombo = this.getView()?.byId("comboCountry") as Select;
      if (oInput.getValue().length === 6) {
         oLabel.setVisible(true);
         oCombo.setVisible(true);
      }
      else {
         oLabel.setVisible(false);
         oCombo.setVisible(false);
      }
   }

   public onFilter() {
      const oView: View = this.getView() as View;
      const oTable = oView.byId("idEmployeesTable") as Table;
      const oBinding = oTable.getBinding("items") as ListBinding;
      // const oCombo = this.getView()?.byId("comboCountry") as Select;
      // const oInput = this.getView()?.byId("inputEmployee") as Input;
      const oModel: JSONModel = oView.getModel("country") as JSONModel;

      let oFilter: Filter[] = [];
      if (oModel.getProperty("/CountryKey")) {
         // oFilter.push(new Filter("Country", FilterOperator.EQ, oCombo.getSelectedKey()));}
         oFilter.push(new Filter("Country", FilterOperator.EQ, oModel.getProperty("/CountryKey")));
      }
      if (oModel.getProperty("/EmployeeID")) {
         // oFilter.push(new Filter("EmployeeID", FilterOperator.EQ, oInput.getValue()));}
         oFilter.push(new Filter("EmployeeID", FilterOperator.EQ, oModel.getProperty("/EmployeeID")));
      }

      oBinding.filter(oFilter);
   }

   public onClearFilter(): void {
      const oView: View = this.getView() as View;
      const oModel: JSONModel = oView.getModel("country") as JSONModel;
      oModel.setProperty("/EmployeeID", "");
      oModel.setProperty("/CountryKey", "");
      let oFilter: Filter[] = [];
      const oTable = oView.byId("idEmployeesTable") as Table;
      const oBinding = oTable.getBinding("items") as ListBinding;
      oBinding.filter(oFilter);

   }

   public onCellPress(oEvent: Event): void {
      const oView: View = this.getView() as View;
      const oSelectedItem2: ColumnListItem = oEvent.getParameter("listItem" as never);
      const oContext: Context = oSelectedItem2.getBindingContext("employee") as Context;
      const sPath = oContext.getPath();
      const oSelectedData = oView.getModel("employee")?.getProperty(sPath);
      debugger;
      MessageToast.show(oSelectedData.EmployeeID + ": " + oSelectedData.PostalCode);
   }

   public onShowCity(): void {
      const oView: View = this.getView() as View;
      const oModel: JSONModel = oView.getModel("jsonModelConfig") as JSONModel;
      oModel.setProperty("/visibleCity", true);
      oModel.setProperty("/visibleBtnShowCity", false);
      oModel.setProperty("/visibleBtnHideCity", true);
   }

   public onHideCity(): void {
      const oView: View = this.getView() as View;
      const oModel: JSONModel = oView.getModel("jsonModelConfig") as JSONModel;
      oModel.setProperty("/visibleCity", false);
      oModel.setProperty("/visibleBtnShowCity", true);
      oModel.setProperty("/visibleBtnHideCity", false);
   }

}
