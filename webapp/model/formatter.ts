import DateFormat from "sap/ui/core/format/DateFormat";
import ResourceBundle from "sap/base/i18n/ResourceBundle";

/**
 * @namespace logaligroup.logali.model
 */

export default class formatter {

    public static dateFormat(date?: Date): string {
        if (!date) {
            return "";
        }
        const Today: Date = new Date();
        const Tomorrow: Date = new Date();
        const Yesterday: Date = new Date();
        Tomorrow.setDate(Today.getDate() + 1);
        Yesterday.setDate(Today.getDate() - 1);
        const dateFormat = DateFormat.getDateInstance({ pattern: 'yyyy/MM/dd' });
        const oResourceBundle: ResourceBundle = this.getOwnerComponent()?.getModel("i18n")?.getResourceBundle() as ResourceBundle;

        switch (dateFormat.format(date)) {
            case dateFormat.format(Today):
                return oResourceBundle.getText("today") || "";
                break;
            case dateFormat.format(Tomorrow):
                return oResourceBundle.getText("tomorrow") || "";
                break;
            case dateFormat.format(Yesterday):
                return oResourceBundle.getText("yesterday") || "";
                break;
            default:
                return "";
                break;
        }
    }
}
