const express = require("express");
const app = express();
const PORT = 8383;

let data = {
  name: "James",
};

app.get("/", (req, res) => {
  res.send(`<body style="background:pink; color:blue;">
    <h1>DATA:</h1>
    <p>${JSON.stringify(data)}</p>
    </body>`);
});

app.get("/dashboard", (req, res) => {
  res.send("<h1>dashboard</h1>");
});

app.get("/api/data", (req, res) => {
  console.log("This one was for data");
  res.send(data);
});

app.post('/', (req, res) => {
  const newEntry = req, body
})

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
