/**
 * HOME模块
 * @module Home
 * @class Home
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore', 'status/statusBar' ],

function($, ko, config, service, _, statusBar) {


    var initUSSD=true;
    var timeOutFlag=0;//计时
    var interval=0;
	/**
	 * connection information ViewModel
	 * 
	 * @class connectInfoVM
	 */
	function connectInfoVM() {
		var self = this;
		var info = service.getConnectionInfo();
		self.connectStatus = ko.observable(info.connectStatus);
        self.connectWifiSSID = ko.observable(info.connectWifiSSID);
        self.connectWifiStatus = ko.observable(info.connectWifiStatus);
        self.uploadRate = ko.observable(info.data_counter.uploadRate);
        self.downloadRate = ko.observable(info.data_counter.downloadRate);
        self.wifiStatusText = ko.observable();

        self.pbmNum =  ko.observable();
        self.capabilitySMS = ko.observable(updateSmsCapabilityStatus());
        if (checkConnectedStatus(info.connectStatus)) {
			self.current_Flux = ko.observable(transUnit(parseInt(info.data_counter.currentReceived, 10) + parseInt(info.data_counter.currentSent, 10), false));
			//self.total_Flux = ko.observable(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
			self.connected_Time = ko.observable(transSecond2Time(info.data_counter.currentConnectedTime));
			self.up_Speed = ko.observable(transUnit(info.data_counter.uploadRate, true));
			self.down_Speed = ko.observable(transUnit(info.data_counter.downloadRate, true));
		} else {
			self.current_Flux = ko.observable(transUnit(0, false));
			self.connected_Time = ko.observable(transSecond2Time(0));
			self.up_Speed = ko.observable(transUnit(0, true));
			self.down_Speed = ko.observable(transUnit(0, true));
		}
        self.hasWifi = ko.observable(config.HAS_WIFI);
		self.transText = ko.dependentObservable(function() {
			if (checkConnectedStatus(self.connectStatus())) {
				return "disconnect";
			} else {
				return "connect";
			}
		});
		
		self.canConnect = ko.observable(getCanConnectNetWork());
        self.connectStatusText = ko.observable();
		self.imagePath = ko.dependentObservable(function() {
            var connectionStatus = "";
            if (self.connectStatus() == "ppp_disconnected") {
                if (self.connectWifiSSID() && self.connectWifiStatus() == "connect") {
                    if(self.wifiStatusText() && self.wifiStatusText() !=""){
                        connectionStatus = self.wifiStatusText();
                    }
                } else if (self.connectWifiSSID() && self.connectWifiStatus() == "connecting") {
                    connectionStatus = "img/connecting.gif";
                } else {
                    connectionStatus = "img/disconnect.png";
                }
            }else if (self.connectStatus() == "ppp_connecting" || self.connectStatus() == "wifi_connecting") {
                connectionStatus = "img/connecting.gif";
            }else if(self.connectStatus() == "ppp_disconnecting"){
                connectionStatus = "img/disconnecting.gif";
            } else {
                if (self.uploadRate() != '0' && self.downloadRate() != '0') {
                    connectionStatus = "img/connect.png";
                } else if (self.uploadRate() != '0' && self.downloadRate() == '0') {
                    connectionStatus = "img/connect.png";
                } else if (self.uploadRate() == '0' && self.downloadRate() != '0') {
                    connectionStatus = "img/connect.png";
                } else {
                    connectionStatus = "img/connect.png";
                }
            }
            return connectionStatus;
		});

        //var devices = service.getCurrentlyAttachedDevicesInfo();
        var dev = fixAttachedDevicesInfo([]);
        self.deviceInfo = ko.observable(dev);
		
		self.supportQrCode = ko.observable(config.WIFI_SUPPORT_QR_CODE);
		self.qrcode_ssid1 = ko.observable(getRQCodeImage(true));

        function updateSmsCapabilityStatus() {
            service.getSmsCapability({}, function (capability) {
                var dataCp =(capability.nvUsed > capability.nvTotal ? capability.nvTotal : capability.nvUsed) + "/" + capability.nvTotal;
                self.capabilitySMS(dataCp);
            });
        }
        /**
         * 获取电话本信息，并与短消息关联
         * @method getPhoneBooks
         */
        getPhoneBooks();
        function getPhoneBooks() {
            var books = service.getPhoneBooks({
                page : 0,
                data_per_page : 2000,
                orderBy : "name",
                isAsc : true
            });
            if ($.isArray(books.pbm_data) && books.pbm_data.length > 0) {
                config.phonebook = books.pbm_data;
            }
        }
        /**
         * 获取聊天对象的名字
         * @method getNameByNumber
         * @param {String} num 电话号码
         */
        getNameByNumber = function(num){
            for(var i = 0 ; i < config.phonebook.length; i++){
                if(getLast8Number(config.phonebook[i].pbm_number) == getLast8Number(num)){
                    //  self.lastSmsFrom(config.phonebook[i].pbm_name);
                    $("#pbmName").text(config.phonebook[i].pbm_name);
                    $("#pbmNameHide").text(config.phonebook[i].pbm_number);
                    return;
                }else{
                    $("#pbmName").text(num);
                    $("#pbmNameHide").text(num);
                    // self.lastSmsFrom(config.phonebook[i].pbm_number);
                }
            }
            $("#pbmName").text(num);
            $("#pbmNameHide").text(num);
            return "";
        };
        function getPbmNum() {
            service.getPhoneBookReady({}, function (data) {
                if (data.pbm_init_flag == "0") {
                    var capability = service.getSIMPhoneBookCapacity();
                    var capabilityPC = service.getDevicePhoneBookCapacity();
                    self.pbmNum((!capability.simPbmUsedCapacity ? "" : capability.simPbmUsedCapacity) + (!capabilityPC.pcPbmUsedCapacity ? "" : capabilityPC.pcPbmUsedCapacity));
                } else {
                    setTimeout(getPbmNum,1000);
                }
            })
        }
        getPbmNum();

        $("#newSmsDatil").die('click').live('click',function(){
            config.SMS_FLAG = $("#pbmNameHide").text();
            window.location.hash = "#device_messages";
        })
        self.goToHerf = function(location){
            if(location == "sms"){
                window.location.hash = "#device_messages";
            }else if(location == "cantacts"){
                window.location.hash = "#group_all";
            }else if(location == "help"){
                window.location.hash = "#help";
            }else if(location == "setting"){
                window.location.hash = "#dial_setting";
            }else if(location == "Manage_Services"){
                window.location.hash = "#my_services";
            }else if(location == "wifiInfo"){
                window.location.hash = "#wifiinfo";
            }else if(location == "sd"){
                window.location.hash = "#sdsetting";
            }else if(location == "account"){
                window.location.hash = "#myAccount";
            }else if(location == "devinfo"){
                window.location.hash = "#device";
			}else if(location == "stat"){
                window.location.hash = "#traffic_statistics";                
            }
        }

        /**
         * 发送USSD命令
         * @method sendToNet
         */
        self.sendToNet = function(){
            timeOutFlag=0;
            window.clearInterval(interval);
            var command = "*102#";
            if (('string' != typeof (command)) || ('' == command)) {
                showAlert("ussd_error_input");
                return;
            }

            showLoading("operating");

            var params = {};
            params.operator = "ussd_send";
            params.strUSSDCommand = command;
            params.sendOrReply = "send";
            service.getUSSDResponse(params, function(result, content){
                hideLoading();
                if(result){
                    //  resetUSSD();
                    //  self.USSDLocation(USSDLocation.REPLY);
                    //  self.ussd_action(content.ussd_action);
                    $("#balance .cus_closeBalance").text((decodeMessage(content.data, true)).substring(0,60)+"...");
                    //     reply_flag=false;
                    timeOutFlag=0;
                    // interval=addInterval(timeOutVerify,1000);
                    $("#balanceImg").hide();
                    $("#balance").show();
                }else{
                    showAlert(content);
                }
            });
        };

        showBalance = function (){
            var status = service.getStatusInfo();
            if (checkConnectedStatusAndConnecting(status.connectStatus)){
                showAlert('connectedPro','','170px');
                return;
            }
            var netType = service.getNetSelectInfo();
            if(checkNetType(netType.net_select)){
                showAlert('4GOnlyPro','','175px');
                return;
            }
            self.sendToNet();
            return false;
        }

        function getRQCodeImage(isSSID1) {
            if (self.supportQrCode()) {
                var timestamp = new Date().getTime();
                if (isSSID1) {
                    return './img/qrcode_ssid_wifikey.png?_=' + timestamp;
                } else {
                    return './img/qrcode_multi_ssid_wifikey.png?_=' + timestamp;
                }
            } else {
                return './img/menu_normal1.png';
            }
        }

		/**
		 * 响应连接按钮事件
		 * 
		 * @event connectHandler
		 */
		self.connectHandler = function() {
            $("#balance").hide();
            $("#balanceImg").show();
			if (checkConnectedStatus(self.connectStatus())) {
                showLoading('disconnecting');
				service.disconnect({}, function(data) {
					if(data.result){
						successOverlay();
					} else {
						errorOverlay();
					}
				});
			} else {
                if(service.getStatusInfo().roamingStatus && service.getStatusInfo().roamMode == "off") {
                    showAlert("dial_roam_info");
                }else if(hasHotspotConnected()){
                    showConfirm("wan_connect_change_alert", function(){
                        showLoading('operating');
                        service.disconnectHotspot({}, function (data) {
                            if (data) {
                                if (data.result == "success") {
                                    self.connect();
                                } else if (data.result == "spot_connecting" || data.result == "spot_connected") {
                                    showAlert("ap_station_update_fail");
                                } else {
                                    errorOverlay();
                                }
                            } else {
                                errorOverlay();
                            }
                        });
                    });
                } else {
                    self.connect();
                }
			}
		};
        function hasHotspotConnected(){
            var info = service.getStatusInfo();
            var wifiStatus = info.connectWifiStatus;
            if (wifiStatus == "connect") {
                return true;
            }else{
                return false;
            }
        }
        self.connect = function() {
            var statusInfo = service.getStatusInfo();
            var trafficResult = statusBar.getTrafficResult(statusInfo);
            if(statusInfo.limitVolumeEnable && trafficResult.showConfirm){
                var confirmMsg = null;
                if(trafficResult.usedPercent > 100){
                    confirmMsg = {msg: 'traffic_beyond_connect_msg'};
                    statusBar.setTrafficAlertPopuped(true);
                } else {
                    confirmMsg = {msg: 'traffic_limit_connect_msg', params: [trafficResult.limitPercent]};
                    statusBar.setTrafficAlert100Popuped(false);
                }
                showConfirm(confirmMsg, function(){
                    doConnect();
                });
            }else{
                doConnect();
            }
        };
	}

    var newSmsCount = service.getStatusInfo();
    self.newSmsCount = ko.observable(newSmsCount.smsUnreadCount);
    self.lastSmsFrom = ko.observable();
    self.lastSmsTime = ko.observable();
    self.lastSmsContent = ko.observable();
    self.changeSmsDiv = ko.observable(false);
    if (newSmsCount.smsUnreadCount != "0") {
        service.getSMSMessages({
            page: 0,
            smsCount: 5,
            nMessageStoreType: 1,
            tags: 1,
            orderBy: "order by id desc"
        }, function (data) {
            if (data && data.messages.length != 0) {
                self.lastSmsFrom(getNameByNumber(data.messages[0].number));
                self.lastSmsTime(data.messages[0].time);
                var content = data.messages[0].content;
                if (content.length > 25) {
                    content = content.substring(0, 25) + "...";
                }
                self.lastSmsContent(content);
                self.changeSmsDiv(true);
                $("#tile-sms1").show();
                $("#tile-sms").hide();
            }
        });
    }else{
        self.changeSmsDiv(false);
        $("#tile-sms1").hide();
        $("#tile-sms").show();
    }

    function doConnect(){
        showLoading('connecting');
        service.connect({}, function(data) {
            if(data.result){
                successOverlay();
            } else {
                errorOverlay();
            }
        });
    }

    function fixAttachedDevicesInfo(devices) {
        var emptyInfo = {
            macAddress:"",
            ipAddress:"",
            hostName:"",
            timeConnected:""
        };
        var deviceNum = 0;
        if (devices) {
            deviceNum = devices.length;
        } else {
            devices = [];
        }
		var info = service.getWifiBasic();
        var emptyLen = info.MAX_Station_num - deviceNum;
        for (var i = 0; i < emptyLen; i++) {
            devices.push(emptyInfo);
        }
        return devices;
    }

    function getCanConnectNetWork(){
        var status = service.getStatusInfo();
        if (status.simStatus != "modem_init_complete") {
            return false;
        }
        
        if (checkConnectedStatus(status.connectStatus)) {
            if (config.AP_STATION_SUPPORT) {
                var ap = service.getAPStationBasic()
                if (ap.ap_station_enable == "1") {
                    var result = service.getConnectionMode();
                    if (result.connectionMode == "auto_dial") {
                        return false;
                    }
                }
            }
            return true;
        }
	
	//如果已联网，但是没有信号，断网按钮需要可以用
        if (status.signalImg == "0") {
            return false;
        }
        var networkTypeTmp = status.networkType.toLowerCase();
        if (networkTypeTmp == '' || networkTypeTmp == 'limited_service' || networkTypeTmp == 'no_service') {
            return false;
        }
        if("ppp_connecting"==status.connectStatus || "ppp_disconnecting"==status.connectStatus){
            return false;
        }
        if (config.AP_STATION_SUPPORT) {
            var ap = service.getAPStationBasic()

            if (status.connectWifiStatus == "connect") {
                if (ap.ap_station_mode == "wifi_pref") {
                    return false;
                }
            }
        }

        return true;
    }
    var getWifiStatus = "";
    function getWIFIConnectStatus(){
        service.getHotspotList({}, function (data) {
            for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                if (data.hotspotList[i].connectStatus == "1") {
                    getWifiStatus = "wifi_conected";
                    return;
                }
            }
        });
    }
    function getConnectStatusForButton(status, data_counter, wifiSSID, wifiStatus){
        var connectionStatus = "";
        if (status == "ppp_disconnected") {
            if (wifiSSID && wifiStatus == "connect") {
                getWIFIConnectStatus();
                if(getWifiStatus != ""){
                    connectionStatus = getWifiStatus;
                }
            } else if (wifiSSID && wifiStatus == "connecting") {
             //   connectionStatus = "connecting";
            } else {
                connectionStatus = "connect";
            }
        } else if (status == "ppp_connecting" || status == "wifi_connecting") {
          //  connectionStatus = "connecting";
        }else if(status == "ppp_disconnecting"){
         //   connectionStatus = "disconnecting";
        } else {
            if (data_counter.uploadRate != '0' && data_counter.downloadRate != '0') {
                connectionStatus = "disconnect";
            } else if (data_counter.uploadRate != '0' && data_counter.downloadRate == '0') {
                connectionStatus = "disconnect";
            } else if (data_counter.uploadRate == '0' && data_counter.downloadRate != '0') {
                connectionStatus = "disconnect";
            } else {
                connectionStatus = "disconnect";
            }
        }
        return $.i18n.prop(connectionStatus);
    }

    function refreshHomeData(connectionVM){
        var info =  service.getConnectionInfo();
        connectionVM.connectStatus(info.connectStatus);
        connectionVM.connectWifiSSID(info.connectWifiSSID);
        connectionVM.connectWifiStatus(info.connectWifiStatus);
        connectionVM.uploadRate(info.data_counter.uploadRate);
        connectionVM.downloadRate(info.data_counter.downloadRate);
        if (info.connectStatus == "ppp_disconnected") {
            if (info.connectWifiSSID && info.connectWifiStatus == "connect") {
                service.getHotspotList({}, function (data) {
                    for (var i = 0, len = data.hotspotList.length; i < len; i++) {
                        if (data.hotspotList[i].connectStatus == "1") {
                            connectionVM.wifiStatusText("img/icon_wifi_connect.png");
                            break;
                        }
                    }
                });
            }
        }

        if (checkConnectedStatus(info.connectStatus)) {
            connectionVM.current_Flux(transUnit(parseInt(info.data_counter.currentReceived, 10) + parseInt(info.data_counter.currentSent, 10), false));
            //connectionVM.total_Flux(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
            connectionVM.connected_Time(transSecond2Time(info.data_counter.currentConnectedTime));
            connectionVM.up_Speed(transUnit(info.data_counter.uploadRate, true));
            connectionVM.down_Speed(transUnit(info.data_counter.downloadRate, true));
        } else {
            connectionVM.current_Flux(transUnit(0, false));
            //connectionVM.total_Flux(transUnit(parseInt(info.data_counter.totalSent, 10) + parseInt(info.data_counter.totalReceived, 10), false));
            connectionVM.connected_Time(transSecond2Time(0));
            connectionVM.up_Speed(transUnit(0, true));
            connectionVM.down_Speed(transUnit(0, true));
        }
        connectionVM.connectStatusText(getConnectStatusForButton(info.connectStatus, info.data_counter, info.connectWifiSSID, info.connectWifiStatus));
        $("#connectStatusText").attr("trans",connectionVM.connectStatusText);
        connectionVM.canConnect(getCanConnectNetWork());
        var smsCount = service.getStatusInfo();
        self.newSmsCount(smsCount.smsUnreadCount);
        if (smsCount.smsUnreadCount != "0") {
            service.getSMSMessages({
                page: 0,
                smsCount: 5,
                nMessageStoreType: 1,
                tags: 1,
                orderBy: "order by id desc"
            }, function (data) {
                if (data && data.messages.length != 0) {
                    self.lastSmsFrom(getNameByNumber(data.messages[0].number));
                    self.lastSmsTime(data.messages[0].time);
                    var content = data.messages[0].content;
                    if (content.length > 25) {
                        content = content.substring(0, 25) + "...";
                    }
                    self.lastSmsContent(content);
                    self.changeSmsDiv(true);
                    $("#tile-sms1").show();
                    $("#tile-sms").hide();
                }
            });
        }else{
            self.changeSmsDiv(false);
            $("#tile-sms1").hide();
            $("#tile-sms").show();
        }
    }

    function refreshAttachedDevicesInfo(connectionVM, callback) {
        service.getCurrentlyAttachedDevicesInfo({}, function (devices) {
            var dev = fixAttachedDevicesInfo(devices.attachedDevices);
            connectionVM.deviceInfo(dev);
            if ($.isFunction(callback)) {
                callback();
            }
        });
    }

    function refreshAttachedDevicesInterval(connectionVM) {
        refreshAttachedDevicesInfo(connectionVM, function () {
            addTimeout(function () {
                refreshAttachedDevicesInterval(connectionVM);
            }, 1000);
        });
    }

    /**
	 * 初始化vm
	 * 
	 * @method init
	 */
	function init() {
		var container = $('#container')[0];
		ko.cleanNode(container);
        config.SMS_FLAG = "";
		var connectionVM = new connectInfoVM();
		ko.applyBindings(connectionVM, container);
        $("#balance").hide();
		$('#frmHome').validate({
			submitHandler : function() {
				connectionVM.connectHandler();
			}
		});

        refreshHomeData(connectionVM);
		addInterval(function() {
            refreshHomeData(connectionVM);
        }, 1000);
        $('.cus_closeBalance', '#balance').bind('click', function(evt){
            evt.stopPropagation();
            $("#balance").hide();
            $("#balanceImg").show();
        });
       setTimeout(function(){
            service.getIMSIAndIMSIList({},function(data){
                var imsiList = [];
                if(data.sim_imsi_lists && data.sim_imsi_lists != ""){
                    imsiList =  data.sim_imsi_lists.substring(0,data.sim_imsi_lists.length - 1).split(",");
                }
                if(data.sim_imsi && data.sim_imsi != ""){
                    if($.inArray(data.sim_imsi,imsiList) == -1){
//                        showConfirm2("balance_txt", {ok:function () {
//                            showLoading('operating');
//                            service.setIMSIToList({}, function (data) {
//                                if (data && data.result == "success") {
//                                    config.USSD_FLAG = "1";
//                                    window.location.hash = "#mybalance";
//                                    //  successOverlay();
//                                } else {
//                                    errorOverlay();
//                                }
//                            }, $.noop);
//                        }, no:function () {
//+                            showLoading('operating');
//+                            service.setIMSIToList({}, function (data) {
//+                                if (data && data.result == "success") {
//+                                    //  successOverlay();
//+                                    hideLoading();
//+                                } else {
//+                                    errorOverlay();
//+                                }
//+                            }, $.noop);
//                        }},'180px');
                    }
                }
            })

        },1000);

       // refreshAttachedDevicesInterval(connectionVM);
	}

    return {
        init:init,
        refreshAttachedDevicesInfo:refreshAttachedDevicesInfo
    };
});