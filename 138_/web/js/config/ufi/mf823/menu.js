define(function() {
    var needLogin = true;
    var menu = [
        {
            hash:'#httpshare_guest',
            path:'sd/httpshare',
            level:'',
            requireLogin:false,
            checkSIMStatus:false
        },
        // level 1 menu
        {
            hash:'#login',
            path:'login',
            level:'1',
            requireLogin:false,
            checkSIMStatus:false
        } ,
        {
            hash:'#home',
            path:'home',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:true
        } ,
        {
            hash:'#account',
            path:'ussd/ussd',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#sms',
            path:'sms/smslist',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#setting',
            path:'network/dial_setting',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#sd',
            path:'sd/sd',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
//        {
//            hash:'#wifi_info',
//            path:'status/home',
//            level:'1',
//            requireLogin:needLogin,
//            checkSIMStatus:true
//        },
        {
            hash:'#help',
            path:'help/help',
            level:'1',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
		{
			hash:'#stat',
			path:'status/traffic_statistics',
			level:'1',
			requireLogin:needLogin,
        		checkSIMStatus:false
		},
        {
            hash:'#app_help',
            path:'help/help',
            level:'2',
            parent:'#help',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#balance',
            path:'ussd/balance',
            level:'2',
            parent:'#account',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        /* {
            hash:'#myAccount',
            path:'ussd/myAccount',
            level:'2',
            parent:'#account',
            requireLogin:needLogin,
            checkSIMStatus:true
        },*/
        {
            hash:'#services',
            path:'ussd/ussd',
            level:'2',
            parent:'#account',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#STK',
            path:'stk/stk',
            level:'2',
            parent:'#account',
            requireLogin:needLogin,
            checkSIMStatus:true
        },        
        // level 2 menu
     /*   ,
        {
            hash:'#quick_setting',
            path:'adm/quick_setting',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },*/
        {
            hash:'#net_setting',
            path:'network/dial_setting',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
//        {
//            hash:'#wifi',
//            path:'wifi/wifi_basic',
//            level:'2',
//            parent:'#setting',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
        {
            hash:'#device_setting',
            path:'adm/password',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#firewall',
            path:'firewall/port_filter',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#router_setting',
            path:'adm/lan',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
		{
			hash:'#statistics',
			path:'status/traffic_statistics',
			level:'2',
			parent:'#stat',
			requireLogin:needLogin,
        		checkSIMStatus:false
		},
/*		{
			hash:'#traffic_alert',
			path:'status/traffic_alert',
			level:'2',
			parent:'#status',
			requireLogin:needLogin,
            checkSIMStatus:false
		},*/
/*        {
            hash:'#station_info',
            path:'status/home',
            level:'2',
            parent:'#wifi_info',
            requireLogin:needLogin,
            checkSIMStatus:false
        },*/
        {
            hash:'#sdcard',
            path:'sd/sd',
            level:'2',
            parent:'#sd',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#httpshare',
            path:'sd/httpshare',
            level:'2',
            parent:'#sd',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#smslist',
            path:'sms/smslist',
            level:'2',
            parent:'#sms',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#phonebook',
            path:'phonebook/phonebook',
            level:'2',
            parent:'#sms',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
//        {
//            hash:'#ap_station',
//            path:'wifi/ap_station',
//            level:'2',
//            parent:'#setting',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
        {
            hash:'#device_info',
            path:'status/device_info',
            level:'2',
            parent:'#setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        // level 3 menu
      
        {
            hash:'#dial_setting',
            path:'network/dial_setting',
            level:'3',
            parent:'#net_setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#net_select',
            path:'network/net_select',
            level:'3',
            parent:'#net_setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#apn_setting',
            path:'network/apn_setting',
            level:'3',
            parent:'#net_setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
/*       {
            hash:'#wifi_basic',
            path:'wifi/wifi_basic',
            level:'3',
            parent:'#wifi',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#wifi_advance',
            path:'wifi/wifi_advance',
            level:'3',
            parent:'#wifi',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#wps',
            path:'wifi/wps',
            level:'3',
            parent:'#wifi',
            requireLogin:needLogin,
            checkSIMStatus:false
        },*/
//        {
//            hash:'#password_management',
//            path:'adm/password',
//            level:'3',
//            parent:'#device_setting',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
        {
            hash:'#pin_management',
            path:'adm/pin',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#sms_setting',
            path:'sms/sms_setting',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#restore',
            path:'adm/restore',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
//        {
//            hash:'#restart',
//            path:'adm/restart',
//            level:'3',
//            parent:'#device_setting',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
//        {
//            hash:'#sleep_mode',
//            path:'wifi/sleep_mode',
//            level:'3',
//            parent:'#device_setting',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
        /* {
            hash:'#dlna_setting',
            path:'adm/dlna',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin
        },
        {
            hash:'#fastboot',
            path:'adm/fastboot',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin
        },*/
        {
            hash:'#port_filter',
            path:'firewall/port_filter',
            level:'3',
            parent:'#firewall',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
    
//     {
//     hash:'#port_forward',
//     path:'firewall/port_forward',
//     level:'3',
//     parent:'#firewall',
//     requireLogin:needLogin
//     },
     
        {
            hash:'#port_map',
            path:'firewall/port_map',
            level:'3',
            parent:'#firewall',
            requireLogin:needLogin,
            checkSIMStatus:false
        },

//     {
//     hash:'#system_security',
//     path:'firewall/system_security',
//     level:'3',
//     parent:'#firewall',
//     requireLogin:needLogin
//     },

        {
            hash:'#upnp',
            path:'firewall/upnp_setting',
            level:'3',
            parent:'#firewall',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#dmz',
            path:'firewall/dmz_setting',
            level:'3',
            parent:'#firewall',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
             hash:'#update_management',
            path:'update/ota_update',
            level:'3',
            parent:'#device_setting',
            requireLogin:needLogin
        },
        {
            hash:'#device',
            path:'status/device_info',
            level:'3',
            parent:'#device_info',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#device_messages',
            path:'sms/smslist',
            level:'3',
            parent:'#smslist',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#sim_messages',
            path:'sms/sim_messages',
            level:'3',
            parent:'#smslist',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
//        {
//            hash:'#wifiinfo',
//            path:'status/home',
//            level:'3',
//            parent:'#station_info',
//            requireLogin:needLogin,
//            checkSIMStatus:true
//        },
        {
            hash:'#sdsetting',
            path:'sd/sd',
            level:'3',
            parent:'#sdcard',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#http_share',
            path:'sd/httpshare',
            level:'3',
            parent:'#httpshare',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
        {
            hash:'#mybalance',
            path:'ussd/balance',
            level:'3',
            parent:'#balance',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#my_account',
            path:'ussd/myAccount',
            level:'3',
            parent:'#myAccount',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#my_services',
            path:'ussd/ussd',
            level:'3',
            parent:'#services',
            requireLogin:needLogin,
            checkSIMStatus:true
        },
        {
            hash:'#sim_menu',
            path:'stk/stk',
            level:'3',
            parent:'#STK',
            requireLogin:needLogin,
            checkSIMStatus:true
        },        
        {
            hash:'#router',
            path:'adm/lan',
            level:'3',
            parent:'#router_setting',
            requireLogin:needLogin,
            checkSIMStatus:false
        },
//        {
//            hash:'#apstation',
//            path:'wifi/ap_station',
//            level:'3',
//            parent:'#ap_station',
//            requireLogin:needLogin,
//            checkSIMStatus:false
//        },
        {
            hash:'#group_all',
            path:'phonebook/phonebook',
            level:'3',
            parent:'#phonebook',
            requireLogin:needLogin,
            checkSIMStatus:false
        } ,
		{
			hash:'#traffic_statistics',
			path:'status/traffic_statistics',
			level:'3',
			parent:'#statistics',
			requireLogin:needLogin,
        		checkSIMStatus:false
		},
        {
            hash:'#help',
            path:'help/help',
            level:'3',
            parent:'#app_help',
            requireLogin:needLogin,
            checkSIMStatus:true
        }


    ];

    return menu;
});
