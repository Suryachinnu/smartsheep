

var app = new Vue({
    el: '#app',
    mounted: function () {
        this.getProfile();
        this.billNo = new Date();
        this.billNo = this.billNo.valueOf();
    },
    created: function(){
      this.resetProps();
    },
    data: {        
        taxValue:[18,28],
        billSaving:false,
        showPreview:false,
        billFormValid:false,
        editstep1:false,
        editstep2:false,
        editstep3:false,
        billFormValid1:false,
        billFormValid2:false,
        rules: {
          required: value => !!value || 'Required',
          amtpaid: value => (app && app.amtpaidvalid(value)) || 'Please enter correct value'
        },
        itemPer:["/Kgs","/piece","/tns"],
        smartUser:{},
        billNo:0,
        e1: 0,
        print:false,
        sale:{},
        items: [
            { name: "",hsn:"", quantity: 0,per:"", price: 0,tax:0 },           
          ]
        },
        computed: {
            total() {              
              let total;
              total= this.items.reduce(
                (acc, item) => acc + item.price * item.qty + (item.tax/100*(item.qty*item.price)),
                0
              );
              total = Math.ceil(total)
              return total
            }
          }, 
          watch:{
            "sale.paid_amt":function(val){
              this.sale.due=this.total - this.sale.paid_amt
            }
          },       
    methods:{ 
      previewBill: function(){
        // alert("billsaving");       
        this.billSaving=true;
        this.showPreview=true;        
      },
      amtpaidvalid: function(val){       
        return parseInt(val)  <= this.total
      },   
      resetProps:function(){
        Object.keys(this.sale).forEach(item=>{
          this.sale[item]='';
        })
        this.items=[{ name: "",hsn:"", qty: 1, price: 0,tax:0 }];
      },
      getProfile: function(){
            $.ajax({
                type: "get",
                url: "http://localhost:3000/profile?email="+sessionStorage.getItem("email"),
                dataType: "json"
            }).done(function (data) {
                if(data.length===0){
                    alert("no data");
                }else{
                   app.smartUser = data;                   
                }                
            }).fail(function (request, status, error) {
                // app.hideLoader();
            });
        },
        addRow() {
          event.stopPropagation();
            this.items.push({ name: "",hsn:"", qty: 1, price: 0,tax:0 });
          },
          removeItem(index){
              this.items.splice(index,1);
          },
          saveBill: function(){
            if(print){
              window.print();
              this.saveInvoice();
              }
              else{
                this.saveInvoice();
              }
          },
          saveInvoice: function(){           
            let data = this.sale;
            data.items=this.items;
            data['smart_user']=sessionStorage.getItem("email")           
            data = JSON.stringify(data)
            data = data.slice(0, -1);
            data = data+"}";          
            this.showPreview=true;
            $.ajax({              
              url: "http://localhost:3000/bill",
              type: "POST",
              cache: false,
              contentType:"application/json",
              processData: false,
              dataType: "json",
              data:data,
          }).done(function (data) {   
              app.e1=1;     
              app.billSaving=false;   
              app.showPreview = false;              
              app.resetProps();            
          }).fail(function (request, status, error) {
            
          });
         
          },
          RsPaise : function(n){
            nums = n.toString().split('.')
            var whole = Rs(nums[0])
            if(nums[1]==null)nums[1]=0;
            if(nums[1].length == 1 )nums[1]=nums[1]+'0';
            if(nums[1].length> 2){nums[1]=nums[1].substring(2,length - 1)}
            if(nums.length == 2){
            if(nums[0]<=9){nums[0]=nums[0]*10} else {nums[0]=nums[0]};
            var fraction = Rs(nums[1])
            if(whole=='' && fraction==''){op= 'Zero only';}
            if(whole=='' && fraction!=''){op= 'paise ' + fraction + ' only';}
            if(whole!='' && fraction==''){op='Rupees ' + whole + ' only';} 
            if(whole!='' && fraction!=''){op='Rupees ' + whole + 'and paise ' + fraction + ' only';}
            amt=document.getElementById('amt').value;
            if(amt > 999999999.99){op='Oops!!! The amount is too big to convert';}
            if(isNaN(amt) == true ){op='Error : Amount in number appears to be incorrect. Please Check.';}
            document.getElementById('op').innerHTML=op;}
          }

        },
    filters: {
            currency(value) {
              return Math.ceil(value);
            },
            words(amount){
              var words = new Array();
              words[0] = 'Zero';words[1] = 'One';words[2] = 'Two';words[3] = 'Three';words[4] = 'Four';words[5] = 'Five';words[6] = 'Six';words[7] = 'Seven';words[8] = 'Eight';words[9] = 'Nine';words[10] = 'Ten';words[11] = 'Eleven';words[12] = 'Twelve';words[13] = 'Thirteen';words[14] = 'Fourteen';words[15] = 'Fifteen';words[16] = 'Sixteen';words[17] = 'Seventeen';words[18] = 'Eighteen';words[19] = 'Nineteen';words[20] = 'Twenty';words[30] = 'Thirty';words[40] = 'Forty';words[50] = 'Fifty';words[60] = 'Sixty';words[70] = 'Seventy';words[80] = 'Eighty';words[90] = 'Ninety';var op;
              amount = amount.toString();
              var atemp = amount.split(".");
              var number = atemp[0].split(",").join("");
              var n_length = number.length;
              var words_string = "";
              if(n_length <= 9){
              var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
              var received_n_array = new Array();
              for (var i = 0; i < n_length; i++){
              received_n_array[i] = number.substr(i, 1);}
              for (var i = 9 - n_length, j = 0; i < 9; i++, j++){
              n_array[i] = received_n_array[j];}
              for (var i = 0, j = 1; i < 9; i++, j++){
              if(i == 0 || i == 2 || i == 4 || i == 7){
              if(n_array[i] == 1){
              n_array[j] = 10 + parseInt(n_array[j]);
              n_array[i] = 0;}}}
              value = "";
              for (var i = 0; i < 9; i++){
              if(i == 0 || i == 2 || i == 4 || i == 7){
              value = n_array[i] * 10;} else {
              value = n_array[i];}
              if(value != 0){
              words_string += words[value] + " ";}
              if((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)){
              words_string += "Crores ";}
              if((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)){
              words_string += "Lakhs ";}
              if((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)){
              words_string += "Thousand ";}
              if(i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)){
              words_string += "Hundred and ";} else if(i == 6 && value != 0){
              words_string += "Hundred ";}}
              words_string = words_string.split(" ").join(" ");}
              return words_string;
            }
          }    
});


