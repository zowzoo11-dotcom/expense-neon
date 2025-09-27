import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart as RPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet2, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, Calendar, Search, Home, BarChart2, Settings, Plus, X, AlertTriangle, Palette } from "lucide-react";

const ACCENTS = [
  { name: "Mint", primary: "#00FFC6" },
  { name: "Electric", primary: "#3B82F6" },
  { name: "Solar", primary: "#FF6B35" },
  { name: "Pink", primary: "#FF2D95" },
];
const BASE = { income: "#22C55E", expense: "#EF4444" };
const CATEGORY_ICON = { Food: "🍔", Bills: "💡", Transit: "🚌", Shopping: "🧾" };

const INITIAL = [
  { id: "t1", date: "2025-09-27", title: "Paynext", amount: -28.79, category: "Bills" },
  { id: "t2", date: "2025-09-27", title: "โอนให้พี่ส้มยิ้ม", amount: -1000, category: "Shopping" },
  { id: "t3", date: "2025-09-26", title: "ค่าไฟ ก.ย.", amount: -422.52, category: "Bills" },
  { id: "t4", date: "2025-09-26", title: "รถไปทำงาน", amount: -68, category: "Transit" },
  { id: "t5", date: "2025-09-26", title: "โบนัสพิเศษ", amount: 3500, category: "Shopping" },
  { id: "t6", date: "2025-09-25", title: "ข้าวมันไก่", amount: -55, category: "Food" },
];

function formatTHB(n) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 2 });
}
function groupByDate(items) {
  const map = {};
  for (const t of items) { (map[t.date] ||= []).push(t); }
  return Object.entries(map).sort(([a],[b]) => a<b?1:-1);
}

export default function App() {
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [items, setItems] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState(5000);
  const [tab, setTab] = useState("this");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: "expense", title: "", amount: 0, category: "Food", date: new Date().toISOString().slice(0,10), note: "" });

  useEffect(()=>{ if("serviceWorker" in navigator){ navigator.serviceWorker.register("/service-worker.js").catch(()=>{});} },[]);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return items;
    return items.filter(t => [t.title,t.category,t.date,t.note].join(" ").toLowerCase().includes(q));
  },[query,items]);

  const startingBalance = 11181.02;
  const balance = useMemo(()=> filtered.reduce((s,t)=> s+t.amount, startingBalance), [filtered]);
  const income = useMemo(()=> filtered.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0), [filtered]);
  const expense = useMemo(()=> filtered.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0), [filtered]);

  const pieData = useMemo(()=>{
    const byCat = {};
    for (const t of filtered) if (t.amount<0) byCat[t.category]=(byCat[t.category]||0)+Math.abs(t.amount);
    return Object.entries(byCat).map(([name,value])=>({name,value}));
  },[filtered]);

  const usedPct = Math.min(100, Math.round((expense / Math.max(1,budget)) * 100));
  const warn = usedPct>=80 && usedPct<100; const over = usedPct>=100;

  function submitAdd(){
    if(!form.title || !form.date || !form.category) return;
    const amt = Number(form.amount||0);
    const value = form.type==="expense" ? -Math.abs(amt) : Math.abs(amt);
    setItems(s => [{ id:`id_${Date.now()}`, title: form.title, date: form.date, category: form.category, note: form.note, amount: value }, ...s]);
    setShowAdd(false);
    setForm({ type: "expense", title:"", amount:0, category:"Food", date:new Date().toISOString().slice(0,10), note:"" });
  }

  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 px-3 pb-24">
      <div className="sticky top-0 z-30 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto max-w-md py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-neutral-900 grid place-items-center ring-1 ring-neutral-800">💼</div>
              <div>
                <p className="text-xs text-neutral-400">ยอดคงเหลือ</p>
                <motion.h1 key={balance} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-2xl font-semibold tracking-tight" style={{textShadow:`0 0 12px ${accent.primary}33`}}>
                  {formatTHB(balance)}
                </motion.h1>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-900">เงินสด</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">📈 รายรับ</span>
              <span style={{color:BASE.income}} className="font-medium">{formatTHB(income)}</span>
            </div>
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">📉 รายจ่าย</span>
              <span style={{color:BASE.expense}} className="font-medium">{formatTHB(expense)}</span>
            </div>
          </div>

          <div className={`mt-3 rounded-2xl border p-3 ${over?"border-red-600/60 bg-red-950/30":warn?"border-yellow-500/60 bg-yellow-950/30":"border-neutral-800 bg-neutral-900/60"}`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">{over?"⚠️":warn?"⚠️":"📊"} งบเดือนนี้: {formatTHB(budget)} | ใช้ไป {formatTHB(expense)}</div>
              <span className="text-xs text-neutral-400">{usedPct}%</span>
            </div>
            <div className="mt-2 h-2 rounded bg-neutral-800 overflow-hidden">
              <div className="h-full" style={{width:`${usedPct}%`, background:accent.primary}}/>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="grid grid-cols-3 w-full rounded-xl overflow-hidden border border-neutral-800">
              {["last","this","plan"].map(v=>(
                <button key={v} onClick={()=>setTab(v)} className={`py-2 text-sm ${tab===v?"bg-neutral-800":"bg-neutral-900"}`}>
                  {v==="last"?"เดือนที่แล้ว":v==="this"?"เดือนนี้":"การวางแผน"}
                </button>
              ))}
            </div>
          </div>

          {tab==="plan" && (
            <div className="mt-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-3">
              <div className="text-sm mb-2 flex items-center gap-2">⚙️ ตั้งค่างบประมาณ & ธีม</div>
              <div className="flex items-center gap-2">
                <input type="number" className="bg-neutral-900 border border-neutral-800 rounded-md p-2 w-40" value={budget} onChange={(e)=>setBudget(Number(e.target.value||0))}/>
                <span className="text-xs text-neutral-400">THB/เดือน</span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {ACCENTS.map(a=>(
                  <button key={a.name} onClick={()=>setAccent(a)} title={a.name} className={`rounded-xl p-3 border ${accent.name===a.name?"border-white":"border-neutral-800"}`} style={{background:"#0a0a0a", boxShadow:`inset 0 0 24px ${a.primary}33`}}>
                    <span className="text-[11px] flex items-center justify-center gap-1 text-neutral-300">🎨 {a.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-neutral-500">🔎</span>
              <input className="w-full pl-8 bg-neutral-900 border border-neutral-800 rounded-md p-2 placeholder:text-neutral-500" placeholder="ค้นหา หัวข้อ/หมวด/วันที่" value={query} onChange={(e)=>setQuery(e.target.value)}/>
            </div>
            <button className="h-10 w-10 grid place-items-center rounded-lg bg-neutral-900 border border-neutral-800"><Calendar className="h-5 w-5"/></button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md">
        <div className="mt-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
          <div className="p-3 pb-1 text-sm text-neutral-300 flex items-center gap-2"><PieChart className="h-4 w-4"/> สรุปรายจ่ายตามหมวด</div>
          <div className="p-3 pt-0 h-40">
            {pieData.length===0 ? <p className="text-sm text-neutral-400">ยังไม่มีข้อมูลรายจ่าย</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
                    {pieData.map((_,i)=><Cell key={i} fill={`hsl(${(i*83)%360} 100% 60%)`} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid #27272a", color: "#e5e7eb" }}/>
                </RPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-4">
          {grouped.map(([date,list])=>(
            <div key={date} className="mb-4">
              <div className="sticky top-[170px] -mx-3 px-3 py-1 bg-neutral-950/85 backdrop-blur text-xs text-neutral-500">{new Date(date).toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"})}</div>
              <div className="space-y-2">
                {list.map(t=>(
                  <motion.div key={t.id} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.25}} className="rounded-2xl bg-neutral-900/70 border border-neutral-800 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl grid place-items-center" style={{background:"#0a0a0a", boxShadow:`0 0 0 1px #27272a, inset 0 0 24px ${accent.primary}22`}}>{CATEGORY_ICON[t.category]}</div>
                        <div>
                          <div className="font-medium leading-5">{t.title}</div>
                          <div className="text-xs text-neutral-500">{t.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tracking-tight" style={{color:t.amount<0?BASE.expense:BASE.income}}>
                          {t.amount<0?"-":"+"}{formatTHB(Math.abs(t.amount))}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center justify-end gap-1">
                          {t.amount<0?<ArrowDownRight className="h-3 w-3"/>:<ArrowUpRight className="h-3 w-3"/>}
                          {t.amount<0?"expense":"income"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-5 items-center py-2">
            <NavItem icon={<Home className="h-5 w-5"/>} label="ภาพรวม" active />
            <NavItem icon={<Wallet2 className="h-5 w-5"/>} label="ธุรกรรม" />
            <div className="flex items-center justify-center">
              <button onClick={()=>setShowAdd(true)} className="h-14 w-14 -mt-9 rounded-2xl grid place-items-center text-neutral-900 font-semibold" style={{background:accent.primary, boxShadow:`0 8px 24px ${accent.primary}55, 0 0 0 4px #0a0a0a`}}>
                <Plus className="h-7 w-7"/>
              </button>
            </div>
            <NavItem icon={<BarChart2 className="h-5 w-5"/>} label="งบประมาณ" />
            <NavItem icon={<Settings className="h-5 w-5"/>} label="ผู้ใช้" />
          </div>
        </div>
      </nav>

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between p-3 border-b border-neutral-800">
              <div className="text-sm flex items-center gap-2">เพิ่มรายการ</div>
              <button onClick={()=>setShowAdd(false)} className="p-1 rounded-lg hover:bg-neutral-900"><X className="h-4 w-4"/></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">ประเภท</label>
                  <select value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm">
                    <option value="expense">รายจ่าย</option>
                    <option value="income">รายรับ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">วันที่</label>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm"/>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400">หัวข้อ</label>
                <input value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm" placeholder="เช่น ข้าวมันไก่ / เงินเดือน"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400">จำนวนเงิน</label>
                  <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm"/>
                </div>
                <div>
                  <label className="text-xs text-neutral-400">หมวดหมู่</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f, category:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm">
                    {Object.keys(CATEGORY_ICON).map(k=> <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400">หมายเหตุ</label>
                <input value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-2 text-sm"/>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button onClick={()=>setShowAdd(false)} className="px-3 py-2 rounded-md border border-neutral-700">ยกเลิก</button>
                <button onClick={submitAdd} className="px-3 py-2 rounded-md text-neutral-900" style={{background:accent.primary}}>บันทึก</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <button className="flex flex-col items-center gap-1 text-[11px] w-full">
      <div className="h-9 w-9 grid place-items-center rounded-xl border" style={{ borderColor: active?ACCENTS[0].primary:"#27272a", boxShadow: active?`0 0 18px ${ACCENTS[0].primary}33`:undefined }}>
        <div className={active?"text-neutral-900":"text-neutral-300"}>{icon}</div>
      </div>
      <span className={active?"text-[11px]":"text-[11px] text-neutral-400"}>{label}</span>
    </button>
  );
}