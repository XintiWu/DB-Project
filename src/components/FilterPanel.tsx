import { useState } from 'react'
import type { FilterOptions } from '../lib/types'
import { MATERIAL_CATEGORIES, RESCUE_CATEGORIES, REGIONS, SEVERITY_INFO, STATUS_INFO } from '../lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select } from './ui/select'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface FilterPanelProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  const handleChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      needType: 'all',
      region: 'all',
      category: 'all',
      severity: 'all',
      status: 'all',
      searchKeyword: ''
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  // 根據需求類型篩選類別
  const availableCategories = localFilters.needType === 'material' 
    ? Object.values(MATERIAL_CATEGORIES)
    : localFilters.needType === 'rescue'
    ? Object.values(RESCUE_CATEGORIES)
    : [...Object.values(MATERIAL_CATEGORIES), ...Object.values(RESCUE_CATEGORIES)]

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg dark:text-slate-100">篩選條件</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜尋 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">關鍵字搜尋</label>
          <Input
            placeholder="搜尋需求標題、地點或說明..."
            value={localFilters.searchKeyword}
            onChange={(e) => handleChange('searchKeyword', e.target.value)}
          />
        </div>

        {/* 需求類型 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">需求類型</label>
          <Select
            value={localFilters.needType}
            onChange={(e) => handleChange('needType', e.target.value)}
          >
            <option value="all">全部類型</option>
            <option value="material">📦 物資需求</option>
            <option value="rescue">🚨 救災需求</option>
          </Select>
        </div>

        {/* 地區 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">地區</label>
          <Select
            value={localFilters.region}
            onChange={(e) => handleChange('region', e.target.value)}
          >
            <option value="all">全部地區</option>
            {REGIONS.filter(r => r !== '全部').map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </Select>
        </div>

        {/* 類別 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">類別</label>
          <Select
            value={localFilters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="all">全部類別</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </Select>
        </div>

        {/* 緊急程度 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">緊急程度</label>
          <Select
            value={localFilters.severity}
            onChange={(e) => handleChange('severity', e.target.value)}
          >
            <option value="all">全部程度</option>
            {Object.entries(SEVERITY_INFO).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </Select>
        </div>

        {/* 狀態 */}
        <div>
          <label className="text-sm font-medium mb-2 block dark:text-slate-200">需求狀態</label>
          <Select
            value={localFilters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="all">全部狀態</option>
            {Object.entries(STATUS_INFO).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </Select>
        </div>

        {/* 重置按鈕 */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleReset}
        >
          重置篩選
        </Button>
      </CardContent>
    </Card>
  )
}


