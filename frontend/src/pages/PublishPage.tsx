import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { createRequest, getAllItems, getAllSkillTags } from '../api/client'
import { AlertTriangle, Plus, Trash2 } from 'lucide-react'

export function PublishPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Incident Context
  const incidentState = location.state as { incidentId?: string, incidentTitle?: string } | null
  const incidentId = incidentState?.incidentId
  const incidentTitle = incidentState?.incidentTitle

  // Data State
  const [availableItems, setAvailableItems] = useState<any[]>([])
  const [availableSkills, setAvailableSkills] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Form State
  const [type, setType] = useState<'Material' | 'Tool' | 'Humanpower'>('Material')
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [urgency, setUrgency] = useState(3) // 1-5
  
  // Dynamic Items/Skills
  const [selectedItems, setSelectedItems] = useState<{item_id: number, qty: number}[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{skill_tag_id: number, qty: number}[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [items, skills] = await Promise.all([getAllItems(), getAllSkillTags()])
        setAvailableItems(items)
        setAvailableSkills(skills)
      } catch (err) {
        console.error('Failed to fetch form data:', err)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { item_id: availableItems[0]?.item_id || 0, qty: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems]
    newItems.splice(index, 1)
    setSelectedItems(newItems)
  }

  const handleUpdateItem = (index: number, field: 'item_id' | 'qty', value: number) => {
    const newItems = [...selectedItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setSelectedItems(newItems)
  }

  const handleAddSkill = () => {
    setSelectedSkills([...selectedSkills, { skill_tag_id: availableSkills[0]?.skill_tag_id || 0, qty: 1 }])
  }

  const handleRemoveSkill = (index: number) => {
    const newSkills = [...selectedSkills]
    newSkills.splice(index, 1)
    setSelectedSkills(newSkills)
  }

  const handleUpdateSkill = (index: number, field: 'skill_tag_id' | 'qty', value: number) => {
    const newSkills = [...selectedSkills]
    newSkills[index] = { ...newSkills[index], [field]: value }
    setSelectedSkills(newSkills)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Construct payload based on schema
      const payload: any = {
        requester_id: 1, // Mock user ID for now
        incident_id: incidentId ? parseInt(incidentId) : 1, // Default to incident 1 if not provided (should ideally block or select)
        status: 'Not Completed',
        urgency,
        type,
        address,
        latitude: 25.0330, // Mock lat
        longitude: 121.5654, // Mock long
        title
      }

      if (type === 'Material') {
        payload.items = selectedItems
      } else if (type === 'Tool') {
        // Backend expects 'equipments' for Tool type in createRequest logic?
        // Let's check backend/services/requests.js again.
        // It says: if (type === 'Humanpower' || type === 'rescue' || type === 'manpower' || type === 'Tool' || type === 'tool')
        // And then checks for 'equipments'.
        // Wait, for Tool, it should be equipments.
        // But wait, 'equipments' array expects { required_equipment, qty }.
        // required_equipment is item_id.
        payload.equipments = selectedItems.map(i => ({ required_equipment: i.item_id, qty: i.qty }))
      } else if (type === 'Humanpower') {
        payload.skills = selectedSkills
      }

      await createRequest(payload)
      alert('需求發布成功！')
      navigate('/')
    } catch (err) {
      console.error('Publish failed:', err)
      alert('發布失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingData) return <div className="text-center py-12">載入資料中...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">發布需求</h1>
        <p className="text-muted-foreground mt-2">
          請填寫需求詳細資訊。
        </p>
        
        {incidentId && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">連結至災情：{incidentTitle}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">需求類型</label>
              <div className="flex gap-4">
                {['Material', 'Tool', 'Humanpower'].map((t) => (
                  <label key={t} className={`flex-1 border p-3 rounded-lg cursor-pointer text-center transition-colors ${type === t ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="type"
                      checked={type === t}
                      onChange={() => {
                        setType(t as any)
                        setSelectedItems([])
                        setSelectedSkills([])
                      }}
                      className="sr-only"
                    />
                    <span className="font-medium">
                      {t === 'Material' ? '物資' : t === 'Tool' ? '工具/設備' : '人力'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">標題</label>
              <Input
                placeholder="例如：急需礦泉水"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-sm font-medium mb-2 block">地點</label>
              <Input
                placeholder="請輸入詳細地址"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="text-sm font-medium mb-2 block">緊急程度 (1-5)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={urgency}
                  onChange={(e) => setUrgency(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="font-bold text-lg w-8 text-center">{urgency}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>低</span>
                <span>高</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>需求明細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === 'Humanpower' ? (
              <div className="space-y-4">
                {selectedSkills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs mb-1 block">技能</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={skill.skill_tag_id}
                        onChange={(e) => handleUpdateSkill(index, 'skill_tag_id', parseInt(e.target.value))}
                      >
                        {availableSkills.map(s => (
                          <option key={s.skill_tag_id} value={s.skill_tag_id}>
                            {s.skill_tag_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-xs mb-1 block">人數</label>
                      <Input
                        type="number"
                        min="1"
                        value={skill.qty}
                        onChange={(e) => handleUpdateSkill(index, 'qty', parseInt(e.target.value))}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSkill(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddSkill} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> 新增技能需求
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs mb-1 block">項目</label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={item.item_id}
                        onChange={(e) => handleUpdateItem(index, 'item_id', parseInt(e.target.value))}
                      >
                        {availableItems
                          .filter(i => type === 'Tool' ? i.is_tool : !i.is_tool)
                          .map(i => (
                          <option key={i.item_id} value={i.item_id}>
                            {i.item_name} ({i.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-xs mb-1 block">數量</label>
                      <Input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(index, 'qty', parseInt(e.target.value))}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> 新增項目
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
            取消
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" size="lg" disabled={isSubmitting}>
            {isSubmitting ? '處理中...' : '確認發布'}
          </Button>
        </div>
      </form>
    </div>
  )
}
