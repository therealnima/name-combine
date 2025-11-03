// import express module
const express = require('express');
const fs = require('fs');
const path = require('path');
// create an express application
const app = express();
const port = 3000;

// start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
// define a route for the root URL
app.get('/api/combine', (req, res) => {
    const { name1, name2 } = req.query;
    if (!name1 || !name2) {
        return res.status(400).json({ error: 'Missing required query parameters: name1 and name2' });
    }
    let result ={
        name1:'',
        name2:'',
        results:[]
    }
  //extract query string parameters
  result.name1 = name1
  result.name2 = name2 

  //compute combined value
  const combos = [
    'Poma',
  ];

  //create array of results
  combos.forEach((combo, index) => {
    const goodness = (Math.random() * 5).toFixed(2); //random goodness score between 0 and 5
    result.results.push({
      id: index + 1,
      name: combo,
      goodness: parseFloat(goodness),
    });
  });

  //write the result to a file
  const filePath = path.join(__dirname, '/logs/output.log');
  console.log(filePath);
  fs.appendFile(filePath, JSON.stringify(result) + '\n', (err) => {
    if (err) {
      console.error('Error writing to file', err);
    }
  });

    //send JSON response
    res.json({ result});

});