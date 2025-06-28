const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // التحقق من صحة الاسم
  if (!formData.name || formData.name.trim().length < 2) {
    alert('يرجى إدخال اسم صحيح لا يقل عن حرفين');
    return;
  }

  // التحقق من رقم الهاتف السوداني
  if (!/^09\d{8}$/.test(formData.phone)) {
    alert('يرجى إدخال رقم هاتف سوداني صحيح يبدأ بـ 09 ويتكون من 10 أرقام');
    return;
  }

  // التحقق من نوع التصميم
  if (!formData.designType) {
    alert('يرجى اختيار نوع التصميم المطلوب');
    return;
  }

  // التحقق من الوصف
  if (!formData.description || formData.description.trim().length < 10) {
    alert('يرجى كتابة تفاصيل كافية للتصميم (10 أحرف على الأقل)');
    return;
  }

  // تنسيق الرسالة
  const message = `
🎨 *طلب تصميم جديد من أوركال*

👤 *الاسم:* ${formData.name}
📱 *رقم الهاتف:* ${formData.phone}
🎨 *نوع التصميم:* ${formData.designType}
📝 *تفاصيل التصميم:* ${formData.description}

*شركة أوركال للدعاية والإعلان*
نحن في انتظار خدمتكم! 🌟
  `.trim();

  const phoneNumber = '+249112596876';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  // فتح واتساب في نافذة جديدة
  window.open(whatsappUrl, '_blank');

  // إعادة تعيين البيانات
  setFormData({ name: '', phone: '', designType: '', description: '' });

  // عرض رسالة نجاح وتوجيه بعد ثانيتين
  alert('✅ تم إرسال طلبك بنجاح! سيتم تحويلك إلى صفحة الشكر.');
  setTimeout(() => {
    window.location.href = '/thanks'; // عدّل هذا الرابط إذا كنت تستخدم صفحة شكر مختلفة
  }, 2000);
};
