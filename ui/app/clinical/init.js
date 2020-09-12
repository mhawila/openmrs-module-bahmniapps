'use strict';

var Bahmni = Bahmni || {};
Bahmni.Clinical = Bahmni.Clinical || {};
Bahmni.Clinical.DisplayControl = Bahmni.Clinical.DisplayControl || {};

angular.module('bahmni.clinical', ['base64','bahmni.common.config', 'bahmni.common.domain',
    'bahmni.common.conceptSet', 'bahmni.common.uiHelper', 'bahmni.common.gallery', 'bahmni.common.logging']);
