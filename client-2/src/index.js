const express = require("express");
const { google } = require("googleapis");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL");
});

app.get("/fetch-google-sheet", async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = "YOUR_SPREADSHEET_ID";
        const range = "Sheet1!A:C";

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        if (rows.length) {
            db.query("DELETE FROM data_table", [], (err) => {
                if (err) throw err;
            });

            const insertQuery = "INSERT INTO data_table (column1, column2, column3) VALUES ?";
            const values = rows.map(row => [row[0], row[1], row[2]]);
            db.query(insertQuery, [values], (err) => {
                if (err) throw err;
                console.log("Data inserted into MySQL");
            });

            res.status(200).send("Data fetched and stored in MySQL");
        } else {
            res.status(404).send("No data found in Google Sheet");
        }
    } catch (err) {
        console.error("Error fetching data from Google Sheets:", err);
        res.status(500).send("Error fetching data");
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));