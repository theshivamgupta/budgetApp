//BUDGET CONTROLLER

var budgetController  = (function() {
  var Expenses = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }
  var Incomes = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  Expenses.prototype.calculatePercantage = function(totalIncome) {
      if(totalIncome > 0) {
          this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
          this.percentage = -1;
      }
  };
    
  Expenses.prototype.getPercentage = function() {
      return this.percentage;
  };  
  
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
       sum += current.value;
    });
    data.total[type] = sum;  
  };
  
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1  
  }
  return {
      addItem: function(type, des, val) {
          var newItem, ID;

          if(data.allItems[type].length > 0) {
              ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
          } else {
              ID = 0;
          }

          if(type === 'exp') {
              newItem = new Expenses(ID, des, val);
          } else if(type === 'inc') {
              newItem = new Incomes(ID, des, val);
          }
          data.allItems[type].push(newItem);
          console.log(newItem);
          return newItem;
      },
      
      calculateBudget: function() {
         //adding the values
          calculateTotal('inc');
          calculateTotal('exp');
        //storing it to the budget
          data.budget = data.total.inc - data.total.exp;      
        //calculating the perecentage
          if(data.budget > 0) {
              data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
          } else {
              data.percentage = -1;
          }
          
      },
      
      calculatePercantages: function() {
          data.allItems.exp.forEach(function(cur) {
              cur.calculatePercantage(data.total.inc);
          });
      },
      
      getPercentages: function() {
          var allPerc = data.allItems.exp.map(function(current) {
              return current.getPercentage();
          });
          return allPerc;
      },
      
      getInput: function() {
        return {
          budget: data.budget,
          totalInc: data.total.inc,
          totalExp: data.total.exp,
          percentage: data.percentage      
        }; 
      },
      
      deleteItem: function(type, id) {
          var ids, index;
          
          ids = data.allItems[type].map(function(cur) {
              //console.log(cur.id);
              return cur.id;
              
          });
          console.log(ids);
          index = ids.indexOf(id);
          //console.log(index);
          
          if(index !== -1) {
              data.allItems[type].splice(index, 1);
          }
      },
      
      testing: function() {
          console.log(data);
          console.log(data.allItems);
      }
  };

})();



//UI CONTROLLER

var UIcontroller = (function() {
  
    var formatNumber = function(num, type) {
        var numSplit, int, decimal;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        
        int = numSplit[0];
        
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        decimal = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + int + '.' + decimal;
    };
    
  return {
    getInput: function() {
      return {
        type: document.querySelector('.add__type').value,
        description: document.querySelector('.add__description').value,
        value: parseInt(document.querySelector('.add__value').value)
      };
    },
    addListItem: function(obj, type) {
        var html, newHtml, element;
        
        if(type === 'inc') {
            element = document.querySelector('.income__list');
            
            html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        } else if(type === 'exp') {
            element = document.querySelector('.expenses__list');
            
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete__btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
        
        // displaying in the UI
        element.insertAdjacentHTML('beforeend', newHtml);
    },
      
    deleteListItem: function(selectorID) {
        var remove = document.getElementById(selectorID);
        remove.parentNode.removeChild(remove);
    },  
      
    displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
        document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');
        if(obj.percentage > 0) {
            document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';    
        } else {
            document.querySelector('.budget__expenses--percentage').textContent = '---';
        }
    },
      
    displayPercentages: function(percentage) {
        
        var fields = document.querySelectorAll('.item__percentage');
        
        var nodeListForEach = function(list, callback) {
            
            for(var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }
            
        };
        
        nodeListForEach(fields, function(current, index){
            if(percentage[index] > 0) {
                current.textContent = percentage[index] + '%';
            } else {
                current.textContent = '---';
            }
            
        });
        
    },  
      
    
    clearFields: function() {
        var fields = document.querySelectorAll('.add__description, .add__value');    
        
        var fieldsArr = Array.prototype.slice.call(fields);
        
        fieldsArr.forEach(function(current, index, array) {
            current.value = "";
        });
    }  
  };
})();


//MAIN CONTROLLER

var controller = (function(budgetCtrl, UIctrl) {

  var setUpEventListeners = function() {
    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if(event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
      
    document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
      
  };
    
    var updateBudget = function() {
        // 4. calculate the budget
        budgetCtrl.calculateBudget();
        // returning the budget
        var budget = budgetCtrl.getInput();
        // 5. Update the budget to the UI
        UIctrl.displayBudget(budget);
    };
    
    var updatePercentage = function() {
        //calculate the percentage
        budgetCtrl.calculatePercantages();
        //read the percentages in budget controller
        var perc = budgetCtrl.getPercentages();
        //display it into the UI
        UIctrl.displayPercentages(perc);
    };
   
    
    var ctrlAddItem = function() {
    // 1. get input from the user
    var input = UIctrl.getInput();
      
    if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
           
    // 2. add item to the budgetController
    var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
    // 3. Add item to the UI
    UIctrl.addListItem(newItem, input.type);
    //calculate percentages
    updatePercentage();    
    // Clear Fields after clicking enter or the tick button   
    UIctrl.clearFields();  
    }
    console.log(input);
    updateBudget();   
  };
    
   var ctrlDeleteItem = function(event) {
       var itemID;
       
       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
       if(itemID) {
           var splitID, type, ID;
           
           splitID = itemID.split('-');
           type = splitID[0];
           ID = parseInt(splitID[1]);
           
           
           //1. delete item from the data structure
           budgetCtrl.deleteItem(type, ID);
           //2. delete item from the UI
           UIctrl.deleteListItem(itemID);
           //3. Update the budget
           updateBudget();
           //4. calculate percentages
           updatePercentage();
       }
   }; 

  return {
    init: function() {
      setUpEventListeners();
      UIctrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage:-1
      });  
      console.log('application has started');
    }
  };
  /*var init = function() {
    setUpEventListeners();
    console.log('will the app start?');
  };
  init();*/

})(budgetController, UIcontroller);

controller.init();
