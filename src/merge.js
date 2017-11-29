import express from 'express';
import csv from 'fast-csv';
import bodyParser from 'body-parser';
import _ from 'lodash';
import multer from 'multer';
import fs from 'fs';



const app = express();
const upload = multer();
const PORT = 8080;

app.use(bodyParser.urlencoded( {extended: true} ))
app.set('view engine', 'pug')

app.get("/",  (req, res) => {
    res.render('index');
});

app.post("/", upload.array('file', 10),  async (req, res) => {
    var results = [];
    await req.files.map(async file => {
        await csv.fromString(file.buffer.toString(), { delimiter: "\t" }).on("data", data => {
            const da = _.zipObject(["email", "id", "name", "email", "phone"], data);
            results.push(da);  
        }).on('end', async () => {
            results = _.uniqBy(results, "id");
        })
    });
    console.log(results);
    res.set({ "Content-Disposition": 'attachment; filename="data.csv"' });
    return csv.write(results, { headers: true, delimiter: ";", transform: row => ({ Email: row.email, ID: row.id, Name: row.name, Phone: row.phone }) }).pipe(res);
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
