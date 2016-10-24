/**
 * @module QuickSetting
 * @class QuickSetting
 */
define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {

        var wifiState = {ok:0, wps_on:1, wifi_off:2};
        var apnMode = {auto:"auto", manual:"manual"};
        var minStep = 1;
        var maxStep = 6;

        /**
         * 获取鉴权方式
         * @method getAuthModes
         * @return {Array} Auth mode Options
         */
        function getAuthModes() {
            return _.map(config.APN_AUTH_MODES, function (item) {
                return new Option(item.name, item.value);
            });
        }

        var securityModes = _.map(config.AUTH_MODES, function (item) {
            return new Option(item.name, item.value);
        });

        /**
         * 快速设置 view model
         * @class quickSettingVM
         */
        function quickSettingVM() {
            var self = this;
            var info = service.getQuickSettingInfo();

            self.supportIPv6 = config.IPV6_SUPPORT;
            self.transAPN = self.supportIPv6 ? "apn_ipv4_apn" : "apn";
            self.transAuthMode = self.supportIPv6 ? "apn_authentication_ipv4" : "apn_authentication";
            self.transUserName = self.supportIPv6 ? "apn_user_name_ipv4" : "apn_user_name";
            self.transPassword = self.supportIPv6 ? "apn_password_ipv4" : "apn_password";

            self.currentStep = ko.observable(minStep);
            self.currAPN = ko.computed(function () {
                var strAPN = info["APN_config" + info.apn_index];
                var apnItems = [];
                if (strAPN) {
                    apnItems = strAPN.split("($)");
                }

                var strIPv6APN = info["ipv6_APN_config" + info.ipv6_apn_index];
                var ipv6APNItems = [];
                if (strIPv6APN) {
                    ipv6APNItems = strIPv6APN.split("($)");
                }

                return {
                    m_profile_name:apnItems[0],
                    wan_apn:apnItems[1],
                    ppp_auth_mode:apnItems[4].toLowerCase(),
                    ppp_username:apnItems[5],
                    ppp_passwd:apnItems[6],
                    ipv6_wan_apn:ipv6APNItems[1],
                    ipv6_ppp_auth_mode:ipv6APNItems[4].toLowerCase(),
                    ipv6_ppp_username:ipv6APNItems[5],
                    ipv6_ppp_passwd:ipv6APNItems[6]
                }
            });
            self.ipType = ko.observable(info.pdp_type == 'IP' ? 'IP' : info.ipv6_pdp_type);
            self.wpsFlag = ko.observable(info.WscModeOption);
            self.apnMode = ko.observable(info.apn_mode);
            self.profileName = ko.observable(self.currAPN().m_profile_name);
            self.apn = ko.observable(self.currAPN().wan_apn);
            self.ipv6_apn = ko.observable(self.currAPN().ipv6_wan_apn);
            self.apnDisabled = ko.computed(function () {
                return (info.apn_index < config.defaultApnSize || checkConnectedStatus(info.ppp_status) || info.ppp_status == "ppp_connecting");
            });

            self.apnModeDisabled = ko.computed(function () {
                return (checkConnectedStatus(info.ppp_status) || info.ppp_status == "ppp_connecting");
            });

            self.authModes = ko.observableArray(getAuthModes());
            self.selectedAuthMode = ko.observable(self.currAPN().ppp_auth_mode);
            self.username = ko.observable(self.currAPN().ppp_username);
            self.password = ko.observable(self.currAPN().ppp_passwd);
            self.ipv6_selectedAuthMode = ko.observable(self.currAPN().ipv6_ppp_auth_mode);
            self.ipv6_username = ko.observable(self.currAPN().ipv6_ppp_username);
            self.ipv6_password = ko.observable(self.currAPN().ipv6_ppp_passwd);

            self.wifiClosed = (info.RadioOff == "0");
            self.ssid = ko.observable(info.SSID1);
            self.broadcast = ko.observable(info.HideSSID);

            self.securityModes = ko.observableArray(securityModes);
            self.selectedSecurityMode = ko.observable(info.AuthMode);
            self.WPAKey = ko.observable(info.WPAPSK1);

            self.apnMode_display = ko.observable("");
            self.apnMode_trans = ko.computed(function () {
                if (apnMode.auto == self.apnMode()) {
                    self.apnMode_display($.i18n.prop("apn_auto_apn"));
                    return "apn_auto_apn";
                } else {
                    self.apnMode_display($.i18n.prop("apn_manual_apn"));
                    return "apn_manual_apn";
                }
            });
            self.selectedAuthMode_display = ko.computed(function () {
                var mode = self.selectedAuthMode();
                return getAuthModeNameByValue(mode);
            });
            self.ipv6_selectedAuthMode_display = ko.computed(function () {
                var mode = self.ipv6_selectedAuthMode();
                return getAuthModeNameByValue(mode);
            });

            self.showWifiPassword = ko.observable(false);
            self.showWifiPasswordHandler = function (){
                $("#pwdWPAKey").parent().find(".error").hide();
                var checkbox = $("#showWifiPassword:checked");
                if(checkbox && checkbox.length == 0){
                    self.showWifiPassword(true);
                }else{
                    self.showWifiPassword(false);
                }
            }
            /**
             * 根据鉴权模式的值获其名称
             * @method getAuthModeNameByValue
             */
            function getAuthModeNameByValue(authMode) {
                for (var i = 0; i < config.APN_AUTH_MODES.length; i++) {
                    if (authMode == config.APN_AUTH_MODES[i].value) {
                        return config.APN_AUTH_MODES[i].name;
                    }
                }
            }

            self.broadcast_display = ko.observable("");
            self.broadcast_trans = ko.computed(function () {
                if ("0" == self.broadcast()) {
                    self.broadcast_display($.i18n.prop("enable"));
                    return "enable";
                } else {
                    self.broadcast_display($.i18n.prop("disable"));
                    return "disable";
                }
            });

           self.selectedSecurityMode_display = ko.observable();   
           self.selectedSecurityMode_trans = ko.computed(function () {
                var mode = self.selectedSecurityMode();
                for (var i = 0; i < config.AUTH_MODES.length; i++) {
                    if (mode == config.AUTH_MODES[i].value) {
                        self.selectedSecurityMode_display($.i18n.prop("security_mode_" +  config.AUTH_MODES[i].value));
                        return "security_mode_" +  config.AUTH_MODES[i].value;
                    }
                }
            });
			
            /**
             * 快速设置提交
             * @method quickSetting
             */
            function quickSetting() {
                showLoading('operating');
                var param = {
                    apnMode:self.apnMode(),
                    Profile_Name:self.profileName(),
                    APN_name:self.apn(),
                    ppp_auth_mode:self.selectedAuthMode(),
                    ppp_username:self.username(),
                    ppp_passwd:self.password(),
                    SSID_name:self.ssid(),
                    SSID_Broadcast:self.broadcast(),
                    Encryption_Mode_hid:self.selectedSecurityMode(),
                    WPA_PreShared_Key:self.WPAKey(),
                    //目前加密模式只有2种，下面3个参数为固定值
                    //如果需要定制为5种，参数值需要设置
                    security_shared_mode:"NONE",
                    wep_default_key:0,
                    WPA_ENCRYPTION_hid:self.selectedSecurityMode() == "OPEN" ? "NONE" : self.selectedSecurityMode() == "WPA2PSK" ? 1 : 2
                };

                service.setQuickSetting(param, self.callback);
            }

            /**
             * 快速设置提交(支持IPv6）
             * @method quickSetting4IPv6
             */
            function quickSetting4IPv6() {
                showLoading('operating');
                var param = {
                    apn_index:info.apn_index,
                    pdp_type:self.ipType(),
                    apnMode:self.apnMode(),
                    profile_name:self.profileName(),
                    wan_apn:self.apn(),
                    ppp_auth_mode:self.selectedAuthMode(),
                    ppp_username:self.username(),
                    ppp_passwd:self.password(),
                    ipv6_wan_apn:self.ipv6_apn(),
                    ipv6_ppp_auth_mode:self.ipv6_selectedAuthMode(),
                    ipv6_ppp_username:self.ipv6_username(),
                    ipv6_ppp_passwd:self.ipv6_password(),
                    SSID_name:self.ssid(),
                    SSID_Broadcast:self.broadcast(),
                    Encryption_Mode_hid:self.selectedSecurityMode(),
                    WPA_PreShared_Key:self.WPAKey(),
                    //目前加密模式只有2种，下面3个参数为固定值
                    //如果需要定制为5种，参数值需要设置
                    security_shared_mode:"NONE",
                    wep_default_key:0,
                    WPA_ENCRYPTION_hid:self.selectedSecurityMode() == "OPEN" ? "NONE":self.selectedSecurityMode() == "WPA2PSK" ? 1 : 2
                };

                service.setQuickSetting4IPv6(param, self.callback);
            }

            /**
             * 快速设置提交后的回调处理
             * @event callback
             */
            self.callback = function (data) {
                if (data.result == "success") {
                    successOverlay();
                    location.hash = "#net_select";
                }
                else {
                    errorOverlay();
                }
            };

            /**
             * 保存按钮事件
             * @event save
             */
            self.save = function () {
                var submit = function () {
                    if (config.USE_IPV6_INTERFACE) {
                        quickSetting4IPv6();
                    } else {
                        quickSetting();
                    }
                }
                var result = checkSettings();
                if (result == wifiState.ok) {
                    submit();
                } else if (result == wifiState.wifi_off) {
                    showConfirm("quick_setting_wifi_off_confirm", submit);
                }
            };

            /**
             * 下一步按钮事件
             * @event next
             */
            self.next = function () {
                var currentStep = self.currentStep();
                var toStep = self.currentStep() + 1;
                var result = changeStep(toStep);
                if (result) {
                    if (currentStep == 2 && self.apnMode() == apnMode.auto) {
                        toStep = self.currentStep() + 1;
                        changeStep(toStep);
                    }
                }
            };
            /**
             * 上一步按钮事件
             * @event next
             */
            self.previous = function () {
                var currentStep = self.currentStep();
                var toStep = self.currentStep() - 1;
                var result = changeStep(toStep);
                if (result) {
                    if (currentStep == 4 && self.apnMode() == apnMode.auto) {
                        toStep = self.currentStep() - 1;
                        changeStep(toStep);
                    }
                }
            };

            /**
             * 变换步骤时处理
             * @method changeStep
             */
            function changeStep(step) {
                if (step < minStep) {
                    step = minStep;
                }
                else if (step > maxStep) {
                    step = maxStep;
                }

                var result = true;
                if (step > self.currentStep()) {
                    result = checkStep(step);
                }
                if (result) {
                    self.currentStep(step);
                    $("td[id^='right_step_']").removeClass().addClass("step-left");
                    var tds = $("td[id^='step_']");
                    tds.each(function () {
                        var theStep = parseInt($(this).attr("id").replace("step_", ""));
                        if (theStep == step) {
                            $(this).text($.i18n.prop("step_name_" + theStep)).attr("trans", "step_name_" + theStep).removeClass().addClass("step-active-middle");
                            if (theStep == maxStep) {
                                $("#right_step_" + theStep).removeClass().addClass("step-active-right-end");
                            } else {
                                $("#right_step_" + theStep).removeClass().addClass("step-active-right");
                            }
                        } else {
                            $(this).text($.i18n.prop("step_number_" + theStep)).attr("trans", "step_number_" + theStep).removeClass().addClass("step-middle");
                            if (theStep == step - 1) {
                                $("#right_step_" + theStep).removeClass().addClass("step-active-left");
                            } else {
                                if (theStep == maxStep) {
                                    $("#right_step_" + theStep).removeClass().addClass("step-right-end");
                                } else {
                                    $("#right_step_" + theStep).removeClass().addClass("step-left");
                                }
                            }
                        }
                    });
                }
                return result;
            }

            /**
             * 下一步的检测
             * @method changeStep
             */
            function checkStep(step) {
                switch (step) {
                    case 1:
                        break;
                    case 2:
                        var result = checkSettings();
                        if (result == wifiState.wps_on) {
                            return false
                        }
                        return true;
                    case 3:
                        break;
                    case 4:
                        break;
                    case 5:
                        break;
                    case 6:
                        break;
                }
                return true;
            }

            /**
             * 提交前的检测
             * @method checkSettings
             */
            function checkSettings() {
                var data = service.getWpsInfo();
                if (data.wpsFlag == '1') {
                    showAlert('wps_on_info');
                    return wifiState.wps_on;
                }
                if (data.radioFlag == "0") {
                    return wifiState.wifi_off;
                }
                return wifiState.ok;
            }
        }

        /**
         * 初始化快速设置ViewModel
         * @method init
         */
        function init() {
            var container = $('#container');
            ko.cleanNode(container[0]);
            var vm = new quickSettingVM();
            ko.applyBindings(vm, container[0]);
            $('#quickSettingForm').validate({
                submitHandler:function () {
                    if (vm.currentStep() < 6) {
                        vm.next();
                    } else {
                        vm.save();
                    }
                },
                rules:{
                    txtAPN:"apn_check",
                    txtIPv6APN:"apn_check",
                    txtSSID:'ssid',
                    txtWPAKey:'wifi_password_check',
                    pwdWPAKey:'wifi_password_check',
                    txtUserName:'ppp_username_check',
                    txtIPv6UserName:'ppp_username_check',
                    txtPassword:"ppp_password_check",
                    txtIPv6Password:"ppp_password_check"
                },
                errorPlacement:function (error, element) {
                    var id = element.attr("id");
                    if (id == "txtWPAKey" || id == "pwdWPAKey") {
                        error.insertAfter("#lblShowWifiPassword");
                    } else {
                        error.insertAfter(element);
                    }
                }
            });
        }

        return {
            init:init
        };
    }
)
;