/**
 * help 模块
 * @module help
 * @class help
 */

define([ 'jquery', 'knockout', 'config/config', 'service', 'underscore' ],

    function ($, ko, config, service, _) {


        /**
         * 初始化 ViewModel，并进行绑定
         * @method init
         */
        function init() {
            var container = $('#container')[0];
            ko.cleanNode(container);
        }

        return {
            init:init
        }
    });
