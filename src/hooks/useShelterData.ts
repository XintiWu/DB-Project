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
        // CSV 格式: shelter_id,name,address,phone,capacity,type,latitude,longitude
        const lines = text.trim().split('\n').slice(1); // 跳過標題行
        const data = lines
          .filter(line => line.trim()) // 過濾空行
          .map(line => {
            const [id, name, address, phone, capacity, type] = line.split(',');
            const cap = parseInt(capacity) || 0;
            // 生成合理的模擬入住人數（50%-90% 的容量）
            const occupancy = Math.floor(cap * (0.5 + Math.random() * 0.4));
            
            return {
              shelter_id: id?.trim() || '',
              name: name?.trim() || '',
              location: address?.trim() || '',
              capacity: cap,
              current_occupancy: occupancy,
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

