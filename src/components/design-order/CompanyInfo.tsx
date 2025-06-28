
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, CheckCircle, Zap, Award } from 'lucide-react';

const CompanyInfo = () => {
  return (
    <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-0 shadow-2xl">
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="font-display text-lg sm:text-xl md:text-2xl text-gray-900 flex items-center gap-2 sm:gap-3">
          <Palette className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-red-500" />
          لماذا أوركال؟
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 md:space-y-6 p-3 sm:p-4 md:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg sm:rounded-xl">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">خبرة واسعة</h4>
              <p className="font-body text-gray-700 text-xs sm:text-sm leading-relaxed">أكثر من 20 سنة في مجال الدعاية والإعلان والإنتاج الفني</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg sm:rounded-xl">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">سرعة في التنفيذ</h4>
              <p className="font-body text-gray-700 text-xs sm:text-sm leading-relaxed">نضمن تسليم تصاميمك في الوقت المحدد دون تأخير</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg sm:rounded-xl">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-gray-900 mb-1 text-sm sm:text-base">جودة مضمونة</h4>
              <p className="font-body text-gray-700 text-xs sm:text-sm leading-relaxed">تصاميم احترافية تواكب أحدث الاتجاهات العالمية</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-purple-600 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 text-white">
          <h4 className="font-display font-bold text-sm sm:text-base md:text-lg mb-2">خدماتنا الشاملة</h4>
          <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="font-body">• تصميم الشعارات</span>
            <span className="font-body">• الهوية البصرية</span>
            <span className="font-body">• التصميم الرقمي</span>
            <span className="font-body">• المطبوعات</span>
            <span className="font-body">• السوشيال ميديا</span>
            <span className="font-body">• العروض التقديمية</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfo;
