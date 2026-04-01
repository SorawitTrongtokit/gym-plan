-- วางคำสั่งนี้ในหน้า SQL Editor ของ Supabase และกด RUN
-- เป็นการสร้างตารางเก็บประวัติการออกกำลังกาย แบบไม่ต้องมีระบบ Login

-- 1. สร้างตาราง user_logs 
CREATE TABLE public.user_logs (
    id UUID PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    log_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ตั้งค่าให้อ่านและเขียนได้อย่างอิสระโดยไม่ต้องมี Auth (เพราะใช้ส่วนตัว)
ALTER TABLE public.user_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON public.user_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON public.user_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON public.user_logs 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete access for all users" 
ON public.user_logs 
FOR DELETE 
USING (true);
