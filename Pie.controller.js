sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'./InitPage'
], function (Controller, BindingMode, JSONModel, ChartFormatter, Format, InitPageUtil) {
	"use strict";

	var Controller = Controller.extend("sap.viz.sample.Pie.Pie", {

		dataPath: "test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume",

		oVizFrame: null,

		onInit: function (evt) {
			
			Format.numericFormatter(ChartFormatter.getInstance());
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				legend: {
					title: {
						visible: false
					}
				},
				title: {
					visible: false
				}
			});
			// apply Semantic Bad pallete rules
			oVizFrame.setVizProperties(this.getView().getModel().getProperty("/paletteTypes/vizProperties")[1]);
			var dataModel = new JSONModel(this.dataPath + "/medium.json");
			oVizFrame.setModel(dataModel);

			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);

			InitPageUtil.initPageSettings(this.getView());
			
			var that = this;
			dataModel.attachRequestCompleted(function () {
				that.dataSort(this.getData());
			});
		},

		onVizTypeSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			this.oVizFrame.setVizType(oSource.getText());
		},

		handleStchChange: function () {
			var oVizProperties;
			var bNeutral = this.getView().getModel().getProperty("/paletteTypes/neutralEnabled");
			switch (bNeutral) {
				case true:
					oVizProperties = this.getView().getModel().getProperty("/paletteTypes/vizProperties")[1];
					break;
				case false:
					oVizProperties = this.getView().getModel().getProperty("/paletteTypes/vizProperties")[0];
				break;
			} 
			this.oVizFrame.setVizProperties(oVizProperties);
		},

		dataSort: function (dataset) {
			//let data sorted by revenue
			if (dataset && dataset.hasOwnProperty("milk")) {
				var arr = dataset.milk;
				arr = arr.sort(function (a, b) {
					return b.Revenue - a.Revenue;
				});
			}
		},
		onAfterRendering: function () {
			var oModel = this.getView().getModel();
			var datasetRadioGroup = this.getView().byId('datasetRadioGroup');
			datasetRadioGroup.setSelectedIndex(oModel.getProperty("/dataset/defaultSelected"));
			

			var seriesRadioGroup = this.getView().byId('seriesRadioGroup');
			seriesRadioGroup.setSelectedIndex(oModel.getProperty("/series/defaultSelected"));
			seriesRadioGroup.setEnabled(oModel.getProperty("/series/enabled"));

			var axisTitleSwitch = this.getView().byId('axisTitleSwitch');
			axisTitleSwitch.setEnabled(oModel.getProperty("/axisTitle/enabled")); 
			
		},
		onDataLabelChanged: function (oEvent) {
			if (this.oVizFrame) {
				this.oVizFrame.setVizProperties({
					plotArea: {
						dataLabel: {
							visible: oEvent.getParameter('state')
						}
					}
				});
			}
		},
		onDatasetSelected: function (oEvent) {
			var datasetRadio = oEvent.getSource();
			if (this.oVizFrame && datasetRadio.getSelected()) {
				var bindValue = datasetRadio.getBindingContext().getObject();
				var dataModel = new JSONModel(this.dataPath + bindValue.value);
				this.oVizFrame.setModel(dataModel);
				var that = this;
				this.oVizFrame.getModel().attachRequestCompleted(function () {
					that.dataSort(this.getData());
				});
			}
		}
	});

	return Controller;

});