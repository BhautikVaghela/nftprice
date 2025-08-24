import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts';

interface ChartData {
  date: string;
  price: number;
  volume?: number;
  confidence?: number;
  model?: string;
}

interface ChartsProps {
  historicalData: ChartData[];
  predictions: ChartData[];
  modelComparison: Array<{
    model: string;
    accuracy: number;
    mse: number;
    predictions: ChartData[];
  }>;
}

const Charts: React.FC<ChartsProps> = ({ historicalData, predictions, modelComparison }) => {
  const combinedData = [
    ...historicalData.map(d => ({ ...d, type: 'historical' })),
    ...predictions.map(d => ({ ...d, type: 'prediction' }))
  ];

  const modelColors = {
    'XGBoost': '#8b5cf6',
    'LSTM': '#06b6d4',
    'Random Forest': '#10b981',
    'ARIMA': '#f59e0b',
    'Ensemble': '#ef4444'
  };

  const confidenceData = predictions.map(p => ({
    date: p.date,
    confidence: (p.confidence || 0) * 100,
    price: p.price
  }));

  const volumeData = historicalData.filter(d => d.volume).map(d => ({
    date: d.date,
    volume: d.volume,
    price: d.price
  }));

  const modelAccuracyData = modelComparison.map(m => ({
    model: m.model,
    accuracy: m.accuracy * 100,
    mse: m.mse
  }));

  const priceDistribution = predictions.map(p => ({
    priceRange: `${Math.floor(p.price / 10) * 10}-${Math.floor(p.price / 10) * 10 + 10}`,
    count: 1,
    price: p.price
  }));

  return (
    <div className="space-y-8">
      {/* Main Price Chart */}
      <div className="bg-white rounded-3xl neu-shadow p-8">
        <h3 className="text-2xl font-bold text-opensea-900 mb-6">Price Prediction Timeline</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)} ETH`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
              formatter={(value: any, name: string) => [
                `${parseFloat(value).toFixed(2)} ETH`,
                name === 'price' ? 'Price' : name
              ]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2081e2" 
              strokeWidth={3}
              dot={{ fill: '#2081e2', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2081e2', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Model Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Model Predictions Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value.toFixed(0)} ETH`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px' 
                }}
              />
              <Legend />
              {modelComparison.map((model, index) => (
                <Line
                  key={model.model}
                  type="monotone"
                  dataKey="price"
                  data={model.predictions}
                  stroke={modelColors[model.model as keyof typeof modelColors] || '#64748b'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={model.model}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Model Accuracy Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="model" 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: any) => [`${parseFloat(value).toFixed(1)}%`, 'Accuracy']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px' 
                }}
              />
              <Bar 
                dataKey="accuracy" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confidence and Volume Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Prediction Confidence</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis 
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: any) => [`${parseFloat(value).toFixed(1)}%`, 'Confidence']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px' 
                }}
              />
              <Area 
                type="monotone" 
                dataKey="confidence" 
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {volumeData.length > 0 && (
          <div className="bg-white rounded-3xl neu-shadow p-8">
            <h3 className="text-xl font-bold text-opensea-900 mb-6">Trading Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: any) => [parseFloat(value).toFixed(0), 'Volume']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px' 
                  }}
                />
                <Bar 
                  dataKey="volume" 
                  fill="#06b6d4"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Price Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8b5cf6"
                dataKey="count"
                label={({ priceRange }) => priceRange}
              >
                {priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={Object.values(modelColors)[index % Object.values(modelColors).length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Model Performance Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={modelAccuracyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="model" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 8 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke="#2081e2"
                fill="#2081e2"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl neu-shadow p-8">
          <h3 className="text-xl font-bold text-opensea-900 mb-6">Price vs Confidence</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="confidence" 
                name="Confidence"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="number" 
                dataKey="price" 
                name="Price"
                stroke="#64748b"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value} ETH`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'price' ? `${parseFloat(value).toFixed(2)} ETH` : `${parseFloat(value).toFixed(1)}%`,
                  name === 'price' ? 'Price' : 'Confidence'
                ]}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px' 
                }}
              />
              <Scatter 
                name="Predictions" 
                dataKey="price" 
                fill="#8b5cf6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;