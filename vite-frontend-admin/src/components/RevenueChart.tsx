import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', uv: 30, pv: 30 },
    { name: 'Feb', uv: 50, pv: 40 },
    { name: 'Mar', uv: 70, pv: 60 },
    { name: 'Apr', uv: 60, pv: 50 },
    { name: 'May', uv: 100, pv: 80 },
    { name: 'Jun', uv: 120, pv: 110 },
];

const RevenueChart: React.FC = () => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
                type="monotone"
                dataKey="uv"
                stroke="#4CAF50"
                fill="rgba(76, 175, 80, 0.2)"
                dot={false}
                isAnimationActive={true} // Animation tự động
                animationDuration={1000} // Thời gian animation (ms)
            />
        </LineChart>
    </ResponsiveContainer>
);

export default RevenueChart;
