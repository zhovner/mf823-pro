/**
 * @module wifi basic
 * @class wifi basic
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {

        var securityModes = _.map(config.AUTH_MODES, function (item) {
            return new Option(item.name, item.value);
        });

        function maxStationOption(max) {
            var options = [];
            for (var i = 1; i <= max; i++) {
                options.push(new Option(i, i));
            }
            return options;
        }

        /**
         * wifi basic view model
         * @class WifiBasicVM
         */
        function WifiBasicVM() {
            var self = this;
            var info = getWifiBasic();
            self.hasMultiSSID = config.HAS_MULTI_SSID;
            self.multi_ssid_enable = ko.observable(info.multi_ssid_enable);
            self.origin_multi_ssid_enable = info.multi_ssid_enable;
            self.supportQrCode = ko.observable(config.WIFI_SUPPORT_QR_CODE);

            self.maxStationNumber = ko.computed(function () {
                return config.MAX_STATION_NUMBER;
//            if (self.hasMultiSSID && self.origin_multi_ssid_enable == "1") {
//                return config.MAX_STATION_NUMBER - 1;
//            } else {
//                return config.MAX_STATION_NUMBER;
//            }
            });

            self.modes = ko.observableArray(securityModes);
            self.selectedMode = ko.observable(info.AuthMode);
            self.passPhrase = ko.observable(info.passPhrase);
            self.showPassword = ko.observable(false);
            self.ssid = ko.observable(info.SSID);
            self.broadcast = ko.observable(info.broadcast == '1' ? '1' : '0');
            self.cipher = info.cipher;
            self.selectedStation = ko.observable(info.MAX_Access_num);
            self.maxStations = ko.observableArray(maxStationOption(info.MAX_Station_num));

            self.m_modes = ko.observableArray(securityModes);
            self.m_selectedMode = ko.observable(info.m_AuthMode);
            self.m_passPhrase = ko.observable(info.m_passPhrase);
            self.m_showPassword = ko.observable(false);
            self.m_ssid = ko.observable(info.m_SSID);
            self.m_broadcast = ko.observable(info.m_broadcast == '1' ? '1' : '0');
            self.m_cipher = info.m_cipher;
            self.m_selectedStation = ko.observable(info.m_MAX_Access_num);
            self.m_maxStations = ko.observableArray(maxStationOption(info.MAX_Station_num));
            self.qrcode_ssid1 = ko.observable(getRQCodeImage(true));
            self.qrcode_ssid2 = ko.observable(getRQCodeImage(false));
			self.showQrCode = ko.observable(true);
			self.m_showQrCode = ko.observable(true);

            self.clear = function (option) {
                if (option == "switch") {
                    self.multi_ssid_enable(info.multi_ssid_enable);
                } else if (option == "ssid1") {
                    self.selectedMode(info.AuthMode);
                    self.passPhrase(info.passPhrase);
                    self.ssid(info.SSID);
                    self.broadcast(info.broadcast == '1' ? '1' : '0');
                    self.cipher = info.cipher;
                    self.selectedStation(info.MAX_Access_num);
                } else if (option == "ssid2") {
                    self.m_selectedMode(info.m_AuthMode);
                    self.m_passPhrase(info.m_passPhrase);
                    self.m_ssid(info.m_SSID);
                    self.m_broadcast(info.m_broadcast == '1' ? '1' : '0');
                    self.m_cipher = info.m_cipher;
                    self.m_selectedStation(info.m_MAX_Access_num);
                } else {
                    clearTimer();
                    clearValidateMsg();
                    init();
                }
            };

            /**
             * 检测wps是否开启，最大接入数是否超过最大值。
             *
             * @event checkSettings
             */
            self.checkSettings = function (ssid) {
                var status = getWpsInfo();
                if (status.radioFlag == "0") {
                    showAlert('wps_wifi_off');
                    return true;
                }
                if (status.wpsFlag == '1') {
                    showAlert('wps_on_info');
                    return true;
                }
                if (config.HAS_MULTI_SSID && info.multi_ssid_enable == "1") {
                    if ((ssid == "ssid1" && parseInt(self.selectedStation()) + parseInt(info.m_MAX_Access_num) > info.MAX_Station_num)
                        || (ssid == "ssid2" && parseInt(self.m_selectedStation()) + parseInt(info.MAX_Access_num) > info.MAX_Station_num)) {
                        showAlert({msg:'multi_ssid_max_access_number_alert', params: info.MAX_Station_num});
                        return true;
                    }
                }
                if (ssid == "switch") {
                    var result = service.getStatusInfo();
                    if (result.connectWifiSSID && (result.connectWifiStatus == "connecting" || result.connectWifiStatus == "connect")) {
                        showAlert('cannot_operate_when_wifi_connected');
                        return true;
                    }
                }
                return false;
            };

            self.saveSSID1 = function () {
                if (self.checkSettings("ssid1")) {
                    return;
                }
                showConfirm('wifi_disconnect_confirm', function(){
                    self.saveSSID1Action();
                });
            };
            /**
             * 保存SSID1的设置
             *
             * @event saveSSID1
             */
            self.saveSSID1Action = function () {
                showLoading('operating');
                var params = {};
                params.AuthMode = self.selectedMode();
                params.passPhrase = self.passPhrase();
                params.SSID = self.ssid();
                params.broadcast = self.broadcast();
                params.station = self.selectedStation();
                params.cipher = self.selectedMode() == "WPA2PSK" ? 1: 2;
                service.setWifiBasic(params, function (result) {
                    if (result.result == "success") {
                        successOverlay();
                        self.clear();
                    } else {
                        errorOverlay();
                    }
                    self.qrcode_ssid1(getRQCodeImage(true));
                });
            };

            self.saveSSID2 = function () {
                if (self.checkSettings("ssid2")) {
                    return;
                }
                showConfirm('wifi_disconnect_confirm', function(){
                    self.saveSSID2Action();
                });
            };
            /**
             * 保存SSID2的设置
             *
             * @event saveSSID2
             */
            self.saveSSID2Action = function () {
                showLoading('operating');
                var params = {};
                params.m_AuthMode = self.m_selectedMode();
                params.m_passPhrase = self.m_passPhrase();
                params.m_SSID = self.m_ssid();
                params.m_broadcast = self.m_broadcast();
                params.m_station = self.m_selectedStation();
                params.m_cipher = self.m_selectedMode() == "WPA2PSK" ? 1: 2;
                service.setWifiBasic4SSID2(params, function (result) {
                    if (result.result == "success") {
                        successOverlay();
                        self.clear();
                    } else {
                        errorOverlay();
                    }
                    self.qrcode_ssid2(getRQCodeImage(false));
                });
            };

            /**
             * 设置多SSID开关
             *
             * @event setMultiSSIDSwitch
             */
            self.setMultiSSIDSwitch = function () {
                if (self.checkSettings("switch")) {
                    return;
                }

                var setSwitch = function () {
                    showLoading('operating');
                    var params = {};
                    params.multi_ssid_enable = self.multi_ssid_enable();
                    service.setWifiBasicMultiSSIDSwitch(params, function (result) {
                        if (result.result == "success") {
                            successOverlay();
                            self.clear();
                        } else {
                            errorOverlay();
                        }
                        self.qrcode_ssid1(getRQCodeImage(true));
                        self.qrcode_ssid2(getRQCodeImage(false));
                    });
                };

                if (self.multi_ssid_enable() == "1") {
                    if (config.AP_STATION_SUPPORT) {
                        showConfirm("multi_ssid_enable_confirm", function () {
                            setSwitch();
                        })
                    } else {
                        setSwitch();
                    }
                } else {
                    setSwitch();
                }
            };

            /**
             * SSID1密码显示事件
             *
             * @event showPasswordHandler
             */
            self.showPasswordHandler = function () {
                $("#passShow").parent().find(".error").hide();
                var checkbox = $("#showPassword:checked");
                if (checkbox && checkbox.length == 0) {
                    self.showPassword(true);
                } else {
                    self.showPassword(false);
                }
            };
            /**
             * SSID2密码显示事件
             *
             * @event m_showPasswordHandler
             */
            self.m_showPasswordHandler = function () {
                $("#m_passShow").parent().find(".error").hide();
                var checkbox = $("#m_showPassword:checked");
                if (checkbox && checkbox.length == 0) {
                    self.m_showPassword(true);
                } else {
                    self.m_showPassword(false);
                }
            };
			
			 /**
             * SSID1二维码显示事件
             *
             * @event showQrCodeHandler
             */
			self.showQrCodeHandler = function () {
                $("#showQrCode").parent().find(".error").hide();
                var checkbox = $("#showQrCode:checked");
                if (checkbox && checkbox.length == 0) {
                    self.showQrCode(true);
                } else {
                    self.showQrCode(false);
                }
            };
			
			 /**
             * SSID1二维码显示事件
             *
             * @event m_showQrCodeHandler
             */
			self.m_showQrCodeHandler = function () {
                $("#m_showQrCode").parent().find(".error").hide();
                var checkbox = $("#m_showQrCode:checked");
                if (checkbox && checkbox.length == 0) {
                    self.m_showQrCode(true);
                } else {
                    self.m_showQrCode(false);
                }
            };

            function getRQCodeImage(isSSID1){
                if(self.supportQrCode()){
                    var timestamp = new Date().getTime();
                    if(isSSID1){
                        return './img/qrcode_ssid_wifikey.png?_=' + timestamp;
                    } else {
                        return './img/qrcode_multi_ssid_wifikey.png?_=' + timestamp;
                    }
                } else {
                    return './img/menu_normal1.png';
                }
            }
        }

        /**
         * 获取wifi基本信息
         * @method getWifiBasic
         * @return {Object}
         */
        function getWifiBasic() {
            return service.getWifiBasic();
        }

        /**
         * 获取wps信息
         * @method getWpsInfo
         */
        function getWpsInfo() {
            return service.getWpsInfo();
        }

        /**
         * 初始化wifi基本view model
         * @method init
         */
        function init() {
            $("#dropdownMain").show();
            $("#dropdownMainForGuest").hide();
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new WifiBasicVM();
            ko.applyBindings(vm, container[0]);

            function checkWifiStatus() {
                var info = service.getAPStationBasic();
                if (info.ap_station_enable == "1") {
                    $('#frmMultiSSID :input').each(function () {
                        $(this).attr("disabled", true);
                    });
                } else {
                    $('#frmMultiSSID :input').each(function () {
                        $(this).attr("disabled", false);
                    });
                }
            }

            if (config.AP_STATION_SUPPORT) {
                checkWifiStatus();
            }
            //clearTimer();
            //addInterval(checkWifiStatus, 1000);

            $('#frmMultiSSID').validate({
                submitHandler:function () {
                    vm.setMultiSSIDSwitch();
                }
            });
            $('#frmSSID1').validate({
                submitHandler:function () {
                    vm.saveSSID1();
                },
                rules:{
                    ssid:'ssid',
                    pass:'wifi_password_check',
                    passShow:'wifi_password_check'
                },
                errorPlacement:function (error, element) {
                    var id = element.attr("id");
                    if (id == "pass" || id == "passShow") {
                        error.insertAfter("#passShow");
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
            $('#frmSSID2').validate({
                submitHandler:function () {
                    vm.saveSSID2();
                },
                rules:{
                    m_ssid:'ssid',
                    m_pass:'wifi_password_check',
                    m_passShow:'wifi_password_check'
                },
                errorPlacement:function (error, element) {
                    var id = element.attr("id");
                    if (id == "m_pass" || id == "m_passShow") {
                        error.insertAfter("#m_passShow");
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
        }

        return {
            init:init
        };
    });