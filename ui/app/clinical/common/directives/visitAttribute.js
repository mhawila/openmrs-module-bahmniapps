angular.module('bahmni.clinical')
    .directive('visitAttribute', ['$state', 'visitAttributeTypeService', '$http', '$base64',
        function ($state, visitAttributeTypeService, $http, $base64) {
        var OPTIONS_DATATYPE = 'org.openmrs.customdatatype.datatype.SpecifiedTextOptionsDatatype';
        var NHIF_AUTH_URL_SUFFIX = '/breeze/verification/AuthorizeCard';
        var TOKEN_URL_SUFFIX = '/Token'
        var VERIFICATION_URL_SUFFIX =  '/module/nhifinsurance/verification.json';

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
                if(response.data) {
                    scope.nhifVerificationResult = response.data
                }
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
                return Date.now() <= Date.parse(tokenInfo['.expires'])
            }

            $scope.verifyMember = function() {
                console.log('HOST URL:', localStorage.getItem('host'))
                    $http({
                        method: 'GET',
                        url: $scope.attributeType.value.baseServiceUrl + VERIFICATION_URL_SUFFIX,
                        params: {
                            "card-no": $scope.memberId + '',
                            "visit-type-id": $scope.attributeType.chosenVisitType.id + '',
                            "referral-no": $scope.attributeType.value.referralNo + ''
                        },
                        transformRequest: function(params) {
                            var transformed = [];
                            for (var key in params) {
                                transformed.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
                            }
                            return transformed.join('&');
                        },
                        withCredentials: true
                    }).then(function(response) {
                        console.log('NHIF response', response);
                        if(response.data) {
                            $scope.nhifVerificationResult = response.data
                        }
                }).catch(function(err) {
                    console.log(err);
                });
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
