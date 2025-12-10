import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MOCK_DATA = {
  BTC: [
    { name: 'Jan', value: 42000 }, { name: 'Feb', value: 45000 }, { name: 'Mar', value: 38000 },
    { name: 'Apr', value: 43000 }, { name: 'May', value: 35000 }, { name: 'Jun', value: 39000 },
  ],
  ETH: [
    { name: 'Jan', value: 3000 }, { name: 'Feb', value: 3200 }, { name: 'Mar', value: 2800 },
    { name: 'Apr', value: 3500 }, { name: 'May', value: 2500 }, { name: 'Jun', value: 2900 },
  ],
  AAPL: [
    { name: 'Jan', value: 170 }, { name: 'Feb', value: 165 }, { name: 'Mar', value: 175 },
    { name: 'Apr', value: 160 }, { name: 'May', value: 180 }, { name: 'Jun', value: 190 },
  ],
};

type Asset = keyof typeof MOCK_DATA;

export const InvestmentWidget: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<Asset>('BTC');

  const { data, profitLoss, isProfit } = useMemo(() => {
    const assetData = MOCK_DATA[selectedAsset];
    const start = assetData[0].value;
    const end = assetData[assetData.length - 1].value;
    const diff = end - start;
    const percentage = ((diff / start) * 100).toFixed(2);
    return {
      data: assetData,
      profitLoss: `${diff >= 0 ? '+' : ''}${percentage}%`,
      isProfit: diff >= 0,
    };
  }, [selectedAsset]);
  
  const profitColor = isProfit ? '#a3e635' : '#f472b6';

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <select 
            value={selectedAsset} 
            onChange={e => setSelectedAsset(e.target.value as Asset)}
            className="bg-slate-800/50 border border-[var(--theme-primary)]/50 rounded px-2 py-1 text-sm outline-none"
        >
          {Object.keys(MOCK_DATA).map(asset => <option key={asset} value={asset}>{asset}</option>)}
        </select>
        <div className={`text-lg font-bold ${isProfit ? 'text-green-400' : 'text-pink-500'}`}>
          {profitLoss}
        </div>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={profitColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={profitColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-primary)" strokeOpacity={0.2} />
            <XAxis dataKey="name" stroke="var(--theme-primary)" fontSize={12} />
            <YAxis stroke="var(--theme-primary)" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(14, 116, 144, 0.8)', 
                borderColor: 'var(--theme-primary)',
                color: '#e0f2fe'
              }}
            />
            <Area type="monotone" dataKey="value" stroke={profitColor} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};