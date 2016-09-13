/**
 * Buy an agreement template
 */
$scope.buy = function (plan, planPrice, model, serviceName) {
    
    $('#buyPaypal').hide(0);
    $('#buyFree').show(0); $('#buyFree').text("CONFIRM");
    
    plan = $filter('unquote')(plan);
    var newAG = $.extend(true,{}, model);
    
    console.log("Plan: " + JSON.stringify(plan, null, 2));
    
    console.log("planPrice: " + JSON.stringify(planPrice, null, 2));
    
    console.log("context: " + JSON.stringify(newAG.context, null, 2));
    
    console.log("serviceName: " + JSON.stringify(serviceName, null, 2));
    
    
    
    newAG.context.type = "instance";
    newAG.context["validity"] = {effectiveDate: new Date().toISOString(), expirationDate: ""};
    newAG.pricing.plan = plan;
    newAG.pricing.cost = planPrice;
    newAG.context.id = guid();
    
    newAG.availability = newAG.plans[plan].availability ? newAG.plans[plan].availability: newAG.availability;
    
    var quotas = newAG.plans[plan].quotas;
    var rates = newAG.plans[plan].rates;
    var guarantees = newAG.plans[plan].guarantees;
    var configurations = newAG.plans[plan].configuration;
    
    for (var c in configurations){
        newAG.configuration[c] = configurations[c];
    }
    
    for (var q in quotas){
        var quota = quotas[q];
        if(!newAG.quotas[q]) newAG.quotas[q] = {};
        for (m in quota){
            var method = quota[m];
            if(!newAG.quotas[q][m]) newAG.quotas[q][m] = {};
            for(me in method){
                var metric = method[me];
                if(!newAG.quotas[q][m][me]) newAG.quotas[q][m][me] = [];
            
                newAG.quotas[q][m][me] = metric.map((element)=>{ delete(element.$$hashKey); return element;});
            }
        }
    }
    
    for (var q in rates){
        var rate = rates[q];
        if(!newAG.rates[q]) newAG.rates[q] = {};
        for (m in rate){
            var method = rate[m];
            if(!newAG.rates[q][m]) newAG.rates[q][m] = {};
            for(me in method){
                var metric = method[me];
                if(!newAG.rates[q][m][me]) newAG.rates[q][m][me] = [];
            
                newAG.rates[q][m][me] = metric.map((element)=>{ delete(element.$$hashKey); return element;});
            }
        }
    }
    
    for (var q in guarantees){
        var guarantee = guarantees[q];
        if(!newAG.guarantees[q]) newAG.guarantees[q] = {};
        for (m in guarantee){
            var method = guarantee[m];
            if(!newAG.guarantees[q][m]) newAG.guarantees[q][m] = [];
            
            newAG.guarantees[q][m] = method.map((element)=>{ delete(element.$$hashKey); return element;});
        }
    }
    
    delete(newAG.plans);
    
    function removeHash(newAG){
        for( var v in newAG ){
            var value = newAG[v];
            if(value instanceof Object){
                removeHash(value);
            }else if (value instanceof Array){
                for(var i in value){
                    removeHash(value[i]);
                }
            }else{
                if(v === "$$hashKey")
                    delete(newAG[v]);
            }
        }    
    }
    
    
    
    // Modal variables
    var modalHeader = "Confirmation",
        modalBody = 'Are you sure you want buy plan <b> ' + plan.toUpperCase() + '</b> for <b>' +  planPrice + ' € / month</b> ?'; /**+
            // Visible paypal form
            '<div class="col l12 m12 s12 file-field input-field">' +
                '<input id="client_id" type="text" class="validate">' +
                '<label for="client_id">Client ID:</label>' +
            '</div>' +
        
            
             //Visible voucher form
            '<div class="col l12 m12 s12 file-field input-field">' +
                '<form id="voucherBuy" target="_self" action="/api/v1/portal/buy" method="post">' +
                    '<input id="voucher_code" type="text" class="validate" value="isa">' +
                    '<label for="voucher_code" data-error="invalid voucher code" data-success="voucher code successfully applied" style="width: 100%;">Voucher Code:</label>' +
                    '<input id="custom" type="hidden" name="custom" value="">' +
                '</form>' +
            '</div>'  +
            
            // Paypal button params
            '<form id="paypalForm" target="_self" action="https://www.sandbox.paypal.com/cgi-bin/webscr" method="post">' +
            	'<input type="hidden" name="cmd" value="_xclick">' +
            	'<input type="hidden" name="charset" value="utf-8">' +
            	'<input type="hidden" name="business" value="'+ $scope.paypal +'">' +
            	'<input type="hidden" name="item_name" value="'+ plan +' plan for ' + serviceName +'">' +
            	'<input type="hidden" name="no_shipping" value="1">' +
            	'<input type="hidden" name="currency_code" value="EUR">' +
            	'<input type="hidden" name="amount" value="'+ planPrice +'">' +
            	'<input type="hidden" name="return" value="http://portal.governify.io/api/v1/portal/buy"> ' +
            	'<input type="hidden" name="notify_url" value="http://portal.governify.io/api/v1/portal/buy"> '+
            	'<input type="hidden" name="rm" value="2"> '+
            	'<input type="hidden" name="cancel_return" value="http://portal.governify.io/app/#/validation"> '+
                
                // portal/buy params
                '<input type="hidden" name="custom" value="">' +
            '</form>' **/;
    
    
    
    setTimeout(function () {$('input').each(function(index, el) {
        $("#voucher_code").unbind("blur").on("blur", function () {
            $http({
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data : 'voucher_code=' + $(this).val(),
                url: '/api/v1/portal/voucher'
            }).then(
                function (response) {
                    console.log(response.status);
                    hidePaypalButton();
                    $("#voucher_code").removeClass("invalid").addClass("valid");
                },
                function (response) {
                    console.log(response.status);
                    showPaypalButton();
                    $("#voucher_code").removeClass("valid");
                    if ($("#voucher_code").val()!=="") $("#voucher_code").addClass("invalid");
                }
            );
        });

        $("#client_id, #voucher_code").unbind("keypress keyup").on("keypress keyup", function (event) {
            var keyPressed = event.keyCode || event.which;
            if (keyPressed==13) {
                event.preventDefault();
                return false;
            }
        });

        // Correct materialize input view with default values
        if ($(this).val() != '') {
            $(this).next('label').addClass('active');
        }
    })},100);
    
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +s4() + '-' + s4() + s4() + s4();
    }
    
    function apikey(){
        var guidArray = guid().split('-');
        return guidArray[guidArray.length - 1];
    }
    
    if(planPrice === 0 || planPrice === '0'){
            var clientId = $("#client_id").val();
            if(!clientId || clientId == "") clientId = "default@default.com"; 
            if (clientId !== "") {
                newAG.context.consumer = clientId;
                var supervisorURL = newAG.infrastructure["supervisor"];
                supervisorURL = supervisorURL[supervisorURL.length - 1] != "/" ? supervisorURL + "/" : supervisorURL; 
                
                removeHash(newAG);
                
                console.log(newAG);
                
                $http.post(supervisorURL + "slas", JSON.stringify(newAG), {
                    
                    headers: {'Content-Type': 'application/json; charset=utf-8'}
                    
                }).then((response)=>{
                    
                    var tenant = {
                        sla: newAG.context.id,
                        scope:{
                            apikey: apikey(),
                            account: clientId,
                            tenant: clientId.split('@').length > 1 ? clientId.split('@')[1] : clientId
                        }
                    }
                    console.log(tenant);
                    $http.post(supervisorURL + "tenants", JSON.stringify(tenant) ).then(( response )=>{
                        
                        $("#genericModal").closeModal();
                        
                        $state.go('validation', {apikey: tenant.scope.apikey});
                        
                    }, ( response ) => {
                        Materialize.toast("This tenant has already agreement", 3000);
                    });
                    
                }, (response)=>{
                    
                    if(response.status === 403){
                        //Agreement already exists
                        Materialize.toast("This tenant has already agreement", 3000);
                    }
                    
                    console.log(response);
                    Materialize.toast("There was an error, please try again", 3000);
                    
                });
                
            } else {
                Materialize.toast("Please, provide a client id", 3000);
            }
    }else{
        $scope.showModal(modalHeader, modalBody,
        
            function () {
                var clientId = $("#client_id").val();
                if(!clientId || clientId == "") clientId = "default@default.com"; 
                if (clientId !== "") {
                    newAG.context.consumer = clientId;
                    var supervisorURL = newAG.infrastructure["supervisor"];
                    supervisorURL = supervisorURL[supervisorURL.length - 1] != "/" ? supervisorURL + "/" : supervisorURL; 

                    removeHash(newAG);

                    console.log(newAG);

                    $http.post(supervisorURL + "slas", JSON.stringify(newAG), {

                        headers: {'Content-Type': 'application/json; charset=utf-8'}

                    }).then((response)=>{

                        var tenant = {
                            sla: newAG.context.id,
                            scope:{
                                apikey: apikey(),
                                account: clientId,
                                tenant: clientId.split('@').length > 1 ? clientId.split('@')[1] : clientId
                            }
                        }
                        console.log(tenant);
                        $http.post(supervisorURL + "tenants", JSON.stringify(tenant) ).then(( response )=>{

                            $("#genericModal").closeModal();

                            $state.go('validation', {apikey: tenant.scope.apikey});

                        }, ( response ) => {
                            Materialize.toast("This tenant has already agreement", 3000);
                        });

                    }, (response)=>{

                        if(response.status === 403){
                            //Agreement already exists
                            Materialize.toast("This tenant has already agreement", 3000);
                        }

                        console.log(response);
                        Materialize.toast("There was an error, please try again", 3000);

                    });

                } else {
                    Materialize.toast("Please, provide a client id", 3000);
                }
            }, 
            // Paypal buy
            function () {
                var clientId;
                if ($stateParams.clientid) {
                   clientId = $stateParams.clientid;
                } else {
                   clientId = $("#client_id").val();
                }
                if (clientId !== "") {
                    $("#paypalForm").find("input[name='custom']").val(
                        'PlanType&ISA&'+ plan +
                        '&ISA&'+ $("#client_id").val() +
                        '&ISA&'+ $scope.datastore +
                        '&ISA&' + $scope.modelUrl
                    );
                    $("#paypalForm").submit();
                } else {
                    Materialize.toast("Please, provide a client id", 3000);
                }
            }
        );
    }
    
    
};

$scope.getPlansCol = function(model){
    var planNumber = Object.keys(model.plans).length;
    var preNumber = Math.floor(8/planNumber);
    return preNumber < 3 ? preNumber : 3;
}

$scope.mergeQuotas = function (model, plan){
    var newAG = $.extend(true,{}, model);
    var quotas = newAG.plans[plan].quotas;
    
    for (var q in quotas){
        var quota = quotas[q];
        if(!newAG.quotas[q]) newAG.quotas[q] = {};
        for (m in quota){
            var method = quota[m];
            if(!newAG.quotas[q][m]) newAG.quotas[q][m] = {};
            for(me in method){
                var metric = method[me];
                if(!newAG.quotas[q][m][me]) newAG.quotas[q][m][me] = [];
            
                newAG.quotas[q][m][me] = metric.map((element)=>{ delete(element.$$hashKey); return element;});
            }
        }
    }
    
    return newAG.quotas;
}

$scope.mergeRates = function (model, plan){
    var newAG = $.extend(true,{}, model);
    var rates = newAG.plans[plan].rates;
    
    for (var q in rates){
        var rate = rates[q];
        if(!newAG.rates[q]) newAG.rates[q] = {};
        for (m in rate){
            var method = rate[m];
            if(!newAG.rates[q][m]) newAG.rates[q][m] = {};
            for(me in method){
                var metric = method[me];
                if(!newAG.rates[q][m][me]) newAG.rates[q][m][me] = [];
            
                newAG.rates[q][m][me] = metric.map((element)=>{ delete(element.$$hashKey); return element;});
            }
        }
    }
    
    return newAG.rates;
}