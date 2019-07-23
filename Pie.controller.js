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
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame"),
				dataModel = new JSONModel(this.dataPath + "/medium.json"),
				oPopOver = this.getView().byId("idPopOver"),
				that = this;
			
			Format.numericFormatter(ChartFormatter.getInstance());
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
			// apply SemanticBad pallete rules
			oVizFrame.setVizProperties(this.getView().getModel().getProperty("/paletteTypes/vizProperties")[1]);
			oVizFrame.setModel(dataModel);

			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);

			InitPageUtil.initPageSettings(this.getView());
			
			dataModel.attachRequestCompleted(function () {
				that.dataSort(this.getData());
			});
		},
		
		/**
		 * Handler for Rudiobutton select event
		 * Sets pie or donut VizType 
		 * @public
		 * @param {sap.ui.base.Event} oEvent
		 */
		onVizTypeSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			this.oVizFrame.setVizType(oSource.getText());
		},
		/**
		 * Handler for Switch change event
		 * Sets semantic bad or neutral palette
		 * @public
		 */
		handleStchChange: function () {
			var oVizProperties,
				bNeutral = this.getView().getModel().getProperty("/paletteTypes/neutralEnabled");
				
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
        /**
         * Helper method to sort selected dataset by Revenue   
         * @param {array} dataset 
         * @public
         */
		dataSort: function (dataset) {
			//let data sorted by revenue
			if (dataset && dataset.hasOwnProperty("milk")) {
				var arr = dataset.milk;
				arr = arr.sort(function (a, b) {
					return b.Revenue - a.Revenue;
				});
			}
		},

        /* sap.viz.sample.Pie sample's method*/		
		onAfterRendering: function () {
			var oModel = this.getView().getModel(),
				seriesRadioGroup = this.getView().byId('seriesRadioGroup'),
				datasetRadioGroup = this.getView().byId('datasetRadioGroup'),
				axisTitleSwitch = this.getView().byId('axisTitleSwitch');
				
			datasetRadioGroup.setSelectedIndex(oModel.getProperty("/dataset/defaultSelected"));
			seriesRadioGroup.setSelectedIndex(oModel.getProperty("/series/defaultSelected"));
			seriesRadioGroup.setEnabled(oModel.getProperty("/series/enabled"));
			axisTitleSwitch.setEnabled(oModel.getProperty("/axisTitle/enabled")); 
			
		},
		/**
		 * Handler for Switch dataLabelSwitch change event
		 * Toggles chart's data labels 
		 * @public
		 */
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
		/**
		 * Handler for RadioButton select event
		 * Changes dataset for the chart
		 * @public
		 */		
		onDatasetSelected: function (oEvent) {
			var datasetRadio = oEvent.getSource();
			if (this.oVizFrame && datasetRadio.getSelected()) {
				var bindValue = datasetRadio.getBindingContext().getObject(),
					dataModel = new JSONModel(this.dataPath + bindValue.value),
					that = this;
				this.oVizFrame.setModel(dataModel);
				this.oVizFrame.getModel().attachRequestCompleted(function () {
					that.dataSort(this.getData());
				});
			}
		}
	});

	return Controller;

});