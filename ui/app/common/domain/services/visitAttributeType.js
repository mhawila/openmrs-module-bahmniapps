'use strict';

angular.module('bahmni.common.domain')
    .service('visitAttributeTypeService', ['$http', function ($http) {
        this.getByUuid = function (uuid) {
            return $http.get(Bahmni.Common.Constants.visitAttributeTypeUrl + '/' + uuid);
        };


        this.getByName = function (name) {
            return $http.get(Bahmni.Common.Constants.visitAttributeTypeUrl, {
                params: {
                    q: name,
                    v: 'full'
                },
                withCredentials: true
            }).then(function(response) {
                if(response.data && response.data.results && Array.isArray(response.data.results)
                    && response.data.results.length > 0) {
                    return response.data.results[0];
                }
            });
        };
    }]);
