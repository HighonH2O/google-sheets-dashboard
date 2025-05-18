import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const DataDashboard = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/data");
                setData(response.data);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Google Sheets Data Dashboard</h1>
            <LineChart
                width={800}
                height={400}
                data={data}
                margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="column1" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="column2" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="column3" stroke="#82ca9d" />
            </LineChart>
        </div>
    );
};

export default DataDashboard;