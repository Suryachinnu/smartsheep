

var app = new Vue({
    el: '#app',
    data: {
        loading:false,
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
            urlValidation: value => ((app && app.validEmail(value))) || 'Enter valid URL',
        },
        isRegisterFormValid:false
        },
    methods:{
        loginMethod: function(){
            this.loading=true;
            $.ajax({
                type: "get",
                // url: "http://localhost:3000/user?email="+this.l_username+"&password="+this.l_password,
                url:"https://srivenkateswara.herokuapp.com/user?email="+this.l_username+"&password="+this.l_password,
                dataType: "json"
            }).done(function (data) {
                app.loading=false;
                if(Object.keys(data).length===0){
                    app.showSnackBar("Please provide valid credentials", "error");
                }else{
                   this.smartUser = data;
                   sessionStorage.setItem("email", data.email);
                   window.location.href='/sales.html'
                }                
            }).fail(function (request, status, error) {
                app.loading=false;
                // app.hideLoader();
            });
        },
        validEmail: function (str) {
            if (str == '') {
                return true
            } else {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);
            }

        },
        showSnackBar: function (message, type = "info") {
            this.snackBar.message = message;
            this.snackBar.type = type;
            this.snackBar.show = true;
        },
        register: function(){
            event.preventDefault();
            this.loading=true;
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
                // url: "http://localhost:3000/user", //local URL
                url:"https://srivenkateswara.herokuapp.com/user",
                type: "POST",
                cache: false,
                contentType:"application/json",
                // processData: false,
                dataType: "json",
                data: JSON.stringify(data),
                success: (response) => {
                    app.loading=false;
                    // alert(response)
                    this.showSnackBar("User registered successfully ...", "success");
                    this.section='login'
                },
                complete: () => {
                    app.loading = false;
                    // this.showSnackBar("Server Error: Unable to Save ...", "error");
                }
            });
        }
        

        }    
});


