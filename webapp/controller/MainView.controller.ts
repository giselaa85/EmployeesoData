import Controller from "sap/ui/core/mvc/Controller";
import Input from "sap/m/Input";
import ComboBox from "sap/m/ComboBox";
import Label from "sap/m/Label";

/**
 * @namespace logaligroup.logali.controller
 */
export default class MainView extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
    }

    public onValidation() {
       const oInput = this.getView()?.byId("inputEmployee") as Input;
    //    oInput.setDescription(oInput.getValue().length === 6 ? "OK": "Not OK");
    const oLabel = this.getView()?.byId("labelCountry") as Label;   
    const oCombo = this.getView()?.byId("comboCountry") as ComboBox;
       if(oInput.getValue().length === 6){
        oLabel.setVisible(true);
        oCombo.setVisible(true);
       }
       else{
        oLabel.setVisible(false);
        oCombo.setVisible(false);
        oCombo.setValue("");
       }
    }
}