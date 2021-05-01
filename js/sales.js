var app = new Vue({
  el: "#app",
  mounted: function() {
    this.getProfile();   
    this.getBills();    
    this.sale.date = moment().format("DD MMM YYYY");    
  },
  created: function() {
    this.resetProps();
  },
  data: {
    taxValue: [18, 28],
    tab: 0,
    viewInvoice: false,
    deleteForm: false,
    deletePassword: "",
    deleteBillid: "",
    deleteConfirm: false,
    lastInvoiceNo: 0,
    allBills: {
      list: [],
      headers: [
        { text: "Invoice No", value: "billNo" },
        { text: "Customer", value: "b_name" },
        { text: "Mobile", value: "b_phone" },
        { text: "Date", value: "date" },
        { text: "Payment Mode", value: "mode_pay" },
        { text: "Amount Paid", value: "amt_paid" },
        { text: "Due", value: "due" },
        { text: "actions", value: "" }
      ],
      search: ""
    },
    billSaving: false,
    showPreview: false,
    billFormValid: false,
    editstep1: false,
    editstep2: false,
    editstep3: false,
    billFormValid1: false,
    billFormValid2: false,
    rules: {
      required: value => !!value || "Required",
      amtpaid: value =>
        (app && app.amtpaidvalid(value)) || "Please enter correct value",
      panValid: value =>
        (app && app.validPan(value)) || "Please enter valid PAN Card Number"
      // phnNo: value => (value && value.length <= 10) || "please enter valid phone number"
    },
    itemPer: ["/Bags", "/Kgs", "/piece", "/tns"],
    smartUser: {},
    updateBill: false,
    pagination: {
      rowsPerPage: -1
    },
    date: {
      min: "",
      minPicker: ""
    },
    loading: false,
    billNo: 0,
    previewDialog: false,
    e1: 0,
    print: false,
    sale: {},
    // includeGst:false,
    items: [{ name: "", hsn: "", quantity: 0, per: "", price: 0, tax: 0 }]
  },
  computed: {
    total() {
      let total;
      total = this.items.reduce(
        (acc, item) =>
          acc +
          ((item.tax / 100) * (item.qty * item.price) + item.price * item.qty),
        0
      );
      total = Math.ceil(total);
      return total;
    }
  },
  watch: {
    "sale.paid_amt": function(val) {
      this.sale.due = this.total - this.sale.paid_amt;
    },
    "date.minPicker": function(val) {
      this.sale.date = moment(val).format("DD MMM YYYY");
    },
    "sale.date": function(val) {
      if (val == "") {
        this.date.minPicker = "";
      }
    },
    total: function(val) {
      this.sale.due = val - this.sale.paid_amt;
    }
  },
  methods: {
    getBills: function() {
      this.loading = true;
      $.ajax({
        type: "get",
        // url: "http://localhost:3000/bills?email="+sessionStorage.getItem("email"),
        url:
          "https://srivenkateswara.herokuapp.com/bills?email=" +
          sessionStorage.getItem("email"),
        dataType: "json"
      })
        .done(function(data) {
          app.allBills.list = data;
          app.getLatestInvoiceNumber(data);         
        })
        .fail(function(request, status, error) {
          app.loading = false;
          // app.hideLoader();
        });
    },
    viewBill: function(id) {
      this.loading = true;
      this.viewInvoice = true;
      $.ajax({
        type: "get",
        // url: "http://localhost:3000/viewBill?id="+id,
        url: "https://srivenkateswara.herokuapp.com/viewBill?id=" + id,
        dataType: "json"
      })
        .done(function(data) {
          app.loading = false;
          app.sale = data;
          app.items = data.items;
          app.previewBill();
          // app.allBills.list=data;
        })
        .fail(function(request, status, error) {
          app.loading = false;
          // app.hideLoader();
        });
    },
    updatebill: function(id) {
      this.loading = true;
      // this.viewInvoice = true;

      $.ajax({
        type: "get",
        // url: "http://localhost:3000/viewBill?id=" + id,
        url: "https://srivenkateswara.herokuapp.com/viewBill?id=" + id,
        dataType: "json"
      })
        .done(function(data) {
          app.loading = false;
          app.sale = data;
          app.items = data.items;
          app.updateBill = true;
          app.tab = 1;
          // app.previewBill();
          // app.allBills.list=data;
        })
        .fail(function(request, status, error) {
          app.loading = false;
          // app.hideLoader();
        });
    },
    previewBill: function() {
      this.showPreview = true;
    },
    saveUpdate: function() {
      this.loading = true;
      let id = this.sale._id;
      delete this.sale._id;
      let data = this.sale;

      data.items = this.items;
      data["smart_user"] = sessionStorage.getItem("email");
      data = JSON.stringify(data);
      data = data.slice(0, -1);
      data = data + "}";
      $.ajax({
        // url: "http://localhost:3000/updateBill?id=" + id,
        url: "https://srivenkateswara.herokuapp.com/updateBill?id=" + id,
        type: "POST",
        cache: false,
        contentType: "application/json",
        processData: false,
        dataType: "json",
        data: data
      })
        .done(function(data) {
          app.loading = false;
          app.resetProps();
          app.updateBill = false;
          app.getBills();
          app.tab = 2;
        })
        .fail(function(request, status, error) {
          app.loading = false;
          // app.hideLoader();
        });
    },
    updateCancel: function() {
      app.resetProps();
      app.updateBill = false;
      delete this.sale._id;
      app.tab = 2;
    },
    editBill: function() {
      this.showPreview = false;
    },
    closePreviewDialog: function() {
      this.resetProps();
      this.previewDialog = false;
    },
    logout: function() {
      sessionStorage.clear();
      window.location = "/";
    },
    amtpaidvalid: function(val) {
      return parseInt(val) <= this.total;
    },
    validPan: function(val) {
      if (val.length) {
        let reg = /^([a-zA-Z])([0-9])([a-zA-Z])?$/;
        return reg.test(val);
      }
    },
    resetProps: function() {
      Object.keys(this.sale).forEach(item => {
        if(item !== 'billNo'){
          this.sale[item] = "";
        } else{
          this.sale[item] = this.returnSaleInvoice();
        }
              
      });
      this.items = [{ name: "", hsn: "", qty: 1, price: 0, tax: 0 }];      
      this.sale.date = moment().format("DD MMM YYYY");     
    },
    getProfile: function() {
      this.loading = true;
      if (
        sessionStorage.getItem("email") &&
        sessionStorage.getItem("email").length
      ) {
        $.ajax({
          type: "get",
          // url: "http://localhost:3000/profile?email="+sessionStorage.getItem("email"),
          url:
            "https://srivenkateswara.herokuapp.com/profile?email=" +
            sessionStorage.getItem("email"),
          dataType: "json"
        })
          .done(function(data) {
            app.loading = false;
            if (data.length === 0) {
              alert("no data");
            } else {
              app.smartUser = data;
            }
          })
          .fail(function(request, status, error) {
            // app.hideLoader();
            app.loading = false;
          });
      } else {
        this.loading = false;
        window.location = "/";
      }
    },
    addRow() {
      event.stopPropagation();
      this.items.push({ name: "", hsn: "", qty: 1, price: 0, tax: 0 });
    },
    removeItem(index) {
      this.items.splice(index, 1);
    },
    saveBill: function(print) {
      if (print) {
        window.print();
        this.saveInvoice();
      } else {
        this.saveInvoice();
      }
    },
    checkUser: function() {
      return new Promise((resolve, reject) => {
        $.ajax({
          type: "get",
          // url:
          //   "http://localhost:3000/user?email=" +
          //   sessionStorage.getItem("email") +
          //   "&password=" +
          //   app.deletePassword,
          url:
            "https://srivenkateswara.herokuapp.com/user?email=" +
            sessionStorage.getItem("email") +
            "&password=" +
            this.deletePassword,
          dataType: "json",
          success: function(data) {
            if (Object.keys(data).length != 0) {
              resolve(data);
            } else {
              app.loading = false;
              alert("plaese Enter correct password");
            }
          },
          error: function(error) {
            reject(error);
          }
        });
      });
    },
    deleteBill: function() {
      this.loading = true;
      if (
        sessionStorage.getItem("email") &&
        sessionStorage.getItem("email").length
      ) {
        app
          .checkUser()
          .then(data => {
            $.ajax({
              // url:"http://localhost:3000/deleteBill?id=" + app.deleteBillid,
              url: "https://srivenkateswara.herokuapp.com/deleteBill?id=" + app.deleteBillid,
              type: "POST",
              cache: false,
              contentType: "application/json",
              processData: false,
              dataType: "json"
            })
              .done(function(data) {
                app.loading = false;
                app.deleteBillid = "";
                app.deleteConfirm = false;
                app.resetProps();
                app.getBills();
                app.tab = 2;
              })
              .fail(function(request, status, error) {
                app.loading = false;
              });
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    saveInvoice: function() {
      this.loading = true;
      if (this.sale["_id"] && this.sale["_id"].length != 0) {
        delete this.sale["_id"];
      }
      let data = this.sale;
      data.items = this.items;
      data["smart_user"] = sessionStorage.getItem("email");
      data = JSON.stringify(data);
      data = data.slice(0, -1);
      data = data + "}";
      this.showPreview = true;
      console.log("data saving", data);
      $.ajax({
        // url: "http://localhost:3000/bill",
        url: "https://srivenkateswara.herokuapp.com/bill",
        type: "POST",
        cache: false,
        contentType: "application/json",
        processData: false,
        dataType: "json",
        data: data
      })
        .done(function(data) {
          app.loading = false;
          app.e1 = 1;
          app.billSaving = false;
          app.showPreview = false;
          this.lastInvoiceNo = this.lastInvoiceNo+1;
          app.resetProps();
        })
        .fail(function(request, status, error) {
          app.loading = false;
        });
    },
    RsPaise: function(n) {
      nums = n.toString().split(".");
      var whole = Rs(nums[0]);
      if (nums[1] == null) nums[1] = 0;
      if (nums[1].length == 1) nums[1] = nums[1] + "0";
      if (nums[1].length > 2) {
        nums[1] = nums[1].substring(2, length - 1);
      }
      if (nums.length == 2) {
        if (nums[0] <= 9) {
          nums[0] = nums[0] * 10;
        } else {
          nums[0] = nums[0];
        }
        var fraction = Rs(nums[1]);
        if (whole == "" && fraction == "") {
          op = "Zero only";
        }
        if (whole == "" && fraction != "") {
          op = "paise " + fraction + " only";
        }
        if (whole != "" && fraction == "") {
          op = "Rupees " + whole + " only";
        }
        if (whole != "" && fraction != "") {
          op = "Rupees " + whole + "and paise " + fraction + " only";
        }
        amt = document.getElementById("amt").value;
        if (amt > 999999999.99) {
          op = "Oops!!! The amount is too big to convert";
        }
        if (isNaN(amt) == true) {
          op =
            "Error : Amount in number appears to be incorrect. Please Check.";
        }
        document.getElementById("op").innerHTML = op;
      }
    },
    getLatestInvoiceNumber: function(data){
      const invoiceNos = data.map(item => item.billNo.split('-')[3]);
      this.lastInvoiceNo = parseInt(invoiceNos[invoiceNos.length-1].trim())+1
      this.setInvoiceNo();
      this.loading = false;
    },
    setInvoiceNo: function(){ 
      let yearStr = (new Date().getFullYear()).toString();   
      yearStr = yearStr.substr(2,2);        
      this.sale.billNo = `SVC-${yearStr}-${Number(yearStr)+1}-`;
      this.sale.billNo = this.sale.billNo + this.lastInvoiceNo.toString(); 
      this.tab=1;     
    },
    returnSaleInvoice(){
      let yearStr = (new Date().getFullYear()).toString();   
      yearStr = yearStr.substr(2,2);        
      let saleNo = `SVC-${yearStr}-${Number(yearStr)+1}-`;
      return saleNo + this.lastInvoiceNo.toString(); 
    }
  },
  filters: {
    currency(value) {
      return Math.ceil(value);
    },
    words(amount) {
      var words = new Array();
      words[0] = "Zero";
      words[1] = "One";
      words[2] = "Two";
      words[3] = "Three";
      words[4] = "Four";
      words[5] = "Five";
      words[6] = "Six";
      words[7] = "Seven";
      words[8] = "Eight";
      words[9] = "Nine";
      words[10] = "Ten";
      words[11] = "Eleven";
      words[12] = "Twelve";
      words[13] = "Thirteen";
      words[14] = "Fourteen";
      words[15] = "Fifteen";
      words[16] = "Sixteen";
      words[17] = "Seventeen";
      words[18] = "Eighteen";
      words[19] = "Nineteen";
      words[20] = "Twenty";
      words[30] = "Thirty";
      words[40] = "Forty";
      words[50] = "Fifty";
      words[60] = "Sixty";
      words[70] = "Seventy";
      words[80] = "Eighty";
      words[90] = "Ninety";
      var op;
      amount = amount.toString();
      var atemp = amount.split(".");
      var number = atemp[0].split(",").join("");
      var n_length = number.length;
      var words_string = "";
      if (n_length <= 9) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
          received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
          n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
          if (i == 0 || i == 2 || i == 4 || i == 7) {
            if (n_array[i] == 1) {
              n_array[j] = 10 + parseInt(n_array[j]);
              n_array[i] = 0;
            }
          }
        }
        value = "";
        for (var i = 0; i < 9; i++) {
          if (i == 0 || i == 2 || i == 4 || i == 7) {
            value = n_array[i] * 10;
          } else {
            value = n_array[i];
          }
          if (value != 0) {
            words_string += words[value] + " ";
          }
          if (
            (i == 1 && value != 0) ||
            (i == 0 && value != 0 && n_array[i + 1] == 0)
          ) {
            words_string += "Crores ";
          }
          if (
            (i == 3 && value != 0) ||
            (i == 2 && value != 0 && n_array[i + 1] == 0)
          ) {
            words_string += "Lakhs ";
          }
          if (
            (i == 5 && value != 0) ||
            (i == 4 && value != 0 && n_array[i + 1] == 0)
          ) {
            words_string += "Thousand ";
          }
          if (
            i == 6 &&
            value != 0 &&
            n_array[i + 1] != 0 &&
            n_array[i + 2] != 0
          ) {
            words_string += "Hundred and ";
          } else if (i == 6 && value != 0) {
            words_string += "Hundred ";
          }
        }
        words_string = words_string.split(" ").join(" ");
      }
      return words_string;
    }
  }
});
