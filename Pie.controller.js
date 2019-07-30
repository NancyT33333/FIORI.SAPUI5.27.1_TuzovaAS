sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/BindingMode',
	'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/viz/ui5/api/env/Format',
	'./InitPage',
	"sap/viz/ui5/controls/Popover",
	'sap/ui/core/HTML'
], function (Controller, BindingMode, JSONModel, ChartFormatter, Format, InitPageUtil, Popover, HTMLControl) {
	"use strict";

	var Controller = Controller.extend("sap.viz.sample.Pie.Pie", {
		dataPath:"sap/viz/sample/Pie/test-sources",
		// dataPath: "test-resources/sap/viz/demokit/dataset/milk_production_testing_data/revenue_cost_consume",
		oVizFrame: null,

		onInit: function (evt) {
			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame"),
				dataModel = new JSONModel(sap.ui.require.toUrl(this.dataPath + "/medium.json")),
				oPopOver = this.oPopOver = new Popover(),
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
			oVizFrame.setVizProperties(this.getOwnerComponent().getModel().getProperty("/paletteTypes/vizProperties")[1]);
			

			oPopOver.connect(oVizFrame.getVizUid());
			
			InitPageUtil.initPageSettings(this.getView());
			oPopOver.setFormatString(ChartFormatter.DefaultPattern.SHORTFLOAT);
			dataModel.attachRequestCompleted(function () {
				that.oVizFrame.setModel(this);
				that.dataSort(this.getData());
				that.oPopOver.setCustomDataControl(function (data) {
					if (data.data.val) {
						var exData = this.getData().milk,
							values = data.data.val,
							divStr = "",
							sStoreName = values[0].value,
							oStore = exData.find((el) => {return (el["Store Name"] === sStoreName)}),
							oFormatter = ChartFormatter.getInstance();	
							
						divStr = divStr + "<b style='margin-left:30px'>" + values[0].value + "</b>";
						divStr = divStr + "<div style = 'margin: 5px 30px 0 30px'>Revenue<span style = 'float: right'>" + oFormatter.format(values[1].value, that.oPopOver.getFormatString()) +
							"</span></div>";
						divStr = divStr + "<div style = 'margin: 5px 30px 0 30px'>" + "Cost<span style = 'float: right'>" +  oFormatter.format(oStore["Cost"], that.oPopOver.getFormatString()) +
							"</span></div>";
						divStr = divStr + "<div style = 'margin: 5px 30px 15px 30px'>" + "Consumption<span style = 'float: right'>" + oFormatter.format(oStore["Consumption"], that.oPopOver.getFormatString()) +
							"</span></div>";
						return new HTMLControl({
							content: divStr
						});
					}
				}.bind(this));
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
					dataModel = new JSONModel(sap.ui.require.toUrl(this.dataPath + bindValue.value)),
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