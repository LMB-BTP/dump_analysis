/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"LMBR_CUSTOMER_APP/dump_analisys/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});