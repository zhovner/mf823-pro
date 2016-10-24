define(function() {
    var config = {
	HAS_LOGIN: false,
        IPV6_SUPPORT: true,
        SHOW_APN_DNS:true,//APN设置页面是否显示DNS，不显示则dnsMode默认设置为auto
        WIFI_BAND_SUPPORT: false,
        WIFI_BANDWIDTH_SUPPORT: false,
        AP_STATION_SUPPORT: false,
        SHOW_MAC_ADDRESS: false, //是否显示mac地址
        WIFI_SUPPORT_QR_CODE: false, //是否支持wifi二维码显示,新立MDM9x15、MDM9x25、MTK平台uFi项目上，默认支持WiFi二维码。
		PASSWORD_ENCODE: true,//登录密码和WIFI密码是否加密
		UPGRADE_TYPE:"OTA",//取值有"NONE","OTA","FOTA","TWO_PORTION"
        WEBUI_TITLE: 'MF823',
        AUTO_MODES: [ {
            name: 'Automatic',
            value: 'NETWORK_auto'
        }, {
            name: '4G Only',
            value: 'Only_LTE'
        }, {
            name: '3G Only',
            value: 'Only_WCDMA'
        }, {
            name: '2G Only',
            value: 'Only_GSM'
        }, {
            name: 'WCDMA and GSM',
            value: 'WCDMA_AND_GSM'
        }, {
            name: 'WCDMA and LTE',
            value: 'WCDMA_AND_LTE'
        }, {
            name: 'GSM and LTE',
            value: 'GSM_AND_LTE'
        }],
        LTE_BANDS: [ {
            name: 'All',
            value: 'all'
        }, {
            name: '2600',
            value: '2600M'
        }, {
            name: '1800',
            value: '1800M'
        }, {
            name: '900',
            value: '900M'
        }, {
            name: '800',
            value: '800M'
        }],
        UMTS_BANDS: [ {
            name: 'All',
            value: 'PROLiNK_all'
        }, {
            name: '2100',
            value: '2100M'
        }, {
            name: '900',
            value: '900M'
        }],
        NETWORK_MODES : [ {
            name : '802.11 b/g/n',
            value : '4'
        }, {
            name : '802.11 n only',
            value : '2'
        } ],
        NETWORK_MODES_BAND : [ {
            name : '802.11 a/n',
            value : '4'
        } ]
    };

    return config;
});
