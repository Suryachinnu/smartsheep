

var app = new Vue({
    el: '#app',
    data: {
        userName:"adfgf",
        section:'login',
        l_username:'',
        l_password:'',
        r_username:'',
        r_mobilenumber:'',
        r_email:'',
        r_password:'',
        r_companyname:'',
        r_address:'',
        r_gstin:'',
        r_bankName:'',
        r_accNo:'',
        r_branchName:'',
        r_ifsc:'',
        isLoginFormValid:false,
        smartUser:{},
        snackBar: {
            show: false,
            type: "info",
            message: ""
        },
        rules: {
            required: value => !!value || 'Required',
            urlValidation: value => ((app && app.validURL(value))) || 'Enter valid URL',
        },
        isRegisterFormValid:false
        },
    methods:{
        loginMethod: function(){
            $.ajax({
                type: "get",
                url: "http://localhost:3000/user?email="+this.l_username+"&password="+this.l_password,
                dataType: "json"
            }).done(function (data) {
                if(data.length===0){
                    this.showSnackBar("There is no user with this details...", "error");
                }else{
                   this.smartUser = data;
                   sessionStorage.setItem("email", data.email);
                   window.location.href='/sales.html'
                }                
            }).fail(function (request, status, error) {
                // app.hideLoader();
            });
        },
        validURL: function (str) {
            if (str == '') {
                return true
            } else {
                return /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/.test(str);
            }

        },
        showSnackBar: function (message, type = "info") {
            this.snackBar.message = message;
            this.snackBar.type = type;
            this.snackBar.show = true;
        },
        register: function(){
            event.preventDefault();
            let data = {
                "name":this.r_username,
                "email":this.r_email,
                "mobileNumber":this.r_mobilenumber,
                "password":this.r_password,
                "companyName":this.r_companyname,
                "GSTINnumber":this.r_gstin,
                "address":this.address,
                "bankName":this.r_bankName,
                "accNo":this.r_accNo,               
                "branchName":this.r_branchName,
                "IFSC":this.r_ifsc
            };
            $('#saveData').val(data)

            var form =  $('#saveDataForm')[0];            
            var dataform = new FormData(form);
            // dataform.append("data", data)
            $.ajax({
                url: "http://localhost:3000/user",
                type: "POST",
                cache: false,
                contentType:"application/json",
                // processData: false,
                dataType: "json",
                data: JSON.stringify(data),
                success: (response) => {
                    // alert(response)
                    this.showSnackBar("User registered successfully ...", "success");
                    this.section='login'
                },
                complete: () => {
                    this.loading = false;
                    // this.showSnackBar("Server Error: Unable to Save ...", "error");
                }
            });
        }
        

        }    
});


