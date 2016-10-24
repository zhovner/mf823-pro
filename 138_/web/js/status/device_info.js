define([ 'jquery', 'service', 'knockout', 'config/config' ], function ($, service, ko, config) {

    function DeviceInformationViewModel() {
        var self = this;
        var data = service.getDeviceInfo();
        var info = getStatusInfo();
        var netInfo = getNetSelectInfo();
        var mode = service.getConnectionMode();
        var apnSettings = getApnSettings();
        var setting = getSmsSetting();
        self.currentText = ko.observable('connection');
        self.currentText2 = ko.observable('connection');
        self.ssid = ko.observable(verifyDeviceInfo(data.ssid));
        self.m_ssid = ko.observable(verifyDeviceInfo(data.m_ssid));
        self.m_max_access_num = ko.observable(verifyDeviceInfo(data.m_max_access_num));
        self.showMssid = ko.observable(data.multi_ssid_enable == "1" && config.HAS_MULTI_SSID);
        self.ipAddress = ko.observable(verifyDeviceInfo(data.ipAddress));
        self.wanIpAddress = ko.observable();
        self.ipv6WanIpAddress = ko.observable();
        self.macAddress = ko.observable(verifyDeviceInfo(data.macAddress));
        self.simSerialNumber = ko.observable(verifyDeviceInfo(setting.centerNumber));
        self.sim_msisdn = ko.observable(verifyDeviceInfo(data.simSerialNumber));
        self.lanDomain = ko.observable(verifyDeviceInfo(data.lanDomain));
        self.imei = ko.observable(verifyDeviceInfo(data.imei));
        self.sw_version = ko.observable(verifyDeviceInfo(data.web_version));
        self.fw_version = ko.observable(verifyDeviceInfo(data.fw_version));
        self.hw_version = ko.observable(verifyDeviceInfo(data.hw_version));
        self.max_access_num = ko.observable(verifyDeviceInfo(data.max_access_num));
        self.showMacAddress = ko.observable(config.SHOW_MAC_ADDRESS);
        self.hasWifi = ko.observable(config.HAS_WIFI);
        var ipv6Mode = data.ipv6PdpType.toLowerCase().indexOf("v6") > 0;
        //self.showIpv6WanIpAddr = ko.observable(config.IPV6_SUPPORT && ipv6Mode);
        self.showIpv6WanIpAddr = ko.observable();
        self.showIpv4WanIpAddr = ko.observable();
        self.band = ko.observable(bandFormat(data.band));        
        self.sim_iccid = ko.observable(verifyDeviceInfo(data.sim_iccid));
        self.imsi = ko.observable(verifyDeviceInfo(data.imsi));
        var roamStatus=info.roamingStatus?true:false;
        self.networkOperator = ko.observable(info.networkOperator);
        self.networkOperatorSPN = ko.observable(getNetWorkProvider(info.spn_b1_flag,info.spn_name_data,info.spn_b2_flag,info.networkOperator,roamStatus));
        self.selectedType = ko.observable(getNetworkType("auto_select_type_" + netInfo.net_select));
        self.pppStatus = ko.observable(getPPPStatus(info.pppStatus));
        self.selectMode = ko.observable(getNetType(mode.connectionMode));
        self.selectedProfile = ko.observable(apnSettings.profileName);
        self.apn = ko.observable(apnSettings.wanApn);
        self.dnsPriAddrV4 = ko.observable(verifyDeviceInfo(data.dns_mode_v4 == "auto" ? data.dnsPriAddrV4_auto : data.dnsPriAddrV4_manual));
        self.dnsSecAddrV4 = ko.observable(verifyDeviceInfo(data.dns_mode_v4 == "auto" ? data.dnsSecAddrV4_auto : data.dnsSecAddrV4_manual));
        self.dnsPriAddrV6 = ko.observable(verifyDeviceInfo(data.dns_mode_v6 == "auto" ? data.dnsPriAddrV6_auto : data.dnsPriAddrV6_manual));
        self.dnsSecAddrV6 = ko.observable(verifyDeviceInfo(data.dns_mode_v6 == "auto" ? data.dnsSecAddrV6_auto : data.dnsSecAddrV6_manual));
        self.capabilitySMSForSIM = ko.observable(updateSmsCapabilityStatus());
        self.capabilityPbmForSIM = ko.observable(updatePhmCapabilityStatus());
        self.modelText = ko.observable(data.modelName);
        self.plmn_id = ko.observable(data.rmcc.addLeadZeroes(3) + data.rmnc.addLeadZeroes(2));

        var dat = formParams(data);
        self.rssi_l = ko.observable(dat.rssi_l);
        self.rssi = ko.observable(dat.rssi);
        self.signalp_l = ko.observable(dat.signalp_l);
        self.signalp = ko.observable(dat.signalp);
        self.signalq_l = ko.observable(dat.signalq_l);
        self.signalq = ko.observable(dat.signalq);
        self.lac_l = ko.observable(dat.lac_l);
        self.lac = ko.observable(dat.lac);
        self.cell_id_l = ko.observable(dat.cell_id_l);
        self.cell_id = ko.observable(dat.cell_id);
        self.pci_l = ko.observable(dat.pci_l);
        self.pci = ko.observable(dat.pci);

        if (config.IPV6_SUPPORT) {//支持IPV6
            if (data.pdpType == "IP") {//ipv4
                self.showIpv6WanIpAddr(false);
                self.showIpv4WanIpAddr(true);
            } else if (ipv6Mode) {//ipv6(&ipv4)
                if (data.ipv6PdpType == "IPv6") {
                    self.showIpv6WanIpAddr(true);
                    self.showIpv4WanIpAddr(false);
                } else {
                    self.showIpv6WanIpAddr(true);
                    self.showIpv4WanIpAddr(true);
                }
            }
        } else {//不支持IPV6
            self.showIpv6WanIpAddr(false);
            self.showIpv4WanIpAddr(true);
        }
        //联网时显示万网地址，否则为空
        var connectStatus = getConnectStatus(data.connectStatus);
        if (connectStatus == 1) {
            self.wanIpAddress(verifyDeviceInfo(data.wanIpAddress));
            self.ipv6WanIpAddress("--");
        } else if (connectStatus == 2) {
            self.wanIpAddress("--");
            self.ipv6WanIpAddress(verifyDeviceInfo(data.ipv6WanIpAddress));
        } else if (connectStatus == 3) {
            self.wanIpAddress(verifyDeviceInfo(data.wanIpAddress));
            self.ipv6WanIpAddress(verifyDeviceInfo(data.ipv6WanIpAddress));
        } else {
            self.wanIpAddress("--");
            self.ipv6WanIpAddress("--");
        }
        self.wifiRange = ko.observable("wifi_" + data.wifiRange);
        function getSmsSetting() {
            return service.getSmsSetting();
        }
        function updateSmsCapabilityStatus() {
            service.getSmsCapability({}, function (capability) {
                if((capability.simUsed && capability.simUsed != "") || (capability.simTotal && capability.simTotal != "")){
                    $("#simCap").text((capability.simUsed > capability.simTotal ? capability.simTotal : capability.simUsed) + "/" + capability.simTotal);
                  return  (capability.simUsed > capability.simTotal ? capability.simTotal : capability.simUsed) + "/" + capability.simTotal;
                }else{
                    $("#simCap").text("0 / 0");
                  return "0 / 0";
                }
            });
        }
        function updatePhmCapabilityStatus() {
                var capability =  service.getSIMPhoneBookCapacity();
                if((capability.simPbmUsedCapacity && capability.simPbmUsedCapacity != "") || (capability.simPbmTotalCapacity && capability.simPbmTotalCapacity != "")){
                    return  capability.simPbmUsedCapacity  + "/" + capability.simPbmTotalCapacity ;
                }else{
                    return "0 / 0";
                }
        }
        self.showConnectModeItem = function(item){
            if(item == "modem"){
                // $("#currentStatus").text($.i18n.prop("mod_sim"));
                self.currentText($.i18n.prop("mod_sim"));
                self.currentText2("mod_sim");
                $("#modemSIM").show();
                $("#connectDiv").hide();
            }else{
                //  $("#currentStatus").text($.i18n.prop("connection"));
                self.currentText($.i18n.prop("connection"));
                self.currentText2("connection");
                $("#modemSIM").hide();
                $("#connectDiv").show();
            }
        }
    }

    /**
     * 获取网络、SIM、WIFI等状态
     * @method getStatusInfo
     */
    var getStatusInfo = function () {
        return service.getStatusInfo();
    };
    /**
     * 获取网络选择信息
     * @method getNetSelectInfo
     */
    function getNetSelectInfo() {
        return service.getNetSelectInfo();
    }

    /**
     * 获取apn相关信息
     * @method getApnSettings
     */
    function getApnSettings(){
        var settings = service.getApnSettings();
       // settings.ipv6ApnConfigs = getApnConfigs(settings.ipv6APNs, true);
     //   settings.apnConfigs = getApnConfigs(settings.APNs, false);
    //    settings.autoApnConfigs = getAutoApns(settings.autoApns, settings.autoApnsV6);
        return settings;
    }
    function getNetWorkProvider(spn_b1_flag,spn_name_data,spn_b2_flag,network_provider,roamStatus){
        if(spn_name_data==""){
            return "--";
        }else{
            if (spn_name_data == "05089BB5C2B0B9")
	        spn_name_data = "Летай";
            else
                spn_name_data=decodeMessage(spn_name_data);

            if(spn_b1_flag=="1" && spn_b2_flag=="1"){
                if(roamStatus){//漫游
                    return "--";
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b1_flag=="1"){
                if(roamStatus){//漫游
                    return spn_name_data;
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b2_flag=="1"){
                if(roamStatus){//漫游
                    return "--";
                }else{//不漫游
                    return spn_name_data;
                }
            }else if(spn_b1_flag=="0" && spn_b2_flag=="0"){
                if(roamStatus){//漫游
                    return spn_name_data;
                }else{//不漫游
                    return spn_name_data;
                }
            }
            return "--";
        }
    }
    function verifyDeviceInfo(field) {
        if (field && field != "") {
            return field;
        } else {
            return "--";
        }
    }

    function getConnectStatus(status) {
        if (status == "ppp_disconnected" || status == "ppp_connecting" || status == "ppp_disconnecting") {
            return 0;
        } else if (status == "ppp_connected") {
            return 1;
        } else if (status == "ipv6_connected") {
            return 2;
        } else if (status == "ipv4_ipv6_connected") {
            return 3;
        }
    }
    function getNetType(type){
        var typeStatus;
        if(type == "auto_dial"){
            typeStatus =  "auto_select";
        }else{
            typeStatus =  "manual_select";
        }
        $("#selectMode").attr("trans",typeStatus);
        return typeStatus;
    }
    function getPPPStatus(status){
        var connectStatus;
        if (status == "ppp_connecting") {
            connectStatus="ppp_connecting";
        } else if(status == "ppp_disconnecting"){
            connectStatus="ppp_disconnecting";
        }else if(status == "ppp_disconnected"){
            connectStatus="ppp_disconnected";
        }else{
            connectStatus="ppp_connected";
        }
      //  $("#connectStatus").attr("trans", connectStatus);
        if( typeof status == "undefined"){
             return "";
        }
        return $.i18n.prop(connectStatus);
    }
    function getNetworkType(typeStatus){
       var networkTypeText;
       networkTypeText = typeStatus;
        $("#selectedType").attr("trans",networkTypeText);
        return networkTypeText;
    }

    function bandFormat(band) {
	switch (band) {
	case 'WCDMA 2100':
	    var b = 'UMTS B1 (2100)';
	    break;
	case 'WCDMA 900':
	    var b = 'UMTS B8 (900)';
	    break;	    
	case 'LTE BAND 3':
	    var b = 'LTE B3 (1800)';
	    break;	    
	case 'LTE BAND 7':
	    var b = 'LTE B7 (2600)';
	    break;	    
	case 'LTE BAND 8':
	    var b = 'LTE B8 (900)';
	    break;	    
	case 'LTE BAND 20':
	    var b = 'LTE B20 (800)';
	    break;
	default:
	    var b = band;
        }
        return b;
    }

    function format(v, u) {
        if (v) {
            return v + (u ? (" " + $.i18n.prop(u)) : "");
        } else {
            return "--";
        }
    }
    
    String.prototype.addLeadZeroes = function(digits) {
        var zeroes = "";
        for (i = this.length; i < digits; i++)
            zeroes += "0";
        return zeroes + this;
    }

    function formParams(data) {
        //var type_2g = ["GSM", "GPRS", "EDGE"];
        var type_3g = ["UMTS", "HSDPA", "HSUPA", "HSPA", "HSPA+", "DC-HSPA+"];
        var type_4g = ["LTE"];
        var dat = {};
        dat.lac_l = "LAC:";
        dat.lac = format(data.lac_code.toUpperCase().addLeadZeroes(4), null);
        if ($.inArray(data.network_type, type_3g) != -1) {
            dat.rssi_l = "RSSI:";
            dat.rssi = format(data.rssi, "dBm");
            dat.signalp_l = "RSCP:";
            dat.signalp = format(data.rscp, "dBm");
            dat.signalq_l = "Ec/Io:";
            dat.signalq =  format(data.ecio, "dB");
            dat.cell_id_l = "Cell ID:";
            dat.cell_id = format(data.cell_id.toUpperCase().addLeadZeroes(7), null);
            dat.pci_l = "";
            dat.pci = "";
        } else if ($.inArray(data.network_type, type_4g) != -1) {
            dat.rssi_l = "RSSI:";
            dat.rssi = format(data.lte_rssi, "dBm");
            dat.signalp_l = "RSRP:"
            dat.signalp = format(data.lte_rsrp, "dBm");
            dat.signalq_l = "SINR:";
            dat.signalq =  format(data.lte_sinr, "dB");
            dat.cell_id_l = "ECI:";
            dat.cell_id = format(data.cell_id.toUpperCase().addLeadZeroes(7), null);
            dat.pci_l = "PCI:";
            dat.pci = format(data.lte_pci, null);
        } else {
            dat.rssi_l = "RSSI:";
            dat.rssi = format(data.rssi, "dBm");
            dat.signalp_l = "";
            dat.signalp = "";
            dat.signalq_l = "";
            dat.signalq = "";
            dat.cell_id_l = "Cell ID:";
            dat.cell_id = format(data.cell_id.toUpperCase().addLeadZeroes(4), null);
            dat.pci_l = "";
            dat.pci = "";
        }
        return dat;
    }

    function init() {
        $("#dropdownMain").show();
        $("#dropdownMainForGuest").hide();
        var container = $('#container')[0];
        ko.cleanNode(container);
        var vm = new DeviceInformationViewModel();
        ko.applyBindings(vm, container);
        $("#connectDiv").show();
        addInterval(function () {
            service.getDeviceInfo({}, function (data) {
                vm.band(bandFormat(data.band));
                vm.plmn_id(data.rmcc.addLeadZeroes(3) + data.rmnc.addLeadZeroes(2));
                var dat = formParams(data);
                vm.rssi_l(dat.rssi_l);
                vm.rssi(dat.rssi);
                vm.signalp_l(dat.signalp_l);
                vm.signalp(dat.signalp);
                vm.signalq_l(dat.signalq_l);
                vm.signalq(dat.signalq);
                vm.lac_l(dat.lac_l);
                vm.lac(dat.lac);
                vm.cell_id_l(dat.cell_id_l);
                vm.cell_id(dat.cell_id);
                vm.pci_l(dat.pci_l);
                vm.pci(dat.pci);
            });
        }, 500);
        addInterval(function () {
            var statusInfo =  service.getStatusInfo();
            vm.networkOperator(statusInfo.networkOperator);
            vm.networkOperatorSPN(getNetWorkProvider(statusInfo.spn_b1_flag,statusInfo.spn_name_data,statusInfo.spn_b2_flag,statusInfo.networkOperator,statusInfo.roamingStatus?true:false));
            vm.pppStatus(getPPPStatus(statusInfo.connectStatus));
        }, 500);
    }

    return {
        init:init
    };
});