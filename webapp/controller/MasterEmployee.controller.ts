/* eslint-disable no-console */
/* eslint-disable max-statements */
import Controller from "sap/ui/core/mvc/Controller";
import Input from "sap/m/Input";
import Label from "sap/m/Label";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Select from "sap/m/Select";
import Table from "sap/m/Table";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import ColumnListItem from "sap/m/ColumnListItem";
import Context from "sap/ui/model/Context";
import { Icon$PressEvent } from "sap/ui/core/Icon";
import Fragment from "sap/ui/core/Fragment";
import Dialog from "sap/m/Dialog";
import EventBus from "sap/ui/core/EventBus";
 import formatter from "../model/formatter";


/**
 * @namespace logaligroup.logali.controller
 */
export default class MasterEmployee extends Controller {
   public formatter = formatter;
   private _oDialogOrders: Dialog;
   private _bus: EventBus;

   /*eslint-disable @typescript-eslint/no-empty-function*/
   public onInit(): void {
      this._bus = EventBus.getInstance();
   }

   public onValidation(): void {
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
      const oSelectedItem: ColumnListItem = oEvent.getParameter("listItem" as never);
      const oContext: Context = oSelectedItem.getBindingContext("odataNorthwind") as Context;
      const sPath = oContext.getPath();
      const oSelectedData = oView.getModel("odataNorthwind")?.getProperty(sPath);

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
   public showOrders(oEvent: Icon$PressEvent): void {
      //Get selected controller
      const iconPressed = oEvent.getSource();

      //Context from Model
      const oContext: Context = iconPressed.getBindingContext("odataNorthwind") as Context;
      const sPath = oContext.getPath();

      Fragment.load({
         name: "logaligroup.logali.fragment.DialogOrders",
         controller: this
      }).then((oDialog) => {
         this._oDialogOrders = oDialog as Dialog;
         //Dialog binding to the Context to have access to the data of the selected item         
         this._oDialogOrders.bindElement("odataNorthwind>" + sPath);
         //Add Dialog to the view
         this.getView()?.addDependent(this._oDialogOrders);
         //Open Dialog
         this._oDialogOrders.open();
      }).catch((error) => {
         console.error("Error loading fragment:", error);
      });

   }

   public onCloseDialog(): void {
      this._oDialogOrders.close();
   }

   public showEmployee(oEvent: Event): void {
      const rowPressed: ColumnListItem = oEvent.getSource();
      const oContext: Context = rowPressed.getBindingContext("odataNorthwind") as Context;
      const sPath: string = oContext.getPath().toString();
      this._bus.publish("flexible", "showEmployee", { path: sPath });

   }

   // public showOrders(oEvent: Event): void {
   //    const ordersTable = this.getView()?.byId("ordersTable") as HBox;
   //    ordersTable.destroyItems();
   //    const oSelectedItem: ColumnListItem = oEvent.getSource();
   //    const oContext: Context = oSelectedItem.getBindingContext("employee") as Context;
   //    const orders: Order[] = (oContext.getObject() as { Orders: Order[] }).Orders;
   //    let ordersItems: ColumnListItem[] = [];
   //    orders.forEach(order => {
   //       ordersItems.push(
   //          new ColumnListItem({
   //             cells: [
   //                new Label({ text: order.OrderID.toString() }),
   //                new Label({ text: order.Freight.toString() }),
   //                new Label({ text: order.ShipAddress.toString() })
   //             ]
   //          }));
   //    });
   //    const newTable = new Table(
   //       {
   //          width: "auto",
   //          columns: [
   //             new Column({
   //                header:
   //                   new Label({ text: "{i18n>orderID}" })
   //             }),
   //             new Column({
   //                header:
   //                   new Label({ text: "{i18n>freight}" })
   //             }),
   //             new Column({
   //                header:
   //                   new Label({ text: "{i18n>shipAddress}" })
   //             })
   //          ],
   //          items: ordersItems
   //       }
   //    ).addStyleClass("sapUiSmallMargin");
   //    ordersTable.addItem(newTable);

   //    const newTableJSON = new Table()
   //       .setWidth("auto")
   //       .addStyleClass("sapUiSmallMargin");

   //    const columnOrderID = new Column();
   //    const labelOrderID = new Label();
   //    labelOrderID.bindProperty("text", { path: "i18n>orderID" });
   //    columnOrderID.setHeader(labelOrderID);
   //    newTableJSON.addColumn(columnOrderID);

   //    const columnFreight = new Column();
   //    const labelFreight = new Label();
   //    labelFreight.bindProperty("text", { path: "i18n>freight" });
   //    columnFreight.setHeader(labelFreight);
   //    newTableJSON.addColumn(columnFreight);

   //    const columnShipAddress = new Column();
   //    const labelShipAddress = new Label();
   //    labelShipAddress.bindProperty("text", { path: "i18n>shipAddress" });
   //    columnShipAddress.setHeader(labelShipAddress);
   //    newTableJSON.addColumn(columnShipAddress);

   //    const columnListItem = new ColumnListItem();

   //    const cellOrderID = new Label();
   //    cellOrderID.bindProperty("text", { path: "odataNorthwind>OrderID" });
   //    columnListItem.addCell(cellOrderID);

   //    const cellFreight = new Label();
   //    cellFreight.bindProperty("text", { path: "employee>Freight" });
   //    columnListItem.addCell(cellFreight);

   //    const cellShipAddress = new Label();
   //    cellShipAddress.bindProperty("text", { path: "employee>ShipAddress" });
   //    columnListItem.addCell(cellShipAddress);

   //    const oBindingInfo: AggregationBindingInfo = {
   //       model: "employee",
   //       path: "Orders",
   //       template: columnListItem
   //    };

   //    newTableJSON.bindAggregation("items", oBindingInfo);
   //    const sPath = oContext.getPath();
   //    newTableJSON.bindElement("employee>" + sPath);

   //    ordersTable.addItem(newTableJSON);

   // }

}
