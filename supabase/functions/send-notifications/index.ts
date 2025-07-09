import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'deadline';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  related_order_id?: string;
  related_task_id?: string;
  action_url?: string;
  send_email?: boolean;
  send_push?: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // إنشاء عميل Supabase باستخدام service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: requestData }: { data: NotificationRequest } = await req.json();
    logStep("Request data received", { userId: requestData.user_id, type: requestData.type });

    // التحقق من صحة البيانات
    if (!requestData.user_id || !requestData.title || !requestData.message) {
      throw new Error('Missing required fields: user_id, title, message');
    }

    // الحصول على إعدادات الإشعارات للمستخدم
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('notification_settings')
      .select('*')
      .eq('user_id', requestData.user_id)
      .maybeSingle();

    if (settingsError) {
      logStep("Error fetching notification settings", settingsError);
    }

    // التحقق من إعدادات النوع
    if (settings && !settings.notification_types[requestData.type]) {
      logStep("User has disabled this notification type", { type: requestData.type });
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notification type disabled by user' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // التحقق من ساعات الهدوء
    let scheduledFor = null;
    if (settings && settings.quiet_hours_start && settings.quiet_hours_end) {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5);
      
      if (currentTime >= settings.quiet_hours_start && currentTime <= settings.quiet_hours_end) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hours, minutes] = settings.quiet_hours_end.split(':');
        tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        scheduledFor = tomorrow.toISOString();
        logStep("Scheduled notification for after quiet hours", { scheduledFor });
      }
    }

    // إدراج الإشعار في قاعدة البيانات
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: requestData.user_id,
        title: requestData.title,
        message: requestData.message,
        type: requestData.type,
        priority: requestData.priority || 'normal',
        related_order_id: requestData.related_order_id,
        related_task_id: requestData.related_task_id,
        action_url: requestData.action_url,
        scheduled_for: scheduledFor,
        sent_at: scheduledFor ? null : new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      logStep("Error inserting notification", insertError);
      throw new Error(`Failed to create notification: ${insertError.message}`);
    }

    logStep("Notification created successfully", { notificationId: notification.id });

    // إرسال إشعار فوري إذا لم يكن مؤجل
    if (!scheduledFor) {
      // إرسال إشعار real-time
      try {
        const channel = supabaseAdmin.channel(`notifications_${requestData.user_id}`);
        await channel.send({
          type: 'broadcast',
          event: 'new_notification',
          payload: notification
        });
        logStep("Real-time notification sent");
      } catch (realtimeError) {
        logStep("Error sending real-time notification", realtimeError);
      }

      // إرسال إشعار بالبريد الإلكتروني إذا كان مفعل
      if (settings?.email_notifications && requestData.send_email !== false) {
        try {
          // هنا يمكن إضافة تكامل مع خدمة البريد الإلكتروني
          logStep("Email notification would be sent");
        } catch (emailError) {
          logStep("Error sending email notification", emailError);
        }
      }

      // إرسال إشعار push إذا كان مفعل
      if (settings?.push_notifications && requestData.send_push !== false) {
        try {
          // هنا يمكن إضافة تكامل مع خدمة push notifications
          logStep("Push notification would be sent");
        } catch (pushError) {
          logStep("Error sending push notification", pushError);
        }
      }
    }

    logStep("Notification processing completed successfully");

    return new Response(JSON.stringify({
      success: true,
      notification_id: notification.id,
      scheduled: !!scheduledFor
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-notifications", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});