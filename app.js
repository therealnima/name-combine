// import express module
const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
// create an express application
const app = express();
const port = 3000;

// start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
// sqlite database setup
const dbPath = path.join(__dirname, 'name-api-databse.db');
const db= new sqlite3.Database(dbPath, (err) =>{
  if (err) {
    console.error('Error connecting to database', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database at'+ dbPath);
}
);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS name_combinations (
    id iNTEGER PRIMARY KEY AUTOINCREMENT,
    name1 TEXT NOT NULL,
    name2 TEXT NOT NULL,
    names TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  )`);
});

app.get("/api/names", (req, res) => {
  // retrieve all name combinations from the database
  db.all("SELECT * FROM name_combinations ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error('Error retrieving data from database', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows); // send them back as JSON array
  });
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

  const half1 = Math.floor(name1.length / 2);
  const half2 = Math.floor(name2.length / 2);
  //compute combined value
  const combos = [
    // parse each name and add it to a part of the other name to make combinations
      name1.slice(0, half1) + name2.slice(half2),         
      name2.slice(0, half2) + name1.slice(half1),         
      name1.slice(0, 3) + name2.slice(-3),                
      name2.slice(0, 3) + name1.slice(-3),         
      name1.slice(0, 2) + name2.slice(0, 2) 

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

  result.results.forEach(({ name }) => {
  db.run(
    `INSERT INTO name_combinations (name1, name2, names, description)
     VALUES (?, ?, ?, ?)`,
    [name1, name2, name, 'Auto-generated combination'],
    err => {
      if (err) console.error('Error inserting into database:', err.message);
    }
  );
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