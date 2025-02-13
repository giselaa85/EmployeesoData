import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import View from "sap/ui/core/mvc/View";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ListBinding from "sap/ui/model/ListBinding";

const CountryFormatter = {
    countryName: function (this: Controller, sCountry: string): string {
        const oView: View = this.getView() as View;
        const oModel : JSONModel = oView.getModel("employee") as JSONModel;
        const oCountries = oModel.getProperty("/ListCountry");
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
        // const inventory = [
        //     { name: "apples", quantity: 2 },
        //     { name: "bananas", quantity: 0 },
        //     { name: "cherries", quantity: 5 },
        //   ];          
        //   const result = inventory.find(({ name }) => name === "cherries");
        return oCountries.find((country: { Key: string; }) => country.Key === sCountry).Text;
    }

};
export default CountryFormatter;