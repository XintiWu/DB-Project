// 點擊資料分析腳本
import { getMongoDB, closeMongoDB } from './mongodb.js';
import * as analyticsService from './services/analytics.js';

async function analyzeClicks() {
  try {
    console.log('📊 開始分析點擊資料...\n');
    
    // 1. 頁面統計
    console.log('📄 頁面訪問統計：');
    const pageStats = await analyticsService.getPageStats();
    pageStats.forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat.page}: ${stat.count} 次訪問 (${stat.uniqueUsers} 個獨立用戶)`);
    });
    console.log('');

    // 2. 功能點擊統計
    console.log('🎯 功能點擊統計：');
    const featureStats = await analyticsService.getFeatureStats();
    if (featureStats.length > 0) {
      featureStats.forEach((stat, index) => {
        console.log(`  ${index + 1}. ${stat.page} - ${stat.action}: ${stat.count} 次 (${stat.uniqueUsers} 個獨立用戶)`);
      });
    } else {
      console.log('  暫無功能點擊資料');
    }
    console.log('');

    // 3. 最熱門功能
    console.log('🔥 最熱門功能 Top 20：');
    const topFeatures = await analyticsService.getTopFeatures(20);
    topFeatures.forEach((feature, index) => {
      console.log(`  ${index + 1}. ${feature.action}: ${feature.count} 次點擊 (${feature.uniqueUsers} 個獨立用戶)`);
      console.log(`     出現在頁面: ${feature.pages.join(', ')}`);
    });
    console.log('');

    // 4. 時間分析（按小時）
    console.log('⏰ 按小時的訪問分佈：');
    const hourStats = await analyticsService.getTimeAnalysis(null, null, 'hour');
    hourStats.forEach(stat => {
      const hour = String(stat.time).padStart(2, '0');
      console.log(`  ${hour}:00 - ${stat.count} 次訪問`);
      if (stat.topPages && stat.topPages.length > 0) {
        const topPage = stat.topPages[0];
        console.log(`    最熱門頁面: ${topPage.page} (${topPage.count} 次)`);
      }
    });
    console.log('');

    // 5. 時間分析（按星期）
    console.log('📅 按星期的訪問分佈：');
    const dayStats = await analyticsService.getTimeAnalysis(null, null, 'day');
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    dayStats.forEach(stat => {
      const dayName = dayNames[stat.time] || `星期${stat.time}`;
      console.log(`  ${dayName}: ${stat.count} 次訪問`);
    });
    console.log('');

    // 6. 用戶行為路徑
    console.log('🛤️  用戶行為路徑（Top 10）：');
    const userPaths = await analyticsService.getUserPaths(10);
    userPaths.forEach((path, index) => {
      console.log(`  ${index + 1}. 用戶 ${path.userId.substring(0, 20)}...`);
      console.log(`     路徑長度: ${path.pathLength} 步`);
      console.log(`     訪問頁面數: ${path.uniquePages} 個`);
      console.log(`     路徑: ${path.path.join(' → ')}`);
    });
    console.log('');

    // 7. 總體統計
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    const totalClicks = await clicksCollection.countDocuments();
    const uniqueUsers = await clicksCollection.distinct('userId');
    const uniquePages = await clicksCollection.distinct('page');
    
    console.log('📈 總體統計：');
    console.log(`  總點擊數: ${totalClicks}`);
    console.log(`  獨立用戶數: ${uniqueUsers.length}`);
    console.log(`  訪問頁面數: ${uniquePages.length}`);
    console.log('');

    console.log('✅ 分析完成！');
    
  } catch (error) {
    console.error('❌ 分析時發生錯誤:', error);
  } finally {
    await closeMongoDB();
  }
}

analyzeClicks();

