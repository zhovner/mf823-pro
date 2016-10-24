define(['underscore', 'config/config', 'smsData'],function (_, config, smsData) {
    var phonebookSize = 10 + getRandomInt(30);
    var phoneNumbers = smsData.getPhoneNumbers();
    var phonebook_sim_max = 50;
    var phonebook_sim_used = 0;
    var phonebook_device_max = 100;
    var phonebook_device_used = 0;
    var sms_nv_capability_used = 0;
    var smsReady = false;
    var smsArr = {
    		messages : []
    	};
    
    var simulate = {
		simulateRequest:function (params, successCallback, errorCallback, async, isPost) {
            if (!!isPost) {
                if (params.goformId == "PBM_CONTACT_ADD") {
                    savePhoneBook(params);
                } else if (params.goformId == "PBM_CONTACT_DEL") {
                    dealPhoneBookDelete(params);
                } else if (params.goformId == "LOGIN") {
                    return login(params);
                } else if (params.goformId == "LOGOUT") {
                    return logout();
                } else if (params.goformId == "ENTER_PIN"){
                    return validatePIN(params);
                }else if (params.goformId == "ENTER_PUK"){
                   return validatePUK(params);
                }else if (params.goformId == "APN_PROC" || params.goformId == "APN_PROC_EX"){
                	if (params.apn_action == 'set_default'){
                		setDefaultApn(params);
                	} else if (params.apn_action == 'delete') {
                		deleteApn(params);
                	} else if (params.apn_action == 'save') {
                		addOrEditApn(params);
                	}
                	return {
                        result:'success'
                    };
                }else if (params.goformId == "ALL_DELETE_SMS"){
                	smsArr.messages = [];
                	smsData.deleteAllSmsData();
                	return {
                        result:'success'
                    };
                }else if (params.goformId == "DELETE_SMS"){
                	deleteMessage(params);
                	return {
                		result:'success'
                	};
                } else if (params.goformId == "SET_MSG_READ"){
                	setSmsRead(params);
	            	return {result:'success'};
	            } else if (params.goformId == "CHANGE_PASSWORD") {
                    return validatePassword(params);
                } else if (params.goformId == "ENABLE_PIN") {
                    return enablePin(params);
                } else if (params.goformId == "DISABLE_PIN") {
                    return disablePin(params);
                } else if (params.goformId == "SEND_SMS") {
                	sendSms(params);
                    return {
                		result:'success'
                	};
                } else if (params.goformId == "SAVE_SMS") {
					saveSms(params);
					return {
						result:'success'
					};
				} else if(params.goformId == "FW_FORWARD_DEL") {
                    var indexs = params.delete_id.split(';');
                    _.each(indexs, function(item) {
                    	simulate["PortForwardRules_" + item] = '';
                    });
                } else if(params.goformId == "FW_FORWARD_ADD") {
                    var result = '';
                    for(var i = 0; i < 10; i++) {
                        if(this["PortForwardRules_" + i] == '') {
                            result = params.ipAddress + ',' + params.portStart + ',' + params.portEnd + ',' + transForFilter(params.protocol) + ',' + params.comment;
                            this["PortForwardRules_" + i] = result;
                            break;
                        }
                    }
                } else if(params.goformId == "ADD_IP_PORT_FILETER") {
                    var result = '';
                    for(var i = 0; i < 10; i++) {
                        if(this["IPPortFilterRules_" + i] == '') {
                            result = params.sip_address + ',' + '1,' + params.sFromPort + ',' + params.sToPort + ',' + params.dip_address + ',' + '5,' + params.dFromPort + ',' + params.dToPort + ',' + transForFilter(params.protocol) + ',' + transAction(params.action) + ',' + params.comment + ',' + params.mac_address;
                            this["IPPortFilterRules_" + i] = result;
                            break;
                        }
                    }
                } else if(params.goformId == "ADD_IP_PORT_FILETER_V4V6") {
                    var result = '';
                    if(params.ip_version == 'ipv4') {
                        for(var i = 0; i < 10; i++) {
                            if(this["IPPortFilterRules_" + i] == '') {
                                result = params.sip_address + ',' + '1,' + params.sFromPort + ',' + params.sToPort + ',' + params.dip_address + ',' + '5,' + params.dFromPort + ',' + params.dToPort + ',' + transForFilter(params.protocol) + ',' + transAction(params.action) + ',' + params.comment + ',' + params.mac_address;
                                this["IPPortFilterRules_" + i] = result;
                                break;
                            }
                        }
                    } else {
                        for(var i = 0; i < 10; i++) {
                            if(this["IPPortFilterRulesv6_" + i] == '') {
                                result = params.sip_address + ',' + '1,' + params.sFromPort + ',' + params.sToPort + ',' + params.dip_address + ',' + '5,' + params.dFromPort + ',' + params.dToPort + ',' + transForFilter(params.protocol) + ',' + transAction(params.action) + ',' + params.comment + ',' + params.mac_address;
                                this["IPPortFilterRulesv6_" + i] = result;
                                break;
                            }
                        }
                    }
                } else if(params.goformId == "DEL_IP_PORT_FILETER") {
                    var indexs = params.delete_id.split(';');
                    _.each(indexs, function(item) {
                    	simulate["IPPortFilterRules_" + item] = '';
                    });
                } else if(params.goformId == "DEL_IP_PORT_FILETER_V4V6") {
                    var indexs = params.delete_id.split(';');
                    _.each(indexs, function(item) {
                        simulate["IPPortFilterRules_" + item] = '';
                    });

                    var indexsv6 = params.delete_id_v6.split(';');
                    _.each(indexsv6, function(item) {
                        simulate["IPPortFilterRulesv6_" + item] = '';
                    });
                }
                else if(params.goformId == "HTTPSHARE_MODE_SET"){
                	setSdCardMode(params);
                } else if(params.goformId == "GOFORM_HTTPSHARE_CHECK_FILE"){
                	return {result: "noexist"};
                } else if (params.goformId == "QUICK_SETUP") {
                    quickSetup(params);
                } else if (params.goformId == "QUICK_SETUP_EX") {
                    quickSetupExtend(params);
	            } else if(params.goformId == "HTTPSHARE_ENTERFOLD"){
	                return getFileList(params);
	            } else if(params.goformId == 'HTTPSHARE_FILE_RENAME'){
	            	fileRename(params);
	            } else if(params.goformId == 'HTTPSHARE_DEL'){
                    this.dlna_scan_state = "1";
	            	deleteFilesAndFolders(params);
	            } else if(params.goformId == 'HTTPSHARE_NEW'){
	            	createFolder(params);
	            } else if(params.goformId == 'UPNP_SETTING') {
                    this.upnpEnabled = params.upnp_setting_option;
                } else if(params.goformId == 'FW_SYS') {
                    this.RemoteManagement = params.remoteManagementEnabled;
                    this.WANPingFilter = params.pingFrmWANFilterEnabled;
                } else if(params.goformId == 'DMZ_SETTING') {
                    this.DMZEnable = params.DMZEnabled;
                    this.DMZIPAddress = params.DMZIPAddress;
                } else if(params.goformId == 'DHCP_SETTING') {
                    this.dhcpEnabled = params.lanDhcpType == "SERVER"? "1" : "0";
                    this.lan_ipaddr = params.lanIp;
                    this.lan_netmask = params.lanNetmask;
                    if(this.dhcpEnabled == "1") {
                        this.dhcpStart = params.dhcpStart;
                        this.dhcpEnd = params.dhcpEnd;
                        this.dhcpLease_hour = params.dhcpLease;
                    }
                } else if(params.goformId == "BASIC_SETTING") {
                    this.IPPortFilterEnable  = params.portFilterEnabled;
                    this.DefaultFirewallPolicy = params.defaultFirewallPolicy;
                } else if(params.goformId == "ADD_PORT_MAP") {
                    this.PortMapEnable = params.portMapEnabled;
                    if(params.ip_address) {
                        var result = '';
                        for(var i = 0; i < 10; i++) {
                            if(this["PortMapRules_" + i] == '') {
                                result = params.ip_address + ','  + params.fromPort + ',' + params.toPort + ',' + transForFilter(params.protocol) + ',' + params.comment;
                                this["PortMapRules_" + i] = result;
                                break;
                            }
                        }
                    }
                } else if(params.goformId == "DEL_PORT_MAP") {
                    var indexs = params.delete_id.split(';');
                    _.each(indexs, function(item) {
                        simulate["PortMapRules_" + item] = '';
                    });
                } else if(params.goformId == "WIFI_WPS_SET") {
                    this.wps_type = params.wps_mode;
                    this.wpsFlag = "1";
                    this.WscModeOption = "1";
                    setTimeout(function() {
                        this.wpsFlag = "0";
                        this.WscModeOption = "0";
                    }, 15000);
                } else if(params.goformId == "SET_BEARER_PREFERENCE") {
                    this.net_select = params.BearerPreference;
                } else if(params.goformId == "SET_WIFI_SSID1_SETTINGS") {
                    this.SSID1 = params.ssid;
                    this.HideSSID = params.broadcastSsidEnabled;
                    if(config.PASSWORD_ENCODE){
                        this.WPAPSK1_encode = params.passphrase;
                    }else{
                        this.WPAPSK1 = params.passphrase;
                    }
                    this.AuthMode = params.security_mode;
                    this.MAX_Access_num = params.MAX_Access_num;
                    if(this.AuthMode == "OPEN") {
                        this.EncrypType = "NONE";
                    }else if(this.AuthMode =="WPA2PSK"){
                        this.EncrypType = "CCMP";
                    }else{
                        this.EncrypType = "TKIPCCMP";
                    }
                } else if(params.goformId == "SET_WIFI_SSID2_SETTINGS"){
                    this.m_SSID = params.m_SSID;
                    this.m_HideSSID = params.m_HideSSID;
                    if(config.PASSWORD_ENCODE){
                        this.m_WPAPSK1_encode = params.m_WPAPSK1;
                    }else{
                        this.m_WPAPSK1 = params.m_WPAPSK1;
                    }
                    this.m_AuthMode = params.m_AuthMode;
                    this.m_MAX_Access_num = params.m_MAX_Access_num;
                    if (this.m_AuthMode == "OPEN") {
                        this.m_EncrypType = "NONE";
                    } else if (this.m_AuthMode == "WPA2PSK") {
                        this.m_EncrypType = "CCMP";
                    } else {
                        this.m_EncrypType = "TKIPCCMP";
                    }
                } else if(params.goformId == "SET_WIFI_INFO") {
                    if (params.m_ssid_enable) {
                        this.m_ssid_enable = params.m_ssid_enable;
                    } else {
                        //WirelessMode,CountryCode,Channel,HT_MCS,MAX_Access_num
                        this.WirelessMode = params.wifiMode;
                        this.CountryCode = params.countryCode;
                        this.Channel = params.selectedChannel;
						if(params.abg_rate){
							this.HT_MCS = params.abg_rate;
						}
						if(params.wifi_11n_cap){
							this.wifi_11n_cap = params.wifi_11n_cap;
						}
						if(params.MAX_Access_num){
							this.MAX_Access_num = params.MAX_Access_num;
						}
						if(params.wifi_band){
							this.wifi_band = params.wifi_band;
						}
                    }
                } else if (params.goformId == "SET_MESSAGE_CENTER"){
                	setSmsSetting(params);
                } else if (params.goformId == "CONNECT_NETWORK"){
                	this.ppp_status = "ppp_connecting";
                	setTimeout(function(){
                        disconnectHotspot();
                		simulate.ppp_status = "ppp_connected";
                	}, (getRandomInt(5)+1) * 1000);
                } else if (params.goformId == "DISCONNECT_NETWORK"){
                	this.ppp_status = "ppp_disconnecting";
                	setTimeout(function(){
                		simulate.ppp_status = "ppp_disconnected";
                	}, (getRandomInt(5)+1) * 1000);
                } else if(params.goformId == "DLNA_SETTINGS") {
                    $.extend(this, params);
                    this.dlna_rescan_end = "1";
                } else if(params.goformId == "DLNA_RESCAN") {
                    this.dlna_rescan_end = "1";
                    this.dlna_scan_state = "0";
                }else if(params.goformId =="UNLOCK_NETWORK"){
                    if(params.unlock_network_code == simulate.unlock_code){
                        simulate.unlock_nck_time = 5;
                        setTimeout(function(){
                            simulate.modem_main_state = 'modem_init_complete';
                        }, 4000);
                        return {result:'success'};
                    }else{
                        simulate.unlock_nck_time = simulate.unlock_nck_time -1;
                        return {result:'failure'};
                    }
                }else if(params.goformId == "WIFI_SPOT_PROFILE_UPDATE"){
                    updateHotspot(params);
                }else if(params.goformId == "WLAN_SET_STA_CON"){
                    connectHotspot(params);
                }else if(params.goformId == "WLAN_SET_STA_DISCON"){
                    disconnectHotspot(params);
                }else if(params.goformId == "RESET_DATA_COUNTER"){
                    $.extend(this, {
                        realtime_rx_thrpt : 0,
                        total_tx_bytes : 0,
                        total_rx_bytes : 0,
                        total_time : 0,
                        monthly_tx_bytes : 0,
                        monthly_rx_bytes : 0,
                        monthly_time : 0,
                        realtime_tx_bytes : 0,
                        realtime_rx_bytes : 0,
                        realtime_time : 0,
                        realtime_tx_thrpt : 0
                    });
                    return {result:'success'};
                }else if(params.goformId == "SetUpgAutoSetting"){
                    setUpgAutoSetting(params);
                }else if(params.goformId == "IF_UPGRADE"){
                    setUpgradeSelectOption(params);
		}else {
                    $.extend(this, params);
                }

                return {
                    result:'success'
                };
            } else {
                var result = {};
                if (params.cmd == "pbm_data_total" || params.cmd == "pbm_data_info") {
                    result = getPhoneBook(params);
                    return { "pbm_data":result };
                }else if(params.cmd == "pbm_capacity_info"){
                    return getPhoneCapacity(params);
                } else if (params.cmd == "pbm_write_flag") {
                    return {pbm_write_flag:simulate.pbm_write_flag};
                } else if (params.cmd == "pbm_init_flag") {
                    return {pbm_init_flag:simulate.pbm_init_flag};
                } else if (params.cmd == "restore_flag") {
                    result = String(getRandomInt(3));
                    return { "restore_flag":result };
                } else if(params.cmd == "sms_data_total" || params.cmd == 'sms_page_data'){
                	return getAllSmsMessages(params);
                } else if(params.cmd == "ConnectionMode") {
                    return {
                        connectionMode: this.ConnectionMode,
                        autoConnectWhenRoaming: this.roam_setting_option
                    };
                } else if(params.cmd == "sms_cmd_status_info"){
                	if(params.sms_cmd == 1){
                		return {sms_cmd_status_result: "3"};
                	}
                	return {
                		sms_cmd_status_result: "3" //smsStatusInfo()
                	};
                } else if(params.cmd == 'HTTPSHARE_GETCARD_VALUE'){
                	return {sd_card_total_size: getRandomInt(99000), sd_card_avi_space: getRandomInt(10000)};
                } else if(params.cmd == "sms_parameter_info") {
                	return getSmsSetting();
                } else if(params.cmd == 'sms_capacity_info'){
                	return getSmsCapability();
                } else if(params.cmd == 'GetUpgAutoSetting'){
                    return simulate.GetUpgAutoSetting;
                } else if (params.cmd == 'new_version_state') {
                    return {new_version_state: simulate.new_version_state};
                } else if (params.cmd == 'update_info') {
                    return simulate.update_info;
                } else if (params.cmd == "pack_size_info") {
                    this.pack_size_info.download_size = simulate.pack_size_info.download_size + 10000;
                    if (this.pack_size_info.download_size >= simulate.pack_size_info.pack_total_size) {
                        this.pack_size_info.download_size = simulate.pack_size_info.pack_total_size;
                        if (this.current_upgrade_state == "upgrading") {
                            this.current_upgrade_state = "upgrade_prepare_install";
                            window.setTimeout(function () {
                                simulate.current_upgrade_state = "ota_update_success";
                                simulate.new_version_state = "0";
                                simulate.upgrade_result = "success";
                            }, 5000)
                        }
                    }
                    return this.pack_size_info;
                }

                if (params.multi_data) {
                    var keys = params.cmd.split(",");
                    for (var i = 0; i < keys.length; i++) {
                        result[keys[i]] = this[keys[i]];
                    }
                    if (_.indexOf(keys, "rssi") != -1) {
                        result.rssi = "-" + 9 * getRandomInt(5);
                    }
                    if (_.indexOf(keys, "rscp") != -1) {
                        result.rscp = "-" + 9 * getRandomInt(5);
                    }
                    if (_.indexOf(keys, "lte_rsrp") != -1) {
                        result.lte_rsrp = "-" + 9 * getRandomInt(5);
                    }
                    return result;
                } else {
                	result[params.cmd] = this[params.cmd];
                    return result;
                }
            }
        },
        testEnv: false,
        WirelessMode:"4",
        m_ssid_enable:"0",
        broadcastssid:"1",
        CountryCode:"cn",
        Channel:"2",
        HT_MCS:"1", // Rate
        MAX_Station_num: "14",
        MAX_Access_num:"5",
        wifi_band: 'b',
        wifi_11n_cap : '0',
        AuthMode:"WPAPSKWPA2PSK",
        EncrypType:"TKIPCCMP",
        HideSSID:"0",
        Key1Str1:"12345",
        Key1Type: "1",
        Key2Str1:"12345",
        Key2Type:"1",
        Key3Str1:"12345",
        Key3Type:"1",
        Key4Str1:"12345",
        Key4Type:"1",
        Key4Type:"1",
        SSID1:"102Z_E6C9C5",
        WPAPSK1:"12345678",
        WPAPSK1_encode:"MTIzNDU2Nzg=",
        m_SSID:"102B_E6C9C5",
        m_AuthMode:"WPAPSKWPA2PSK",
        m_HideSSID:"0",
        m_WPAPSK1:"12345678",
        m_WPAPSK1_encode:"MTIzNDU2Nzg=",
        m_MAX_Access_num:"5",
        m_EncrypType:"TKIPCCMP",
        Language:'en',
        wifi_coverage: "long_mode",
        attachedDevices:[],
        station_mac: "",
        signalbar:getRandomInt(5),
        network_type:[ "GSM", "GPRS", "EDGE", "WCDMA", "HSDPA", "HSPA", "HSPA+", "DC-HSPA+", "LTE" ][getRandomInt(8)],
        rssi:"-" + 9 * getRandomInt(5),
        rscp:"-" + 9 * getRandomInt(5),
        lte_rsrp:"-" + 9 * getRandomInt(5),
        network_provider:[ "China Mobile", "中国联通", "中国电信" ][getRandomInt(2)],
        ppp_status:"ppp_disconnected", // 联网状态
        simcard_roam:"mInternal", //漫游状态
        roam_setting_option: "off",
        modem_main_state:"modem_init_complete", //sim卡状态：modem_sim_undetected, modem_imsi_waitnck, modem_sim_destroy, modem_init_complete, modem_waitpin, modem_waitpuk
        battery_charging:"0", //"0" ? 'use' : 'charging'
        battery_vol_percent:"30",
        curr_connected_devices:[],
        // modem_main_state, // sim card 状态：
        // modem_init_complete、modem_sim_undetected、modem_waitpin、modem_waitpuk
        // sms_unread_num,sms_received_flag,sts_received_flag,RadioOff,station_num,battery_charging,battery_value,loginfo,simcard_roam,spn_display_flag,plmn_display_flag,spn_name_data,lan_ipaddr
        net_select:"Only_WCDMA",
        m_netselect_contents:'2,China Mobile,46002,2;2,China Mobile,46002,7',
        realtime_rx_thrpt : 0,
        total_tx_bytes : 0,
        total_rx_bytes : 0,
        total_time : 0,
        monthly_tx_bytes : 0,
        monthly_rx_bytes : 0,
        monthly_time : 0,
        realtime_tx_bytes : 0,
        realtime_rx_bytes : 0,
        realtime_time : 0,
        realtime_tx_thrpt : 0,
        phoneBooks:initPhoneBooks(phonebookSize),
        /*
    	"APN_config,dial_mode,m_profile_name,wan_apn,apn_select,wan_dial,dns_mode,
    	prefer_dns_manual,standby_dns_manual,ppp_auth_mode,ppp_username,ppp_passwd,Current_index",
    	*/
        apn_auto_config: "Auto Mobile1($)1bam.vtr.com($)manual($)*99#($)chap($)user($)pwd($)IP($)manual($)($)auto($)($)||Auto Mobile2($)2bam.vtr.com($)manual($)*99#($)chap($)user($)pwd($)IP($)manual($)($)auto($)($)",
        ipv6_apn_auto_config: "",
        APN_config0: "Modem($)bam.vtr.com($)manual($)*99#($)chap($)user($)pwd($)IP($)manual($)($)auto($)($)",
        APN_config1: "Vodafone GR($)internet.vodafone.gr($)manual($)*99#($)pap($)vtr($)vtr($)IPv4v6($)auto($)($)auto($)($)",
        APN_config2: "ChinaMobile($)internet.ChinaMobile.gr($)manual($)*99#($)pap($)vtr($)vtr($)IPv6($)auto($)($)auto($)($)",
        APN_config3:"",
        APN_config4:"",
        APN_config5:"",
        APN_config6:"",
        APN_config7:"",
        APN_config8:"",
        APN_config9:"",
        APN_config10: "",
        APN_config11: "",
        APN_config12: "",
        APN_config13:"",
        APN_config14:"",
        APN_config15:"",
        APN_config16:"",
        APN_config17:"",
        APN_config18:"",
        APN_config19:"",
        ipv6_APN_config0: "Modem($)($)($)($)($)($)($)($)($)($)($)($)",
        ipv6_APN_config1: "Vodafone GR($)internet.vodafone.gr($)manual($)*99#($)pap($)vtr($)vtr($)IPv4v6($)auto($)($)auto($)($)",
        ipv6_APN_config2: "ChinaMobile($)internet.ChinaMobile.gr($)manual($)*99#($)pap($)vtr($)vtr($)IPv6($)auto($)($)auto($)($)",
        ipv6_APN_config3:"",
        ipv6_APN_config4:"",
        ipv6_APN_config5:"",
        ipv6_APN_config6:"",
        ipv6_APN_config7:"",
        ipv6_APN_config8:"",
        ipv6_APN_config9:"",
        ipv6_APN_config10: "",
        ipv6_APN_config11: "",
        ipv6_APN_config12: "",
        ipv6_APN_config13:"",
        ipv6_APN_config14:"",
        ipv6_APN_config15:"",
        ipv6_APN_config16:"",
        ipv6_APN_config17:"",
        ipv6_APN_config18:"",
        ipv6_APN_config19:"",
        apn_mode: "manual",
        DefaultKeyID:"0",
        WscModeOption:"0",
        action:"",
        apn_index:"0",
        ipv6_apn_index:"0",
        ConnectionMode: "auto_dial",
    	m_profile_name: "Modem",
    	ipv6_m_profile_name: "Modem",
    	wan_apn: "bam.vtr.com",
    	apn_select: "manual",
    	wan_dial: "*99#",
    	dns_mode: "auto",
    	prefer_dns_manual: "",
    	standby_dns_manual: "",
    	ppp_auth_mode: "chap",
    	ppp_username: "user",
    	ppp_passwd: "pwd",
    	ipv6_wan_apn: "",
    	ipv6_apn_select: "",
    	ipv6_wan_dial: "",
    	ipv6_dns_mode: "",
    	ipv6_prefer_dns_manual: "",
    	ipv6_standby_dns_manual: "",
    	ipv6_ppp_auth_mode: "",
    	ipv6_ppp_username: "",
    	ipv6_ppp_passwd: "",
    	Current_index: "0",
    	ipv6_wan_ipaddr: 'FF:FF:FF:FF:FF:FF',
    	wan_ipaddr: '123.55.77.88',
    	ipv6_pdp_type: 'IP',
    	updateAttachedDevices: updateAttachedDevices,
        pbm_capacity_info:{
            pbm_dev_max_record_num:phonebook_device_max,
            pbm_dev_used_record_num:phonebook_device_used,
            pbm_sim_max_record_num:phonebook_sim_max,
            pbm_sim_used_record_num:phonebook_sim_used,
            pbm_sim_type:"", //2G or 3G used to extend pbm
            pbm_sim_max_name_len:22,
            pbm_sim_max_number_len:30
        },
        pbm_write_flag:"0",
        pbm_init_flag:"0",
        loginfo:"no",//不想登录就修改它.no：未登录，ok：已登录
        login_error:"",
        login_lock_time: '300',
        psw_fail_num_str: '5',
        save_login:"1",
        psw_save:"123456",
        puknumber:10,
        pinnumber:3,
        PIN:"1234",
        pin_status:"0",
        PUK:"11111111",
        admin_Password:"admin",
        sms_nv_capability: config.SMS_NV_CAPABILITY,
        sms_nv_capability_used: sms_nv_capability_used,
        sms_received_flag: "0",
        stk_write_flag:'0',
        stk:'ZDIST:2,808F7B677E75316211795E5DDE884C0021',
        stk_menu:'ZSTM:9,;240,808F7B677E95EE5019;241,8077ED4FE17FA453D1;248,804F1860E05FEB8BAF;255,804E1A52A17CBE9009;97,804F014E1A4FBF6C11641C7D22;99,808D224FE1901A4FF14E5090E8;100,80682156ED6E386C11516C793E;101,80682156ED661F51496C47;254,8000530049004D53614FE1606F;',
        lan_ipaddr: "192.168.0.1",
        subnetMask: "255.255.255.0",
        lan_netmask: "255.255.255.0",
        macAddress: "aa:cc:bb:cc:dd:ee",
        mac_address: "aa:cc:bb:cc:dd:ee",
        dhcpServer: "enable",
        dhcpStart: "192.168.0.100",
        dhcpEnd: "192.168.0.200",
        dhcpLease: "24",
        dhcpLease_hour: "24",
        dhcpEnabled: "1",
        validity: "one_week",
        centerNumber: "13999988888",
        deliveryReport: "0",
        restore_flag : "1",
        wpsFlag: '0',
        authMode: 'OPEN',
        wps_type: 'PBC',
        RadioOff:"1", // 1： enabled， 0： disabled
        sysIdleTimeToSleep: '10',
        RemoteManagement: '0',
        WANPingFilter: '0',
        PortForwardEnable: '0',
        PortForwardRules_0: '192.168.0.11,1111,2222,2,astest',
        PortForwardRules_1: '192.168.0.22,3333,4444,2,astest111',
        PortForwardRules_2: '',
        PortForwardRules_3: '',
        PortForwardRules_4: '',
        PortForwardRules_5: '',
        PortForwardRules_6: '',
        PortForwardRules_7: '',
        PortForwardRules_8: '',
        PortForwardRules_9: '',
        mode_set: "http_share_mode",
        sdcard_mode_option: '1',
        sd_card_state: "1",
        HTTP_SHARE_STATUS: "Enabled",
        HTTP_SHARE_CARD_USER: "user",
        HTTP_SHARE_WR_AUTH: "readonly",
        HTTP_SHARE_FILE: "/mmc2",
        IPPortFilterEnable: '0',
        DefaultFirewallPolicy: '0',
        IPPortFilterRules_0: '192.168.0.5,0,1,6,192.168.0.53,0,1,655,1,1,aa,00:1E:90:FF:FF:FF',
        IPPortFilterRules_1: '192.168.0.5,0,1,6,192.168.0.53,0,1,655,1,1,kk,00:1E:90:FF:FF:FF',
        IPPortFilterRules_2: '',
        IPPortFilterRules_3: '',
        IPPortFilterRules_4: '',
        IPPortFilterRules_5: '',
        IPPortFilterRules_6: '',
        IPPortFilterRules_7: '',
        IPPortFilterRules_8: '',
        IPPortFilterRules_9: '',
        IPPortFilterRulesv6_0: '',
        IPPortFilterRulesv6_1: '',
        IPPortFilterRulesv6_2: '',
        IPPortFilterRulesv6_3: '',
        IPPortFilterRulesv6_4: '',
        IPPortFilterRulesv6_5: '',
        IPPortFilterRulesv6_6: '',
        IPPortFilterRulesv6_7: '',
        IPPortFilterRulesv6_8: '',
        IPPortFilterRulesv6_9: '',
        PortMapEnable: '0',
        PortMapRules_0: '192.168.0.11,1111,2222,1,astest',
        PortMapRules_1: '192.168.0.22,3333,4444,1,astest111',
        PortMapRules_2: '',
        PortMapRules_3: '',
        PortMapRules_4: '',
        PortMapRules_5: '',
        PortMapRules_6: '',
        PortMapRules_7: '',
        PortMapRules_8: '',
        PortMapRules_9: '',
        wifiRangeMode: 'short_mode',
        upnpEnabled: '0',
        DMZEnable: '0',
        DMZIPAddress: '192.168.0.1',
		imei : '864589000054888',
        msisdn : '1234567890',
		web_version : '1.0b',
		wa_inner_version : '1.1.2.3',
		hardware_version : 'FM93_d',
		sim_spn : '1',
		rscp : '2',
		ecio : '3',
		lac_code : '4',
		cell_id : '5',
		rssi : '7',
		LocalDomain: 'm.home',
		sim_iccid: '12345678987654321',
		sms_para_sca : '15800000001',
		sms_para_mem_store : 'native',
		sms_para_status_report : '0',
		sms_para_validity_period : '255',
		sms_unread_num : 0,
		data_volume_limit_switch : '0',
		data_volume_limit_unit : 'data',
		data_volume_limit_size : '100_1',
		data_volume_alert_percent : '80',
        dlna_language: "chinese",
        dlna_name: "12345",
        dlna_share_audio: "on",
        dlna_share_video: "on",
        dlna_share_image: "on",
        dlna_scan_state: "0",
        dlna_rescan_end: "0",
        unlock_nck_time:3,
        unlock_code:"aaaaffff12345678",
        sms_nv_total: 300,
		sms_nv_rev_total: 0,
		sms_nv_send_total: 0,
		sms_nv_draftbox_total: 0,
		sms_sim_rev_total: 0,
		sms_sim_send_total: 0,
		sms_sim_draftbox_total: 0,
        station_list: [{"mac_addr":"00:23:CD:AC:08:7E","hostname":""},{"mac_addr":"34:E0:CF:E0:B2:99","hostname":"android-26bda3ab2d9a107f"}],
	    wifi_sta_connection:1,
        ap_station_mode:"wifi_pref",
        wifi_profile:"0001softbank,1,0,2,0001softbank,OPEN,NONE,0,0;mobilepoint,1,0,3,mobilepoint,OPEN,WEP,696177616b,0;userSaved,0,0,3,userSaved,OPEN,WEP,696177616b,0",
        wifi_profile1:"",
        wifi_profile2:"",
        wifi_profile3:"",
        wifi_profile4:"",
        wifi_profile5:"",
        EX_APLIST:"0,0,du Mobile WiFI_305288,4,6,WPAPSKWPA2PSK,TKIPCCMP;0,0,4G-Gateway-0888,4,6,WPAPSK,CCMP;0,0,life Wi-Fi_ABCD1231231,4,7,WPAPSKWPA2PSK,TKIPCCMP;0,0,uFi_duanruinan,4,8,WPAPSKWPA2PSK,TKIPCCMP;0,0,CPE_666666,4,6,WPAPSKWPA2PSK,TKIPCCMP;0,0,SOFTAP_XL,4,9,OPEN,NONE;0,0,T-Mobile Broadband11,4,6,WPAPSK,TKIPCCMP;0,0,sharaxa,3,11,OPEN,WEP;0,0,T-Mobile Broadband13,0,11,WPAPSK,TKIPCCMP;0,0,Atheros_XSpan_2G,4,6,OPEN,NONE;0,0,duanruinan,4,6,WPAPSKWPA2PSK,TKIPCCMP;0,0,T-Mobile Broadband11,4,1,WPAPSK,TKIPCCMP;0,0,life Wi-Fi_555658,0,1,OPEN,NONE;0,0,ZTE_MF29T_meng01,4,1,WPAPSKWPA2PSK,TKIPCCMP;0,0,AIRTEL_335258,4,3,OPEN,NONE",
        EX_APLIST1:"0,0,life Wi-Fi_ABCDDA,4,1,OPEN,NONE;0,0,ZTE_MF29T_meng01,4,1,WPAPSKWPA2PSK,TKIPCCMP",
        scan_finish:1,
        EX_SSID1:"",
        sta_ip_status:"disconnect",
        EX_wifi_profile:"",
        mgmt_quicken_power_on : '0',
        new_version_state:"0",
        update_info:{"filesname":"Version_1.0.2"," size":"1254","description":"description of Version_1.0.2","version":"V1.0.2"},
        is_mandatory:false,
        upgrade_result:"",
        current_upgrade_state:"",
        pack_size_info:{"pack_total_size":180000,"download_size":0},
        if_has_select:"none",
        GetUpgAutoSetting:{"UpgMode":"1","UpgIntervalDay":1,"UpgRoamPermission":"0"},
        upg_roam_switch:0
	};
    var frequency = 2;
	setInterval(function(){
		simulate.signalbar = getRandomInt(5);
		updateBattery();
		updateAttachedDevices();

        if (simulate.ppp_status == "ppp_disconnected") {
            simulate.total_tx_bytes = simulate.total_tx_bytes?simulate.total_tx_bytes : getRandomInt(10000000);
            simulate.total_rx_bytes = simulate.total_rx_bytes?simulate.total_rx_bytes : getRandomInt(10000000);
            simulate.total_time = simulate.total_time?simulate.total_time : getRandomInt(10000);
            simulate.monthly_tx_bytes = simulate.monthly_tx_bytes?simulate.monthly_tx_bytes : getRandomInt(5000000);
            simulate.monthly_rx_bytes = simulate.monthly_rx_bytes?simulate.monthly_rx_bytes : getRandomInt(10000000);
            simulate.monthly_time = simulate.monthly_time?simulate.monthly_time : getRandomInt(10000);
            /*simulate.realtime_tx_bytes = 0;
            simulate.realtime_rx_bytes = 0;
            simulate.realtime_time = 0;*/
            simulate.realtime_tx_thrpt = 0;
            simulate.realtime_rx_thrpt = 0;
        } else if (checkConnectedStatus(simulate.ppp_status)) {
        	var up = getRandomInt(2) ? getRandomInt(10000) : 0;
        	var down = getRandomInt(2) ? getRandomInt(100000) : 0;
            simulate.total_tx_bytes += up;
            simulate.total_rx_bytes += down;
            simulate.total_time += frequency;
            simulate.monthly_tx_bytes += up;
            simulate.monthly_rx_bytes += down;
            simulate.monthly_time += frequency;
            simulate.realtime_tx_bytes += up;
            simulate.realtime_rx_bytes += down;
            simulate.realtime_time += frequency;
            simulate.realtime_tx_thrpt = up;
            simulate.realtime_rx_thrpt = down;
        }
        
        if(!simulate.testEnv){
	        if(getRandomInt(5) == 0){ // 提高接收频率可将此值改小，如：2
	        	if(simulate.sms_nv_rev_total + simulate.sms_nv_send_total + simulate.sms_nv_draftbox_total != simulate.sms_nv_total){
	        		simulate.sms_received_flag = "1";
	        		var inner = null;
	        		if(!smsReady){
	        			inner = "inner";
						smsReady = true;
	        		}
                    var smsArray = smsData.addNewSms(inner);
                    smsArr.messages.push(smsArray2Object(smsArray));
	        	}
	        }else{
	        	simulate.sms_received_flag = "0";
	        }
	        simulate.sms_unread_num = simulate.sms_nv_rev_total = simulate.sms_nv_send_total = simulate.sms_nv_draftbox_total
	        	= simulate.sms_sim_rev_total = simulate.sms_sim_send_total = simulate.sms_sim_draftbox_total = 0;
	        $.each(smsArr.messages, function(i, n){
				if(n.tag == '1'){
					simulate.sms_unread_num++;
					simulate.sms_nv_rev_total++;
					simulate.sms_sim_rev_total++;
				}
				if(n.tag == '0'){
					simulate.sms_nv_rev_total++;
					simulate.sms_sim_rev_total++;
				}
				if(n.tag == '2' || n.tag == '3'){
					simulate.sms_nv_send_total++;
					simulate.sms_sim_send_total++;
				}
				if(n.tag == '4'){
					simulate.sms_nv_draftbox_total++;
					simulate.sms_sim_draftbox_total++;
				}
	        });
		}
    }, 1000 * frequency);

    function updateBattery() {
        var volplus = simulate.battery_charging == "1";
        var step = getRandomInt(10);
        var vol = parseInt(simulate.battery_vol_percent);
        if (volplus) {
            if (vol + step <= 100) {
                simulate.battery_vol_percent = vol + step + "";
            } else {
                simulate.battery_charging = "0";
                simulate.battery_vol_percent = vol - step + "";
            }
        } else {
            if (vol - step >= 0) {
                simulate.battery_vol_percent = vol - step + "";
            } else {
                simulate.battery_charging = "1";
                simulate.battery_vol_percent = vol + step + "";
            }
        }
    }

	var devices = [ {
		macAddress : "E8:E3:A5:AB:86:41",
		hostName : "MyHostName1",
		ipAddress : "192.168.0.151",
		timeConnected : 124
	}, {
		macAddress : "E8:E3:A5:AB:86:42",
		hostName : "MyHostName2",
		ipAddress : "192.168.0.152",
		timeConnected : 123
	}, {
		macAddress : "E8:E3:A5:AB:86:43",
		hostName : "MyHostName3",
		ipAddress : "192.168.0.152",
		timeConnected : 122
	}, {
		macAddress : "E8:E3:A5:AB:86:44",
		hostName : "MyHostName4",
		ipAddress : "192.168.0.153",
		timeConnected : 121
	}, {
		macAddress : "E8:E3:A5:AB:86:45",
		hostName : "MyHostName5",
		ipAddress : "192.168.0.154",
		timeConnected : 125
	}, {
		macAddress : "E8:E3:A5:AB:86:46",
		hostName : "MyHostName6",
		ipAddress : "192.168.0.156",
		timeConnected : 126
	}, {
		macAddress : "E8:E3:A5:AB:86:47",
		hostName : "MyHostName7",
		ipAddress : "192.168.0.157",
		timeConnected : 127
	}, {
		macAddress : "E8:E3:A5:AB:86:48",
		hostName : "MyHostName8",
		ipAddress : "192.168.0.158",
		timeConnected : 128
	}, {
		macAddress : "E8:E3:A5:AB:86:59",
		hostName : "MyHostName9",
		ipAddress : "192.168.0.159",
		timeConnected : 129
	}, {
		macAddress : "78:63:A4:AB:86:89",
		hostName : "",
		ipAddress : "192.168.0.125",
		timeConnected : 0
	} ];

    function updateAttachedDevices() {
        if (getRandomInt(3) != 1 && simulate.attachedDevices.length!=0) {
            return;
        }
        var added = [];
        var dvs = [];
        simulate.station_mac = "";
        simulate.station_list = [];
        for (var i = 0; i < devices.length && i < simulate.MAX_Access_num; i++) {
            var n = getRandomInt(devices.length - 1);
            if (_.indexOf(added, n) == -1) {
                added.push(n);
            }
        }
        for (var i = 0; i < added.length; i++) {
            dvs.push(devices[added[i]]);
            var mark = (i + 1 == added.length) ? "" : ";";
            simulate.station_mac += devices[added[i]].macAddress + mark;
            //mac_addr":"00:23:CD:AC:08:7E","hostname"
            simulate.station_list.push({
                mac_addr: devices[added[i]].macAddress,
                hostname: devices[added[i]].hostName
            });
        }
        simulate.attachedDevices = dvs;
        simulate.curr_connected_devices = dvs;
    }

    function getPhoneBook(para) {
        if (para.mem_store == 3) {
            return  _.filter(simulate.phoneBooks, function (item) {
                return (item.pbm_group == para.pbm_group);
            });
        }else if (para.mem_store == 2) {
            return simulate.phoneBooks;
        } else {
            return  _.filter(simulate.phoneBooks, function (item) {
                return (item.pbm_location == para.mem_store);
            });
        }
    }

    function savePhoneBook(para) {
        if ((para.edit_index == -1 && para.location == 0 ) || (para.add_index_pc == -1 && para.location == 1 )) {
            var maxBook = _.max(simulate.phoneBooks, function (book) {
                return book.pbm_id;
            });
            var newID = maxBook ? maxBook.pbm_id + 1 : 1;

            simulate.phoneBooks.push(
                {
                    pbm_id:newID,
                    pbm_location:para.location,
                    pbm_name:para.name,
                    pbm_number:para.mobilephone_num,
                    pbm_anr:para.homephone_num,
                    pbm_anr1:para.officephone_num,
                    pbm_email:para.email,
                    pbm_group:para.groupchoose
                }
            );
            if (para.location == 1) {
                simulate.pbm_capacity_info.pbm_dev_used_record_num++;
            } else {
                simulate.pbm_capacity_info.pbm_sim_used_record_num++;
            }
        } else {
            for (var i = 0; i < simulate.phoneBooks.length; i++) {
                var n = simulate.phoneBooks[i];
                if ((para.edit_index == n.pbm_id && para.location == 0 ) || (para.add_index_pc == n.pbm_id && para.location == 1 )) {
                    n.pbm_name = para.name;
                    n.pbm_number = para.mobilephone_num;
                    n.pbm_anr = para.homephone_num;
                    n.pbm_anr1 = para.officephone_num;
                    n.pbm_email = para.email;
                    n.pbm_group = para.groupchoose;
                }
            }
        }
    }

    function dealPhoneBookDelete(para) {
        if (para.del_option == "delete_all") {
            deleteAllPhoneBook(para);
        }else if(para.del_option == "delete_all_by_group"){
            deleteAllPhoneBookByGroup(para);
        } else {
            deletePhoneBook(para);
        }
    }

    function deletePhoneBook(para) {
        var indexs = para.delete_id.split(",");

        simulate.phoneBooks = _.filter(simulate.phoneBooks, function (item) {
            return (jQuery.inArray(String(item.pbm_id), indexs) == -1);
        });

        var simCount = 0;
        for (var i = 0; i < simulate.phoneBooks.length; i++) {
            if (simulate.phoneBooks[i].pbm_location == 0) {
                simCount++;
            }
        }
        simulate.pbm_capacity_info.pbm_dev_used_record_num = simulate.phoneBooks.length - simCount;
        simulate.pbm_capacity_info.pbm_sim_used_record_num = simCount;
    }

    function deleteAllPhoneBook(para) {
        if (para.del_all_location == 2) {
            simulate.phoneBooks = [];
            simulate.pbm_capacity_info.pbm_dev_used_record_num = 0;
            simulate.pbm_capacity_info.pbm_sim_used_record_num = 0;
            return;
        }

        simulate.phoneBooks = _.filter(simulate.phoneBooks, function (item) {
            return (item.pbm_location != para.del_all_location);
        });

        if (para.pbm_location == 0) {
            simulate.pbm_capacity_info.pbm_sim_used_record_num = 0;
        } else {
            simulate.pbm_capacity_info.pbm_dev_used_record_num = 0;
        }
    }

    function deleteAllPhoneBookByGroup(para){
        simulate.phoneBooks = _.filter(simulate.phoneBooks, function (item) {
            return (item.pbm_group != para.del_group);
        });

        var simCount = 0;
        for (var i = 0; i < simulate.phoneBooks.length; i++) {
            if (simulate.phoneBooks[i].pbm_location == 0) {
                simCount++;
            }
        }
        simulate.pbm_capacity_info.pbm_dev_used_record_num = simulate.phoneBooks.length - simCount;
        simulate.pbm_capacity_info.pbm_sim_used_record_num = simCount;
    }

	function deleteApn(params){
		simulate["APN_config" + params.index] = '';
		for(var i = params.index + 1; i < 20; i++){
			if(simulate["APN_config" + i] != ''){
				apnMoveUp(i);
			}
		}
	};
	
	function apnMoveUp(index){
		simulate["APN_config" + (index - 1)] = simulate["APN_config" + index];
	}
	
	function parseApnItem(apnStr){
		var apn = {};
		var items = [];
		if(apnStr == ''){
			items = ['','','','','','','','','','','',''];
		}else{
			items = apnStr.split("($)");
		}
		apn.profile_name = items[0];
		apn.wan_apn = items[1];
		apn.apn_select = items[2];
		apn.wan_dial = items[3];
		apn.ppp_auth_mode = items[4];
		apn.ppp_username = items[5];
		apn.ppp_passwd = items[6];
		apn.pdp_type = items[7];
		apn.pdp_select = items[8];
		apn.pdp_addr = items[9];
		apn.dns_mode = items[10];
		apn.prefer_dns_manual = items[11];
		apn.standby_dns_manual = items[12];
		return apn;
	}
	
	function addOrEditApn(params){
		// Modem($)bam.vtr.com($)manual($)*99#($)chap($)user($)pwd($)IP($)manual($)($)auto($)($)
		var apn = [];
		if(params.pdp_type == 'IP'){
			apn.push(params.profile_name);
			apn.push(params.wan_apn);
			apn.push(params.apn_select);
			apn.push(params.wan_dial);
			apn.push(params.ppp_auth_mode);
			apn.push(params.ppp_username);
			apn.push(params.ppp_passwd);
			apn.push(params.pdp_type);
			apn.push(params.pdp_select);
			apn.push(params.pdp_addr);
			apn.push(params.dns_mode);
			apn.push(params.prefer_dns_manual);
			apn.push(params.standby_dns_manual);
			var apnStr = apn.join("($)");
			simulate["APN_config"+params.index] = apnStr;
			simulate["ipv6_APN_config"+params.index] = [params.profile_name,'','','','','','','','','','',''].join("($)");
		} else if(params.pdp_type == 'IPv6'){
			apn.push(params.profile_name);
			apn.push(params.ipv6_wan_apn);
			apn.push(params.apn_select);
			apn.push(params.wan_dial);
			apn.push(params.ipv6_ppp_auth_mode);
			apn.push(params.ipv6_ppp_username);
			apn.push(params.ipv6_ppp_passwd);
			apn.push(params.pdp_type);
			apn.push(params.pdp_select);
			apn.push(params.pdp_addr);
			apn.push(params.ipv6_dns_mode);
			apn.push(params.ipv6_prefer_dns_manual);
			apn.push(params.ipv6_standby_dns_manual);
			var apnStr = apn.join("($)");
			simulate["APN_config"+params.index] = [params.profile_name,'','','','','','','','','','',''].join("($)");
			simulate["ipv6_APN_config"+params.index] = apnStr;
		} else {
			var apn = [];
			apn.push(params.profile_name);
			apn.push(params.wan_apn);
			apn.push(params.apn_select);
			apn.push(params.wan_dial);
			apn.push(params.ppp_auth_mode);
			apn.push(params.ppp_username);
			apn.push(params.ppp_passwd);
			apn.push(params.pdp_type);
			apn.push(params.pdp_select);
			apn.push(params.pdp_addr);
			apn.push(params.dns_mode);
			apn.push(params.prefer_dns_manual);
			apn.push(params.standby_dns_manual);
			var apnStr = apn.join("($)");
			simulate["APN_config"+params.index] = apnStr;
			apn = [];
			apn.push(params.profile_name);
			apn.push(params.ipv6_wan_apn);
			apn.push(params.apn_select);
			apn.push(params.wan_dial);
			apn.push(params.ipv6_ppp_auth_mode);
			apn.push(params.ipv6_ppp_username);
			apn.push(params.ipv6_ppp_passwd);
			apn.push(params.pdp_type);
			apn.push(params.pdp_select);
			apn.push(params.pdp_addr);
			apn.push(params.ipv6_dns_mode);
			apn.push(params.ipv6_prefer_dns_manual);
			apn.push(params.ipv6_standby_dns_manual);
			apnStr = apn.join("($)");
			simulate["ipv6_APN_config"+params.index] = apnStr;
		}
	}
	
	function setDefaultApn(params){
		var apn = parseApnItem(simulate["APN_config"+params.index]);
		var ipv6Apn = parseApnItem(simulate["ipv6_APN_config"+params.index]);
        simulate.apn_index = params.index;
        simulate.ipv6_apn_index = params.index;
        simulate.Current_index = params.index;
		if(params.apn_mode == 'auto'){
			
		}else{
			simulate.apn_mode = "manual";
			simulate.m_profile_name = apn.profile_name;
			simulate.wan_dial = '*99#';
			simulate.apn_select = 'manual';
			simulate.pdp_select = 'auto';
			simulate.pdp_addr = '';
			if(params.pdp_type == "IP"){
				simulate.pdp_type = 'IP';
				simulate.ipv6_pdp_type = '';
				
				simulate.wan_apn = apn.wan_apn;
				simulate.ppp_auth_mode = apn.ppp_auth_mode;
				simulate.ppp_username = apn.ppp_username;
				simulate.ppp_passwd = apn.ppp_passwd;
				simulate.dns_mode = apn.dns_mode;
				simulate.prefer_dns_manual = apn.prefer_dns_manual;
				simulate.standby_dns_manual = apn.standby_dns_manual;
			}else if(params.pdp_type == "IPv6"){
				simulate.pdp_type = '';
				simulate.ipv6_pdp_type = 'IPv6';
				
				simulate.ipv6_wan_apn = ipv6Apn.wan_apn;
				simulate.ipv6_ppp_auth_mode = ipv6Apn.ppp_auth_mode;
				simulate.ipv6_ppp_username = ipv6Apn.ppp_username;
				simulate.ipv6_ppp_passwd = ipv6Apn.ppp_passwd;
				simulate.ipv6_dns_mode = ipv6Apn.dns_mode;
				simulate.ipv6_prefer_dns_manual = ipv6Apn.prefer_dns_manual;
				simulate.ipv6_standby_dns_manual = ipv6Apn.standby_dns_manual;
			}else{//"IPv4v6"
				simulate.pdp_type = 'IPv4v6';
				simulate.ipv6_pdp_type = 'IPv4v6';
				
				simulate.wan_apn = apn.wan_apn;
				simulate.ppp_auth_mode = apn.ppp_auth_mode;
				simulate.ppp_username = apn.ppp_username;
				simulate.ppp_passwd = apn.ppp_passwd;
				simulate.dns_mode = apn.dns_mode;
				simulate.prefer_dns_manual = apn.prefer_dns_manual;
				simulate.standby_dns_manual = apn.standby_dns_manual;

				simulate.ipv6_wan_apn = ipv6Apn.wan_apn;
				simulate.ipv6_ppp_auth_mode = ipv6Apn.ppp_auth_mode;
				simulate.ipv6_ppp_username = ipv6Apn.ppp_username;
				simulate.ipv6_ppp_passwd = ipv6Apn.ppp_passwd;
				simulate.ipv6_dns_mode = ipv6Apn.dns_mode;
				simulate.ipv6_prefer_dns_manual = ipv6Apn.prefer_dns_manual;
				simulate.ipv6_standby_dns_manual = ipv6Apn.standby_dns_manual;
			}
		}
	}

    function initPhoneBooks(n) {
        var groups = ["common","family","friend","colleague"];
        var books = [];
        var simCount = 0;
        for (var i = 0; i < n; i++) {
            var location = getRandomInt(11) % 2 == 0 ? "0" : "1";
            if (simCount >= phonebook_sim_max) {
                location = 1;
            }
            if (location == 0) {
                simCount++;
            }

            var group = null;
            if (location == 1) {
                group = groups[getRandomInt(3)];
            }

            var g = "00" + String((i % 10) + 30);
            var s = "00" + String(parseInt(i / 10) % 100 + 30);
            var b = "00" + String(parseInt(i / 100) % 1000 + 30);

            books.push({
                pbm_id:i + 1,
                pbm_location:location,
                pbm_name:"005A00540045" + b + s + g,
                pbm_number:phoneNumbers[getRandomInt(phoneNumbers.length - 1)],
                pbm_anr:location == 0 ? "" : "028756412" + String(i),
                pbm_anr1:location == 0 ? "" : "02955456" + String(i),
                pbm_email:location == 0 ? "" : "006D" + b + s + g + "0040006D00610069006C002E0063006F006D",
                pbm_group:group
            });
        }
        phonebook_sim_used = simCount;
        phonebook_device_used = n - simCount;
        return books;
    }

    var loginLockTimer = 0;
    function login(params) {
        if(config.PASSWORD_ENCODE){
            params.password = Base64.decode(params.password);
        }
        if (simulate.admin_Password == params.password) {
            clearInterval(loginLockTimer);
            simulate.loginfo = "ok";
            simulate.psw_fail_num_str = '5';
            simulate.login_lock_time = '300';
            return {result:'0'};
        } else {
            if(simulate.psw_fail_num_str == '1'){
                simulate.login_lock_time = '300';
                startLoginLockInterval();
            }
            if(simulate.psw_fail_num_str != '0'){
                simulate.psw_fail_num_str = (parseInt(simulate.psw_fail_num_str, 10) - 1) + '';
            }
            return {result:'3'};
        }
    }

    function startLoginLockInterval(){
        loginLockTimer = setInterval(function(){
            if(parseInt(simulate.login_lock_time, 10) <= 0){
                simulate.psw_fail_num_str = '0';
                simulate.login_lock_time = '300';
                clearInterval(loginLockTimer);
            }
            simulate.login_lock_time = parseInt(simulate.login_lock_time, 10) - 1 + "";
        }, 1000);
    }

    function logout() {
        simulate.loginfo = "no";
        return {result:'success'};
    }

    function validatePUK(params) {
        if (params.PUKNumber == simulate.PUK) {
            simulate.pinnumber = 3;
            simulate.puknumber = 10;
            simulate.PIN = params.PinNumber;
            simulate.modem_main_state = "modem_init_complete";
            return { result:"success" };
        } else {
            simulate.puknumber = simulate.puknumber - 1;
            if (simulate.puknumber <= 0) {
                simulate.modem_main_state = "modem_sim_destroy";
            }
            return { result:"fail" };
        }
    }

    function validatePIN(params) {
        if (params.PinNumber == simulate.PIN) {
            simulate.pinnumber = 3;
            simulate.modem_main_state = "modem_init_complete";
            return { result:"success" };
        } else {
            simulate.pinnumber = simulate.pinnumber - 1;
            simulate.modem_main_state = "modem_waitpin";
            if (simulate.pinnumber <= 0) {
                simulate.modem_main_state = "modem_waitpuk";
            }
            return { result:"fail" };
        }
    }
    
    function getAllSmsMessages(params) {
    	var org = smsData.getConvertedSmsData();
        var tmpResult = {};
        var allSms = [];
        tmpResult.messages = [];
		simulate.sms_unread_num = simulate.sms_nv_rev_total = simulate.sms_nv_send_total = simulate.sms_nv_draftbox_total
    			= simulate.sms_sim_rev_total = simulate.sms_sim_send_total = simulate.sms_sim_draftbox_total = 0;
    	for(var i = 0; i < org.length; i++){
    		/*数据结构
			id: n[0],
			Mem_Store: n[2],
			Tag: n[3],
			Number: n[4],
			Cc_Total: n[7],
			Content: n[14],
			Year: n[17],
			Month: n[18],
			Day: n[19],
			Hour: n[20],
			Minute: n[21],
			Second: n[22]*/
    		var n = org[i];
    		if(n.Tag == '1'){
        		simulate.sms_unread_num++;
        		simulate.sms_nv_rev_total++;
        		simulate.sms_sim_rev_total++;
        	}
			if(n.Tag == '0'){
        		simulate.sms_nv_rev_total++;
        		simulate.sms_sim_rev_total++;
        	}
			if(n.Tag == '2' || n.Tag == '3'){
        		simulate.sms_nv_send_total++;
        		simulate.sms_sim_send_total++;
        	}
			if(n.Tag == '4'){
				simulate.sms_nv_draftbox_total++;
				simulate.sms_sim_draftbox_total++;
			}
            var itemObj = smsArray2Object(n);
			if(params.tags != 10){
				if(n.Tag == params.tags){
                    tmpResult.messages.push(itemObj);
				}
			} else {
                tmpResult.messages.push(itemObj);
			}
            allSms.push(itemObj);
    	}
        tmpResult.messages = tmpResult.messages.reverse();
        smsArr.messages = allSms.reverse();
    	//获取最新的短消息
    	if(params.cmd == 'sms_data_total' && params.data_per_page == 5){
    		var tmp = [];
    		for(var i = 0; i < tmpResult.messages.length && i < params.data_per_page; i++){
    			//if(tmpResult.messages[i].tag == "1"){
    				tmp.push(tmpResult.messages[i]);
    			//}
    		}
    		return {messages: tmp};
    	}
    	/*
    	if(params.cmd == 'sms_data_total' && params.data_per_page == 10){
    		var tmp = [];
    		var count = 0;
    		for(var i = params.page * params.data_per_page; i < smsArr.messages.length && count < params.data_per_page; i++){
				tmp.push(smsArr.messages[i]);
				count++;
    		}
    		return {messages: tmp};
    	}*/

    	//获取全部短消息
		return tmpResult;
	}

    function smsArray2Object(n){
    	var msg = {
			id: n.id,
			number: n.Number,
			tag: n.Tag,
			content: n.Content,
			date : n.Year + "," + n.Month + "," + n.Day + "," + n.Hour + "," + n.Minute + "," + n.Second + ",+8",
			draft_group_id : n.groupId
		};
    	return msg;
    }
    
    function getNewSms(count){
    	var result = [];
    	if(smsArr.messages.length > 0){
    		for(var i = 1; i < smsArr.messages.length; i++){
    			if(smsArr.messages[smsArr.messages.length - i].tag == "1" && i <= count){
    				result.push( smsArr.messages[smsArr.messages.length - i] );
    			}
    		}
    	}
    	return result;
    }
    
    function deleteMessage(params){
    	var ids = params.msg_id.split(";");
    	if(ids && ids.length > 1){
    		simulate.sms_nv_rev_total = simulate.sms_nv_rev_total - (ids.length - 1);
    	}
    	smsArr.messages = $.grep(smsArr.messages, function(n, i){
    		return $.inArray(n.id + "", ids) == -1;
    	});
    	smsData.deleteSms(ids);
    }
    
    function sendSms(params){
    	var newMsg = {
        		id : smsData.getSmsMaxId(),
    			number : params.Number,
    			tag : "2",
    			content : params.MessageBody,
    			date : parseTime(params.sms_time)
        	};
    	smsArr.messages.push(newMsg);
    	smsData.storeSms(newMsg);
    	simulate.sms_nv_send_total++;
    }

	function saveSms(params) {
		$.each(params.SMSNumber.split(';'), function(i, n){
			if(!n) return;
			var newMsg = {
				id : smsData.getSmsMaxId(),
				number : n,
				tag : "4",
				content : params.SMSMessage,
				date : parseTime(params.sms_time),
				groupId : params.draft_group_id
			};
			smsArr.messages.push(newMsg);
			smsData.storeSms(newMsg);
			//simulate.sms_nv_send_total++;
			simulate.sms_nv_draftbox_total++;
		});
	}
    
    function setSmsRead(params){
    	var ids = params.msg_id.split(";");
    	$.map(smsArr.messages, function(n){
    		if($.inArray(n.id + "", ids) != -1){
    			n.tag = "0";
    		}
    	});
    	smsData.setSmsRead(params);
    }
    
    function smsStatusInfo(){  // "1":doing, "2":fail, "3":success
    	var n = getRandomInt(10);
    	var result = "1";
    	if(n == 0){
    		result = "2";
    	}
    	if(n > 0 && n < 8){
    		result = "3";
    	}
    	return result;
    }

    function validatePassword(params) {
        if(config.PASSWORD_ENCODE){
            params.oldPassword = Base64.decode(params.oldPassword);
        }
        if (params.oldPassword == simulate.admin_Password) {
            simulate.admin_Password = Base64.decode(params.newPassword);
            return { result:"success" };
        } else {
            return { result:"fail" };
        }
    }

    function enablePin(params) {
        if (!params.NewPinNumber) {
            if (params.OldPinNumber == simulate.PIN) {
                simulate.pin_status = "1";
                simulate.modem_main_state = "modem_waitpin";
                simulate.pinnumber = 3;
                return { result:"success" };
            }
        } else {
            if (params.OldPinNumber == simulate.PIN) {
                simulate.PIN = params.NewPinNumber;
                simulate.pinnumber = 3;
                return { result:"success" };
            }
        }
        simulate.pinnumber = simulate.pinnumber - 1;
        if (simulate.pinnumber <= 0) {
            simulate.modem_main_state = "modem_waitpuk";
        }
        return { result:"fail" };
    }

    function disablePin(params) {
        if (params.OldPinNumber == simulate.PIN) {
            simulate.pin_status = "0";
            simulate.modem_main_state = "modem_init_complete";
            simulate.pinnumber = 3;
            return { result:"success" };
        }
        simulate.pinnumber = simulate.pinnumber - 1;
        if (simulate.pinnumber <= 0) {
            simulate.modem_main_state = "modem_waitpuk";
        }
        return { result:"fail" };
    }

    function setSdCardMode(params){
    	simulate.mode_set = params.mode_set;
     	if(params.mode_set == 'http_share_mode'){
     		simulate.sdcard_mode_option = '1';
     	} else {
     		simulate.sdcard_mode_option = '0';
     	}
    }

    function quickSetup(params) {
        simulate.m_profile_name = params.Profile_Name;
        simulate.apn_mode = params.apn_mode;
        simulate.wan_apn = params.APN_name;
        simulate.ppp_auth_mode = params.ppp_auth_mode;
        simulate.ppp_username = params.ppp_username;
        simulate.ppp_passwd = params.ppp_passwd;
        simulate.SSID1 = params.SSID_name;
        simulate.HideSSID = params.SSID_Broadcast;
        simulate.broadcastssid = params.SSID_Broadcast;
        simulate.AuthMode = params.Encryption_Mode_hid;
        if(config.PASSWORD_ENCODE){
            simulate.WPAPSK1_encode = params.WPA_PreShared_Key;
        }else{
            simulate.WPAPSK1 = params.WPA_PreShared_Key;
        }

        var apnItems = simulate["APN_config" + simulate.apn_index].split("($)");
        apnItems[0] = params.Profile_Name;
        apnItems[1] = params.APN_name;
        apnItems[4] = params.ppp_auth_mode;
        apnItems[5] = params.ppp_username;
        apnItems[6] = params.ppp_passwd;
        simulate["APN_config" + simulate.apn_index] = apnItems.join("($)");
    }

    function quickSetupExtend(params) {
        simulate.pdp_type = params.pdp_type;
        simulate.apn_mode = params.apn_mode;
        simulate.m_profile_name = params.profile_name;
        simulate.wan_apn = params.wan_apn;
        simulate.ppp_auth_mode = params.ppp_auth_mode;
        simulate.ppp_username = params.ppp_username;
        simulate.ppp_passwd = params.ppp_passwd;
        simulate.ipv6_wan_apn = params.ipv6_wan_apn;
        simulate.ipv6_ppp_auth_mode = params.ipv6_ppp_auth_mode;
        simulate.ipv6_ppp_username = params.ipv6_ppp_username;
        simulate.ipv6_ppp_passwd = params.ipv6_ppp_passwd;
        simulate.SSID1 = params.SSID_name;
        simulate.broadcastssid = params.SSID_Broadcast;
        simulate.HideSSID = params.SSID_Broadcast;
        simulate.AuthMode = params.Encryption_Mode_hid;
        //security_shared_mode:params.security_shared_mode,
        if(config.PASSWORD_ENCODE){
            simulate.WPAPSK1_encode = params.WPA_PreShared_Key;
        }else{
            simulate.WPAPSK1 = params.WPA_PreShared_Key;
        }
        //wep_default_key:params.wep_default_key,
        //WPA_ENCRYPTION_hid:params.WPA_ENCRYPTION_hid
        if (params.pdp_type == "IP" || params.pdp_type == "IPv4v6") {
            var apnItems = simulate["APN_config" + simulate.apn_index].split("($)");
            apnItems[0] = params.profile_name;
            apnItems[1] = params.wan_apn;
            apnItems[4] = params.ppp_auth_mode;
            apnItems[5] = params.ppp_username;
            apnItems[6] = params.ppp_passwd;
            simulate["APN_config" + simulate.apn_index] = apnItems.join("($)");
            if (params.pdp_type == "IP") {
                simulate["ipv6_APN_config" + simulate.ipv6_apn_index] = [params.profile_name, '', '', '', '', '', '', '', '', '', '', ''].join("($)");
            }
        }
        if (params.pdp_type == "IPv6" || params.pdp_type == "IPv4v6") {
            var apnItems = simulate["ipv6_APN_config" + simulate.ipv6_apn_index].split("($)");
            apnItems[0] = params.profile_name;
            apnItems[1] = params.ipv6_wan_apn;
            apnItems[4] = params.ipv6_ppp_auth_mode;
            apnItems[5] = params.ipv6_ppp_username;
            apnItems[6] = params.ipv6_ppp_passwd;
            simulate["ipv6_APN_config" + simulate.ipv6_apn_index] = apnItems.join("($)");
            if (params.pdp_type == "IPv6") {
                simulate["APN_config" + simulate.ipv6_apn_index] = [params.profile_name, '', '', '', '', '', '', '', '', '', '', ''].join("($)");
            }
        }
    }

    function getPhoneCapacity(para) {
        return {
            pbm_sim_max_record_num:simulate.pbm_capacity_info.pbm_sim_max_record_num,
            pbm_sim_used_record_num:simulate.pbm_capacity_info.pbm_sim_used_record_num,
            pbm_sim_max_name_len:simulate.pbm_capacity_info.pbm_sim_max_name_len,
            pbm_sim_max_number_len:simulate.pbm_capacity_info.pbm_sim_max_number_len,
            pbm_sim_type:simulate.pbm_capacity_info.pbm_sim_type,
            pbm_dev_max_record_num:simulate.pbm_capacity_info.pbm_dev_max_record_num,
            pbm_dev_used_record_num:simulate.pbm_capacity_info.pbm_dev_used_record_num
        };
    }
    
    var fileList = {
		"result" : {
			"totalRecord" : "125",
			"fileInfo" : [ {
				"fileName" : "dev",
				"attribute" : "document",
				"size" : "0",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "sms.db",
				"attribute" : "file",
				"size" : "1231230",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "share.avi",
				"attribute" : "file",
				"size" : "480000",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "usr.jpg",
				"attribute" : "file",
				"size" : "456879",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "bin.pdf",
				"attribute" : "file",
				"size" : "789450",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "build.xml",
				"attribute" : "file",
				"size" : "423428",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "tmp.rar",
				"attribute" : "file",
				"size" : "12540",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "document.doc",
				"attribute" : "file",
				"size" : "2342234",
				"lastUpdateTime" : "20120511"
			}, {
				"fileName" : "share.ppt",
				"attribute" : "file",
				"size" : "122540",
				"lastUpdateTime" : "20120510"
			}, {
				"fileName" : "mySheet.xls",
				"attribute" : "file",
				"size" : "2341234",
				"lastUpdateTime" : "20120511"
			} ]
		}
	};
    
    function getFileList(params){
    	var path = params.path_SD_CARD;
    	var index = params.index;
    	return fileList;
    }

    function fileRename(params) {
		var newName = params.NEW_NAME_SD_CARD.substring(params.NEW_NAME_SD_CARD.lastIndexOf("/") + 1,
				params.NEW_NAME_SD_CARD.length);
		var oldName = params.OLD_NAME_SD_CARD.substring(params.OLD_NAME_SD_CARD.lastIndexOf("/") + 1,
				params.OLD_NAME_SD_CARD.length);
		for ( var i = 0; i < fileList.result.fileInfo.length; i++) {
			if (fileList.result.fileInfo[i].fileName == oldName) {
				fileList.result.fileInfo[i].fileName = newName;
				break;
			}
		}
	}

	function deleteFilesAndFolders(params) {
		var names = params.name_SD_CARD.substring(0, params.name_SD_CARD.length - 1).split("*");
		fileList.result.fileInfo = $.grep(fileList.result.fileInfo, function(n, i) {
			return $.inArray(fileList.result.fileInfo[i].fileName, names) == -1;
		});
		fileList.result.totalRecord = fileList.result.fileInfo.length;
	}

	function createFolder(params) {
		var name = params.path_SD_CARD.substring(params.path_SD_CARD.lastIndexOf("/") + 1,
				params.path_SD_CARD.length);
		fileList.result.fileInfo.push({
			"fileName" : name,
			"attribute" : "document",
			"size" : getRandomInt(100000),
			"lastUpdateTime" : "20120510"
		});
		fileList.result.totalRecord = fileList.result.fileInfo.length;
	}

    function transForFilter(proto) {
        var type;
        if ("TCP" == proto)
            type = "1";
        else if ("UDP" == proto)
            type = "2";
        else if ("ICMP" == proto)
            type = "4";
        else if ("None" == proto)
            type = "5";
        else if("TCP&UDP" == proto)
            type = "3";
        return type;
    }

    function transAction(action) {
        if(action == "Drop") {
            return "0";
        }
        else {
            return "1";
        }
    }
    
    function getSmsSetting(){
    	return {
    		sms_para_sca : simulate.sms_para_sca,
    		sms_para_mem_store : simulate.sms_para_mem_store,
    		sms_para_status_report : simulate.sms_para_status_report,
    		sms_para_validity_period : simulate.sms_para_validity_period
    	};
    }
    
    function setSmsSetting(params){
    	switch(params.save_time){
			case "twelve_hours":
				simulate.sms_para_validity_period = "143";
			    break;
			case "one_day":
				simulate.sms_para_validity_period = "167";
				break;
			case "one_week":
				simulate.sms_para_validity_period = "173";
				break;
			case "largest":
				simulate.sms_para_validity_period = "255";
			    break;
			default:
				simulate.sms_para_validity_period = "143";
			    break;
	    }
    	simulate.sms_para_sca = params.MessageCenter;
		simulate.sms_para_mem_store = params.save_location;
		simulate.sms_para_status_report = params.status_save;
    }
    
    function getSmsCapability(){
    	return {
    		sms_nv_total: simulate.sms_nv_total,
    		sms_nv_rev_total: simulate.sms_nv_rev_total,
    		sms_nv_send_total: simulate.sms_nv_send_total,
    		sms_nv_draftbox_total: simulate.sms_nv_draftbox_total,
    		sms_sim_rev_total: simulate.sms_sim_rev_total,
    		sms_sim_send_total: simulate.sms_sim_send_total,
    		sms_sim_draftbox_total: simulate.sms_sim_draftbox_total
    	};
    }

    function updateHotspot(para) {
        simulate.wifi_profile = para.wifi_profile;
        simulate.wifi_profile1 = para.wifi_profile1;
        simulate.wifi_profile2 = para.wifi_profile2;
        simulate.wifi_profile3 = para.wifi_profile3;
        simulate.wifi_profile4 = para.wifi_profile4;
        simulate.wifi_profile5 = para.wifi_profile5;
    }

    function connectHotspot(para) {
        disconnectHotspot();
        simulate.sta_ip_status = "connecting";
        simulate.EX_SSID1 = para.EX_SSID1;
        simulate.EX_wifi_profile = para.EX_wifi_profile;
        window.setTimeout(function () {
            for (var i = 0; i <= 5; i++) {
                var wifi = "";
                if (i == 0) {
                    wifi = "wifi_profile";
                } else {
                    wifi = "wifi_profile" + i;
                }
                var index = simulate[wifi].indexOf(para.EX_wifi_profile + ",");
                if (index != -1) {
                    var idx = index + para.EX_wifi_profile.length + 3;
                    var list = simulate[wifi];
                    simulate[wifi] = list.substring(0, idx) + "1" + list.substring(idx + 1, list.length);
                    simulate.EX_SSID1 = para.EX_SSID1;
                    simulate.sta_ip_status = "connect";
                    simulate.EX_wifi_profile = para.EX_wifi_profile;
                    simulate.ppp_status = "ppp_disconnected";
                    break;
                }
            }
        }, 3000);
    }
    function disconnectHotspot(){
        if (!simulate.EX_wifi_profile) return;
        for (var i = 0; i <= 5; i++) {
            var wifi = "";
            if (i == 0) {
                wifi = "wifi_profile";
            } else {
                wifi = "wifi_profile" + i;
            }
            var index = simulate[wifi].indexOf(simulate.EX_wifi_profile + ",");
            if (index != -1) {
                var idx = index + simulate.EX_wifi_profile.length + 3;
                var list = simulate[wifi];
                simulate[wifi] = list.substring(0, idx) + "0" + list.substring(idx + 1, list.length);
                simulate.EX_SSID1 = "";
                simulate.sta_ip_status = "disconnect";
                simulate.EX_wifi_profile = "";
                break;
            }
        }
    }

    function setUpgAutoSetting(params) {
        simulate.GetUpgAutoSetting.UpgMode = params.UpgMode;
        simulate.GetUpgAutoSetting.UpgIntervalDay = params.UpgIntervalDay;
        simulate.GetUpgAutoSetting.UpgRoamPermission = params.UpgRoamPermission;
        simulate.upg_roam_switch = params.UpgRoamPermission;
    }

    function setUpgradeSelectOption(params) {
        simulate.upgrade_result = "";
        simulate.setUpgradeSelectOp = params.select_op;
        if (params.select_op == "check") {
            simulate.new_version_state = "checking";
            var i = getRandomInt(10);
            if (i <= 1) {
                simulate.new_version_state = "0";
            } else {
                var t = getRandomInt(10);
                if(t<5){
                    simulate.new_version_state = "version_has_new_optional_software";
                }else{
                    simulate.new_version_state = "version_has_new_critical_software";
                    simulate.current_upgrade_state = "upgrading";
                }
            }
        } else if (params.select_op == "0" || params.select_op == "2") {
            simulate.new_version_state = "version_idle";
            simulate.current_upgrade_state = "fota_idle";
            simulate.pack_size_info.download_size = 0;
        } else if (params.select_op == "1") {
            simulate.new_version_state = "version_has_new_critical_software";
            simulate.pack_size_info.download_size = simulate.pack_size_info.download_size + 100000;
            simulate.current_upgrade_state = "upgrading";
        }
    }

	return simulate;
});