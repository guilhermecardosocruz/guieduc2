'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EditableStudentList, { Student } from "@/components/EditableStudentList";
import AddStudentModal from "@/components/AddStudentModal";

type Attendance = { studentId: string; present: boolean };
type CallRecord = {
  id: string; classId: string; title: string; content?: string; createdAt: string; attendance: Attendance[];
};

function lsKeyStudents(classId: string) { return `guieduc:class:${classId}:students`; }
function lsKeyCalls(classId: string) { return `guieduc:class:${classId}:calls`; }

export default function CallEditPage({ params }: { params: Promise<{ id: string; callId: string }> }) {
  const [classId, setClassId] = useState("");
  const [callId, setCallId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id, callId } = await params; setClassId(id); setCallId(callId);
      const ss: Student[] = JSON.parse(localStorage.getItem(lsKeyStudents(id)) || "[]");
      setStudents(ss);
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(id)) || "[]");
      const cur = calls.find(c => c.id === callId);
      if (cur) {
        setTitle(cur.title || ""); setContent(cur.content || "");
        const map: Record<string, boolean> = {}; ss.forEach(s => { map[s.id] = !!cur.attendance.find(a => a.studentId===s.id)?.present; });
        setPresentMap(map);
      } else {
        window.location.href = `/classes/${id}/chamadas`;
      }
    })();
  }, [params]);

  const ordered = useMemo(() => [...students].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")), [students]);

  function saveCall() {
    if (!title.trim()) { alert("Informe o nome da aula."); return; }
    setSaving(true);
    try {
      const calls: CallRecord[] = JSON.parse(localStorage.getItem(lsKeyCalls(classId)) || "[]");
      const idx = calls.findIndex(c => c.id === callId);
      const next: CallRecord = {
        id: callId, classId, title: title.trim(), content: content.trim() || undefined,
        createdAt: calls[idx]?.createdAt || new Date().toISOString(),
        attendance: ordered.map(s => ({ studentId: s.id, present: !!presentMap[s.id] })),
      };
      if (idx >= 0) calls.splice(idx, 1, next); else calls.unshift(next);
      localStorage.setItem(lsKeyCalls(classId), JSON.stringify(calls));
      alert("Chamada atualizada!");
      window.location.href = `/classes/${classId}/chamadas`;
    } finally { setSaving(false); }
  }


  async function deleteCall() {
    if (!confirm("Tem certeza que deseja excluir esta chamada? Essa ação não pode ser desfeita.")) return;
    try {
      // tenta excluir no servidor
      await fetch(`/api/classes/${classId}/chamadas/${callId}`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});

      // remove do localStorage (fallback/offline)
      try {
        const key = (id: string) => `guieduc:class:${id}:calls`;
        const calls: any[] = JSON.parse(localStorage.getItem(key(classId)) || "[]");
        const next = calls.filter(c => c.id !== callId);
        localStorage.setItem(key(classId), JSON.stringify(next));
      } catch {}

      // volta para a lista
      window.location.href = `/classes/${classId}/chamadas`;
    } catch {
      alert("Não foi possível excluir agora. Tente novamente.");
    }
  }


  async function addStudent() {
    // 1) coleta dados (Nome obrigatório; CPF/Contato opcionais)
    const name = prompt("Nome do aluno(a): (obrigatório)")?.trim();
    if (!name) return;
    const cpf = prompt("CPF (opcional):")?.trim() || undefined;
    const contact = prompt("Contato (telefone/email) (opcional):")?.trim() || undefined;

    // 2) cria aluno temporário (offline-first)
    const tempId = crypto.randomUUID();
    const newStudent = { id: tempId, name, cpf, contact };

    // atualiza estado
    const nextStudents = [...students, newStudent];
    setStudents(nextStudents);

    // localStorage dos alunos da turma
    try {
      const keyStudents = (id: string) => `guieduc:class:${id}:students`;
      localStorage.setItem(keyStudents(classId), JSON.stringify(nextStudents));
    } catch {}

    // marca presente por padrão na chamada atual
    setPresentMap(prev => ({ ...prev, [tempId]: true }));

    // 3) tenta salvar no servidor (se a rota existir)
    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, cpf, contact }),
      });
      if (res.ok) {
        const created = await res.json(); // deve conter created.id
        if (created?.id && created.id !== tempId) {
          // substitui id temporário pelo definitivo no estado/local
          setStudents(cur => cur.map(s => s.id === tempId ? { ...s, id: created.id } : s));
          try {
            const keyStudents = (id: string) => `guieduc:class:${id}:students`;
            const saved: any[] = JSON.parse(localStorage.getItem(keyStudents(classId)) || "[]");
            const updated = saved.map((s: any) => s.id === tempId ? { ...s, id: created.id } : s);
            localStorage.setItem(keyStudents(classId), JSON.stringify(updated));
          } catch {}
          // ajusta presentMap para nova chave
          setPresentMap(prev => {
            const { [tempId]: tmp, ...rest } = prev;
            return { ...rest, [created.id]: tmp ?? true };
          });
        }
      }
    } catch {
      // se offline/erro, mantemos só local; tudo bem
    }
  }


  // Modal: adicionar aluno
  
