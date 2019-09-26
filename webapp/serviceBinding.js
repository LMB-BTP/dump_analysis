function initModel() {
	var sUrl = "/SAP_Gateway/sap/opu/odata/SAP/ZGW_APP_XX_0001_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}