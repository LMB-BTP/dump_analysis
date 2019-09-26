sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("LMBR_CUSTOMER_APP.dump_analisys.controller.View1", {

		/*----------------------------------------------------
		Object: _chartConfig
		Object to agrouped all fields for Chart Control
		----------------------------------------------------*/
		_chartConfig: {

			// Seconds for Auto Refresh
			refreshSeconds: 20,

			// Minutes Interval for Comparison
			intervalMinutesComparison: 10,

			// Auto Refresh Switch
			autoRefresh: false,

			// Red Light 
			redLightStart: 5,
			redLightStartTemp: 5,

			// Last Date/Time Data
			lastDateTime: null,

			//--------------------------
			// Chart 01 Properties
			//--------------------------
			vizPropertiesChart01: {
				title: {
					text: "Quantidade"
				},

				plotArea: {
					colorPalette: ["#0066cc", "#5d9b31"],
					dataLabel: {
						visible: true
					},
					
					background:{
						color: "transparent"
					}					
					
				},

				legend: {
					title: {
						visible: false
					}
				},
				legendGroup: {
					layout: {
						position: "top"
					}
				},
				categoryAxis: {
					title: {
						text: "System",
						visible: true
					}
				}
				,
				valueAxis: {
					title: {
						visible: true
					}
				}
			},

			//--------------------------
			// Chart 02 Properties
			//--------------------------
			vizPropertiesChart02: {
				title: {
					text: "Crescimento (Qty)"
				},

				plotArea: {
					colorPalette: ["#5d9b31"],
					dataLabel: {
						visible: true
					},
					
					background:{
						color: "transparent"
					}					
					
				},

				legend: {
					visible: false
				},
				
				categoryAxis: {
					title: {
						text: "" ,
						visible: false
					}
				},
				valueAxis: {
					title: {
						text: "",
						visible: false
					}
				}
			},

			//--------------------------
			// Chart 03 Properties
			//--------------------------
			vizPropertiesChart03: {
				title: {
					text: "Crescimento (%)"
				},

				plotArea: {
					colorPalette: ["#5d9b31", "#ff9933"],
					dataLabel: {
						visible: true
					},
					
					background:{
						drawingEffect: "glossy",
						gradientDirection: "vertical",
						color: "transparent"
					}
				},

				legend: {
					visible: false
				},
				
				categoryAxis: {
					title: {
						text: "",
						visible: false
					}
				},
				
				valueAxis: {
					title: {
						text: "",
						visible: false
					}
				}
			}
		},

		/*----------------------------------------------------
		Function: onInit
		Target: Executed when Applications was started
		----------------------------------------------------*/
		onInit: function () {

			// Muda Títulos dos gráficos baseado em arquivo i18n
			this._chartConfig.vizPropertiesChart01.title.text = this.getView().getModel("i18n").getProperty("ChartQty");
			this._chartConfig.vizPropertiesChart02.title.text = this.getView().getModel("i18n").getProperty("ChartGrowthQty");
			this._chartConfig.vizPropertiesChart03.title.text = this.getView().getModel("i18n").getProperty("ChartGrowthPrc");

			// Generate JSONModel fro Graphics settings
			var oJsonModel = new JSONModel();

			// Settings of Charts displayed
			oJsonModel.setProperty('/chart/', this._chartConfig);
			this.getView().setModel(oJsonModel, "LocalData");
			
			window._oLocalModel = oJsonModel;

			// Create Interval Trigger for Auto Refresh, if enabled 
			// Initially without auto refresh
			self = this;
			self.IntervalTrigger = new sap.ui.core.IntervalTrigger(0);
			self.IntervalTrigger.addListener(function () {
				self.autoRefresh();
			});

			// Get Chart Data first time
			self._getChartData();

		},

		/*----------------------------------------------------
		Function: autoRefresh
		Target: Function for Auto Refresh Logic, started after 
				each X seconds
		----------------------------------------------------*/
		autoRefresh: function () {
			MessageToast.show(this.getView().getModel("i18n").getProperty("MessageSelectedData"), {
				duration: 500,
				at: "sap.ui.core.Popup.Dock.CenterCenter"
			});
			this._getChartData();
		},

		/*----------------------------------------------------
		Function: handleAutoRefresh
		Target: Function when "Auto Refresh" switch was changed
		----------------------------------------------------*/
		handleAutoRefresh: function (oControlEvent) {

			// JSon model
			var oJsonModel = this.getView().getModel("LocalData");

			// Identifica se Auto Refresh está ativo
			if (oControlEvent.getParameters().state === true) {

				// Get Seconds Informed and redefine new interval for refresh data
				var sSeconds = oJsonModel.getProperty("/chart/refreshSeconds");
				sSeconds = sSeconds * 1000;

				// Set Interval Refresh Data
				this.IntervalTrigger.setInterval(sSeconds);

			} else {
				this.IntervalTrigger.setInterval(0);
			}

			// Refresh Red Indicator Start at:
			var vRedLightStartTemp = oJsonModel.getProperty("/chart/redLightStartTemp");
			oJsonModel.setProperty("/chart/redLightStart", vRedLightStartTemp);

		},

		/*----------------------------------------------------
		Function: handleSettingsPress
		Target: Function when "Settings" buttons was clicked
		----------------------------------------------------*/
		handleSettingsPress: function (oEvent) {

			if (!this.settingsFragment) {
				this.settingsFragment = sap.ui.xmlfragment(this.getView().getId(), "LMBR_CUSTOMER_APP.dump_analisys.view.View1-Settings", this);
				this.getView().addContent(this.settingsFragment);
			}
			this.settingsFragment.open();

		},

		/*----------------------------------------------------
		Function: handleInfoPress
		Target: Function when "Settings" buttons was clicked
		----------------------------------------------------*/
		handleInfoPress: function (oEvent) {

			if (!this.infoFragment) {
				this.infoFragment = sap.ui.xmlfragment(this.getView().getId(), "LMBR_CUSTOMER_APP.dump_analisys.view.View1-Info", this);
				this.getView().addContent(this.infoFragment);
			}
			this.infoFragment.open();

		},

		/*----------------------------------------------------
		Function: handleClosePress
		Target: Function when "Settings" or "Info" close buttons was clicked
		----------------------------------------------------*/
		handleClosePress: function (oEvent) {

			// If Settings Fragment is Opened
			if (this.settingsFragment) {
				this.settingsFragment.close();
			}

			// If Info Fragment is Opened
			if (this.infoFragment) {
				this.infoFragment.close();
			}

		},

		/*----------------------------------------------------
		Function: _getDataBySystemsFI
		Target: Get Data from Function Import
		----------------------------------------------------*/
		_getDataBySystemsFI: function (oDataModel, oJsonModel) {

			// Callback para SUCCESS
			function onSuccess(oData, response) {

				// Status for Ligth Indicator
				// Status: GOOD
				var fNewBackGroundColor = "transparent";

				// Get RedStartAt Field
				var fRedStart = oJsonModel.getProperty("/chart/redLightStart");

				// Percorre os registros identificando os percentuais de crescimento
				for (var i = 0; i < oData.results.length; i++) {

					// Se quantidade for negativa, algum sistema está com erro 
					// no processamento (Status: ERROR)
					if (oData.results[i].QtyAtual < 0) {
						fNewBackGroundColor = "#ff3333"; // Vermelho
						i = oData.results.length;

					// Se Crescimento estiver acima do parametrizado
					// Status: ERROR
					} else if (oData.results[i].DifPrc >= fRedStart) {
						fNewBackGroundColor = "#ff3333"; // Vermelho
						i = oData.results.length;

					}

				}				

				// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
				// ALCA
				// Local Backup for charts settings variables
				var oChartConfg01 = oJsonModel.getProperty("/chart/BKPvizPropertiesChart01");
				oJsonModel.setProperty("/chart/vizPropertiesChart01", oChartConfg01);
				
				var oChartConfg02 = oJsonModel.getProperty("/chart/BKPvizPropertiesChart02");
				oJsonModel.setProperty("/chart/vizPropertiesChart02", oChartConfg02);
				
				var oChartConfg03 = oJsonModel.getProperty("/chart/BKPvizPropertiesChart03");
				oJsonModel.setProperty("/chart/vizPropertiesChart03", oChartConfg03);
				// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
				
				// Change color background
				oChartConfg03.plotArea.background.color = fNewBackGroundColor;
				
				// Change Background color using Method because this property is unavaiable for Binding
				var oVizFrameDesktopChart03 = this.getView().byId("DesktopChart03");
				oVizFrameDesktopChart03.setVizProperties(oChartConfg03);
				
				var oVizFrameMobileChart03 = this.getView().byId("MobileChart03");
				oVizFrameMobileChart03.setVizProperties(oChartConfg03);				

				// Atualiza modelo com novos dados
				oJsonModel.setProperty("/BySystems", oData.results);

			}

			// Callback para ERROR
			function onError(oError) {
				MessageBox.alert("Erro on path '/BySystemsFI' :" + oError.responseText);

			}

			//----------------------------
			// Read Data from "/BySystemsFI" Function Import
			//----------------------------
			var oParam_FI = {

				urlParameters: {
					'second_less': 0
				},

				method: "GET",

				// CallBack para Sucesso
				success: onSuccess.bind(this),
				error: onError.bind(this)
				
			};

			// Calculate 'second_less' for processing
			var sMinutes = oJsonModel.getProperty("/chart/intervalMinutesComparison");
			oParam_FI.urlParameters.second_less = sMinutes * 60;

			// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
			// ALCA
			// Local Backup for charts settings variables
			var oChartConfg01 = oJsonModel.getProperty("/chart/vizPropertiesChart01");
			oJsonModel.setProperty("/chart/BKPvizPropertiesChart01", oChartConfg01);
			
			var oChartConfg02 = oJsonModel.getProperty("/chart/vizPropertiesChart02");
			oJsonModel.setProperty("/chart/BKPvizPropertiesChart02", oChartConfg02);
			
			var oChartConfg03 = oJsonModel.getProperty("/chart/vizPropertiesChart03");
			oJsonModel.setProperty("/chart/BKPvizPropertiesChart03", oChartConfg03);
			// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
			

			// Call function Import on SAP Gateway
			oDataModel.callFunction("/BySystemsFI", oParam_FI);

		},

		/*----------------------------------------------------
		Function: _getDataSystemsConfig
		Target: Get Data from EntitySet
		----------------------------------------------------*/
		_getDataSystemsConfig: function (oDataModel, oJsonModel) {

			// CallBack para Sucesso
			function onSuccess(oData, response) {
				oJsonModel.setProperty("/SystemConfigs", oData.results);
			}

			// CallBack para Erro
			function onError(oError) {
				MessageBox.alert("Erro na pesquisa dos dados da EntitySet '/SystemConfigs' :" + oError.responseText);

			}

			//----------------------------
			// Read Data from "/SystemConfigs" Entity Set
			//----------------------------
			var oParam_QUERY = {

				// CallBack para Sucesso
				success: onSuccess,
				error: onError

			};

			// Call QUERY on Entity Set Import on SAP Gateway
			oDataModel.read("/SystemConfigs", oParam_QUERY);

		},

		/*----------------------------------------------------
		Function: _getChartData
		Target: Function to get chart Data from Odata Model
		----------------------------------------------------*/
		_getChartData: function () {

			// Get Default Model from View (OData and JSONModel)
			var oDataModel = this.getView().getModel();
			var oJsonModel = this.getView().getModel("LocalData");
			oJsonModel.setProperty("/chart/lastDateTime", new Date().toLocaleString());

			// Get Data BySystemsFI
			this._getDataBySystemsFI(oDataModel, oJsonModel);

			// Get Data SystemConfigs
			this._getDataSystemsConfig(oDataModel, oJsonModel);

		}
	});
});