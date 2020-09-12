angular.module('bahmni.clinical')
    .directive('visitAttribute', ['$state', 'visitAttributeTypeService', '$http', '$base64',
        function ($state, visitAttributeTypeService, $http, $base64) {
        var OPTIONS_DATATYPE = 'org.openmrs.customdatatype.datatype.SpecifiedTextOptionsDatatype';
        var NHIF_AUTH_URL_SUFFIX = '/breeze/verification/AuthorizeCard';
        var TOKEN_URL_SUFFIX = '/Token'

        var _verifyMemberNHIFCard = function(scope, accessTokenInfo) {
            $http({
                method: 'GET',
                url: scope.attributeType.value.baseServiceUrl + NHIF_AUTH_URL_SUFFIX,
                params: {
                    CardNo: scope.memberId,
                    visitTypeId: scope.attributeType.chosenVisitType.id,
                    referralNo: scope.attributeType.value.referralNo
                },
                headers: {
                    Authorization: 'Bearer ' + accessTokenInfo.access_token
                }
            }).then(function(response) {
                console.log('NHIF response', response);
            }).catch(function(err) {
                console.log(err);
            });
        }

        var controller = function ($scope) {
            // console.log('Scope passed: ', $scope)
            // Get the attribute type info.
            visitAttributeTypeService.getByName($scope.name).then(function(attributeType) {
                $scope.attributeType = Object.assign({}, $scope.attributeType, attributeType);
                $scope.attributeType.value = '';
                if($scope.options) {
                    $scope.attributeType.dataTypeOptions = true;
                }
            });

            var tokenExpired = function(tokenInfo) {
                return Date.now() >= Date.parse(tokenInfo['.expires'])
            }

            $scope.verify = function() {
                console.log('Hebu tuone $scope.attributeType', $scope.attributeType);
                var openhimAuth = $base64.encode('nhif:nhif123');
                // Check for access token in the session storage.
                var accessTokenInfo = sessionStorage.getItem('accessTokenInfo');
                if(!accessTokenInfo || tokenExpired(JSON.parse(accessTokenInfo))) {
                    $http({
                        method: 'POST',
                        url: $scope.attributeType.value.baseServiceUrl + TOKEN_URL_SUFFIX,
                        headers: {
                            // 'Authorization': 'Basic: ' + openhimAuth,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: {
                            username: $scope.attributeType.value.username,
                            password: $scope.attributeType.value.password,
                            grant_type: $scope.attributeType.value.grant_type
                        },
                        transformRequest: function(obj) {
                            var str = [];
                            for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                            return str.join("&");
                        },
                    }).then(function(response) {
                        if(response.status !== 200) {
                            console.log('Token could not be issued with');
                            console.log(response.data);
                            throw new Error('Token could not be issued')
                        } else {
                            sessionStorage.setItem('accessTokenInfo', JSON.stringify(response.data));
                            return response.data;
                        }
                    }).then(function(accessTokenInfo) {
                        _verifyMemberNHIFCard($scope, accessTokenInfo)
                    });
                } else {
                    // token found and not expired.
                    _verifyMemberNHIFCard($scope, JSON.parse(accessTokenInfo))
                }
            }

            $scope.verifyEnabled = function() {
                // console.log('Attribute type', $scope.attributeType)
                if(!Array.isArray($scope.options)) {
                    return false;
                }

                if($scope.attributeType && $scope.attributeType.value) {
                    return $scope.attributeType.value.verify;
                }
                return false;
            }

            // $scope.$watch('attributeType.value', function() {
            //     console.log('$scope.attributeType', $scope.attributeType)
            //     if($scope.attributeType && $scope.attributeType.value) {
            //         var chosenOption = $scope.options.find(function(option) {
            //             return option.name === $scope.attributeType.value;
            //         });
            //
            //         if(chosenOption) {
            //             $scope.attributeType.visitTypes = undefined;
            //             // get the visit types if any.
            //             if(chosenOption.visitTypes) {
            //                 $scope.attributeType.visitTypes = chosenOption.visitTypes;
            //             }
            //         };
            //     }
            // });
        };

        return {
            restrict: 'E',
            scope: {
                name: "=",
                options: "=",
            },
            controller: controller,
            // template:'<p>Why is this thing not working?</p>'
            templateUrl: '../clinical/common/views/visitAttribute.html'
        };
    }])
;
