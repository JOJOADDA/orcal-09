import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStatusProps {
  onClose?: () => void;
}

const SystemStatus = ({ onClose }: SystemStatusProps) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      // فحص الاتصال بـ Supabase
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      // فحص قاعدة البيانات
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(5);
        
      const { data: designersData, error: designersError } = await supabase
        .from('designers')
        .select('id')
        .limit(5);

      // فحص المصادقة
      const authStatus = !authError ? 'متصل' : 'خطأ في الاتصال';
      const dbStatus = !profilesError ? 'متصل' : 'خطأ في قاعدة البيانات';
      const designersStatus = !designersError ? 'متصل' : 'خطأ في جدول المصممين';

      setStatus({
        auth: {
          status: authStatus,
          error: authError?.message,
          data: authData
        },
        database: {
          status: dbStatus,
          error: profilesError?.message,
          profilesCount: profilesData?.length || 0
        },
        designers: {
          status: designersStatus,
          error: designersError?.message,
          designersCount: designersData?.length || 0
        },
        timestamp: new Date().toLocaleString('ar-EG')
      });
    } catch (error: any) {
      setStatus({
        error: error.message,
        timestamp: new Date().toLocaleString('ar-EG')
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes('متصل')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status.includes('خطأ')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('متصل')) return <Badge variant="default" className="bg-green-500">متصل</Badge>;
    if (status.includes('خطأ')) return <Badge variant="destructive">خطأ</Badge>;
    return <Badge variant="secondary">غير معروف</Badge>;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          حالة النظام
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="mr-auto">
              ×
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={checkSystemStatus} 
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              جاري الفحص...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              فحص حالة النظام
            </>
          )}
        </Button>

        {status && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              آخر فحص: {status.timestamp}
            </div>
            
            {status.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  خطأ عام
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {status.error}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.auth.status)}
                    <span className="text-sm">المصادقة</span>
                  </div>
                  {getStatusBadge(status.auth.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.database.status)}
                    <span className="text-sm">قاعدة البيانات</span>
                  </div>
                  {getStatusBadge(status.database.status)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.designers.status)}
                    <span className="text-sm">نظام المصممين</span>
                  </div>
                  {getStatusBadge(status.designers.status)}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>عدد العملاء: {status.database.profilesCount}</div>
                  <div>عدد المصممين: {status.designers.designersCount}</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>• إذا كان هناك خطأ في تسجيل الدخول، تأكد من إيقاف "تأكيد البريد الإلكتروني" في إعدادات Supabase</div>
          <div>• يمكن الوصول لإعدادات Supabase من: Authentication → Settings → Email Auth</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;