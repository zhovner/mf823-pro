/**
 * 流量提醒模块
 * @module TrafficAlert
 * @class TrafficAlert
 */
define(['jquery', 'knockout', 'service', 'status/statusBar'], function($, ko, service, status) {
	/**
	 * 获取流量提醒数据
	 * @method getTrafficAlertInfo
	 */
	function getTrafficAlertInfo(){
		return service.getTrafficAlertInfo();
	}
	/**
	 * 流量提醒ViewModel
	 * @class TrafficVM
	 */
	function TrafficVM(){
		var self = this;
		var info = getTrafficAlertInfo();
		self.dataLimitChecked = ko.observable(info.dataLimitChecked == '0' ? '0' : '1');
		self.dataLimitTypeChecked = ko.observable(info.dataLimitTypeChecked == '0' ? '0' : '1');
		var dataMonth = info.limitDataMonth.split("_");
		self.limitDataMonth = ko.observable(dataMonth[0]);
		self.selectedDataUnit = ko.observable(dataMonth[1]);
		self.alertDataReach = ko.observable(info.alertDataReach);
		self.limitTimeMonth = ko.observable(info.limitTimeMonth);
		self.alertTimeReach = ko.observable(info.alertTimeReach);
		self.save = function(){
			showLoading('operating');
			service.setTrafficAlertInfo({
				dataLimitChecked: self.dataLimitChecked(),
				dataLimitTypeChecked: self.dataLimitTypeChecked(),
				limitDataMonth: self.limitDataMonth() + "_" + self.selectedDataUnit(),
				alertDataReach: parseInt(self.alertDataReach(), 10),
				limitTimeMonth: self.limitTimeMonth(),
				alertTimeReach: parseInt(self.alertTimeReach(), 10)
			}, function(data){
				if(data.result == 'success'){
                    status.setTrafficAlertPopuped(false);
					successOverlay();
				} else {
					errorOverlay();
				}
			}, function(data){
				errorOverlay();
			});
		};
	}
	/**
	 * 流量提醒初始化函数
	 * @method init
	 */
	function init(){
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
		var container = $('#container');
		ko.cleanNode(container[0]);
		var vm = new TrafficVM();
		ko.applyBindings(vm, container[0]);
		$('#trafficAlertForm').validate({
			submitHandler : function() {
				vm.save();
			},
			rules : {
				limitDataMonth : {
					digits : true,
					min : 1
				},
				limitTimeMonth : {
					digits : true,
					min : 1
				},
				alertDataReach : {
					digits : true,
					range : [ 1, 100 ]
				},
				alertTimeReach : {
					digits : true,
					range : [ 1, 100 ]
				}
			},
            errorPlacement : function(error, element) {
				if (element.attr("name") == "limitDataMonth") {
					error.insertAfter("#dataUnit");
				} else if (element.attr("name") == "alertDataReach") {
					error.insertAfter("#traffic_data_percent");
				} else if (element.attr("name") == "limitTimeMonth") {
					error.insertAfter("#hours");
				} else if (element.attr("name") == "alertTimeReach") {
					error.insertAfter("#traffic_time_percent");
				} else {
					error.insertAfter(element);
				}
			}
		});
	}
	
	return {
		init: init
	};
});