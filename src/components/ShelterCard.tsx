import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface ShelterCardProps {
  name: string;
  location: string;
  capacity: number;
  current_occupancy: number;
  contact_phone: string;
}

export const ShelterCard = ({
  name,
  location,
  capacity,
  current_occupancy,
  contact_phone
}: ShelterCardProps) => {
  const occupancyRate = capacity > 0 ? (current_occupancy / capacity) * 100 : 0;
  const isFull = occupancyRate >= 90;
  const isAlmostFull = occupancyRate >= 70;
  
  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
          {name}
        </h3>
        {isFull ? (
          <Badge variant="destructive" className="animate-pulse">
            近滿
          </Badge>
        ) : isAlmostFull ? (
          <Badge className="bg-orange-500">接近滿</Badge>
        ) : (
          <Badge className="bg-green-500">有空位</Badge>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-3 flex items-center">
        <span className="mr-1">📍</span>
        {location}
      </p>
      
      <div className="flex justify-between text-sm mb-3 text-gray-600 dark:text-gray-400">
        <span>容量：<strong>{capacity}</strong> 人</span>
        <span>目前：<strong>{current_occupancy}</strong> 人</span>
      </div>
      
      {/* 進度條 */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ${
            isFull 
              ? 'bg-red-500' 
              : isAlmostFull 
              ? 'bg-orange-500' 
              : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(occupancyRate, 100)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span className="mr-1">📞</span>
          {contact_phone}
        </p>
        <span className="text-xs text-gray-400">
          {occupancyRate.toFixed(0)}% 已滿
        </span>
      </div>
    </Card>
  );
};

