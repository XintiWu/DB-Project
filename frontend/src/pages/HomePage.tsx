import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Shield, Truck } from 'lucide-react'

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
          連結愛心，<span className="text-blue-600">即時救援</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          我們致力於建立一個透明、高效的災害救援物資媒合平台，讓每一份愛心都能準確送達需要的地方。
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            我要認領需求
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/publish"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-colors"
          >
            發布救援需求
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={Truck}
          title="物資媒合"
          description="即時更新各地災區物資需求，讓資源分配更有效率。"
        />
        <FeatureCard
          icon={Shield}
          title="救援人力"
          description="整合專業救援團隊與志工人力，提供最及時的協助。"
        />
        <FeatureCard
          icon={Heart}
          title="愛心傳遞"
          description="透明化的認領流程，確保您的愛心確實送達災區。"
        />
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
