import express from 'express';
import parse from 'csv-parse/lib/sync';
import csv from 'csvtojson';
import cvss from 'fast-csv';
import bodyParser from 'body-parser';
import _ from 'lodash';
import multer from 'multer';
import fs from 'fs';
import { delimiter } from 'path';

const app = express();
const upload = multer();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/', upload.array('file', 10), async (req, res) => {
	var results = [];
	await req.files.map(async file => {
		return await csv({ delimiter: '\t' })
			.fromString(file.buffer)
			.on('end_parsed', obj => results.push(obj));
	});
	let main, backup;

	if (Object.keys(results[0][0]).length > Object.keys(results[1][0]).length) {
		main = results[0];
		backup = results[1];
	} else {
		main = results[1];
		backup = results[0];
	}

	main.forEach(row => {
		const id = row['UID'];
		const data = _.find(backup, { UID: id });
		row['Phone'] = data['Phone'];
	});
	return res.json(main);
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
