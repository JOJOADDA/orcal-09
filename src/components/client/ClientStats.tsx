
import { Card, CardContent } from '@/components/ui/card';
import { DesignOrder } from '@/types/database';

interface ClientStatsProps {
  orders: DesignOrder[];
}

const ClientStats = ({ orders }: ClientStatsProps) => {
  const stats = [
    { 
      label: 'إجمالي الطلبات', 
      value: orders.length, 
      color: 'from-blue-500 to-cyan-500' 
    },
    { 
      label: 'قيد الانتظار', 
      value: orders.filter(o => o.status === 'pending').length, 
      color: 'from-yellow-500 to-orange-500' 
    },
    { 
      label: 'جاري التنفيذ', 
      value: orders.filter(o => o.status === 'in-progress').length, 
      color: 'from-purple-500 to-pink-500' 
    },
    { 
      label: 'مكتملة', 
      value: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length, 
      color: 'from-green-500 to-emerald-500' 
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-3 sm:p-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-2 sm:mb-3`}>
              <span className="text-lg sm:text-xl font-bold text-white">{stat.value}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">
              {stat.label}
            </h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientStats;
