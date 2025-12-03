import { useState, useEffect } from 'react';

interface Shelter {
  shelter_id: string;
  name: string;
  location: string;
  capacity: number;
  current_occupancy: number;
  contact_phone: string;
}

export const useShelterData = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        // 從 CSV 檔案讀取
        const response = await fetch('/data/shelters.csv');
        const text = await response.text();
        
        // 解析 CSV
        const lines = text.trim().split('\n').slice(1); // 跳過標題行
        const data = lines
          .filter(line => line.trim()) // 過濾空行
          .map(line => {
            const [id, name, location, capacity, occupancy, phone] = line.split(',');
            return {
              shelter_id: id?.trim() || '',
              name: name?.trim() || '',
              location: location?.trim() || '',
              capacity: parseInt(capacity) || 0,
              current_occupancy: parseInt(occupancy) || 0,
              contact_phone: phone?.trim() || ''
            };
          });
        
        setShelters(data);
        setLoading(false);
      } catch (err) {
        console.error('載入避難所資料失敗:', err);
        setError('無法載入避難所資料');
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  return { shelters, loading, error };
};

