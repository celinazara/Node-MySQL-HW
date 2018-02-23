//require mySQL and inquirer
var mysql = require('mysql');
var inquirer = require('inquirer');

//create connection with DataBase

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    //user name
    user: "root",
    //personal password--security purposes
    password:"root",
    database: "bamazon"
});

//printing items for sale
connection.query('SELECT * FROM Products', function (err, res) {
    if(err) throw err;
     console.log("Welcome to Bamazon!");
     console.log("------------------------------------");

    for(var i=0; i<res.length; i++){
        console.log("ID: " + res[i].ItemID + " | " + "Product: " + res[i].ProductName + " | " + "Department: " + " | " + res[i].DepartmentName + " | " + "Price: " + res[i].Price + " | " + "Qty: " + res[i].StockQuantity);
        console.log("---------------------------------");

    };

console.log(' ');
inquirer.prompt([
    {
        type: "input",
        name: "id",
        message:"What is the ID of the product you would like to purchase?",
        validate: function(value) {
            if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0) {
                return true;
            } else{
                return false;
            }
        }

    },
    {
        type:"input",
        name: "qty",
        message:"How much would you like to purchase?",
        validate: function (value) {
            if(isNaN(value)) {
                return false;
            } else{
                return true;
            }
        }
    }
]).then(function (ans) {
    var whatToBuy = (ans.id)-1;
    var howMuchToBuy = parseInt(ans.qty);
    var grandTotal = parseFloat(((res[whatToBuy].Price)*howMuchToBuy).toFixed(2));

//Checking Inventory
if(res[whatToBuy].StockQuantity >= howMuchToBuy){
    //updates after purchase
    connection.query("UPDATE Products SET ? WHERE ?", [
        {StockQuantity: (res[whatToBuy].StockQuantity - howMuchToBuy)},
        {ItemID: ans.id}
    ], function (err, result) {
        if(err) throw err;
        console.log("Congrats! Your total is: $" + grandTotal.toFixed(2));
    }
    );
    connection.query("SELECT * FROM Departments", function (err, deptRes) {
        if (err) throw err;
        var index;
        for (var i = 0; i < deptRes.length; i++) {
            if (deptRes[i].DepartmentName === res[whatToBuy].DepartmentName) {
                index = i;
            }
        }

//updates totalSales
connection.query("UPDATE Departments SET ? WHERE ?", [
    {totalSales: depRes[index].totalSales + grandTotal},
    {DepartmentName: res[whatToBuy].DepartmentName}
], function(err, deptRes){
    if(err) throw err;
});

});
            } else {
                console.log("Sorry, there's not enough in stock!");
            }

            reprompt();
        })
});


//asks if they would like to purchase another item
function reprompt() {
    inquirer.prompt([{
        type: "confirm",
        name: "reply",
        message: "Would you like to purchase another item?"
    }]).then(function (ans) {
        if (ans.reply) {
            start();
        } else {
            console.log("See you soon!");
        }
    });
}

start();
